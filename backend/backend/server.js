const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5001;

// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '081365',
    database: 'noticeboard'
});

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

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

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

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

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

    if (!title || !content) {
        return res.status(400).json({ error: '제목과 내용을 입력해야 합니다.' });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;
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

// 공지사항 목록 불러오기 엔드포인트 (GET 요청 + 페이지네이션 + 검색)
app.get('/api/notices', (req, res) => {
    const page = parseInt(req.query.page) || 1;  // 요청된 페이지 번호, 기본값 1
    const limit = parseInt(req.query.limit) || 5;  // 페이지당 항목 수, 기본값 5
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : '%';  // 검색어가 있으면 적용, 없으면 전체 검색

    const query = 'SELECT * FROM notices WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    db.query(query, [search, search, limit, offset], (err, results) => {
        if (err) {
            console.error('공지사항 불러오기 오류:', err);
            return res.status(500).json({ error: '데이터 불러오기 중 오류가 발생했습니다.' });
        }

        // 총 공지사항 수를 가져와서 페이지네이션 정보도 함께 반환
        const countQuery = 'SELECT COUNT(*) AS total FROM notices WHERE title LIKE ? OR content LIKE ?';
        db.query(countQuery, [search, search], (err, countResults) => {
            if (err) {
                console.error('공지사항 개수 불러오기 오류:', err);
                return res.status(500).json({ error: '데이터 불러오기 중 오류가 발생했습니다.' });
            }
            const totalNotices = countResults[0].total;
            res.status(200).json({ notices: results, total: totalNotices, page, limit });
        });
    });
});

// 공지사항 수정 엔드포인트 (PUT 요청 + 이미지 수정)
app.put('/api/notice/:id', upload.single('image'), (req, res) => {
    const { title, content } = req.body;
    const { id } = req.params;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !content) {
        return res.status(400).json({ error: '제목과 내용을 입력해야 합니다.' });
    }

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