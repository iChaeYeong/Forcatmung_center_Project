document.addEventListener("DOMContentLoaded", function () {
    const cardsPerPage = 12;  // 한 페이지에 표시할 고양이 카드 수
    let currentPage = 1;      // 현재 페이지 번호
    let filteredData = [];    // 필터링된 데이터를 저장하는 변수

    // 요소 가져오기
    const animalCardsContainer = document.getElementById("animal-cards");
    const prevPageButton = document.getElementById("prev-page");
    const nextPageButton = document.getElementById("next-page");
    const pageNumDisplay = document.getElementById("page-num");

    // 고양이 데이터를 DB에서 불러오는 함수
    async function fetchCatsData() {
        try {
            const response = await fetch('http://localhost:5001/api/cats'); // 고양이 데이터 API 호출
            const catsData = await response.json();

            if (catsData && catsData.length > 0) {
                filteredData = catsData; // 불러온 데이터를 필터링된 데이터로 설정
                updateAnimalCards();     // 카드 업데이트
            } else {
                animalCardsContainer.innerHTML = "<p>고양이 데이터를 불러올 수 없습니다.</p>";
            }
        } catch (error) {
            console.error('고양이 데이터를 불러오는 중 오류 발생:', error);
            animalCardsContainer.innerHTML = "<p>고양이 데이터를 불러오는 중 오류가 발생했습니다.</p>";
        }
    }

    // 페이지에 따라 카드 목록을 업데이트하는 함수
    function updateAnimalCards() {
        const startIdx = (currentPage - 1) * cardsPerPage;
        const endIdx = startIdx + cardsPerPage;

        const currentCats = filteredData.slice(startIdx, endIdx);

        // 카드들 비우고 새로 채움
        animalCardsContainer.innerHTML = "";

        currentCats.forEach(cat => {
            const card = document.createElement("div");
            card.classList.add("animal-card");
            card.innerHTML = `
                <img src="http://localhost:5001${cat.mainImage}" alt="${cat.breed} 이미지" class="animal-image" style="width: 150px; height: 150px; object-fit: cover;">
                <h3>${cat.breed}</h3>
                <p>공고번호: ${cat.id}</p>
                <p>성별: ${cat.gender}</p>
                <p>특징: ${cat.characteristics}</p>
            `;
            animalCardsContainer.appendChild(card);
        });

        // 페이지 번호 업데이트 및 버튼 활성화/비활성화
        pageNumDisplay.textContent = currentPage;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = endIdx >= filteredData.length;
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

    // 페이지 로드 시 기본 데이터 출력 (DB에서 고양이 데이터 불러오기)
    fetchCatsData();
});