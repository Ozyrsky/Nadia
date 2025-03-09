import { AudioManager } from './audio.js';

export class CollisionManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.audioManager = new AudioManager();
    }

    checkCollisions(player, dms, powerUps, focusPoints, obstacles) {
        this.checkDMCollisions(player, dms);
        this.checkPowerUpCollisions(player, powerUps);
        this.checkFocusPointCollisions(player, focusPoints);
        this.checkObstacleCollisions(player, obstacles);
    }

    isColliding(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    checkDMCollisions(player, dms) {
        // Skip collision check if player is invincible or HyperFocus is active
        if (this.gameState.renderer.playerInvincible || 
            this.gameState.powerUpManager.hyperFocusActive) {
            return;
        }
        
        for (let i = dms.length - 1; i >= 0; i--) {
            if (this.isColliding(player, dms[i])) {
                // When player collides with a DM, show the message dialog
                this.gameState.showDMDialog(dms[i].message);
                this.audioManager.playHit();
                
                // Remove the DM
                dms.splice(i, 1);
                
                // Reduce lives
                this.gameState.lives--;
                
                // Damian gains health (but not more than max)
                if (this.gameState.damian.health < this.gameState.powerUpManager.maxDamianHits) {
                    this.gameState.damian.health++;
                    
                    // Show message that Damian gained health
                    this.gameState.messages.push({
                        text: "Odpisałaś Damianowi! Nadia: O nie, co ja zrobiłam... Damian +1 ❤️",
                        timer: 180 // Show for 3 seconds
                    });
                }
                
                if (this.gameState.lives <= 0) {
                    this.gameState.endGame();
                } else {
                    // Set player invincible for 3 seconds (180 frames at 60fps)
                    this.gameState.renderer.setPlayerInvincible(180);
                    
                    this.gameState.score -= 50;
                    if (this.gameState.score < 0) this.gameState.score = 0;
                }
            }
        }
    }

    checkPowerUpCollisions(player, powerUps) {
        for (let i = powerUps.length - 1; i >= 0; i--) {
            if (this.isColliding(player, powerUps[i])) {
                this.audioManager.playPowerup();
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
    
    checkObstacleCollisions(player, obstacles) {
        // Skip collision check if player is invincible
        if (this.gameState.renderer.playerInvincible) {
            return;
        }
        
        for (let i = obstacles.length - 1; i >= 0; i--) {
            if (this.isColliding(player, obstacles[i])) {
                // Gdy gracz zderzy się z przeszkodą
                this.audioManager.playHit();
                
                // Zmniejsz życie
                this.gameState.lives--;
                
                // Usuń przeszkodę
                obstacles.splice(i, 1);
                
                // Damian zyskuje +1 HP
                if (this.gameState.damian.health < this.gameState.powerUpManager.maxDamianHits) {
                    this.gameState.damian.health++;
                    
                    // Pokaż wiadomość o odpisaniu Damianowi
                    this.gameState.messages.push({
                        text: "Odpisałaś Damianowi! Nadia: Boże, co ja zrobiłam? Damian +1 ❤️",
                        timer: 180 // Pokaż przez 3 sekundy
                    });
                }
                
                if (this.gameState.lives <= 0) {
                    this.gameState.endGame();
                } else {
                    // Ustaw gracza jako niewrażliwego na 3 sekundy (180 klatek przy 60fps)
                    this.gameState.renderer.setPlayerInvincible(180);
                    
                    // Zmniejsz wynik
                    this.gameState.score -= 30;
                    if (this.gameState.score < 0) this.gameState.score = 0;
                }
            }
        }
    }
}
