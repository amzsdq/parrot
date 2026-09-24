# Parrot v0.8.7 live smoke result

Candidate source SHA: `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`
Candidate Actions run: `35979821480`
Candidate artifact id: `10798948865`
Candidate label: **NON-RELEASE — M6 browser gate required**

Tester fills this file only from a real Chromium/Chrome + ChatGPT execution. Static evidence must not be copied in as PASS.

## Environment
- Browser + version:
- OS:
- Extension loaded from exact candidate source/artifact: YES / NO
- UTC start:
- ChatGPT worker URLs/labels used (URLs only; no chat prose):

## Results
| Case | Result | Structural evidence / failure reproduction | UTC |
|---|---|---|---|
| S1 unpacked load/control plane | UNVERIFIED | | |
| S2 exact target + Dashboard Start/Stop | UNVERIFIED | | |
| S3 composer + strong receipt | UNVERIFIED | | |
| S4 response mode + configured delay | UNVERIFIED | | |
| S5 interval mode | UNVERIFIED | | |
| S6 reload recovery/single-runner fence | UNVERIFIED | | |
| S7 COMPLETE | UNVERIFIED | | |
| S8 WAKE/MESSAGE | UNVERIFIED | | |
| S9 ambiguity fence/actions | UNVERIFIED | safe NOT_OBSERVED allowed only per checklist | |
| S10 structural cooldown | UNVERIFIED | natural NOT_OBSERVED allowed only per checklist | |
| S11 fleet viewport/action feedback | UNVERIFIED | | |

Allowed result vocabulary: `PASS`, `FAIL`, `NOT_OBSERVED`, `UNVERIFIED`.

## Failure routing
For every FAIL record:
- case:
- affected earlier milestone/criterion:
- exact reproduction steps using structural state only:
- observed structural evidence:
- cause hypothesis:
- corrective change:
- retest result:

Any observed FAIL reopens the affected earlier milestone; do not waive it to release.

## Decision
- Required S1–S8 + S11 all PASS: YES / NO
- S9: PASS / NOT_OBSERVED / FAIL / UNVERIFIED
- S10: PASS / NOT_OBSERVED / FAIL / UNVERIFIED
- M6 decision: PASS / FAIL / UNVERIFIED
- Explicit limitations carried to release notes:
- UTC decision time:
