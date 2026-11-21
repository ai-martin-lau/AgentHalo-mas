#!/usr/bin/env python3
"""Validate deliverables without playback; extract exact frames 0,10,...,490."""
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
LOCALES = sys.argv[1:] or ['en-US', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'es-ES']

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
    assert int(v['nb_frames']) == 495
    assert 15 <= float(p['format']['duration']) <= 17
    assert float(p['format']['duration']) == 16.5
    assert int(p['format']['size']) < 500_000_000
    assert a['channels'] == 2 and a['sample_rate'] == '48000' and a['codec_name'] == 'aac'
    log = run(['ffmpeg', '-v', 'error', '-i', str(video), '-f', 'null', '-']).stderr
    assert not log, log.decode()
    windows = [volume(video, s, e) for s, e in [(0, 4.7), (4.8, 5.4), (5.5, 8.9), (9, 9.7), (9.8, 16.5)]]
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
    assert abs(segments[0][0]-4.8) <= .04 and abs(segments[1][0]-9) <= .04, segments
    frames = WORK / (locale+'-frames')
    frames.mkdir(exist_ok=True)
    extract = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', str(video), '-vf', r'select=not(mod(n\,10))', '-fps_mode', 'vfr', str(frames/'%03d.png')]
    run(extract)
    paths = sorted(frames.glob('*.png'))
    assert len(paths) == 50
    # 6 columns x 9 regular rows + one callback detail row; exact n/30 timestamps.
    sheet = Image.new('RGB', (2880, 2940), '#f7f8f6')
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 17)
    for i, frame in enumerate(paths):
        image = Image.open(frame).convert('RGB')
        assert image.size == (1920,1080)
        assert image.getextrema() != ((0,0),(0,0),(0,0))
        x = (i % 6) * 480; y = (i // 6) * 294
        draw.text((x+9,y+3), f'{locale}   {i/3:06.3f}s', font=font, fill='#17382f')
        sheet.paste(image.resize((480,270),Image.Resampling.LANCZOS),(x,y+24))
    # Add six real video crops so both bell swings and the 1.04 pulse are visible.
    detail_frames = WORK / (locale+'-completion')
    detail_frames.mkdir(exist_ok=True)
    detail_indices = [270, 272, 277, 279, 281, 286]
    detail_select = '+'.join(f'eq(n\\,{n})' for n in detail_indices)
    detail_extract = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', str(video), '-vf', 'select='+detail_select, '-fps_mode', 'vfr', str(detail_frames/'%03d.png')]
    run(detail_extract)
    detail_paths = sorted(detail_frames.glob('*.png'))
    assert len(detail_paths) == 6
    for i, frame in enumerate(detail_paths):
        x=i*480; y=9*294
        draw.text((x+9,y+3), f'CALLBACK {detail_indices[i]/30:06.3f}s', font=font, fill='#17382f')
        crop=Image.open(frame).convert('RGB').crop((1520,380,1840,560))
        sheet.paste(crop.resize((480,270),Image.Resampling.LANCZOS),(x,y+24))
    sheet.save(ROOT / (locale+'-frames.png'))
    acceptance = json.loads((ROOT/(locale+'-acceptance.json')).read_text())
    assert acceptance['firstSegmentOpen'] and acceptance['deterministicScreenshot']
    assert acceptance['editorCodeLines'] == 14 and acceptance['trafficLights'] == 3
    samples = acceptance['samples']
    peak = next(s for s in samples if s['t'] == 9.3)
    assert abs(peak['hudScale']-1.04)<1e-8
    assert next(s for s in samples if s['t'] == 8.95)['editorOpacity'] == .6
    assert all(s['friendLayout']['height']==200 and s['friendsFrame']==0 for s in samples)

    assert min(acceptance['fullDisplaySeconds']) >= 1.6
    assert all(c['inside'] and not c['overlap'] for c in acceptance['captionChecks'])
    assert all(not c['clipped'] for c in acceptance['taskChecks'])

    # Inspection strips preserve 640px previews; these are temporary, not deliverables.
    for block in range(3):
        subset=paths[block*17:(block+1)*17]
        strip=Image.new('RGB',(1920,6*384),'#f7f8f6');d=ImageDraw.Draw(strip)
        for j,frame in enumerate(subset):
            x=j%3*640;y=j//3*384
            d.text((x+10,y+3),f'{locale} {(block*17+j)/3:.3f}s',font=font,fill='#17382f')
            strip.paste(Image.open(frame).convert('RGB').resize((640,360),Image.Resampling.LANCZOS),(x,y+24))
        strip.save(WORK/f'{locale}-inspection-{block+1}.png')
    report[locale] = {
        'video': video.name, 'width':v['width'], 'height':v['height'], 'codec':v['codec_name'],
        'pixel_format':v['pix_fmt'], 'frame_rate':v['r_frame_rate'], 'frames':int(v['nb_frames']),
        'duration':float(p['format']['duration']), 'bytes':int(p['format']['size']),
        'audio': {'codec':a['codec_name'], 'channels':a['channels'], 'sample_rate':int(a['sample_rate'])},
        'volume_windows':windows, 'audible_segments_above_minus60dB':segments,
        'extract_command':extract, 'contact_sheet_frames':50, 'completion_detail_frames':6,
        'completion_extract_command':detail_extract, 'acceptance':acceptance, 'decode_errors':0,
        'audio_aac_sha256':hashlib.sha256(run(['ffmpeg','-v','error','-i',str(video),'-map','0:a:0','-c','copy','-f','adts','pipe:1']).stdout).hexdigest(),
        'sha256':hashlib.sha256(video.read_bytes()).hexdigest()
    }
    print(locale, json.dumps({k:report[locale][k] for k in ['duration','bytes','audio','audible_segments_above_minus60dB','decode_errors']}))
# Ensure every referenced real product source is unchanged since rendering began.
manifest=json.loads((ROOT/'source-manifest.json').read_text())
for rel, expected in manifest.items():
    actual=hashlib.sha256((ROOT.parent.parent/rel).read_bytes()).hexdigest()
    assert expected==actual, 'Product source changed during render: '+rel
all_locales=['en-US','zh-Hans','zh-Hant','ja','ko','es-ES']
if all(report.get(loc,{}).get('duration')==16.5 and 'audio_aac_sha256' in report[loc] for loc in all_locales):
    assert len({report[loc]['audio_aac_sha256'] for loc in all_locales})==1, 'Localized soundtracks differ'
(ROOT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('All requested media checks passed; 50-frame contact sheets with six callback details written.')
