import { projects } from '../data/projects.js';
import { initHorizontalLine } from './horizontalLine.js';

const itemCount = projects.length;
const virtualItemCount = itemCount * 3;
const visibleItems = 9;

document.addEventListener('DOMContentLoaded', () => {
  const scrollContent = document.getElementById("scrollContent");
  const container = document.querySelector(".scroll-container");
  const centerImage = document.createElement('video');

  centerImage.id = 'centerImage';
  centerImage.autoplay = true;
  centerImage.loop = true;
  centerImage.muted = true;
  centerImage.playsInline = true;
  centerImage.controls = false;
  centerImage.style.cursor = 'pointer';
  centerImage.style.display = 'none';
  centerImage.setAttribute('playsinline', ''); // Add explicit playsinline attribute
  centerImage.setAttribute('webkit-playsinline', ''); // Add Safari-specific attribute

  centerImage.addEventListener('loadedmetadata', () => {
    centerImage.play().catch(e => console.log('Playback failed:', e));
  });

  centerImage.addEventListener('timeupdate', () => {
    if (centerImage.currentTime >= centerImage.duration - 0.1) {
      centerImage.currentTime = 0;
    }
  });

  document.querySelector('.image-container').appendChild(centerImage);

  centerImage.addEventListener('click', () => {
    const centeredItem = findCenteredItem();
    if (centeredItem) {
      const index = Array.from(document.querySelectorAll('.list-item')).indexOf(centeredItem) % itemCount;
      window.location.href = `src/project.html?id=${index}`;
    }
  });

  function createVirtualItems() {
    scrollContent.innerHTML = "";
    for (let i = 0; i < virtualItemCount; i++) {
      const index = i % itemCount;
      const div = document.createElement("div");
      div.className = "list-item";
      div.style.animationDelay = `${i * 0.1}s`;
      div.dataset.videoSrc = `/${projects[index].thumbnail}`;

      const text = document.createElement("div");
      text.className = "list-item-text";
      text.textContent = projects[index].title;

      div.appendChild(text);
      scrollContent.appendChild(div);

      let preloadTimeout;
      div.addEventListener('mouseenter', () => {
        preloadTimeout = setTimeout(() => {
          const projectData = projects[index];
          if (projectData && projectData.videoId) {
            const preloadScript = document.createElement('script');
            preloadScript.src = `https://player.vimeo.com/video/${projectData.videoId}/config`;
            preloadScript.async = true;
            document.body.appendChild(preloadScript);
            preloadScript.onload = () => document.body.removeChild(preloadScript);
          }
        }, 150);
      });

      div.addEventListener('mouseleave', () => {
        if (preloadTimeout) {
          clearTimeout(preloadTimeout);
        }
      });

      div.addEventListener('click', () => {
        window.location.href = `src/project.html?id=${index}`;
      });
    }
  }

  function findCenteredItem() {
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;

    const items = container.querySelectorAll(".list-item");
    let closestItem = null;
    let minDistance = Infinity;

    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const distance = Math.abs(containerCenter - itemCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestItem = item;
      }
    });

    return closestItem;
  }

  function updateItemHeights() {
    const newContainerHeight = container.clientHeight;
    const newItemHeight = Math.floor(newContainerHeight / visibleItems);

    const items = container.querySelectorAll('.list-item');
    items.forEach(item => {
      item.style.height = `${newItemHeight}px`;
      item.style.minHeight = `${newItemHeight}px`;
    });
  }

  function updateCenteredItem() {
    const centeredItem = findCenteredItem();
    if (centeredItem && !centeredItem.classList.contains('centered')) {
      document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('centered');
      });
      centeredItem.classList.add('centered');
      centerImage.src = centeredItem.dataset.videoSrc;
      centerImage.style.display = "block";
    }
  }

  function initializeContent() {
    createVirtualItems();

    const containerHeight = container.clientHeight;
    const itemHeight = Math.floor(containerHeight / visibleItems);
    const totalRealHeight = itemHeight * itemCount;

    const items = container.querySelectorAll('.list-item');
    items.forEach(item => {
      item.style.height = `${itemHeight}px`;
      item.style.minHeight = `${itemHeight}px`;
    });

    const firstProjectIndex = itemCount;
    const firstProjectElement = container.querySelectorAll('.list-item')[firstProjectIndex];

    if (firstProjectElement) {
      document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('centered');
      });
      firstProjectElement.classList.add('centered');

      const elementOffset = firstProjectElement.offsetTop;
      const scrollPosition = elementOffset - (containerHeight - itemHeight) / 2;
      container.scrollTop = scrollPosition;

      centerImage.src = firstProjectElement.dataset.videoSrc;
      centerImage.style.display = "block";
    }

    initHorizontalLine();
  }

  window.addEventListener('resize', () => {
    updateItemHeights();
    initHorizontalLine();
  });

  const isMobile = window.innerWidth <= 480;

  if (isMobile) {
    container.addEventListener("scroll", () => {
      const scrollTop = container.scrollTop;

      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (scrollEndTimeout) clearTimeout(scrollEndTimeout);

      isScrolling = true;

      scrollEndTimeout = setTimeout(() => {
        isScrolling = false;

        const containerHeight = container.clientHeight;
        const itemHeight = Math.floor(containerHeight / visibleItems);
        const totalRealHeight = itemHeight * itemCount;
        const currentSet = Math.floor(scrollTop / totalRealHeight);

        if (!container.isAdjusting && (currentSet === 0 || currentSet >= 2)) {
          container.isAdjusting = true;
          const targetPosition = totalRealHeight + (scrollTop % totalRealHeight);

          requestAnimationFrame(() => {
            container.style.scrollBehavior = 'auto';
            container.scrollTop = targetPosition;

            requestAnimationFrame(() => {
              container.isAdjusting = false;
              container.style.scrollBehavior = 'smooth';
            });
          });
        }
      }, 150);

      lastScrollTop = scrollTop;
      updateCenteredItem();
    });

    // Touch event handlers (only for mobile)
    container.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartScroll = container.scrollTop;
      container.isAdjusting = false;

      if (scrollEndTimeout) clearTimeout(scrollEndTimeout);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    }, { passive: true });

    container.addEventListener('touchend', () => {
      if (scrollEndTimeout) clearTimeout(scrollEndTimeout);

      scrollEndTimeout = setTimeout(() => {
        isScrolling = false;

        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        const itemHeight = Math.floor(containerHeight / visibleItems);
        const totalRealHeight = itemHeight * itemCount;
        const currentSet = Math.floor(scrollTop / totalRealHeight);

        if (!container.isAdjusting && (currentSet === 0 || currentSet >= 2)) {
          container.isAdjusting = true;
          const targetPosition = totalRealHeight + (scrollTop % totalRealHeight);

          requestAnimationFrame(() => {
            container.style.scrollBehavior = 'auto';
            container.scrollTop = targetPosition;

            requestAnimationFrame(() => {
              container.isAdjusting = false;
              container.style.scrollBehavior = 'smooth';
            });
          });
        }
      }, 150);
    }, { passive: true });
  } else {
    let isScrolling = false;
    let scrollTimeout;

    container.addEventListener("scroll", () => {
      const scrollTop = container.scrollTop;
      const totalRealHeight = Math.floor(container.clientHeight / visibleItems) * itemCount;

      isScrolling = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);

      if (scrollTop < totalRealHeight / 2) {
        container.scrollTop = scrollTop + totalRealHeight;
      } else if (scrollTop > totalRealHeight * 2) {
        container.scrollTop = scrollTop - totalRealHeight;
      }

     
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        const centeredItem = findCenteredItem();
        if (centeredItem) {
          const containerHeight = container.clientHeight;
          const itemHeight = centeredItem.offsetHeight;
          const targetPosition = centeredItem.offsetTop - (containerHeight - itemHeight) / 2;
          
          container.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }, 150); 

      updateCenteredItem();
    });
  }

  setTimeout(() => {
    initializeContent();
    updateCenteredItem();
  }, isMobile ? 500 : 0); 

  initHorizontalLine();
});

let lastScrollTop = 0;
let scrollTimeout = null;
let scrollEndTimeout = null;
let isScrolling = false;
let touchStartY = 0;
let touchStartScroll = 0;

export function initEmailHandlers() {
  const notification = document.querySelector('.copy-notification');
  let notificationTimeout;

  function showNotification() {
    notification.classList.add('show');
    if (notificationTimeout) clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
      notification.classList.remove('show');
    }, 2000);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showNotification();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  document.querySelectorAll('.email-link').forEach(link => {
    link.addEventListener('click', async (e) => {
      const email = link.dataset.email;
      const mailtoUrl = link.href;
      
      // Store the current window length to check if a new window was opened
      const windowLength = window.length;
      
      // Try to open mailto link
      window.location.href = mailtoUrl;
      
      // Wait a brief moment to see if a mail client opened
      setTimeout(() => {
        // If no new window was opened and window.length hasn't changed,
        // assume no mail client handled the mailto link
        if (window.length === windowLength) {
          copyToClipboard(email);
        }
      }, 300);

      e.preventDefault();
    });
  });
}