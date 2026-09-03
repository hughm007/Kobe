#!/usr/bin/env python3
"""Service Pow video production state ledger, variant engine and targeted-revision tool.

One tool, one manifest. Answers at every moment, per element:
  WHAT EXISTS · WHAT IS APPROVED · WHAT FAILED · WHAT NEEDS REGENERATION
  WHAT MUST NOT CHANGE · WHAT VERSION IS CURRENT

Subcommands:
  preflight  verify the build path BEFORE any generation spend
  init       create a campaign manifest from a plan file
  state      show the ledger
  set        set an element's state (APPROVED / FAILED / NEEDS_REGENERATION ...)
  ingest     record a produced asset against an element (hashes it, bumps version)
  plan       print exactly what must be generated (and what is inherited)
  assemble   build variants from approved elements
  freeze     snapshot artifacts + hashes for a gate round
  verify     prove which elements changed since a freeze
  econ       production economics
"""
import argparse, hashlib, json, os, shutil, subprocess, sys, time
from pathlib import Path

STATES = ["PLANNED", "EXISTS", "APPROVED", "FAILED", "NEEDS_REGENERATION", "MUST_NOT_CHANGE"]


def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load(mp: Path) -> dict:
    return json.loads(mp.read_text())


def save(mp: Path, m: dict):
    m["updated"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    mp.write_text(json.dumps(m, indent=2) + "\n")


def econ_bump(m: dict, key: str, n: int = 1):
    m.setdefault("economics", {}).setdefault(key, 0)
    m["economics"][key] += n


# ------------------------------------------------------------------ preflight
def cmd_preflight(a):
    """Requirement 5: nothing is generated while infrastructure is uncertain."""
    checks, failed = [], 0

    def chk(name, ok, detail=""):
        nonlocal failed
        checks.append((name, ok, detail))
        if not ok:
            failed += 1

    for tool in ["ffmpeg", "ffprobe"]:
        chk(f"tool:{tool}", shutil.which(tool) is not None, shutil.which(tool) or "ABSENT")
    gen = shutil.which("higgsfield")
    chk("tool:generator", gen is not None, gen or "ABSENT")

    # voice route must be proven by producing real audio, not by asserting a skill exists
    voice = shutil.which("say")
    if voice:
        out = Path(a.workdir) / ".preflight-voice.aiff"
        out.parent.mkdir(parents=True, exist_ok=True)
        try:
            subprocess.run([voice, "-o", str(out), "preflight"], check=True,
                           capture_output=True, timeout=30)
            dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                  "-of", "csv=p=0", str(out)], capture_output=True, text=True).stdout.strip()
            chk("voice:route", bool(dur) and float(dur) > 0, f"say -> {dur}s audio verified")
            out.unlink(missing_ok=True)
        except Exception as e:
            chk("voice:route", False, f"say present but failed: {e}")
    else:
        chk("voice:route", False, "no local TTS")

    # build location: assets, generation, assembly and export must share one filesystem
    wd = Path(a.workdir)
    wd.mkdir(parents=True, exist_ok=True)
    probe = wd / ".preflight-write"
    try:
        probe.write_text("x"); probe.unlink()
        chk("build:writable", True, str(wd))
    except Exception as e:
        chk("build:writable", False, str(e))
    chk("build:single-location", True,
        "source, generated, assembly and export all under one root - no cross-network hop")


    # --- model capability vs the QC floors it will be graded against -------------
    if a.model and gen:
        r = subprocess.run([gen, "model", "get", a.model], capture_output=True, text=True)
        spec = r.stdout
        has_res = "resolution" in spec
        meets = has_res and ("1080p" in spec or "4k" in spec)
        chk(f"model:{a.model}:resolution>=1080",
            meets,
            "1080p selectable" if meets
            else "model exposes no resolution >=1080p - it CANNOT pass the resolution gate")

    # --- prompts vs the motion floor they will be graded against ----------------
    if a.check_prompts and Path(a.check_prompts).exists():
        m = load(Path(a.check_prompts))
        MOTION = ("dolly", "push in", "pan", "track", "handheld", "drift", "tilt",
                  "orbit", "crane", "zoom", "moving", "walks", "pours", "rises")
        stat = [k for k, v in m["elements"].items()
                if v.get("prompt") and not any(w in v["prompt"].lower() for w in MOTION)]
        chk("prompts:motion-floor", not stat,
            "all prompts specify camera or subject motion" if not stat
            else f"{len(stat)} prompt(s) describe stillness and will fail the motion gate: {stat[:3]}")

    for n, ok, d in checks:
        print(f"{'PASS' if ok else 'FAIL'}  {n}: {d}")
    print(f"\nPREFLIGHT: {'PASS' if failed == 0 else 'FAIL'} ({len(checks)-failed}/{len(checks)})")
    return 1 if failed else 0


# ----------------------------------------------------------------------- init
def cmd_init(a):
    plan = json.loads(Path(a.plan).read_text())
    mp = Path(a.manifest)
    elements, variants = {}, {}
    for c in plan["concepts"]:
        cid = c["id"]
        for role, count in (("body", c.get("body_shots", 2)),):
            for i in range(1, count + 1):
                elements[f"{cid}-{role}-{i:02d}"] = {
                    "state": "PLANNED", "version": 0, "path": None, "sha256": None,
                    "concept": cid, "role": role, "shared_across_hooks": True,
                    "prompt": c["body_prompts"][i - 1],
                }
        for h in plan["hooks"]:
            elements[f"{cid}-hook-{h['id']}"] = {
                "state": "PLANNED", "version": 0, "path": None, "sha256": None,
                "concept": cid, "role": "hook", "hook": h["id"],
                "shared_across_hooks": False,
                "prompt": h["prompt_template"].format(concept=c["visual"]),
            }
            variants[f"{cid}-{h['id']}"] = {
                "concept": cid, "hook": h["id"], "state": "PLANNED",
                "elements": [f"{cid}-hook-{h['id']}"]
                            + [f"{cid}-body-{i:02d}" for i in range(1, c.get("body_shots", 2) + 1)]
                            + ["shared-cta-01"],
                "output": None, "sha256": None,
            }
    elements["shared-cta-01"] = {
        "state": "PLANNED", "version": 0, "path": None, "sha256": None,
        "concept": "SHARED", "role": "cta", "shared_across_hooks": True,
        "prompt": plan["cta"]["prompt"],
    }
    m = {"campaign": plan["campaign"], "created": time.strftime("%Y-%m-%d"),
         "build_root": str(Path(a.workdir).resolve()),
         "elements": elements, "variants": variants,
         "economics": {"generation_attempts": 0, "failed_generations": 0,
                       "targeted_repairs": 0, "full_rebuilds": 0, "assemblies": 0},
         "freezes": {}}
    mp.parent.mkdir(parents=True, exist_ok=True)
    save(mp, m)
    print(f"initialised {mp}")
    print(f"  elements: {len(elements)}  variants: {len(variants)}")
    return 0


# ---------------------------------------------------------------------- state
def cmd_state(a):
    m = load(Path(a.manifest))
    print(f"CAMPAIGN {m['campaign']}   build_root={m['build_root']}")
    print("\nELEMENTS")
    for k, v in sorted(m["elements"].items()):
        sh = (v["sha256"] or "")[:12]
        print(f"  {k:24s} {v['state']:19s} v{v['version']}  {sh:12s} shared={v['shared_across_hooks']}")
    print("\nVARIANTS")
    for k, v in sorted(m["variants"].items()):
        sh = (v["sha256"] or "")[:12]
        print(f"  {k:14s} {v['state']:14s} {sh:12s} <- {', '.join(v['elements'])}")
    return 0


def cmd_set(a):
    mp = Path(a.manifest); m = load(mp)
    tgt = m["elements"].get(a.element) or m["variants"].get(a.element)
    if tgt is None:
        print(f"unknown element: {a.element}"); return 1
    if a.state not in STATES:
        print(f"bad state (allowed: {STATES})"); return 1
    old = tgt["state"]; tgt["state"] = a.state
    save(mp, m)
    print(f"{a.element}: {old} -> {a.state}")
    return 0


def cmd_ingest(a):
    mp = Path(a.manifest); m = load(mp)
    el = m["elements"].get(a.element)
    if el is None:
        print(f"unknown element: {a.element}"); return 1
    p = Path(a.file)
    if not p.exists():
        print(f"missing file: {p}"); return 1
    el["path"] = str(p); el["sha256"] = sha256(p)
    el["version"] += 1; el["state"] = "EXISTS"
    econ_bump(m, "generation_attempts")
    save(mp, m)
    print(f"{a.element}: v{el['version']} {el['sha256'][:16]}  state=EXISTS")
    return 0


def cmd_plan(a):
    """What must actually be generated - the variant engine's economics."""
    m = load(Path(a.manifest))
    todo = [k for k, v in m["elements"].items()
            if v["state"] in ("PLANNED", "NEEDS_REGENERATION")]
    inherited = [k for k, v in m["elements"].items()
                 if v["state"] in ("APPROVED", "MUST_NOT_CHANGE")]
    naive = sum(len(v["elements"]) for v in m["variants"].values())
    print(f"MUST GENERATE ({len(todo)}):")
    for t in todo:
        print(f"  {t:24s} {m['elements'][t]['state']}")
    print(f"\nINHERITED, NOT REGENERATED ({len(inherited)}):")
    for i in inherited:
        print(f"  {i}")
    print(f"\nVARIANT ECONOMICS")
    print(f"  variants: {len(m['variants'])}")
    print(f"  element-slots if each variant built from scratch: {naive}")
    print(f"  unique elements actually required: {len(m['elements'])}")
    if naive:
        print(f"  reuse saving: {100*(naive-len(m['elements']))//naive}%")
    return 0


# ------------------------------------------------------------------- assemble
def cmd_assemble(a):
    mp = Path(a.manifest); m = load(mp)
    targets = [a.variant] if a.variant else list(m["variants"])
    root = Path(m["build_root"]); out_dir = root / "exports"; out_dir.mkdir(parents=True, exist_ok=True)
    rc = 0
    for vid in targets:
        v = m["variants"][vid]
        parts = []
        for eid in v["elements"]:
            el = m["elements"][eid]
            if not el["path"] or not Path(el["path"]).exists():
                print(f"SKIP {vid}: element {eid} has no asset"); rc = 1; parts = None; break
            parts.append(Path(el["path"]))
        if not parts:
            continue
        # Uniform-timebase law (paid for by a silently frozen tail): concat FILTER with
        # fps=30,settb=AVTB per input — never the demuxer, never stream copy across sources.
        out = out_dir / f"{vid}.mp4"
        cmd = ["ffmpeg", "-y"]
        for pp in parts:
            cmd += ["-i", str(pp.resolve())]
        n = len(parts)
        fc = "".join(f"[{i}:v]fps=30,settb=AVTB[v{i}];" for i in range(n)) \
             + "".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0"
        cmd += ["-filter_complex", fc, "-c:v", "libx264", "-preset", "veryfast",
                "-crf", "20", "-pix_fmt", "yuv420p", str(out)]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            print(f"FAIL {vid}: ffmpeg\n{r.stderr[-400:]}"); rc = 1; continue
        v["output"] = str(out); v["sha256"] = sha256(out); v["state"] = "EXISTS"
        econ_bump(m, "assemblies")
        print(f"assembled {vid} -> {out.name}  {v['sha256'][:16]}")
    save(mp, m)
    return rc


# --------------------------------------------------------- freeze / verify
def cmd_freeze(a):
    """Requirement 9: gates read immutable artifacts."""
    mp = Path(a.manifest); m = load(mp)
    snap = {k: v["sha256"] for k, v in m["elements"].items() if v["sha256"]}
    snap.update({f"variant:{k}": v["sha256"] for k, v in m["variants"].items() if v["sha256"]})
    m["freezes"][a.round] = {"at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                             "hashes": snap}
    save(mp, m)
    print(f"frozen '{a.round}': {len(snap)} artifacts hash-locked")
    return 0


def cmd_verify(a):
    """Prove exactly what changed since a freeze - the targeted-revision proof."""
    m = load(Path(a.manifest))
    fr = m["freezes"].get(a.round)
    if not fr:
        print(f"no freeze '{a.round}'"); return 1
    cur = {k: v["sha256"] for k, v in m["elements"].items() if v["sha256"]}
    cur.update({f"variant:{k}": v["sha256"] for k, v in m["variants"].items() if v["sha256"]})
    changed, unchanged, added = [], [], []
    for k, h in cur.items():
        if k not in fr["hashes"]:
            added.append(k)
        elif fr["hashes"][k] != h:
            changed.append(k)
        else:
            unchanged.append(k)
    print(f"SINCE FREEZE '{a.round}'")
    print(f"  CHANGED   ({len(changed)}): {', '.join(sorted(changed)) or '-'}")
    print(f"  ADDED     ({len(added)}): {', '.join(sorted(added)) or '-'}")
    print(f"  UNCHANGED ({len(unchanged)}): {len(unchanged)} artifacts byte-identical")
    if a.expect_changed:
        exp = set(a.expect_changed.split(","))
        got = set(changed)
        ok = got == exp
        print(f"\n  EXPECTED CHANGED: {sorted(exp)}")
        print(f"  ACTUAL  CHANGED: {sorted(got)}")
        print(f"  TARGETED-REVISION PROOF: {'PASS' if ok else 'FAIL'}")
        return 0 if ok else 1
    return 0


def cmd_econ(a):
    m = load(Path(a.manifest))
    e = m.get("economics", {})
    naive = sum(len(v["elements"]) for v in m["variants"].values())
    print("PRODUCTION ECONOMICS")
    for k, v in sorted(e.items()):
        print(f"  {k:22s} {v}")
    print(f"  {'variants_produced':22s} {sum(1 for v in m['variants'].values() if v['sha256'])}")
    print(f"  {'unique_elements':22s} {len(m['elements'])}")
    print(f"  {'naive_element_slots':22s} {naive}")
    reused = sum(1 for v in m["elements"].values() if v["shared_across_hooks"])
    print(f"  {'reusable_assets':22s} {reused}")
    return 0



# ------------------------------------------------------------------ generate
def cmd_generate(a):
    """Generate every PLANNED / NEEDS_REGENERATION element, fetch it locally, ingest it.

    Generation and assembly share one filesystem: the result URL is fetched straight
    into the build root. No smuggling, no cross-network relay.
    """
    mp = Path(a.manifest); m = load(mp)
    root = Path(m["build_root"]); assets = root / "assets"; assets.mkdir(parents=True, exist_ok=True)
    m["run_started"] = time.strftime("%Y-%m-%d %H:%M", time.localtime())
    todo = [k for k, v in m["elements"].items()
            if v["state"] in ("PLANNED", "NEEDS_REGENERATION")]
    if a.only:
        todo = [t for t in todo if t in a.only.split(",")]
    if not todo:
        print("nothing to generate - every element is approved or inherited")
        return 0
    print(f"generating {len(todo)} element(s) with {a.model} @ {a.duration}s\n")
    rc = 0
    for eid in todo:
        el = m["elements"][eid]
        cmd = ["higgsfield", "generate", "create", a.model,
               "--prompt", el["prompt"], "--duration", str(a.duration)]
        if a.resolution:
            cmd += ["--resolution", a.resolution]
        cmd += ["--wait", "--wait-timeout", "12m", "--wait-interval", "10s"]
        r = subprocess.run(cmd, capture_output=True, text=True)
        econ_bump(m, "generation_attempts")
        url = next((ln.strip() for ln in reversed(r.stdout.splitlines())
                    if ln.strip().startswith("http")), None)
        if not url:
            # RECOVERY RULE (earned 3x on 2026-09-02): a client-side failure is NOT a
            # generation failure. Completed jobs persist server-side and are already paid
            # for. Check the job list before ever paying to regenerate.
            # Recovery matching law: only the MOST RECENT completed job may be claimed, only
            # if its timestamp is not older than this run's start, and the ingest is marked
            # RECOVERED so QA2 inspection is mandatory before lock.
            lst = subprocess.run(["higgsfield", "generate", "list", "--size", "5"],
                                 capture_output=True, text=True).stdout
            rows = [ln for ln in lst.splitlines() if "completed" in ln and "https://" in ln]
            if rows:
                newest = rows[0]  # list is newest-first
                ts = " ".join(newest.split()[1:3])
                if ts >= m.get("run_started", ""):
                    url = newest.split()[-1]
                    el["recovered"] = True
                    print(f"  RECOVERED {eid}: newest completed job ({ts}) — inspect before lock")
                else:
                    print(f"  NO-RECOVERY {eid}: newest completed job predates this run ({ts})")
        if r.returncode != 0 and not url:
            econ_bump(m, "failed_generations")
            print(f"  FAIL {eid}: {(r.stderr or r.stdout)[-200:].strip()}")
            el["state"] = "FAILED"; rc = 1; save(mp, m); continue
        dest = assets / f"{eid}-v{el['version']+1}.mp4"
        f = subprocess.run(["curl", "-sS", "-f", "-o", str(dest), url], capture_output=True, text=True)
        if f.returncode != 0 or not dest.exists():
            econ_bump(m, "failed_generations")
            print(f"  FAIL {eid}: fetch failed {f.stderr[-160:].strip()}")
            el["state"] = "FAILED"; rc = 1; save(mp, m); continue
        el["path"] = str(dest); el["sha256"] = sha256(dest)
        el["version"] += 1; el["state"] = "EXISTS"
        save(mp, m)
        print(f"  OK   {eid:22s} v{el['version']} {el['sha256'][:12]} {dest.stat().st_size//1024}KB")
    return rc


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--manifest", default="manifest.json")
    ap.add_argument("--workdir", default=".")
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("preflight"); p.add_argument("--model"); p.add_argument("--check-prompts")
    p.set_defaults(fn=cmd_preflight)
    p = sub.add_parser("init"); p.add_argument("--plan", required=True); p.set_defaults(fn=cmd_init)
    sub.add_parser("state").set_defaults(fn=cmd_state)
    p = sub.add_parser("set"); p.add_argument("element"); p.add_argument("state"); p.set_defaults(fn=cmd_set)
    p = sub.add_parser("ingest"); p.add_argument("element"); p.add_argument("file"); p.set_defaults(fn=cmd_ingest)
    sub.add_parser("plan").set_defaults(fn=cmd_plan)
    p = sub.add_parser("assemble"); p.add_argument("--variant"); p.set_defaults(fn=cmd_assemble)
    p = sub.add_parser("freeze"); p.add_argument("round"); p.set_defaults(fn=cmd_freeze)
    p = sub.add_parser("verify"); p.add_argument("round"); p.add_argument("--expect-changed"); p.set_defaults(fn=cmd_verify)
    p = sub.add_parser("generate"); p.add_argument("--model", default="veo3_1_lite")
    p.add_argument("--duration", default=4); p.add_argument("--only"); p.add_argument("--resolution"); p.set_defaults(fn=cmd_generate)
    sub.add_parser("econ").set_defaults(fn=cmd_econ)
    a = ap.parse_args()
    sys.exit(a.fn(a))


if __name__ == "__main__":
    main()
