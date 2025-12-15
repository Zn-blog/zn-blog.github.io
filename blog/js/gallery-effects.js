// 相册特效管理
class GalleryEffects {
    constructor() {
        this.currentEffect = 'grid';
        this.images = [];
        this.carousel3D = null;
        this.initialized = false;
        this.init();
    }
    
    async init() {
        if (!window.blogDataStore) {
            setTimeout(() => this.init(), 100);
            return;
        }
        
        const settings = await window.blogDataStore.getSettings();
        if (settings && settings.galleryEffect) {
            this.currentEffect = settings.galleryEffect;
        }
        
        await this.loadImages();
        this.initialized = true;
        console.log('✅ GalleryEffects初始化完成，图片数量:', this.images.length);
    }
    
    async loadImages() {
        if (window.blogDataStore) {
            this.images = await window.blogDataStore.getImages();
            console.log('Loaded', this.images.length, 'images');
        }
    }
    
    // 渲染3D旋转相册
    render3DCarousel() {
        const container = document.getElementById('carousel3DContainer');
        if (!container) {
            console.log('❌ carousel3DContainer not found');
            return;
        }
        
        if (this.images.length === 0) {
            console.log('⚠️ No images available for 3D carousel');
            container.innerHTML = `
                <div class="carousel-3d-container">
                    <div class="carousel-3d-header">
                        <h2>🎡 3D 旋转相册</h2>
                        <p style="color: #999;">暂无图片，请先在后台上传图片</p>
                    </div>
                </div>
            `;
            return;
        }
        
        console.log('✅ Rendering 3D carousel with', this.images.length, 'images');
        
        const displayImages = this.images.slice(0, 10);
        const imageCount = displayImages.length;
        const theta = 360 / imageCount;
        // 增大半径2倍，让图片之间距离更大
        const radius = Math.round((210 / 2.8) / Math.tan(Math.PI / imageCount)) * 2;
        
        console.log(`3D Carousel: ${imageCount} images, theta=${theta}°, radius=${radius}px`);
        
        let html = `
            <div class="carousel-3d-container">
                <div class="carousel-3d-header">
                    <h2>🎡 3D 旋转相册</h2>
                    <p>鼠标悬停暂停旋转，点击图片查看大图</p>
                </div>
                <div class="carousel-3d-scene" id="carousel3DScene">
                    <div class="carousel-3d-wrapper" id="carousel3DWrapper">
        `;
        
        displayImages.forEach((image, index) => {
            const angle = theta * index;
            const transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
            const originalIndex = this.images.findIndex(img => img.url === image.url);
            
            html += `
                <div class="carousel-3d-item" style="transform: ${transform};" 
                     onclick="openImageModal(${originalIndex})">
                    <img src="${image.url}" alt="${image.name}" loading="lazy">
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
                <div class="carousel-controls">
                    <button onclick="galleryEffects.toggleCarousel()">⏯️ 暂停/播放</button>
                    <button onclick="galleryEffects.changeSpeed('slow')">🐌 慢速</button>
                    <button onclick="galleryEffects.changeSpeed('normal')">▶️ 正常</button>
                    <button onclick="galleryEffects.changeSpeed('fast')">⚡ 快速</button>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        const scene = document.getElementById('carousel3DScene');
        const wrapper = document.getElementById('carousel3DWrapper');
        
        if (scene && wrapper) {
            scene.addEventListener('mouseenter', () => {
                wrapper.classList.add('paused');
            });
            
            scene.addEventListener('mouseleave', () => {
                wrapper.classList.remove('paused');
            });
        }
    }
    
    toggleCarousel() {
        const wrapper = document.getElementById('carousel3DWrapper');
        if (wrapper) {
            wrapper.classList.toggle('paused');
        }
    }
    
    changeSpeed(speed) {
        const wrapper = document.getElementById('carousel3DWrapper');
        if (!wrapper) return;
        
        const speeds = {
            slow: '60s',
            normal: '30s',
            fast: '15s'
        };
        
        wrapper.style.animationDuration = speeds[speed] || '30s';
    }
    
    applyEffect() {
        const grid = document.getElementById('galleryGrid');
        if (!grid) {
            console.log('Gallery grid not found');
            return;
        }
        
        const items = grid.querySelectorAll('.gallery-item');
        if (items.length === 0) {
            console.log('No gallery items found, skipping effect application');
            return;
        }
        
        console.log('Applying effect:', this.currentEffect, 'to', items.length, 'items');
        
        grid.classList.remove('gallery-waterfall', 'gallery-flip', 'gallery-zoom', 'gallery-fade');
        
        switch (this.currentEffect) {
            case 'waterfall':
                grid.classList.remove('gallery-grid');
                grid.classList.add('gallery-waterfall');
                console.log('Applied waterfall effect');
                break;
            case 'flip':
                grid.classList.add('gallery-grid', 'gallery-flip');
                setTimeout(() => this.wrapWithFlipCard(), 100);
                console.log('Applied flip effect');
                break;
            case 'zoom':
                grid.classList.add('gallery-grid', 'gallery-zoom');
                console.log('Applied zoom effect');
                break;
            case 'fade':
                grid.classList.add('gallery-grid', 'gallery-fade');
                console.log('Applied fade effect');
                break;
            default:
                if (!grid.classList.contains('gallery-grid')) {
                    grid.classList.add('gallery-grid');
                }
                console.log('Applied default grid effect');
                break;
        }
    }
    
    wrapWithFlipCard() {
        const items = document.querySelectorAll('.gallery-item');
        console.log('Wrapping', items.length, 'items with flip cards');
        
        items.forEach((item, index) => {
            if (item.querySelector('.flip-card')) {
                console.log('Item', index, 'already has flip card');
                return;
            }
            
            const img = item.querySelector('img');
            const infoDiv = item.querySelector('div[style*="position: absolute"]');
            
            if (!img) {
                console.log('Item', index, 'has no image');
                return;
            }
            
            let title = '图片';
            let description = '暂无描述';
            
            if (infoDiv) {
                const titleDiv = infoDiv.querySelector('div[style*="font-size: 0.95rem"]');
                const descDiv = infoDiv.querySelector('div[style*="font-size: 0.85rem"]');
                
                if (titleDiv) title = titleDiv.textContent;
                if (descDiv) description = descDiv.textContent;
            }
            
            console.log('Creating flip card for item', index, ':', title);
            
            const onclickAttr = item.getAttribute('onclick');
            
            const flipCard = document.createElement('div');
            flipCard.className = 'flip-card';
            
            const front = document.createElement('div');
            front.className = 'flip-card-front';
            const imgClone = img.cloneNode(true);
            front.appendChild(imgClone);
            
            const back = document.createElement('div');
            back.className = 'flip-card-back';
            back.innerHTML = `
                <div>
                    <h3 style="margin-bottom: 1rem;">${title}</h3>
                    <p>${description}</p>
                    <button onclick="${onclickAttr}" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: white; color: #667eea; border: none; border-radius: 20px; cursor: pointer; font-size: 0.9rem;">查看大图</button>
                </div>
            `;
            
            flipCard.appendChild(front);
            flipCard.appendChild(back);
            
            item.innerHTML = '';
            item.appendChild(flipCard);
            item.removeAttribute('onclick');
        });
        
        console.log('Flip card wrapping complete');
    }
    
    async setEffect(effectType) {
        console.log('Setting effect to:', effectType);
        this.currentEffect = effectType;
        
        if (window.blogDataStore) {
            const settings = await window.blogDataStore.getSettings();
            settings.galleryEffect = effectType;
            window.blogDataStore.updateSettings(settings);
            console.log('Saved effect to settings:', effectType);
        }
        
        this.applyEffect();
    }
}

window.galleryEffects = new GalleryEffects();
