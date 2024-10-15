let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

// 슬라이드 네비게이션 점(dot) 요소 추가
const dotsContainer = document.createElement('div');
dotsContainer.classList.add('slider-dots');
document.querySelector('.main-banner').appendChild(dotsContainer);

// 슬라이드 네비게이션 점(dot) 생성
for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
}

// 슬라이드와 네비게이션 점 상태 업데이트
function updateSlidePosition() {
    const slider = document.querySelector('.slides');
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    updateDots();
}

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentSlide].classList.add('active');
}

// 슬라이드를 특정 번호로 이동
function goToSlide(index) {
    currentSlide = index;
    updateSlidePosition();
}

// 이전 슬라이드로 이동
function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlidePosition();
}

// 다음 슬라이드로 이동
function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlidePosition();
}

// 이전 및 다음 버튼 클릭 이벤트 핸들러
document.querySelector('.prev').addEventListener('click', prevSlide);
document.querySelector('.next').addEventListener('click', nextSlide);

// 페이지 로드 시 첫 슬라이드를 보여주고 점 업데이트
updateSlidePosition();

// 자동 슬라이드 기능 (3초마다 슬라이드 이동)
setInterval(nextSlide, 3000);

// 동물 정보 로드 및 카드 생성
async function loadAnimals() {
    try {
        const response = await fetch('http://localhost:5001/api/animals');
        const animals = await response.json();
        const animalList = document.getElementById('animal-list');

        // 서버 경로 지정
        const serverUrl = 'http://localhost:5001';

        // 동물 카드 생성
        animals.forEach(animal => {
            const card = document.createElement('div');
            card.classList.add('animal-card');
            card.innerHTML = `
                <img src="${serverUrl}${animal.mainImage}" alt="${animal.name}" class="animal-image">
                <h2>${animal.name}</h2>
                <p>${animal.age}개월 | 성별: ${animal.gender} | 특징: ${animal.characteristics}</p>
                <button class="adopt-button">입양하기</button>
            `;
            animalList.appendChild(card);
        });
    } catch (error) {
        console.error('동물 정보를 불러오는 중 오류 발생:', error);
    }
}

// 동물 정보 로드 호출
loadAnimals();

// 탭 전환 
document.addEventListener("DOMContentLoaded", function () {
    // 보호 동물 탭 전환
    const animalTabs = document.querySelectorAll('.animal-tabs .tab');
    const animalTabContents = document.querySelectorAll('[data-tab-content]');

    animalTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // 모든 동물 탭에서 active 클래스 제거
            animalTabs.forEach(t => t.classList.remove('active'));
            // 클릭한 동물 탭에 active 클래스 추가
            this.classList.add('active');

            // 모든 동물 탭 콘텐츠 숨김
            animalTabContents.forEach(content => content.style.display = 'none');

            // 클릭한 동물 탭에 해당하는 콘텐츠만 표시
            const tabId = this.getAttribute('data-tab');
            document.querySelectorAll(`[data-tab-content="${tabId}"]`).forEach(content => {
                content.style.display = 'block';
            });
        });
    });

    // 공지사항 로드 및 DOM에 추가
    async function loadNotices() {
        try {
            const response = await fetch('http://localhost:5001/api/notices');
            const data = await response.json();
            const noticeList = document.querySelector('[data-tab-content="notice"]');

            // 공지사항 데이터 처리 (제목과 작성일만 표시)
            data.notices.forEach(notice => {
                const noticeItem = document.createElement('div');
                noticeItem.classList.add('notice-summary');
                noticeItem.innerHTML = `
                <h3>${notice.title}</h3>
                <p>${new Date(notice.created_at).toLocaleDateString()}</p>
            `;

                // 클릭 시 세부 내용 표시
                noticeItem.addEventListener('click', () => {
                    alert(`제목: ${notice.title}\n\n내용: ${notice.content}`);
                });

                noticeList.appendChild(noticeItem);
            });
        } catch (error) {
            console.error('공지사항 데이터를 불러오는 중 오류가 발생했습니다:', error);
        }
    }

    // 공지사항 로드 호출
    loadNotices();


    // 정보 게시판 탭 전환
    const infoTabs = document.querySelectorAll('.info-tabs .tab');
    const infoTabContents = document.querySelectorAll('#info-list .info-item');

    infoTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // 모든 정보 탭에서 active 클래스 제거
            infoTabs.forEach(t => t.classList.remove('active'));
            // 클릭한 정보 탭에 active 클래스 추가
            this.classList.add('active');

            // 모든 정보 탭 콘텐츠 숨김
            infoTabContents.forEach(content => content.style.display = 'none');

            // 클릭한 정보 탭에 해당하는 콘텐츠만 표시
            const tabId = this.getAttribute('data-tab');
            document.querySelector(`[data-tab-content="${tabId}"]`).style.display = 'block';
        });
    });
});



function redirectToAddPage() {
    window.location.href = 'info-page.html'; // 이동할 페이지 경로
}