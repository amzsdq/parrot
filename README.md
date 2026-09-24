# Parrot / 앵무새

ChatGPT 대화를 반복 실행하고 `COMPLETE`, `WAKE`, `MESSAGE` 신호를 처리하는 로컬 Chrome Extension입니다.

현재 실제 provider adapter는 ChatGPT만 지원합니다. Claude / Gemini / Grok은 adapter boundary만 유지하고 아직 구현하지 않습니다.

## Current version

`v0.8.6`

## Current capabilities

- Worker identity: `A`, `B`, `C` … `Z`, `AA` …; fixed five-worker limit 없음.
- Dashboard는 활성 ChatGPT 탭에 종속되지 않는 extension control plane입니다.
- 검색/상태 필터와 10/25/50 pagination을 지원합니다.
- `discarded` / `frozen` 탭을 일반 연결 실패와 구분합니다.
- Live dashboard는 채팅 본문을 의미 분석하지 않고 구조적 상태만 사용합니다.
- 일반 반복 전송과 WAKE/MESSAGE delivery는 click 반환이 아니라 새 user-message DOM 또는 assistant generation 시작을 strong receipt로 사용합니다.
- receipt가 확인되지 않은 route는 `ambiguous`로 fence하고 자동 재전송하지 않습니다.
- ambiguity receipt는 background messaging 전에 bounded `chrome.storage.local` outbox에 기록됩니다.
- v0.8.6은 `delivered`뿐 아니라 수동 `resolved` route도 terminal history budget에 포함해 durable route queue의 무제한 성장을 막습니다.

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

## Default completion instruction

```text
반드시 사용자가 요청한 전체 작업이 실제로 완료된 경우에만 아래 완료 신호를 한 번 출력하고, 진행 중이거나 일부 단계만 완료된 경우에는 출력하지 마세요.

{{SIGNAL_URL}}
```

## Installation

1. versioned ZIP을 압축 해제합니다.
2. `chrome://extensions`에서 개발자 모드를 켭니다.
3. `압축해제된 확장 프로그램을 로드합니다`를 선택합니다.
4. 업데이트 시 확장 프로그램을 다시 로드합니다.
5. 이미 열려 있던 ChatGPT 탭은 한 번 새로고침합니다.

## Repository verification

Repository source가 완전한 확장프로그램으로 재구축 가능한지 확인하려면 repository root에서 다음을 실행합니다.

```text
node scripts/verify-repo.mjs
```

검사는 manifest JSON parse, manifest/HTML이 참조하는 local file 존재 여부, repository에 있는 JavaScript의 `node --check` syntax를 확인합니다. 하나라도 빠지면 non-zero로 실패합니다. 현재 source-of-truth migration이 아직 끝나지 않았으므로 missing runtime source가 복구되기 전에는 이 gate가 실패하는 것이 정상입니다. Gate를 통과하기 전에는 repository를 완전한 rebuildable source로 인증하지 않습니다.

## Development principles

- ChatGPT-first
- dashboard-first management
- compact popup, no default vertical scrolling
- reliability / simplification / regression fixes before feature growth
- COMPLETE via `parrot.invalid` runId exact link
- WAKE / MESSAGE routing without semantic chat reading
- external UX/API references before major UI or architecture changes

## Source status

GitHub source-of-truth migration is in progress. `extension/manifest.json` and several UI/support files are synchronized to the v0.8.6 artifact, but the full v0.8.6 package has not yet been committed/rebuilt solely from repository source. `background.js`, `content.js`, and `dashboard.js` are still missing, and `popup.js` byte-exact certification remains unresolved. See `docs/DEVELOPMENT_CHECKPOINT.md`.
