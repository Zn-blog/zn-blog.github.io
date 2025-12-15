/* ========================================
   下拉框修复脚本
   确保下拉框样式不被主题覆盖
   ======================================== */

(function() {
    'use strict';
    
    // 强制应用下拉框样式（只设置静态属性，不干扰动画）
    function forceDropdownStyles() {
        const toggle = document.querySelector('.user-dropdown-toggle');
        const username = document.querySelector('.username');
        const dropdown = document.querySelector('.user-dropdown');
        const menu = document.querySelector('.user-dropdown-menu');
        
        if (toggle) {
            // 强制设置按钮样式
            toggle.style.setProperty('background', 'white', 'important');
            toggle.style.setProperty('color', '#2c5f7c', 'important');
            toggle.style.setProperty('border', '2px solid #4fc3f7', 'important');
            toggle.style.setProperty('z-index', '2147483647', 'important');
        }
        
        if (username) {
            // 强制设置用户名颜色
            username.style.setProperty('color', '#2c5f7c', 'important');
        }
        
        if (dropdown) {
            // 强制设置下拉容器z-index
            dropdown.style.setProperty('z-index', '2147483647', 'important');
            dropdown.style.setProperty('position', 'relative', 'important');
        }
        
        if (menu) {
            // 只设置z-index和position，不干扰visibility/opacity/transform
            menu.style.setProperty('z-index', '2147483647', 'important');
            menu.style.setProperty('position', 'absolute', 'important');
            menu.style.setProperty('pointer-events', 'auto', 'important');
            // 不设置overflow，让CSS控制
        }
        
        // 强制设置所有下拉菜单项的颜色
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            if (!item.classList.contains('logout-item')) {
                item.style.setProperty('color', '#2c5f7c', 'important');
            } else {
                item.style.setProperty('color', '#d32f2f', 'important');
            }
            item.style.setProperty('background', 'white', 'important');
        });
        
        // 强制设置下拉箭头颜色
        const arrow = document.querySelector('.dropdown-arrow');
        if (arrow) {
            arrow.style.setProperty('color', '#4fc3f7', 'important');
        }
    }
    
    // 监听主题变更事件
    window.addEventListener('adminThemeChanged', function() {
        console.log('检测到主题变更，重新应用下拉框样式');
        setTimeout(forceDropdownStyles, 100);
    });
    
    // 监听DOM变化
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                console.log('检测到data-theme属性变化，重新应用下拉框样式');
                setTimeout(forceDropdownStyles, 100);
            }
        });
    });
    
    // 页面加载完成后立即应用
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(forceDropdownStyles, 500);
            
            // 开始监听
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-theme']
            });
        });
    } else {
        setTimeout(forceDropdownStyles, 500);
        
        // 开始监听
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
    
    // 不使用定期检查，避免干扰动画
    // 只在必要时（主题变更）才重新应用
    
    console.log('✅ 下拉框修复脚本已加载');
})();
