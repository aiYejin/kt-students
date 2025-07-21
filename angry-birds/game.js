class AngryBirdsGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.stage1Score = 0;
        this.stage2Score = 0;
        this.stage = 1;
        this.birdsLeft = 3;
        this.gameState = 'ready';
        
        // 물리 상수
        this.gravity = 0.5;
        this.friction = 0.98;
        
        // 새 객체
        this.bird = {
            x: 150,
            y: 420,
            radius: 20,
            vx: 0,
            vy: 0,
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0
        };
        
        // 구조물들
        this.structures = [];
        this.debris = [];
        
        this.setupStage(this.stage);
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupStage(stage) {
        this.structures = [];
        
        if (stage === 1) {
            this.structures = [
                { x: 600, y: 400, width: 40, height: 100, type: 'wood', color: '#8B4513' },
                { x: 640, y: 400, width: 40, height: 100, type: 'wood', color: '#A0522D' },
                { x: 680, y: 400, width: 40, height: 100, type: 'wood', color: '#8B4513' },
                { x: 600, y: 300, width: 120, height: 40, type: 'wood', color: '#A0522D' },
                { x: 600, y: 200, width: 120, height: 40, type: 'wood', color: '#8B4513' },
                { x: 750, y: 400, width: 40, height: 100, type: 'wood', color: '#A0522D' },
                { x: 750, y: 300, width: 40, height: 100, type: 'wood', color: '#8B4513' },
                { x: 750, y: 200, width: 40, height: 100, type: 'wood', color: '#A0522D' },
                { x: 720, y: 400, width: 40, height: 100, type: 'wood', color: '#8B4513' },
                { x: 760, y: 400, width: 40, height: 100, type: 'wood', color: '#A0522D' },
                { x: 800, y: 400, width: 40, height: 100, type: 'wood', color: '#8B4513' },
                { x: 720, y: 300, width: 120, height: 40, type: 'wood', color: '#A0522D' }
            ];
        } else if (stage === 2) {
            this.structures = [
                { x: 600, y: 400, width: 40, height: 100, type: 'wood', color: '#8B4513' },
                { x: 640, y: 400, width: 40, height: 100, type: 'stone', color: '#696969' },
                { x: 680, y: 400, width: 40, height: 100, type: 'wood', color: '#8B4513' },
                { x: 600, y: 300, width: 120, height: 40, type: 'wood', color: '#A0522D' },
                { x: 600, y: 200, width: 120, height: 40, type: 'stone', color: '#696969' },
                { x: 750, y: 400, width: 40, height: 100, type: 'wood', color: '#A0522D' },
                { x: 750, y: 300, width: 40, height: 100, type: 'stone', color: '#808080' },
                { x: 750, y: 200, width: 40, height: 100, type: 'wood', color: '#8B4513' },
                { x: 720, y: 400, width: 40, height: 100, type: 'stone', color: '#696969' },
                { x: 760, y: 400, width: 40, height: 100, type: 'wood', color: '#A0522D' },
                { x: 800, y: 400, width: 40, height: 100, type: 'stone', color: '#808080' },
                { x: 720, y: 300, width: 120, height: 40, type: 'wood', color: '#8B4513' }
            ];
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    }
    
    onMouseDown(e) {
        if (this.birdsLeft <= 0) return; // 새가 없으면 드래그 불가
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const distance = Math.sqrt((x - this.bird.x) ** 2 + (y - this.bird.y) ** 2);
        
        if (distance < this.bird.radius && this.gameState === 'ready') {
            this.bird.isDragging = true;
            this.bird.dragStartX = x;
            this.bird.dragStartY = y;
            this.gameState = 'dragging';
        }
    }
    
    onMouseMove(e) {
        if (this.bird.isDragging) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 새를 마우스 위치로 이동
            this.bird.x = x;
            this.bird.y = y;
            
            this.bird.dragStartX = x;
            this.bird.dragStartY = y;
        }
    }
    
    onMouseUp(e) {
        if (this.bird.isDragging && this.birdsLeft > 0) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 원래 위치로 돌아가기
            this.bird.x = 150;
            this.bird.y = 420;
            
            // 발사 방향 계산 (원래 위치에서 마우스 위치로)
            const dx = 150 - x;
            const dy = 420 - y;
            
            // 발사 힘을 강화
            this.bird.vx = dx * 0.3;
            this.bird.vy = dy * 0.3;
            
            this.bird.isDragging = false;
            this.gameState = 'flying';
            // 새 개수는 새가 실제로 날아간 후에 줄임
        }
    }
    
    update() {
        if (this.gameState === 'flying') {
            this.bird.x += this.bird.vx;
            this.bird.y += this.bird.vy;
            this.bird.vy += this.gravity;
            this.bird.vx *= this.friction;
            this.bird.vy *= this.friction;
            
            this.checkCollisions();
            
            // 새의 속도 계산
            const speed = Math.sqrt(this.bird.vx * this.bird.vx + this.bird.vy * this.bird.vy);
            
            if (this.bird.y > this.canvas.height + 50 || speed < 0.3) {
                this.birdsLeft--; // 새가 화면 밖으로 나가거나 속도가 느려지면 새 개수 줄임
                this.resetBird();
            }
        }
        
        this.updateDebris();
        
        // 스테이지 1에서 50점 이상이고 새가 없으면 스테이지 2로
        if (this.stage === 1 && this.stage1Score >= 50 && this.birdsLeft <= 0) {
            this.stage = 2;
            this.birdsLeft = 3;
            this.setupStage(this.stage);
            this.resetBird();
            this.gameState = 'ready';
            this.showStageMessage();
        } else if (this.birdsLeft <= 0 && this.gameState !== 'gameOver') {
            // 스테이지 2이거나 50점 미만이면 게임 오버
            this.gameState = 'gameOver';
        }
        
        // 게임 오버 상태에서 점수 모달 표시
        if (this.birdsLeft <= 0 && this.gameState === 'gameOver') {
            this.showScoreModal();
        }
        
        // 모든 구조물이 사라졌을 때
        if (this.structures.length === 0 && this.gameState === 'flying') {
            if (this.stage === 1) {
                this.stage1Score = this.score;
                this.stage = 2;
                this.birdsLeft = 3;
                this.setupStage(this.stage);
                this.resetBird();
                this.gameState = 'ready';
            } else if (this.stage === 2) {
                this.stage2Score = this.score;
                this.gameState = 'win';
            }
        }
        
        this.updateUI();
    }
    
    checkCollisions() {
        for (let i = this.structures.length - 1; i >= 0; i--) {
            const structure = this.structures[i];
            
            const closestX = Math.max(structure.x, Math.min(this.bird.x, structure.x + structure.width));
            const closestY = Math.max(structure.y, Math.min(this.bird.y, structure.y + structure.height));
            
            const distance = Math.sqrt((this.bird.x - closestX) ** 2 + (this.bird.y - closestY) ** 2);
            
            if (distance < this.bird.radius) {
                if (structure.type === 'wood') {
                    // 나무는 점수 + 파괴 + 튕김
                    this.score += 10;
                    
                    // 스테이지별 점수 업데이트
                    if (this.stage === 1) {
                        this.stage1Score += 10;
                    } else if (this.stage === 2) {
                        this.stage2Score += 10;
                    }
                    
                    this.createDebris(structure.x, structure.y, structure.width, structure.height);
                    this.structures.splice(i, 1);
                    this.handleCollision(structure, closestX, closestY);
                } else if (structure.type === 'stone') {
                    // 돌은 점수 없이 그냥 튕김
                    this.handleCollision(structure, closestX, closestY);
                }
            }
        }
    }
    
    handleCollision(structure, closestX, closestY) {
        const dx = this.bird.x - closestX;
        const dy = this.bird.y - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const nx = dx / distance;
            const ny = dy / distance;
            const restitution = 0.6;
            const dotProduct = this.bird.vx * nx + this.bird.vy * ny;
            this.bird.vx = this.bird.vx - 2 * dotProduct * nx;
            this.bird.vy = this.bird.vy - 2 * dotProduct * ny;
            this.bird.vx *= restitution;
            this.bird.vy *= restitution;
            
            // 새를 구조물 밖으로 밀어냄
            this.bird.x = closestX + nx * (this.bird.radius + 2);
            this.bird.y = closestY + ny * (this.bird.radius + 2);
            
            // 속도가 너무 작으면 멈춤
            const speed = Math.sqrt(this.bird.vx * this.bird.vx + this.bird.vy * this.bird.vy);
            if (speed < 2) {
                this.bird.vx = 0;
                this.bird.vy = 0;
            }
        }
    }
    
    createDebris(x, y, width, height) {
        for (let i = 0; i < 5; i++) {
            this.debris.push({
                x: x + Math.random() * width,
                y: y + Math.random() * height,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 10 + 5,
                life: 100,
                color: '#8B4513'
            });
        }
    }
    
    updateDebris() {
        for (let i = this.debris.length - 1; i >= 0; i--) {
            const piece = this.debris[i];
            piece.x += piece.vx;
            piece.y += piece.vy;
            piece.vy += this.gravity;
            piece.life--;
            
            if (piece.life <= 0) {
                this.debris.splice(i, 1);
            }
        }
    }
    
    resetBird() {
        this.bird.x = 150;
        this.bird.y = 420;
        this.bird.vx = 0;
        this.bird.vy = 0;
        this.bird.isDragging = false;
        this.gameState = 'ready';
    }
    
    draw() {
        // 배경 그리기
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 하늘 그라데이션
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height * 0.7);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(0.5, '#98FB98');
        skyGradient.addColorStop(1, '#90EE90');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.7);
        
        // 구름 그리기
        this.drawClouds();
        
        // 땅 그리기
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.canvas.height * 0.7, this.canvas.width, this.canvas.height * 0.3);
        
        // 풀 그리기
        this.drawGrass();
        
        // 새 그리기
        this.drawBird();
        
        // 구조물 그리기
        this.structures.forEach(structure => {
            this.ctx.fillStyle = structure.color;
            this.ctx.fillRect(structure.x, structure.y, structure.width, structure.height);
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(structure.x, structure.y, structure.width, structure.height);
            
            this.drawStructureTexture(structure);
        });
        
        // 파편 그리기
        this.debris.forEach(piece => {
            this.ctx.fillStyle = piece.color || '#8B4513';
            this.ctx.beginPath();
            this.ctx.arc(piece.x, piece.y, piece.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // 게임 상태 메시지
        if (this.gameState === 'gameOver') {
            this.drawMessage('게임 오버!', '#FF0000');
        } else if (this.gameState === 'win') {
            this.drawMessage('승리!', '#00FF00');
        }
        
        // 스테이지 전환 메시지
        if (this.stageMessage && this.stageMessage.timer > 0) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.stageMessage.text, this.canvas.width / 2, this.canvas.height / 2);
            
            this.stageMessage.timer--;
            if (this.stageMessage.timer <= 0) {
                this.stageMessage = null;
            }
        }
        
        // 드래그 라인 그리기
        if (this.bird.isDragging) {
            this.ctx.strokeStyle = '#FF0000';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(150, 420); // 원래 위치에서 시작
            this.ctx.lineTo(this.bird.x, this.bird.y); // 현재 새 위치로
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }
    
    drawMessage(text, color) {
        this.ctx.fillStyle = color;
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('다시 시작 버튼을 클릭하세요', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.drawCloud(100, 80, 60);
        this.drawCloud(300, 120, 80);
        this.drawCloud(600, 60, 70);
        this.drawCloud(700, 150, 50);
    }
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.3, y, size * 0.4, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.6, y, size * 0.3, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawGrass() {
        this.ctx.fillStyle = '#228B22';
        const groundY = this.canvas.height * 0.7;
        
        for (let x = 0; x < this.canvas.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, groundY);
            this.ctx.lineTo(x + 10, groundY - 15);
            this.ctx.lineTo(x + 20, groundY);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        this.drawFlowers();
    }
    
    drawFlowers() {
        const groundY = this.canvas.height * 0.7;
        const flowerPositions = [
            {x: 200, y: groundY - 10},
            {x: 400, y: groundY - 15},
            {x: 600, y: groundY - 12},
            {x: 750, y: groundY - 8}
        ];
        
        flowerPositions.forEach(pos => {
            this.ctx.fillStyle = '#FF69B4';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawBird() {
        // 새 몸체
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 새 날개 (왼쪽만, 더 날개처럼)
        this.ctx.fillStyle = '#FF4500';
        this.ctx.beginPath();
        this.ctx.ellipse(this.bird.x - 12, this.bird.y - 3, 12, 6, Math.PI / 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 날개 테두리
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.ellipse(this.bird.x - 12, this.bird.y - 3, 12, 6, Math.PI / 6, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 새 부리 (크기 줄이고 몸에 가깝게)
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.x + this.bird.radius + 2, this.bird.y);
        this.ctx.lineTo(this.bird.x + this.bird.radius + 8, this.bird.y - 3);
        this.ctx.lineTo(this.bird.x + this.bird.radius + 8, this.bird.y + 3);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 새 눈 (더 자연스럽게)
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x + 8, this.bird.y - 5, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x + 8, this.bird.y - 5, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 새 꼬리 (몸에 가깝게)
        this.ctx.fillStyle = '#FF4500';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.x - this.bird.radius - 2, this.bird.y);
        this.ctx.lineTo(this.bird.x - this.bird.radius - 8, this.bird.y - 6);
        this.ctx.lineTo(this.bird.x - this.bird.radius - 8, this.bird.y + 6);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 새 눈썹 (화난 표정)
        this.ctx.strokeStyle = '#FF4500';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.x + 5, this.bird.y - 8);
        this.ctx.lineTo(this.bird.x + 12, this.bird.y - 8);
        this.ctx.stroke();
    }
    
    drawStructureTexture(structure) {
        if (structure.type === 'wood') {
            this.ctx.strokeStyle = '#654321';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const y = structure.y + (i + 1) * (structure.height / 4);
                this.ctx.beginPath();
                this.ctx.moveTo(structure.x, y);
                this.ctx.lineTo(structure.x + structure.width, y);
                this.ctx.stroke();
            }
        } else if (structure.type === 'stone') {
            this.ctx.strokeStyle = '#555';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    const x = structure.x + (i + 1) * (structure.width / 3);
                    const y = structure.y + (j + 1) * (structure.height / 3);
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('birds-left').textContent = Math.max(0, this.birdsLeft); // 음수 방지
        document.getElementById('stage').textContent = this.stage;
        
        if (this.stage === 1) {
            document.getElementById('stage-score').textContent = this.stage1Score;
        } else if (this.stage === 2) {
            document.getElementById('stage-score').textContent = this.stage2Score;
        }
    }
    
    showStageMessage() {
        // 스테이지 전환 메시지를 잠시 표시
        this.stageMessage = {
            text: `스테이지 ${this.stage} 시작!`,
            timer: 120 // 2초간 표시 (60fps 기준)
        };
    }
    
    showScoreModal() {
        const finalScore = this.getFinalScore();
        document.getElementById('finalScore').textContent = finalScore;
        document.getElementById('scoreModal').style.display = 'flex';
    }
    
    getFinalScore() {
        return this.stage1Score + this.stage2Score;
    }
    
    saveScoreToLeaderboard(name, score) {
        const leaderboard = JSON.parse(localStorage.getItem('angryBirdsLeaderboard') || '[]');
        leaderboard.push({ name, score, date: new Date().toLocaleDateString() });
        leaderboard.sort((a, b) => b.score - a.score);
        const top10 = leaderboard.slice(0, 10);
        localStorage.setItem('angryBirdsLeaderboard', JSON.stringify(top10));
    }
    
    showLeaderboard() {
        const leaderboard = this.getLeaderboard();
        const leaderboardDiv = document.getElementById('leaderboard');
        leaderboardDiv.innerHTML = '';
        
        leaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="leaderboard-rank">${index + 1}위</span>
                <span>${entry.name}</span>
                <span>${entry.score}점</span>
            `;
            leaderboardDiv.appendChild(item);
        });
        
        document.getElementById('leaderboardModal').style.display = 'flex';
    }
    
    getLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem('angryBirdsLeaderboard') || '[]');
        return leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 게임 인스턴스
let game;

function initGame() {
    game = new AngryBirdsGame();
}

function restartGame() {
    if (game) {
        game = new AngryBirdsGame();
    }
}

function saveScore() {
    const playerName = document.getElementById('playerName').value.trim();
    if (playerName === '') {
        alert('이름을 입력해주세요!');
        return;
    }
    
    if (game) {
        const finalScore = game.getFinalScore();
        game.saveScoreToLeaderboard(playerName, finalScore);
        document.getElementById('scoreModal').style.display = 'none';
        game.showLeaderboard();
    }
}

function closeLeaderboard() {
    document.getElementById('leaderboardModal').style.display = 'none';
}

function showLeaderboard() {
    if (game) {
        game.showLeaderboard();
    }
}

// 페이지 로드 시 게임 시작
window.addEventListener('load', initGame); 