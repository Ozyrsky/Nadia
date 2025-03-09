import { ASSET_PATHS } from './config.js';

export class AudioManager {
    constructor() {
        this.hitSound = new Audio(ASSET_PATHS.sounds.hit);
        this.startSound = new Audio(ASSET_PATHS.sounds.start);
        this.powerupSound = new Audio(ASSET_PATHS.sounds.powerup);
        
        this.initializeSounds();
    }

    initializeSounds() {
        // Preload sounds
        this.hitSound.load();
        this.startSound.load();
        this.powerupSound.load();

        // Set volumes
        this.hitSound.volume = 0.6;
        this.startSound.volume = 0.4;
        this.powerupSound.volume = 0.5;
    }

    playStart() {
        this.startSound.currentTime = 0;
        this.startSound.play();
    }

    playHit() {
        this.hitSound.currentTime = 0;
        this.hitSound.play();
    }

    playPowerup() {
        this.powerupSound.currentTime = 0;
        this.powerupSound.play();
    }
}
