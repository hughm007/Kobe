"""Draft 3 checks, measured on the rendered MP4."""
import json, subprocess, re, wave, numpy as np
D = '/tmp/claude-0/-home-user-Kobe/d8c674ea-7b5d-5bd2-8b43-d8e60a0e96a7/scratchpad/reel/'
M = D + 'out3/TripNerd-Daytona-Beach-Reel-DRAFT-3.mp4'
R = {}
p = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', M], capture_output=True, text=True).stdout)
v = [s for s in p['streams'] if s['codec_type'] == 'video'][0]; a = [s for s in p['streams'] if s['codec_type'] == 'audio'][0]
R['container_duration_s'] = float(p['format']['duration'])
R['video'] = {k: v.get(k) for k in ('codec_name', 'profile', 'width', 'height', 'r_frame_rate', 'nb_frames', 'duration', 'pix_fmt')}
R['audio'] = {k: a.get(k) for k in ('codec_name', 'sample_rate', 'channels', 'duration', 'bit_rate')}
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', M, '-vn', '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', D + 'qa/out3_audio.wav'])
w = wave.open(D + 'qa/out3_audio.wav'); sr = w.getframerate(); n = w.getnframes()
x = np.frombuffer(w.readframes(n), np.int16).reshape(-1, 2).astype(np.float32) / 32768; m = x.mean(1)
def lev(s): return float(20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-9))
R['audio_samples_s'] = n / sr
R['sample_peak_dbfs'] = float(20 * np.log10(np.abs(x).max()))
L = [round(lev(m[int(t * sr):int((t + 0.25) * sr)]), 1) for t in np.arange(0, 16, 0.25)]
R['level_per_250ms_db'] = L
R['level_min_db'] = {'0-13s': min(L[:52]), '13-16s (end card)': min(L[52:])}
R['largest_250ms_level_step_db'] = round(float(np.abs(np.diff(L)).max()), 1)
R['around_0:07_per_100ms_db'] = [round(lev(m[int(t * sr):int((t + 0.1) * sr)]), 1) for t in np.arange(6.5, 7.5, 0.1)]
R['loop_7.8_to_9.2_per_100ms_db'] = [round(lev(m[int(t * sr):int((t + 0.1) * sr)]), 1) for t in np.arange(7.8, 9.2, 0.1)]
R['silent_gaps_200ms_below_-45db'] = [round(t, 2) for t in np.arange(0, 15.8, 0.05) if lev(m[int(t * sr):int((t + 0.2) * sr)]) < -45]
R['loop_max_sample_step'] = float(np.abs(np.diff(m[int(7.9 * sr):int(9.1 * sr)])).max())
R['whole_max_sample_step'] = float(np.abs(np.diff(m)).max())
lu = subprocess.run(['ffmpeg', '-hide_banner', '-i', M, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
R['ebur128_summary'] = ' '.join(lu[lu.rfind('Summary:'):].split())
q = json.load(open(D + 'out3/qa_build.json'))
R['text_boxes_out_of_band'] = [t for t in q['text_boxes'] if not (t['box'][1] >= 288 and t['box'][3] <= 1344 and t['box'][0] >= 0 and t['box'][2] <= 1080)]
cards = {}
for t in q['text_boxes']:
    if t.get('logo'): continue
    cards.setdefault(str(t['beat']), []).append(t['text'])
def wc(s): return len([w for w in re.split(r'\s+', s.replace('·', ' ')) if re.search(r'[A-Za-z0-9]', w)])
R['words_per_card_incl_year'] = {b: {'texts': ts, 'words': sum(wc(s) for s in ts)} for b, ts in cards.items()}
LOCKED = {'1': ['This beats watching from home.', '2024'], '2': ['Race weekend, the TripNerd way.', '2024'], '3': ['Bring your people.', '2024'],
          '4': ['Headsets on. Drinks up.', '2023'], '5': ['Stay for the burnout.', '2023'], '6': ['Daytona Beach 2027', 'Plan yours · tripnerd.com']}
R['copy_matches_brief'] = {b: (' '.join(cards[b]).split() == ' '.join(LOCKED[b]).split()) for b in LOCKED}
banned = ['vip', 'exclusive', 'owns', 'handled', 'send this to', 'dm us', 'tag a', 'tag your', 'tag someone', 'book now',
          'sound on', 'night over pit road', 'daytime. engines on', 'where would your crew sit', 'still filming', '4:54', '6:56']
cap = open(D + 'out3/caption.txt').read()
onscreen = ' '.join(t['text'] for t in q['text_boxes']).lower()
R['banned_or_retired_onscreen'] = [b for b in banned if b in onscreen]
R['banned_in_caption'] = [b for b in banned[:10] if b in cap.lower()]
R['caption_exact'] = cap == open(D + 'caption_brief3.txt').read()
R['beats'] = q['beats']; R['build_audio'] = q['audio']
json.dump(R, open(D + 'out3/qa_checks.json', 'w'), indent=1, ensure_ascii=False)
for k in R:
    if k not in ('beats', 'build_audio', 'level_per_250ms_db'): print(k, ':', R[k])
print('levels', R['level_per_250ms_db'])
print('ride', q['audio']['gain_ride']['max_applied_db'], q['audio']['gain_ride']['applied_per_250ms_db'])
