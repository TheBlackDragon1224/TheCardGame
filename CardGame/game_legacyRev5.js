// game.js

//////////////////////////////////////////////////
// GAME STATE
//////////////////////////////////////////////////

let cardDatabase = [];

let intensityLevel = 1;

let player1Points = 0;
let player2Points = 0;

let activePlayer = 1;

let activeCard = null;

let gameOver = false;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//////////////////////////////////////////////////
// UI
//////////////////////////////////////////////////

function log(message) {
    const output = document.getElementById("output");
    if (output) {
        output.value += message + "\n";
        output.scrollTop = output.scrollHeight;
    } else {
        console.log(message);
    }
}

//////////////////////////////////////////////////
// LOAD CARD DATABASE
//////////////////////////////////////////////////

async function loadCards() {
    try {
        const response = await fetch("cards.json");
        cardDatabase = await response.json();
        log("Cards Loaded");
        displayStatus();
    } catch (error) {
        log("ERROR LOADING CARDS");
        console.error(error);
    }
}

//////////////////////////////////////////////////
// STATUS DISPLAY
//////////////////////////////////////////////////

function displayStatus() {
    log("");
    log("---------------------------");
    log("Intensity Level: " + intensityLevel);
    log("Player 1 Points: " + player1Points);
    log("Player 2 Points: " + player2Points);
    log("Current Player: " + activePlayer);
    log("---------------------------");
}

//////////////////////////////////////////////////
// INTENSITY FUNCTIONS
//////////////////////////////////////////////////

function increaseIntensity() {
    if (intensityLevel < 4) {
        intensityLevel++;
        log("Intensity increased to " + intensityLevel);
    } else {
        log("Maximum intensity reached");
    }
}

function decreaseIntensity() {
    if (intensityLevel > 1) {
        intensityLevel--;
        log("Intensity decreased to " + intensityLevel);
    } else {
        log("Minimum intensity reached");
    }
}

//////////////////////////////////////////////////
// ELIGIBLE CARD FILTERING
//////////////////////////////////////////////////

function getEligibleCards() {
    const playerGender = document.getElementById("playerGender").value;
    const partnerGender = document.getElementById("partnerGender").value;

    return cardDatabase.filter(function(card) {
        const intensityMatch = card.intensity === intensityLevel;
        const playerMatch = card.playerGender === "N/A" || card.playerGender === playerGender;
        const partnerMatch = card.partnerGender === "N/A" || card.partnerGender === partnerGender;

        return (
            intensityMatch &&
            playerMatch &&
            partnerMatch
        );
    });
}

//////////////////////////////////////////////////
// DRAW CARD
//////////////////////////////////////////////////

function drawCard() {
    if (gameOver) {
        return;
    }

    const validCards = getEligibleCards();

    if (validCards.length === 0) {
        log("No matching cards found.");
        return;
    }

    let usedIndices = [];

    while(true) {
        // Generate a random index
        const randomIndex = Math.floor(Math.random() * validCards.length);

        // Check if the card has already been drawn
        if (!usedIndices.includes(randomIndex)) {
            usedIndices.push(randomIndex);
            activeCard = validCards[randomIndex];
            break;
        }
    }

    log("");
    log("CARD DRAWN");

    if (activeCard.partnerAction !== "none") {
        log("You must " + activeCard.playerAction + " while your partner " + activeCard.partnerAction);
    } else {
        log("You must " + activeCard.playerAction);
    }

    log("Worth " + activeCard.points + " points");
    log("");
}

//////////////////////////////////////////////////
// CARD RESOLUTION
//////////////////////////////////////////////////

function resolveCard(success) {
    if (activeCard === null) {
        log("Draw a card first.");
        return;
    }

    let points = Number(activeCard.points);

    if (success) {
        log("Task Completed");

        if (activePlayer === 1) {
            player1Points += points;
        } else {
            player2Points += points;
        }
    } else {
        log("Task Failed");

        if (activePlayer === 1) {
            player1Points -= points;
        } else {
            player2Points -= points;
        }
    }

    activeCard = null;

    nextTurn();

    displayStatus();
}

//////////////////////////////////////////////////
// NEXT TURN
//////////////////////////////////////////////////

function nextTurn() {
    if (activePlayer === 1) {
        activePlayer = 2;
        log("Player 2 Turn");
    } else {
        log("Round Complete. Click Continue Game.");
    }
}

//////////////////////////////////////////////////
// CONTINUE GAME
//////////////////////////////////////////////////

function continueGame() {
    if (activePlayer === 2) {
        activePlayer = 1;
        log("New Round");
        displayStatus();
    }
}

//////////////////////////////////////////////////
// END GAME
//////////////////////////////////////////////////

function endGame() {
    gameOver = true;

    log("");
    log("GAME OVER");
    log("");

    log("Player 1: " + player1Points);
    log("Player 2: " + player2Points);

    if (player1Points > player2Points) {
        log("Player 1 Wins");
    } else if (player2Points > player1Points) {
        log("Player 2 Wins");
    } else {
        log("Draw");
    }
}

//////////////////////////////////////////////////
// BUTTON EVENTS
//////////////////////////////////////////////////

function createButton(x, y, width, height, text, onClick) {
    const button = {
        x: x,
        y: y,
        width: width,
        height: height,
        text: text,
        onClick: onClick
    };
    return button;
}

const buttons = [
    createButton(100, 100, 200, 50, "Increase Intensity", increaseIntensity),
    createButton(100, 200, 200, 50, "Decrease Intensity", decreaseIntensity),
    createButton(100, 300, 200, 50, "Draw Card", drawCard),
    createButton(100, 400, 200, 50, "Success", () => resolveCard(true)),
    createButton(100, 500, 200, 50, "Fail", () => resolveCard(false)),
    createButton(100, 600, 200, 50, "Continue Game", continueGame),
];

function drawButtons() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    buttons.forEach(button => {
        ctx.fillStyle = "#ccc";
        ctx.fillRect(button.x, button.y, button.width, button.height);
        ctx.fillStyle = "#000";
        ctx.font = "20px Arial";
        ctx.fillText(button.text, button.x + 10, button.y + 30);
    });
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    buttons.forEach(button => {
        if (
            x > button.x &&
            x < button.x + button.width &&
            y > button.y &&
            y < button.y + button.height
        ) {
            button.onClick();
        }
    });
});

//////////////////////////////////////////////////
// GENDER SELECTOR BUTTONS
//////////////////////////////////////////////////

const genderButtons = [
    createButton(400, 100, 200, 50, "Player Gender: N/A", () => selectGender("playerGender", "N/A")),
    createButton(400, 200, 200, 50, "Player Gender: Male", () => selectGender("playerGender", "Male")),
    createButton(400, 300, 200, 50, "Player Gender: Female", () => selectGender("playerGender", "Female")),
    createButton(400, 400, 200, 50, "Partner Gender: N/A", () => selectGender("partnerGender", "N/A")),
    createButton(400, 500, 200, 50, "Partner Gender: Male", () => selectGender("partnerGender", "Male")),
    createButton(400, 600, 200, 50, "Partner Gender: Female", () => selectGender("partnerGender", "Female")),
];

function drawGenderButtons() {
    genderButtons.forEach(button => {
        ctx.fillStyle = "#ccc";
        ctx.fillRect(button.x, button.y, button.width, button.height);
        ctx.fillStyle = "#000";
        ctx.font = "20px Arial";
        ctx.fillText(button.text, button.x + 10, button.y + 30);
    });
}

function selectGender(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = value;
    }
}

//////////////////////////////////////////////////
// START GAME
//////////////////////////////////////////////////

loadCards();

function animate() {
    drawButtons();
    drawGenderButtons();
    requestAnimationFrame(animate);
}

animate();