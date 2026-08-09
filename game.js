// game.js

//////////////////////////////////////////////////
// GAME STATE
//////////////////////////////////////////////////

let cardDatabase = [];
let hoveredButton = null;
let drawCount = 0;
let textBoxHeading = "Player 1's turn:"
let textBoxBody = "Welcome to the card game, I hope you have fun"

let intensityLevel = 1;

let player1Points = 0;
let player2Points = 0;

let activePlayer = 1;

let activeCard = null;

let player1Gender = "Male"
let player2Gender = "Female"
let playerGender = player1Gender
let partnerGender = player2Gender


let gameOver = false;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const GAME_WIDTH = 592; // used for game scaling
const GAME_HEIGHT = 1304; // used for game scaling

const scaleX = canvas.width / GAME_WIDTH;
const scaleY = canvas.height / GAME_HEIGHT;

log(canvas.width)
log(canvas.height)
log(scaleX)
log(scaleY)

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
        textBoxBody = "Intensity increased to: " + intensityLevel
        //log("Intensity increased to " + intensityLevel);
    } else {
        textBoxBody = "Maximum intensity reached"
    }
}

function decreaseIntensity() {
    if (intensityLevel > 1) {
        intensityLevel--;
        textBoxBody = "Intensity decreased to " + intensityLevel
    } else {
        textBoxBody = "Minimum intensity reached"
    }
}

//////////////////////////////////////////////////
// ELIGIBLE CARD FILTERING
//////////////////////////////////////////////////

function getEligibleCards() {
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
    
    drawCount += 1 // updates the draw count

    if(drawCount > -1){
        buttons.forEach(button => {
            if(button.group === "Resolve" || button.group === "Draw"){
                button.visible = () => true;
            }else{
                button.visible = () => false;
            }
        });
    }else{
        buttons.forEach(button => {
            if(button.group === "Resolve"){
                button.visible = () => true;
            }else{
                button.visible = () => false;
            }
        });
    }


    if(activePlayer === 1){ // switches partners in turn with game turns
        playerGender = player1Gender
        partnerGender = player2Gender
    }else{
        playerGender = player2Gender
        partnerGender = player1Gender
    }


    const validCards = getEligibleCards();

    if (validCards.length === 0) {
        textBoxBody = "No matching cards found.";
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


    //log("");
    //log("CARD DRAWN");

    if (activeCard.partnerAction !== "none") {
        textBoxBody = "You must " + activeCard.playerAction + " while your partner " + activeCard.partnerAction;
    } else {
        textBoxBody = "You must " + activeCard.playerAction;
    }

    log("Worth " + activeCard.points + " points");
    log("");

    textBoxBody = textBoxBody + ". Worth " + activeCard.points + " points."
}

//////////////////////////////////////////////////
// CARD RESOLUTION
//////////////////////////////////////////////////

function resolveCard(success) {
    if (activeCard === null) {
        textBoxBody = "Draw a card first.";
        return;
    }

    let points = Number(activeCard.points);

    if (success) {
        log("Task Completed");
        textBoxBody = "Task completed " + activeCard.points + " point(s) added to player "+ activePlayer +"."

        if (activePlayer === 1) {
            player1Points += points;
        } else {
            player2Points += points;
        }
    } else {
        log("Task Failed");
        textBoxBody = "Task failed " + activeCard.points + " point(s) removed from player "+ activePlayer +"."

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
        textBoxHeading = "Player 2's turn"
            drawCount = 0; // resets draw count
            buttons.forEach(button => {
                if(button.group === "Intensity" || button.group === "Draw"){
                    button.visible = () => true;
                }else{
                    button.visible = () => false;
                }
            });

    } else {
        activePlayer = 1;
        log("Player 1 Turn");
        textBoxHeading = "Player 1's turn"
            drawCount = 0; // resets draw count
            buttons.forEach(button => {
                if(button.group === "Intensity" || button.group === "Draw"){
                    button.visible = () => true;
                }else{
                    button.visible = () => false;
                }
            });
    }

}

//////////////////////////////////////////////////
// END GAME
//////////////////////////////////////////////////

function endGame() {
    gameOver = true;

    log("");
    textBoxHeading = "GAME OVER";
    log("");

    log("Player 1: " + player1Points);
    log("Player 2: " + player2Points);

    if (player1Points > player2Points) {
        textBoxBody = "Player 1 Wins";
    } else if (player2Points > player1Points) {
        textBoxBody = "Player 2 Wins";
    } else {
        textBoxBody = "Draw";
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

//////////////////////////////////////////////////
// BUTTON EVENTS
//////////////////////////////////////////////////

function createButton(x, y, width, height, text, onClick, group, value, visible = () => true) {
    const button = {
        x: x,
        y: y,
        width: width,
        height: height,
        text: text,
        onClick: onClick,
        group: group,
        value: value,
        visible: visible
    };
    return button;
}

const buttons = [
    createButton(30*scaleX, 510*scaleY, 110*scaleX, 110*scaleY, "Intensity Level 1",  () => intensityLevel = 1,"Intensity","1"),
    createButton(170*scaleX, 510*scaleY, 110*scaleX, 110*scaleY, "Intensity Level 2",  () => intensityLevel = 2,"Intensity","2"),
    createButton(310*scaleX, 510*scaleY, 110*scaleX, 110*scaleY, "Intensity Level 3",  () => intensityLevel = 3,"Intensity","3"),
    createButton(450*scaleX, 510*scaleY, 110*scaleX, 110*scaleY, "Intensity Level 4",  () => intensityLevel = 4,"Intensity","4"),
    createButton(30*scaleX, 650*scaleY, 351*scaleX, 118*scaleY, "Draw Card", drawCard,"Draw","N/A"),
    createButton(50*scaleX, 1170*scaleY, 230*scaleX, 100*scaleY, "Success", () => resolveCard(true),"Resolve"),
    createButton(300*scaleX, 1170*scaleY, 230*scaleX, 100*scaleY, "Fail", () => resolveCard(false),"Resolve"),
    createButton(400*scaleX, 655*scaleY, 160*scaleX, 108*scaleY, "End Game", endGame,"End","N/A"),
    createButton(61*scaleX, 221*scaleY, 79*scaleX, 136*scaleY, "Player 1 Gender: Male", () => player1Gender = "Male","player1Gender","Male"),
    createButton(171*scaleX, 221*scaleY, 79*scaleX, 136*scaleY, "Player 1 Gender: Female", () => player1Gender = "Female","player1Gender","Female"),
    createButton(342*scaleX, 221*scaleY, 79*scaleX, 136*scaleY, "Partner 2 Gender: Male", () => player2Gender = "Male","player2Gender","Male"),
    createButton(452*scaleX, 221*scaleY, 79*scaleX, 136*scaleY, "Partner 2 Gender: Female", () => player2Gender = "Female","player2Gender","Female"),
];



// Makes buttons visible and invisible for game initilization
    buttons.forEach(button => {
        if(button.group === "Intensity" || button.group === "Draw"){
            button.visible = () => true;
        }else{
             button.visible = () => false;
        }
    });


function alwaysOnButtons(){
buttons.forEach(button => {
        if(button.group === "player1Gender" || button.group === "player2Gender" || button.group === "End" || button.group === "Intensity"){
            button.visible = () => true;
        }
    });
}


canvas.addEventListener('click', (event) => {
    if (gameOver) {
        return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    buttons.forEach(button => {
        if (!button.visible()) return;
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
// MOUSE POSITION TRACKING  
//////////////////////////////////////////////////



canvas.addEventListener("mousemove", (event) => {
    if (gameOver) {
        return;
    }
    mouseX = event.offsetX;
    mouseY = event.offsetY;

    hoveredButton = null;

    buttons.forEach(button => {
        if (!button.visible()) return;
        if (
            mouseX > button.x &&
            mouseX < button.x + button.width &&
            mouseY > button.y &&
            mouseY < button.y + button.height
        ) {
            hoveredButton = button;
        }
    });
});

//////////////////////////////////////////////////
// BUTTON HOVERING
//////////////////////////////////////////////////

function buttonHovered(button) {
        if (gameOver) {
        return;
        }
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(button.x, button.y, button.width, button.height);
        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.fillText(button.text, button.x + 10, button.y + 30);
}


//////////////////////////////////////////////////
// Draw Text
//////////////////////////////////////////////////


function drawText() {
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px Arial";

    ctx.fillText(`Intensity: ${intensityLevel}`, 50, 50,);
    ctx.fillText(`Player 1: ${player1Points}`, 50, 80);
    ctx.fillText(`Player 2: ${player2Points}`, 50, 110);
    ctx.fillText(`Current Player: ${activePlayer}`, 50, 140);
}

//////////////////////////////////////////////////
// Draw UI
//////////////////////////////////////////////////


const images = {
    StatsBoard: new Image(),
    FemaleSelected: new Image(),
    MaleUnselected: new Image(),
    FemaleUnselected: new Image(),
    MaleSelected: new Image(),
    ActionNotCompleted: new Image(),
    ActionCompleted: new Image(),
    TextArea: new Image(),
    GameExit: new Image(),
    DrawCard: new Image(),
    Intlv4: new Image(),
    Intlv3: new Image(),
    Intlv2: new Image(),
    Intlv1: new Image(),
    
};

images.StatsBoard.src = "Sprites/PlayerStatsBoard.png";
images.FemaleSelected.src = "Sprites/FemaleSelected.png";
images.MaleUnselected.src = "Sprites/MaleUnselected.png";
images.FemaleUnselected.src = "Sprites/FemaleUnselected.png";
images.MaleSelected.src = "Sprites/MaleSelected.png";
images.ActionNotCompleted.src = "Sprites/ActionNotCompleted.png";
images.ActionCompleted.src = "Sprites/ActionCompleted.png";
images.TextArea.src = "Sprites/TextArea.png";
images.GameExit.src = "Sprites/GameExit.png";
images.DrawCard.src = "Sprites/DrawCard.png";
images.Intlv4.src = "Sprites/Intlv4.png";
images.Intlv3.src = "Sprites/Intlv3.png";
images.Intlv2.src = "Sprites/Intlv2.png";
images.Intlv1.src = "Sprites/Intlv1.png";



function drawUI() {
    alwaysOnButtons()

// Intensity level selection indicator
ctx.fillStyle = "#3fa6eb";
ctx.clearRect(0*scaleX, 500*scaleY,  canvas.width, 130*scaleY);
ctx.fillRect((30+140*(intensityLevel-1))*scaleX, 510*scaleY, 110*scaleX, 110*scaleY);

// static images
ctx.drawImage(images.StatsBoard, 30*scaleX, 30*scaleY, 251*scaleX, 326*scaleY);
ctx.drawImage(images.StatsBoard, 311*scaleX, 30*scaleY, 251*scaleX, 326*scaleY);
ctx.drawImage(images.DrawCard, 30*scaleX, 650*scaleY, 351*scaleX, 118*scaleY);
ctx.drawImage(images.GameExit, 400*scaleX, 655*scaleY, 160*scaleX, 108*scaleY);
ctx.drawImage(images.TextArea, 30*scaleX, 810*scaleY, 532*scaleX, 471*scaleY);
ctx.drawImage(images.Intlv1, 30*scaleX, 510*scaleY, 110*scaleX, 110*scaleY);
ctx.drawImage(images.Intlv2, 170*scaleX, 510*scaleY, 110*scaleX, 110*scaleY);
ctx.drawImage(images.Intlv3, 310*scaleX, 510*scaleY, 110*scaleX, 110*scaleY);
ctx.drawImage(images.Intlv4, 450*scaleX, 510*scaleY, 110*scaleX, 110*scaleY);

    buttons.forEach(button => {
        if(button.group === "Resolve" && button.visible()){
            ctx.drawImage(images.ActionCompleted, 50*scaleX, 1170*scaleY, 230*scaleX, 100*scaleY);
            ctx.drawImage(images.ActionNotCompleted, 300*scaleX, 1170*scaleY, 230*scaleX, 100*scaleY);
        }
    });

//ctx.drawImage(images.ActionCompleted, 50*scaleX, 1170*scaleY, 230*scaleX, 100*scaleY);
//ctx.drawImage(images.ActionNotCompleted, 300*scaleX, 1170*scaleY, 230*scaleX, 100*scaleY);

// unselected genders
ctx.drawImage(images.MaleUnselected, 61*scaleX, 221*scaleY, 79*scaleX, 136*scaleY);
ctx.drawImage(images.FemaleUnselected, 171*scaleX, 221*scaleY, 79*scaleX, 136*scaleY);
ctx.drawImage(images.MaleUnselected, 342*scaleX, 221*scaleY, 79*scaleX, 136*scaleY);
ctx.drawImage(images.FemaleUnselected, 452*scaleX, 221*scaleY, 79*scaleX, 136*scaleY);

// selected genders player 1
if(player1Gender == "Male"){
ctx.drawImage(images.MaleSelected, 61*scaleX, 221*scaleY, 79*scaleX, 136*scaleY);
}else{
ctx.drawImage(images.FemaleSelected, 171*scaleX, 221*scaleY, 79*scaleX, 136*scaleY);
}

// selected gender player 2
if(player2Gender == "Male"){
ctx.drawImage(images.MaleSelected, 342*scaleX, 221*scaleY, 79*scaleX, 136*scaleY);
}else{
ctx.drawImage(images.FemaleSelected, 452*scaleX, 221*scaleY, 79*scaleX, 136*scaleY);
}



ctx.fillStyle = "#000";
ctx.font = `${Math.floor(50 * scaleY)}px Arial`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";

    ctx.fillText('Player 1', 156*scaleX,80*scaleY);
    ctx.fillText('Player 2', 437*scaleX,80*scaleY);
ctx.fillRect(-10, 400*scaleY, canvas.width*1.1, 6*scaleY);
ctx.fillRect(-10, 770*scaleY, canvas.width*1.1, 6*scaleY);
ctx.fillStyle = "#fff";
    ctx.fillText('Intensity Level:', canvas.width/2,450*scaleY);

}

//////////////////////////////////////////////////
// Main Text Box
//////////////////////////////////////////////////

function DynamicTextUpdate(headingText,mainTextboxText){
ctx.fillStyle = "#fff";
ctx.font = `${Math.floor(40 * scaleY)}px Arial`;
ctx.textAlign = "left";
ctx.textBaseline = "middle";

    ctx.fillText(headingText, 70*scaleX,860*scaleY);
    ctx.font = `${Math.floor(25 * scaleY)}px Arial`;
    wrapText(mainTextboxText,70*scaleX,920*scaleY,480*scaleX,35*scaleY)

//points
ctx.fillStyle = "#000";
ctx.textAlign = "center";
ctx.font = `${Math.floor(40 * scaleY)}px Arial`;
ctx.fillText("Points: "+player1Points, 156*scaleX,180*scaleY);
ctx.fillText("Points: "+player2Points, 437*scaleX,180*scaleY);

}

function wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth && i > 0) {
            ctx.fillText(line, x, y);
            line = words[i] + " ";
            y += lineHeight;
        } else {
            line = testLine;
        }
    }

    ctx.fillText(line, x, y);
}



//////////////////////////////////////////////////
// START GAME
//////////////////////////////////////////////////

loadCards();

function animate() {
    
    //drawButtons("#222222");
    drawUI()
    DynamicTextUpdate(textBoxHeading,textBoxBody)
    if (hoveredButton) {
        //buttonHovered(hoveredButton);
    }
    requestAnimationFrame(animate);

}

animate();