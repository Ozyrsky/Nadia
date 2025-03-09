import { GAME_CONFIG } from './config.js';

export class PowerUpManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.turboFocusActive = false;
        this.turboFocusTimer = 0;
        this.flashDodgeAvailable = false;
        this.hamsterWheelActive = false;
        this.hamsterWheelTimer = 0;
    }

    activateTurboFocus() {
        this.turboFocusActive = true;
        this.turboFocusTimer = GAME_CONFIG.powerUps.duration;
    }

    activateFlashDodge() {
        this.flashDodgeAvailable = true;
    }

    activateHamsterWheel() {
        this.hamsterWheelActive = true;
        this.hamsterWheelTimer = GAME_CONFIG.powerUps.duration;
        
        this.gameState.obstacles.forEach(obstacle => {
            obstacle.speed = -obstacle.speed;
        });
    }

    update() {
        if (this.turboFocusActive) {
            this.turboFocusTimer--;
            if (this.turboFocusTimer <= 0) {
                this.turboFocusActive = false;
            }
        }

        if (this.hamsterWheelActive) {
            this.hamsterWheelTimer--;
            if (this.hamsterWheelTimer <= 0) {
                this.hamsterWheelActive = false;
                this.gameState.obstacles.forEach(obstacle => {
                    obstacle.speed = Math.abs(obstacle.speed);
                });
            }
        }
    }

    useFlashDodge() {
        if (this.flashDodgeAvailable) {
            this.gameState.obstacles.forEach(obstacle => {
                if (Math.abs(obstacle.x - this.gameState.player.x) < 150) {
                    obstacle.x = GAME_CONFIG.canvas.width;
                }
            });
            this.flashDodgeAvailable = false;
        }
    }
}
