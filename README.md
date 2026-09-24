# Parrot / 앵무새

ChatGPT 대화를 반복 실행하고 `COMPLETE`, `WAKE`, `MESSAGE` 신호를 처리하는 로컬 Chrome Extension입니다.

현재 실제 provider adapter는 ChatGPT만 지원합니다. Claude / Gemini / Grok은 adapter boundary만 유지하고 아직 구현하지 않습니다.

## Current version

`v0.8.7` reconstruction in progress

## Current capabilities

- Worker identity: `A`, `B`, `C` … `Z`, `AA` …; fixed five-worker limit 없음.
- Dashboard는 활성 ChatGPT 탭에 종속되지 않는 extension control plane입니다.
- 검색/상태 필터와 10/25/50 pagination을 지원합니다.
- `discarded` / `frozen` 탭을 일반 연결 실패와 구분합니다.
- Live dashboard는 채팅 본문을 의미 분석하지 않고 구조적 상태만 사용합니다.
- 일반 반복 전송과 WAKE/MESSAGE delivery는 click 반환이 아니라 새 user-message DOM 또는 assistant generation 시작을 strong receipt로 사용합니다.
- receipt가 확인되지 않은 route는 `ambiguous`로 fence하고 자동 재전송하지 않습니다.
- ambiguity receipt는 background messaging 전에 bounded `chrome.storage.local` outbox에 기록됩니다.
- `delivered`와 수동 `resolved` route는 terminal history이며 active records는 history cap 때문에 제거하지 않습니다.

## Protocol

```text
COMPLETE
https://parrot.invalid/complete/<runId>

WAKE
https://parrot.invalid/wake/<sourceRunId>/<eventId>?to=<targetRouteId>

MESSAGE
https://parrot.invalid/message/<sourceRunId>/<eventId>?to=<targetRouteId>&ref=<reference>
```

`MESSAGE`의 `ref`는 GitHub URL, 문서 ID 등 수신 Worker가 직접 확인할 참조입니다. Parrot는 참조 대상의 본문을 읽지 않습니다.

## Repository verification

Repository root에서 다음 gates를 실행합니다.

```text
node scripts/test-route-state.mjs
node scripts/test-route-queue.mjs
node scripts/validate-contracts.mjs
node scripts/validate-v087-integration.mjs
node scripts/verify-repo.mjs
```

GitHub Actions의 `Route State Contract` workflow도 위 production integration/rebuildability gates를 실행합니다. Contract JSON이 정상이라는 사실과 production runtime이 통과한다는 사실은 구분합니다.

## v0.8.7 reconstruction status

Exact v0.8.6 `background.js`, `content.js`, `dashboard.js` bytes는 확보되지 않았으므로 해당 runtime을 v0.8.6 byte-exact라고 주장하지 않습니다. 대신 recovered v0.8.0 behavior와 검증된 later contracts를 근거로 v0.8.7 runtime을 재구성 중입니다.

현재 repository에는 다음 production slice가 있습니다.

- classic MV3 `background.js`가 `route-state.js`와 `route-queue.js`를 로드합니다.
- periodic routing은 pending-only state guard를 사용합니다.
- ambiguity reconciliation은 state-only이며 manual Retry/Resolve가 별도 message contract입니다.
- `content.js`는 click 전 user-message count를 잡고 count 증가 또는 generation start만 strong receipt로 인정합니다.
- strong receipt timeout은 ambiguous이며, 구조 receipt를 local outbox에 먼저 저장한 뒤 background에 알립니다.
- manifest는 v0.8.7/classic worker/content load order로 전환했습니다.
- dashboard controller는 worker pagination/search/filter와 ambiguous Retry/Resolve를 제공합니다.

주의: repository gate 통과는 실제 ChatGPT 브라우저 smoke test를 대체하지 않습니다. 실제 selector/send/receipt 동작과 완성된 v0.8.7 ZIP은 별도 검증 대상입니다.

## popup.js provenance

Exact target bytes/blob은 확보되어 있지만 현재 repository `popup.js`는 아직 네 numeric clamp/default가 빠진 blob입니다. 이 차이는 정확히 진단되어 있으며 release 전에 byte-preserving repair 또는 동등한 검증된 수정이 필요합니다. 실패한 부분 교체 시도로 파일 전체가 손상된 적이 있으나 즉시 이전 blob으로 복구했고 CI rebuildability gate가 다시 통과했습니다.

## Development principles

- ChatGPT-first
- dashboard-first management
- compact popup, no default vertical scrolling
- reliability / simplification / regression fixes before feature growth
- COMPLETE via `parrot.invalid` runId exact link
- WAKE / MESSAGE routing without semantic chat reading
- external UX/API references before major UI or architecture changes

See `docs/DEVELOPMENT_CHECKPOINT.md`, `docs/RECONSTRUCTION_PLAN_v0.8.7.md`, and latest-only `docs/BATON.md` for durable development state.
