# M6 User Test Order — authenticated Chrome + ChatGPT

Purpose: collect the missing real-browser evidence for M6-C2..C7 against the exact M5 candidate. Do not test a newer extension tree.

## 0. What to download

Preferred package:
- Repository: `amzsdq/parrot`
- Candidate source SHA: `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`
- Actions run: `35979821480`
- Artifact ID: `10798948865`
- Artifact name: `parrot-v0.8.7-candidate-NON-RELEASE-f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`
- Artifact digest: `sha256:ca6ece70268ebf304cdab16260515911eeea45b6b67d44d981238c93bfdb251c`
- Artifact currently expires: 2026-10-08T09:12:34Z

Fallback if artifact download is inconvenient:
- Check out exact commit `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`
- Use that commit's `extension/` directory.
- Do NOT use current `main/extension` merely because main is newer.

After extracting, select the directory whose immediate contents include `manifest.json`.

## 1. Chrome preparation

1. Use desktop Google Chrome/Chromium where you are already logged into real `https://chatgpt.com/`.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Remove/disable any other Parrot test copy to avoid duplicate runners.
5. Choose **Load unpacked** and select the extracted candidate extension directory.
6. Keep at least two different real ChatGPT conversation tabs open. Call them A and B for the test.
7. Confirm the ChatGPT session is authenticated using structural UI only (for example: account/avatar/menu exists). Do not report account name, email, cookies, tokens, credentials, or chat prose.

Useful reporting rule:
- Record only PASS/FAIL/NOT_OBSERVED plus visible structural state.
- Never paste private chat contents.
- If a screenshot is used, crop/blur account identity and unrelated chat prose.
- Note the local KST time of each test; ChatGPT can convert it to UTC Z for the final evidence file.

## 2. Test order

### S1 — Load / control plane
- Open the extension popup.
- Open Dashboard.
- Confirm there are no obvious manifest/service-worker/content-script errors.
- Confirm authenticated ChatGPT tab A is structurally visible to Parrot.
PASS if popup + Dashboard work and real authenticated ChatGPT tab is visible.

### S2 — Exact target / Dashboard control
- Register ChatGPT conversations A and B as separate workers.
- Keep Dashboard active; do not switch to A.
- From Dashboard start A.
- Confirm only A runs; B must not send.
- Stop A from Dashboard.
- Start B independently.
- Close one target tab and confirm Dashboard does not silently route Start to another ChatGPT tab.
PASS only if exact target routing is preserved with no first-tab fallback.

### S3 — Composer / strong receipt
- On one worker send one harmless bounded prompt.
- Confirm Parrot counts delivery only after the user-message count increases or assistant generation starts.
- Composer text merely changing/clearing must not by itself count as successful delivery.
PASS if a real send occurs and strong receipt is observed.

### S4 — Response mode
Use:
- mode = response
- `maxRepeats = 2`
- a short delay such as 3 seconds
- `sendImmediately = true` for the main run

Verify:
- first automatic send respects configured behavior,
- second send occurs only after assistant generation finishes + configured delay,
- exactly two strong receipts occur,
- then max-repeat stops.

Then perform the negative reload check:
- set `sendImmediately = false`,
- reload/reconcile,
- confirm it does not auto-arm/send merely because of reload.

### S5 — Interval mode
Use:
- mode = interval
- shortest safe supported interval (UI minimum is 1 minute)
- `maxRepeats = 2`

Verify:
- no send occurs before interval eligibility,
- exactly two sends are strongly receipted,
- duplicate Start attempts do not create duplicate sends,
- target stops after max-repeat.

### S6 — Reload recovery / single-runner fence
- While response mode is running, reload its ChatGPT page.
- Confirm exactly one effective runner resumes.
- Repeat once in interval mode.
- Change legitimately from response ↔ interval and confirm the old runner is fenced.
- Pause/Stop/Delete then reload: none may resurrect a runner.
PASS only with no duplicate sends/runners.

### S7 — COMPLETE
- Enable completion detection and the default completion rule.
- Start a bounded task that can genuinely finish.
- Let the assistant produce the current exact `parrot.invalid/complete/<runId>` completion signal only when done.
Verify:
- target becomes completed once,
- observing the same signal again is deduplicated,
- partial/non-complete work does not mark completion.
Do not report the surrounding chat prose.

### S8 — WAKE / MESSAGE routing
Use two registered targets A and B with routing enabled and default onboarding/routing templates.

WAKE:
- from source A, emit one WAKE signal intended for B using a fresh event ID.
- Verify one pending route -> intended B -> strong receipt -> delivered once.

MESSAGE:
- emit one MESSAGE signal with a different fresh event ID and a harmless explicit reference (for example a GitHub URL or document ID).
- Verify one pending route -> intended B -> strong receipt -> delivered once.
- Confirm Parrot does not scrape/store surrounding chat prose.

PASS only if no cross-target or duplicate delivery occurs.

### S9 — Ambiguity fence
Do NOT intentionally duplicate a real message or manufacture a failure.
If a safe/natural case occurs where a send was attempted but strong receipt cannot be confirmed:
- route becomes `ambiguous`,
- durable ambiguity state exists,
- automatic redelivery stops,
- Dashboard shows explicit Retry / Resolve.
If no safe natural case appears, report `NOT_OBSERVED`. That is allowed but remains a release limitation.

### S10 — Structural cooldown
Do NOT manufacture a rate limit.
Only if a genuine transient/rate-limit structural error naturally appears:
- cooldown metadata/state is recorded,
- further sends are gated until due,
- Dashboard shows cooldown timing,
- later confirmed success resets cooldown.
If no natural case appears, report `NOT_OBSERVED`.

### S11 — Fleet / viewport
- Ensure at least 11 workers exist so Dashboard can show two pages at 10/page. Only A/B need to be real actively tested tabs; extra workers can remain stopped.
- Check search, filter, pagination.
- Check structural Attention states if available.
- Confirm visible action feedback for Start/Stop and Retry/Resolve when applicable.
- Open popup at normal extension-popup size and confirm it does not unexpectedly vertically scroll by default.
- Open advanced editors and confirm they appear as overlays instead of expanding/clipping the default form.

## 3. What to send back to ChatGPT

Send this compact report. KST timestamps are acceptable; ChatGPT will convert them to UTC Z before durable verifier evidence is created.

```text
Chrome version:
Windows version:
Candidate loaded from artifact 10798948865 / exact SHA f51e4ba...: YES/NO
Authenticated ChatGPT structural evidence (no identity): e.g. avatar/account menu visible
ChatGPT A URL:
ChatGPT B URL:

S1: PASS/FAIL — observation — time
S2: PASS/FAIL — observation — time
S3: PASS/FAIL — observation — time
S4: PASS/FAIL — observation — time
S5: PASS/FAIL — observation — time
S6: PASS/FAIL — observation — time
S7: PASS/FAIL — observation — time
S8: PASS/FAIL — observation — time
S9: PASS/FAIL/NOT_OBSERVED — observation/reason — time
S10: PASS/FAIL/NOT_OBSERVED — observation/reason — time
S11: PASS/FAIL — observation — time

Anything strange:
- ...
```

If any case FAILS, stop only that failing scenario if continuing it risks duplicate sends. Record exact reproduction steps and visible structural state. Other independent safe cases may still be tested.

## 4. M6 decision rule

M6 browser gate can PASS only when:
- authenticated-session structural provenance is present,
- S1–S8 and S11 are PASS,
- S9/S10 are PASS or explicit NOT_OBSERVED with limitation rationale,
- evidence remains bound to exact candidate `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`.

Any observed FAIL reopens the affected earlier milestone; it is not waived.
