const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5001;

// MySQL 연결 설정 (환경 변수를 사용하는 것이 더 좋습니다.)
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '081365',
    database: process.env.DB_NAME || 'noticeboard'
});

// MySQL 연결
db.connect((err) => {
    if (err) {
        console.error('MySQL 연결 오류:', err);
        return;
    }
    console.log('MySQL에 연결되었습니다.');
});

// 업로드 폴더 생성 함수
const createUploadDir = () => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
        console.log('Uploads 폴더가 생성되었습니다.');
    }
};

createUploadDir();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 로그 기록 함수
const logToFile = (message) => {
    const logFilePath = path.join(__dirname, 'server-log.txt');
    const logMessage = `${new Date().toLocaleString()}: ${message}\n`;
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('로그 파일 기록 중 오류 발생:', err);
        }
    });
};

// multer 설정 (여러 이미지 및 파일 허용)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('이미지 및 문서 파일만 업로드 가능합니다.'));
    }
};

const upload = multer({ storage, fileFilter });

// 공통 SQL 실행 함수
const executeQuery = (query, params, callback) => {
    db.query(query, params, (err, results) => {
        if (err) {
            console.error('SQL 실행 오류:', err);
            return callback(err);
        }
        callback(null, results);
    });
};

// 공지사항 작성 엔드포인트 (POST 요청 + 여러 이미지 및 파일 업로드)
app.post('/api/notice', upload.fields([{ name: 'images', maxCount: 5 }, { name: 'files', maxCount: 5 }]), (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: '제목과 내용을 입력해야 합니다.' });
    }

    // 업로드된 이미지와 파일 경로 처리
    const images = req.files['images'] ? req.files['images'].map(file => `/uploads/${file.filename}`) : [];
    const files = req.files['files'] ? req.files['files'].map(file => `/uploads/${file.filename}`) : [];

    // 데이터를 DB에 저장
    const query = 'INSERT INTO notices (title, content, images, files) VALUES (?, ?, ?, ?)';
    const values = [title, content, JSON.stringify(images), JSON.stringify(files)];

    executeQuery(query, values, (err, result) => {
        if (err) {
            console.error('공지사항 저장 오류:', err);
            return res.status(500).json({ error: '데이터 저장 중 오류가 발생했습니다.' });
        }
        const logMessage = `공지사항 작성 (제목: ${title}, 내용: ${content}, 이미지: ${JSON.stringify(images)}, 파일: ${JSON.stringify(files)})`;
        logToFile(logMessage);
        res.status(200).json({ message: '공지사항이 성공적으로 저장되었습니다.' });
    });
});

// 공지사항 목록 불러오기 엔드포인트 (GET 요청 + 페이지네이션 + 검색)
app.get('/api/notices', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : '%';

    const query = 'SELECT * FROM notices WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const countQuery = 'SELECT COUNT(*) AS total FROM notices WHERE title LIKE ? OR content LIKE ?';

    executeQuery(query, [search, search, limit, offset], (err, results) => {
        if (err) {
            return res.status(500).json({ error: '공지사항 불러오기 중 오류가 발생했습니다.' });
        }

        executeQuery(countQuery, [search, search], (err, countResults) => {
            if (err) {
                return res.status(500).json({ error: '공지사항 개수 불러오기 중 오류가 발생했습니다.' });
            }

            const totalNotices = countResults[0].total;
            res.status(200).json({ notices: results, total: totalNotices, page, limit });
        });
    });
});

// 공지사항 수정 엔드포인트 (PUT 요청 + 이미지 및 파일 수정)
app.put('/api/notice/:id', upload.fields([{ name: 'images', maxCount: 5 }, { name: 'files', maxCount: 5 }]), (req, res) => {
    const { title, content } = req.body;
    const { id } = req.params;
    const images = req.files['images'] ? req.files['images'].map(file => `/uploads/${file.filename}`) : null;
    const files = req.files['files'] ? req.files['files'].map(file => `/uploads/${file.filename}`) : null;

    if (!title || !content) {
        return res.status(400).json({ error: '제목과 내용을 입력해야 합니다.' });
    }

    const query = 'UPDATE notices SET title = ?, content = ?, images = IFNULL(?, images), files = IFNULL(?, files) WHERE id = ?';
    executeQuery(query, [title, content, JSON.stringify(images), JSON.stringify(files), id], (err) => {
        if (err) {
            logToFile(`공지사항 수정 실패 (ID: ${id})`);
            return res.status(500).json({ error: '공지사항 수정 중 오류가 발생했습니다.' });
        }
        const logMessage = `공지사항 수정 (ID: ${id}, 제목: ${title}, 내용: ${content}, 이미지: ${JSON.stringify(images)}, 파일: ${JSON.stringify(files)})`;
        logToFile(logMessage);
        res.status(200).json({ message: '공지사항이 성공적으로 수정되었습니다.' });
    });
});

// 공지사항 삭제 엔드포인트 (DELETE 요청)
app.delete('/api/notice/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM notices WHERE id = ?';

    executeQuery(query, [id], (err) => {
        if (err) {
            logToFile(`공지사항 삭제 실패 (ID: ${id})`);
            return res.status(500).json({ error: '공지사항 삭제 중 오류가 발생했습니다.' });
        }
        const logMessage = `공지사항 삭제 (ID: ${id})`;
        logToFile(logMessage);
        res.status(200).json({ message: '공지사항이 성공적으로 삭제되었습니다.' });
    });
});

// 공지사항 상세 불러오기 엔드포인트 (GET 요청)
app.get('/api/notice/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM notices WHERE id = ?';

    executeQuery(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: '공지사항 불러오기 중 오류가 발생했습니다.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: '해당 공지사항을 찾을 수 없습니다.' });
        }
        res.status(200).json(results[0]);
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});