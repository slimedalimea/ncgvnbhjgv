const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


const cellSize = 32;
canvas.width = cellSize * 12;   
canvas.height = cellSize * 12;  

const width = canvas.width;
const height = canvas.height;
const cols = width / cellSize;
const rows = height / cellSize;


let fps = 0;
let framesThisSecond = 0;
let lastFpsUpdate = performance.now();


const snakeColors = ['#48e07d', '#31c5be', '#f7d038', '#fa435a', '#8c4fa3', '#fa8334', '#2274a5'];
const bgColors = ['#202c26', '#22223b', '#282a36', '#1a2a32', '#252525', '#1e1e1e'];
const snakeColorIdx = Number(localStorage.getItem('snake-color-idx')) || 0;
const bgColorIdx = Number(localStorage.getItem('snake-bg-idx')) || 0;
const snakeColor = snakeColors[snakeColorIdx];
const backgroundColor = bgColors[bgColorIdx];

const speedSetting = Number(localStorage.getItem('snake-speed')) || 5; 
const moveInterval = 200 - ((speedSetting - 1) * 20);


let snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
let direction = { x: 0, y: 0 }; 
let lastDirection = { x: 1, y: 0 }; 
let food = spawnFood();
let score = 0;
let gameOver = false;
let highScore = Number(localStorage.getItem('highScore')) || 0;
let lastMoveTime = 0;
const colors = {
    background: backgroundColor,
    snake: snakeColor,
    food: '#f00',
    text: '#fff'
};


function safeImage(src) {
    const img = new window.Image();
    img.loaded = false;
    img.onerror = img.onload = function() {
        img.loaded = true;
    };
    img.src = src;
    return img;
}

const imgSnakeBody = safeImage("snakebody.png");
const imgSnakeHead = safeImage("snakehead.png");
const imgApple = safeImage("apple.png");


let started = false;
function startGameWhenReady() {
    if (started) return;
    if (
        (imgSnakeBody.loaded && imgSnakeHead.loaded && imgApple.loaded)
        || Date.now() - startTime > 1000
    ) {
        started = true;
        requestAnimationFrame(gameLoop);
    } else {
        setTimeout(startGameWhenReady, 25);
    }
}
const startTime = Date.now();
startGameWhenReady();

document.addEventListener('keydown', changeDirection);

function gameLoop(timestamp) {
  
    if (timestamp - lastFpsUpdate > 1000) {
        fps = framesThisSecond;
        framesThisSecond = 0;
        lastFpsUpdate = timestamp;
    }
    framesThisSecond++;

    if (gameOver) {
        drawGameOver();
        drawFps();
        return;
    }
    if (timestamp - lastMoveTime > moveInterval) {
        update();
        lastMoveTime = timestamp;
    }
    draw();
    drawFps();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (direction.x === 0 && direction.y === 0) return;
    lastDirection = { ...direction }; 
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || isCollision(head)) {
        gameOver = true;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
        return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        food = spawnFood();
    } else {
        snake.pop();
    }
}

function draw() {
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);

    if (imgApple.loaded && imgApple.complete) {
        ctx.drawImage(imgApple, food.x * cellSize, food.y * cellSize, cellSize, cellSize);
    } else {
        ctx.fillStyle = colors.food;
        ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize, cellSize);
    }


    snake.forEach((segment, i) => {
        if (i === 0) {
  
            drawHeadWithRotation(segment.x * cellSize, segment.y * cellSize, lastDirection);
        } else {
            if (imgSnakeBody.loaded && imgSnakeBody.complete) {
                ctx.drawImage(imgSnakeBody, segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
            } else {
                ctx.fillStyle = colors.snake;
                ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
            }
        }
    });


    ctx.fillStyle = colors.text;
    ctx.font = `${Math.round(cellSize * 0.62)}px "Press Start 2P", Arial, monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, cellSize * 1);
    ctx.fillText(`High Score: ${highScore}`, 10, cellSize * 1.8);
}


function drawHeadWithRotation(x, y, direction) {
    if (imgSnakeHead.loaded && imgSnakeHead.complete) {
        ctx.save();
        ctx.translate(x + cellSize / 2, y + cellSize / 2);
        let angle = 0;
        if (direction.x === 1 && direction.y === 0) angle = 0;           
        else if (direction.x === 0 && direction.y === -1) angle = -Math.PI / 2; 
        else if (direction.x === -1 && direction.y === 0) angle = Math.PI;      
        else if (direction.x === 0 && direction.y === 1) angle = Math.PI / 2;   
        ctx.rotate(angle);
        ctx.drawImage(imgSnakeHead, -cellSize / 2, -cellSize / 2, cellSize, cellSize);
        ctx.restore();
    } else {
        ctx.fillStyle = colors.snake;
        ctx.fillRect(x, y, cellSize, cellSize);
    }
}

function drawFps() {
    ctx.save();
    ctx.font = `${Math.round(cellSize * 0.45)}px "Press Start 2P", Arial, monospace`;
    ctx.fillStyle = '#f7d038';
    ctx.textAlign = 'right';
    ctx.fillText(`FPS: ${fps}`, canvas.width - 10, cellSize * 0.75);
    ctx.restore();
}

function drawGameOver() {
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = colors.text;
    ctx.font = `${Math.round(cellSize * 1.25)}px "Press Start 2P", Arial, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', width / 2, height / 2 - cellSize * 0.5);
    ctx.font = `${Math.round(cellSize * 0.75)}px "Press Start 2P", Arial, monospace`;
    ctx.fillText(`Final Score: ${score}`, width / 2, height / 2 + cellSize * 0.3);
    ctx.fillText(`High Score: ${highScore}`, width / 2, height / 2 + cellSize * 1.1);
}

function changeDirection(event) {
    const keyPressed = event.key;
    const goingUp = direction.y === -1;
    const goingDown = direction.y === 1;
    const goingLeft = direction.x === -1;
    const goingRight = direction.x === 1;
    if ((keyPressed === 'ArrowUp' || keyPressed === 'w' || keyPressed === 'W') && !goingDown) {
        direction = { x: 0, y: -1 };
    } else if ((keyPressed === 'ArrowDown' || keyPressed === 's' || keyPressed === 'S') && !goingUp) {
        direction = { x: 0, y: 1 };
    } else if ((keyPressed === 'ArrowLeft' || keyPressed === 'a' || keyPressed === 'A') && !goingRight) {
        direction = { x: -1, y: 0 };
    } else if ((keyPressed === 'ArrowRight' || keyPressed === 'd' || keyPressed === 'D') && !goingLeft) {
        direction = { x: 1, y: 0 };
    }
}

function spawnFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
    } while (isCollision(newFood));
    return newFood;
}

function isCollision(position) {
    return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

