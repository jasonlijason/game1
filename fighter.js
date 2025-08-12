const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class Fighter {
    constructor(x, color, controls) {
        this.x = x;
        this.y = canvas.height; // ground level
        this.width = 40;
        this.height = 80;
        this.color = color;
        this.controls = controls;
        this.hp = 100;
        this.speed = 5;
        this.attack = { active: false, width: 20, height: 20, duration: 0 };
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y - this.height, this.width, this.height);
        if (this.attack.active) {
            ctx.fillStyle = 'yellow';
            const ax = this.x + (this.color === 'blue' ? this.width : -this.attack.width);
            ctx.fillRect(ax, this.y - this.height, this.attack.width, this.attack.height);
        }
    }

    update() {
        if (keys[this.controls.left]) this.x -= this.speed;
        if (keys[this.controls.right]) this.x += this.speed;
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));

        if (keys[this.controls.attack] && !this.attack.active) {
            this.attack.active = true;
            this.attack.duration = 10;
        }
        if (this.attack.active) {
            this.attack.duration--;
            if (this.attack.duration <= 0) {
                this.attack.active = false;
            }
        }
    }

    getAttackBox() {
        if (!this.attack.active) return null;
        return {
            x: this.x + (this.color === 'blue' ? this.width : -this.attack.width),
            y: this.y - this.height,
            width: this.attack.width,
            height: this.attack.height
        };
    }

    getHitBox() {
        return { x: this.x, y: this.y - this.height, width: this.width, height: this.height };
    }
}

const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup', e => { delete keys[e.key]; });

const player1 = new Fighter(100, 'blue', { left: 'a', right: 'd', attack: 'f' });
const player2 = new Fighter(660, 'red', { left: 'ArrowLeft', right: 'ArrowRight', attack: '/' });

function rectsOverlap(r1, r2) {
    return r1 && r2 &&
        r1.x < r2.x + r2.width &&
        r1.x + r1.width > r2.x &&
        r1.y < r2.y + r2.height &&
        r1.y + r1.height > r2.y;
}

function drawHp() {
    ctx.fillStyle = 'green';
    ctx.fillRect(20, 20, player1.hp * 2, 10);
    ctx.fillRect(canvas.width - player2.hp * 2 - 20, 20, player2.hp * 2, 10);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(20, 20, 200, 10);
    ctx.strokeRect(canvas.width - 220, 20, 200, 10);
}

let gameOver = false;

function update() {
    if (gameOver) return;
    player1.update();
    player2.update();

    if (rectsOverlap(player1.getAttackBox(), player2.getHitBox())) {
        player2.hp = Math.max(0, player2.hp - 10);
        player1.attack.active = false;
    }
    if (rectsOverlap(player2.getAttackBox(), player1.getHitBox())) {
        player1.hp = Math.max(0, player1.hp - 10);
        player2.attack.active = false;
    }

    if (player1.hp <= 0 || player2.hp <= 0) {
        gameOver = true;
        setTimeout(() => {
            alert(player1.hp <= 0 ? '玩家2胜利!' : '玩家1胜利!');
        }, 10);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player1.draw();
    player2.draw();
    drawHp();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
