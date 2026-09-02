# ROLES — active doctrine names roles, never people
The validator enforces that active skills and policies contain no personal names in workflow
ownership. A person is mapped to roles per engagement, outside doctrine (client KB / project
config).

| Role | Owns |
|---|---|
| **OPERATOR** | Runs the work: research, drafting, generation execution, QC runs, assembly. |
| **APPROVER** | Campaign judgment gates: strategy approval, concept approval, storyboard approval, CONDITIONAL-verdict acceptance, high-risk acceptances (e.g. NO REFERENCE FOUND), final readiness sign-off. Also the outbound execution gate (BC-35): signs the approval packet before any send, dial, DM, bulk upload, activation or outreach-initiating API write, and signs Service Pow's own Evidence Records. |
| **SPEND_APPROVER** | The two-step spend gate in `policies/generation-and-spend.md`: sees plan + expected cost, authorizes generation spend. Outbound spend takes the same gate: list purchase, paid enrichment, and paid sending infrastructure. |
| **CLIENT_APPROVER** | Client-side confirmations: claim substantiation (Evidence Records), rights/consent confirmations, client sign-off on deliverables. |

Roles may be held by the same person; the doctrine doesn't care. Gates bind to the ROLE.

**Never-stall rule:** production never stalls silently at a role gate — park the work with a
status header stating exactly what is awaited, prepare the recommendation and options so the
role-holder's return costs one decision, and move to other work. No gate is ever skipped
because a role-holder was away.
