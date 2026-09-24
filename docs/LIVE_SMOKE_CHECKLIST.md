# Parrot v0.8.7 live browser smoke checklist

This gate requires a real Chromium/Chrome instance with the repository `extension/` loaded unpacked. Static CI, source inspection, mocks, and GitHub Actions do not satisfy it.

## Evidence rules

For every case record: browser version, extension commit SHA, target ChatGPT URL/worker label, UTC timestamp, PASS/FAIL, and the structural evidence observed. Do not copy or persist assistant/user message prose as evidence.

## S1 — unpacked load / control plane

PASS only if `extension/` loads without manifest/service-worker/content-script errors, popup opens, dashboard opens, and a real `https://chatgpt.com/*` tab is structurally visible to the extension.

## S2 — exact target resolution

Create/select a target for one open ChatGPT conversation. PASS only if Start resolves that exact normalized conversation URL and does not silently choose a different ChatGPT tab. Closed-target behavior must report `target_tab_not_open` rather than sending elsewhere.

## S3 — composer + strong receipt

Send one harmless prompt. PASS only if Parrot fills the real composer, invokes the real send control, and delivery is accepted only after user-message count increases or assistant generation starts. A cleared/changed composer alone is not a receipt.

## S4 — response mode

Use a bounded target (`maxRepeats=2` recommended). PASS only if first-send onboarding/completion composition occurs as configured, the next send waits for generation to finish plus configured delay, exactly two sends are strongly receipted, then the target stops by max-repeat policy. No duplicate runner is allowed.

## S5 — interval mode

Use a short safe interval and `maxRepeats=2`. PASS only if sends occur no earlier than interval eligibility, strong receipts are required, duplicate runner start does not duplicate sends, and max-repeat stops the target.

## S6 — COMPLETE

Use the target's current runId COMPLETE URL. PASS only if the structural `parrot.invalid/complete/<runId>` anchor is discovered once, matching target becomes completed, duplicate observation is deduped, and partial/non-COMPLETE work does not create completion state.

## S7 — WAKE / MESSAGE routing

With two registered targets, emit one WAKE and one MESSAGE signal using unique event IDs. PASS only if each becomes one pending route, resolves the intended target, obtains a strong receipt on delivery, and becomes delivered once. MESSAGE evidence may retain the explicit reference identifier/URL but must not scrape surrounding chat prose.

## S8 — ambiguity fence

In a controlled non-destructive setup where send is attempted but strong receipt cannot be confirmed, PASS only if the route becomes ambiguous, durable ambiguity receipt exists before background notification, automatic redelivery stops, and Dashboard Retry/Resolve are the only continuation actions. Do not intentionally create duplicate real user messages merely to force this case.

## S9 — structural cooldown

Only when a genuine rate-limit/transient structural error naturally occurs. Do not intentionally hammer ChatGPT to manufacture a limit. PASS only if classification comes from structural error attributes/selectors rather than assistant/user prose, target cooldown fields contain kind/step/until/code only, sends are gated until due, dashboard shows structural cooldown timing, and a later confirmed successful send resets cooldown state. If no genuine cooldown occurs during smoke, record NOT_OBSERVED rather than PASS.

## S10 — lifecycle / tab states

Verify pause, stop, target deletion, tab close, and if naturally available discarded/frozen tab handling. PASS only if stopped/paused/deleted targets do not continue sending and structural tab states do not get mistaken for successful delivery.

## Release decision

Release browser gate = PASS only when S1–S8 and S10 pass. S9 may be NOT_OBSERVED if no genuine cooldown occurs, but then cooldown selector validity remains explicitly unverified in release notes. Any FAIL keeps release blocked. Generate/finalize the release ZIP only after this decision is recorded with the tested commit SHA.
