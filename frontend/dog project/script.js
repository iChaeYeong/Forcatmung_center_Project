let currentSlide = 0; // 현재 슬라이드 인덱스
const slides = document.querySelectorAll('.slide img');
const totalSlides = slides.length;

function showSlide(index) {
    // 슬라이드 인덱스가 범위를 벗어나지 않도록 조정
    if (index >= totalSlides) {
        currentSlide = 0; // 마지막 슬라이드 다음에 처음으로 돌아감
    } else if (index < 0) {
        currentSlide = totalSlides - 1; // 첫 슬라이드 이전에 마지막으로 이동
    } else {
        currentSlide = index;
    }

    // 슬라이드를 이동시키는 transform 설정
    const slideWidth = slides[currentSlide].clientWidth;
    document.querySelector('.slides').style.transform = `translateX(-${slideWidth * currentSlide}px)`;
}

function nextside() {
    showSlide(currentSlide + 1);
}

function prevside() {
    showSlide(currentSlide - 1);
}

// 초기화: 첫 번째 슬라이드 보여줌
showSlide(currentSlide);





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
