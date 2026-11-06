# Parrot rewrite release procedure — mandatory pre-read

**For `amzsdq/parrot` ONLY**, not `amzsdq/PCB-Parrot` M7/M8. Every release-producing worker reads the [cross-project method router](https://github.com/amzsdq/PCBridge/blob/main/docs/DEPLOYMENT_METHOD_ROUTER.md), [AGENTS.md](../AGENTS.md), [README](../README.md), [LIVE_SMOKE_CHECKLIST.md](LIVE_SMOKE_CHECKLIST.md), and this file **before** running release/build/publish scripts. The scripts' document gate reads these files in the source snapshot and fails closed if they are missing; it is a machine check, not a human comprehension or permission grant.

## Provenance and release gates

1. Identify exact repository, candidate source commit, current release build source and expected version; verify a clean working tree and frozen, signed source identity. M6 Chromium + **authenticated ChatGPT** acceptance is independent of CI/static checks.
2. `scripts/build-final-release.sh` must first verify the source-local runbook contract; then run the existing candidate identity, immutable snapshot, live evidence, limitations, archive and provenance checks in their current order. Do **not** skip or weaken any existing release gate. Existing exact-pinned candidate IDs in this repo are historical and must not be treated as the latest deployed version.
3. `scripts/publish-release-ready.sh` must re-read the same release runbook before writing `.ready`. The resulting release ZIP, hashes, provenance, and live evidence digest must be consistent, with the release-ready marker **last**.
4. A release-ready marker is **not** Chrome installed status. If installing the unpacked Chrome extension, require exact user-approved scope, actual Manifest V3 Chrome state, loaded version and authenticated browser smoke; note that M7/M8 `PCB-Parrot` Native host rollout/seq protocol does not apply here. Do not infer a ChatGPT message send/ACK merely from loading.
5. Preserve STOP, any existing relay ownership and unconfirmed send ledger; never duplicate an ambiguous send, override host focus, or treat an extension reload as a deliberate START. Keep independent recoverable old material and exact rollback plan where applicable.

## Tool failures

An invalid CLI argument, missing tool/API, wrong permission surface or version-bound adapter is a **method failure**, not a prohibition on the entire requested goal. Inspect official schema, permissions, current artifact/receipt and a safer documented first-party method; verify after each attempt. An explicit platform refusal of the **effect itself** is not authorization to execute the same prohibited effect through a shell, connector rename, encoded payload or another account. `pending`/`timeout` means **unknown**, not failure: reconcile exact prior receipt before a retry. Prefer saved Grade2/3 permissions for genuinely matching tasks; keep Grade1 HARDLOCK, STOP, expiry, worker and user/host authorization.

## Acceptance record

Separate **Git source**, **build**, **candidate archive**, **release-ready marker**, **installed Chrome**, **authenticated ChatGPT send**, **provider ACK**, **owner Stop state** and **rollback**. A source-only compile, CI PASS or local `.ready` marker is not a complete release.

To avoid creating another independent runbook, keep detailed M6/M7 build and smoke mechanics in existing scripts, README and smoke checklist. This document is the required source-local *method and scope entrypoint*, not a replacement implementation.
