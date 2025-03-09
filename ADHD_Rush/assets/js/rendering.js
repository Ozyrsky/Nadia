export class Renderer {
    constructor(canvas, gameState) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = gameState;
                
        // Wave animation properties
        this.waveOffset = 0;
        this.waveSpeed = 0.05;
        
        // Player invincibility state
        this.playerInvincible = false;
        this.invincibilityTimer = 0;
        this.invincibilityFlashRate = 10; // Flash rate for invincibility
    }
    

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        // Miami Vice sunset gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#FF6B6B'); // Coral sunset
        gradient.addColorStop(0.5, '#FF8E53'); // Orange middle
        gradient.addColorStop(1, '#4B0082'); // Deep purple bottom
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw 80s style elements
        this.drawRetroGrid();
        this.drawPalmTrees();
        this.drawOcean();
        
        // Update wave animation
        this.waveOffset += this.waveSpeed;
        if (this.waveOffset > Math.PI * 2) {
            this.waveOffset = 0;
        }
    }

    drawRetroGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        
        // Perspective grid (80s style)
        const horizon = this.canvas.height * 0.65;
        const vanishingPointX = this.canvas.width / 2;
        
        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.canvas.height);
            const targetX = vanishingPointX + (x - vanishingPointX) * 0.3;
            this.ctx.lineTo(targetX, horizon);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = this.canvas.height; y >= horizon; y -= 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawPalmTrees() {
        // Add palm tree silhouettes
        for (let x = 50; x < this.canvas.width; x += 200) {
            this.drawPalmTree(x, this.canvas.height - 100);
        }
    }

    drawPalmTree(x, y) {
        this.ctx.fillStyle = '#000000';
        // Trunk
        this.ctx.fillRect(x - 10, y - 80, 20, 80);
        
        // Leaves
        this.ctx.beginPath();
        for (let angle = -Math.PI/3; angle <= Math.PI/3; angle += Math.PI/8) {
            this.ctx.moveTo(x, y - 80);
            this.ctx.quadraticCurveTo(
                x + Math.cos(angle) * 40,
                y - 80 - Math.sin(angle) * 40,
                x + Math.cos(angle) * 80,
                y - 80 - Math.sin(angle) * 60
            );
        }
        this.ctx.fill();
    }

    drawOcean() {
        // Draw ocean at the bottom
        const oceanHeight = this.canvas.height * 0.2;
        const oceanY = this.canvas.height - oceanHeight;
        
        // Ocean gradient
        const oceanGradient = this.ctx.createLinearGradient(0, oceanY, 0, this.canvas.height);
        oceanGradient.addColorStop(0, '#00CED1'); // Turquoise
        oceanGradient.addColorStop(1, '#4169E1'); // Royal Blue
        
        this.ctx.fillStyle = oceanGradient;
        this.ctx.fillRect(0, oceanY, this.canvas.width, oceanHeight);
        
        // Draw animated waves
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < 3; i++) {
            const waveY = oceanY + (i * 20);
            this.ctx.beginPath();
            
            for (let x = 0; x < this.canvas.width; x += 10) {
                const height = Math.sin(x / 30 + this.waveOffset + i) * 5;
                if (x === 0) {
                    this.ctx.moveTo(x, waveY + height);
                } else {
                    this.ctx.lineTo(x, waveY + height);
                }
            }
            
            this.ctx.stroke();
        }
    }

    drawUI(score, lives, messages) {
        // Draw score with larger, bolder font
        this.ctx.font = '900 24px "Montserrat"';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'left';
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText(`Fokus: ${Math.floor(score)}`, 10, 35);
        this.ctx.shadowBlur = 0;
        
        // Draw lives as larger hearts
        this.ctx.textAlign = 'right';
        this.ctx.font = '32px Arial'; // Larger hearts
        this.ctx.fillText('❤️'.repeat(lives), this.canvas.width - 10, 35);
        
        // Draw active power-up and timer if any
        if (this.gameState && this.gameState.powerUpManager) {
            const powerUpInfo = this.gameState.powerUpManager.getActivePowerUpInfo();
            if (powerUpInfo) {
                this.ctx.font = '24px Arial';
                this.ctx.fillText(powerUpInfo.emoji, this.canvas.width - 10, 70);
                if (powerUpInfo.timeLeft !== null) {
                    this.ctx.font = '16px Arial';
                    this.ctx.fillText(powerUpInfo.timeLeft, this.canvas.width - 30, 70);
                }
            }
        }
        
        // Draw messages if any (but not for power-ups)
        if (messages && messages.length > 0) {
            this.drawMessageBox(messages[messages.length - 1]);
        }
    }
    

    drawMessageBox(message) {
        const padding = 20;
        const boxWidth = this.canvas.width - 40;
        const boxHeight = 60;
        const x = 20;
        const y = 50;

        // Draw message box background with gradient
        const gradient = this.ctx.createLinearGradient(x, y, x + boxWidth, y);
        gradient.addColorStop(0, 'rgba(153, 50, 204, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 140, 0, 0.8)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, boxWidth, boxHeight);
        
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, boxWidth, boxHeight);

        // Draw message text
        this.ctx.font = '500 14px "Montserrat"';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(message.text, this.canvas.width / 2, y + boxHeight/2 + 8);
    }

    drawPlayer(player, turboFocusActive, flashDodgeAvailable) {
        // Check if player should be drawn (for invincibility flashing)
        if (this.playerInvincible && Math.floor(this.invincibilityTimer / this.invincibilityFlashRate) % 2 === 0) {
            // Skip drawing player during flash
            this.invincibilityTimer--;
            if (this.invincibilityTimer <= 0) {
                this.playerInvincible = false;
            }
            return;
        } else if (this.playerInvincible) {
            this.invincibilityTimer--;
            if (this.invincibilityTimer <= 0) {
                this.playerInvincible = false;
            }
        }
        
        // Draw player
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(player.x + player.width/2, player.y + player.height/2, player.width/2, 0, Math.PI * 2);
        this.ctx.clip();
        
        if (player.imageLoaded) {
            this.ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
        } else {
            // Fallback if image isn't loaded
            this.ctx.fillStyle = player.color;
            this.ctx.fillRect(player.x, player.y, player.width, player.height);
        }
        
        this.ctx.restore();
    
        if (turboFocusActive) {
            this.drawTurboFocusEffect(player);
        }
        if (flashDodgeAvailable) {
            this.drawFlashDodgeIndicator(player);
        }
    }
    
    // Set player invincibility state
    setPlayerInvincible(duration) {
        this.playerInvincible = true;
        this.invincibilityTimer = duration;
    }
    
    drawDM(dm) {
        this.ctx.save();
        
        const oscillation = Math.sin(Date.now() / 500 + dm.oscillateOffset) * 2;
        
        this.ctx.translate(dm.x + dm.width/2, dm.y + dm.height/2);
        this.ctx.rotate(dm.rotation);
        
        // Draw emoji
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(dm.emoji, 0, oscillation);
        
        // Add glow effect
        this.ctx.shadowColor = "#ff4444";
        this.ctx.shadowBlur = 15;
        
        this.ctx.restore();
    }
    
    
    drawPowerUp(powerUp) {
        this.ctx.save();
        
        const centerX = powerUp.x + powerUp.width / 2;
        const centerY = powerUp.y + powerUp.height / 2;
        
        // Add pulsing effect
        const pulseSize = 1 + Math.sin(Date.now() / 200) * 0.1;
        
        // Add stronger green glow
        this.ctx.shadowColor = "#00ff00";
        this.ctx.shadowBlur = 25;
        
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(pulseSize, pulseSize);
        
        // Draw emoji
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(powerUp.emoji, 0, 0);
        
        this.ctx.restore();
    }

    

    drawFocusPoint(point) {
        const centerX = point.x + point.width/2;
        const centerY = point.y + point.height/2;
        
        // Sparkle effect
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        
        // Inner glow
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, point.width/2);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, point.color);
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, point.width/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Sparkle lines
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        const sparkleSize = point.width * 0.8;
        const sparkleRotation = Date.now() / 1000;
        
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI / 2) + sparkleRotation;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(Math.cos(angle) * sparkleSize, Math.sin(angle) * sparkleSize);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
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
        
        if (damian.imageLoaded) {
            this.ctx.drawImage(damian.image, damian.x, damian.y, damian.width, damian.height);
        } else {
            // Fallback if image isn't loaded
            this.ctx.fillStyle = "#ff0000";
            this.ctx.fillRect(damian.x, damian.y, damian.width, damian.height);
            this.ctx.fillStyle = "#ffffff";
            this.ctx.font = "16px 'Montserrat'";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Damian", damian.x + damian.width/2, damian.y + damian.height/2);
        }
        
        // Add glow effect around Damian
        this.ctx.shadowColor = "#ff0000";
        this.ctx.shadowBlur = 20;
        this.ctx.strokeStyle = "#ff0000";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(damian.x, damian.y, damian.width, damian.height);
        
        // Draw HP bar above Damian
        const maxHealth = this.gameState.powerUpManager.maxDamianHits;
        const currentHealth = maxHealth - this.gameState.powerUpManager.damianHitCount;
        const barWidth = damian.width;
        const barHeight = 10;
        const barX = damian.x;
        const barY = damian.y - barHeight - 5;
        
        // Draw background of health bar
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Draw health portion
        const healthWidth = (currentHealth / maxHealth) * barWidth;
        this.ctx.fillStyle = "#ff0000";
        this.ctx.fillRect(barX, barY, healthWidth, barHeight);
        
        // Draw border around health bar
        this.ctx.strokeStyle = "#ffffff";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Draw health text
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "10px 'Montserrat'";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`${currentHealth}/${maxHealth}`, barX + barWidth/2, barY + barHeight - 2);
        
        this.ctx.restore();
    
        // Draw sad face emoji if a DM was missed
        if (damian.showSadFace) {
            this.ctx.font = "24px 'Montserrat'";
            this.ctx.fillText("😢", damian.x + damian.width + 5, damian.y + 30);
        }
    }
    
    
drawDM(dm) {
        this.ctx.save();

        const oscillation = Math.sin(Date.now() / 500 + dm.oscillateOffset) * 2;

        this.ctx.translate(dm.x + dm.width/2, dm.y + dm.height/2);
        this.ctx.rotate(dm.rotation);

        // Draw emoji
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(dm.emoji, 0, oscillation);

        // Add glow effect
        this.ctx.shadowColor = "#ff4444";
        this.ctx.shadowBlur = 15;

        this.ctx.restore();
    }
    
    drawGameObjects(dms, powerUps, focusPoints, obstacles) {
        // Draw obstacles
        if (obstacles) {
            obstacles.forEach(obstacle => {
                this.ctx.fillStyle = obstacle.color;
                this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                
                // Dodaj efekt neonowego obramowania
                this.ctx.strokeStyle = '#ff00ff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            });
        }
        
        // Draw DMs as message bubbles
        dms.forEach(dm => this.drawDM(dm));
        
        // Draw power-ups and focus points
        powerUps.forEach(powerUp => this.drawPowerUp(powerUp));
        focusPoints.forEach(point => this.drawFocusPoint(point));
    }
    
}
