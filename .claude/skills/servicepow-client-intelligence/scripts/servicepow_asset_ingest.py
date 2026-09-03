#!/usr/bin/env python3
"""Client asset ingest: files -> hashed, provenance-tracked register rows. Stdlib only.

usage: servicepow_asset_ingest.py --client-dir <clients/slug> --inbox <dir> --source "<note>"
Moves inbox files into <client-dir>/assets/, appends rows to <client-dir>/asset-register.md
(creates a minimal register if absent). Provenance starts UNKNOWN - never invented.
Refuses any inbox outside the client dir tree unless --allow-external-inbox (still writes
only inside the client dir)."""
import argparse, hashlib, shutil, sys, time
from pathlib import Path

def sha256(p):
    h=hashlib.sha256()
    with open(p,'rb') as f:
        for c in iter(lambda:f.read(1<<20),b''): h.update(c)
    return h.hexdigest()

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--client-dir",required=True); ap.add_argument("--inbox",required=True)
    ap.add_argument("--source",required=True,help="where these files came from, when, from whom")
    ap.add_argument("--allow-external-inbox",action="store_true")
    a=ap.parse_args()
    cd=Path(a.client_dir).resolve(); inbox=Path(a.inbox).resolve()
    if not cd.is_dir(): sys.exit(f"no such client dir: {cd}")
    slug=cd.name
    if not a.allow_external_inbox and cd not in inbox.parents and inbox!=cd:
        sys.exit(f"ISOLATION REFUSAL: inbox {inbox} is outside client dir {cd} (use --allow-external-inbox for a download staging dir; files still land only inside the client dir)")
    assets=cd/"assets"; assets.mkdir(exist_ok=True)
    reg=cd/"asset-register.md"
    if not reg.exists():
        reg.write_text(f"# {slug} — Client Asset Register\n\n⚠ All provenance starts UNKNOWN until the client/owner confirms; UNKNOWN rows may not\nbe used as real material in client-facing work.\n\n| ID | Type | File | sha256 | Verified real | Approved | Generatable | Must use real | Source |\n|---|---|---|---|---|---|---|---|---|\n")
    files=sorted(p for p in inbox.iterdir() if p.is_file() and not p.name.startswith("."))
    if not files: sys.exit("inbox empty - nothing to ingest")
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
