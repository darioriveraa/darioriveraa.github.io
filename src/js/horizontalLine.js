export function initHorizontalLine() {
    const horizontalLine = document.querySelector('.horizontal-line');
    if (horizontalLine) {
        // Reset the line's position and visibility immediately
        horizontalLine.style.display = 'none';
        horizontalLine.style.opacity = '0';
        horizontalLine.classList.remove('animate');

        // Wait for content to be fully rendered
        setTimeout(() => {
            if (window.innerWidth <= 480) {
                // Mobile initialization
                const centeredItem = document.querySelector('.centered') || document.querySelector('.list-item');
                const mainInfo = document.querySelector('.main-info');

                let targetElement = centeredItem || mainInfo;
                if (targetElement) {
                    // Force a reflow and calculate position
                    void targetElement.offsetHeight;
                    
                    const updatePosition = () => {
                        const itemRect = targetElement.getBoundingClientRect();
                        const itemCenter = itemRect.top + itemRect.height / 2;
                        horizontalLine.style.top = `${itemCenter}px`;
                    };

                    // Initial position update
                    updatePosition();
                    
                    // Show the line with animation
                    horizontalLine.style.display = 'block';
                    horizontalLine.style.transition = 'opacity 0.3s ease';
                    horizontalLine.style.opacity = '1';
                    horizontalLine.classList.add('animate');

                    // Update position on resize
                    window.addEventListener('resize', updatePosition);
                }
            } else {
                // Desktop initialization
                horizontalLine.style.display = 'block';
                horizontalLine.style.opacity = '1';
                horizontalLine.classList.add('animate');
            }
        }, 300); // Increased delay to ensure content is rendered
    }
}