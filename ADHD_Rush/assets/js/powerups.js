import { GAME_CONFIG } from './config.js';

export class PowerUpManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.hyperFocusActive = false;
        this.hyperFocusTimer = 0;
        this.impulsivityAvailable = false;
        this.creativeChaosActive = false;
        this.creativeChaosTimer = 0;
        
        // Anti-Damian power tracking
        this.damianHitCount = 0;
        this.maxDamianHits = 3; // Game victory after 3 hits
        
        // Power-up types and their emojis
        this.powerUpTypes = {
            hyperFocus: '🎯',
            impulsivity: '⚡',
            creativeChaos: '🌪️'
        };
    }

    activateHyperFocus() {
        this.hyperFocusActive = true;
        this.hyperFocusTimer = GAME_CONFIG.powerUps.duration;
        
        // Show power-up dialog
        this.showPowerUpDialog("Hiperfokus", 
            "Jesteś niewrażliwa na DM-y przez 10 sekund!");
    }

    activateImpulsivity() {
        this.impulsivityAvailable = true;
        
        // Show power-up dialog
        this.showPowerUpDialog("Impulsywność", 
            "Double-tap, aby odrzucić wszystkie DM-y!");
    }

    activateCreativeChaos() {
        this.creativeChaosActive = true;
        this.creativeChaosTimer = GAME_CONFIG.powerUps.duration;
        
        // Disable Damian temporarily
        if (this.gameState.damian.active) {
            this.gameState.damian.temporarilyDisabled = true;
        }
        
        // Show power-up dialog
        this.showPowerUpDialog("Kreatywny Chaos", 
            "Damian jest zdezorientowany i nie może wysyłać DM-ów!");
        
        // Increment Damian hit counter
        this.damianHitCount++;
        
        // Check for victory condition
        if (this.damianHitCount >= this.maxDamianHits) {
            setTimeout(() => {
                this.gameState.victoryAchieved = true;
                this.gameState.endGame(true); // true indicates victory
            }, 1000);
        }
    }

    showPowerUpDialog(title, description) {
        this.gameState.gamePaused = true;
        
        const dmOverlay = document.getElementById('dm-overlay');
        const dmTitle = dmOverlay.querySelector('h3');
        const dmMessage = document.getElementById('damian-message');
        const ghostButton = dmOverlay.querySelector('#ghost-button');
        
        // Aktualizacja nagłówka dla power-upów
        dmTitle.textContent = `🎁 ${title} Aktywowany!`;
        dmMessage.textContent = description;
        ghostButton.textContent = "Super!";
        dmOverlay.style.display = 'block';
        
        ghostButton.onclick = () => {
            dmOverlay.style.display = 'none';
            this.gameState.gamePaused = false;
        };
    }

    update() {
        if (this.hyperFocusActive) {
            this.hyperFocusTimer--;
            if (this.hyperFocusTimer <= 0) {
                this.hyperFocusActive = false;
            }
        }

        if (this.creativeChaosActive) {
            this.creativeChaosTimer--;
            if (this.creativeChaosTimer <= 0) {
                this.creativeChaosActive = false;
                
                // Re-enable Damian
                if (this.gameState.damian.active) {
                    this.gameState.damian.temporarilyDisabled = false;
                }
            }
        }
    }

    useImpulsivity() {
        if (this.impulsivityAvailable) {
            // Clear all DMs from screen
            this.gameState.dms = [];
            
            // Add score bonus
            this.gameState.score += 25;
            
            this.impulsivityAvailable = false;
            
            // Increment Damian hit counter
            this.damianHitCount++;
            
            // Check for victory condition
            if (this.damianHitCount >= this.maxDamianHits) {
                setTimeout(() => {
                    this.gameState.victoryAchieved = true;
                    this.gameState.endGame(true); // true indicates victory
                }, 1000);
            }
        }
    }
    
    // Metoda do pobrania aktywnego power-upa i jego czasu trwania
    getActivePowerUpInfo() {
        if (this.hyperFocusActive) {
            return {
                emoji: this.powerUpTypes.hyperFocus,
                timeLeft: Math.ceil(this.hyperFocusTimer / 60)
            };
        }
        if (this.creativeChaosActive) {
            return {
                emoji: this.powerUpTypes.creativeChaos,
                timeLeft: Math.ceil(this.creativeChaosTimer / 60)
            };
        }
        if (this.impulsivityAvailable) {
            return {
                emoji: this.powerUpTypes.impulsivity,
                timeLeft: null // Impulsivity nie ma licznika
            };
        }
        return null;
    }
}
