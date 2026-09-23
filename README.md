# Parrot / 앵무새

ChatGPT 대화를 반복 실행하고 `COMPLETE`, `WAKE`, `MESSAGE` 신호를 처리하는 로컬 Chrome Extension입니다.

현재 실제 provider adapter는 ChatGPT만 지원합니다. Claude / Gemini / Grok은 adapter boundary만 유지하고 아직 구현하지 않습니다.

## Current version

`v0.8.0`

### Multi-worker dashboard

- Worker identity는 `A`, `B`, `C` … `Z`, `AA` … 식으로 확장됩니다. 5개 제한이 없습니다.
- Dashboard는 현재 활성 ChatGPT 탭에 종속되지 않는 extension control plane입니다.
- Chrome Tabs API로 열려 있는 다른 ChatGPT 탭을 조회하고, 해당 탭의 content script에 메시지를 보내 제어합니다.
- Live dashboard는 채팅 본문을 의미 분석하지 않습니다. 다음 구조적 신호만 사용합니다.
  - tab open / closed
  - content-script reachable / unavailable
  - response generating
  - composer available
  - draft present
  - pending route count
- 기존 Target의 Route ID는 유지합니다.
- 새 Worker의 Route ID 기본값은 Worker label입니다.
- Dashboard UI는 많은 Worker를 빠르게 스캔할 수 있도록 card grid에서 dense data table + status label + progressive detail 구조로 변경했습니다.

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
