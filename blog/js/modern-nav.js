// 现代导航栏 - 滑动指示器动画 + 滚动显示效果

document.addEventListener('DOMContentLoaded', function() {
    const indicator = document.querySelector('.nav-indicator');
    const navItems = document.querySelectorAll('.nav-item');
    const nav = document.querySelector('nav.modern-nav');
    
    if (!indicator || navItems.length === 0) {
        return;
    }
    
    // 移动指示器到指定项
    function moveIndicator(item, withShake = false) {
        const itemRect = item.getBoundingClientRect();
        const containerRect = item.parentElement.getBoundingClientRect();
        const left = itemRect.left - containerRect.left;
        const width = itemRect.width;
        
        // 添加抖动效果
        if (withShake) {
            indicator.classList.add('shake');
            setTimeout(() => {
                indicator.classList.remove('shake');
            }, 300);
        }
        
        indicator.style.left = left + 'px';
        indicator.style.width = width + 'px';
    }
    
    // 初始化指示器位置
    const activeItem = document.querySelector('.nav-item.active');
    if (activeItem) {
        // 延迟一点以确保DOM完全渲染
        setTimeout(() => {
            moveIndicator(activeItem, false);
        }, 100);
    }
    
    // 为每个导航项添加事件监听
    navItems.forEach(item => {
        // 鼠标悬停
        item.addEventListener('mouseenter', function() {
            moveIndicator(this, false);
        });
        
        // 鼠标离开
        item.addEventListener('mouseleave', function() {
            const active = document.querySelector('.nav-item.active');
            if (active) {
                moveIndicator(active, false);
            }
        });
        
        // 点击
        item.addEventListener('click', function() {
            // 移除所有active类
            navItems.forEach(nav => nav.classList.remove('active'));
            // 添加active类到当前项
            this.classList.add('active');
            // 移动指示器并添加抖动效果
            moveIndicator(this, true);
        });
    });
    
    // 窗口大小改变时重新定位指示器
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const active = document.querySelector('.nav-item.active');
            if (active) {
                moveIndicator(active, false);
            }
        }, 250);
    });
    
    // 移动端菜单按钮
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navCenter = document.querySelector('.nav-center');
    
    if (mobileMenuBtn && navCenter) {
        mobileMenuBtn.addEventListener('click', function() {
            navCenter.classList.toggle('mobile-active');
            this.classList.toggle('active');
        });
    }
    
    // 滚动显示导航栏效果（仅在首页）
    if (document.body.classList.contains('home-page')) {
        const welcomeSection = document.querySelector('.welcome-section');
        
        if (nav && welcomeSection) {
            // 初始隐藏导航栏
            nav.classList.add('nav-hidden');
            
            let lastScrollTop = 0;
            let ticking = false;
            
            function updateNavVisibility() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const welcomeHeight = welcomeSection.offsetHeight;
                
                // 计算滚动进度（0-1）
                const scrollProgress = Math.min(scrollTop / (welcomeHeight * 0.3), 1);
                
                if (scrollTop > 100) {
                    // 开始滚动，显示导航栏
                    nav.classList.remove('nav-hidden');
                    nav.classList.add('nav-visible');
                    
                    // 根据滚动方向添加/移除阴影
                    if (scrollTop > lastScrollTop) {
                        // 向下滚动
                        nav.classList.add('nav-scrolled');
                    } else {
                        // 向上滚动
                        if (scrollTop < 150) {
                            nav.classList.remove('nav-scrolled');
                        }
                    }
                } else {
                    // 接近顶部，隐藏导航栏
                    nav.classList.add('nav-hidden');
                    nav.classList.remove('nav-visible', 'nav-scrolled');
                }
                
                lastScrollTop = scrollTop;
                ticking = false;
            }
            
            // 使用 requestAnimationFrame 优化滚动性能
            window.addEventListener('scroll', function() {
                if (!ticking) {
                    window.requestAnimationFrame(updateNavVisibility);
                    ticking = true;
                }
            });
            
            // 初始检查
            updateNavVisibility();
        }
    }
});
