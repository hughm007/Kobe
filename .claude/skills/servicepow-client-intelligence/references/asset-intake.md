# Asset intake — client files into the register, with provenance
Single home of the client-asset intake handoff. Transport-agnostic: the connected Drive
surface is the preferred pipe for client uploads; email or direct file handoff feed the same
path. The pipe never becomes the truth store — the client KB does.

## The convention
- One client folder per client on the shared Drive, named for the client, containing an
  `incoming/` area the client (or owner) drops files into. The folder id/link is recorded in
  the client's `access-and-accounts.md`.
- Files are pulled DOWN into the client's own KB area (`assets/` beside the register), then
  ingested with `../scripts/servicepow_asset_ingest.py`: every file gets a sha256, size, source
  note (where it came from, when, from whom), and a register row.
- **Provenance starts UNKNOWN.** A pulled file is a real FILE; whether it is a real
  photograph, the real logo, or client-authorized material is a fact only the client/owner
  can supply. UNKNOWN is never upgraded to keep production moving; a row at UNKNOWN may not
  be used as real material in client-facing work (the LB24 class rule).

## Isolation law
Files land only inside their own client's KB area; the ingest tool refuses any destination
outside the named client's folder. One client's Drive folder is never mounted, copied, or
referenced into another client's area. Registers are per-client; there is no shared media
pool.

## Routing
Ingested rows route by the canonical enum: confirmed-real marks/photos/footage → REAL-ASSET
(and, for footage, into the video lane's shot manifest as the proof-beat source); everything
else waits at UNKNOWN with a CLIENT INPUT REQUIRED line in the intake record. The standing
footage-request format (video-production `../../servicepow-video-production/references/real-footage-requests.md`) now names
the client's Drive `incoming/` folder as the delivery destination.

## What this deliberately does not do
No auto-sync, no watching, no write-back into client folders beyond structure, no pulling
from folders not registered to the client, and no treatment of Drive availability as
guaranteed — a session without the Drive surface falls back to any-transport delivery into
the same ingest path, which is why the ingest tool, not the connector, owns the record.
