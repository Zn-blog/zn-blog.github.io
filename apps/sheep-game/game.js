/* ========================================
   羊了个羊游戏逻辑
   ======================================== */

class SheepGame {
    constructor() {
        // 游戏配置
        this.emojis = ['🐑', '🐮', '🐷', '🐔', '🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐯'];
        this.level = 1;
        this.score = 0;
        this.cards = [];
        this.slots = [];
        this.maxSlots = 7;
        this.shuffleCount = 3;
        this.undoCount = 3;
        this.history = [];
        
        // 音乐相关
        this.bgMusic = window.bgMusicPlayer;
        this.musicControl = document.getElementById('musicControl');
        this.isMusicPlaying = false;
        
        // DOM元素
        this.gameBoard = document.getElementById('gameBoard');
        this.slotContainer = document.getElementById('slotContainer');
        this.levelDisplay = document.getElementById('level');
        this.remainingDisplay = document.getElementById('remaining');
        this.scoreDisplay = document.getElementById('score');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.undoBtn = document.getElementById('undoBtn');
        
        this.init();
    }

    init() {
        this.updateDisplay();
        this.generateCards();
        this.renderCards();
        this.updateButtons();
    }

    // 生成卡片
    generateCards() {
        this.cards = [];
        // 每关卡片数量翻倍：30, 60, 120...
        const baseCount = 30;
        const cardCount = baseCount * Math.pow(2, this.level - 1);
        const actualCount = Math.min(cardCount, 240); // 最多240张
        
        const emojiTypes = Math.min(6 + Math.floor(this.level / 2), this.emojis.length);
        
        // 确保每种卡片至少有3张（可以消除）
        const cardsPerType = Math.ceil(actualCount / emojiTypes / 3) * 3;
        
        for (let i = 0; i < emojiTypes; i++) {
            for (let j = 0; j < cardsPerType; j++) {
                if (this.cards.length < actualCount) {
                    this.cards.push({
                        id: this.cards.length,
                        emoji: this.emojis[i],
                        layer: Math.floor(Math.random() * 4), // 0-3层，增加层数
                        x: 0,
                        y: 0
                    });
                }
            }
        }

        // 打乱卡片顺序
        this.shuffleArray(this.cards);
    }

    // 渲染卡片
    renderCards() {
        this.gameBoard.innerHTML = '';
        const boardWidth = this.gameBoard.offsetWidth;
        const boardHeight = this.gameBoard.offsetHeight;
        const cardSize = 120; // 更新为新的卡片大小
        const padding = 10;
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.textContent = card.emoji;
            cardElement.dataset.id = card.id;
            cardElement.dataset.layer = card.layer;
            cardElement.dataset.emoji = card.emoji; // 添加emoji属性用于CSS边框颜色
            
            // 随机位置，但避免超出边界
            const maxX = boardWidth - cardSize - padding;
            const maxY = boardHeight - cardSize - padding;
            const x = Math.random() * maxX;
            const y = Math.random() * maxY;
            
            // 保存位置信息
            card.x = x;
            card.y = y;
            
            cardElement.style.left = x + 'px';
            cardElement.style.top = y + 'px';
            cardElement.style.zIndex = card.layer * 1000 + index;
            
            cardElement.addEventListener('click', () => this.selectCard(card, cardElement));
            
            this.gameBoard.appendChild(cardElement);
        });
        
        this.updateBlockedCards();
        this.updateDisplay();
    }

    // 选择卡片
    selectCard(card, element) {
        // 检查卡片是否被遮挡
        if (this.isCardBlocked(card)) {
            this.shakeCard(element);
            return;
        }

        // 保存历史记录
        this.saveHistory();

        // 添加到槽位
        if (this.slots.length >= this.maxSlots) {
            this.checkPropAvailable();
            return;
        }

        // 动画效果
        element.style.transition = 'all 0.5s ease';
        element.style.opacity = '0';
        element.style.transform = 'scale(0.5)';

        setTimeout(() => {
            // 从游戏板移除
            this.cards = this.cards.filter(c => c.id !== card.id);
            element.remove();

            // 添加到槽位
            this.slots.push(card);
            this.renderSlots();
            this.checkMatch();
            this.updateDisplay();
            this.updateBlockedCards();

            // 检查胜利
            if (this.cards.length === 0) {
                setTimeout(() => this.showWinModal(), 500);
            }
        }, 500);
    }

    // 检查卡片是否被遮挡（改进版）
    isCardBlocked(card) {
        const cardSize = 120; // 更新为新的卡片大小
        const overlapThreshold = 40; // 重叠阈值
        
        // 检查是否有更高层的卡片遮挡
        for (const otherCard of this.cards) {
            if (otherCard.id === card.id) continue;
            
            // 只检查更高层的卡片
            if (otherCard.layer <= card.layer) continue;
            
            // 检查是否有重叠
            const xOverlap = Math.abs(card.x - otherCard.x) < cardSize - overlapThreshold;
            const yOverlap = Math.abs(card.y - otherCard.y) < cardSize - overlapThreshold;
            
            if (xOverlap && yOverlap) {
                return true; // 被遮挡
            }
        }
        
        return false; // 未被遮挡
    }
    
    // 更新所有卡片的遮挡状态
    updateBlockedCards() {
        const cardElements = this.gameBoard.querySelectorAll('.card');
        
        cardElements.forEach(element => {
            const cardId = parseInt(element.dataset.id);
            const card = this.cards.find(c => c.id === cardId);
            
            if (card && this.isCardBlocked(card)) {
                element.classList.add('blocked');
            } else {
                element.classList.remove('blocked');
            }
        });
    }

    // 卡片抖动效果
    shakeCard(element) {
        element.style.animation = 'shake 0.5s';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
        
        // 添加抖动动画
        if (!document.getElementById('shakeAnimation')) {
            const style = document.createElement('style');
            style.id = 'shakeAnimation';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 渲染槽位
    renderSlots() {
        const slotElements = this.slotContainer.querySelectorAll('.slot');
        
        slotElements.forEach((slot, index) => {
            if (index < this.slots.length) {
                slot.textContent = this.slots[index].emoji;
                slot.classList.add('filled');
            } else {
                slot.textContent = '';
                slot.classList.remove('filled');
            }
        });
    }

    // 检查匹配
    checkMatch() {
        const emojiCount = {};
        
        // 统计每种emoji的数量
        this.slots.forEach(card => {
            emojiCount[card.emoji] = (emojiCount[card.emoji] || 0) + 1;
        });

        // 检查是否有3个相同的
        for (const emoji in emojiCount) {
            if (emojiCount[emoji] >= 3) {
                this.removeMatched(emoji);
                return;
            }
        }
    }

    // 移除匹配的卡片
    removeMatched(emoji) {
        const slotElements = this.slotContainer.querySelectorAll('.slot');
        let removed = 0;
        
        // 添加匹配动画
        slotElements.forEach((slot, index) => {
            if (removed < 3 && this.slots[index] && this.slots[index].emoji === emoji) {
                slot.classList.add('matched');
                removed++;
            }
        });

        // 延迟移除
        setTimeout(() => {
            this.slots = this.slots.filter(card => {
                if (removed > 0 && card.emoji === emoji) {
                    removed--;
                    return false;
                }
                return true;
            });

            this.score += 30;
            this.renderSlots();
            this.updateDisplay();
        }, 500);
    }

    // 洗牌功能
    shuffle() {
        if (this.shuffleCount <= 0) return;
        
        this.saveHistory();
        this.shuffleCount--;
        
        // 重新随机位置
        const cardElements = this.gameBoard.querySelectorAll('.card');
        const boardWidth = this.gameBoard.offsetWidth;
        const boardHeight = this.gameBoard.offsetHeight;
        const cardSize = 120; // 更新为新的卡片大小
        const padding = 10;
        
        cardElements.forEach(element => {
            const cardId = parseInt(element.dataset.id);
            const card = this.cards.find(c => c.id === cardId);
            
            if (card) {
                const maxX = boardWidth - cardSize - padding;
                const maxY = boardHeight - cardSize - padding;
                const x = Math.random() * maxX;
                const y = Math.random() * maxY;
                
                // 更新卡片位置
                card.x = x;
                card.y = y;
                
                element.style.transition = 'all 0.5s ease';
                element.style.left = x + 'px';
                element.style.top = y + 'px';
            }
        });
        
        // 延迟更新遮挡状态，等待动画完成
        setTimeout(() => {
            this.updateBlockedCards();
        }, 500);
        
        this.updateButtons();
    }

    // 撤销功能
    undo() {
        if (this.undoCount <= 0 || this.history.length === 0) return;
        
        this.undoCount--;
        const lastState = this.history.pop();
        
        this.cards = JSON.parse(JSON.stringify(lastState.cards));
        this.slots = JSON.parse(JSON.stringify(lastState.slots));
        this.score = lastState.score;
        
        this.renderCards();
        this.renderSlots();
        this.updateDisplay();
        this.updateButtons();
    }

    // 保存历史记录
    saveHistory() {
        this.history.push({
            cards: JSON.parse(JSON.stringify(this.cards)),
            slots: JSON.parse(JSON.stringify(this.slots)),
            score: this.score
        });
        
        // 只保留最近10步
        if (this.history.length > 10) {
            this.history.shift();
        }
    }

    // 更新显示
    updateDisplay() {
        this.levelDisplay.textContent = this.level;
        this.remainingDisplay.textContent = this.cards.length;
        this.scoreDisplay.textContent = this.score;
    }

    // 更新按钮状态
    updateButtons() {
        this.shuffleBtn.textContent = `🔀 洗牌 (${this.shuffleCount}次)`;
        this.shuffleBtn.disabled = this.shuffleCount <= 0;
        
        this.undoBtn.textContent = `↩️ 撤销 (${this.undoCount}次)`;
        this.undoBtn.disabled = this.undoCount <= 0 || this.history.length === 0;
    }

    // 检查是否有道具可用
    checkPropAvailable() {
        if (this.shuffleCount > 0 || this.undoCount > 0) {
            // 有道具可用，显示道具提示
            this.showPropModal();
        } else {
            // 没有道具，直接失败
            this.showLoseModal();
        }
    }

    // 显示道具提示模态框
    showPropModal() {
        const modal = document.getElementById('propModal');
        const shuffleBtn = document.getElementById('propShuffleBtn');
        const undoBtn = document.getElementById('propUndoBtn');
        
        // 更新按钮状态
        if (this.shuffleCount > 0) {
            shuffleBtn.disabled = false;
            shuffleBtn.textContent = `🔀 洗牌 (${this.shuffleCount}次)`;
        } else {
            shuffleBtn.disabled = true;
            shuffleBtn.textContent = '🔀 洗牌 (已用完)';
        }
        
        if (this.undoCount > 0) {
            undoBtn.disabled = false;
            undoBtn.textContent = `↩️ 撤销 (${this.undoCount}次)`;
        } else {
            undoBtn.disabled = true;
            undoBtn.textContent = '↩️ 撤销 (已用完)';
        }
        
        modal.classList.add('show');
    }

    // 隐藏道具提示模态框
    hidePropModal() {
        document.getElementById('propModal').classList.remove('show');
    }

    // 使用洗牌（从道具提示）
    useShuffle() {
        if (this.shuffleCount > 0) {
            this.hidePropModal();
            this.shuffle();
        }
    }

    // 使用撤销（从道具提示）
    useUndo() {
        if (this.undoCount > 0) {
            this.hidePropModal();
            this.undo();
        }
    }

    // 放弃游戏
    giveUp() {
        this.hidePropModal();
        this.showLoseModal();
    }

    // 显示胜利模态框
    showWinModal() {
        document.getElementById('winLevel').textContent = this.level;
        document.getElementById('winModal').classList.add('show');
        // 清空卡槽
        this.clearSlots();
    }

    // 显示失败模态框
    showLoseModal() {
        document.getElementById('loseModal').classList.add('show');
        // 清空卡槽
        this.clearSlots();
    }
    
    // 清空卡槽
    clearSlots() {
        this.slots = [];
        this.renderSlots();
    }

    // 下一关
    nextLevel() {
        document.getElementById('winModal').classList.remove('show');
        this.level++;
        this.score += 100; // 过关奖励
        this.slots = [];
        this.shuffleCount = 3;
        this.undoCount = 3;
        this.history = [];
        this.init();
    }

    // 重新开始
    restart() {
        document.getElementById('winModal').classList.remove('show');
        document.getElementById('loseModal').classList.remove('show');
        this.level = 1;
        this.score = 0;
        this.slots = [];
        this.shuffleCount = 3;
        this.undoCount = 3;
        this.history = [];
        this.init();
    }

    // 打乱数组
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // 切换音乐
    toggleMusic() {
        if (!this.bgMusic) {
            console.error('音乐播放器未初始化');
            return;
        }
        
        if (this.isMusicPlaying) {
            this.bgMusic.pause();
            this.musicControl.textContent = '🔇';
            this.musicControl.classList.remove('playing');
            this.isMusicPlaying = false;
            console.log('🔇 音乐已关闭');
        } else {
            this.bgMusic.play();
            this.musicControl.textContent = '🔊';
            this.musicControl.classList.add('playing');
            this.isMusicPlaying = true;
            console.log('🔊 音乐已开启');
        }
    }
    
    // 播放音乐
    playMusic() {
        if (!this.bgMusic || this.isMusicPlaying) return;
        
        try {
            this.bgMusic.play();
            this.musicControl.textContent = '🔊';
            this.musicControl.classList.add('playing');
            this.isMusicPlaying = true;
            console.log('🎵 音乐自动播放成功');
        } catch (err) {
            console.log('音乐自动播放失败，需要用户点击:', err);
        }
    }
}

// 初始化游戏
const game = new SheepGame();

// 用户首次点击时尝试播放音乐
let firstClick = true;
document.addEventListener('click', function() {
    if (firstClick && game && game.bgMusic) {
        firstClick = false;
        setTimeout(() => {
            game.playMusic();
        }, 100);
    }
});
