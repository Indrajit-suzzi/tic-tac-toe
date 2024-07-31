let boxes = document.querySelectorAll(".box");
let newgame_btn = document.querySelector("#newgame-btn");
let resetbtn = document.querySelector("#reset-btn")
let win = document.querySelector(".win");
let main = document.querySelector(".main");
let msg = document.querySelector(".msg");

let turnO = true;

const winPatterns = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [3, 4, 5],
    [6, 7, 8],
];

boxes.forEach((box) => {
    box.addEventListener("click", () => {
        if (box.innerText === "") { 
            if (turnO) {
                box.innerText = "O";
                turnO = false;
            } else {
                box.innerText = "X";
                turnO = true;
            }
            checkWinner();
        }
    });
});

const disableBoxes = () => {
    for (let box of boxes){
        box.disabled = true;
    }
}

const enableBoxes = () => {
    for (let box of boxes){
        box.disabled = false;
        box.innerText = "";
    }
}

const newGame = () => {
    turnO = true;
    enableBoxes();
    win.classList.add("hide");
    main.classList.remove("hide")
}

const resetGame = () => {
    turnO = true;
    enableBoxes();
}

function showWinner(winner) {
    msg.innerText = `Congratulations, Winner is ${winner}`;
    win.classList.remove("hide");
    main.classList.add("hide");
    disableBoxes();
}

function checkWinner() {
    for (let pattern of winPatterns) {
        let pos1Val = boxes[pattern[0]].innerText;
        let pos2Val = boxes[pattern[1]].innerText;
        let pos3Val = boxes[pattern[2]].innerText;

        if (pos1Val !== "" && pos2Val !== "" && pos3Val !== "") {
            if (pos1Val === pos2Val && pos1Val === pos3Val) {
                showWinner(pos1Val);
                break;
            }
        }
    }
}


newgame_btn.addEventListener("click", newGame);
resetbtn.addEventListener("click", resetGame);