let currentPage = 1;
const rowsPerPage = 5;

// 공지사항 데이터를 서버에서 가져오기
function fetchNotices(page = 1, searchQuery = '', searchType = 'title') {
    const url = `http://localhost:5001/api/notices?page=${page}&limit=${rowsPerPage}&search=${searchQuery}&searchType=${searchType}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayNotices(data);
            document.getElementById('currentPage').innerText = page;
        })
        .catch(error => console.error('공지사항 데이터를 가져오는 중 오류 발생:', error));
}

// 공지사항 데이터를 HTML에 표시
function displayNotices(data) {
    const noticeList = document.getElementById('notice-list');
    noticeList.innerHTML = ''; // 기존 리스트 비우기

    data.notices.forEach((notice) => {
        const row = document.createElement('tr');

        // 파일 첨부 여부만 표시, 다운로드 링크는 표시하지 않음
        const fileAttached = notice.files && notice.files.length > 0 ? 'o' : 'x';

        row.innerHTML = `
            <td>${notice.id}</td>
            <td><a href="notice_detail.html?id=${notice.id}">${notice.title}</a></td>
            <td>관리자</td>
            <td>${new Date(notice.created_at).toLocaleDateString()}</td>
            <td>${notice.views || 0}</td>
            <td>${fileAttached}</td>
        `;

        noticeList.appendChild(row);
    });
}

// 검색 기능
function searchNotices() {
    const searchQuery = document.getElementById('search').value;
    const searchType = document.getElementById('searchType').value;  // 선택된 검색 타입 가져오기
    fetchNotices(1, searchQuery, searchType);  // 검색 시 1페이지부터 다시 표시
}

// 페이지 네비게이션
function nextPage() {
    currentPage++;
    fetchNotices(currentPage);
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchNotices(currentPage);
    }
}

// 페이지 로딩 시 공지사항 데이터를 불러옴
document.addEventListener('DOMContentLoaded', () => {
    fetchNotices();  // 처음에 1페이지 데이터를 가져옴
});