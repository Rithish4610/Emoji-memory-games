
// Sound effects
const flipSound = new Audio("sounds/flip.mp3");
const matchSound = new Audio("sounds/match.mp3");
const winSound = new Audio("sounds/win.mp3");

const menu = document.getElementById("menu");
const gameSection = document.getElementById("game");
const difficultySelect = document.getElementById("difficulty");
// Elements
const difficultyPage = document.getElementById("difficulty-page");
const startPage = document.getElementById("start-page");
const gamePage = document.getElementById("game-page");
const selectedDifficultySpan = document.getElementById("selected-difficulty");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

const board = document.getElementById("game-board");
const movesDisplay = document.getElementById("moves");
const timerDisplay = document.getElementById("timer");
const starContainer = document.getElementById("star-container");
const confettiCanvas = document.getElementById("confetti");

// Best score display
const bestScoreDisplay = document.getElementById("best-score");
const savedBest = localStorage.getItem("bestScore");
if (savedBest) {
    bestScoreDisplay.textContent = savedBest;
}

// Game variables
const emojis = ["🍎","🍌","🍇","🍓","🍒","🥝","🍍","🍉"];
let cardArray = [];
let moves = 0;
let flippedCards = [];
let matchedCount = 0;
let timer;
let totalSeconds = 0;
let gridSize = 4;

// Shuffle function
function shuffle(array){
    for(let i=array.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [array[i],array[j]]=[array[j],array[i]];
    }
    return array;
}

// Timer
function startTimer(){
    timer=setInterval(()=>{
        totalSeconds++;
        const minutes=Math.floor(totalSeconds/60);
        const seconds=totalSeconds%60;
        timerDisplay.textContent=`${minutes}:${seconds<10?'0'+seconds:seconds}`;
    },1000);
}

function stopTimer(){ clearInterval(timer); }

// Create board
function createBoard(){
    board.innerHTML="";
    const totalCards = gridSize*gridSize;
    let neededEmojis = [...emojis,...emojis];
    while(neededEmojis.length<totalCards) neededEmojis = neededEmojis.concat(emojis);
    cardArray = neededEmojis.slice(0,totalCards);
    shuffle(cardArray);

    board.style.gridTemplateColumns = `repeat(${gridSize},80px)`;

    cardArray.forEach(emoji=>{
        const card=document.createElement("div");
        card.classList.add("card");
        card.dataset.emoji=emoji;
        card.addEventListener("click",flipCard);
        board.appendChild(card);
    });
}

// Flip logic
function flipCard(){
    if(flippedCards.length<2 && !this.classList.contains("flipped")){
        this.classList.add("flipped");
        this.textContent=this.dataset.emoji;
        flippedCards.push(this);
        flipSound.play();

        if(flippedCards.length===2){
            moves++;
            movesDisplay.textContent=moves;
            checkMatch();
        }
    }
}

// Check match
function checkMatch(){
    const [card1,card2]=flippedCards;
    if(card1.dataset.emoji===card2.dataset.emoji){
        matchSound.play();
        flippedCards=[];
        matchedCount+=2;
        if(matchedCount===cardArray.length){
            stopTimer();
            // Best score logic
            let bestScore = localStorage.getItem("bestScore");
            if (bestScore === null || moves < bestScore) {
                localStorage.setItem("bestScore", moves);
                bestScoreDisplay.textContent = moves;
            }
            setTimeout(()=>{
                winSound.play();
                animateStars();
                showWinPopup(moves, timerDisplay.textContent);
            },300);
        }
    } else {
        setTimeout(()=>{
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
            card1.textContent="";
            card2.textContent="";
            flippedCards=[];
        },800);
    }
}


// Show Win Popup
function showWinPopup(moves, time) {
    const popup = document.getElementById("win-popup");
    const stats = document.getElementById("win-stats");
    stats.textContent = `Moves: ${moves}, Time: ${time}`;
    popup.classList.remove("hidden");
}

// Restart Game (with popup hide)
function restartGame() {
    document.getElementById("win-popup").classList.add("hidden");
    resetGame();
}

// Stars
function calculateStars(){
    let stars=3;
    if(moves>25 || totalSeconds>120) stars=1;
    else if(moves>18 || totalSeconds>90) stars=2;
    return stars;
}

function animateStars(){
    starContainer.innerHTML="";
    const starsToShow=calculateStars();
    const totalStars=3;
    for(let i=0;i<totalStars;i++){
        const star=document.createElement("span");
        star.classList.add("star");
        star.innerHTML="⭐";
        starContainer.appendChild(star);
    }
    const allStars=starContainer.querySelectorAll(".star");
    allStars.forEach((star,index)=>{
        setTimeout(()=>{ if(index<starsToShow) star.classList.add("filled"); },500*(index+1));
    });
}

// FLOW: Step 1 → Step 2 → Step 3
document.querySelectorAll(".difficulty-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
        gridSize=parseInt(btn.dataset.value);
        selectedDifficultySpan.textContent = btn.textContent;
        difficultyPage.style.display="none";
        startPage.style.display="block";
    });
});


startBtn.addEventListener("click",()=>{
    startPage.style.display="none";
    gamePage.style.display="block";
    resetGame();
});

restartBtn.addEventListener("click", () => {
    resetGame();
});

// Reset / Restart Game
function resetGame() {
    moves = 0;
    matchedCount = 0;
    flippedCards = [];
    totalSeconds = 0;
    movesDisplay.textContent = moves;
    timerDisplay.textContent = "0:00";
    stopTimer();
    createBoard();
    startTimer();
    starContainer.innerHTML = "";
    // Enable all cards (if any were disabled)
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('flipped');
        card.textContent = "";
    });
}
