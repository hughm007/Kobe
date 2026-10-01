# Repository inspection (Phase 0)

| | |
|---|---|
| **Repository** | `hughm007/Kobe` (GitHub), working branch `claude/beautiful-planck-liwqwy` |
| **Baseline inspected** | Commit `b06db29` (2026-09-06), the last commit before any golf work |
| **Report written** | 2026-10-01; facts re-checked with `git ls-tree`, `git log`, `git show --name-only`, `ls`, tool version commands and network probes from the build sandbox |
| **Scope** | What the repository contained, what could be reused, how the golf product was placed, and the risks |

## 1. Summary

- **The repository is unrelated to golf.** Kobe is the workspace of the "Service Pow" marketing
  agency: a markdown "office", agent skills and a Python voice assistant. It had no golf
  code, no TypeScript project and no CI.
- **Decision.** The golf product was built as a self-contained subtree, `golf-launch-monitor/`.
  No existing file was modified. The only addition outside the subtree is a path-filtered CI
  workflow, `.github/workflows/golf-launch-monitor.yml`.
- **Recommendation.** Extract `golf-launch-monitor/` into its own repository (§7).

## 2. What the repository contained at `b06db29`

There were 885 tracked files and 50 commits.

| Path | Tracked files | Content |
|---|---|---|
| `.claude/` | 412 | Agent skills: the Service Pow advertising skills plus vendored third-party skills (e.g. `vercel-optimize`, Twilio compliance, ads audit), and the Service Pow "LAW" (`.claude/skills/_servicepow/LAW.md`). |
| `agent-workspace/` | 401 | The agency's markdown office: company records, playbooks, client folders, archive, and its own `CLAUDE.md`. |
| `orion/` | 68 | "Orion", a Python (≥ 3.11) voice-first assistant for the agency: `pyproject.toml`, `uv.lock`, `src/`, `tests/`. |
| `AGENT.md`, `CLAUDE.md`, `README.md`, `.gitignore` | 4 | Orion's specification. `CLAUDE.md` imports the Service Pow LAW. `README.md` points to `agent-workspace/`. |

What was looked for and not found:

| Looked for | Result |
|---|---|
| A TypeScript or JavaScript project (`package.json`, `tsconfig.json`) | **None.** The only `.ts` files were a Playwright spec template and a `.d.ts` type stub inside vendored agent skills. The only JavaScript was 89 `.mjs` files in the vendored `vercel-optimize` skill. |
| Golf, ball-flight, sensor, camera or vision code | None |
| CI (`.github/`) | Absent |
| Datasets, calibration files, hardware configuration | None |

## 3. Toolchain and network in the build sandbox

| Item | Found |
|---|---|
| Node.js | v22.22.0 |
| npm | 10.9.4 |
| Python | 3.11.15 |
| npm registry | Reachable |
| PyPI | Reachable |
| GitHub release-asset downloads | Blocked by the egress proxy during Phase 0. A re-check on 2026-10-01 while writing this report succeeded, so availability varies; re-test before depending on it. |
| General web hosts (search engines, publishers, universities, patent databases) | Refused by the egress proxy. All literature work therefore rests on search snippets: every source is labelled *secondary source, not verified on page* (see [physics-model.md](physics-model.md) §11 and [terrain-model.md](terrain-model.md) §10). |
| GitHub Actions log download | Refused. CI step results are visible through `gh run view`; logs are not. |

## 4. Reusable components

**None for the golf domain.**

| Candidate | Why it was not reused |
|---|---|
| `orion/` (Python) | A voice assistant for the agency. It has no numerics, sensor handling or graphics, and it is the wrong runtime for a browser UI. |
| `.claude/skills/*` | Agency workflows (advertising, SEO, outbound). The `frontend-design` skill gives UI-design guidance only; it contains no reusable code. |
| Repository tooling | There was no lint, test or build configuration to inherit. |

## 5. How the golf product was placed

- **Self-contained subtree.** `golf-launch-monitor/` carries its own `package.json` (npm
  workspaces), `package-lock.json`, TypeScript and Vitest configuration, `.gitignore`, `docs/`,
  `datasets/`, `scripts/` and `tests/`.
- **No existing files touched.** `git show --name-only` on every golf commit lists only
  `golf-launch-monitor/**` and the workflow file. The workflow was added in `88e7e33` and
  edited in `212a27a`.
- **CI workflow.** It runs only for changes to `golf-launch-monitor/**` or to itself, with
  `permissions: contents: read`. Steps: `npm ci`, typecheck, tests, JSON-Schema freshness, and
  the desktop UI build.

## 6. CI status at the time of writing

Every run of the workflow on this branch has failed so far:

| Run | Commit | Result |
|---|---|---|
| `36918142050` (latest) | `212a27a` | `npm ci`, typecheck, tests and schema check **passed**. **Build desktop UI failed.** Reproduced locally on the committed tree: npm reports `No workspaces found: --workspace=@glm/desktop-ui`, because `apps/desktop-ui` was not yet committed. `--if-present` does not cover a missing workspace. |
| `36917710201` | `e856cd6` | Tests failed: the golden test exceeded Vitest's 5 s default timeout on the runner. Fixed in `212a27a` (`testTimeout: 120_000`). |
| Four earlier runs | `88e7e33`, `a745ea1`, `fe2a3f7`, `7106d1f` | Typecheck failed. These commits did not yet contain every package (`88e7e33` says so in its message); the cause was not investigated further. |

Re-check with `gh run list --workflow golf-launch-monitor.yml` before relying on this table.

## 7. Risks and unknowns

| Risk / unknown | Impact | Mitigation |
|---|---|---|
| **Unrelated host repository** | Every agent session started in Kobe loads `CLAUDE.md`, which imports the Service Pow LAW: ad-agency routing rules, spend gates and skill listings that have nothing to do with golf. Golf history is interleaved with agency commits. Repository access, secrets and CI permissions are shared between an agency's client material and an engineering product. The parent `.gitignore` also applies repo-wide; for example it ignores `*.wav`, `*.mp3` and `*.flac`, so recorded microphone-trigger audio would be silently ignored anywhere in the subtree. | **Extract the subtree** (below). |
| No hardware | Nothing measured exists. Camera, radar and hybrid adapters are stubs that throw `HardwareNotAvailableError`; capture, calibration and vision are Planned (Phase 2) — not implemented. | Phase 1 runs only on synthetic, replay and developer manual data, each labelled as such. |
| Physics coefficients are provisional | Aerodynamic coefficients are not fit to data; the plausibility envelope is circular. Ground parameters are judgements, and total distance is model-dependent; the ground model is being upgraded at the time of writing. | Versioned models, applicability warnings, confidence caps; see [physics-model.md](physics-model.md) and [terrain-model.md](terrain-model.md). |
| No reference-monitor data | Nothing can be VERIFIED. No accuracy statement is possible. | `@glm/validation` is ready for paired data ([../datasets/reference-measurements/README.md](../datasets/reference-measurements/README.md)). |
| Literature unverified | Every cited figure is a secondary source, not verified on page. | Labelled in the model docs; re-check against primary sources when access allows. |
| Sandbox network policy varies | Downloads that work today may be blocked tomorrow, and vice versa. | Stay on npm-only dependencies; commit the lockfile. |

### Extracting the subtree

Why: an own repository gets its own agent instructions (no agency LAW), clean history,
separate access control and secrets, and a root-level CI workflow without path filters.

```bash
# Option A: git subtree (keeps golf history, rewrites paths to the repository root)
git subtree split --prefix=golf-launch-monitor -b golf-launch-monitor-only
git push <new-remote> golf-launch-monitor-only:main

# Option B: git filter-repo, in a fresh clone (requires the git-filter-repo tool)
git clone <kobe-url> glm && cd glm
git filter-repo --subdirectory-filter golf-launch-monitor
```

Afterwards, in the new repository:

- Recreate `.github/workflows/` at the new root. The workflow lives outside the prefix and is
  not carried over; drop `working-directory` and the path filters.
- Add a project `CLAUDE.md` or `AGENTS.md` if agent instructions are wanted.
- Remove the subtree from Kobe once the new repository is the source of truth.
