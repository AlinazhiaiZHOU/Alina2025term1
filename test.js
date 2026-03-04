const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameState = "START";
let score = 0;
let lives = 7;
let highScore = localStorage.getItem("highScore") || 0;
let newHigh = false;

let circles = [];
let particles = [];
let stars = [];

let spawnTimer = 0;

// ================= STAR BACKGROUND =================
for (let i = 0; i < 120; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.2
    });
}

function drawStars() {
    ctx.fillStyle = "white";
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
}

// ================= SPAWN BALL =================
function spawnCircle() {
   let colors = [
    "#63C5DE",
    "#E1F5FA",
    "#D1D1D1",
    "#A1A3A6",
    "#c0ebd7",
    "#f98d74",
    "#FF5546",
    "#add5a2",
    "#9A91F2",
    "#FFD700"]
     ;
    let randomColor = colors[Math.floor(Math.random()*colors.length)];

    let newCircle = {
        x: Math.random() * canvas.width,
        y: canvas.height + 40,
        radius: 25 + Math.random()*20,
        color: randomColor,
        speed: 1.5 + Math.random()*4.5,
        points: Math.floor(Math.random()*20)+5
    };

    circles.push(newCircle);
}

// ================= PARTICLES =================
function createParticles(x,y,color){
    for(let i=0;i<15;i++){
        particles.push({
            x:x,
            y:y,
            size:Math.random()*4+2,
            color:color,
            speedX:(Math.random()-0.5)*6,
            speedY:(Math.random()-0.5)*6,
            alpha:1
        });
    }
}

function updateParticles(){
    for(let i=particles.length-1;i>=0;i--){
        let p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= 0.02;

        if(p.alpha <= 0){
            particles.splice(i,1);
        }
    }
}

function drawParticles(){
    particles.forEach(p=>{
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

// ================= DRAW CIRCLES =================
function drawCircles(){
    circles.forEach(circle=>{

        ctx.fillStyle = circle.color;
        ctx.beginPath();
        ctx.arc(circle.x,circle.y,circle.radius,0,Math.PI*2);
        ctx.fill();
        
        ctx.fillStyle = "black";
        ctx.font = "bold " + circle.radius/1.5 + "px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(circle.points, circle.x, circle.y);
    });

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
}


// ================= UPDATE CIRCLES =================
function updateCircles(){
    for(let i=circles.length-1;i>=0;i--){
        circles[i].y -= circles[i].speed;

        if(circles[i].y < -50){
            circles.splice(i,1);
            lives--;
            if(lives<=0){
                endGame();
            }
        }
    }
}

// ================= CLICK EVENT =================
canvas.addEventListener("click", function(e){

    if(gameState==="START"){
        startGame();
        return;
    }

    if(gameState==="GAMEOVER"){
        startGame();
        return;
    }

    let rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    for(let i=circles.length-1;i>=0;i--){
        let dx = mouseX - circles[i].x;
        let dy = mouseY - circles[i].y;
        let distance = Math.sqrt(dx*dx+dy*dy);

        if(distance < circles[i].radius + 10){
            score += circles[i].points;
            createParticles(circles[i].x,circles[i].y,circles[i].color);
            circles.splice(i,1);
        }
    }

});

// ================= GAME CONTROL =================
function startGame(){
    gameState="PLAYING";
    score=0;
    lives=7;
    circles=[];
    particles=[];
    spawnTimer=0;
    newHigh=false;
}

function endGame(){
    gameState="GAMEOVER";

    if(score > highScore){
        highScore = score;
        localStorage.setItem("highScore",highScore);
        newHigh=true;
    }
}

// ================= DRAW UI =================
function drawUI(){
    ctx.fillStyle="white";
    ctx.font="20px Arial";
    ctx.fillText("Score: "+score,20,30);
    ctx.fillText("Lives: "+lives,20,60);
    ctx.fillText("High Score: "+highScore,20,90);
}

function drawStartScreen(){
    ctx.fillStyle="white";
    ctx.font="40px Arial";
    ctx.textAlign="center";
    ctx.fillText("Star Catch Game",canvas.width/2,canvas.height/2-40);
    ctx.font="25px Arial";
    ctx.fillText("Click To Start",canvas.width/2,canvas.height/2+20);
    ctx.textAlign="left";
}

function drawGameOver(){
    ctx.fillStyle="white";
    ctx.font="40px Arial";
    ctx.textAlign="center";
    ctx.fillText("BOOM!",canvas.width/2,canvas.height/2-40);

    ctx.font="25px Arial";
    ctx.fillText("Final Score: "+score,canvas.width/2,canvas.height/2);
    ctx.fillText("High Score: "+highScore,canvas.width/2,canvas.height/2+40);

    if(newHigh){
        ctx.fillStyle="gold";
        ctx.fillText("NEW HIGH SCORE!",canvas.width/2,canvas.height/2+80);
    }

    ctx.fillStyle="white";
    ctx.fillText("Click To Restart",canvas.width/2,canvas.height/2+120);
    ctx.textAlign="left";
}

// ================= MAIN LOOP =================
function gameLoop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawStars();

    if(gameState==="START"){
        drawStartScreen();
    }
    else if(gameState==="PLAYING"){
        spawnTimer++;
        if(spawnTimer>40){
            spawnCircle();
            spawnTimer=0;
        }

        updateCircles();
        updateParticles();

        drawCircles();
        drawParticles();
        drawUI();
    }
    else if(gameState==="GAMEOVER"){
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();