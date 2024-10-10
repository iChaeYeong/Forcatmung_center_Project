import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NoticeBoard from './components/NoticeBoard';
import NoticeDetail from './components/NoticeDetail';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<NoticeBoard />} />
                <Route path="/notice/:id" element={<NoticeDetail />} /> {/* 세부 페이지 라우트 */}
            </Routes>
        </Router>
    );
}

export default App;