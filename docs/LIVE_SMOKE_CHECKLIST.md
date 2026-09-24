# Parrot v0.8.7 live browser smoke checklist

This gate requires a real Chromium/Chrome instance with the exact candidate `extension/` loaded unpacked. Static CI/source inspection/mocks/Actions do not satisfy it.

## Evidence rules
For every case record browser version, exact extension commit SHA, target ChatGPT URL/worker label, UTC timestamp, PASS/FAIL, and structural evidence observed. Never copy/persist assistant/user prose as evidence. Use harmless bounded prompts. Do not manufacture rate limits or duplicate real messages.

## S1 — unpacked load / control plane
PASS only if extension loads without manifest/service-worker/content-script errors, popup/dashboard open, and a real `https://chatgpt.com/*` tab is structurally visible.

## S2 — exact target + dashboard control
Register at least two different open ChatGPT conversations. Keep Dashboard active. From Dashboard Start worker A without activating A's ChatGPT tab; verify only exact normalized A target runs. Stop A from Dashboard and verify storage/content reconciliation fences it. Start B separately and verify no first-tab fallback/cross-target send. Closed target must not offer/send Start and must never route elsewhere.

## S3 — composer + strong receipt
Send one harmless prompt. PASS only if real composer/send control is used and delivery is accepted only after user-message count increases or assistant generation starts. Composer change/clear alone is not receipt.

## S4 — response mode + configured delay
Use bounded target (`maxRepeats=2`). PASS only if onboarding/completion composition occurs as configured, first automatic response send respects configured initial delay, next send waits for generation finish plus configured delay, exactly two sends are strongly receipted, then max-repeat stops. `sendImmediately=false` must not auto-arm on reload/storage reconciliation.

## S5 — interval mode
Use short safe interval and `maxRepeats=2`. PASS only if sends occur no earlier than interval eligibility, strong receipts are required, duplicate start attempts do not duplicate sends, and max-repeat stops target.

## S6 — reload recovery / single-runner fence
While one response target is running, reload its ChatGPT page; repeat once with interval mode. PASS only if exactly one effective runner resumes for the exact URL. Trigger a legitimate response↔interval mode change and verify old runner is fenced and no duplicate send occurs. Pause/stop/delete then reload; none may resurrect a runner.

## S7 — COMPLETE
Use current runId COMPLETE URL. PASS only if structural `parrot.invalid/complete/<runId>` anchor is discovered once, matching target becomes completed, duplicate observation is deduped, and partial/non-COMPLETE work does not create completion state.

## S8 — WAKE / MESSAGE routing
With two targets, emit one WAKE and one MESSAGE using unique event IDs. PASS only if each becomes one pending route, resolves intended target, gets strong receipt, and becomes delivered once. MESSAGE may retain explicit ref identifier/URL but never scrape surrounding prose.

## S9 — ambiguity fence + Dashboard actions
In a controlled non-destructive naturally occurring case where send was attempted but strong receipt cannot be confirmed, PASS only if route becomes ambiguous, durable ambiguity receipt exists before notification, automatic redelivery stops, and Dashboard Retry/Resolve are explicit continuation actions. Do not intentionally duplicate a real message to force this case. If safe ambiguity cannot be observed, record NOT_OBSERVED and keep this release criterion open.

## S10 — structural cooldown
Only when genuine rate-limit/transient structural error naturally occurs. PASS only if classification comes from structural attributes/selectors, persisted target state contains structural cooldown metadata, sends are gated until due, Dashboard displays actionable cooldown timing, and later confirmed success resets cooldown. If absent, record NOT_OBSERVED and document selector validity as unverified.

## S11 — fleet viewport / action feedback
Use enough registered workers to exercise search/filter and at least two pages (10/page is sufficient). PASS only if search/filter/pagination remain usable, Attention surfaces structural error/cooldown/discarded/frozen states, Start/Stop/Retry/Resolve feedback is visibly rendered, popup opens without unintended default vertical scrolling at normal extension-popup viewport, and advanced editors appear as overlays rather than expanding/clipping the default form.

## Release decision
Browser gate PASS requires S1–S8 and S11 PASS. S9 ambiguity and S10 cooldown may be NOT_OBSERVED only when they cannot be safely/naturally produced; each NOT_OBSERVED item remains an explicit release limitation rather than being silently treated as PASS. Any observed FAIL reopens the affected earlier milestone. Final release ZIP is produced only after browser decision is recorded against exact candidate SHA; the M5 candidate artifact remains NON-RELEASE.
