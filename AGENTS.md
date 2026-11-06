# Parrot rewrite — agent entry point


**Required systems-engineering contract:** Read [Outcome-Driven, Invariant-Based Engineering](https://github.com/amzsdq/PCBridge/blob/main/docs/OUTCOME_DRIVEN_INVARIANT_ENGINEERING_CONTRACT.md) before coding, debugging, release or successor handoff. Map the operator's end-to-end outcome and dependency/authority interfaces; fix the governing primitive, test positive and negative invariants, and verify installed behavior. No single-file/UI symptom fix constitutes completion. This grants no new permission and does not override product-specific STOP/HARDLOCK/release requirements.

## Mandatory deployment pre-read (2026-11-06)

Before **any** candidate build, release-ready publication, browser installation, retry after a safety/tool error, permission request, or handoff, read the [PCBridge cross-workstream deployment method router](https://github.com/amzsdq/PCBridge/blob/main/docs/DEPLOYMENT_METHOD_ROUTER.md), this repository's [release/runbook](docs/RELEASE_PROCESS.md), [README](README.md), and [live smoke checklist](docs/LIVE_SMOKE_CHECKLIST.md). The separate `amzsdq/PCB-Parrot` M7/M8 Native updater is NOT the same product/version/install. This repository's M6/M7 source and `.ready` artifacts are not a deployed Chrome extension; require real authenticated browser load proof and owner-safe evidence before claiming release. The release scripts load their source-local runbook via a fail-closed guard; no guard can prove an AI comprehended the file. Diagnose invalid tool method separately from prohibited side effects; use independently approved first-party primitives without bypassing STOP, account security, scoped consent, or host controls. Never fabricate a live ChatGPT ACK.

