# Parrot rewrite agent startup

## Mandatory objective-vs-method safety decision protocol (2026-11-07)

**Working method:** Read the [common failure-recovery protocol](https://github.com/amzsdq/PCBridge/blob/main/docs/SAFE_TOOL_FAILURE_RECOVERY.md); diagnose the actual tool failure, keep the authorized goal in scope, choose a documented and independently executable implementation, and verify the installed browser result. Record the chosen method, outcome and next milestone. Evaluate ordinary owner/STOP, consent and scope checks before action.



**Required engineering contract:** Read [Outcome-Driven, Invariant-Based Engineering](https://github.com/amzsdq/PCBridge/blob/main/docs/OUTCOME_DRIVEN_INVARIANT_ENGINEERING_CONTRACT.md) before coding, diagnosis, release or handoff. Map user outcome through policy/authority/state/receipts, fix root primitives and verify positive/negative tests and real deployed behavior. This confers no new permission.

Read [AGENTS.md](AGENTS.md) and [docs/RELEASE_PROCESS.md](docs/RELEASE_PROCESS.md) before any candidate build, release, installation, retry or handoff. Read the [cross-project release method router](https://github.com/amzsdq/PCBridge/blob/main/docs/DEPLOYMENT_METHOD_ROUTER.md) to distinguish this rewrite from PCB-Parrot M7/M8. Release scripts require a source-local runbook read; no source-only build proves browser installation, authenticated send, ACK or Chrome live smoke.
