# Discord Game Info Chatbot

Steam 게임 검색, 게임 추천, 간단한 AI 대화, 블랙잭, 로컬 음악 재생을 지원하는 Discord 봇입니다.

## 주요 기능

- `/ping`으로 봇 상태 확인
- `/echo`로 입력한 문장을 본인에게만 다시 표시
- `/game`으로 Steam 게임 정보 검색
- `/blackjack`으로 버튼 기반 블랙잭 플레이
- `/music`으로 직접 넣은 저작권 무료 음원 재생
- 일반 채팅의 `게임 추천`, `멀티 게임 추천`, `3만원 이하 공포 게임 추천` 같은 문장에 반응
- `@gamebot`, `게임봇`, `봇아`로 부르면 Gemini 또는 OpenAI API를 사용해 AI 답변

## 준비물

- Node.js 22.12.0 이상
- npm
- Discord 계정과 서버
- Discord Developer Portal에서 만든 Application/Bot
- 선택 사항: Gemini API 키 또는 OpenAI API 키

## 설치

```powershell
cd C:\Users\ADMIN\discodeChatbot
npm.cmd install
```

## 환경변수 설정

`.env.example`을 복사해서 `.env`를 만들고 값을 채웁니다.

```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_client_id_here
DISCORD_GUILD_ID=your_test_server_id_here

GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

`GEMINI_API_KEY`와 `OPENAI_API_KEY`는 둘 다 필수는 아닙니다. 둘 다 있으면 Gemini를 먼저 사용합니다.

`.env` 파일과 API 키는 GitHub에 올리면 안 됩니다.

## Discord 설정

일반 채팅을 읽으려면 Discord Developer Portal에서 봇 설정을 확인해야 합니다.

1. `Bot` 메뉴로 이동
2. `Privileged Gateway Intents`에서 `Message Content Intent` 켜기
3. OAuth2 초대 링크에는 `bot`과 `applications.commands` scope 포함
4. 봇 권한은 최소한 `채널 보기`, `메시지 보내기`, `링크 임베드`, `메시지 기록 보기`, `연결`, `말하기` 권장

## 슬래시 명령어 등록

처음 실행하거나 명령어가 바뀌었을 때 등록합니다.

```powershell
npm.cmd run deploy
```

성공하면 다음과 비슷하게 표시됩니다.

```text
Slash commands registered successfully.
```

## 실행

개발 중에는 파일 변경 감시 모드로 실행합니다.

```powershell
npm.cmd run dev
```

일반 실행은 다음 명령어를 사용합니다.

```powershell
npm.cmd start
```

Windows에서는 `start-bot.bat`을 더블클릭해도 실행할 수 있습니다. CMD 창을 닫으면 봇도 종료됩니다.

## 사용 예시

슬래시 명령어:

```text
/ping
/echo text:hello
/game name:elden ring
/game name:monster hunter multiplayer:true
/game name:stardew valley max_price:20000
/blackjack
/music list
/music play track:chill
/music stop
/music leave
```

음악 파일은 프로젝트의 `assets/music` 폴더에 직접 넣습니다.

```text
assets/music/chill.mp3
assets/music/lobby.ogg
```

지원 확장자는 `.mp3`, `.ogg`, `.wav`, `.flac`, `.m4a`입니다.
`/music play`를 쓰기 전에 본인이 Discord 음성 채널에 들어가 있어야 합니다.
YouTube 등 외부 사이트에서 음원을 가져오는 방식은 사용하지 않으며, 저작권 문제가 없는 파일만 직접 넣어 사용하는 것을 권장합니다.

일반 채팅 추천:

```text
게임 추천해줘
멀티 게임 추천해줘
친구랑 할 생존 게임 추천해줘
3만원 이하 공포 게임 추천해줘
```

AI 대화:

```text
@gamebot 안녕
@gamebot 친구 3명이서 할 할인 중인 협동 게임 추천해줘
게임봇 엘든링 비슷한 게임 알려줘
봇아 오늘 할만한 게임 뭐 있어?
```

## 코드 구조

```text
src/
  index.js                 봇 실행 진입점, 이벤트 처리, 일반 채팅 반응
  config.js                환경변수 로딩
  deploy-commands.js       슬래시 명령어 등록
  commands/
    blackjack.js           /blackjack 명령어와 버튼 처리
    echo.js                /echo 명령어
    game.js                /game 명령어
    index.js               명령어 목록
    music.js               /music 명령어
    ping.js                /ping 명령어
  services/
    gemini.js              Gemini API 답변 생성
    openai.js              OpenAI API 답변 생성
    blackjack.js           블랙잭 게임 상태와 규칙
    music.js               로컬 음악 파일 검색과 음성 채널 재생
    steam.js               Steam 검색과 게임 정보 정규화
assets/
  music/                   직접 넣은 저작권 무료 음원 파일
```

## 참고

- 블랙잭 진행 상태는 메모리에만 저장됩니다. 봇을 재시작하면 진행 중인 게임은 사라집니다.
- Steam 가격과 할인 정보는 Steam API 응답 기준입니다.
- AI 답변은 API 키와 각 플랫폼의 사용량/과금 상태에 따라 실패할 수 있습니다.
- 음악 기능을 추가한 뒤에는 `npm.cmd install`과 `npm.cmd run deploy`를 다시 실행해야 합니다.
