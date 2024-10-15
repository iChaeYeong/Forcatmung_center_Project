import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NoticeBoard from './components/NoticeBoard';
import NoticeDetail from './components/NoticeDetail';
import AdminMain from './components/AdminMain';
import AnimalForm from './components/AnimalForm';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/admin" />} />
                <Route path="/admin" element={<AdminMain />} />
                <Route path="/admin/noticeboard" element={<NoticeBoard />} />
                <Route path="/admin/notice/:id" element={<NoticeDetail />} />
                <Route path="/admin/animals" element={<AnimalForm />} />
                {/* /notice/:id 경로를 추가 */}
                <Route path="/notice/:id" element={<NoticeDetail />} />
            </Routes>
        </Router>
    );
}

export default App;