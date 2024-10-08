import React from 'react';
import NoticeBoard from './components/NoticeBoard';  // 우리가 만든 NoticeBoard 컴포넌트 불러오기

function App() {
    return (
        <div className="App">
            <h1>Admin Page</h1>  {/* 간단한 헤더 추가 */}
            <NoticeBoard />  {/* 공지사항 작성 폼 추가 */}
        </div>
    );
}

export default App;
