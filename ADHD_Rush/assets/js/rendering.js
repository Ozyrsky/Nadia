export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0c0c1d');
        gradient.addColorStop(1, '#1a0033');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.drawCityscape();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x < this.canvas.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawCityscape() {
        this.ctx.fillStyle = '#000033';
        for (let x = 0; x < this.canvas.width; x += 60) {
            const height = Math.random() * 100 + 50;
            this.ctx.fillRect(x, this.canvas.height - height, 40, height);
            
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            for (let y = this.canvas.height - height + 10; y < this.canvas.height - 10; y += 15) {
                for (let wx = x + 5; wx < x + 35; wx += 15) {
                    if (Math.random() > 0.3) {
                        this.ctx.fillRect(wx, y, 10, 10);
                    }
                }
            }
            this.ctx.fillStyle = '#000033';
        }
    }

    drawPlayer(player, turboFocusActive, flashDodgeAvailable) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(player.x + player.width/2, player.y + player.height/2, player.width/2, 0, Math.PI * 2);
        this.ctx.clip();
        this.ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
        this.ctx.restore();

        if (turboFocusActive) {
            this.drawTurboFocusEffect(player);
        }
        if (flashDodgeAvailable) {
            this.drawFlashDodgeIndicator(player);
        }
    }

    drawObstacle(obstacle) {
        this.ctx.fillStyle = obstacle.color;
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        this.ctx.fillStyle = "#ffffff";
        if (obstacle.type === 'notification') {
            this.ctx.beginPath();
            this.ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, 8, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (obstacle.type === 'meme') {
            this.ctx.font = "12px Arial";
            this.ctx.fillText("🤣", obstacle.x + obstacle.width / 2 - 6, obstacle.y + obstacle.height / 2 + 4);
        } else if (obstacle.type === 'social') {
            this.ctx.font = "12px Arial";
            this.ctx.fillText("📱", obstacle.x + obstacle.width / 2 - 6, obstacle.y + obstacle.height / 2 + 4);
        } else if (obstacle.type === 'message') {
            this.ctx.font = "12px Arial";
            this.ctx.fillText("💬", obstacle.x + obstacle.width / 2 - 6, obstacle.y + obstacle.height / 2 + 4);
        }
    }

    drawPowerUp(powerUp) {
        this.ctx.fillStyle = powerUp.color;
        const centerX = powerUp.x + powerUp.width / 2;
        const centerY = powerUp.y + powerUp.height / 2;
        
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5;
            const x = centerX + Math.cos(angle) * powerUp.width/2;
            const y = centerY + Math.sin(angle) * powerUp.height/2;
            i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawFocusPoint(point) {
        this.ctx.fillStyle = point.color;
        this.ctx.beginPath();
        this.ctx.arc(point.x + point.width/2, point.y + point.height/2, point.width/2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawTurboFocusEffect(player) {
        this.ctx.shadowColor = "#00ff00";
        this.ctx.shadowBlur = 20;
        this.ctx.strokeStyle = "#00ff00";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
        this.ctx.shadowBlur = 0;
    }

    drawFlashDodgeIndicator(player) {
        this.ctx.fillStyle = "#ffff00";
        this.ctx.beginPath();
        this.ctx.arc(player.x + player.width / 2, player.y - 10, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawDamian(damian) {
        if (!damian.active) return;

        this.ctx.save();
        this.ctx.drawImage(damian.image, damian.x, damian.y, damian.width, damian.height);
        
        this.ctx.shadowColor = "#ff0000";
        this.ctx.shadowBlur = 20;
        this.ctx.strokeStyle = "#ff0000";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(damian.x, damian.y, damian.width, damian.height);
        this.ctx.restore();

        if (!damian.hasShownMessage) {
            this.drawDamianTextCloud(damian);
        }
    }

    drawDamianTextCloud(damian) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.beginPath();
        this.ctx.moveTo(damian.x + 40, damian.y - 15);
        this.ctx.lineTo(damian.x + 35, damian.y - 25);
        this.ctx.lineTo(damian.x + 10, damian.y - 30);
        this.ctx.lineTo(damian.x, damian.y - 60);
        this.ctx.lineTo(damian.x + 80, damian.y - 60);
        this.ctx.lineTo(damian.x + 70, damian.y - 30);
        this.ctx.lineTo(damian.x + 45, damian.y - 25);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "#ff0000";
        this.ctx.fillText(damian.currentMessage, damian.x + 10, damian.y - 40);
    }

    drawGameObjects(obstacles, powerUps, focusPoints) {
        obstacles.forEach(obstacle => this.drawObstacle(obstacle));
        powerUps.forEach(powerUp => this.drawPowerUp(powerUp));
        focusPoints.forEach(point => this.drawFocusPoint(point));
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
