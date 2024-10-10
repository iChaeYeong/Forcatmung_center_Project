let notices = [
    { id: 1, title: "포켓명센터 공지사항 1", author: "이강태", date: "2024.10.04", views: 15324, file: "O" },
    { id: 2, title: "포켓명센터 공지사항 2", author: "이강태", date: "2024.10.04", views: 15324, file: "O" },
    { id: 3, title: "포켓명센터 공지사항 3", author: "이강태", date: "2024.10.04", views: 15324, file: "O" },
    // Add more notices as needed
];

let currentPage = 1;
const rowsPerPage = 5;

function displayNotices() {
    const noticeList = document.getElementById('notice-list');
    noticeList.innerHTML = ''; // Clear the current list

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedNotices = notices.slice(startIndex, endIndex);

    paginatedNotices.forEach(notice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${notice.id}</td>
            <td>${notice.title}</td>
            <td>${notice.author}</td>
            <td>${notice.date}</td>
            <td>${notice.views}</td>
            <td>${notice.file}</td>
        `;
        noticeList.appendChild(row);
    });

    document.getElementById('currentPage').innerText = currentPage;
}

function nextPage() {
    if (currentPage * rowsPerPage < notices.length) {
        currentPage++;
        displayNotices();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayNotices();
    }
}

function searchNotices() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const filteredNotices = notices.filter(notice =>
        notice.title.toLowerCase().includes(searchTerm)
    );

    displayFilteredNotices(filteredNotices);
}

function displayFilteredNotices(filteredNotices) {
    const noticeList = document.getElementById('notice-list');
    noticeList.innerHTML = ''; // Clear the current list

    filteredNotices.forEach(notice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${notice.id}</td>
            <td>${notice.title}</td>
            <td>${notice.author}</td>
            <td>${notice.date}</td>
            <td>${notice.views}</td>
            <td>${notice.file}</td>
        `;
        noticeList.appendChild(row);
    });

    document.getElementById('currentPage').innerText = "1";
}

window.onload = displayNotices;
