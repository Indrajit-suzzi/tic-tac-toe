const boxes = document.querySelectorAll(".box");
const newgame_btn = document.querySelector("#newgame-btn");
const resetbtn = document.querySelector("#reset-btn");
const winModal = document.querySelector("#win-modal");
const msg = document.querySelector(".msg");
const turnIndicator = document.querySelector("#turn-indicator");
const winLine = document.querySelector("#win-line");
const gameBoard = document.querySelector("#game-board");

// Audio Elements
const moveSnd = document.querySelector("#sound-move");
const winSnd = document.querySelector("#sound-win");
const drawSnd = document.querySelector("#sound-draw");
const volBtn = document.querySelector("#volume-btn");

// Score & History Elements
const scoreXEl = document.querySelector("#score-x");
const scoreOEl = document.querySelector("#score-o");
const scoreDrawEl = document.querySelector("#score-draw");
const winRateVal = document.querySelector("#win-rate-val");
const historyList = document.querySelector("#history-list");

// Settings Elements
const pvpBtn = document.querySelector("#pvp-btn");
const pvcBtn = document.querySelector("#pvc-btn");
const diffBtns = document.querySelectorAll(".diff-btn");
const themeDots = document.querySelectorAll(".theme-dot");
const nameXInput = document.querySelector("#name-x");
const nameOInput = document.querySelector("#name-o");

let turnO = true;
let count = 0;
let isPvP = false;
let difficulty = "medium";
let isMuted = false;
let gameActive = true;
let currentTheme = localStorage.getItem("tictactoe-theme") || "cyber";
let scores = JSON.parse(localStorage.getItem("tictactoe-scores")) || { X: 0, O: 0, draw: 0 };

const winPatterns = [
    { p: [0, 1, 2], style: { top: '16.5%', left: '5%', width: '90%', rotate: '0deg' } },
    { p: [3, 4, 5], style: { top: '50%', left: '5%', width: '90%', rotate: '0deg' } },
    { p: [6, 7, 8], style: { top: '83.5%', left: '5%', width: '90%', rotate: '0deg' } },
    { p: [0, 3, 6], style: { top: '5%', left: '16.5%', width: '90%', rotate: '90deg' } },
    { p: [1, 4, 7], style: { top: '5%', left: '50%', width: '90%', rotate: '90deg' } },
    { p: [2, 5, 8], style: { top: '5%', left: '83.5%', width: '90%', rotate: '90deg' } },
    { p: [0, 4, 8], style: { top: '5%', left: '5%', width: '125%', rotate: '45deg' } },
    { p: [2, 4, 6], style: { top: '5%', left: '95%', width: '125%', rotate: '135deg' } },
];

const svgX = `<svg viewBox="0 0 100 100"><path class="path-x" d="M20 20 L80 80 M80 20 L20 80"/></svg>`;
const svgO = `<svg viewBox="0 0 100 100"><circle class="path-o" cx="50" cy="50" r="35"/></svg>`;

const playSound = (sound) => {
    if (isMuted) return;
    sound.currentTime = 0;
    sound.play().catch(e => {});
};

const updateTurnIndicator = () => {
    const nameO = nameOInput.value || "Player O";
    const nameX = nameXInput.value || "Player X";
    gameBoard.classList.remove("turn-x", "turn-o");
    gameBoard.classList.add(turnO ? "turn-o" : "turn-x");
    turnIndicator.innerHTML = turnO ? `<span class="player-o">${nameO}</span>'s Turn` : `<span class="player-x">${nameX}</span>'s Turn`;
};

const triggerScorePop = (winner) => {
    const el = winner === "O" ? scoreOEl.parentElement : winner === "X" ? scoreXEl.parentElement : scoreDrawEl.parentElement;
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
};

const updateScoreboard = () => {
    scoreXEl.innerText = scores.X;
    scoreOEl.innerText = scores.O;
    scoreDrawEl.innerText = scores.draw;
    
    const total = scores.X + scores.O + scores.draw;
    const rate = total === 0 ? 0 : Math.round(((scores.X + scores.O) / total) * 100);
    winRateVal.innerText = `${rate}%`;
    
    localStorage.setItem("tictactoe-scores", JSON.stringify(scores));
};

// Theme Switching
const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    themeDots.forEach(dot => {
        dot.classList.toggle("active", dot.dataset.theme === theme);
    });
    localStorage.setItem("tictactoe-theme", theme);
    currentTheme = theme;
};

themeDots.forEach(dot => {
    dot.addEventListener("click", () => applyTheme(dot.dataset.theme));
});

const addToHistory = (result) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `<span>${result}</span><span style="opacity: 0.5">${time}</span>`;
    if (historyList.querySelector(".empty-msg")) historyList.innerHTML = "";
    historyList.prepend(item);
    if (historyList.children.length > 5) historyList.lastChild.remove();
};

const animateBoardEntrance = () => {
    gameBoard.classList.remove("show");
    void gameBoard.offsetWidth;
    boxes.forEach((box, i) => box.style.animationDelay = `${i * 0.05}s`);
    gameBoard.classList.add("show");
};

// Controls
volBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    volBtn.innerText = isMuted ? "🔇" : "🔊";
});

pvpBtn.addEventListener("click", () => {
    isPvP = true;
    pvpBtn.classList.add("active");
    pvcBtn.classList.remove("active");
    document.querySelector("#difficulty-settings").style.opacity = "0.3";
    document.querySelector("#difficulty-settings").style.pointerEvents = "none";
    resetGame();
});

pvcBtn.addEventListener("click", () => {
    isPvP = false;
    pvcBtn.classList.add("active");
    pvpBtn.classList.remove("active");
    document.querySelector("#difficulty-settings").style.opacity = "1";
    document.querySelector("#difficulty-settings").style.pointerEvents = "all";
    resetGame();
});

diffBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        diffBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        difficulty = btn.dataset.diff;
        resetGame();
    });
});

[nameXInput, nameOInput].forEach(input => {
    input.addEventListener("input", updateTurnIndicator);
});

// Keyboard Support
window.addEventListener("keydown", (e) => {
    if (e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key) - 1;
        if (boxes[index] && !boxes[index].disabled && gameActive) {
            boxes[index].click();
        }
    }
});

boxes.forEach((box, index) => {
    box.addEventListener("click", () => {
        if (box.innerHTML === "" && gameActive) {
            makeMove(box, index);
            if (!isPvP && gameActive && !turnO) {
                setTimeout(computerMove, 600);
            }
        }
    });
});

const makeMove = (box, index) => {
    playSound(moveSnd);
    if (turnO) {
        box.innerHTML = svgO;
        box.classList.add("o");
        turnO = false;
    } else {
        box.innerHTML = svgX;
        box.classList.add("x");
        turnO = true;
    }
    box.disabled = true;
    count++;
    
    let winData = checkWinner();
    if (count === 9 && !winData) gameDraw();
    else if (!winData) updateTurnIndicator();
    else showWinner(winData);
};

// AI Logic (Minimax)
const computerMove = () => {
    if (!gameActive) return;
    let available = [];
    boxes.forEach((box, i) => { if (box.innerHTML === "") available.push(i); });
    
    let moveIdx;
    if (difficulty === "easy") moveIdx = available[Math.floor(Math.random() * available.length)];
    else if (difficulty === "medium") moveIdx = findBestMove(available);
    else moveIdx = minimaxMove();
    
    if (moveIdx !== undefined) makeMove(boxes[moveIdx], moveIdx);
};

const findBestMove = (available) => {
    for (let i of available) if (wouldWin(svgX, i)) return i;
    for (let i of available) if (wouldWin(svgO, i)) return i;
    if (available.includes(4)) return 4;
    return available[Math.floor(Math.random() * available.length)];
};

const wouldWin = (svg, index) => {
    const original = boxes[index].innerHTML;
    boxes[index].innerHTML = svg;
    let win = checkWinner() !== null;
    boxes[index].innerHTML = original;
    return win;
};

const minimaxMove = () => {
    let bestScore = -Infinity;
    let move;
    boxes.forEach((box, i) => {
        if (box.innerHTML === "") {
            box.innerHTML = svgX;
            let score = minimax(boxes, 0, false);
            box.innerHTML = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    });
    return move;
};

const minimax = (board, depth, isMaximizing) => {
    let result = checkWinner();
    if (result) return board[result.p[0]].innerHTML === svgX ? 10 - depth : depth - 10;
    if ([...board].every(b => b.innerHTML !== "")) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        board.forEach(box => {
            if (box.innerHTML === "") {
                box.innerHTML = svgX;
                bestScore = Math.max(bestScore, minimax(board, depth + 1, false));
                box.innerHTML = "";
            }
        });
        return bestScore;
    } else {
        let bestScore = Infinity;
        board.forEach(box => {
            if (box.innerHTML === "") {
                box.innerHTML = svgO;
                bestScore = Math.min(bestScore, minimax(board, depth + 1, true));
                box.innerHTML = "";
            }
        });
        return bestScore;
    }
};

const gameDraw = () => {
    playSound(drawSnd);
    scores.draw++;
    updateScoreboard();
    triggerScorePop("draw");
    addToHistory("Draw");
    msg.innerText = `Game was a Draw!`;
    setTimeout(() => { winModal.classList.remove("hide"); }, 700);
    gameActive = false;
};

const resetGame = () => {
    turnO = true; count = 0; gameActive = true;
    winLine.classList.remove("active");
    winLine.style.width = "0"; // Reset width
    winModal.classList.add("hide");
    boxes.forEach(b => { b.disabled = false; b.innerHTML = ""; b.classList.remove("x", "o", "winner"); });
    updateTurnIndicator();
    animateBoardEntrance();
};

function showWinner(winData) {
    playSound(winSnd);
    const winnerSymbol = boxes[winData.p[0]].classList.contains("o") ? "O" : "X";
    const winnerName = winnerSymbol === "O" ? (nameOInput.value || "Player O") : (nameXInput.value || "Player X");
    
    scores[winnerSymbol]++;
    updateScoreboard();
    triggerScorePop(winnerSymbol);
    addToHistory(`${winnerName} Won`);
    gameActive = false;

    // Set position and trigger draw-in animation
    winLine.style.top = winData.style.top;
    winLine.style.left = winData.style.left;
    winLine.style.transform = `rotate(${winData.style.rotate})`;
    winLine.classList.add("active");
    
    // Tiny delay to ensure the 'active' class (opacity) triggers before width
    setTimeout(() => {
        winLine.style.width = winData.style.width;
    }, 50);

    winData.p.forEach(i => boxes[i].classList.add("winner"));
    msg.innerHTML = `Congratulations, ${winnerName}!`;
    triggerConfetti();
    setTimeout(() => { winModal.classList.remove("hide"); }, 1500);
}

function checkWinner() {
    for (let pattern of winPatterns) {
        let p1 = boxes[pattern.p[0]].innerHTML;
        let p2 = boxes[pattern.p[1]].innerHTML;
        let p3 = boxes[pattern.p[2]].innerHTML;
        if (p1 !== "" && p1 === p2 && p1 === p3) return pattern;
    }
    return null;
}

newgame_btn.addEventListener("click", resetGame);
resetbtn.addEventListener("click", resetGame);
applyTheme(currentTheme);
updateTurnIndicator();
updateScoreboard();
animateBoardEntrance();

const triggerConfetti = () => {
    const end = Date.now() + 2000;
    (function frame() {
        const colors = currentTheme === "forest" ? ['#10b981', '#a3e635'] : 
                       currentTheme === "royal" ? ['#8b5cf6', '#ec4899'] : ['#00d2ff', '#ffaf00'];
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
};