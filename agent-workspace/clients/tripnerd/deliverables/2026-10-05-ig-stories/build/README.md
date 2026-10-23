# Story frame build

Rendered in the Higgsfield cloud sandbox (this workspace's network can't reach tripnerd.com).
`frames.py` pulls image URLs from tripnerd.com (`urls.txt` = every non-resized JPG on the
home, /nerds and /events/augusta-experience pages) and writes one HTML file per frame;
`render.js` (Playwright) screenshots them at 1080×1920; `sheet.py` builds the contact sheet.

Outputs (Higgsfield storage, Karl's account):
- ZIP (v3, creative rebuild, 24 frames): https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/923c510a-90d0-463c-8fc5-5d52daa28911.zip (v1, v2 superseded)
- Contact sheet (v3): https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/3baddf76-515d-413b-8b3f-3f18f969f853.jpg
