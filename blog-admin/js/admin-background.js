/* ========================================
   后台管理系统背景图片管理
   ======================================== */

class AdminBackgroundManager {
    constructor() {
        this.imagesPath = 'uploads/images/background/';
        this.currentBackground = null;
        // 预定义的图片文件名列表（需要手动维护）
        this.imageFiles = this.getImageFilesList();
        this.init();
    }
    
    init() {
        // 检查是否已经有预加载的背景
        const preloadedBackground = localStorage.getItem('admin_current_background');
        const bgLayer = document.querySelector('.admin-background-layer');
        
        if (preloadedBackground && bgLayer) {
            // 如果预加载脚本已经设置了背景，就不要重新加载
            console.log('✅ 使用预加载的背景:', preloadedBackground);
            this.currentBackground = preloadedBackground;
            // 不调用 loadRandomBackground()，避免闪烁
        } else {
            // 如果没有预加载背景，才加载随机背景
            console.log('🔄 加载随机背景');
            this.loadRandomBackground();
        }
    }
    
    // 获取图片文件列表
    getImageFilesList() {
        // 从 localStorage 获取自定义图片列表，如果没有则使用默认列表
        const customList = localStorage.getItem('admin_background_images');
        if (customList) {
            try {
                return JSON.parse(customList);
            } catch (e) {
                console.error('解析图片列表失败:', e);
            }
        }
        
        // 默认图片列表
        // 用户需要将背景图片放到 uploads/images/background/ 文件夹中
        return [
            'bg-1.jpg',
            'bg-2.jpg',
            'bg-3.jpg',
            'bg-4.jpg',
            'bg-5.jpg',
            'bg-6.jpg',
            'bg-7.jpg',
            'bg-8.jpg',
            'bg-9.jpg',
            'bg-10.jpg',
            'bg-11.jpg',
            'bg-12.jpg',
            'bg-13.jpg',
            'bg-14.jpg',
            'bg-15.jpg'
        ];
    }
    
    // 加载随机背景图片
    async loadRandomBackground() {
        try {
            // 优先使用已保存的背景
            const savedBackground = localStorage.getItem('admin_current_background');
            if (savedBackground) {
                console.log('📌 使用已保存的背景:', savedBackground);
                await this.setBackground(savedBackground);
                return;
            }
            
            const images = this.getAvailableImages();
            
            if (images.length === 0) {
                // 如果没有图片，使用默认渐变背景
                this.setDefaultBackground();
                return;
            }
            
            // 随机选择一张图片
            const randomImage = images[Math.floor(Math.random() * images.length)];
            console.log('🎲 随机选择背景:', randomImage);
            await this.setBackground(randomImage);
            
        } catch (error) {
            console.error('加载背景图片失败:', error);
            this.setDefaultBackground();
        }
    }
    
    // 获取可用的图片列表
    getAvailableImages() {
        return this.imageFiles.map(filename => this.imagesPath + filename);
    }
    
    // 检查图片是否存在
    async checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
    
    // 设置背景图片
    async setBackground(imageUrl) {
        // 获取背景层
        let bgLayer = document.querySelector('.admin-background-layer');
        
        // 先检查图片是否存在
        const exists = await this.checkImageExists(imageUrl);
        if (!exists) {
            console.warn('图片不存在:', imageUrl);
            this.setDefaultBackground();
            return;
        }
        
        // 创建背景层（如果不存在）
        if (!bgLayer) {
            bgLayer = document.createElement('div');
            bgLayer.className = 'admin-background-layer';
            document.body.insertBefore(bgLayer, document.body.firstChild);
        }
        
        // 添加时间戳防止缓存，强制刷新背景
        const timestamp = new Date().getTime();
        const imageUrlWithTimestamp = `${imageUrl}?t=${timestamp}`;
        
        // 先清空背景，强制重绘
        bgLayer.style.backgroundImage = 'none';
        
        // 使用setTimeout确保浏览器重绘
        setTimeout(() => {
            // 设置背景图片到专门的背景层
            bgLayer.style.backgroundImage = `url('${imageUrlWithTimestamp}')`;
            
            // 输出调试信息
            console.log('🖼️ 背景已设置:', imageUrl);
            console.log('📍 背景层元素:', bgLayer);
            console.log('🎨 当前backgroundImage:', bgLayer.style.backgroundImage);
            console.log('📏 背景层位置:', {
                position: bgLayer.style.position,
                zIndex: window.getComputedStyle(bgLayer).zIndex,
                display: window.getComputedStyle(bgLayer).display,
                visibility: window.getComputedStyle(bgLayer).visibility
            });
            
            // 强制重绘
            bgLayer.style.display = 'none';
            bgLayer.offsetHeight; // 触发reflow
            bgLayer.style.display = '';
        }, 10);
        
        // 不添加遮罩层，让背景图片完全显示
        let overlay = document.querySelector('.admin-background-overlay');
        if (overlay) {
            overlay.remove(); // 移除已存在的遮罩层
        }
        
        this.currentBackground = imageUrl;
        
        // 保存当前背景到 localStorage（不带时间戳）
        localStorage.setItem('admin_current_background', imageUrl);
    }
    
    // 设置默认背景
    setDefaultBackground() {
        // 获取或创建背景层
        let bgLayer = document.querySelector('.admin-background-layer');
        if (!bgLayer) {
            bgLayer = document.createElement('div');
            bgLayer.className = 'admin-background-layer';
            document.body.insertBefore(bgLayer, document.body.firstChild);
        }
        
        // 检测是否在登录页面
        const isLoginPage = window.location.pathname.includes('login.html');
        
        if (isLoginPage) {
            // 登录页面使用紫色渐变
            bgLayer.style.backgroundImage = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        } else {
            // 管理页面使用浅色渐变
            bgLayer.style.backgroundImage = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
        }
        
        // 移除遮罩（但保留登录页面的遮罩）
        const overlay = document.querySelector('.admin-background-overlay');
        if (overlay && !isLoginPage) {
            overlay.remove();
        }
    }
    
    // 切换到下一张背景
    nextBackground() {
        const images = this.getAvailableImages();
        if (images.length === 0) return;
        
        const currentIndex = images.indexOf(this.currentBackground);
        const nextIndex = (currentIndex + 1) % images.length;
        this.setBackground(images[nextIndex]);
    }
    
    // 切换到上一张背景
    previousBackground() {
        const images = this.getAvailableImages();
        if (images.length === 0) return;
        
        const currentIndex = images.indexOf(this.currentBackground);
        const prevIndex = currentIndex <= 0 ? images.length - 1 : currentIndex - 1;
        this.setBackground(images[prevIndex]);
    }
    
    // 更新图片列表（用于动态添加图片）
    updateImageList(imageFiles) {
        this.imageFiles = imageFiles;
        localStorage.setItem('admin_background_images', JSON.stringify(imageFiles));
    }
    
    // 添加单张图片到列表
    addImage(filename) {
        if (!this.imageFiles.includes(filename)) {
            this.imageFiles.push(filename);
            localStorage.setItem('admin_background_images', JSON.stringify(this.imageFiles));
        }
    }
    
    // 刷新背景（重新随机选择）
    refreshBackground() {
        this.loadRandomBackground();
    }
}

// 立即初始化，不等待DOM加载完成
(function() {
    // 如果DOM已经加载完成，立即初始化
    if (document.readyState === 'loading') {
        // DOM还在加载，尽早初始化
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.adminBackgroundManager) {
                window.adminBackgroundManager = new AdminBackgroundManager();
            }
        });
        // 同时也在脚本加载时就尝试初始化
        setTimeout(() => {
            if (!window.adminBackgroundManager) {
                window.adminBackgroundManager = new AdminBackgroundManager();
            }
        }, 0);
    } else {
        // DOM已经加载完成，立即初始化
        window.adminBackgroundManager = new AdminBackgroundManager();
    }
})();
