export class AudioManager {
    constructor() {
        this.hitSound = new Audio('assets/sounds/hit_obstacle.wav');
        this.startSound = new Audio('assets/sounds/game_start.ogg');
        this.powerupSound = new Audio('assets/sounds/powerup.wav');
        
        // Set volume levels
        this.hitSound.volume = 0.6;
        this.startSound.volume = 0.4;
        this.powerupSound.volume = 0.5;
        
        // Preload sounds
        this.preloadSounds();
    }
    
    preloadSounds() {
        this.hitSound.load();
        this.startSound.load();
        this.powerupSound.load();
    }
    
    playStart() {
        this.startSound.currentTime = 0;
        this.startSound.play().catch(error => {
            console.log("Audio play failed:", error);
        });
    }
    
    playHit() {
        this.hitSound.currentTime = 0;
        this.hitSound.play().catch(error => {
            console.log("Audio play failed:", error);
        });
    }
    
    playPowerup() {
        this.powerupSound.currentTime = 0;
        this.powerupSound.play().catch(error => {
            console.log("Audio play failed:", error);
        });
    }
}
