import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress } from '@mui/material';

const NoticeDetail = () => {
    const { id } = useParams();  // URL 파라미터로 공지사항 ID를 가져옴
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:5001/api/notice/${id}`)
            .then((response) => {
                setNotice(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('공지사항 불러오기 오류:', error);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <CircularProgress />;
    }

    if (!notice) {
        return <Typography>해당 공지사항을 찾을 수 없습니다.</Typography>;
    }

    // JSON 파싱
    const noticeImages = notice.images ? JSON.parse(notice.images) : [];
    const noticeFiles = notice.files ? JSON.parse(notice.files) : [];

    return (
        <Container maxWidth="md"> {/* 이미지가 크게 보이도록 maxWidth를 'md'로 확장 */}
            <Box sx={{ mt: 4, p: 3, border: '1px solid #ddd', borderRadius: '8px' }}>
                <Typography variant="h4" gutterBottom>
                    {notice.title}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    {notice.content}
                </Typography>

                {/* 큰 이미지 표시 */}
                {noticeImages.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                        {noticeImages.map((image, index) => (
                            <img
                                key={index}
                                src={`http://localhost:5001${image}`}
                                alt={`Image ${index + 1}`}
                                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                        ))}
                    </Box>
                )}

                {/* 파일 다운로드 링크 */}
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

                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                    작성일: {new Date(notice.created_at).toLocaleString()}
                </Typography>
            </Box>
        </Container>
    );
};

export default NoticeDetail;