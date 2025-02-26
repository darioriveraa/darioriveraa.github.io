export function initHorizontalLine() {
    const horizontalLine = document.querySelector('.horizontal-line');
    if (horizontalLine) {
        horizontalLine.style.display = 'none';
        horizontalLine.style.opacity = '0';
        horizontalLine.classList.remove('animate');

        setTimeout(() => {
            if (window.innerWidth <= 480) {
                const centeredItem = document.querySelector('.centered') || document.querySelector('.list-item');
                const mainInfo = document.querySelector('.main-info');

                let targetElement = centeredItem || mainInfo;
                if (targetElement) {
                    void targetElement.offsetHeight;
                    
                    const updatePosition = () => {
                        const itemRect = targetElement.getBoundingClientRect();
                        const itemCenter = itemRect.top + itemRect.height / 2;
                        horizontalLine.style.top = `${itemCenter}px`;
                    };

                    updatePosition();
                    
                    horizontalLine.style.display = 'block';
                    horizontalLine.style.transition = 'opacity 0.3s ease';
                    horizontalLine.style.opacity = '1';
                    horizontalLine.classList.add('animate');

                    window.addEventListener('resize', updatePosition);
                }
            } else {
                horizontalLine.style.display = 'block';
                horizontalLine.style.opacity = '1';
                horizontalLine.classList.add('animate');
            }
        }, 300);
    }
}