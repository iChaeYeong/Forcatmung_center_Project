document.addEventListener("DOMContentLoaded", function () {
    // 강아지 데이터 
    const dogsData = [
        { id: 1, breed: "포메라니안", image: "dog1.jpg", sex: "수컷", description: "작은 크기, 갈색 털" },
        { id: 2, breed: "시바 이누", image: "dog2.jpg", sex: "암컷", description: "활발한 성격, 짧은 털" },
        { id: 3, breed: "골든 리트리버", image: "dog3.jpg", sex: "수컷", description: "중형, 금빛 털" },
        { id: 4, breed: "골든 리트리버", image: "dog3.jpg", sex: "수컷", description: "중형, 금빛 털" },
        { id: 5, breed: "골든 리트리버", image: "dog3.jpg", sex: "수컷", description: "중형, 금빛 털" },
        { id: 6, breed: "골든 리트리버", image: "dog3.jpg", sex: "수컷", description: "중형, 금빛 털" },
        { id: 7, breed: "골든 리트리버", image: "dog3.jpg", sex: "수컷", description: "중형, 금빛 털" },
        { id: 8, breed: "골든 리트리버", image: "dog3.jpg", sex: "수컷", description: "중형, 금빛 털" },
        { id: 9, breed: "골든 리트리버", image: "dog3.jpg", sex: "수컷", description: "중형, 금빛 털" },
        { id: 10, breed: "골든 리트리버", image: "dog3.jpg", sex: "수컷", description: "중형, 금빛 털" },
        { id: 11, breed: "골든 리트리버", image: "dog3.jpg", sex: "수컷", description: "중형, 금빛 털" },
        
    ];

    const cardsPerPage = 12;
    let currentPage = 1;
    let filteredData = dogsData;  // 필터링된 데이터를 저장하는 변수

    const dogCardsContainer = document.getElementById("animal-cards");
    const prevPageButton = document.getElementById("prev-page");
    const nextPageButton = document.getElementById("next-page");
    const pageNumDisplay = document.getElementById("page-num");
    const searchInput = document.getElementById("search");
    const searchBtn = document.getElementById("search-btn");

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
                <img src="${dog.image}" alt="${dog.breed} 이미지">
                <h3>${dog.breed}</h3>
                <p>공고번호: 안산 ${dog.id}</p>
                <p>성별: ${dog.sex}</p>
                <p>특징: ${dog.description}</p>
            `;
            dogCardsContainer.appendChild(card);
        });

        // 페이지 번호 업데이트 및 버튼 활성화/비활성화
        pageNumDisplay.textContent = currentPage;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = endIdx >= filteredData.length;
    }

    // 검색 기능 구현
    function filterDogs() {
        const searchValue = searchInput.value.trim().toLowerCase();  // 소문자 변환하여 검색

        // 필터링 조건: 공고번호, 성별, 품종 또는 특징
        filteredData = dogsData.filter(dog => {
            return (
                dog.id.toString().includes(searchValue) ||    // 공고번호
                dog.sex.includes(searchValue) ||              // 성별
                dog.description.toLowerCase().includes(searchValue) ||  // 특징
                dog.breed.includes(searchValue)               // 품종
            );
        });

        // 필터링 후 첫 페이지로 리셋
        currentPage = 1;

        // 필터링 결과에 맞춰 강아지 카드 업데이트
        updateDogCards();
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

    // 검색 버튼 클릭 이벤트
    searchBtn.addEventListener("click", filterDogs);

    // 검색 필드에서 엔터키를 누를 때 검색 동작
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            filterDogs();
        }
    });

    // 페이지 로드 시 기본 데이터 출력
    updateDogCards();


// 검색 버튼 클릭 이벤트
searchBtn.addEventListener("click", filterDogs);

// 검색 필드에서 엔터키를 누를 때도 검색 동작
searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        filterDogs();
    }
});

// 페이지 로드 시 기본 데이터 출력
updateDogCards();
});