# Daytona Beach Reel, draft 2 (2026-10-15)

Not publish-ready: it scores 64/100 and guest consent is unconfirmed. See `QA-report.md`.

Changes from draft 1:
- Photos A and B from the tripnerd.com gallery are now in beats 4–5.
- No person is blurred (owner direction). Only third-party logos, signs and screens are masked.

Media is not committed. The MP4, the two photos and the source clips stay out of git (client media). They were delivered in chat and live in the session scratchpad.

Files:
- `build_reel.py`: renders the cut.
- `masks.py`: holds the logo masks (video masks tracked by camera shift, plus `PHOTO_BOXES`).
- `qa_checks.py`: measures the export.
