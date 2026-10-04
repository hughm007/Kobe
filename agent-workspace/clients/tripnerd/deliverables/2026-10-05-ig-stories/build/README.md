# Story frame build

Rendered in the Higgsfield cloud sandbox (this workspace's network can't reach tripnerd.com).
`frames.py` pulls image URLs from tripnerd.com (`urls.txt` = every non-resized JPG on the
home, /nerds and /events/augusta-experience pages) and writes one HTML file per frame;
`render.js` (Playwright) screenshots them at 1080×1920; `sheet.py` builds the contact sheet.

Outputs (Higgsfield storage, Karl's account):
- ZIP (post/ clean frames + preview/ with sticker guides): https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/8ed05abd-c1e7-4eeb-a2ff-c3ea480b948b.zip
- Contact sheet: https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/4104921c-7a54-4c46-9108-71df10cca0d6.jpg
