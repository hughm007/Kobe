# Story frame build

Rendered in the Higgsfield cloud sandbox (this workspace's network can't reach tripnerd.com).
`frames.py` pulls image URLs from tripnerd.com (`urls.txt` = every non-resized JPG on the
home, /nerds and /events/augusta-experience pages) and writes one HTML file per frame;
`render.js` (Playwright) screenshots them at 1080×1920; `sheet.py` builds the contact sheet.

Outputs (Higgsfield storage, Karl's account):
- ZIP (post/ clean frames + preview/ with sticker guides): https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/4055ce54-bc9d-446f-a352-88f009753ce0.zip (v2, growth-plan aligned, 22 frames; v1 superseded)
- Contact sheet: https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/5aa1ff1e-c340-4ce2-b360-26ec89b484f8.jpg (v2)
