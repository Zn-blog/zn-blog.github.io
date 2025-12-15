/* ========================================
   樱花飘落特效 JavaScript
   ======================================== */

class SakuraEffect {
    constructor(options = {}) {
        // 配置选项
        this.config = {
            maxPetals: options.maxPetals || 30,        // 最大花瓣数量
            petalInterval: options.petalInterval || 300, // 生成间隔（毫秒）
            enabled: options.enabled !== false,         // 是否启用
            showCounter: options.showCounter || false,  // 是否显示计数器
            autoStart: options.autoStart !== false      // 是否自动开始
        };
        
        // 状态
        this.petals = [];
        this.container = null;
        this.intervalId = null;
        this.isRunning = false;
        
        // 初始化
        this.init();
    }
    
    // 初始化
    init() {
        // 创建容器
        this.createContainer();
        
        // 创建控制按钮
        this.createToggleButton();
        
        // 创建计数器
        if (this.config.showCounter) {
            this.createCounter();
        }
        
        // 自动开始
        if (this.config.autoStart && this.config.enabled) {
            this.start();
        }
        
        // 从本地存储恢复状态
        this.loadState();
    }
    
    // 创建容器
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'sakura-container';
        this.container.id = 'sakuraContainer';
        document.body.appendChild(this.container);
    }
    
    // 创建控制按钮
    createToggleButton() {
        const button = document.createElement('button');
        button.className = 'sakura-toggle';
        button.id = 'sakuraToggle';
        button.innerHTML = '🌸';
        button.title = '切换樱花特效';
        button.onclick = () => this.toggle();
        document.body.appendChild(button);
        
        this.toggleButton = button;
        this.updateButtonState();
    }
    
    // 创建计数器
    createCounter() {
        const counter = document.createElement('div');
        counter.className = 'sakura-counter';
        counter.id = 'sakuraCounter';
        counter.textContent = '🌸 0';
        document.body.appendChild(counter);
        
        this.counter = counter;
    }
    
    // 更新按钮状态
    updateButtonState() {
        if (this.toggleButton) {
            if (this.isRunning) {
                this.toggleButton.classList.remove('disabled');
                this.toggleButton.innerHTML = '🌸';
            } else {
                this.toggleButton.classList.add('disabled');
                this.toggleButton.innerHTML = '🌸';
            }
        }
    }
    
    // 更新计数器
    updateCounter() {
        if (this.counter) {
            this.counter.textContent = `🌸 ${this.petals.length}`;
            if (this.petals.length > 0) {
                this.counter.classList.add('show');
            } else {
                this.counter.classList.remove('show');
            }
        }
    }
    
    // 创建花瓣
    createPetal() {
        if (this.petals.length >= this.config.maxPetals) {
            return;
        }
        
        const petal = document.createElement('div');
        petal.className = 'sakura-petal';
        
        // 随机变体
        const variant = Math.floor(Math.random() * 4);
        if (variant > 0) {
            petal.classList.add(`variant-${variant}`);
        }
        
        // 随机大小
        const sizes = ['size-small', 'size-medium', 'size-large'];
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        petal.classList.add(size);
        
        // 随机动画
        const animations = ['', 'anim-left', 'anim-right', 'anim-spiral'];
        const anim = animations[Math.floor(Math.random() * animations.length)];
        if (anim) {
            petal.classList.add(anim);
        }
        
        // 随机位置
        const left = Math.random() * 100;
        petal.style.left = `${left}%`;
        
        // 随机动画时长 - 速度加倍
        const duration = 5 + Math.random() * 5; // 5-10秒（原来10-20秒）
        petal.style.animationDuration = `${duration}s`;
        
        // 随机延迟
        const delay = Math.random() * 2;
        petal.style.animationDelay = `${delay}s`;
        
        // 添加到容器
        this.container.appendChild(petal);
        this.petals.push(petal);
        
        // 动画结束后移除
        const totalTime = (duration + delay) * 1000;
        setTimeout(() => {
            this.removePetal(petal);
        }, totalTime);
        
        // 更新计数器
        this.updateCounter();
    }
    
    // 移除花瓣
    removePetal(petal) {
        const index = this.petals.indexOf(petal);
        if (index > -1) {
            this.petals.splice(index, 1);
        }
        
        if (petal.parentNode) {
            petal.parentNode.removeChild(petal);
        }
        
        // 更新计数器
        this.updateCounter();
    }
    
    // 清除所有花瓣
    clearAllPetals() {
        this.petals.forEach(petal => {
            if (petal.parentNode) {
                petal.parentNode.removeChild(petal);
            }
        });
        this.petals = [];
        this.updateCounter();
    }
    
    // 开始
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateButtonState();
        
        // 立即创建一些花瓣
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createPetal();
            }, i * 200);
        }
        
        // 定期创建花瓣
        this.intervalId = setInterval(() => {
            this.createPetal();
        }, this.config.petalInterval);
        
        // 保存状态
        this.saveState();
        
        console.log('🌸 樱花特效已启动');
    }
    
    // 停止
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.updateButtonState();
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        // 清除所有花瓣
        this.clearAllPetals();
        
        // 保存状态
        this.saveState();
        
        console.log('🌸 樱花特效已停止');
    }
    
    // 切换
    toggle() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    // 保存状态到本地存储
    saveState() {
        try {
            localStorage.setItem('sakuraEffectEnabled', this.isRunning ? 'true' : 'false');
        } catch (e) {
            console.warn('无法保存樱花特效状态', e);
        }
    }
    
    // 从本地存储加载状态
    loadState() {
        try {
            const saved = localStorage.getItem('sakuraEffectEnabled');
            if (saved === 'false') {
                this.stop();
            } else if (saved === 'true' && !this.isRunning) {
                this.start();
            }
        } catch (e) {
            console.warn('无法加载樱花特效状态', e);
        }
    }
    
    // 设置配置
    setConfig(options) {
        Object.assign(this.config, options);
        
        // 如果改变了最大数量，调整当前花瓣
        if (options.maxPetals && this.petals.length > options.maxPetals) {
            const excess = this.petals.length - options.maxPetals;
            for (let i = 0; i < excess; i++) {
                const petal = this.petals[0];
                this.removePetal(petal);
            }
        }
    }
    
    // 销毁
    destroy() {
        this.stop();
        
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        if (this.toggleButton && this.toggleButton.parentNode) {
            this.toggleButton.parentNode.removeChild(this.toggleButton);
        }
        
        if (this.counter && this.counter.parentNode) {
            this.counter.parentNode.removeChild(this.counter);
        }
        
        console.log('🌸 樱花特效已销毁');
    }
}

// ========== 全局实例 ==========

let sakuraEffect = null;

// 初始化樱花特效
function initSakuraEffect(options = {}) {
    if (sakuraEffect) {
        sakuraEffect.destroy();
    }
    
    sakuraEffect = new SakuraEffect(options);
    
    // 暴露到全局
    window.sakuraEffect = sakuraEffect;
    
    return sakuraEffect;
}

// 页面加载时自动初始化
document.addEventListener('DOMContentLoaded', function() {
    // 为所有前台页面启用樱花特效
    initSakuraEffect({
        maxPetals: 80,          // 增加到80片（原来30片的2.67倍）
        petalInterval: 200,     // 减少间隔，生成更快
        enabled: true,
        showCounter: false,
        autoStart: true
    });
});

// 暴露到全局
window.initSakuraEffect = initSakuraEffect;
