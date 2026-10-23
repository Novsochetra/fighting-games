"""Voice Steel & Dust's announcer: "Mission one! Start!" and "Mission one! Complete!" for every
mission, spoken by Kokoro (an open text-to-speech model, Apache-2.0) and made into an arcade
announcer: pitched down, pushed and held level, cut to the Neo Geo's 18.5 kHz samples and left
to ring in a stone hall.

    python3 -m venv venv && venv/bin/pip install kokoro-onnx soundfile
    (the model: kokoro-v1.0.onnx and voices-v1.0.bin from the kokoro-onnx releases on GitHub)
    venv/bin/python tools/announcer_voice.py <model_dir> [voice=bm_george]

A voice may be a blend, as am_fenrir+am_michael. Needs ffmpeg with rubberband and libmp3lame.
"""
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile
from kokoro_onnx import Kokoro

OUT = Path(__file__).parent.parent / 'apps/web/games/steel-and-dust/assets/audio/announcer'
RATE = 44100
NUMBERS = 'one two three four five six seven eight nine ten eleven twelve'.split()
# a word's name, then a beat, then the call: the beat is what makes it an announcer
GAP = 0.2
HALL_WET = 0.32
VOICE_CHAIN = ','.join([
    'aresample=44100',
    'rubberband=pitch=0.88',
    'highpass=f=80',
    'equalizer=f=150:t=q:w=1:g=4',
    'equalizer=f=400:t=q:w=1.4:g=-3',
    'equalizer=f=2800:t=q:w=1.2:g=4',
    'acompressor=threshold=-20dB:ratio=4:attack=3:release=70:makeup=4dB',
    'volume=3dB',
    'asoftclip=type=tanh',
    'aresample=18500',
    'lowpass=f=8000',
    'aresample=44100',
    'apad=pad_dur=1.5',
])


def lines():
    for index, word in enumerate(NUMBERS):
        name = f'mission-{index + 1:02d}'
        mission = (f'Mission {word}!', 0.9)
        yield f'{name}-start', [mission, ('Start!', 0.85)]
        finale = [('All clear!', 0.85)] if index == len(NUMBERS) - 1 else []
        yield f'{name}-complete', [mission, ('Complete!', 0.85), *finale]


def hall_impulse(seconds=1.4, seed=7):
    random = np.random.default_rng(seed)
    time = np.arange(int(seconds * RATE)) / RATE
    tail = random.standard_normal(time.size) * np.exp(-time * 5.0)
    # the high end dies first in a stone hall
    smooth = np.convolve(tail, np.ones(6) / 6, mode='same')
    impulse = np.concatenate([np.zeros(int(0.025 * RATE)), smooth])
    return (impulse / np.sqrt(np.sum(impulse**2))).astype(np.float32)


# short fades, so no cut edge clicks and rings on in the hall
def faded(samples, rate, fade_in=0.006, fade_out=0.04):
    samples = samples.copy()
    rise, fall = int(fade_in * rate), int(fade_out * rate)
    samples[:rise] *= np.linspace(0, 1, rise)
    samples[-fall:] *= np.linspace(1, 0, fall)
    return samples


def trimmed(samples, threshold=0.008):
    loud = np.flatnonzero(np.abs(samples) > threshold)
    return samples[max(0, loud[0] - 200):loud[-1] + 1] if loud.size else samples


def style(kokoro, voice):
    names = voice.split('+')
    if len(names) == 1:
        return voice
    return sum(kokoro.get_voice_style(name) for name in names) / len(names)


def spoken(kokoro, voice, pieces):
    parts, rate = [], 24000
    for text, speed in pieces:
        samples, rate = kokoro.create(text, voice=style(kokoro, voice), speed=speed, lang='en-us')
        parts += [faded(trimmed(samples), rate), np.zeros(int(GAP * rate), dtype=np.float32)]
    return np.concatenate(parts[:-1]), rate


def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *map(str, args)], check=True)


def finished(samples, peak_db=-1.0):
    loud = np.flatnonzero(np.abs(samples) > np.abs(samples).max() * 0.001)
    samples = faded(samples[: loud[-1] + 1], RATE, fade_in=0.002, fade_out=0.08)
    return samples / np.abs(samples).max() * 10 ** (peak_db / 20)


def announce(spoken_line, rate, out):
    with tempfile.TemporaryDirectory() as temp:
        temp = Path(temp)
        soundfile.write(temp / 'raw.wav', spoken_line, rate)
        soundfile.write(temp / 'hall.wav', hall_impulse(), RATE)
        ffmpeg('-i', temp / 'raw.wav', '-af', VOICE_CHAIN, temp / 'dry.wav')
        # afir's own gain off: the impulse is scaled to unit energy, so HALL_WET is the hall's level
        mix = (f'[0]asplit[dry][send];[send][1]afir=dry=1:wet=1:gtype=-1[hall];'
               f'[dry][hall]amix=inputs=2:weights=1 {HALL_WET}:normalize=0')
        ffmpeg('-i', temp / 'dry.wav', '-i', temp / 'hall.wav', '-filter_complex', mix,
               '-ac', '1', temp / 'wet.wav')
        mixed, _ = soundfile.read(temp / 'wet.wav', dtype='float32')
        soundfile.write(temp / 'done.wav', finished(mixed), RATE)
        ffmpeg('-i', temp / 'done.wav', '-ac', '1', '-b:a', '64k', '-map_metadata', '-1', out)


def main(model_dir, voice='bm_george'):
    models = Path(model_dir)
    kokoro = Kokoro(str(models / 'kokoro-v1.0.onnx'), str(models / 'voices-v1.0.bin'))
    OUT.mkdir(parents=True, exist_ok=True)
    for name, pieces in lines():
        samples, rate = spoken(kokoro, voice, pieces)
        announce(samples, rate, OUT / f'{name}.mp3')
        print(name)


if __name__ == '__main__':
    main(*sys.argv[1:])
