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

//////////////////////////////////////////////////
// UI
//////////////////////////////////////////////////

const output = document.getElementById("output");

function log(message) {

    output.value += message + "\n";

    output.scrollTop = output.scrollHeight;
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

    }
    catch(error) {

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

    }
    else {

        log("Maximum intensity reached");

    }
}

function decreaseIntensity() {

    if (intensityLevel > 1) {

        intensityLevel--;

        log("Intensity decreased to " + intensityLevel);

    }
    else {

        log("Minimum intensity reached");

    }
}

//////////////////////////////////////////////////
// ELIGIBLE CARD FILTERING
//////////////////////////////////////////////////

function getEligibleCards() {

    const playerGender =
        document.getElementById("playerGender").value;

    const partnerGender =
        document.getElementById("partnerGender").value;

    return cardDatabase.filter(function(card) {

        const intensityMatch =
            card.intensity === intensityLevel;

        const playerMatch =
            card.playerGender === "N/A" ||
            card.playerGender === playerGender;

        const partnerMatch =
            card.partnerGender === "N/A" ||
            card.partnerGender === partnerGender;

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

    const validCards =
        getEligibleCards();

    if (validCards.length === 0) {

        log("No matching cards found.");

        return;
    }

    let usedIndices = [];

    while(true) {
        // Generate a random index
        const randomIndex =
            Math.floor(
                Math.random() *
                validCards.length
            );

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

        log(
            "You must " +
            activeCard.playerAction +
            " while your partner " +
            activeCard.partnerAction
        );

    } else {

        log(
            "You must " +
            activeCard.playerAction
        );

    }

    log(
        "Worth " +
        activeCard.points +
        " points"
    );

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

    let points =
        Number(activeCard.points);

    if (success) {

        log("Task Completed");

        if (activePlayer === 1) {

            player1Points += points;

        }
        else {

            player2Points += points;

        }

    }
    else {

        log("Task Failed");

        if (activePlayer === 1) {

            player1Points -= points;

        }
        else {

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

    }
    else {

        log(
            "Round Complete. Click Continue Game."
        );

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

    log(
        "Player 1: " +
        player1Points
    );

    log(
        "Player 2: " +
        player2Points
    );

    if (player1Points > player2Points) {

        log("Player 1 Wins");

    }
    else if (player2Points > player1Points) {

        log("Player 2 Wins");

    }
    else {

        log("Draw");

    }

}

//////////////////////////////////////////////////
// BUTTON EVENTS
//////////////////////////////////////////////////

document
.getElementById("increaseButton")
.addEventListener("click", increaseIntensity);

document
.getElementById("decreaseButton")
.addEventListener("click", decreaseIntensity);

document
.getElementById("drawButton")
.addEventListener("click", drawCard);

document
.getElementById("successButton")
.addEventListener("click", function() {

    resolveCard(true);

});

document
.getElementById("failButton")
.addEventListener("click", function() {

    resolveCard(false);

});

document
.getElementById("continueButton")
.addEventListener("click", continueGame);

//////////////////////////////////////////////////
// START GAME
//////////////////////////////////////////////////

loadCards();