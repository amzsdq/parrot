# Parrot / 앵무새

ChatGPT 대화를 반복 실행하고 `COMPLETE`, `WAKE`, `MESSAGE` 신호를 처리하는 로컬 Chrome Extension입니다.

현재 실제 provider adapter는 ChatGPT만 지원합니다. Claude / Gemini / Grok은 adapter boundary만 유지하고 아직 구현하지 않습니다.

## Current version

`v0.8.4`

### Fleet dashboard scaling

- Worker identity는 `A`, `B`, `C` … `Z`, `AA` … 식으로 확장됩니다. 5개 제한이 없습니다.
- Worker table은 검색/상태 필터에 더해 10/25/50개 단위 pagination을 제공합니다.
- 기본 페이지 크기는 25입니다.
- Chrome 탭의 `discarded` / `frozen` 상태를 일반 연결 실패와 구분합니다.
- Dashboard는 활성 ChatGPT 탭에 종속되지 않는 extension control plane입니다.
- Live dashboard는 채팅 본문을 의미 분석하지 않고 탭/DOM의 구조적 신호만 사용합니다.

### Reliability: strong dispatch receipts

- 일반 반복 전송과 WAKE/MESSAGE route delivery 모두 `sendButton.click()` 반환만으로 성공 처리하지 않습니다.
- 성공 receipt는 새 user-message DOM 또는 assistant generation 시작만 인정합니다.
- composer clear/change는 성공 증거로 인정하지 않습니다.
- 일반 반복 전송에서 5초 안에 강한 receipt가 없으면 `dispatch_unconfirmed`로 기록하고 `sentCount`를 증가시키지 않습니다.
- WAKE/MESSAGE에서 클릭 후 5초 안에 강한 receipt가 없으면 `dispatch_ambiguous`로 격리합니다. 실제 전송이 성공했을 가능성이 있으므로 자동 재전송하지 않아 중복 전달 위험을 줄입니다.
- v0.8.4부터 ambiguous route는 Dashboard Routing 표에서만 명시적으로 처리합니다.
  - `재시도`: 중복 전송 가능성을 경고하고 사용자 확인 뒤에만 다시 dispatch합니다.
  - `해결 처리`: 아무 메시지도 보내지 않고 route를 `resolved`로 종료합니다.
- ambiguous route는 자동 재시도되지 않습니다.

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

## Development principles

- ChatGPT-first
- dashboard-first management
- compact popup, no default vertical scrolling
- reliability / simplification / regression fixes before feature growth
- COMPLETE via `parrot.invalid` runId exact link
- WAKE / MESSAGE routing without semantic chat reading
- external UX/API references before major UI or architecture changes
