document.addEventListener("DOMContentLoaded", function () {
    const cardsPerPage = 12; // 페이지당 표시할 카드 수
    let currentPage = 1; // 현재 페이지 번호
    let filteredData = [];  // DB에서 불러온 데이터를 저장하는 변수

    const dogCardsContainer = document.getElementById("animal-cards");
    const prevPageButton = document.getElementById("prev-page");
    const nextPageButton = document.getElementById("next-page");
    const pageNumDisplay = document.getElementById("page-num");

    // DB에서 강아지 데이터 불러오기
    async function fetchDogsData() {
        try {
            const response = await fetch('http://localhost:5001/api/dogs'); // 카테고리에 맞는 데이터 불러오기
            const dogsData = await response.json();

            if (dogsData && dogsData.length > 0) {
                filteredData = dogsData; // 불러온 데이터를 필터링된 데이터로 설정
                updateDogCards(); // 카드를 업데이트
            } else {
                dogCardsContainer.innerHTML = "<p>강아지 데이터를 불러올 수 없습니다.</p>";
            }
        } catch (error) {
            console.error('강아지 데이터를 불러오는 중 오류 발생:', error);
            dogCardsContainer.innerHTML = "<p>강아지 데이터를 불러오는 중 오류가 발생했습니다.</p>";
        }
    }

    // 강아지 카드 업데이트 함수
    function updateDogCards() {
        const startIdx = (currentPage - 1) * cardsPerPage;
        const endIdx = startIdx + cardsPerPage;

        const currentDogs = filteredData.slice(startIdx, endIdx);

        // 카드들 비우고 새로 채움
        dogCardsContainer.innerHTML = "";

        currentDogs.forEach(dog => {
            const card = document.createElement("div");
            card.classList.add("animal-card");
            card.innerHTML = `
                <img src="http://localhost:5001${dog.mainImage}" alt="${dog.breed} 이미지" style="width: 200px; height: 200px;">
                <h3>${dog.breed}</h3>
                <p>공고번호: ${dog.id}</p>
                <p>성별: ${dog.gender}</p>
                <p>특징: ${dog.characteristics}</p>
            `;
            dogCardsContainer.appendChild(card);
        });

        // 페이지 번호 업데이트 및 버튼 활성화/비활성화
        pageNumDisplay.textContent = currentPage;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = endIdx >= filteredData.length;
    }

    // 페이지 버튼 이벤트 리스너
    prevPageButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            updateDogCards();
        }
    });

    nextPageButton.addEventListener("click", () => {
        if (currentPage * cardsPerPage < filteredData.length) {
            currentPage++;
            updateDogCards();
        }
    });

    // 페이지 로드 시 DB에서 데이터 불러오기
    fetchDogsData();
});