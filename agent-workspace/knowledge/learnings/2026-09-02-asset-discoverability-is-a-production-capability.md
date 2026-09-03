---
title: "Asset does not exist != asset cannot be discovered — discoverability is a production capability"
type: learning
client: internal
owner: APPROVER
status: active
created: 2026-09-02
updated: 2026-09-02
tags: [assets, architecture, client-kb, doctrine]
---

# Two different failures that look identical from inside the pipeline

**ASSET DOES NOT EXIST** — there is no real logo, no van photo, no footage. The correct
response is to ask the client for it, or design creative that does not require it.

**ASSET EXISTS BUT THE PRODUCTION SYSTEM CANNOT DISCOVER IT** — the file is real and
available, and the pipeline cannot see it. The correct response is to fix the register.

From inside the pipeline these are indistinguishable: both present as "no asset found."
They demand opposite responses. Conflating them is how a production system ends up
**generating a fake van while the client's real van sits one repository away** — which is
exactly what happened on 911 Drain, and which LB24 forbids outright.

## The rule
**For Service Pow, asset discoverability is itself a production capability, not bookkeeping.**
Before any concept is written, the system must answer: *what real material already exists
that should appear in this ad?* That question is mandatory, and "nothing found in the client
KB" is never an acceptable answer on its own — absence in the register is evidence about the
register, not about the world.

A client asset register is therefore part of the production system, not part of the filing.
