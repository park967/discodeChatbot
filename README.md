# Discord Game Info Chatbot

Steam 게임 정보를 검색해 Discord 채널에 알려주는 슬래시 명령어 봇입니다.

게임 이름으로 기본 정보를 찾고, 멀티플레이 지원 여부, 할인 여부, 할인 적용 후 가격 범위로 검색할 수 있습니다.

## 주요 기능

- `/game` 명령어로 Steam 게임 정보 검색
- 할인 적용 후 가격 기준 검색
- 현재 할인 중인 게임만 검색
- 멀티플레이 지원 게임만 검색
- 게임 출시일, 가격, 할인율, 개발사, 장르, 플랫폼 표시
- `/ping` 명령어로 봇 상태 확인
- `/echo` 명령어로 개인에게만 보이는 테스트 응답 확인
- `/blackjack` 명령어로 딜러와 간단한 블랙잭 플레이

## 준비해야 할 것

- Node.js 22.12.0 이상
- npm
- Discord 계정
- Discord 서버
- Discord Developer Portal에서 만든 Application과 Bot Token

Node.js는 아래 페이지에서 받을 수 있습니다.

```text
https://nodejs.org/
```

Discord Developer Portal은 아래 주소입니다.

```text
https://discord.com/developers/applications
```

## 프로젝트 받기

GitHub에서 프로젝트를 내려받습니다.

```bash
git clone https://github.com/park967/discodeChatbot.git
cd discodeChatbot
```

## 설치

프로젝트 폴더에서 의존성을 설치합니다.

Windows PowerShell에서 `npm` 실행 정책 문제가 나면 `npm.cmd`를 사용하면 됩니다.

```bash
npm.cmd install
```

macOS나 Linux에서는 보통 아래 명령어를 사용합니다.

```bash
npm install
```

## Discord 봇 만들기

1. Discord Developer Portal에 접속합니다.
2. `New Application`을 눌러 새 애플리케이션을 만듭니다.
3. 왼쪽 메뉴에서 `Bot`으로 이동합니다.
4. `Reset Token` 또는 `View Token`을 눌러 Bot Token을 확인합니다.
5. Token은 절대 GitHub에 올리면 안 됩니다.
6. 왼쪽 메뉴에서 `OAuth2` -> `General`로 이동합니다.
7. `Client ID`를 복사합니다.

## 봇을 서버에 초대하기

Developer Portal에서 아래 순서로 초대 링크를 만들 수 있습니다.

1. `OAuth2` -> `URL Generator`로 이동합니다.
2. `Scopes`에서 `bot`과 `applications.commands`를 선택합니다.
3. `Bot Permissions`에서 필요한 권한을 선택합니다.
   현재 봇은 기본적으로 메시지를 보내고 슬래시 명령어에 응답할 수 있으면 됩니다.
4. 생성된 URL로 접속해서 원하는 Discord 서버에 봇을 초대합니다.

## 환경변수 설정

`.env.example` 파일을 복사해서 `.env` 파일을 만듭니다.

Windows:

```bash
copy .env.example .env
```

macOS 또는 Linux:

```bash
cp .env.example .env
```

`.env` 파일을 열고 아래 값을 채웁니다.

```env
DISCORD_TOKEN=디스코드_봇_토큰
DISCORD_CLIENT_ID=디스코드_애플리케이션_클라이언트_ID
DISCORD_GUILD_ID=테스트할_디스코드_서버_ID
```

`DISCORD_GUILD_ID`는 선택값이지만 개발 중에는 넣는 것을 추천합니다.
서버 ID를 넣으면 슬래시 명령어가 해당 서버에 빠르게 반영됩니다.
넣지 않으면 전역 명령어로 등록되어 반영까지 시간이 더 걸릴 수 있습니다.

## Discord 서버 ID 확인 방법

1. Discord 설정에서 `고급`으로 이동합니다.
2. `개발자 모드`를 켭니다.
3. 서버 아이콘을 우클릭합니다.
4. `서버 ID 복사`를 선택합니다.

## 명령어 등록

봇을 처음 실행하기 전, Discord에 슬래시 명령어를 등록해야 합니다.

```bash
npm.cmd run deploy
```

macOS 또는 Linux:

```bash
npm run deploy
```

명령어를 수정하거나 새 명령어를 추가했을 때도 이 명령어를 다시 실행해야 합니다.

## 봇 실행

개발 모드로 실행합니다.

```bash
npm.cmd run dev
```

macOS 또는 Linux:

```bash
npm run dev
```

일반 실행은 아래 명령어를 사용합니다.

```bash
npm.cmd start
```

정상 실행되면 터미널에 아래처럼 표시됩니다.

```text
Logged in as 봇이름#0000
```

## 사용 가능한 명령어

### `/ping`

봇이 정상 작동 중인지 확인합니다.

```text
/ping
```

### `/echo`

입력한 문장을 다시 보여줍니다.
이 응답은 명령어를 입력한 사람에게만 보입니다.

```text
/echo text:hello
```

### `/game`

Steam에서 게임 정보를 검색합니다.

```text
/game name:elden ring
```

결과에는 게임 이름, 설명, 출시일, 가격, 할인 정보, 개발사, 멀티플레이 여부, 장르, 플랫폼, Steam 링크가 표시됩니다.

멀티플레이 지원 게임만 찾기:

```text
/game name:monster hunter multiplayer:true
```

할인 적용 후 30,000원 이하 게임 찾기:

```text
/game name:elden ring max_price:30000
```

현재 할인 중이고 10,000원에서 50,000원 사이인 게임 찾기:

```text
/game name:monster hunter min_price:10000 max_price:50000 on_sale:true
```

멀티플레이, 할인, 가격 조건을 같이 사용하기:

```text
/game name:survival multiplayer:true max_price:20000 on_sale:true
```

### `/blackjack`

딜러와 1인 블랙잭을 시작합니다.

```text
/blackjack
```

게임이 시작되면 Discord 버튼으로 진행합니다.

- `Hit`: 카드 한 장 더 받기
- `Stand`: 멈추고 딜러 진행
- `New Game`: 새 판 시작

현재 블랙잭은 봇이 실행 중인 동안만 판이 유지됩니다.
봇을 끄면 진행 중인 판은 사라집니다.

## 가격 검색 기준

가격 검색은 Steam의 할인 적용 후 최종 가격을 기준으로 합니다.

- `min_price`: 최소 가격
- `max_price`: 최대 가격
- `on_sale:true`: 현재 할인 중인 게임만 검색

가격 단위는 원화 KRW 기준입니다.

예를 들어 `max_price:30000`은 할인 적용 후 가격이 30,000원 이하인 게임을 찾습니다.

## 멀티플레이 검색 기준

멀티플레이 여부는 Steam 카테고리 정보를 기준으로 판단합니다.

아래와 같은 Steam 태그가 있으면 멀티플레이 지원으로 봅니다.

- `Multi-player`
- `Co-op`
- `Online Co-op`
- `PvP`
- `MMO`

Steam에 카테고리가 잘못 등록되어 있거나 누락된 게임은 결과가 정확하지 않을 수 있습니다.

## 코드 구조

```text
src/
  index.js                 봇 실행 진입점
  config.js                환경변수 확인
  deploy-commands.js       Discord 슬래시 명령어 등록
  commands/
    index.js               명령어 목록 관리
    ping.js                /ping 명령어
    echo.js                /echo 명령어
    game.js                /game 명령어
    blackjack.js           /blackjack 명령어와 버튼 처리
  services/
    steam.js               Steam 검색과 게임 정보 가공
    blackjack.js           블랙잭 카드, 점수 계산, 승패 판정
```

## 코드를 수정할 때 보면 좋은 파일

새 명령어를 추가하고 싶으면 `src/commands/` 폴더에 파일을 만들고 `src/commands/index.js`에 등록하면 됩니다.

`/game` 명령어 옵션을 바꾸고 싶으면 아래 파일을 수정합니다.

```text
src/commands/game.js
```

Steam에서 가져온 데이터를 바꾸거나 필터 조건을 수정하고 싶으면 아래 파일을 수정합니다.

```text
src/services/steam.js
```

블랙잭 규칙이나 화면 표시를 바꾸고 싶으면 아래 파일을 수정합니다.

```text
src/commands/blackjack.js
src/services/blackjack.js
```

환경변수를 추가하고 싶으면 아래 파일을 수정합니다.

```text
src/config.js
```

## GitHub에 올리면 안 되는 것

아래 파일과 폴더는 GitHub에 올리면 안 됩니다.

- `.env`
- `node_modules/`
- Discord Bot Token
- 개인 API Key

이 프로젝트의 `.gitignore`에는 `.env`와 `node_modules/`가 이미 제외되어 있습니다.

## 자주 생기는 문제

### 슬래시 명령어가 Discord에 안 보여요

`npm.cmd run deploy`를 실행했는지 확인하세요.

`DISCORD_GUILD_ID`를 넣으면 테스트 서버에 더 빠르게 반영됩니다.

### 봇이 온라인이 안 돼요

`.env`의 `DISCORD_TOKEN` 값이 맞는지 확인하세요.

봇이 서버에 초대되어 있는지도 확인해야 합니다.

### PowerShell에서 npm 실행이 막혀요

Windows PowerShell 실행 정책 때문에 `npm`이 막힐 수 있습니다.
그럴 때는 아래처럼 `npm.cmd`를 사용하세요.

```bash
npm.cmd install
npm.cmd run deploy
npm.cmd run dev
```

### 게임 검색 결과가 원하는 게임이 아니에요

현재 검색은 Steam 검색 결과 상위 항목 중 조건에 맞는 첫 게임을 보여줍니다.
검색어를 더 정확하게 입력하면 결과가 좋아집니다.

예:

```text
/game name:elden ring
/game name:stardew valley
/game name:monster hunter wilds
```

## 나중에 추가하면 좋은 기능

- 여러 게임 검색 결과 중 선택하기
- 장르별 검색
- 출시 예정 게임 검색
- 무료 게임만 검색
- 한국어 지원 여부 표시
- Metacritic 점수 표시
- Steam이 아닌 다른 게임 API 연동
- 블랙잭 점수판 저장
- 블랙잭 배팅 포인트 기능
