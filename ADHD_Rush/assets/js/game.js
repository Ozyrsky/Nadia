import { GAME_CONFIG } from './config.js';
import { Player, Damian, Nadjowa } from './characters.js';
import { Renderer } from './rendering.js';
import { AudioManager } from './audio.js';
import { PowerUpManager } from './powerups.js';
import { CollisionManager } from './collisions.js';
import { DM, PowerUp, FocusPoint, Obstacle } from './gameObjects.js';
import { funFacts } from './ciekawostki.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.canvas.width = GAME_CONFIG.canvas.width;
        this.canvas.height = GAME_CONFIG.canvas.height;

        this.initializeManagers();
        this.initializeGameState();
        this.setupEventListeners();
        
        // Dodaj zmienne do obsługi double-tap
        this.lastTapTime = 0;
        this.doubleTapDelay = 300; // ms
    }

    initializeManagers() {
        this.renderer = new Renderer(this.canvas, this);
        this.audioManager = new AudioManager();
        this.powerUpManager = new PowerUpManager(this);
        this.collisionManager = new CollisionManager(this);
    }
    
    initializeGameState() {
        this.gameRunning = false;
        this.gamePaused = true;
        this.score = 0;
        this.lives = 3;
        this.victoryAchieved = false;
        
        this.player = new Player();
        this.damian = new Damian();
        this.nadjowa = new Nadjowa();
        
        // Initialize speed multiplier (start much slower)
        this.speedMultiplier = 0.4;
        this.damianEncounters = 0;
        
        this.dms = [];
        this.powerUps = [];
        this.focusPoints = [];
        this.obstacles = []; // Dodane przeszkody
        
        this.powerUpTimer = 0;
        this.focusTimer = 0;
        this.obstacleTimer = this.getRandomObstacleTime(); // Inicjalizacja losowym czasem

        this.damianMessageTimer = 0;
        this.firstDamianAppearance = true;
        
        // Store UI messages to be rendered in canvas
        this.messages = [];
    }

    // Metoda do generowania losowego czasu między przeszkodami (4-7 sekund)
    getRandomObstacleTime() {
        // Losowy czas między 4 a 7 sekund (przy 60 FPS)
        return Math.floor(Math.random() * (420 - 240 + 1)) + 240; // 240-420 frames (4-7 seconds)
    }

    createPowerUp() {
        const powerUp = new PowerUp(); // Let constructor pick a random type
        
        // Apply speed multiplier to power-ups
        powerUp.speed *= this.speedMultiplier;
        
        this.powerUps.push(powerUp);
    }

    createFocusPoint() {
        const focusPoint = new FocusPoint();
        
        // Apply speed multiplier to focus points
        focusPoint.speed *= this.speedMultiplier;
        
        this.focusPoints.push(focusPoint);
    }
    
    // Sprawdza, czy istnieje jakakolwiek przeszkoda na ekranie
    hasObstacleInLowerArea() {
        return this.obstacles.length > 0;
    }

    
    // Nowa metoda do tworzenia przeszkód
    createObstacle() {
        // Sprawdź, czy już istnieje przeszkoda w dolnych 80% ekranu
        if (this.hasObstacleInLowerArea()) {
            // Jeśli tak, po prostu zresetuj timer i nie twórz nowej przeszkody
            this.obstacleTimer = this.getRandomObstacleTime();
            return;
        }
        
        // Określ szerokość przeszkody (losowo między 30% a 70% szerokości ekranu)
        const minWidth = this.canvas.width * 0.3;
        const maxWidth = this.canvas.width * 0.7;
        const obstacleWidth = minWidth + Math.random() * (maxWidth - minWidth);
        
        // Losowo wybierz, czy przeszkoda będzie po lewej czy po prawej stronie
        const isLeftSide = Math.random() > 0.5;
        
        // Utwórz przeszkodę
        const obstacle = new Obstacle(
            isLeftSide ? 0 : this.canvas.width - obstacleWidth,
            -50, // Powyżej ekranu
            obstacleWidth,
            30, // Wysokość przeszkody
            GAME_CONFIG.obstacles.baseSpeed * this.speedMultiplier
        );
        
        this.obstacles.push(obstacle);
        
        // Ustaw timer na następną przeszkodę - losowy czas między 4-7 sekund
        this.obstacleTimer = this.getRandomObstacleTime();
    }

    handleDamianAttack() {
        if (this.damian.active && !this.damian.temporarilyDisabled) {
            const dm = this.damian.update(this.player.x);
            if (dm) {
                // Apply speed multiplier to Damian's DMs
                dm.speed *= this.speedMultiplier;
                this.dms.push(dm);
                
                // Increment encounter counter and increase speed after each Damian encounter
                this.damianEncounters++;
                this.increaseGameSpeed();
            }
        } else if (this.damian.active && this.damian.temporarilyDisabled) {
            // Still update Damian's position but don't let him send DMs
            this.damian.update(this.player.x);
        } else {
            // Update sleep timer
            this.damian.update();
        }
    }
    
    // Method to increase game speed after Damian encounters
    increaseGameSpeed() {
        // Increase speed by 10% each time, up to a maximum of 2x original speed
        this.speedMultiplier = Math.min(0.4 + (this.damianEncounters * 0.1), 2.0);
    }

    activatePowerUp(effect) {
        switch(effect) {
            case 'activateHyperFocus':
                this.powerUpManager.activateHyperFocus();
                break;
            case 'activateImpulsivity':
                this.powerUpManager.activateImpulsivity();
                break;
            case 'activateCreativeChaos':
                this.powerUpManager.activateCreativeChaos();
                break;
        }
    }

    updateScore() {
        this.score += 0.1;
    }

    updateGameObjects() {
        // Update DMs - moving from top to bottom
        for (let i = this.dms.length - 1; i >= 0; i--) {
            this.dms[i].y += this.dms[i].speed;
            if (this.dms[i].y > this.canvas.height) {
                // DM was missed - show sad emoji on Damian
                if (!this.dms[i].missed) {
                    this.damian.showSadEmoji();
                    this.dms[i].missed = true;
                }
                this.dms.splice(i, 1);
            }
        }

        // Update power-ups - moving from top to bottom
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            this.powerUps[i].y += this.powerUps[i].speed;
            if (this.powerUps[i].y > this.canvas.height) {
                this.powerUps.splice(i, 1);
            }
        }

        // Update focus points - moving from top to bottom
        for (let i = this.focusPoints.length - 1; i >= 0; i--) {
            this.focusPoints[i].y += this.focusPoints[i].speed;
            if (this.focusPoints[i].y > this.canvas.height) {
                this.focusPoints.splice(i, 1);
            }
        }
        
        // Update obstacles - moving from top to bottom
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].y += this.obstacles[i].speed;
            if (this.obstacles[i].y > this.canvas.height) {
                this.obstacles.splice(i, 1);
            }
        }

        // Update messages
        for (let i = this.messages.length - 1; i >= 0; i--) {
            this.messages[i].timer--;
            if (this.messages[i].timer <= 0) {
                this.messages.splice(i, 1);
            }
        }
    }

    startGame() {
        document.getElementById('start-screen').style.display = 'none';
        this.gameRunning = true;
        this.gamePaused = true;
        this.audioManager.playStart();
        
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height + this.player.height;
        
        // Start main game loop
        this.gameLoop();
        
        // Separate animation loop for intro sequence
        const introDuration = 1000; // 1 second
        const startTime = Date.now();
        
        const autoPilotAnimation = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / introDuration, 1);
            
            this.player.y = this.canvas.height + this.player.height - (this.canvas.height - GAME_CONFIG.player.startY + this.player.height) * progress;
            
            if (progress < 1) {
                requestAnimationFrame(autoPilotAnimation);
            } else {
                this.player.y = GAME_CONFIG.player.startY;
                
                // Show the dialog after animation completes
                const dialogElement = document.getElementById('damian-intro-dialog');
                dialogElement.style.display = 'block';
                
                // Use onclick instead of addEventListener to avoid multiple listeners
                const ghostButton = document.getElementById('ghost-button');
                ghostButton.onclick = () => {
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
            font-family: 'Montserrat', sans-serif;
            font-weight: 700;
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

    endGame(victory = false) {
        this.gameRunning = false;
        const gameOverScreen = document.getElementById('game-over');
        const finalScore = document.getElementById('final-score');
        const gameOverTitle = gameOverScreen.querySelector('h2');
        
        if (victory) {
            gameOverTitle.textContent = "ZWYCIĘSTWO!";
            gameOverTitle.style.color = "#00ff00";
            finalScore.textContent = `Fokus: ${Math.floor(this.score)} + 500 (bonus za zwycięstwo)`;
            this.score += 500; // Victory bonus
        } else {
            gameOverTitle.textContent = "GAME OVER";
            gameOverTitle.style.color = "var(--miami-yellow)";
            finalScore.textContent = `Fokus: ${Math.floor(this.score)}`;
        }
        
        // Add random fun fact
        const funFact = funFacts[Math.floor(Math.random() * funFacts.length)];
        const funFactElement = document.createElement('p');
        funFactElement.id = 'fun-fact';
        funFactElement.innerHTML = funFact;
        funFactElement.style.cssText = `
            margin-top: 15px;
            font-size: 14px;
            color: #ffff00;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
            text-align: left;
            padding: 10px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 5px;
        `;
        
        // Remove previous fun fact if exists
        const oldFunFact = document.getElementById('fun-fact');
        if (oldFunFact) {
            oldFunFact.remove();
        }
        
        // Insert fun fact before high scores
        const highScores = document.getElementById('high-scores');
        gameOverScreen.insertBefore(funFactElement, highScores);
        
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
        this.collisionManager.checkCollisions(this.player, this.dms, this.powerUps, this.focusPoints, this.obstacles);
        this.updateGameObjects();
        this.handleDamianAttack();
    }

    render() {
        this.renderer.clear();
        this.renderer.drawBackground();
        this.renderer.drawPlayer(
            this.player, 
            this.powerUpManager.hyperFocusActive, 
            this.powerUpManager.impulsivityAvailable
        );
        this.renderer.drawGameObjects(this.dms, this.powerUps, this.focusPoints, this.obstacles);
        this.renderer.drawDamian(this.damian);
        this.renderer.drawUI(
            this.score, 
            this.lives, 
            this.messages
        );
    }

    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        if (e.key === 'ArrowLeft') {
            this.player.move('left');
        } else if (e.key === 'ArrowRight') {
            this.player.move('right');
        } else if (e.key === ' ' && this.powerUpManager.impulsivityAvailable) {
            this.powerUpManager.useImpulsivity();
        }
    }

    handleTouch(e) {
        e.preventDefault();
        if (!this.gameRunning || this.gamePaused) return;
        
        const currentTime = Date.now();
        const tapLength = currentTime - this.lastTapTime;
        
        if (tapLength < this.doubleTapDelay && tapLength > 0) {
            // Double tap detected
            if (this.powerUpManager.impulsivityAvailable) {
                this.powerUpManager.useImpulsivity();
            }
            e.preventDefault(); // Prevent zoom
        }
        
        this.lastTapTime = currentTime;
        
        // Standardowe poruszanie się
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        
        if (touchX < this.canvas.width/2) {
            this.player.move('left');
        } else {
            this.player.move('right');
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
        
        // Aktualizacja timera przeszkód
        this.obstacleTimer--;
        if (this.obstacleTimer <= 0) {
            this.createObstacle();
            // Timer jest ustawiany w createObstacle na podstawie losowego czasu
        }
    }
    
    showDMDialog(message) {
        this.gamePaused = true;
        
        const dmOverlay = document.getElementById('dm-overlay');
        const dmTitle = dmOverlay.querySelector('h3');
        const dmMessage = document.getElementById('damian-message');
        const ghostButton = dmOverlay.querySelector('#ghost-button');
        
        // Resetuj nagłówek do domyślnego dla DM
        dmTitle.textContent = '📱 Damian sent you a DM!';
        dmMessage.textContent = message;
        ghostButton.textContent = "Ghost him!"; // Resetuj tekst przycisku
        
        dmOverlay.style.display = 'block';
        
        ghostButton.onclick = () => {
            // Text disappearing animation
            let text = dmMessage.textContent;
            const disappearInterval = setInterval(() => {
                text = text.slice(0, -1);
                dmMessage.textContent = text;
                
                if (text.length === 0) {
                    clearInterval(disappearInterval);
                    setTimeout(() => {
                        // Show Nadia's response
                        dmMessage.textContent = this.nadjowa.getRandomResponse();
                        setTimeout(() => {
                            dmOverlay.style.display = 'none';
                            this.gamePaused = false;
                        }, 1500);
                    }, 500);
                }
            }, 50);
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
