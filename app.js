
const tg = window.Telegram.WebApp;
tg.expand();

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

let cx = canvas.width / 2;
let cy = canvas.height / 2;

const colors = ['#ff4fd8','#7b61ff','#00d4ff','#7dff7d','#ffe066'];

let balls = [];
let shots = [];
let particles = [];

let score = 0;
let level = 1;
let combo = 1;
let bossHp = 100;
let started = false;

const themes = [
{
bg:'linear-gradient(180deg,#2d0f3d,#000)',
hero:'#ffb6d9'
},
{
bg:'linear-gradient(180deg,#001f3f,#000)',
hero:'#66ccff'
},
{
bg:'linear-gradient(180deg,#153300,#000)',
hero:'#8cff66'
}
];

let currentTheme = 0;

class Ball{
constructor(angle,radius,color){
this.angle = angle;
this.radius = radius;
this.color = color;
this.size = 22;
}

get x(){
return cx + Math.cos(this.angle) * this.radius;
}

get y(){
return cy + Math.sin(this.angle) * this.radius;
}

update(){
this.angle += 0.002 + level * 0.00025;
}

draw(){
ctx.beginPath();
ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
ctx.fillStyle = this.color;
ctx.shadowBlur = 20;
ctx.shadowColor = this.color;
ctx.fill();
}
}

class Shot{
constructor(tx,ty,color){
this.x = cx;
this.y = cy;
this.color = color;
this.size = 14;

const dx = tx - cx;
const dy = ty - cy;
const len = Math.sqrt(dx*dx + dy*dy);

this.vx = dx/len * 10;
this.vy = dy/len * 10;
}

update(){
this.x += this.vx;
this.y += this.vy;
}

draw(){
ctx.beginPath();
ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
ctx.fillStyle = this.color;
ctx.shadowBlur = 20;
ctx.shadowColor = this.color;
ctx.fill();
}
}

class Particle{
constructor(x,y,color){
this.x = x;
this.y = y;
this.color = color;
this.life = 1;
this.size = Math.random()*5+2;
this.vx = (Math.random()-0.5)*7;
this.vy = (Math.random()-0.5)*7;
}

update(){
this.x += this.vx;
this.y += this.vy;
this.life -= 0.03;
}

draw(){
ctx.globalAlpha = this.life;
ctx.beginPath();
ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
ctx.fillStyle = this.color;
ctx.fill();
ctx.globalAlpha = 1;
}
}

function spawnBalls(){
balls = [];

for(let i=0;i<30;i++){
balls.push(
new Ball(
i * 0.28,
190,
colors[Math.floor(Math.random()*colors.length)]
)
);
}
}

spawnBalls();

function explode(x,y,color){
for(let i=0;i<25;i++){
particles.push(new Particle(x,y,color));
}
}

function updateTheme(){
document.body.style.background = themes[currentTheme].bg;
}

function levelUp(){
level++;
document.getElementById('level').innerText = level;

if(level % 10 === 0){
currentTheme++;
if(currentTheme >= themes.length){
currentTheme = 0;
}
updateTheme();
}
}

document.getElementById('startBtn').onclick = ()=>{
started = true;
document.getElementById('menu').style.display = 'none';
};

canvas.addEventListener('click',(e)=>{

if(!started) return;

shots.push(
new Shot(
e.clientX,
e.clientY,
colors[Math.floor(Math.random()*colors.length)]
)
);

});

function drawHero(){

ctx.beginPath();
ctx.arc(cx,cy,60,0,Math.PI*2);
ctx.fillStyle = themes[currentTheme].hero;
ctx.fill();

ctx.beginPath();
ctx.arc(cx-18,cy-10,8,0,Math.PI*2);
ctx.arc(cx+18,cy-10,8,0,Math.PI*2);
ctx.fillStyle = '#000';
ctx.fill();

ctx.beginPath();
ctx.arc(cx,cy+15,18,0,Math.PI);
ctx.strokeStyle = '#000';
ctx.lineWidth = 4;
ctx.stroke();
}

function drawBoss(){

ctx.beginPath();
ctx.arc(cx,120,45,0,Math.PI*2);
ctx.fillStyle = '#9d00ff';
ctx.shadowBlur = 30;
ctx.shadowColor = '#9d00ff';
ctx.fill();

ctx.fillStyle = 'white';
ctx.font = '18px Arial';
ctx.fillText('BOSS',cx-25,126);
}

function collisions(){

shots.forEach((shot,sIndex)=>{

balls.forEach((ball,bIndex)=>{

const dx = shot.x - ball.x;
const dy = shot.y - ball.y;
const dist = Math.sqrt(dx*dx + dy*dy);

if(dist < shot.size + ball.size){

if(shot.color === ball.color){

explode(ball.x,ball.y,ball.color);

balls.splice(bIndex,1);

combo++;
score += 25 * combo;
bossHp -= 3;

document.getElementById('score').innerText = score;
document.getElementById('combo').innerText = combo + 'x';
document.getElementById('boss').innerText = bossHp;

if(score % 300 === 0){
levelUp();
}

if(bossHp <= 0){
bossHp = 100;
spawnBalls();
}

}else{
combo = 1;
document.getElementById('combo').innerText = '1x';
}

shots.splice(sIndex,1);

}

});

});

}

function animate(){

ctx.clearRect(0,0,canvas.width,canvas.height);

drawBoss();

balls.forEach(ball=>{
ball.update();
ball.draw();
});

shots.forEach((shot,index)=>{
shot.update();
shot.draw();

if(
shot.x < 0 ||
shot.x > canvas.width ||
shot.y < 0 ||
shot.y > canvas.height
){
shots.splice(index,1);
}
});

particles.forEach((p,index)=>{
p.update();
p.draw();

if(p.life <= 0){
particles.splice(index,1);
}
});

collisions();

drawHero();

requestAnimationFrame(animate);
}

updateTheme();
animate();

window.addEventListener('resize',()=>{
canvas.width = innerWidth;
canvas.height = innerHeight;
cx = canvas.width/2;
cy = canvas.height/2;
});
