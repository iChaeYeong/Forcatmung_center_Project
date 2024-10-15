import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Box, List, ListItem, ListItemText, CircularProgress, Pagination, Typography } from '@mui/material';

const NoticeBoard = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [files, setFiles] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [editingNotice, setEditingNotice] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 5;

    // useCallback을 사용하여 fetchNotices 함수의 메모이제이션
    const fetchNotices = useCallback(() => {
        setLoading(true);
        axios.get(`http://localhost:5001/api/notices?page=${page}&limit=${limit}&search=${search}`)
            .then((response) => {
                console.log('API 응답 데이터:', response.data); // 응답 데이터를 확인
                setNotices(response.data.notices);
                setTotalPages(Math.ceil(response.data.total / limit));
                setLoading(false);
            })
            .catch((error) => {
                console.error('공지사항 데이터를 불러오는 중 오류 발생:', error);
                setLoading(false);
            });
    }, [page, search]);

    useEffect(() => {
        fetchNotices();
    }, [fetchNotices]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !content) {
            alert('제목과 내용을 입력해 주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);

        images.forEach((image) => formData.append('images', image));
        files.forEach((file) => formData.append('files', file));

        if (editingNotice) {
            axios.put(`http://localhost:5001/api/notice/${editingNotice}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
                .then(() => {
                    alert('공지사항이 성공적으로 수정되었습니다!');
                    resetForm();
                    fetchNotices();
                })
                .catch((error) => {
                    console.error('공지사항 수정 중 오류 발생:', error);
                });
        } else {
            axios.post('http://localhost:5001/api/notice', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
                .then(() => {
                    alert('공지사항이 성공적으로 등록되었습니다!');
                    resetForm();
                    fetchNotices();
                })
                .catch((error) => {
                    console.error('공지사항 등록 중 오류 발생:', error);
                });
        }
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setImages([]);
        setFiles([]);
        setImagePreviews([]);
        setFilePreviews([]);
        setEditingNotice(null);
    };

    const handleImageChange = (e) => {
        const selectedImages = Array.from(e.target.files);
        setImages(selectedImages);
        const previews = selectedImages.map((image) => URL.createObjectURL(image));
        setImagePreviews(previews);
    };

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
        const previews = Array.from(e.target.files).map(file => file.name);
        setFilePreviews(previews);
    };

    const handleEdit = (notice) => {
        setTitle(notice.title);
        setContent(notice.content);
        setEditingNotice(notice.id);

        const parsedImages = safeJsonParse(notice.images);
        const parsedFiles = safeJsonParse(notice.files);

        setImagePreviews(parsedImages.map(image => `http://localhost:5001${image}`));
        setFilePreviews(parsedFiles.map(file => file.split('/').pop()));
    };

    const handleDelete = (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            axios.delete(`http://localhost:5001/api/notice/${id}`)
                .then(() => {
                    fetchNotices();
                    alert('공지사항이 성공적으로 삭제되었습니다!');
                })
                .catch((error) => {
                    console.error('공지사항 삭제 중 오류 발생:', error);
                });
        }
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const safeJsonParse = (jsonString) => {
        // 이미 배열인 경우 그대로 반환
        if (Array.isArray(jsonString)) {
            return jsonString;
        }

        if (typeof jsonString !== 'string') {
            console.log('JSON이 문자열이 아닙니다:', jsonString);
            return [];
        }

        if (!jsonString || jsonString === 'null' || jsonString.trim() === '') {
            console.log('JSON이 비어있거나 null입니다:', jsonString);
            return [];
        }

        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('JSON 파싱 오류:', error, '원본 데이터:', jsonString);
            return [];
        }
    };
    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4, p: 3, border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <Typography variant="h4" gutterBottom>
                    {editingNotice ? '공지사항 수정' : '공지사항 작성'}
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="제목"
                        variant="outlined"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="내용"
                        variant="outlined"
                        multiline
                        rows={4}
                        fullWidth
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <Typography variant="subtitle1" sx={{ mt: 2 }}>이미지 업로드:</Typography>
                    <input type="file" onChange={handleImageChange} accept="image/*" multiple />
                    {imagePreviews.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {imagePreviews.map((preview, index) => (
                                <img key={index} src={preview} alt={`Notice ${index}`} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                            ))}
                        </Box>
                    )}

                    <Typography variant="subtitle1" sx={{ mt: 2 }}>파일 업로드 (PDF, 문서 등):</Typography>
                    <input type="file" onChange={handleFileChange} multiple />
                    {filePreviews.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                            {filePreviews.map((file, index) => (
                                <Typography key={index} variant="body2">{file}</Typography>
                            ))}
                        </Box>
                    )}

                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        {editingNotice ? '수정 완료' : '작성'}
                    </Button>
                </form>
            </Box>

            <TextField
                label="검색"
                variant="outlined"
                fullWidth
                value={search}
                onChange={handleSearchChange}
                sx={{ mt: 4, mb: 4 }}
            />

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    공지사항 목록
                </Typography>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <List>
                        {notices.map((notice) => {
                            const noticeImages = safeJsonParse(notice.images);
                            const noticeFiles = safeJsonParse(notice.files);

                            return (
                                <ListItem key={notice.id} sx={{ mb: 2, border: '1px solid #ddd', borderRadius: '8px', p: 2, backgroundColor: '#fff' }}>
                                    <ListItemText
                                        primary={notice.title}
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="textSecondary">
                                                    {notice.content}
                                                </Typography>
                                                {Array.isArray(noticeImages) && noticeImages.length > 0 && (
                                                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {noticeImages.map((image, index) => {
                                                            console.log("이미지 경로:", `http://localhost:5001${image}`); // 경로를 콘솔에 출력하여 확인
                                                            return (
                                                                <img key={index} src={`http://localhost:5001${image}`} alt={`Notice image ${index}`} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                                            );
                                                        })}
                                                    </Box>
                                                )}

                                                {Array.isArray(noticeFiles) && noticeFiles.length > 0 && (
                                                    <Box sx={{ mt: 2 }}>
                                                        <Typography component="div" variant="subtitle1">첨부 파일:</Typography>
                                                        {noticeFiles.map((file, index) => (
                                                            <a key={index} href={`http://localhost:5001${file}`} download>
                                                                {file.split('/').pop()}
                                                            </a>
                                                        ))}
                                                    </Box>
                                                )}
                                                <Typography variant="caption" color="textSecondary">
                                                    {new Date(notice.created_at).toLocaleString()}
                                                </Typography>
                                            </>
                                        }
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        <Button onClick={() => handleEdit(notice)} variant="contained" color="secondary" sx={{ mr: 1 }}>
                                            수정
                                        </Button>
                                        <Button onClick={() => handleDelete(notice.id)} variant="contained" color="error">
                                            삭제
                                        </Button>
                                    </Box>
                                </ListItem>
                            );
                        })}
                    </List>
                )}


                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}
                />
            </Box>
        </Container>
    );
};

export default NoticeBoard;