#!/usr/bin/env python3
"""Validate deliverables without playback; extract exact frames 0,15,...,615."""
import array
import hashlib
import json
import math
from pathlib import Path
import re
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
WORK = ROOT / '.work'
WORK.mkdir(exist_ok=True)
LOCALES = sys.argv[1:] or ['en-US', 'zh-Hans']

def run(args):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

def volume(video, start, end):
    args = ['ffmpeg', '-hide_banner', '-nostats', '-i', str(video), '-vn', '-af', f'atrim=start={start}:end={end},volumedetect', '-f', 'null', '-']
    log = run(args).stderr.decode()
    values = {key: float(value) for key, value in re.findall(r'(mean_volume|max_volume):\s*(-?[\d.]+) dB', log)}
    return {'start': start, 'end': end, **values, 'command': args}

report = json.loads((ROOT/'verification.json').read_text()) if (ROOT/'verification.json').exists() else {}
for locale in LOCALES:
    video = ROOT / f'AgentHalo-preview-{locale}.mp4'
    p = json.loads(run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(video)]).stdout)
    v = next(s for s in p['streams'] if s['codec_type'] == 'video')
    a = next(s for s in p['streams'] if s['codec_type'] == 'audio')
    assert (v['width'], v['height'], v['codec_name'], v['pix_fmt']) == (1920, 1080, 'h264', 'yuv420p')
    assert v['r_frame_rate'] == v['avg_frame_rate'] == '30/1'
    assert int(v['nb_frames']) == 630
    assert 15 <= float(p['format']['duration']) <= 30
    assert float(p['format']['duration']) == 21
    assert int(p['format']['size']) < 500_000_000
    assert a['channels'] == 2 and a['sample_rate'] == '48000' and a['codec_name'] == 'aac'
    log = run(['ffmpeg', '-v', 'error', '-i', str(video), '-f', 'null', '-']).stderr
    assert not log, log.decode()
    windows = [volume(video, s, e) for s, e in [(0, 6.9), (7, 7.6), (7.7, 13.1), (13.2, 13.9), (14, 21)]]
    for i in [0, 2, 4]:
        assert windows[i]['max_volume'] <= -90, windows[i]
    for i in [1, 3]:
        assert windows[i]['max_volume'] > -40, windows[i]
    # Measure audible 10ms buckets in the decoded AAC, never play audio.
    raw = run(['ffmpeg', '-v', 'error', '-i', str(video), '-vn', '-ac', '1', '-ar', '48000', '-f', 'f32le', 'pipe:1']).stdout
    samples = array.array('f'); samples.frombytes(raw)
    active = []
    for offset in range(0, len(samples), 480):
        chunk = samples[offset:offset+480]
        rms = math.sqrt(sum(x*x for x in chunk) / len(chunk))
        if rms > 0.001:
            active.append(offset / 48000)
    segments = []
    for t in active:
        if not segments or t - segments[-1][1] > .015:
            segments.append([t, t+.01])
        else:
            segments[-1][1] = t+.01
    assert len(segments) == 2, segments
    assert abs(segments[0][0]-7) <= .04 and abs(segments[1][0]-13.2) <= .04, segments
    frames = WORK / (locale+'-frames')
    frames.mkdir(exist_ok=True)
    extract = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', str(video), '-vf', r'select=not(mod(n\,15))', '-fps_mode', 'vfr', str(frames/'%03d.png')]
    run(extract)
    paths = sorted(frames.glob('*.png'))
    assert len(paths) == 42
    # 6 columns x 7 rows; every thumbnail has its exact source timestamp.
    sheet = Image.new('RGB', (2880, 2058), '#f7f8f6')
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 17)
    for i, frame in enumerate(paths):
        image = Image.open(frame).convert('RGB')
        assert image.size == (1920,1080)
        assert image.getextrema() != ((0,0),(0,0),(0,0))
        x = (i % 6) * 480; y = (i // 6) * 294
        draw.text((x+9,y+3), f'{locale}   {i*.5:04.1f}s', font=font, fill='#17382f')
        sheet.paste(image.resize((480,270),Image.Resampling.LANCZOS),(x,y+24))
    sheet.save(ROOT / (locale+'-frames.png'))
    # Inspection strips preserve 640px previews; these are temporary, not deliverables.
    for block in range(3):
        subset=paths[block*14:(block+1)*14]
        strip=Image.new('RGB',(1920,5*384),'#f7f8f6');d=ImageDraw.Draw(strip)
        for j,frame in enumerate(subset):
            x=j%3*640;y=j//3*384
            d.text((x+10,y+3),f'{locale} {(block*14+j)*.5:.1f}s',font=font,fill='#17382f')
            strip.paste(Image.open(frame).convert('RGB').resize((640,360),Image.Resampling.LANCZOS),(x,y+24))
        strip.save(WORK/f'{locale}-inspection-{block+1}.png')
    report[locale] = {
        'video': video.name, 'width':v['width'], 'height':v['height'], 'codec':v['codec_name'],
        'pixel_format':v['pix_fmt'], 'frame_rate':v['r_frame_rate'], 'frames':int(v['nb_frames']),
        'duration':float(p['format']['duration']), 'bytes':int(p['format']['size']),
        'audio': {'codec':a['codec_name'], 'channels':a['channels'], 'sample_rate':int(a['sample_rate'])},
        'volume_windows':windows, 'audible_segments_above_minus60dB':segments,
        'extract_command':extract, 'contact_sheet_frames':42, 'decode_errors':0,
        'sha256':hashlib.sha256(video.read_bytes()).hexdigest()
    }
    print(locale, json.dumps({k:report[locale][k] for k in ['duration','bytes','audio','audible_segments_above_minus60dB','decode_errors']}))
# Ensure every referenced real product source is unchanged since rendering began.
manifest=json.loads((ROOT/'source-manifest.json').read_text())
for rel, expected in manifest.items():
    actual=hashlib.sha256((ROOT.parent.parent/rel).read_bytes()).hexdigest()
    assert expected==actual, 'Product source changed during render: '+rel
(ROOT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('All requested media checks passed; 42-frame contact sheets written.')
