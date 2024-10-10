let currentPage = 1;
const rowsPerPage = 5;

// 공지사항 데이터를 서버에서 가져오기
function fetchNotices(page = 1, searchQuery = '') {
    const url = `http://localhost:5001/api/notices?page=${page}&limit=${rowsPerPage}&search=${searchQuery}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayNotices(data.notices);
            document.getElementById('currentPage').innerText = page;
        })
        .catch(error => console.error('공지사항 데이터를 가져오는 중 오류 발생:', error));
}

// 공지사항 데이터를 HTML에 표시
function displayNotices(notices) {
    const noticeList = document.getElementById('notice-list');
    noticeList.innerHTML = ''; // 기존 리스트 비우기

    notices.forEach((notice, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${notice.id}</td>
            <td><a href="notice_detail.html?id=${notice.id}">${notice.title}</a></td>
            <td>관리자</td>
            <td>${new Date(notice.created_at).toLocaleDateString()}</td>
            <td>${notice.views}</td>
            <td>
                ${notice.files && notice.files.length > 0 ? `<a href="http://localhost:5001${notice.files[0]}" download>파일 다운로드</a>` : '없음'}
            </td>
        `;

        noticeList.appendChild(row);
    });
}

// 검색 기능
function searchNotices() {
    const searchQuery = document.getElementById('search').value;
    fetchNotices(1, searchQuery);  // 검색시 1페이지부터 다시 표시
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

// 서버에서 공지사항 목록 불러오기
async function fetchNoticesFromServer() {
    try {
        const response = await fetch('http://localhost:5001/api/notices');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('공지사항 데이터를 불러오는 중 오류 발생:', error);
        return [];
    }
}

// 공지사항 목록을 화면에 표시
async function displayNotices() {
    const notices = await fetchNoticesFromServer();  // 서버에서 데이터 가져오기
    const noticeList = document.getElementById('notice-list');
    noticeList.innerHTML = ''; // 기존 리스트를 비움

    // 페이지네이션에 맞게 데이터 슬라이싱
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedNotices = notices.slice(startIndex, endIndex);

    paginatedNotices.forEach(notice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${notice.id}</td>
            <td>${notice.title}</td>
            <td>${notice.author || '관리자'}</td> <!-- DB에 author 필드가 없으면 관리자 표시 -->
            <td>${new Date(notice.created_at).toLocaleDateString()}</td> <!-- 날짜 포맷 변환 -->
            <td>${notice.views || 0}</td> <!-- 조회수는 0으로 기본 설정 -->
            <td>${notice.file ? `<a href="${notice.file}" download>다운로드</a>` : 'N/A'}</td> <!-- 파일 다운로드 링크 -->
        `;
        noticeList.appendChild(row);
    });

    document.getElementById('currentPage').innerText = currentPage;
}

async function displayNotices() {
    const notices = await fetchNoticesFromServer();  // 서버에서 데이터 가져오기
    const noticeList = document.getElementById('notice-list');
    noticeList.innerHTML = ''; // 기존 리스트를 비움

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedNotices = notices.slice(startIndex, endIndex);

    paginatedNotices.forEach(notice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${notice.id}</td>
            <td>${notice.title}</td>
            <td>${notice.author || '관리자'}</td>
            <td>${new Date(notice.created_at).toLocaleDateString()}</td>
            <td>${notice.views || 0}</td>
            <td>${notice.fileAttached === 'O' ? '파일 있음' : '파일 없음'}</td> <!-- 파일 첨부 여부 표시 -->
        `;
        noticeList.appendChild(row);
    });

    document.getElementById('currentPage').innerText = currentPage;
}