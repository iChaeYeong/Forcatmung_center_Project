import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, List, ListItem, ListItemText, CircularProgress } from '@mui/material';

const NoticeBoard = () => {
    const [title, setTitle] = useState('');  // 제목 입력 상태
    const [content, setContent] = useState('');  // 내용 입력 상태
    const [image, setImage] = useState(null);  // 이미지 파일 상태
    const [notices, setNotices] = useState([]);  // 공지사항 목록 상태
    const [loading, setLoading] = useState(false);  // 로딩 상태
    const [imagePreview, setImagePreview] = useState('');  // 이미지 미리보기
    const [editingNotice, setEditingNotice] = useState(null);  // 수정 중인 공지사항

    // 공지사항 목록 불러오기
    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = () => {
        setLoading(true);
        axios.get('http://localhost:5001/api/notices')
            .then((response) => {
                setNotices(response.data);
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
            formData.append('image', image);  // 이미지 파일 추가
        }

        if (editingNotice) {
            // 수정 요청
            axios.put(`http://localhost:5001/api/notice/${editingNotice}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((response) => {
                    alert('공지사항이 성공적으로 수정되었습니다!');
                    setTitle('');
                    setContent('');
                    setImage(null);
                    setImagePreview('');
                    setEditingNotice(null);
                    fetchNotices();  // 목록 갱신
                })
                .catch((error) => {
                    console.error('공지사항 수정 중 오류 발생:', error);
                });
        } else {
            // 새 공지사항 작성 요청
            axios.post('http://localhost:5001/api/notice', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((response) => {
                    console.log('Response:', response.data);
                    alert('공지사항이 성공적으로 등록되었습니다!');
                    setTitle('');
                    setContent('');
                    setImage(null);
                    setImagePreview('');  // 이미지 미리보기 초기화
                    fetchNotices();  // 목록 갱신
                })
                .catch((error) => {
                    console.error('There was an error!', error);
                });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);  // 선택된 파일 설정

        // 이미지 미리보기 설정
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
        setEditingNotice(notice.id);  // 수정 중인 공지사항 설정
        if (notice.image) {
            setImagePreview(`http://localhost:5001${notice.image}`);  // 이미지 미리보기 설정
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            axios.delete(`http://localhost:5001/api/notice/${id}`)
                .then(() => {
                    fetchNotices();  // 삭제 후 목록 갱신
                    alert('공지사항이 성공적으로 삭제되었습니다!');
                })
                .catch((error) => {
                    console.error('공지사항 삭제 중 오류 발생:', error);
                });
        }
    };

    return (
        <Container maxWidth="sm">
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

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    공지사항 목록
                </Typography>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <List>
                        {notices.map((notice) => (
                            <ListItem key={notice.id} sx={{ mb: 2, border: '1px solid #ddd', borderRadius: '8px', p: 2 }}>
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                    <Button onClick={() => handleEdit(notice)} variant="contained" color="secondary" size="small">
                                        수정
                                    </Button>
                                    <Button onClick={() => handleDelete(notice.id)} variant="contained" color="error" size="small">
                                        삭제
                                    </Button>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Container>
    );
};

export default NoticeBoard;