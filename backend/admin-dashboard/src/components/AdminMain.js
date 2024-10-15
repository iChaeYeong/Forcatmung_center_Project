// src/components/AdminMain.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Box, Typography } from '@mui/material';

const AdminMain = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                관리자 메인 페이지
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/admin/noticeboard')}>
                    공지사항 관리
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/admin/animals')}>
                    동물 정보 관리
                </Button>
            </Box>
        </Container>
    );
};

export default AdminMain;