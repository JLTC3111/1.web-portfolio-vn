const originalAOS = new Map();

function cacheAOSAttributes() {
  document.querySelectorAll('.project-card').forEach(el => {
    if (!originalAOS.has(el)) {
      originalAOS.set(el, el.getAttribute('data-aos'));
    }
  });
}

function restoreAOSAttributes() {
  console.log('[AOS] Restoring AOS attributes');
  originalAOS.forEach((value, el) => {
    el.setAttribute('data-aos', value || 'flip-down');
    el.classList.add('aos-init');
    el.classList.remove('aos-animate');
    el.style.opacity = null;
    el.style.transform = null;
    el.style.filter = null;
  });

  if (window.AOS) {
    window.AOS.refreshHard();
  }
}

function clearAOSAttributes() {
  console.log('[AOS] Clearing AOS attributes');
  document.querySelectorAll('[data-aos]').forEach(el => {
    if (!originalAOS.has(el)) {
      originalAOS.set(el.getAttribute('data-aos'));
    }
    el.removeAttribute('data-aos');
    el.classList.remove('aos-init', 'aos-animate');
    el.style.opacity = 1;
    el.style.transform = 'none';
    el.style.filter = 'none';
  });
}

const AOSManager = (() => {
  function handleAOSByScreenSize() {
    const width = window.innerWidth;
    console.log(`[AOS] Window resized to: ${width}px`);

    if (typeof window.AOS === 'undefined') {
      console.warn('[AOS] AOS library not loaded.');
      return;
    }

    if (width < 25) {
      console.log('[AOS] Small screen – disabling AOS');
      clearAOSAttributes();
    } else {
      console.log('[AOS] Large screen mode – Enabling AOS');
      restoreAOSAttributes();
      window.AOS.init({
        disable: false,
        duration: 750,
        offset: 100,
        once: false
      });
    }
  }

  return { handleAOSByScreenSize };
})();

// Debounce utility
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

window.addEventListener('resize', debounce(() => {
  console.log('[AOS] Resize triggered');
  AOSManager.handleAOSByScreenSize();
}, 50));

window.addEventListener('DOMContentLoaded', () => {
  cacheAOSAttributes();
  console.log('[AOS] DOMContentLoaded');
  AOSManager.handleAOSByScreenSize();
});


// 1. color game
const body = document.querySelector('body')
const colorInput = document.getElementById('color-picker')
const colorDiv = document.querySelector('.color-div')
const hiddenText = document.querySelector('.color-div p')
const resetBtn = document.querySelector('.color-div button')
const playBtn = document.getElementById('play-game')

function playGame() {
    colorDiv.classList.remove('hidden')
    playBtn.style.display = 'none'
}

function changeColor() {
    const selectedColor = colorInput.value
    body.style.background = selectedColor
    resetBtn.classList.remove('reset-btn')
    hiddenText.classList.remove('hidden-text')
    colorInput.style.display = 'none'
}

function resetColor() {
    body.style.background = 'white'
    colorInput.style.display = 'block'
    playBtn.style.display = 'block'
    hiddenText.classList.add('hidden-text')
    resetBtn.classList.add('reset-btn')
    colorDiv.classList.add('hidden')
}

const symbols = ['💙', '🔥', '🌟', '🚀', '🎮', '🎵', '📷', '🧩'];
let cards = [...symbols, ...symbols];
let flippedCards = [];

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function createMemoryGame() {
    const grid = document.querySelector('.memory-grid');
    grid.innerHTML = '';
    cards = shuffle(cards);

    cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.symbol = symbol;
        card.dataset.index = index;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
        this.classList.add('flipped');
        this.innerHTML = this.dataset.symbol;
        flippedCards.push(this);
    }
    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 500);
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.symbol !== card2.dataset.symbol) {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        card1.innerHTML = '';
        card2.innerHTML = '';
    }
    flippedCards = [];
}

function resetMemoryGame() {
    flippedCards = [];
    createMemoryGame();
}

// Audio Visualizer Functions
function initAudioVisualizer(
    audioSrc = 'public/enoa.mp3',
    barSelector = '.music-bars',
    clickTargetSelector = '#visualizer'
) {
    try {
        const clickTarget = document.querySelector(clickTargetSelector);
        
        // ✅ Reuse existing audio if already created
        if (window.__audioVisualizer) {
            const { audio, ctx } = window.__audioVisualizer;
            
            if (clickTarget) {
                // Remove existing listener to prevent duplicates
                clickTarget.removeEventListener('click', window.__audioVisualizer.toggleHandler);
                clickTarget.addEventListener('click', window.__audioVisualizer.toggleHandler);
            }
            return;
        }
        
        // First-time setup — defer download until first play
        const audio = new Audio();
        audio.preload = 'none';
        audio.src = audioSrc;
        let mediaConnected = false;
        let ctx, analyser, freqData;

        function ensureAudioGraph() {
            if (mediaConnected) return;
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            const source = ctx.createMediaElementSource(audio);
            analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            source.connect(analyser);
            analyser.connect(ctx.destination);
            freqData = new Uint8Array(analyser.frequencyBinCount);
            window.__audioVisualizer.ctx = ctx;
            window.__audioVisualizer.analyser = analyser;
            window.__audioVisualizer.freqData = freqData;
            mediaConnected = true;
        }
        
        function toggleAudio(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            ensureAudioGraph();
            if (ctx.state === 'suspended') ctx.resume();
            audio.paused ? audio.play() : audio.pause();
        }
        
        if (clickTarget) {
            clickTarget.addEventListener('click', toggleAudio);
        }
        
        // ✅ Save audio setup globally
        window.__audioVisualizer = {
            audio,
            ctx: null,
            analyser: null,
            freqData: null,
            toggleHandler: toggleAudio,
            barSelector: barSelector
        };
        
        // Add error handling for audio
        audio.addEventListener('error', (e) => {
            console.error('Audio loading error:', e);
        });
        
    } catch (error) {
        console.error('Failed to initialize audio visualizer:', error);
    }
}

// ✅ Global animation loop — only runs once
function startAudioVisualizerLoop() {
    function loop() {
        requestAnimationFrame(loop);
        
        const av = window.__audioVisualizer;
        if (!av) return;
        
        const { analyser, freqData, barSelector } = av;
        const bars = document.querySelectorAll(barSelector);
        
        if (!analyser || !freqData || bars.length === 0) return;
        
        analyser.getByteFrequencyData(freqData);
        
        bars.forEach((bar, i) => {
            const value = freqData[i];
            const scale = Math.max(0.5, value / 256);
            bar.style.transform = `scaleY(${scale})`;
        });
    }
    
    loop();
}

// Play project demos only when visible; pause when off-screen
function initLazyProjectVideos() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const banner = document.querySelector('.video-bg');
    const projectVideos = document.querySelectorAll('.video-proj');

    if (prefersReducedMotion) {
        if (banner) {
            banner.pause();
            banner.removeAttribute('autoplay');
            banner.preload = 'none';
        }
        projectVideos.forEach((video) => {
            video.pause();
            video.preload = 'none';
        });
        return;
    }

    if (!('IntersectionObserver' in window)) {
        projectVideos.forEach((video) => {
            video.play().catch(() => {});
        });
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        },
        { rootMargin: '100px 0px', threshold: 0.25 }
    );

    projectVideos.forEach((video) => observer.observe(video));
}

function updateMusicBarColor(page) {
    const paths = document.querySelectorAll('.music-bars svg path');

    let color = '#ffffff'; // default

    switch (page) {
    case 'ourWork':
        color = '#ffcc00';
        break;
    case 'Contact':
        color = '#000000';
        break;
        case 'coreTeam':
        color = '#000000';
        break;
    }

    paths.forEach(path => {
    path.setAttribute('stroke', color);
    path.setAttribute('fill', color); // Only needed if your SVG uses `fill`
    });
}

// Calendar Update Function
window.updateCalendarSvgTime = () => {
    const calendarMonthElement = document.getElementById('calendar-month');
    const calendarDayElement = document.getElementById('calendar-day');
    const calendarTimeElement = document.getElementById('calendar-time');

    if (!calendarMonthElement || !calendarDayElement || !calendarTimeElement) {
        console.warn("One or more calendar SVG text elements not found. Make sure IDs are correct.");
        return;
    }

    const now = new Date();

    // Get Month (e.g., "June")
    const month = now.toLocaleString('en-US', { month: 'long' });

    // Get Day (e.g., "18")
    const day = now.getDate();

    // Get Time (e.g., "03:04 PM" for 3:04 PM)
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' (midnight) should be '12'
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    const timeString = `${hours}:${formattedMinutes} ${ampm}`;

    // Update the SVG text elements
    calendarMonthElement.textContent = month;
    calendarDayElement.textContent = day;
    calendarTimeElement.textContent = timeString;

    // Log for debugging (optional)
    console.log(`Updated calendar SVG: ${month} ${day}, ${timeString}`);
}

// Initialize everything when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Calendar modal logic
    const calendarIcon = document.querySelector('.calendar-icon svg');
    const calendarLink = document.querySelector('.calendar-icon');
    const calendarModal = document.getElementById('calendar-modal');
    const calendarModalContent = document.getElementById('calendar-modal-content');
    const calendarModalSvg = document.getElementById('calendar-modal-svg');
    const calendarModalClose = document.getElementById('calendar-modal-close');

    // Tooltip update for calendar icon
    const calendarTooltip = calendarLink.querySelector('.tooltiptext');
    if (calendarIcon && calendarLink && calendarModal && calendarModalSvg && calendarModalClose) {
        calendarLink.addEventListener('click', function(e) {
            // Clone the calendar SVG
            const clone = calendarIcon.cloneNode(true);
            // Clear previous
            calendarModalSvg.innerHTML = '';
            calendarModalSvg.appendChild(clone);
            // Style the SVG
            clone.style.width = '340px';
            clone.style.height = '340px';
            clone.style.display = 'block';
            calendarModal.style.display = 'flex';
        });
        calendarModalClose.addEventListener('click', function() {
            calendarModal.style.display = 'none';
        });
        // Close modal when clicking outside modal content
        calendarModal.addEventListener('click', function(e) {
            if (e.target === calendarModal) {
                calendarModal.style.display = 'none';
            }
        });
    }
    // Initialize memory game
    createMemoryGame();
    
    // Initialize audio visualizer
    initAudioVisualizer();
    
    // Start global animation once
    startAudioVisualizerLoop();

    // Lazy-play project videos when scrolled into view
    initLazyProjectVideos();
    
    // Initialize calendar and start updates
    updateCalendarSvgTime();
    
    // Update calendar every minute
    setInterval(updateCalendarSvgTime, 60000);
    
    // Add event listeners for buttons and inputs
    const playGameBtn = document.getElementById('play-game');
    if (playGameBtn) {
        playGameBtn.addEventListener('click', playGame);
    }
    
    const resetColorBtn = document.querySelector('.color-div button');
    if (resetColorBtn) {
        resetColorBtn.addEventListener('click', resetColor);
    }
    
    const colorPicker = document.getElementById('color-picker');
    if (colorPicker) {
        colorPicker.addEventListener('change', changeColor);
    }
    
    const resetMemoryBtn = document.querySelector('#memory-game button');
    if (resetMemoryBtn) {
        resetMemoryBtn.addEventListener('click', resetMemoryGame);
    }
    
    const contactLink = document.querySelector('a[data-page="Contact"]');
    if (contactLink) {
        contactLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadPage('Contact');
        });
    }
});
