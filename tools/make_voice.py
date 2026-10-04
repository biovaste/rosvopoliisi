#!/usr/bin/env python3
"""Generates the Finnish voice clips with a text-to-speech service.

Reads voice/lines.json (what is said, by which speaker class) and
voice/cast.json (the voice slots and each engine's voice for them).

Raw clips are cached in voice-src/<engine>/<slot>/<key>-<n>.<ext> and only
generated when missing, so re-runs are cheap. The full run then encodes the
clips of each slot's chosen engine into small game-ready MP3 files in
src/assets/voice/<slot>/<key>-<n>.mp3 (trimmed, loudness-normalised, mono).
The game finds them by file name; slots or lines without clips stay silent.

Usage:
  python3 tools/make_voice.py --engine google --sample   # a few lines per slot + voice-src/compare.html
  python3 tools/make_voice.py --engine elevenlabs        # every line, then encode
  python3 tools/make_voice.py                            # every line with each slot's engine from cast.json
  python3 tools/make_voice.py --build                    # only re-encode cached clips

Options: --only catch,sorry (line keys)  --slots officer-f,kid1  --force (regenerate)

Engines:
  elevenlabs  ElevenLabs v3. Needs ELEVENLABS_API_KEY and voice ids in cast.json.
  google      Google Cloud TTS, fi-FI Chirp 3 HD voices. Needs GOOGLE_API_KEY, or a
              logged-in gcloud (uses `gcloud auth print-access-token`).
  chatterbox  Chatterbox Multilingual, runs locally (pip install chatterbox-tts).
              Clones the voice in voice/refs/<slot>.wav.
  test        Beeps instead of speech, for checking the pipeline without keys.

Needs ffmpeg on PATH. No Python packages are needed except for chatterbox.
"""

import argparse
import base64
import html
import json
import os
import shutil
import subprocess
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LINES = os.path.join(ROOT, 'voice', 'lines.json')
CAST = os.path.join(ROOT, 'voice', 'cast.json')
REFS = os.path.join(ROOT, 'voice', 'refs')
CACHE = os.path.join(ROOT, 'voice-src')
OUT = os.path.join(ROOT, 'src', 'assets', 'voice')
ENGINES = ('elevenlabs', 'google', 'chatterbox', 'test')
# Engines that give the same audio for the same text: extra takes would be copies.
DETERMINISTIC = {'google'}


def post_json(url, body, headers):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', **headers})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        raise SystemExit(f'{url} -> HTTP {e.code}: {e.read().decode(errors="replace")[:400]}')


class ElevenLabs:
    ext = 'mp3'

    def __init__(self):
        self.key = os.environ.get('ELEVENLABS_API_KEY')
        if not self.key:
            raise SystemExit('Set ELEVENLABS_API_KEY.')

    def synth(self, variant, slot_cfg, slot):
        voice = slot_cfg.get('elevenlabs')
        if not voice:
            raise SystemExit(f'No ElevenLabs voice id for {slot} in voice/cast.json.')
        return post_json(
            f'https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128',
            {'text': variant.get('eleven', variant['text']), 'model_id': 'eleven_v3', 'language_code': 'fi'},
            {'xi-api-key': self.key},
        )


class Google:
    ext = 'wav'

    def __init__(self):
        key = os.environ.get('GOOGLE_API_KEY')
        if key:
            self.url = f'https://texttospeech.googleapis.com/v1/text:synthesize?key={key}'
            self.headers = {}
        else:
            if not shutil.which('gcloud'):
                raise SystemExit('Set GOOGLE_API_KEY or log in with gcloud.')
            token = subprocess.check_output(['gcloud', 'auth', 'print-access-token'], text=True).strip()
            self.url = 'https://texttospeech.googleapis.com/v1/text:synthesize'
            self.headers = {'Authorization': f'Bearer {token}'}
            project = os.environ.get('GOOGLE_CLOUD_PROJECT')
            if project:
                self.headers['x-goog-user-project'] = project

    def synth(self, variant, slot_cfg, slot):
        voice = slot_cfg.get('google')
        if not voice:
            raise SystemExit(f'No Google voice for {slot} in voice/cast.json.')
        res = post_json(
            self.url,
            {
                'input': {'text': variant['text']},
                'voice': {'languageCode': 'fi-FI', 'name': voice},
                'audioConfig': {'audioEncoding': 'LINEAR16', 'sampleRateHertz': 24000},
            },
            self.headers,
        )
        return base64.b64decode(json.loads(res)['audioContent'])


class Chatterbox:
    ext = 'wav'

    def __init__(self):
        try:
            import torch
            import torchaudio
            from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        except ImportError:
            raise SystemExit('pip install chatterbox-tts')
        device = 'cuda' if torch.cuda.is_available() else 'mps' if torch.backends.mps.is_available() else 'cpu'
        self.torchaudio = torchaudio
        self.model = ChatterboxMultilingualTTS.from_pretrained(device=device)

    def synth(self, variant, slot_cfg, slot):
        import io

        ref = os.path.join(REFS, f'{slot}.wav')
        if not os.path.exists(ref):
            raise SystemExit(f'Missing reference voice {ref}.')
        opts = slot_cfg.get('chatterbox') or {}
        wav = self.model.generate(
            variant['text'], language_id='fi', audio_prompt_path=ref,
            exaggeration=opts.get('exaggeration', 0.5), cfg_weight=opts.get('cfg_weight', 0.5),
        )
        buf = io.BytesIO()
        self.torchaudio.save(buf, wav, self.model.sr, format='wav')
        return buf.getvalue()


class Test:
    ext = 'wav'

    def synth(self, variant, slot_cfg, slot):
        # One short beep per syllable-ish, pitched by slot, so the clips differ.
        freq = 300 + (sum(map(ord, slot)) % 12) * 60
        dur = 0.25 + 0.05 * len(variant['text'])
        return subprocess.check_output([
            'ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', f'sine=frequency={freq}:duration={dur:.2f}',
            '-af', 'volume=0.3', '-f', 'wav', '-',
        ])


def load():
    with open(LINES, encoding='utf-8') as f:
        lines = json.load(f)['lines']
    with open(CAST, encoding='utf-8') as f:
        cast = json.load(f)
    return lines, cast


def speakers(line):
    s = line['speaker']
    return s if isinstance(s, list) else [s]


def clips_for(line, engine, sample):
    """(clip number, variant) pairs: every variant times its takes, numbered from 1."""
    if sample:
        return [(1, line['variants'][0])]
    takes = 1 if engine in DETERMINISTIC else line.get('takes', 1)
    out = []
    for vi, variant in enumerate(line['variants']):
        for t in range(takes):
            out.append((vi * takes + t + 1, variant))
    return out


def raw_path(engine, slot, key, n, ext):
    return os.path.join(CACHE, engine, slot, f'{key}-{n}.{ext}')


def cached(engine, slot, key, n):
    for ext in ('mp3', 'wav'):
        p = raw_path(engine, slot, key, n, ext)
        if os.path.exists(p):
            return p
    return None


def generate(engine, lines, cast, slots, keys, sample, force):
    synth = {'elevenlabs': ElevenLabs, 'google': Google, 'chatterbox': Chatterbox, 'test': Test}[engine]()
    made = skipped = 0
    for slot in slots:
        cfg = cast['slots'][slot]
        for key in keys:
            line = lines[key]
            if cfg['class'] not in speakers(line) or (sample and not line.get('sample')):
                continue
            for n, variant in clips_for(line, engine, sample):
                if cached(engine, slot, key, n) and not force:
                    skipped += 1
                    continue
                print(f'  {engine} {slot} {key}-{n}: {variant["text"]}')
                data = synth.synth(variant, cfg, slot)
                path = raw_path(engine, slot, key, n, synth.ext)
                os.makedirs(os.path.dirname(path), exist_ok=True)
                with open(path, 'wb') as f:
                    f.write(data)
                made += 1
    print(f'{engine}: {made} generated, {skipped} already cached')


# Trim silence at both ends, normalise loudness, then a short fade so nothing clicks.
FILTER = (
    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
    'loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.01'
)


def build(lines, cast, slots, engine_override):
    total = 0
    count = 0
    for slot in slots:
        cfg = cast['slots'][slot]
        engine = engine_override or cfg.get('engine') or cast['engine']
        out_dir = os.path.join(OUT, slot)
        shutil.rmtree(out_dir, ignore_errors=True)
        for key, line in lines.items():
            if cfg['class'] not in speakers(line):
                continue
            for n, _ in clips_for(line, engine, False):
                src = cached(engine, slot, key, n)
                if not src:
                    continue
                os.makedirs(out_dir, exist_ok=True)
                dst = os.path.join(out_dir, f'{key}-{n}.mp3')
                subprocess.run([
                    'ffmpeg', '-v', 'error', '-y', '-i', src, '-af', FILTER,
                    '-ac', '1', '-ar', '44100', '-b:a', '48k', dst,
                ], check=True)
                total += os.path.getsize(dst)
                count += 1
    print(f'Encoded {count} clips into {os.path.relpath(OUT, ROOT)}/, {total / 1024:.0f} KB in total')


def compare_page(lines, cast):
    """voice-src/compare.html: every cached sample clip, per slot and line, side by side per engine."""
    engines = [e for e in ENGINES if os.path.isdir(os.path.join(CACHE, e))]
    rows = []
    for slot, cfg in cast['slots'].items():
        rows.append(f'<tr><th colspan="{len(engines) + 1}" class="slot">{slot} <small>({cfg["class"]})</small></th></tr>')
        for key, line in lines.items():
            if not line.get('sample') or cfg['class'] not in speakers(line):
                continue
            cells = []
            for e in engines:
                p = cached(e, slot, key, 1)
                cells.append(f'<td><audio controls preload="none" src="{html.escape(os.path.relpath(p, CACHE))}"></audio></td>' if p else '<td>–</td>')
            rows.append(f'<tr><td>{html.escape(line["variants"][0]["text"])}</td>{"".join(cells)}</tr>')
    head = ''.join(f'<th>{e}</th>' for e in engines)
    page = f'''<!doctype html><meta charset="utf-8"><title>Voice samples</title>
<style>body{{font:15px system-ui;margin:16px}}table{{border-collapse:collapse}}td,th{{padding:4px 8px;border-bottom:1px solid #ddd;text-align:left}}
th.slot{{padding-top:18px;font-size:17px}}audio{{height:32px;width:220px}}</style>
<h1>Voice samples</h1><table><tr><th>Line</th>{head}</tr>{"".join(rows)}</table>'''
    path = os.path.join(CACHE, 'compare.html')
    os.makedirs(CACHE, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(page)
    print(f'Wrote {os.path.relpath(path, ROOT)}')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--engine', choices=ENGINES)
    ap.add_argument('--sample', action='store_true', help='only a few lines per slot, then write the comparison page')
    ap.add_argument('--build', action='store_true', help='only encode cached clips for the game')
    ap.add_argument('--only', help='comma-separated line keys')
    ap.add_argument('--slots', help='comma-separated voice slots')
    ap.add_argument('--force', action='store_true', help='regenerate cached clips')
    a = ap.parse_args()
    if not shutil.which('ffmpeg'):
        sys.exit('ffmpeg is needed.')

    lines, cast = load()
    keys = a.only.split(',') if a.only else list(lines)
    slots = a.slots.split(',') if a.slots else list(cast['slots'])
    for k in keys:
        if k not in lines:
            sys.exit(f'Unknown line {k}')
    for s in slots:
        if s not in cast['slots']:
            sys.exit(f'Unknown slot {s}')

    if a.sample:
        generate(a.engine or cast['engine'], lines, cast, slots, keys, True, a.force)
        compare_page(lines, cast)
        return
    if not a.build:
        by_engine = {}
        for s in slots:
            by_engine.setdefault(a.engine or cast['slots'][s].get('engine') or cast['engine'], []).append(s)
        for engine, ss in by_engine.items():
            generate(engine, lines, cast, ss, keys, False, a.force)
    build(lines, cast, slots, a.engine)


if __name__ == '__main__':
    main()
