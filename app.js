const tiles = document.querySelector(".tile-container");
const keyboard = document.querySelector(".key-container");
const messageDisplay = document.querySelector(".message-container");

const getWord = () => {
    fetch("http://localhost:8000/word")
        .then((response) => response.json())
        .then((json) => {
            word = json.toUpperCase();
        })
        .catch((err) => console.log(err));
};
getWord();

const keys = [
    "Q",
    "W",
    "E",
    "R",
    "T",
    "Y",
    "U",
    "I",
    "O",
    "P",
    "A",
    "S",
    "D",
    "F",
    "G",
    "H",
    "J",
    "K",
    "L",
    "ENTER",
    "Z",
    "X",
    "C",
    "V",
    "B",
    "N",
    "M",
    "«",
];

const guessRows = [
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
];
let isGameOver = false;
let currentRow = 0;
let currentTile = 0;

guessRows.forEach((guessRow, guessRowIndex) => {
    const rowEle = document.createElement("div");
    rowEle.setAttribute("id", "guessRow-" + guessRowIndex);
    guessRow.forEach((guess, guessIndex) => {
        const tileEle = document.createElement("div");
        tileEle.setAttribute(
            "id",
            "guessRow-" + guessRowIndex + "-tile-" + guessIndex
        );
        tileEle.classList.add("tile");
        rowEle.append(tileEle);
    });

    tiles.append(rowEle);
});

const handleClick = (key) => {
    if (!isGameOver) {
        if (key === "«") {
            deleteLetter();
            return;
        }
        if (key === "ENTER") {
            checkGuess();
            return;
        }
    }

    addLetter(key);
};

keys.forEach((key) => {
    const buttonEle = document.createElement("button");
    buttonEle.textContent = key;
    buttonEle.setAttribute("id", key);
    buttonEle.addEventListener("click", () => handleClick(key));
    keyboard.append(buttonEle);
});

const addLetter = (letter) => {
    if (currentTile < 5 && currentRow < 6) {
        const tile = document.getElementById(
            `guessRow-${currentRow}-tile-${currentTile}`
        );
        tile.textContent = letter;
        guessRows[currentRow][currentTile] = letter;
        tile.setAttribute("data", letter);
        currentTile++;
    }
};

const deleteLetter = () => {
    if (currentTile > 0) {
        currentTile--;
        const tile = document.getElementById(
            `guessRow-${currentRow}-tile-${currentTile}`
        );
        tile.textContent = "";
        guessRows[currentRow][currentTile] = "";
        tile.setAttribute("data", "");
    }
};

const checkGuess = () => {
    const guess = guessRows[currentRow].join("");
    if (currentTile > 4) {
        fetch(`http://localhost:8000/check/?word=${guess}`)
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
                if (json == "Entry word not found") {
                    showMessage("Word not in list");
                    return;
                } else {
                    flipTile();
                    if (word == guess) {
                        showMessage("You guessed the word!");
                        isGameOver = true;
                        return;
                    } else {
                        if (currentRow >= 5) {
                            isGameOver = true;
                            showMessage("Game Over");
                            return;
                        }
                        if (currentRow < 5) {
                            currentRow++;
                            currentTile = 0;
                        }
                    }
                }
            })
            .catch((err) => console.log(err));
    }
};

const showMessage = (message) => {
    const messageEle = document.createElement("p");
    messageEle.textContent = message;
    messageDisplay.append(messageEle);
    setTimeout(() => messageDisplay.removeChild(messageEle), 4000);
};

const addColorToKey = (keyLetter, color) => {
    const key = document.getElementById(keyLetter);
    key.classList.add(color);
};

const flipTile = () => {
    let guess = [];
    let checkWord = word;
    const rowTiles = document.querySelector(
        `#guessRow-${currentRow}`
    ).childNodes;

    rowTiles.forEach((tile) => {
        guess.push({
            letter: tile.getAttribute("data"),
            color: "grey-overlay",
        });
    });

    guess.forEach((guess, index) => {
        if (guess.letter == word[index]) {
            guess.color = "green-overlay";
            checkWord = checkWord.replace(guess.letter, "");
        }
    });

    guess.forEach((guess) => {
        if (checkWord.includes(guess.letter)) {
            guess.color = "yellow-overlay";
            checkWord = checkWord.replace(guess.letter, "");
        }
    });

    rowTiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add("flip");
            tile.classList.add(guess[index].color);
            addColorToKey(guess[index].letter, guess[index].color);
        }, 300 * index);
    });
};
