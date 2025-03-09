import { AudioManager } from './audio.js';

export class CollisionManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.audioManager = new AudioManager();
    }

    checkCollisions(player, obstacles, powerUps, focusPoints) {
        this.checkObstacleCollisions(player, obstacles);
        this.checkPowerUpCollisions(player, powerUps);
        this.checkFocusPointCollisions(player, focusPoints);
    }

    isColliding(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    checkObstacleCollisions(player, obstacles) {
        for (let i = obstacles.length - 1; i >= 0; i--) {
            if (this.isColliding(player, obstacles[i])) {
                obstacles.splice(i, 1);
                this.gameState.lives--;
                this.audioManager.hitSound.play();
                
                if (this.gameState.lives <= 0) {
                    this.gameState.endGame();
                } else {
                    this.gameState.score -= 50;
                    if (this.gameState.score < 0) this.gameState.score = 0;
                }
            }
        }
    }

    checkPowerUpCollisions(player, powerUps) {
        for (let i = powerUps.length - 1; i >= 0; i--) {
            if (this.isColliding(player, powerUps[i])) {
                this.audioManager.powerupSound.play();
                this.gameState.activatePowerUp(powerUps[i].effect);
                powerUps.splice(i, 1);
            }
        }
    }

    checkFocusPointCollisions(player, focusPoints) {
        for (let i = focusPoints.length - 1; i >= 0; i--) {
            if (this.isColliding(player, focusPoints[i])) {
                this.gameState.score += 10;
                focusPoints.splice(i, 1);
                
                if (Math.random() < 0.3 && !this.gameState.nadjowa.active) {
                    this.gameState.nadjowa.activate();
                }
            }
        }
    }
}
