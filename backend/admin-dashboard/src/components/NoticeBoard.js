import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, List, ListItem, ListItemText, CircularProgress, Pagination } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';  // + 아이콘 추가

const NoticeBoard = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);  // 여러 이미지
    const [files, setFiles] = useState([]);  // 여러 파일
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);  // 여러 이미지 미리보기
    const [editingNotice, setEditingNotice] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');  // 검색어 상태 추가
    const limit = 5;
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotices();
    }, [page, search]);

    const fetchNotices = () => {
        setLoading(true);
        axios.get(`http://localhost:5001/api/notices?page=${page}&limit=${limit}&search=${search}`)
            .then((response) => {
                setNotices(response.data.notices);
                setTotalPages(Math.ceil(response.data.total / limit));
                setLoading(false);
            })
            .catch((error) => {
                console.error('공지사항 데이터를 불러오는 중 오류 발생:', error);
                setLoading(false);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !content) {
            alert('제목과 내용을 입력해 주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);

        images.forEach((image) => formData.append('images', image));  // 여러 이미지 추가
        files.forEach((file) => formData.append('files', file));  // 여러 파일 추가

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
        setEditingNotice(null);
    };

    const handleViewDetail = (id) => {
        navigate(`/notice/${id}`);  // 클릭 시 해당 공지사항의 상세 페이지로 이동
    };

    const handleImageChange = (e) => {
        const selectedImages = Array.from(e.target.files);
        setImages(selectedImages);
        const imagePreviews = selectedImages.map((image) => URL.createObjectURL(image));
        setImagePreviews(imagePreviews);
    };

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));  // 여러 파일 선택
    };

    const handleEdit = (notice) => {
        setTitle(notice.title);
        setContent(notice.content);
        setEditingNotice(notice.id);
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
        setSearch(e.target.value);  // 검색어 상태 변경
        setPage(1);  // 검색 시 페이지를 1로 초기화
    };

    return (
        <Container maxWidth="sm">
            {/* 공지사항 작성 폼 */}
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

                    {/* 이미지 업로드 */}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>이미지 업로드:</Typography>
                    <input type="file" onChange={handleImageChange} accept="image/*" multiple />
                    {imagePreviews.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {imagePreviews.map((preview, index) => (
                                <img key={index} src={preview} alt="Image preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                            ))}
                        </Box>
                    )}

                    {/* 파일 업로드 */}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>파일 업로드 (PDF, 문서 등):</Typography>
                    <input type="file" onChange={handleFileChange} multiple />
                    {files.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                            {files.map((file, index) => (
                                <Typography key={index} variant="body2">{file.name}</Typography>
                            ))}
                        </Box>
                    )}

                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        {editingNotice ? '수정 완료' : '작성'}
                    </Button>
                </form>
            </Box>

            {/* 검색 필드 추가 */}
            <TextField
                label="검색"
                variant="outlined"
                fullWidth
                value={search}
                onChange={handleSearchChange}
                sx={{ mt: 4, mb: 4 }}
            />

            {/* 공지사항 목록 */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    공지사항 목록
                </Typography>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <List>
                        {notices.map((notice) => {
                            // 이미지 및 파일을 JSON 배열로 변환
                            const noticeImages = notice.images ? JSON.parse(notice.images) : [];
                            const noticeFiles = notice.files ? JSON.parse(notice.files) : [];

                            return (
                                <ListItem key={notice.id} sx={{ mb: 2, border: '1px solid #ddd', borderRadius: '8px', p: 2, backgroundColor: '#fff' }}>
                                    <ListItemText
                                        primary={notice.title}
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="textSecondary">
                                                    {notice.content}
                                                </Typography>
                                                {noticeImages.length > 0 && (
                                                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {noticeImages.map((image, index) => (
                                                            <img key={index} src={`http://localhost:5001${image}`} alt={notice.title} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                                        ))}
                                                    </Box>
                                                )}
                                                {noticeFiles.length > 0 && (
                                                    <Box sx={{ mt: 2 }}>
                                                        <Typography variant="subtitle1">첨부 파일:</Typography>
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
                                        {/* 세부 페이지로 이동하는 + 아이콘 */}
                                        <Button onClick={() => handleViewDetail(notice.id)} sx={{ ml: 1 }}>
                                            <AddCircleOutlineIcon />
                                        </Button>
                                    </Box>
                                </ListItem>
                            );
                        })}
                    </List>
                )}

                {/* 페이지네이션 */}
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