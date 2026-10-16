# Parrot experimental foreground/focus safety gate

Status: **experimental source-only**, never promoted to the frozen M6 release candidate or installed extension based solely on CI.

## Problem

The user observed unsolicited Chrome focus/scroll and repeated clicks. Parrot is still being evaluated as a future Companion replacement and must not be identified as the incident source without an actual provenance trace. On the experimental branch, prior `content.js` could repeat `button.click()` on a visible ChatGPT tab and `chatgpt-adapter.js` used `el.focus()`, which can scroll the page. This is a verifiable hazard independent of incident attribution.

## Implemented source gate

- Experimental Parrot `sendPrompt` returns `{ok:false,reason:'human_visible_tab'}` when `document.visibilityState!=='hidden'`, before composer mutation and again immediately before clicking Send. This applies to interval and response repeat modes and route delivery.
- Experimental `chatgpt-adapter.js` refuses to set the composer text unless the tab is hidden, uses `el.focus({preventScroll:true})` and rechecks visibility.
- `scripts/test-content-send-boundary.mjs` still validates one strong receipt in an explicitly hidden test tab; it additionally verifies that a running target in a user-visible tab cannot click Send.
- No Chrome extension currently installed on the user's machine was changed or restarted.

## Important frozen candidate boundary

The separate M6 release contract intentionally compares `extension/` bytes against the frozen M6 candidate. Modifying source on this experimental branch therefore triggers `test-release-preflight.sh` failure `extension/ differs from M6 candidate`. **This failure is expected and must not be waived or patched around.** To release a new version, create a new reviewed candidate and repeat M6 authenticated real-Chrome testing. The experimental Script Runner CI can pass independently, but is not release approval.

## Remaining hard acceptance

- Prove the active user's top-level Chrome tab, OS cursor, keyboard focus, scroll position and drafts remain unchanged through background send/retry/wake.
- Test visible→hidden and hidden→visible transitions before composer input and before Send; a transition to visible must stop input, never refocus the user.
- Coordinate a **single** sender with PCBridge Core. The mounted Web relay user Stop is not yet proven to fence Parrot's independent running-target state. Test Stop propagation and deny any subsequent sends, including queued retries.
- Do not add global OS mouse, keyboard, pointer or foreground-window automation as a workaround.
- Preserve experiment branch without altering an installed extension or rebinding a different foreground ChatGPT tab.

The common cross-project contract is maintained in PCBridge `docs/USER_FOCUS_AND_INPUT_SAFETY.md`.
