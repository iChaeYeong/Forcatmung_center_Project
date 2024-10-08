// 고양이 카드 데이터
document.addEventListener("DOMContentLoaded", function () {
    const catsData = [
        { id: 1, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "수컷", description: "이마에 삼각 점박이" },
        { id: 2, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "핑크 앞발" },
        { id: 3, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 4, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 5, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 6, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 7, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 8, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 9, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 10, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 11, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 12, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 13, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 14, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 15, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 16, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 17, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 18, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },
        { id: 19, breed: "코리안 숏헤어", image: "cat1.jpg", sex: "암컷", description: "회색 얼룩라인" },





        // 총 30개의 카드 데이터를 가정
        // ...
    ];

// 한 페이지에 표시할 고양이 카드 수
const cardsPerPage = 12;
let currentPage = 1;
let filteredData = catsData;  // 필터링된 데이터를 저장하는 변수

// 요소 가져오기
const animalCardsContainer = document.getElementById("animal-cards");
const prevPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const pageNumDisplay = document.getElementById("page-num");
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");

// 페이지에 따라 카드 목록을 업데이트하는 함수
function updateAnimalCards() {
    const startIdx = (currentPage - 1) * cardsPerPage;
    const endIdx = startIdx + cardsPerPage;

    const currentCats = filteredData.slice(startIdx, endIdx);

    // 카드들을 비우고 새로 채움
    animalCardsContainer.innerHTML = "";

    currentCats.forEach(cat => {
        const card = document.createElement("div");
        card.classList.add("animal-card");
        card.innerHTML = `
            <img src="${cat.image}" alt="${cat.breed} 이미지">
            <h3>${cat.breed}</h3>
            <p>공고번호: 안산 ${cat.id}</p>
            <p>성별: ${cat.sex}</p>
            <p>특징: ${cat.description}</p>
        `;
        animalCardsContainer.appendChild(card);
    });

    // 페이지 번호 업데이트 및 버튼 활성화/비활성화
    pageNumDisplay.textContent = currentPage;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = endIdx >= filteredData.length;
}

// 검색 기능 구현
function filterCats() {
    const searchValue = searchInput.value.trim().toLowerCase();  // 소문자 변환하여 검색

    // 필터링 조건: 공고번호, 성별, 품종 또는 특징
    filteredData = catsData.filter(cat => {
        return (
            cat.id.toString().includes(searchValue) ||    // 공고번호
            cat.sex.includes(searchValue) ||              // 성별
            cat.description.toLowerCase().includes(searchValue) ||  // 특징
            cat.breed.includes(searchValue)               // 품종
        );
    });

    // 필터링 후 첫 페이지로 리셋
    currentPage = 1;

    // 필터링 결과가 없을 때도 첫 페이지로 이동
    updateAnimalCards();
}

// 페이지 버튼 이벤트
prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        updateAnimalCards();
    }
});

nextPageButton.addEventListener("click", () => {
    if (currentPage * cardsPerPage < filteredData.length) {
        currentPage++;
        updateAnimalCards();
    }
});

// 검색 버튼 클릭 이벤트
searchBtn.addEventListener("click", filterCats);

// 검색 필드에서 엔터키를 누를 때도 검색 동작
searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        filterCats();
    }
});

// 페이지 로드 시 기본 데이터 출력
updateAnimalCards();
});