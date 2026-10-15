# Parrot 0.9.0 experimental Tampermonkey-inspired Script Runner

Status: **development branch only**, NOT the released Parrot 0.8.7 candidate and NOT installed to the user's Chrome. Branch: `feature/script-runner-vnext`.

## Decision
Reuse Tampermonkey's *principles*, not its packaged extension: per-script metadata, declared target, explicit enable/disable, persistent per-script source, SHA-256 integrity, audit of each attempt, and a Chrome USER_SCRIPT world. There is no imported Tampermonkey code or license dependency. Do not use `eval()`, `new Function()`, nor an untrusted chat link as direct code authority. Chrome's official `chrome.userScripts.execute()` is the script execution primitive on Chrome 135+; local user must enable **Allow User Scripts** in extension details. USER_SCRIPT isolation limits extension/page JS namespace sharing but is **not** an absolute exfiltration or DOM safety boundary.

## Implemented in the isolated branch
- `extension/script-runner-policy.js` — syntax and size checks, a narrow exact ChatGPT-conversation `@match` equivalent, content-addressed preset IDs, SHA digest verification, no execution on save, no direct `parrot.invalid/code/<arbitrary source>` execution.
- `extension/script-runner-runtime.js` — origin of request constrained to an internal extension page, explicit save/approve/disable/manual execute verbs, SHA-verified source, exact tab and URL, one use per persisted UUID attempt, `DISPATCH_STARTED` persisted before execution, ambiguous results never automatically retried.
- `extension/script-runner-background.js` — a separate event listener that cannot accept requests from ChatGPT content scripts, preserved original Parrot COMPLETE/WAKE/MESSAGE dispatcher.
- `extension/script-runner.html` and `script-runner-ui.js` — explicit local editor, source/digest review, manual consent, user-clicked one-off test, safe status text and refusal when more than one matching open tab.
- Experimental `extension/manifest.json` v0.9.0 declares `userScripts`, Chrome>=135 and existing restricted ChatGPT host only. Nothing in the v0.8.7 M5 release candidate has been rewritten.
- Tests in `scripts/test-script-runner-{policy,runtime,contract}.cjs` and dedicated non-release GitHub Action. Passing these is **not** real logged-in Chrome/ChatGPT acceptance.

## Remaining verified gates
1. Review script storage for race/TOCTOU, extension UI spoofing, Chrome toggle errors, page result ambiguity and least privilege. Before release, prefer native PCBridge Core-issued authorization for any script that invokes PC operations.
2. Run actual unpacked v0.9.0 extension in a **separate approved Chrome test environment**, manually toggle Allow User Scripts, save `console.log('hello')`, confirm twice, select one exact test conversation and verify Chrome API result and page effect without inspecting credentials. Disabling must block execution.
3. Demonstrate stop/authorization expiry/reload/failed execute and two parallel clicks never trigger a duplicate effect. Do not store secrets in extension storage or raw tool logs.
4. Keep Parrot 0.8.7 real authenticated M6 acceptance distinct. Do not replace the user's live extension or use this experimental branch to claim v0.8.7 M6 PASS.

## 15-minute lifecycle and old-vs-new relay choice
- At each trusted work-turn entry: publish a **TURN_START** activity signal containing a run-local generation/seq/start timestamp; 12m30s checkpoint, ~14m wrap; at an actually persisted boundary publish **TURN_END** with reference/checkpoint SHA and verified completion state. Text markers in ChatGPT alone are *not* durable activity evidence, and may be quoted by unrelated messages.
- The failed 2-minute `relay_continue` was caused by **panel-only sender not waking while unmounted**, not by the numeric wait of 120 seconds. Replacing 120 seconds with 10 seconds reduces unattended exposure but does not fix that structural flaw.
- Until a Core-owned/Parrot background sender is live-verified, adopt the existing 10-second `relay_handoff` as the **compatibility fallback**, with the panel mounted and exact same message receipt; do not queue when existing seq4 remains `AMBIGUOUS`.
- No automatic new seq/run during ambiguous delivery. Reconcile seq4's exact sender/nonce or explicitly fence/resolve it under authorized recovery before starting a new cycle. A previous host TIMEOUT is not evidence the message was unsent.
- Future preferred route: Core-managed checkpoint, single Parrot/Companion sender, 1–3 minute cooldown, real DOM receipt and successor ACK. The 2-minute pause can be restored only after background wake works without any mounted Web panel.

## Acceptance board
| Order | Work | Release gate |
| --- | --- | --- |
| 0 | Fence ambiguous PCBridge seq4 + preserve Preview98 | Exact same-message receipt or explicitly confirmed abort; no duplicate sender |
| 1 | Script Runner branch source + synthetic tests | 0.9.0 isolated branch CI and SHA read-back |
| 2 | Manual Chrome pilot and security negatives | User-triggered execute one exact chat tab, no implicit link execution |
| 3 | Core/Parrot watchdog + single-sender handoff | 15-minute turn lifecycle and >=10 genuine successor ACKs |
| 4 | Native/Web auto update | compatible source/manifests, host acceptance, rollback and no startup regression |
| 5 | Private GitHub release backup and cleanup | remote SHA download proof then retention gate PASS |

**Provenance:** user-approved personal extension experiment, GitHub source only; live browser behavior and any new relay ACK remain UNKNOWN.
