const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");

// Build 6 rows × 5 columns
function createBoard() {
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let j = 0; j < 5; j++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.id = `tile-${i}-${j}`;
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

const keys = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

function createKeyboard() {
  keys.forEach(row => {
    const rowEl = document.createElement("div");
    rowEl.className = "key-row";
    row.forEach(key => {
      const keyEl = document.createElement("button");
      keyEl.textContent = key;
      keyEl.className = "key";
      if (key === "ENTER" || key === "⌫") keyEl.classList.add("special");
      keyEl.addEventListener("click", () => handleKeyClick(key));
      rowEl.appendChild(keyEl);
    });
    keyboard.appendChild(rowEl);
  });
}

function handleKeyClick(key) {
  console.log("Key pressed:", key);
  // You’ll later use this to enter letters, delete, or submit guess
}

let currentRow = 0;
let currentCol = 0;
let currentGuess = ["", "", "", "", ""];

document.addEventListener("keydown", (e) => {
  const key = e.key.toUpperCase();
  if (key === "ENTER") {
    submitGuess();
  } else if (key === "BACKSPACE") {
    deleteLetter();
  } else if (/^[A-Z]$/.test(key) && key.length === 1) {
    addLetter(key);
  }
});

function handleKeyClick(key) {
  if (key === "ENTER") {
    submitGuess();
  } else if (key === "⌫") {
    deleteLetter();
  } else {
    addLetter(key);
  }
}

function addLetter(letter) {
  if (currentCol < 5) {
    currentGuess[currentCol] = letter;
    const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
    tile.textContent = letter;
    currentCol++;
  }
}

function deleteLetter() {
  if (currentCol > 0) {
    currentCol--;
    currentGuess[currentCol] = "";
    const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
    tile.textContent = "";
  }
}

function submitGuess() {
  if (currentCol !== 5) {
    alert("Not enough letters");
    return;
  }

  const guess = currentGuess.join("");
  console.log("Submitted Guess:", guess); // Replace with your real logic

  // Move to next row
  currentRow++;
  currentCol = 0;
  currentGuess = ["", "", "", "", ""];

  if (currentRow === 6) {
    alert("Game over!");
  }
}

let targetWord = "";

function getWordOfTheDay(wordList) {
  const startDate = new Date("2025-08-06");
  const today = new Date();
  const daysSince = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const index = daysSince % wordList.length;
  console.log("Day index:", daysSince);
  return wordList[index].toUpperCase();
}

// Load word list and get word of the day
fetch("five_letter_words.json")
  .then((res) => res.json())
  .then((words) => {
    targetWord = getWordOfTheDay(words);
    console.log("Today's word is:", targetWord); // Remove in production
  });

const guessFeedbackHistory = []; // array of arrays of "green"/"yellow"/"gray"

function submitGuess() {
  if (currentCol !== 5) {
    alert("Not enough letters");
    return;
  }

  const guess = currentGuess.join("").toUpperCase();
  const targetArray = targetWord.split("");
  const guessArray = currentGuess.map(l => l.toUpperCase());
  const colors = ["gray", "gray", "gray", "gray", "gray"];
  const letterCount = {}; // For counting letters in target
  guessFeedbackHistory.push(colors); // colors = ['gray', 'green', ...]
  console.log(guessFeedbackHistory, "okay1")

  // Count letters in target
  for (let letter of targetArray) {
    letterCount[letter] = (letterCount[letter] || 0) + 1;
  }

  // Pass 1: mark greens
  for (let i = 0; i < 5; i++) {
    if (guessArray[i] === targetArray[i]) {
      colors[i] = "green";
      letterCount[guessArray[i]]--;
    }
  }

  // Pass 2: mark yellows
  for (let i = 0; i < 5; i++) {
    if (colors[i] !== "green" && letterCount[guessArray[i]] > 0) {
      colors[i] = "yellow";
      letterCount[guessArray[i]]--;
    }
  }

  // Apply colors to tiles
  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`tile-${currentRow}-${i}`);
    tile.style.backgroundColor = getColor(colors[i]);
    tile.style.borderColor = getColor(colors[i]);
    tile.style.color = "white";
  }

  if (guess === targetWord) {
    setTimeout(() => alert("🎉 Correct!"), 100);
    showResults(true, currentRow + 1)
    return;
  }

  currentRow++;
  currentCol = 0;
  currentGuess = ["", "", "", "", ""];

  if (currentRow === 6) {
    setTimeout(() => alert(`💀 Game over! Word was ${targetWord}`), 100);
    showResults(false)
  }
}

function getColor(status) {
  switch (status) {
    case "green": return "#538d4e";
    case "yellow": return "#b59f3b";
    case "gray": return "#3a3a3c";
  }
}

function getEmojiGrid(feedbackList) {
  return feedbackList.map(row => {
    return row.map(status => {
      switch (status) {
        case "green": return "🟩";
        case "yellow": return "🟨";
        case "gray": return "⬛";
      }
    }).join("");
  }).join("\n");
}

function showResults(won, attemptsUsed) {
    console.log("AAAA")
  const emojiGrid = getEmojiGrid(guessFeedbackHistory);
  const totalWordles = 1509; // You can calculate from your start date if needed
  const scoreLine = `Wordle ${totalWordles} ${won ? attemptsUsed : "X"}/6`;

  const shareText = `${scoreLine}\n\n${emojiGrid}`;
  console.log(shareText);

  // Copy to clipboard
  navigator.clipboard.writeText(shareText)
    .then(() => alert("Copied results to clipboard!"))
    .catch(() => alert("Could not copy to clipboard."));
}

createBoard();
createKeyboard();
