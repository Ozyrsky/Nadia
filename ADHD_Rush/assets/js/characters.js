import { GAME_CONFIG, ASSET_PATHS } from './config.js';

export { Player, Damian, Nadjowa };

class Player {
    constructor() {
        this.x = GAME_CONFIG.player.startX;
        this.y = GAME_CONFIG.canvas.height / 2;
        this.width = GAME_CONFIG.player.width;
        this.height = GAME_CONFIG.player.height;
        this.speed = GAME_CONFIG.player.speed;
        this.color = GAME_CONFIG.player.color;
        this.image = new Image();
        this.image.src = ASSET_PATHS.images.player;
    }

    move(direction) {
        if (direction === 'up') {
            this.y = Math.max(0, this.y - this.speed);
        } else if (direction === 'down') {
            this.y = Math.min(GAME_CONFIG.canvas.height - this.height, this.y + this.speed);
        }
    }
}

class Damian {
    constructor() {
        this.x = GAME_CONFIG.canvas.width;
        this.y = GAME_CONFIG.canvas.height / 2;
        this.width = GAME_CONFIG.damian.width;
        this.height = GAME_CONFIG.damian.height;
        this.speed = GAME_CONFIG.damian.speed;
        this.active = false;
        this.sleepTimer = GAME_CONFIG.damian.sleepTimer;
        this.awakeTime = GAME_CONFIG.damian.awakeTime;
        this.hasShownMessage = false;
        this.attackTimer = 0;
        this.attackRate = 60;
        this.visitCount = 0;
        this.messageDisplayed = false;

        this.image = new Image();
        this.image.src = ASSET_PATHS.images.damian;
        
        this.messages = [
            "Hej, może zamiast tej nudnej gry, sprawdzisz, co nowego na TikToku?",
            "Słyszałem, że masz nowe powiadomienie na Instagramie. Nie chcesz zobaczyć?",
            "Czy naprawdę myślisz, że osiągniesz wysoki wynik? Daj spokój!",
            "O, patrz! Nowy mem krąży w sieci. Musisz go zobaczyć!",
            "Twoi znajomi właśnie grają w coś ciekawszego. Dołącz do nich!"
        ];
        this.currentMessage = "";
    }

    update(playerY) {
        if (!this.active) {
            this.sleepTimer--;
            if (this.sleepTimer <= 0) {
                this.activate();
            }
            return;
        }

        if (this.x > GAME_CONFIG.canvas.width - 100) {
            this.x -= this.speed;
        } else if (!this.messageDisplayed) {
            this.currentMessage = this.messages[Math.floor(Math.random() * this.messages.length)];
            this.messageDisplayed = true;
            this.attackTimer = this.attackRate;
        } else {
            this.awakeTime--;
            this.attackTimer--;
            
            if (this.attackTimer <= 0) {
                this.attack();
                this.attackTimer = this.attackRate - (this.visitCount * 5);
            }
            
            if (this.awakeTime <= 0) {
                this.deactivate();
            }
        }

        this.y += (playerY - this.y) * 0.05;
    }

    activate() {
        this.active = true;
        this.x = GAME_CONFIG.canvas.width;
        this.visitCount++;
        this.awakeTime = GAME_CONFIG.damian.awakeTime;
        this.messageDisplayed = false;
        this.hasShownMessage = false;
    }

    deactivate() {
        this.active = false;
        this.sleepTimer = GAME_CONFIG.damian.sleepTimer;
        this.messageDisplayed = false;
        this.hasShownMessage = false;
    }

    attack() {
        return {
            x: this.x,
            y: this.y + this.height / 2,
            type: 'message',
            width: 30,
            height: 30,
            speed: 5,
            color: '#ff4444'
        };
    }
}

class Nadjowa {
    constructor() {
        this.active = false;
        this.displayTime = 0;
        this.messages = [
            "Nie słuchaj go, skup się na swoim celu!",
            "Damian tylko chce cię rozproszyć. Pokaż mu, na co cię stać!",
            "Pamiętaj o swoim focusie! Dasz radę!",
            "Jestem z tobą! Zignoruj te rozpraszacze!",
            "Świetnie sobie radzisz! Kontynuuj!"
        ];
        this.currentMessage = "";
    }

    activate() {
        this.active = true;
        this.displayTime = 180;
        this.currentMessage = this.messages[Math.floor(Math.random() * this.messages.length)];
    }
}
