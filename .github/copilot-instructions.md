# Mandatory cross-project release pre-read


**Required systems-engineering contract:** Read [Outcome-Driven, Invariant-Based Engineering](https://github.com/amzsdq/PCBridge/blob/main/docs/OUTCOME_DRIVEN_INVARIANT_ENGINEERING_CONTRACT.md) before coding, debugging, release or successor handoff. Map the operator's end-to-end outcome and dependency/authority interfaces; fix the governing primitive, test positive and negative invariants, and verify installed behavior. No single-file/UI symptom fix constitutes completion. This grants no new permission and does not override product-specific STOP/HARDLOCK/release requirements.

Before any release build, install, publication, retry, rollback, approval request or handoff, read [the common release method router](https://github.com/amzsdq/PCBridge/blob/main/docs/DEPLOYMENT_METHOD_ROUTER.md) **in full**, then this repository's `AGENTS.md` and product-specific deployment runbook. Existing Git source does not prove installed bytes, Chrome load, user approval or real send/ACK. Diagnose tool/schema failures separately from prohibited effects; preserve STOP, scoped owner/lease, HARDLOCK and independent rollback. This pointer grants no new privileges.

Read [AGENTS.md](AGENTS.md), [docs/RELEASE_PROCESS.md](docs/RELEASE_PROCESS.md) and [docs/LIVE_SMOKE_CHECKLIST.md](docs/LIVE_SMOKE_CHECKLIST.md). Do not confuse this rewrite with PCB-Parrot M7/M8.
