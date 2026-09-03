# POLICY — BASELINE AND REGRESSION
Always-on company law. Owner of the durable-truth and no-silent-regression rules for the
entire Service Pow AI OS. Skills reference this file; they do not restate it.
Ratified by the owner 2026-09-03.

## 1. The workspace is the durable source of truth
Conversation memory is never sufficient. If a production rule, workflow improvement, failure
lesson, routing decision, QA standard, intake rule, connector finding, model limitation,
successful prompt pattern, or owner decision matters to future production, it is written
into the appropriate canonical file or the deployment workspace's evidence records — at the
time it is learned, not later. A completely fresh session with no conversation history must
be able to reconstruct the system, its proven capabilities, its failures, its limitations,
and its current verified baseline from disk alone. The fresh-session simulations in
`tests/fresh-session/` are the standing proof of this property and the template for testing
it after changes.

## 2. The no-silent-regression law
The current baseline is the minimum verified capability floor. Any change — skill edit,
connector, model change, workflow change, prompt architecture, optimization — may replace a
proven part of the system only when evidence shows the replacement preserves or improves
the relevant capabilities. The sequence is mandatory:

BASELINE → isolated change → regression test → evidence → approve/reject → canonical

If regression testing shows deterioration: the change is NOT canonicalized. Either
FIX → RETEST, or ROLL BACK to the baseline tag. The previous known-good implementation is
never destroyed because a newer approach looks promising. **The capability floor moves
upward, never silently down** — a deliberate trade-down requires the owner's explicit,
recorded approval.

## 3. Baseline progression
BASELINE V1 → proven improvement → BASELINE V2 → … Each baseline is a git tag across the
canonical repo and its deployments, registered in `data/baselines.md` with its verification
procedure and restore procedure. Failed experiments remain on record as evidence (they are
cheap insurance against re-running them); they never replace working doctrine.

## 4. Connector governance
Connectors augment the system; they never redesign it. Each connector carries a ledger
state — UNTESTED → TESTING → PROVISIONAL → PROVEN / REJECTED — recorded in the deployment
workspace's connector register with dated evidence. One successful test is a PROVISIONAL
entry, not doctrine. A connector that improves one capability while degrading another
fails its regression test by definition.
