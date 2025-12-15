/* 强制修复下拉框显示 */
(function() {
    function fix() {
        // 确保容器允许溢出
        const elements = {
            topBar: document.querySelector('.top-bar'),
            mainContent: document.querySelector('.main-content'),
            userInfo: document.querySelector('.user-info'),
            dropdown: document.querySelector('.user-dropdown'),
            toggle: document.querySelector('.user-dropdown-toggle'),
            username: document.querySelector('.username'),
            menu: document.querySelector('.user-dropdown-menu'),
            arrow: document.querySelector('.dropdown-arrow')
        };
        
        // 设置overflow
        [elements.topBar, elements.mainContent, elements.userInfo, elements.dropdown].forEach(el => {
            if (el) el.style.setProperty('overflow', 'visible', 'important');
        });
        
        // 设置按钮样式
        if (elements.toggle) {
            elements.toggle.style.setProperty('background', 'white', 'important');
            elements.toggle.style.setProperty('color', '#2c5f7c', 'important');
            elements.toggle.style.setProperty('border', '2px solid #4fc3f7', 'important');
        }
        
        // 设置用户名颜色
        if (elements.username) {
            elements.username.style.setProperty('color', '#2c5f7c', 'important');
        }
        
        // 设置箭头颜色
        if (elements.arrow) {
            elements.arrow.style.setProperty('color', '#4fc3f7', 'important');
        }
        
        // 设置下拉菜单
        if (elements.dropdown) {
            elements.dropdown.style.setProperty('z-index', '999999', 'important');
        }
        
        if (elements.menu) {
            elements.menu.style.setProperty('z-index', '999999', 'important');
            if (elements.menu.classList.contains('active')) {
                elements.menu.style.setProperty('display', 'block', 'important');
                elements.menu.style.setProperty('opacity', '1', 'important');
                elements.menu.style.setProperty('visibility', 'visible', 'important');
            }
        }
        
        // 设置菜单项颜色
        document.querySelectorAll('.dropdown-item').forEach(item => {
            const color = item.classList.contains('logout-item') ? '#d32f2f' : '#2c5f7c';
            item.style.setProperty('color', color, 'important');
            item.style.setProperty('background', 'white', 'important');
        });
    }
    
    // 立即执行
    fix();
    
    // 延迟执行
    setTimeout(fix, 100);
    setTimeout(fix, 500);
    setTimeout(fix, 1000);
    
    // 监听主题变更
    window.addEventListener('adminThemeChanged', () => setTimeout(fix, 100));
    
    // 监听DOM变化
    if (document.documentElement) {
        new MutationObserver(() => setTimeout(fix, 50)).observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
    
    // 定期检查
    setInterval(fix, 2000);
    
    console.log('✅ 下拉框强制修复已加载');
})();
