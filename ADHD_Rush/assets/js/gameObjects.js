import { GAME_CONFIG } from './config.js';

export { GameObject, Obstacle, PowerUp, FocusPoint, Pipe };

class GameObject {
    constructor(x, y, width, height, speed, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.color = color;
    }
}

class Obstacle extends GameObject {
    constructor(type) {
        const types = {
            notification: { color: '#3b5998', width: 30, height: 30 },
            meme: { color: '#ff4500', width: 40, height: 40 },
            social: { color: '#1da1f2', width: 35, height: 35 }
        };

        super(
            GAME_CONFIG.canvas.width,
            Math.random() * (GAME_CONFIG.canvas.height - 50),
            types[type].width,
            types[type].height,
            4 + Math.random() * 3,
            types[type].color
        );
        this.type = type;
    }
}

class PowerUp extends GameObject {
    constructor(type) {
        const types = {
            turboFocus: { color: '#00ff00', effect: 'activateTurboFocus' },
            flashDodge: { color: '#ffff00', effect: 'activateFlashDodge' },
            hamsterWheel: { color: '#ff9900', effect: 'activateHamsterWheel' }
        };

        super(
            GAME_CONFIG.canvas.width,
            Math.random() * (GAME_CONFIG.canvas.height - 30),
            25,
            25,
            3,
            types[type].color
        );
        this.type = type;
        this.effect = types[type].effect;
    }
}

class FocusPoint extends GameObject {
    constructor() {
        super(
            GAME_CONFIG.canvas.width,
            Math.random() * (GAME_CONFIG.canvas.height - 20),
            15,
            15,
            5,
            '#00ffff'
        );
    }
}

class Pipe extends GameObject {
    constructor(isTop, height, gap) {
        super(
            GAME_CONFIG.canvas.width,
            isTop ? 0 : height + gap,
            60,
            isTop ? height : GAME_CONFIG.canvas.height - (height + gap),
            3,
            '#4a4a4a'
        );
        this.type = 'pipe';
    }
}
