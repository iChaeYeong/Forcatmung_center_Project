const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');  // 파일 업로드용 multer
const fs = require('fs');  // 파일 시스템 접근용
const path = require('path');  // 파일 경로 처리용
const app = express();
const PORT = 5001;

// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '081365',  // MySQL root 계정 비밀번호
    database: 'noticeboard'
});

// 데이터베이스 연결 확인
db.connect((err) => {
    if (err) {
        console.error('MySQL 연결 오류:', err);
        return;
    }
    console.log('MySQL에 연결되었습니다.');
});

// 업로드 폴더 생성 (폴더가 없으면 생성)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('Uploads 폴더가 생성되었습니다.');
}

// CORS 및 JSON 파싱 설정
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));  // 업로드된 파일에 대한 정적 경로

// 로그 기록 함수
const logFilePath = path.join(__dirname, 'server-log.txt');
const logToFile = (message) => {
    const logMessage = `${new Date().toLocaleString()}: ${message}\n`;
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('로그 파일 기록 중 오류 발생:', err);
        }
    });
};

// multer 설정 (파일 저장 경로 및 파일명 지정)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // 파일이 저장될 경로
    },
    filename: (req, file, cb) => {
        // 파일명 지정 (현재 시간 + 확장자)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// 파일 확장자 확인 (보안 강화)
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// 공지사항 작성 엔드포인트 (POST 요청 + 이미지 업로드)
app.post('/api/notice', upload.single('image'), (req, res) => {
    const { title, content } = req.body;

    // 필수 필드 확인
    if (!title || !content) {
        return res.status(400).json({ error: '제목과 내용을 입력해야 합니다.' });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;  // 파일이 있을 경우 경로 저장

    // MySQL에 공지사항 및 이미지 저장
    const query = 'INSERT INTO notices (title, content, image) VALUES (?, ?, ?)';
    db.query(query, [title, content, image], (err, result) => {
        if (err) {
            console.error('공지사항 저장 오류:', err);
            return res.status(500).json({ error: '데이터 저장 중 오류가 발생했습니다.' });
        }
        const logMessage = `공지사항 작성 (제목: ${title}, 내용: ${content}, 이미지: ${image})`;
        console.log(logMessage);
        logToFile(logMessage);
        res.status(200).json({ message: '공지사항이 성공적으로 저장되었습니다.' });
    });
});

// 공지사항 목록 불러오기 엔드포인트 (GET 요청)
app.get('/api/notices', (req, res) => {
    const query = 'SELECT * FROM notices ORDER BY created_at DESC';  // 최신순으로 정렬
    db.query(query, (err, results) => {
        if (err) {
            console.error('공지사항 불러오기 오류:', err);
            return res.status(500).json({ error: '데이터 불러오기 중 오류가 발생했습니다.' });
        }
        res.status(200).json(results);
    });
});

// 공지사항 수정 엔드포인트 (PUT 요청 + 이미지 수정)
app.put('/api/notice/:id', upload.single('image'), (req, res) => {
    const { title, content } = req.body;
    const { id } = req.params;
    const image = req.file ? `/uploads/${req.file.filename}` : null;  // 새 이미지가 있을 경우 업데이트

    // 필수 필드 확인
    if (!title || !content) {
        return res.status(400).json({ error: '제목과 내용을 입력해야 합니다.' });
    }

    // 이미지가 있으면 업데이트, 없으면 기존 이미지 유지
    const query = 'UPDATE notices SET title = ?, content = ?, image = IFNULL(?, image) WHERE id = ?';
    db.query(query, [title, content, image, id], (err, result) => {
        if (err) {
            console.error('공지사항 수정 오류:', err);
            logToFile(`공지사항 수정 실패 (ID: ${id})`);
            return res.status(500).json({ error: '공지사항 수정 중 오류가 발생했습니다.' });
        }
        const logMessage = `공지사항 수정 (ID: ${id}, 제목: ${title}, 내용: ${content}, 이미지: ${image})`;
        console.log(logMessage);
        logToFile(logMessage);
        res.status(200).json({ message: '공지사항이 성공적으로 수정되었습니다.' });
    });
});

// 공지사항 삭제 엔드포인트 (DELETE 요청)
app.delete('/api/notice/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM notices WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('공지사항 삭제 오류:', err);
            logToFile(`공지사항 삭제 실패 (ID: ${id})`);
            return res.status(500).json({ error: '공지사항 삭제 중 오류가 발생했습니다.' });
        }
        const logMessage = `공지사항 삭제 (ID: ${id})`;
        console.log(logMessage);
        logToFile(logMessage);
        res.status(200).json({ message: '공지사항이 성공적으로 삭제되었습니다.' });
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});