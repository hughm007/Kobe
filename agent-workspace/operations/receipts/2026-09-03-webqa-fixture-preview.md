DEPLOYMENT RECEIPT
kind:            preview
deployment_id:   dpl_3t7cabnv4FzkxwNi5ZADinkToMBU
url:             https://servicepow-webqa-fixture-dgnaoyp0l-karlmaliks-projects.vercel.app
project/team:    servicepow-webqa-fixture / karlmaliks-projects (team_yHNWG8PHWgZ40mHIpLuUfo2L, Pro)
source:          canonical tests/fixtures/web/good file set (4 files), deployed via Vercel MCP
state:           SERVING — HTTP 302 to vercel.com/sso-api (Deployment Protection ON team-wide)
gates_run:       BC-45/BC-49 static battery executed against the IDENTICAL local file set
                 (WEB-QC PASS 24/0) — remote-URL execution blocked by protection; per
                 deployment-receipts doctrine the gate ran on the identical source, not skipped
runtime_probe:   UNKNOWN — get_deployment returns 404 for this id (MCP read-back limitation,
                 recorded below); URL liveness verified by direct HTTP probe (302 + SSO cookie)
approval:        n/a (preview)
LIMITATIONS RECORDED:
 - Team-wide Deployment Protection SSO-gates all preview URLs (302 observed twice).
 - Vercel MCP get_access_to_vercel_url + web_fetch_vercel_url both refused ("Unable to
   create shareable URL"); get_deployment 404s on a live deployment id. Authenticated
   remote QA therefore unavailable through the connector this session — local-identical
   fallback used. Owner-side options: protection bypass token, or per-project protection
   settings (a config change = owner territory, not taken unilaterally).
