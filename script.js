// Color Game Functions
// This is where we create the interactivity for our little color switching game

// 1. select all the html elements so that we can later manipulate them
const body = document.querySelector('body')
const colorInput = document.getElementById('color-picker')
const colorDiv = document.querySelector('.color-div')
const hiddenText = document.querySelector('.color-div p')
const resetBtn = document.querySelector('.color-div button')
const playBtn = document.getElementById('play-game')

// 2. create the functions 

function playGame() {
    // this function enables the play of the game by showing the color selector input
    colorDiv.style.display = 'block'
    playBtn.style.display = 'none'
}

function changeColor() {
    // take the users selected color on the input, and assign it to be the background color of the website
    const selectedColor = colorInput.value
    body.style.background = selectedColor
    resetBtn.style.display = 'block'
    hiddenText.style.display = 'block'
    colorInput.style.display = 'none'
}

function resetColor() {
    body.style.background = 'white'
    colorInput.style.display = 'block'
    playBtn.style.display = 'block'

    hiddenText.style.display = 'none'
    resetBtn.style.display = 'none'
    colorDiv.style.display = 'none'
}

// 3. is to assign the functions to the buttons by adding them function call to the actual elements (done above in the html code)

// Memory Game Functions
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
    audioSrc = 'public/royalty_free.mp3',
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
        
        // ❌ First-time setup
        const audio = new Audio(audioSrc);
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const source = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        
        // Configure analyser for better visualization
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        
        source.connect(analyser);
        analyser.connect(ctx.destination);
        
        const freqData = new Uint8Array(analyser.frequencyBinCount);
        
        function toggleAudio(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (ctx.state === 'suspended') ctx.resume();
            audio.paused ? audio.play() : audio.pause();
        }
        
        if (clickTarget) {
            clickTarget.addEventListener('click', toggleAudio);
        }
        
        // ✅ Save audio setup globally
        window.__audioVisualizer = {
            audio,
            ctx,
            analyser,
            freqData,
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
        
        if (!analyser || bars.length === 0) return;
        
        analyser.getByteFrequencyData(freqData);
        
        bars.forEach((bar, i) => {
            const value = freqData[i];
            const scale = Math.max(0.5, value / 256);
            bar.style.transform = `scaleY(${scale})`;
        });
    }
    
    loop();
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

// Calendar SVG Update Functions
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

// Function to start calendar updates
function startCalendarUpdates() {
    // Update immediately
    window.updateCalendarSvgTime();
    
    // Update every minute
    setInterval(window.updateCalendarSvgTime, 60000);
}

// Initialize everything when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Initialize memory game
    createMemoryGame();
    
    // Initialize audio visualizer
    initAudioVisualizer();
    
    // Start global animation once
    startAudioVisualizerLoop();
    
    // Start calendar updates
    startCalendarUpdates();
});
