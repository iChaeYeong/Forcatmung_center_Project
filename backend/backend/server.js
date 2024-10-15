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

// 공통 SQL 실행 함수
const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
            if (err) {
                console.error('SQL 실행 오류:', err);
                return reject(err);
            }
            resolve(results);
        });
    });
};

// 업로드 폴더 생성 함수
const createUploadDirs = () => {
    const dirs = ['uploads/notice', 'uploads/animals'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`${dir} 폴더가 생성되었습니다.`);
        }
    });
};

createUploadDirs();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// multer 설정 (여러 이미지 및 파일 허용)
const storageConfig = (uploadPath) => multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});

const fileFilter = (allowedFileTypes) => (req, file, cb) => {
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);
    cb(null, extname && mimetype);
};

// 공지사항 업로드 설정
const noticeUpload = multer({
    storage: storageConfig('uploads/notice'),
    fileFilter: fileFilter(/jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx/)
});

// 동물 이미지 업로드 설정
const animalUpload = multer({
    storage: storageConfig('uploads/animals'),
    fileFilter: fileFilter(/jpeg|jpg|png/)
});

// 공지사항 작성 엔드포인트
app.post('/api/notice', noticeUpload.fields([{ name: 'images', maxCount: 5 }, { name: 'files', maxCount: 5 }]), (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: '제목과 내용을 입력해야 합니다.' });
    }

    const images = req.files['images'] ? req.files['images'].map(file => `/uploads/notice/${file.filename}`) : [];
    const files = req.files['files'] ? req.files['files'].map(file => `/uploads/notice/${file.filename}`) : [];

    const query = 'INSERT INTO notices (title, content, images, files) VALUES (?, ?, ?, ?)';
    const values = [title, content, JSON.stringify(images), JSON.stringify(files)];

    executeQuery(query, values)
        .then(() => {
            res.status(200).json({ message: '공지사항이 성공적으로 저장되었습니다.' });
        })
        .catch(err => {
            console.error('공지사항 저장 오류:', err);
            res.status(500).json({ error: '데이터 저장 중 오류가 발생했습니다.' });
        });
});

// 공지사항 목록 불러오기 엔드포인트
app.get('/api/notices', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : '%';

    const query = 'SELECT * FROM notices WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const countQuery = 'SELECT COUNT(*) AS total FROM notices WHERE title LIKE ? OR content LIKE ?';

    executeQuery(query, [search, search, limit, offset])
        .then(results => executeQuery(countQuery, [search, search])
            .then(countResults => res.status(200).json({
                notices: results,
                total: countResults[0].total,
                page,
                limit
            }))
        )
        .catch(err => res.status(500).json({ error: '공지사항 불러오기 중 오류가 발생했습니다.' }));
});

// 공지사항 수정 엔드포인트
app.put('/api/notice/:id', noticeUpload.fields([{ name: 'images', maxCount: 5 }, { name: 'files', maxCount: 5 }]), (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    const images = req.files['images'] ? req.files['images'].map(file => `/uploads/notice/${file.filename}`) : [];
    const files = req.files['files'] ? req.files['files'].map(file => `/uploads/notice/${file.filename}`) : [];

    const query = 'UPDATE notices SET title = ?, content = ?, images = ?, files = ? WHERE id = ?';
    const values = [title, content, JSON.stringify(images), JSON.stringify(files), id];

    executeQuery(query, values)
        .then((result) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: '공지사항을 찾을 수 없습니다.' });
            }
            res.status(200).json({ message: '공지사항이 성공적으로 수정되었습니다.' });
        })
        .catch(err => {
            console.error('공지사항 수정 오류:', err);
            res.status(500).json({ error: '공지사항 수정 중 오류가 발생했습니다.' });
        });
});

// 공지사항 삭제 엔드포인트
app.delete('/api/notice/:id', async (req, res) => {
    const noticeId = req.params.id;

    const query = 'DELETE FROM notices WHERE id = ?';
    try {
        const result = await executeQuery(query, [noticeId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '공지사항을 찾을 수 없습니다.' });
        }
        res.status(200).json({ message: '공지사항이 성공적으로 삭제되었습니다.' });
    } catch (err) {
        console.error('공지사항 삭제 중 오류 발생:', err);
        return res.status(500).json({ error: '공지사항 삭제 중 오류가 발생했습니다.' });
    }
});

// 동물 정보 저장 엔드포인트
app.post('/api/animals', animalUpload.array('images', 5), async (req, res) => {
    const { name, species, age, breed, description, mainImageIndex, gender, characteristics, adoption_priority } = req.body;

    if (!name || !species) {
        return res.status(400).json({ error: '이름과 종류는 필수 입력 사항입니다.' });
    }

    const images = req.files ? req.files.map(file => `/uploads/animals/${file.filename}`) : [];
    const mainImage = images[mainImageIndex] || images[0] || null;

    const query = 'INSERT INTO animals (name, species, age, breed, description, gender, characteristics, images, mainImage, adoption_priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [name, species, age, breed, description, gender, characteristics, JSON.stringify(images), mainImage, adoption_priority];

    try {
        await executeQuery(query, values);
        res.status(200).json({ message: '동물 정보가 성공적으로 저장되었습니다.' });
    } catch (err) {
        console.error('동물 정보 저장 중 오류 발생:', err);
        res.status(500).json({ error: '동물 정보를 저장하는 중 오류가 발생했습니다.' });
    }
});

// 동물 목록 불러오기 엔드포인트
app.get('/api/animals', async (req, res) => {
    const category = req.query.category || 'all';

    let query = 'SELECT * FROM animals';
    const params = [];

    if (category !== 'all') {
        query += ' WHERE species = ?';
        params.push(category);
    }

    query += ' ORDER BY adoption_priority DESC, created_at DESC';

    try {
        const results = await executeQuery(query, params);
        res.status(200).json(results);
    } catch (err) {
        console.error('동물 목록 불러오기 중 오류 발생:', err);
        return res.status(500).json({ error: '동물 목록 불러오기 중 오류가 발생했습니다.' });
    }
});

// 동물 수정 엔드포인트
app.put('/api/animals/:id', animalUpload.array('images', 5), async (req, res) => {
    const { id } = req.params;
    const { name, species, age, breed, description, gender, characteristics, mainImageIndex, adoption_priority } = req.body;

    const images = req.files ? req.files.map(file => `/uploads/animals/${file.filename}`) : [];
    const mainImage = images[mainImageIndex] || images[0] || null;

    const query = 'UPDATE animals SET name = ?, species = ?, age = ?, breed = ?, description = ?, gender = ?, characteristics = ?, images = ?, mainImage = ?, adoption_priority = ? WHERE id = ?';
    const values = [name, species, age, breed, description, gender, characteristics, JSON.stringify(images), mainImage, adoption_priority, id];

    try {
        const result = await executeQuery(query, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '동물을 찾을 수 없습니다.' });
        }
        res.status(200).json({ message: '동물 정보가 성공적으로 수정되었습니다.' });
    } catch (err) {
        console.error('동물 정보 수정 중 오류 발생:', err);
        res.status(500).json({ error: '동물 정보를 수정하는 중 오류가 발생했습니다.' });
    }
});

// 동물 삭제 엔드포인트
app.delete('/api/animals/:id', async (req, res) => {
    const animalId = req.params.id;

    const query = 'DELETE FROM animals WHERE id = ?';
    try {
        const result = await executeQuery(query, [animalId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '동물을 찾을 수 없습니다.' });
        }
        res.status(200).json({ message: '동물이 성공적으로 삭제되었습니다.' });
    } catch (err) {
        console.error('동물 삭제 중 오류 발생:', err);
        return res.status(500).json({ error: '동물 삭제 중 오류가 발생했습니다.' });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});