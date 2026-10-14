"""Automated checks on the rendered MP4 (not the timeline)."""
import json, subprocess, re, wave, numpy as np
D = '/tmp/claude-0/-home-user-Kobe/d8c674ea-7b5d-5bd2-8b43-d8e60a0e96a7/scratchpad/reel/'
M = D + 'out/TripNerd-Daytona-Beach-Reel-DRAFT-1.mp4'
R = {}
p = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', M], capture_output=True, text=True).stdout)
v = [s for s in p['streams'] if s['codec_type'] == 'video'][0]
a = [s for s in p['streams'] if s['codec_type'] == 'audio'][0]
R['container_duration_s'] = float(p['format']['duration'])
R['video'] = {k: v.get(k) for k in ('codec_name', 'profile', 'width', 'height', 'r_frame_rate', 'nb_frames', 'duration', 'pix_fmt')}
R['audio'] = {k: a.get(k) for k in ('codec_name', 'sample_rate', 'channels', 'duration', 'bit_rate')}
# audio from the MP4
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', M, '-vn', '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', D + 'qa/out_audio.wav'])
w = wave.open(D + 'qa/out_audio.wav'); sr = w.getframerate(); n = w.getnframes()
x = np.frombuffer(w.readframes(n), np.int16).reshape(-1, 2).astype(np.float32) / 32768
m = x.mean(1)
def lev(s): return float(20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-9))
R['audio_samples_s'] = n / sr
R['audio_peak_dbfs'] = float(20 * np.log10(np.abs(x).max()))
R['audio_level_per_250ms_db'] = [round(lev(m[int(t * sr):int((t + 0.25) * sr)]), 1) for t in np.arange(0, 16, 0.25)]
seam = [round(lev(m[int(t * sr):int((t + 0.05) * sr)]), 1) for t in np.arange(6.8, 7.8, 0.05)]
R['seam_6.8_to_7.8_per_50ms_db'] = seam
R['silent_gaps_over_200ms_below_-50db'] = [round(t, 2) for t in np.arange(0, 15.8, 0.05) if lev(m[int(t * sr):int((t + 0.2) * sr)]) < -50]
# max sample-to-sample jump (click check) around the seam
seg = m[int(6.9 * sr):int(7.6 * sr)]
R['seam_max_sample_step'] = float(np.abs(np.diff(seg)).max())
R['whole_max_sample_step'] = float(np.abs(np.diff(m)).max())
lu = subprocess.run(['ffmpeg', '-hide_banner', '-i', M, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
tail = lu[lu.rfind('Summary:'):]
R['ebur128_summary'] = ' '.join(tail.split())
# text boxes and word counts
q = json.load(open(D + 'out/qa_build.json'))
R['text_boxes_out_of_band'] = [t for t in q['text_boxes'] if not (t['box'][1] >= 288 and t['box'][3] <= 1344 and t['box'][0] >= 0 and t['box'][2] <= 1080)]
words = {}
for t in q['text_boxes']:
    if t['beat'] in ('placeholder-note',) or t['text'].startswith('['): continue
    words.setdefault(str(t['beat']), []).append(t['text'])
def wc(s): return len([w for w in re.split(r'\s+', s.replace('·', ' ').replace('🏁', ' ')) if re.search(r'[A-Za-z0-9]', w)])
R['words_per_card'] = {b: {'texts': ts, 'words': sum(wc(s) for s in ts)} for b, ts in words.items()}
banned = ['vip', 'exclusive', 'owns', 'send this to', 'dm us', 'tag a', 'tag your', 'tag someone']
cap = open(D + 'out/caption.txt').read()
alltext = ' '.join(t['text'] for t in q['text_boxes']).lower() + ' ' + cap.lower()
R['banned_phrases_found'] = [b for b in banned if b in alltext]
R['beats'] = q['beats']
json.dump(R, open(D + 'out/qa_checks.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps({k: R[k] for k in R if k not in ('beats',)}, indent=1, ensure_ascii=False)[:6000])
