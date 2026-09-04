#!/usr/bin/env python3
"""Client asset ingest: files -> hashed, provenance-tracked register rows. Stdlib only.

usage: servicepow_asset_ingest.py --client-dir <clients/slug> --inbox <dir> --source "<note>"
Moves inbox files into <client-dir>/assets/, appends rows to <client-dir>/asset-register.md
(creates a minimal register if absent). Provenance starts UNKNOWN - never invented.

Isolation is enforced on BOTH sides, and every check runs before any write:
  DESTINATION  --client-dir must be a registered client KB: a direct child of a `clients/`
               directory, not a template/hidden entry, carrying a client-brief.md. A typo, a
               traversal, a non-client folder or a path outside the workspace is refused.
  INBOX        by default the inbox must sit inside that same client dir. With
               --allow-external-inbox a download staging dir is accepted, but never one inside
               ANOTHER client's tree and never an ancestor of the client dir. Files still land
               only inside the named client dir.
A refusal exits 1 and leaves the filesystem untouched: no assets/ dir, no register, no rows."""
import argparse, hashlib, shutil, sys, time
from pathlib import Path

CLIENTS_DIRNAME = "clients"
BRIEF = "client-brief.md"

def sha256(p):
    h=hashlib.sha256()
    with open(p,'rb') as f:
        for c in iter(lambda:f.read(1<<20),b''): h.update(c)
    return h.hexdigest()

def refuse(msg):
    sys.exit(msg)  # message to stderr, exit status 1, nothing written

def client_root_of(p):
    """The clients/<entry> directory containing p (any entry, template included), or None."""
    for anc in (p, *p.parents):
        if anc.parent.name == CLIENTS_DIRNAME:
            return anc
    return None

def validate_destination(cd):
    if not cd.is_dir():
        refuse(f"DESTINATION REFUSAL: no such client dir: {cd}")
    if cd.parent.name != CLIENTS_DIRNAME:
        refuse(f"DESTINATION REFUSAL: {cd} is not a direct child of a '{CLIENTS_DIRNAME}/' directory - not a client KB")
    if cd.name.startswith(("_", ".")):
        refuse(f"DESTINATION REFUSAL: '{cd.name}' is a template/hidden entry, not a client")
    if not (cd / BRIEF).is_file():
        refuse(f"DESTINATION REFUSAL: {cd} carries no {BRIEF} - not a registered client KB")

def validate_inbox(cd, inbox, allow_external):
    if not inbox.is_dir():
        refuse(f"no such inbox: {inbox}")
    if inbox == cd or cd in inbox.parents:
        return  # inside the named client's own tree - always fine
    if inbox in cd.parents:
        refuse(f"ISOLATION REFUSAL: inbox {inbox} is an ancestor of the client dir - an intake never drains the workspace itself")
    if not allow_external:
        refuse(f"ISOLATION REFUSAL: inbox {inbox} is outside client dir {cd} (use --allow-external-inbox for a download staging dir; files still land only inside the client dir)")
    other = client_root_of(inbox)
    if other is not None and other != cd:
        refuse(f"ISOLATION REFUSAL: inbox {inbox} is inside another client's tree ('{other.name}'); --allow-external-inbox never crosses clients")

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--client-dir",required=True); ap.add_argument("--inbox",required=True)
    ap.add_argument("--source",required=True,help="where these files came from, when, from whom")
    ap.add_argument("--allow-external-inbox",action="store_true")
    a=ap.parse_args()
    cd=Path(a.client_dir).resolve(); inbox=Path(a.inbox).resolve()

    # --- every check before any write ---
    validate_destination(cd)
    validate_inbox(cd, inbox, a.allow_external_inbox)
    files=sorted(p for p in inbox.iterdir() if p.is_file() and not p.name.startswith("."))
    if not files: refuse("inbox empty - nothing to ingest")

    # --- writes, only inside cd ---
    slug=cd.name
    assets=cd/"assets"; assets.mkdir(exist_ok=True)
    reg=cd/"asset-register.md"
    if not reg.exists():
        reg.write_text(f"# {slug} — Client Asset Register\n\n⚠ All provenance starts UNKNOWN until the client/owner confirms; UNKNOWN rows may not\nbe used as real material in client-facing work.\n\n| ID | Type | File | sha256 | Verified real | Approved | Generatable | Must use real | Source |\n|---|---|---|---|---|---|---|---|---|\n")
    existing=reg.read_text(); n=existing.count("| SP-")+existing.count(f"| {slug[:3].upper()}")
    rows=[]; stamp=time.strftime("%Y-%m-%d")
    for i,f in enumerate(files, start=1):
        h=sha256(f); dest=assets/f.name
        if dest.exists() and sha256(dest)!=h:
            dest=assets/f"{f.stem}-{h[:8]}{f.suffix}"
        shutil.move(str(f),dest)
        rid=f"{slug[:12]}-{n+i:03d}"
        ext=f.suffix.lower().lstrip('.') or 'file'
        rows.append(f"| {rid} | {ext.upper()} | `assets/{dest.name}` | {h[:16]} | **UNKNOWN** | UNKNOWN | UNKNOWN | UNKNOWN | {a.source} ({stamp}) |")
        print(f"ingested {dest.name}  sha256={h[:16]}  -> {rid}")
    reg.write_text(existing.rstrip()+"\n"+"\n".join(rows)+"\n")
    print(f"\n{len(rows)} row(s) appended to {reg}")
    print("provenance: UNKNOWN (CLIENT INPUT REQUIRED) - not usable as real material until confirmed")

if __name__=="__main__": main()
