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




// 모든 카드에서 이미지와 버튼을 가져옴
document.addEventListener('DOMContentLoaded', function () {
    const animalCards = document.querySelectorAll('.animal-card');
    
    animalCards.forEach(function (card) {
        const isAdopted = card.getAttribute('data-adopted') === 'true';
        const button = card.querySelector('.adopt-button');
        
        if (isAdopted) {
            button.textContent = '입양 완료';
            button.classList.add('adopted'); // 입양 완료된 경우 스타일 변경
            button.disabled = true; // 버튼 비활성화
        } else {
            button.textContent = '입양하기';
            button.addEventListener('click', function () {
                alert('입양 신청이 완료되었습니다.');
            });
        }
    });
});







// 탭 전환 
document.addEventListener("DOMContentLoaded", function() {
    // 보호 동물 탭 전환
    const animalTabs = document.querySelectorAll('.animal-tabs .tab');
    const animalTabContents = document.querySelectorAll('[data-tab-content]');

    animalTabs.forEach(tab => {
        tab.addEventListener('click', function() {
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

    // 정보 게시판 탭 전환
    const infoTabs = document.querySelectorAll('.info-tabs .tab');
    const infoTabContents = document.querySelectorAll('#info-list .info-item');

    infoTabs.forEach(tab => {
        tab.addEventListener('click', function() {
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
