/**
 * Data Analyst Adventure - A retro mini-game for Shubham Rao's portfolio
 * A simple game where you collect data points and avoid bugs
 */

class DataGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gameActive = false;
        this.score = 0;
        this.highScore = localStorage.getItem('dataGameHighScore') || 0;
        this.gameSpeed = 2;
        this.dataPoints = [];
        this.bugs = [];
        this.player = {
            x: 50,
            y: 100,
            width: 16,
            height: 16,
            color: '#00ff00',
            speed: 4
        };
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };
        this.gameOverMessage = "";
        this.gameOverTimeout = null;
        this.difficultyTimer = 0;
        
        // Set up the canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Event listeners for keyboard controls
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Touch controls for mobile
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        
        // Game loop
        this.lastTime = 0;
        this.animate = this.animate.bind(this);
    }
    
    resizeCanvas() {
        // Make the canvas responsive
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Set canvas dimensions (maintain 16:9 aspect ratio)
        this.canvas.width = containerWidth;
        this.canvas.height = Math.min(containerHeight, containerWidth * 0.6);
        
        // Initial draw if game is not active
        if (!this.gameActive) {
            this.drawStartScreen();
        }
    }
    
    handleKeyDown(e) {
        if (e.key in this.keys) {
            this.keys[e.key] = true;
            e.preventDefault();
        }
        
        // Start game on Enter key press instead of space
        if (!this.gameActive && e.key === 'Enter') {
            this.startGame();
        }
    }
    
    handleKeyUp(e) {
        if (e.key in this.keys) {
            this.keys[e.key] = false;
            e.preventDefault();
        }
    }
    
    handleTouchStart(e) {
        if (!this.gameActive) {
            this.startGame();
            return;
        }
        
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        e.preventDefault();
    }
    
    handleTouchMove(e) {
        if (!this.gameActive) return;
        
        const touch = e.touches[0];
        const diffX = touch.clientX - this.touchStartX;
        const diffY = touch.clientY - this.touchStartY;
        
        // Update player position based on touch movement
        this.player.x += diffX * 0.2;
        this.player.y += diffY * 0.2;
        
        // Keep player within bounds
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
        
        // Update touch reference
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        
        e.preventDefault();
    }
    
    startGame() {
        this.gameActive = true;
        this.score = 0;
        this.gameSpeed = 0.5;
        this.difficultyTimer = 0;
        
        // Reset player position
        this.player.x = 50;
        this.player.y = this.canvas.height / 2 - this.player.height / 2;
        
        // Clear arrays
        this.dataPoints = [];
        this.bugs = [];
        
        // Start animation loop
        requestAnimationFrame(this.animate);
    }
    
    generateDataPoint() {
        if (Math.random() < 0.005) {
            const types = [
                { color: '#00aaff', value: 1, name: 'Data' },
                { color: '#ffff00', value: 3, name: 'Energy' },
                { color: '#ff00ff', value: 5, name: 'Report' }
            ];
            const type = types[Math.floor(Math.random() * types.length)];
            
            this.dataPoints.push({
                x: this.canvas.width,
                y: Math.random() * (this.canvas.height - 20),
                width: 12,
                height: 12,
                color: type.color,
                value: type.value,
                name: type.name
            });
        }
    }
    
    generateBug() {
        if (Math.random() < 0.000005 + (this.difficultyTimer / 500000)) {
            this.bugs.push({
                x: this.canvas.width,
                y: Math.random() * (this.canvas.height - 20),
                width: 14,
                height: 14,
                color: '#ff0000',
                speedX: Math.random() * 1.5 + this.gameSpeed,
                speedY: Math.random() * 3 - 1.5
            });
        }
    }
    
    movePlayer() {
        if (this.keys.ArrowUp) {
            this.player.y -= this.player.speed;
        }
        if (this.keys.ArrowDown) {
            this.player.y += this.player.speed;
        }
        if (this.keys.ArrowLeft) {
            this.player.x -= this.player.speed;
        }
        if (this.keys.ArrowRight) {
            this.player.x += this.player.speed;
        }
        
        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
    }
    
    updateDataPoints() {
        for (let i = this.dataPoints.length - 1; i >= 0; i--) {
            const point = this.dataPoints[i];
            point.x -= this.gameSpeed;
            
            // Check collision with player
            if (this.checkCollision(this.player, point)) {
                this.score += point.value;
                this.dataPoints.splice(i, 1);
                continue;
            }
            
            // Remove if off screen
            if (point.x + point.width < 0) {
                this.dataPoints.splice(i, 1);
            }
        }
    }
    
    updateBugs() {
        for (let i = this.bugs.length - 1; i >= 0; i--) {
            const bug = this.bugs[i];
            bug.x -= bug.speedX;
            bug.y += bug.speedY;
            
            // Bounce off top and bottom
            if (bug.y <= 0 || bug.y + bug.height >= this.canvas.height) {
                bug.speedY *= -1;
            }
            
            // Check collision with player
            if (this.checkCollision(this.player, bug)) {
                // Game over
                this.gameOver();
                return;
            }
            
            // Remove if off screen
            if (bug.x + bug.width < 0) {
                this.bugs.splice(i, 1);
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        return (
            obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y
        );
    }
    
    gameOver() {
        this.gameActive = false;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('dataGameHighScore', this.highScore);
        }
        
        this.gameOverMessage = "GAME OVER!";
        
        // Display game over for a short time, then show start screen
        this.gameOverTimeout = setTimeout(() => {
            this.gameOverMessage = "";
            this.drawStartScreen();
        }, 2000);
    }
    
    drawPixelArt(x, y, color, type) {
        const ctx = this.ctx;
        
        ctx.fillStyle = color;
        
        if (type === 'player') {
            // Draw analyst character (simple pixel face)
            ctx.fillRect(x, y, this.player.width, this.player.height);
            
            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 3, y + 4, 2, 2);
            ctx.fillRect(x + 11, y + 4, 2, 2);
            
            // Smile
            ctx.fillRect(x + 5, y + 10, 6, 2);
            ctx.fillRect(x + 4, y + 9, 1, 1);
            ctx.fillRect(x + 11, y + 9, 1, 1);
            
            // Glasses
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 2, y + 3, 4, 4);
            ctx.fillRect(x + 10, y + 3, 4, 4);
            
        } else if (type === 'data') {
            // Draw data point (document icon)
            ctx.fillRect(x, y, 12, 12);
            
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 2, y + 2, 8, 2);
            ctx.fillRect(x + 2, y + 5, 8, 1);
            ctx.fillRect(x + 2, y + 7, 8, 1);
            ctx.fillRect(x + 2, y + 9, 5, 1);
            
        } else if (type === 'bug') {
            // Draw bug (enemy)
            ctx.fillRect(x, y, 14, 14);
            
            // Bug details
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 2, y + 2, 2, 2);
            ctx.fillRect(x + 10, y + 2, 2, 2);
            ctx.fillRect(x + 4, y + 8, 6, 2);
            
            // Legs
            ctx.fillRect(x, y + 4, 2, 6);
            ctx.fillRect(x + 12, y + 4, 2, 6);
        }
    }
    
    drawUI() {
        const ctx = this.ctx;
        
        // Set retro text style
        ctx.font = "12px 'Press Start 2P', monospace";
        ctx.fillStyle = '#00ff00';
        ctx.textAlign = 'left';
        
        // Draw score
        ctx.fillText(`SCORE: ${this.score}`, 10, 20);
        
        // Draw high score
        ctx.textAlign = 'right';
        ctx.fillText(`HI-SCORE: ${this.highScore}`, this.canvas.width - 10, 20);
    }
    
    drawStartScreen() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background grid
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        // Game title
        ctx.font = "16px 'Press Start 2P', monospace";
        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'center';
        ctx.fillText("DATA ANALYST ADVENTURE", this.canvas.width / 2, this.canvas.height / 3);
        
        // Instructions
        ctx.font = "10px 'Press Start 2P', monospace";
        ctx.fillStyle = '#00aaff';
        ctx.fillText("COLLECT DATA, AVOID BUGS", this.canvas.width / 2, this.canvas.height / 2);
        
        // Controls
        ctx.font = "8px 'Press Start 2P', monospace";
        ctx.fillStyle = '#00ff00';
        ctx.fillText("ARROW KEYS TO MOVE - ENTER TO START", this.canvas.width / 2, this.canvas.height / 2 + 30);
        
        // High score
        ctx.font = "10px 'Press Start 2P', monospace";
        ctx.fillStyle = '#ff00ff';
        ctx.fillText(`HIGH SCORE: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
        
        // Draw example items
        this.drawPixelArt(this.canvas.width / 2 - 80, this.canvas.height / 2 + 80, '#00ff00', 'player');
        this.drawPixelArt(this.canvas.width / 2 - 20, this.canvas.height / 2 + 80, '#00aaff', 'data');
        this.drawPixelArt(this.canvas.width / 2 + 40, this.canvas.height / 2 + 80, '#ff0000', 'bug');
    }
    
    animate(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - (this.lastTime || timestamp);
        this.lastTime = timestamp;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.gameActive) {
            // If game over message is active, display it
            if (this.gameOverMessage) {
                // Draw background
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Draw game over message
                this.ctx.font = "24px 'Press Start 2P', monospace";
                this.ctx.fillStyle = '#ff0000';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(this.gameOverMessage, this.canvas.width / 2, this.canvas.height / 2);
                
                // Draw score
                this.ctx.font = "16px 'Press Start 2P', monospace";
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fillText(`SCORE: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
                
                requestAnimationFrame(this.animate);
            }
            return;
        }
        
        // Increase difficulty over time
        this.difficultyTimer += deltaTime;
        if (this.difficultyTimer > 8000) {
            this.gameSpeed = Math.min(6, this.gameSpeed + 0.05);
            this.difficultyTimer = 0;
        }
        
        // Update game elements
        this.movePlayer();
        this.generateDataPoint();
        this.generateBug();
        this.updateDataPoints();
        this.updateBugs();
        
        // Draw background grid
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw data points
        this.dataPoints.forEach(point => {
            this.drawPixelArt(point.x, point.y, point.color, 'data');
        });
        
        // Draw bugs
        this.bugs.forEach(bug => {
            this.drawPixelArt(bug.x, bug.y, bug.color, 'bug');
        });
        
        // Draw player
        this.drawPixelArt(this.player.x, this.player.y, this.player.color, 'player');
        
        // Draw UI
        this.drawUI();
        
        // Continue animation loop
        requestAnimationFrame(this.animate);
    }
}

// Initialize the game when script is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only create the game if the canvas exists
    if (document.getElementById('game-canvas')) {
        window.dataGame = new DataGame('game-canvas');
    }
}); 