// Game data - words by difficulty level
const wordLists = {
    1: ["cat", "dog", "sun", "hat", "pen", "box", "red", "leg", "eye", "arm"],
    2: ["apple", "house", "water", "queen", "juice", "train", "frog", "kite", "milk", "nose"],
    3: ["garden", "school", "teacher", "bicycle", "kitchen", "dinner", "rabbit", "summer", "winter", "orange"],
    4: ["elephant", "hospital", "birthday", "computer", "football", "breakfast", "dinosaur", "butterfly", "watermelon", "strawberry"],
    5: ["thermometer", "xylophone", "quarantine", "kangaroo", "jellyfish", "architecture", "chocolate", "vegetable", "celebrate", "adventure"]
};

// DOM elements
const levelSelection = document.getElementById('level-selection');
const gameContainer = document.getElementById('game-container');
const gameOverScreen = document.getElementById('game-over');
const wordDisplay = document.getElementById('word-display');
const feedback = document.getElementById('feedback');
const micStatus = document.getElementById('mic-status');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('current-level');
const finalScoreDisplay = document.getElementById('final-score').querySelector('span');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');

// Game variables
let currentLevel = 1;
let score = 0;
let currentWord = '';
let recognition;
let wordsAttempted = 0;
const maxWords = 5; // Words per game

// Initialize speech recognition
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        micStatus.textContent = "Speech recognition not supported in this browser";
        startBtn.disabled = true;
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        micStatus.textContent = "Listening... Speak now!";
    };

    recognition.onerror = (event) => {
        micStatus.textContent = `Error: ${event.error}`;
        startBtn.disabled = false;
    };

    recognition.onend = () => {
        if (wordsAttempted < maxWords) {
            startBtn.disabled = false;
            micStatus.textContent = "Press START to try again";
        }
    };

    recognition.onresult = (event) => {
        const spokenWord = event.results[0][0].transcript.trim().toLowerCase();
        feedback.textContent = `You said: "${spokenWord}"`;
        
        if (spokenWord === currentWord.toLowerCase()) {
            feedback.className = "correct";
            feedback.textContent += " ✅ Correct!";
            score += currentLevel * 10; // Higher levels give more points
            scoreDisplay.textContent = score;
            nextBtn.disabled = false;
            startBtn.disabled = true;
            
            // Play correct sound if available
            if (correctSound) {
                correctSound.currentTime = 0;
                correctSound.play().catch(e => console.log("Audio error:", e));
            }
        } else {
            feedback.className = "incorrect";
            feedback.textContent += " ❌ Try again!";
            startBtn.disabled = false;
            
            // Play wrong sound if available
            if (wrongSound) {
                wrongSound.currentTime = 0;
                wrongSound.play().catch(e => console.log("Audio error:", e));
            }
        }
        
        wordsAttempted++;
        if (wordsAttempted >= maxWords) {
            endGame();
        }
    };
}

// Start listening
function startListening() {
    if (!recognition) {
        micStatus.textContent = "Speech recognition not initialized";
        return;
    }
    
    try {
        startBtn.disabled = true;
        recognition.start();
    } catch (e) {
        micStatus.textContent = `Error: ${e.message}`;
        startBtn.disabled = false;
    }
}

// Get a random word from current level
function getRandomWord() {
    const words = wordLists[currentLevel];
    return words[Math.floor(Math.random() * words.length)];
}

// Show new word
function showNewWord() {
    currentWord = getRandomWord();
    wordDisplay.textContent = currentWord;
    feedback.textContent = "";
    feedback.className = "";
    startBtn.disabled = false;
    nextBtn.disabled = true;
}

// Start game
function startGame(level) {
    currentLevel = level;
    levelDisplay.textContent = level;
    score = 0;
    wordsAttempted = 0;
    scoreDisplay.textContent = score;
    
    levelSelection.style.display = "none";
    gameContainer.style.display = "block";
    
    initSpeechRecognition();
    showNewWord();
}

// End game
function endGame() {
    gameContainer.style.display = "none";
    gameOverScreen.style.display = "flex";
    finalScoreDisplay.textContent = score;
}

// Event listeners
document.querySelectorAll('#level-selection button').forEach(btn => {
    btn.addEventListener('click', () => {
        startGame(parseInt(btn.dataset.level));
    });
});

startBtn.addEventListener('click', startListening);
nextBtn.addEventListener('click', showNewWord);

document.getElementById('play-again').addEventListener('click', () => {
    gameOverScreen.style.display = "none";
    startGame(currentLevel);
});

document.getElementById('exit-game').addEventListener('click', () => {
    gameOverScreen.style.display = "none";
    levelSelection.style.display = "flex";
    gameContainer.style.display = "none";
});

// Check for speech recognition support on load
window.addEventListener('load', () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        document.querySelectorAll('#level-selection button').forEach(btn => {
            btn.disabled = true;
        });
        micStatus.textContent = "Speech recognition not supported in this browser";
    }
});
