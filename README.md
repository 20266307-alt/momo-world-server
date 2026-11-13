# 모모 월드 - Render 멀티플레이 서버

이 서버는 Canva AI에서 만든 모모 월드 HTML과 연결하기 위한 Socket.IO 백엔드입니다.

## Canva 게임과 맞춘 이벤트
- 브라우저 접속 후 `join` 이벤트로 `{ name }` 전송
- 이동 시 `move` 이벤트로 `{ x, z, rotation }` 전송
- 서버는 `state` 이벤트로 `{ players: [...] }` 전송
- 인원이 10명이면 새 플레이어에게 `room-full` 이벤트 전송
- `player-count` 이벤트로 현재 접속 인원 전송

## Render 배포 방법
1. 이 ZIP을 압축 해제합니다.
2. GitHub에서 새 저장소를 만듭니다.
3. 압축 해제한 폴더 안의 `package.json`, `server.js`, `render.yaml`, `README.md`를 저장소 최상위에 올립니다.
4. Render Dashboard에서 **New → Web Service**를 선택합니다.
5. GitHub 저장소를 연결합니다.
6. 설정:
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
7. **Create Web Service**를 누릅니다.
8. 배포가 끝나면 `https://서비스이름.onrender.com/health`에 접속해 `ok: true`가 나오는지 확인합니다.
9. Canva 게임 시작 화면의 서버 주소 칸에 `https://서비스이름.onrender.com`을 입력합니다.

## 중요
- 이 서버는 게임 화면을 호스팅하지 않습니다. Canva에서 게시한 게임 화면과 별도로 동작하는 멀티플레이 통신 서버입니다.
- Canva 게임의 서버 주소 칸에는 Render 서비스의 기본 HTTPS 주소를 넣으세요. `/health`를 붙이지 마세요.
- Render 무료 플랜은 유휴 시 잠들 수 있어 첫 접속이 느릴 수 있습니다.
- 현재는 간단한 프로토타입입니다. 계정, 방 비밀번호, 채팅, 저장, 권한 검증, 강한 치트 방지는 포함하지 않습니다.
