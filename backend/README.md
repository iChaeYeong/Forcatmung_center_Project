# 백앤드 정리

## 기능
1. **공지사항 작성**
   - 제목, 내용, 이미지 파일을 포함하여 새로운 공지사항 추가.
   - 이미지 파일은 서버의 `uploads` 폴더에 저장됨.

2. **공지사항 목록 조회**
   - 저장된 모든 공지사항을 최신 순으로 조회 가능.

3. **공지사항 수정**
   - 기존의 공지사항 제목, 내용 및 이미지 파일 수정.
   - 이미지 파일을 선택하지 않으면 기존 이미지 유지.

4. **공지사항 삭제**
   - 선택한 공지사항을 삭제할 수 있음.

5. **로그 기록**
   - 모든 수정 및 삭제 작업이 서버 콘솔과 `server-log.txt` 파일에 기록됨.

## 기술 스택
- **Backend**
  - Node.js
  - Express.js
  - MySQL
  - Multer (파일 업로드)
  - CORS

- **Frontend**
  - React.js
  - Axios (HTTP 요청)

## 서버 실행 방법
1. **환경 설정**
   - Node.js 및 MySQL 설치 필요.
   - `mysql2` 및 `multer` 패키지 설치.

   ```bash
   npm install mysql2 multer
   ```

2. **데이터베이스 생성**
   - MySQL에 접속하여 `noticeboard`라는 데이터베이스 및 `notices` 테이블 생성.

   ```sql
   CREATE DATABASE noticeboard;

   USE noticeboard;

   CREATE TABLE notices (
       id INT AUTO_INCREMENT PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       content TEXT NOT NULL,
       image VARCHAR(255),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **서버 실행**
   - 프로젝트 디렉터리에서 다음 명령어로 서버 실행.

   ```bash
   node server.js
   ```

## React 실행 방법
1. **React 앱 실행**
   - React 앱이 있는 디렉터리로 이동한 후, 다음 명령어로 React 앱 실행.

   ```bash
   npm start
   ```
