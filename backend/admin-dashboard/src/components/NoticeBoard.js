import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, List, ListItem, ListItemText, CircularProgress, Pagination } from '@mui/material';

const NoticeBoard = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [editingNotice, setEditingNotice] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');  // 검색어 상태 추가
    const limit = 5;

    useEffect(() => {
        fetchNotices();
    }, [page, search]);  // 페이지나 검색어가 변경될 때마다 공지사항 목록을 불러옴

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
        if (image) {
            formData.append('image', image);
        }

        if (editingNotice) {
            axios.put(`http://localhost:5001/api/notice/${editingNotice}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
                .then(() => {
                    alert('공지사항이 성공적으로 수정되었습니다!');
                    setTitle('');
                    setContent('');
                    setImage(null);
                    setImagePreview('');
                    setEditingNotice(null);
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
                    setTitle('');
                    setContent('');
                    setImage(null);
                    setImagePreview('');
                    fetchNotices();
                })
                .catch((error) => {
                    console.error('공지사항 등록 중 오류 발생:', error);
                });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = (notice) => {
        setTitle(notice.title);
        setContent(notice.content);
        setEditingNotice(notice.id);
        if (notice.image) {
            setImagePreview(`http://localhost:5001${notice.image}`);
        }
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
            <Box sx={{ mt: 4, p: 3, border: '1px solid #ddd', borderRadius: '8px' }}>
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
                    <input type="file" onChange={handleImageChange} accept="image/*" />
                    {imagePreview && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">이미지 미리보기:</Typography>
                            <img src={imagePreview} alt="Image preview" style={{ maxWidth: '100%', marginTop: '10px' }} />
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
                        {notices.map((notice) => (
                            <ListItem key={notice.id} sx={{ mb: 2, border: '1px solid #ddd', borderRadius: '8px', p: 2, display: 'block' }}>
                                <ListItemText
                                    primary={notice.title}
                                    secondary={
                                        <>
                                            <Typography variant="body2" color="textSecondary">
                                                {notice.content}
                                            </Typography>
                                            {notice.image && (
                                                <img src={`http://localhost:5001${notice.image}`} alt={notice.title} style={{ maxWidth: '100%', marginTop: '10px' }} />
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
                        ))}
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