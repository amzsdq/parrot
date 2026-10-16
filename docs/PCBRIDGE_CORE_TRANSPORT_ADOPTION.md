# Parrot as a PCBridge transport module — acceptance plan

**Status: PILOT / NOT RELEASED.** Parrot v0.8.7 is a non-release candidate. This document does not modify the M5 candidate extension bytes, declare M6 complete, alter installed Chrome extensions or enable automatic messages.

**Current superseding timing (2026-10-16):** 10-minute upper turn goal, checkpoint preparation at ~8 minutes, wrap at ~9 minutes, no additional 1–3-minute rest. The existing production mounted relay uses a 10-second settle/handoff; do not replace this with a two-minute delayed client sender. This is **source/policy only** for Parrot; M6 authenticated Chrome smoke, source-to-native wiring, and runtime promotion are still OPEN. Historical 15-minute guidance below is superseded.\n\n
## Role division

- **PCBridge Core:** canonical run, operator Stop, user permission/approval, one owner/generation, work-unit configured 10-minute bound, durable Git checkpoint, outbox and incoming receipt reconciliation.
- **Parrot:** *one* exact-conversation Chrome transport adapter. It may observe generating/error/completion structurally and submit a single previously authorized Core outbox message; it must never autonomously invent/repeat work or run arbitrary text commands.
- **PCBridge Web:** monitoring and optional fallback transport. When Parrot is the live writer, PCBridge Web must be explicitly fenced against sending for that same run/generation.
- **PCBridge Chrome Companion:** keep exact-tab auth/pairing and DOM observation components, but avoid running a second sender to the same conversation. Reuse modules rather than install two nearly identical background producers.

## Work-cycle target

A useful-work target of 10 minutes per bounded turn with checkpoint preparation around 8m, wrap by 9m, and a verified handoff by 10m; no additional cooldown between turns. Work-unit elapsed time is not automatically effective work. A real Stop/authorization failure/outage may end earlier; no padding. Schedulers must anchor the successor to the end of the actual unit plus the cooldown, not add another 15-minute delay after 15 minutes of work.

## Real-browser promotion gates

1. **M6 before release:** execute existing `docs/LIVE_SMOKE_CHECKLIST.md` with an authenticated real ChatGPT session and the exact M5 candidate; evidence must be structural and sanitized, not screenshot/cookie/password capture. No Cloudflare unauthenticated screen may pass.
2. **Identity and one-sender fence:** imported PCBridge run/generation and exact conversation; a durable Core owner lease, message ID and deduplicated receipt. Zero sends from competing mounted Web/companion adapters.
3. **10-minute no-gap handoff:** genuine observed 10m work boundary, durable checkpoint and single successor after the existing 10-second transport settle. Long generation, stream disconnect, manual user Stop and browser restart must not cause duplicate work.
4. **Delivery evidence:** real sent-user DOM receipt and next assistant turn, repeated for 10 distinct sequences, with exact recipient validated each time.
5. **Ambiguous results:** same-message reconciliation first; unauthorized/unknown destination fails closed. Never retry with a new ID to escape uncertainty.
6. **Native safety:** no profile cookie exports, no browser auth DOM/secret access, no Chrome extension enterprise policy bypass, no unmanaged foreground takeover, no new persistent schedules per attempt.
7. **Rollback:** after accepted Parrot pilot, disable Parrot's sender before restoring the existing verified mounted sender; keep Git revision and state receipt audit. If M6 fails, leave Parrot NON-RELEASE and keep the mounted sender active.

## Existing protocol compatibility

`https://parrot.invalid/` is a **synthetic signal namespace, not a network execution service**. Retain existing COMPLETE/WAKE/MESSAGE semantics. Future bounded run-completion/command-reference messages must be tied to an exact Core-signed or authorized command envelope. A discovered URL alone never authorizes code or PowerShell execution.

## PCBridge reference

See `amzsdq/PCBridge` `docs/CONTINUATION_RELAY_PARROT_PLAN.md` for the prioritized P0–P5 adoption roadmap, decision rationale and 10-minute no-gap policy. Source-only `scripts/relay-single-sender-policy.cjs` enforces fail-closed candidate selection, not Chrome runtime installation.

This note is an independent integration candidate plan, not a modification of `docs/MILESTONES.md` M6 acceptance.
