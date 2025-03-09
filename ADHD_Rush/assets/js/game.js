import { GAME_CONFIG } from './config.js';
import { Player, Damian, Nadjowa } from './characters.js';
import { Renderer } from './rendering.js';
import { AudioManager } from './audio.js';
import { PowerUpManager } from './powerups.js';
import { CollisionManager } from './collisions.js';
import { Obstacle, PowerUp, FocusPoint, Pipe } from './gameObjects.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.canvas.width = GAME_CONFIG.canvas.width;
        this.canvas.height = GAME_CONFIG.canvas.height;

        this.initializeManagers();
        this.initializeGameState();
        this.setupEventListeners();
    }

    initializeManagers() {
        this.renderer = new Renderer(this.canvas);
        this.audioManager = new AudioManager();
        this.powerUpManager = new PowerUpManager(this);
        this.collisionManager = new CollisionManager(this);
    }

    initializeGameState() {
        this.gameRunning = false;
        this.gamePaused = true;
        this.score = 0;
        this.lives = 3;
        
        this.player = new Player();
        this.damian = new Damian();
        this.nadjowa = new Nadjowa();
        
        this.obstacles = [];
        this.powerUps = [];
        this.focusPoints = [];
        
        this.obstacleTimer = 0;
        this.powerUpTimer = 0;
        this.focusTimer = 0;
        this.pipeTimer = 0;
        this.damianMessageTimer = 0;
        this.firstDamianAppearance = true;
    }

    createObstacle() {
        const types = ['notification', 'meme', 'social'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const obstacle = new Obstacle(randomType);
        this.obstacles.push(obstacle);
    }

    createPipe() {
        const pipeHeight = Math.random() * (this.canvas.height - GAME_CONFIG.obstacles.minGap - 150) + 75;
        const gap = GAME_CONFIG.obstacles.startingGap;
        
        const topPipe = new Pipe(true, pipeHeight, gap);
        const bottomPipe = new Pipe(false, pipeHeight, gap);
        
        this.obstacles.push(topPipe, bottomPipe);
    }

    createPowerUp() {
        const types = ['turboFocus', 'flashDodge', 'hamsterWheel'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const powerUp = new PowerUp(randomType);
        this.powerUps.push(powerUp);
    }

    createFocusPoint() {
        const focusPoint = new FocusPoint();
        this.focusPoints.push(focusPoint);
    }

    handleDamianAttack() {
        if (this.damian.active && !this.damian.hasShownMessage) {
            const attack = this.damian.attack();
            if (attack) {
                this.obstacles.push(attack);
                this.damian.hasShownMessage = true;
                
                const messageBox = document.getElementById('message-box');
                messageBox.style.display = 'block';
                messageBox.innerHTML = `<strong>Damian:</strong> ${this.damian.currentMessage}`;
                this.damianMessageTimer = 180;
            }
        }
    }

    activatePowerUp(effect) {
        switch(effect) {
            case 'activateTurboFocus':
                this.powerUpManager.activateTurboFocus();
                break;
            case 'activateFlashDodge':
                this.powerUpManager.activateFlashDodge();
                break;
            case 'activateHamsterWheel':
                this.powerUpManager.activateHamsterWheel();
                break;
        }
    }

    updateScore() {
        this.score += 0.1;
        document.getElementById('score-display').textContent = 
            `Fokus: ${Math.floor(this.score)} | Lives: ${'❤️'.repeat(this.lives)}`;
    }

    updateGameObjects() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].x -= this.obstacles[i].speed;
            if (this.obstacles[i].x + this.obstacles[i].width < 0) {
                this.obstacles.splice(i, 1);
            }
        }

        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            this.powerUps[i].x -= this.powerUps[i].speed;
            if (this.powerUps[i].x + this.powerUps[i].width < 0) {
                this.powerUps.splice(i, 1);
            }
        }

        for (let i = this.focusPoints.length - 1; i >= 0; i--) {
            this.focusPoints[i].x -= this.focusPoints[i].speed;
            if (this.focusPoints[i].x + this.focusPoints[i].width < 0) {
                this.focusPoints.splice(i, 1);
            }
        }

        if (this.damianMessageTimer > 0) {
            this.damianMessageTimer--;
            if (this.damianMessageTimer <= 0) {
                document.getElementById('message-box').style.display = 'none';
            }
        }
    }

    startGame() {
        document.getElementById('start-screen').style.display = 'none';
        this.gameRunning = true;
        this.gamePaused = true;
        this.audioManager.playStart();
        
        this.player.x = -this.player.width;
        this.player.y = this.canvas.height / 2;
        
        // Start main game loop
        this.gameLoop();
        
        // Separate animation loop for intro sequence
        const introDuration = 1000; // 1 second
        const startTime = Date.now();
        
        const autoPilotAnimation = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / introDuration, 1);
            
            this.player.x = -this.player.width + (GAME_CONFIG.player.startX + this.player.width) * progress;
            
            if (progress < 1) {
                requestAnimationFrame(autoPilotAnimation);
            } else {
                this.player.x = GAME_CONFIG.player.startX;
                const dialogElement = document.getElementById('damian-intro-dialog');
                dialogElement.style.display = 'flex';
                
                document.getElementById('ghost-button').onclick = () => {
                    dialogElement.style.display = 'none';
                    this.startCountdown();
                };
            }
        };
    
        requestAnimationFrame(autoPilotAnimation);
    }
    
    

    startCountdown() {
        let count = 3;
        const countdownElement = document.createElement('div');
        countdownElement.id = 'countdown';
        countdownElement.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 72px;
            color: #ff00ff;
            text-shadow: 0 0 10px #00ffff;
            z-index: 1000;
        `;
        this.canvas.parentNode.appendChild(countdownElement);

        const countdown = setInterval(() => {
            if (count > 0) {
                countdownElement.textContent = count;
                count--;
            } else {
                countdownElement.textContent = 'START!';
                setTimeout(() => {
                    countdownElement.remove();
                    this.gamePaused = false;
                    this.damian.activate();
                    this.gameLoop();
                }, 1000);
                clearInterval(countdown);
            }
        }, 1000);
    }

    endGame() {
        this.gameRunning = false;
        const gameOverScreen = document.getElementById('game-over');
        const finalScore = document.getElementById('final-score');
        finalScore.textContent = `Fokus: ${Math.floor(this.score)}`;
        gameOverScreen.style.display = 'flex';
    }

    gameLoop() {
        if (!this.gameRunning) return;

        if (!this.gamePaused) {
            this.update();
        }
        
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.updateTimers();
        this.updateScore();
        this.powerUpManager.update();
        this.collisionManager.checkCollisions(this.player, this.obstacles, this.powerUps, this.focusPoints);
        this.updateGameObjects();
        this.damian.update(this.player.y);
        this.handleDamianAttack();
    }

    render() {
        this.renderer.clear();
        this.renderer.drawBackground();
        this.renderer.drawPlayer(this.player, this.powerUpManager.turboFocusActive, this.powerUpManager.flashDodgeAvailable);
        this.renderer.drawGameObjects(this.obstacles, this.powerUps, this.focusPoints);
        this.renderer.drawDamian(this.damian);
    }

    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        if (e.key === 'ArrowUp') {
            this.player.move('up');
        } else if (e.key === 'ArrowDown') {
            this.player.move('down');
        } else if (e.key === ' ' && this.powerUpManager.flashDodgeAvailable) {
            this.powerUpManager.useFlashDodge();
        }
    }

    handleTouch(e) {
        e.preventDefault();
        if (!this.gameRunning) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const touchY = touch.clientY - rect.top;
        
        if (touchY < this.canvas.height/2) {
            this.player.move('up');
        } else {
            this.player.move('down');
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));
        
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('restart-button').addEventListener('click', () => {
            document.getElementById('game-over').style.display = 'none';
            this.initializeGameState();
            this.startGame();
        });
    }

    updateTimers() {
        this.obstacleTimer--;
        if (this.obstacleTimer <= 0) {
            this.createObstacle();
            this.obstacleTimer = GAME_CONFIG.obstacles.spawnRate;
        }

        this.powerUpTimer--;
        if (this.powerUpTimer <= 0) {
            this.createPowerUp();
            this.powerUpTimer = GAME_CONFIG.powerUps.spawnRate;
        }

        this.focusTimer--;
        if (this.focusTimer <= 0) {
            this.createFocusPoint();
            this.focusTimer = GAME_CONFIG.focusPoints.spawnRate;
        }

        this.pipeTimer--;
        if (this.pipeTimer <= 0) {
            this.createPipe();
            this.pipeTimer = GAME_CONFIG.obstacles.spawnRate * 2;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
