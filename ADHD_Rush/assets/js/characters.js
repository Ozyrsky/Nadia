import { GAME_CONFIG, ASSET_PATHS } from './config.js';
import { DM } from './gameObjects.js';

export { Player, Damian, Nadjowa };

class Player {
    constructor() {
        this.x = GAME_CONFIG.player.startX;
        this.y = GAME_CONFIG.player.startY;
        this.width = GAME_CONFIG.player.width;
        this.height = GAME_CONFIG.player.height;
        this.speed = GAME_CONFIG.player.speed * 1.2; // 20% faster movement
        this.color = GAME_CONFIG.player.color;
        this.image = new Image();
        this.image.src = ASSET_PATHS.images.player;
        this.imageLoaded = false;
        
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.image.onerror = () => {
            console.error("Failed to load player image");
            this.imageLoaded = false;
        };
    }

    move(direction) {
        if (direction === 'left') {
            this.x = Math.max(0, this.x - this.speed);
        } else if (direction === 'right') {
            this.x = Math.min(GAME_CONFIG.canvas.width - this.width, this.x + this.speed);
        }
    }
}

class Damian {
    constructor() {
        this.x = GAME_CONFIG.damian.startX;
        this.y = GAME_CONFIG.damian.startY;
        this.width = GAME_CONFIG.damian.width;
        this.height = GAME_CONFIG.damian.height;
        this.speed = GAME_CONFIG.damian.speed;
        this.active = false;
        this.sleepTimer = GAME_CONFIG.damian.sleepTimer;
        this.awakeTime = GAME_CONFIG.damian.awakeTime;
        this.attackTimer = 0;
        this.temporarilyDisabled = false;
        this.health = 3;
        
        // Start with much lower attack rate (5x less)
        this.attackRate = 600; // 5x slower than original 120
        this.maxAttackRate = 120; // Will gradually increase to this
        this.attackRateDecrement = 20; // How much to decrease per visit
        
        this.visitCount = 0;
        this.showSadFace = false;
        this.sadFaceTimer = 0;
        
        // Add unpredictable movement variables
        this.targetX = this.x;
        this.movementTimer = 0;
        this.movementInterval = 120; // Change direction every 2 seconds
        this.movementSpeed = 1.5; // Faster than player for unpredictability
        
        this.image = new Image();
        this.image.src = ASSET_PATHS.images.damian;
        this.imageLoaded = false;
        
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        
        this.messages = [
            "Hej, może zamiast tej nudnej gry, sprawdzisz, co nowego na TikToku?",
            "Słyszałem, że masz nowe powiadomienie na Instagramie. Nie chcesz zobaczyć?",
            "Czy naprawdę myślisz, że osiągniesz wysoki wynik? Daj spokój!",
            "O, patrz! Nowy mem krąży w sieci. Musisz go zobaczyć!",
            "Twoi znajomi właśnie grają w coś ciekawszego. Dołącz do nich!",
            "Hej, sprawdź swoje powiadomienia! Może ktoś do ciebie napisał?",
            "Nie nudzi ci się ta gra? Może czas na przerwę?",
            "Podobno na YouTube pojawił się nowy filmik z kotami. Musisz to zobaczyć!",
            "Czy na pewno wyłączyłaś żelazko przed wyjściem z domu?",
            "Zastanawiałaś się kiedyś, ile gwiazd jest w naszej galaktyce?"
        ];
    }

    update(playerX) {
        if (!this.active || this.temporarilyDisabled) {
            if (!this.active) {
                this.sleepTimer--;
                if (this.sleepTimer <= 0) {
                    this.activate();
                }
            }
            return null;
        }

        if (this.y < 100) {
            this.y += this.speed;
            return null;
        } else {
            this.awakeTime--;
            this.attackTimer--;
            
            // Unpredictable movement
            this.movementTimer--;
            if (this.movementTimer <= 0) {
                // Set a new random target position
                this.targetX = Math.random() * (GAME_CONFIG.canvas.width - this.width);
                this.movementTimer = this.movementInterval;
            }
            
            // Move toward target position instead of following player
            const dx = this.targetX - this.x;
            if (Math.abs(dx) > this.movementSpeed) {
                this.x += Math.sign(dx) * this.movementSpeed;
            }
            
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackRate;
                return this.sendDM();
            }
            
            if (this.awakeTime <= 0) {
                this.deactivate();
            }
        }

        // Update sad face timer if active
        if (this.showSadFace) {
            this.sadFaceTimer--;
            if (this.sadFaceTimer <= 0) {
                this.showSadFace = false;
            }
        }

        return null;
    }

    activate() {
        this.active = true;
        this.y = 0;
        this.visitCount++;
        this.awakeTime = GAME_CONFIG.damian.awakeTime;
        
        // Gradually increase attack rate with each visit
        this.attackRate = Math.max(this.maxAttackRate, 600 - (this.visitCount * this.attackRateDecrement));
        this.attackTimer = this.attackRate;
        
        // Reset movement variables
        this.targetX = Math.random() * (GAME_CONFIG.canvas.width - this.width);
        this.movementTimer = this.movementInterval;
    }

    deactivate() {
        this.active = false;
        this.sleepTimer = GAME_CONFIG.damian.sleepTimer;
        this.y = GAME_CONFIG.damian.startY; // Reset position
    }
    

    showSadEmoji() {
        this.showSadFace = true;
        this.sadFaceTimer = 60; // Show for 1 second
    }

    sendDM() {
        const dm = new DM(this.x);
        dm.message = this.messages[Math.floor(Math.random() * this.messages.length)];
        return dm;
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
        this.responses = [
            "Nie mam czasu na takie głupoty! 🙄",
            "Sorki, jestem zajęta surfowaniem! 🏄‍♀️",
            "Może później... albo nigdy! 😎",
            "*Seen* ✓✓",
            "Error 404: Response not found 😏",
            "Nadia.exe has stopped responding 💅",
            "New phone, who dis? 📱",
            "*Włącza tryb samolotowy* ✈️",
            "Sorry, jestem na plaży! 🏖️",
            "Mój focus jest silniejszy niż twoje DM-y! 💪"
        ];
        this.currentMessage = "";
    }

    activate() {
        this.active = true;
        this.displayTime = 180;
        this.currentMessage = this.messages[Math.floor(Math.random() * this.messages.length)];
    }
    
    getRandomResponse() {
        return this.responses[Math.floor(Math.random() * this.responses.length)];
    }
}
