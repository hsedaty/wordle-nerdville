const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
console.log("Version 1.5")

// Build 6 rows × 5 columns
function createBoard() {
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.className = "board-row";
    row.setAttribute("data-row", i);  // i is the row index
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
  const keyboardContainer = document.querySelector('.keyboard');
  console.log(keyboardContainer)
  keys.forEach(row => {
    const rowEl = document.createElement("div");
    rowEl.classList.add("keyboard-row");

    row.forEach(key => {
      const keyEl = document.createElement("button");
      keyEl.textContent = key;
      keyEl.setAttribute("data-key", key);
      keyEl.classList.add("key");
      if (key === "ENTER" || key === "⌫") keyEl.classList.add("special");
      keyEl.addEventListener("click", () => handleKeyClick(key));
      rowEl.appendChild(keyEl);
    });
    keyboard.appendChild(rowEl);
  });
}

function updateTileAndKeyboard(letter, color) {
  const keyButton = document.querySelector(`.key[data-key="${letter.toUpperCase()}"]`);
  console.log(keyButton)

  if (!keyButton){
    console.log("browhat")  
    return;
  }
  console.log("ee noluo")

  const existingColor = keyButton.getAttribute("data-color");

  const priority = {
    green: 3,
    yellow: 2,
    gray: 1,
    '': 0
  };

  if (!existingColor || priority[color] > priority[existingColor]) {
    keyButton.classList.remove("green", "yellow", "gray"); // Clean old class
    keyButton.classList.add(color); // Add new one
    keyButton.setAttribute("data-color", color);
  }
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

let targetWord = "";

function getWordOfTheDay(wordList) {
  const startDate = new Date(Date.UTC(2025, 7, 5)); // Jan 1, 2023 UTC

  const now = new Date();

  // Convert current UTC time to EET (UTC+2)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const eetOffset = 2 * 60 * 60 * 1000;
  const eetTime = new Date(utc + eetOffset);

  // Strip time to midnight EET
  eetTime.setHours(0, 0, 0, 0);

  const daysSince = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
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

fetch("five_letter_words.json")
  .then(res => res.json())
  .then(data => {
    VALID_WORDS = Object.values(data); // Convert to array
  });

const guessFeedbackHistory = []; // array of arrays of "green"/"yellow"/"gray"

function submitGuess() {
  if (currentCol !== 5) {
    showMessage("Not enough letters");
    return;
  }

  const guess = currentGuess.join("").toUpperCase();
  const targetArray = targetWord.split("");
  const guessArray = currentGuess.map(l => l.toUpperCase());
  const colors = ["gray", "gray", "gray", "gray", "gray"];
  const letterCount = {}; // For counting letters in target

  // Check word validity
  if (!VALID_WORDS.includes(guess.toLowerCase())) {
    const currentRowEl = document.querySelector(`.board-row[data-row="${currentRow}"]`);
    console.log("row no.", currentRow)

    if (currentRowEl) {
      currentRowEl.classList.add('shake');
      setTimeout(() => {
        currentRowEl.classList.remove('shake');
      }, 500); // match the animation duration
    }
    showMessage("Not a valid English word!");
    return;
  }

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
      updateTileAndKeyboard(guessArray[i], colors[i]); 
    }
  }

  // Pass 2: mark yellows
  for (let i = 0; i < 5; i++) {
    if (colors[i] !== "green" && letterCount[guessArray[i]] > 0) {
      colors[i] = "yellow";
      letterCount[guessArray[i]]--;
      updateTileAndKeyboard(guessArray[i], colors[i]); 
    }
  }

  // Pass 3: mark grays (keyboard)
  for (let i = 0; i < 5; i++) {
    if (colors[i] !== "green" && colors[i] !== "yellow" && VALID_WORDS.includes(guess.toLowerCase())) {
      colors[i] = "gray";
      letterCount[guessArray[i]]--;
      updateTileAndKeyboard(guessArray[i], colors[i]);
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
    setTimeout(() => showMessageCorrect("🎉 Correct!"), 100);
    showResults(true, currentRow + 1)
    return;
  }

  currentRow++;
  currentCol = 0;
  currentGuess = ["", "", "", "", ""];

  if (currentRow === 6) {
    setTimeout(() => showMessageEnd(`💀 Game over! Word was ${targetWord}`), 100);
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
  const startDate = new Date(Date.UTC(2025, 7, 5)); // Jan 1, 2023 UTC

  const now = new Date();

  // Convert current UTC time to EET (UTC+2)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const eetOffset = 2 * 60 * 60 * 1000;
  const eetTime = new Date(utc + eetOffset);

  // Strip time to midnight EET
  eetTime.setHours(0, 0, 0, 0);

  const daysSince = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  const emojiGrid = getEmojiGrid(guessFeedbackHistory);
  const totalWordles = daysSince; // You can calculate from your start date if needed
  const scoreLine = `Wordle NerdVille© ${totalWordles} ${won ? attemptsUsed : "X"}/6`;

  const shareText = `${scoreLine}\n\n${emojiGrid}`;
  console.log(shareText);

  // Copy to clipboard
  navigator.clipboard.writeText(shareText)
    .then(() => showMessageCopy("Copied results to clipboard!"))
    .catch(() => showMessageCopy("Could not copy to clipboard."));
}

function showMessage(text) {
  const msg = document.getElementById("message");
  msg.textContent = text;
  msg.classList.add("show");

  // Hide after 2 seconds
  setTimeout(() => {
    msg.classList.remove("show");
  }, 2000);
}

function showMessageEnd(text) {
  const msg = document.getElementById("message-end");
  msg.textContent = text;
  msg.classList.add("show");
}

function showMessageCorrect(text) {
  const msg = document.getElementById("message-correct");
  msg.textContent = text;
  msg.classList.add("show");

  setTimeout(() => {
    msg.classList.remove("show");
  }, 2000);
}

function showMessageCopy(text) {
  const msg = document.getElementById("message-copy");
  msg.textContent = text;
  msg.classList.add("show");

  setTimeout(() => {
    msg.classList.remove("show");
  }, 2000);
}

createBoard();
createKeyboard();
