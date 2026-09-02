# Suppression list
Permanent. Entries are added on receipt of an opt-out, not on the next run. Checked at
qualification and again immediately before send (BC-37). Scopes `domain` and `company`
suppress every contact beneath them.

Format: `<contact> | <scope: address|domain|company|phone> | <reason> | <date> | <source>`

## Live entries
_None. No outbound has been sent, so nothing has opted out._

## Test entries — TEST DATA, never a cohort
test-optout@example.invalid | address | fixture opt-out | 2026-08-20 | fixture
example-suppressed.invalid  | domain  | fixture opt-out | 2026-08-21 | fixture
FIXTURE HOLDINGS            | company | fixture do-not-contact | 2026-08-22 | fixture
