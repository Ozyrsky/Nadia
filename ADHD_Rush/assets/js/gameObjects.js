import { GAME_CONFIG, ASSET_PATHS } from './config.js';

export { GameObject, DM, PowerUp, FocusPoint, Obstacle };

class GameObject {
    constructor(x, y, width, height, speed, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.color = color;
        this.image = null;
        this.imageLoaded = false;
    }
    
    loadImage(src) {
        this.image = new Image();
        this.image.src = src;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.image.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            this.imageLoaded = false;
        };
    }
}

class DM extends GameObject {
    constructor(damianX) {
        super(
            damianX + 40 - 20,
            100 + 80,
            40,
            40,
            1 + Math.random() * 0.5,
            '#ff4444'
        );
        this.type = 'dm';
        this.missed = false;
        this.message = "";
        this.rotation = Math.random() * 0.2 - 0.1;
        this.oscillateOffset = Math.random() * Math.PI * 2;
        this.emoji = '📱';
    }
}


class PowerUp extends GameObject {
    constructor() {
        const types = {
            hyperFocus: { 
                color: '#00ff00', 
                effect: 'activateHyperFocus',
                description: "Hiperfokus: Twoja zdolność do skupienia się na jednej rzeczy przez długi czas teraz działa na twoją korzyść!",
                emoji: '🎯'
            },
            impulsivity: { 
                color: '#ffff00', 
                effect: 'activateImpulsivity',
                description: "Impulsywność: Szybkie decyzje i działanie bez zastanowienia - teraz to twoja supermoc!",
                emoji: '⚡'
            },
            creativeChaos: { 
                color: '#ff9900', 
                effect: 'activateCreativeChaos',
                description: "Kreatywny chaos: Twój umysł generuje tysiące pomysłów na minutę - wykorzystaj to przeciwko Damianowi!",
                emoji: '🌪️'
            }
        };

        const typeKeys = Object.keys(types);
        const selectedType = typeKeys[Math.floor(Math.random() * typeKeys.length)];

        super(
            Math.random() * (GAME_CONFIG.canvas.width - 30),
            0,
            30,
            30,
            2,
            types[selectedType].color
        );
        
        this.type = selectedType;
        this.effect = types[selectedType].effect;
        this.description = types[selectedType].description;
        this.emoji = types[selectedType].emoji;
    }
}

class Obstacle extends GameObject {
    constructor(x, y, width, height, speed) {
        super(
            x,
            y,
            width,
            height,
            speed,
            '#ff0066' // Kolor przeszkody
        );
        this.type = 'obstacle';
    }
}



class FocusPoint extends GameObject {
    constructor() {
        super(
            Math.random() * (GAME_CONFIG.canvas.width - 15),
            0, // Start from top
            15,
            15,
            5,
            '#00ffff'
        );
    }
}
