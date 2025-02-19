import { projects } from '../data/projects.js';
import { initHorizontalLine } from './horizontalLine.js';

// Project Information Functions
// Cache DOM elements at the start
const DOM = {
    projectTitle: document.getElementById('projectTitle'),
    projectContent: document.getElementById('projectContent'),
    player: document.getElementById('player'),
    videoContainer: document.querySelector('.video-container'),
    horizontalLine: document.querySelector('.horizontal-line')
};

function loadProjectInfo(project) {
    if (!project) {
        console.error('Project not found');
        return false;
    }

    document.title = `${project.title} - Project Details`;
    DOM.projectTitle.textContent = project.title;

    const creditsInfo = document.createElement('p');

    // Handle directors information
    if (project.directors) {
        // Multiple directors case
        const directorLinks = project.directors.map(director =>
            `<a href="${director.url}" target="_blank" rel="noopener noreferrer">${director.name}</a>`
        ).join(' / ');

        const producerLink = project.producer && project.producerUrl ?
            `<a href="${project.producerUrl}" target="_blank" rel="noopener noreferrer">${project.producer}</a>` :
            project.producer;

        creditsInfo.innerHTML = `Directed by ${directorLinks}${project.producer ? ` & Produced by ${producerLink}` : ''}`;
    } else if (project.director) {
        // Single director case
        const directorLink = project.directorUrl ?
            `<a href="${project.directorUrl}" target="_blank" rel="noopener noreferrer">${project.director}</a>` :
            project.director;
        const producerLink = project.producer && project.producerUrl ?
            `<a href="${project.producerUrl}" target="_blank" rel="noopener noreferrer">${project.producer}</a>` :
            project.producer;
        creditsInfo.innerHTML = `Directed by ${directorLink}${project.producer ? ` & Produced by ${producerLink}` : ''}`;
    } else if (project.producer) {
        const producerLink = project.producerUrl ?
            `<a href="${project.producerUrl}" target="_blank" rel="noopener noreferrer">${project.producer}</a>` :
            project.producer;
        creditsInfo.innerHTML = `Produced by ${producerLink}`;
    }

    creditsInfo.classList.add('project-info');
    DOM.projectContent.appendChild(creditsInfo);

    return true;
}

// Video Player Functions
let playerInstance = null;

function initializeVideoPlayer(videoId) {
    if (!DOM.player) {
        console.error('Player element not found');
        return null;
    }

    // Clean up existing player if any
    if (playerInstance) {
        playerInstance.destroy();
    }

    // Set initial opacity and transition
    DOM.videoContainer.style.transition = 'opacity 1s ease';
    DOM.videoContainer.style.opacity = '0';

    DOM.player.setAttribute('data-plyr-embed-id', videoId);

    const playerConfig = {
        provider: 'vimeo',
        vimeo: {
            byline: false,
            portrait: false,
            title: false,
            speed: true,
            customControls: true,
            quality: true,
            playsinline: true,
            background: false,
            transparent: false,
            autopause: true,
            keyboard: true,
            pip: false,
            dnt: true
        },
        resetOnEnd: true,
        autopause: true,
        hideControls: false,
        fullscreen: {
            enabled: true,
            fallback: true,
            iosNative: true
        },
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'fullscreen']
    };

    const player = new Plyr('#player', playerConfig);

    // Handle video ready event and aspect ratio
    player.on('ready', async () => {
        try {
            const response = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`);
            const data = await response.json();

            if (data && data[0]) {
                const { width, height } = data[0];
                const aspectRatio = (height / width) * 100;
                DOM.player.style.paddingBottom = `${aspectRatio}%`;

                // Force browser to process the layout changes
                DOM.player.offsetHeight;

                // Show video container after layout is processed
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        DOM.videoContainer.style.opacity = '1';
                    });
                }, 1000);
            }
        } catch (error) {
            console.error('Error fetching video metadata:', error);
            DOM.videoContainer.style.opacity = '1';
        }
    });

    player.on('ended', () => player.stop());

    return player;
}

// Fullscreen and Controls Management
function setupFullscreenHandling() {
    const videoContainer = document.querySelector('.video-container');
    const projectInfo = document.querySelector('.project-info');
    let fullscreenInfo = null;

    const handleFullscreenChange = () => {
        if (document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement) {
            videoContainer.classList.add('is-fullscreen');

            // Create fullscreen info if it doesn't exist
            if (!fullscreenInfo && projectInfo) {
                fullscreenInfo = document.createElement('div');
                fullscreenInfo.classList.add('fullscreen-info');

                // Clone title
                const titleClone = DOM.projectTitle.cloneNode(true);
                fullscreenInfo.appendChild(titleClone);

                // Clone project info
                const infoClone = projectInfo.cloneNode(true);
                fullscreenInfo.appendChild(infoClone);

                videoContainer.querySelector('.plyr__controls').appendChild(fullscreenInfo);
            }
        } else {
            videoContainer.classList.remove('is-fullscreen');
            // Remove fullscreen info
            if (fullscreenInfo) {
                fullscreenInfo.remove();
                fullscreenInfo = null;
            }
        }
    };

    // Listen for fullscreen changes across different browsers
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
}

function setupControlsVisibility() {
    let controlsTimeout;
    let isMouseMoving = false;

    function hideControls() {
        const container = document.querySelector('.video-container');
        if (container.classList.contains('is-fullscreen')) {
            container.classList.add('hide-controls');
        }
        isMouseMoving = false;
    }

    function showControls() {
        const container = document.querySelector('.video-container');
        container.classList.remove('hide-controls');
        isMouseMoving = true;

        // Reset the timer
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(hideControls, 1500);
    }

    document.addEventListener('mousemove', showControls);
    document.addEventListener('touchstart', showControls);
}

// Main Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize horizontal line
    initHorizontalLine();

    // Add resize event listener for horizontal line
    window.addEventListener('resize', () => {
        initHorizontalLine();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const projectId = parseInt(urlParams.get('id'));
    const project = projects[projectId];

    if (!loadProjectInfo(project)) return;

    const player = initializeVideoPlayer(project.videoId);
    if (!player) return;

    setupFullscreenHandling();
    setupControlsVisibility();

    // Create navigation elements
    const createNavArea = (className) => {
        const nav = document.createElement('div');
        nav.className = `navigation-area ${className}`;
        return nav;
    };

    const [leftNav, rightNav] = ['left', 'right'].map(createNavArea);
    document.body.insertBefore(rightNav, DOM.horizontalLine);
    document.body.insertBefore(leftNav, DOM.horizontalLine);

    // Navigation event handlers
    const navigate = (offset) => () => {
        const newId = (projectId + offset + projects.length) % projects.length;
        window.location.href = `project.html?id=${newId}`;
    };

    leftNav.addEventListener('click', navigate(-1));
    rightNav.addEventListener('click', navigate(1));
});