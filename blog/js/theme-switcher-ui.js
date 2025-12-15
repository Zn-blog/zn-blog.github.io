/* ========================================
   主题切换UI组件
   ======================================== */

// 创建主题切换按钮
function createThemeSwitcherButton() {
    const themes = window.themeManager.getAllThemes();
    const currentTheme = window.themeManager.getCurrentTheme();
    
    const html = `
        <div class="theme-switcher-fab">
            <button class="theme-fab-button" onclick="toggleThemePanel()" title="切换主题">
                🎨
            </button>
            <div class="theme-switcher-panel" id="themeSwitcherPanel">
                <div class="theme-panel-title">选择主题</div>
                <div class="theme-options">
                    ${Object.values(themes).map(theme => `
                        <div class="theme-option ${theme.id === currentTheme ? 'active' : ''}" 
                             onclick="switchThemeFromPanel('${theme.id}')">
                            <div class="theme-option-icon">${theme.icon}</div>
                            <div class="theme-option-info">
                                <div class="theme-option-name">${theme.name}</div>
                                <div class="theme-option-desc">${theme.description}</div>
                            </div>
                            <div class="theme-option-check">✓</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// 切换主题面板显示
function toggleThemePanel() {
    const panel = document.getElementById('themeSwitcherPanel');
    if (panel) {
        panel.classList.toggle('active');
    }
}

// 从面板切换主题
function switchThemeFromPanel(themeId) {
    window.themeManager.switchTheme(themeId);
    
    // 更新UI
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // 显示通知
    const themeInfo = window.themeManager.getThemeInfo(themeId);
    showThemeNotification(`已切换到：${themeInfo.icon} ${themeInfo.name}`);
    
    // 关闭面板
    setTimeout(() => {
        toggleThemePanel();
    }, 500);
}

// 显示主题切换通知
function showThemeNotification(message) {
    // 移除旧通知
    const oldNotification = document.querySelector('.theme-notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    // 创建新通知
    const notification = document.createElement('div');
    notification.className = 'theme-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // 3秒后移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// 点击外部关闭面板
document.addEventListener('click', function(e) {
    const panel = document.getElementById('themeSwitcherPanel');
    const fab = document.querySelector('.theme-fab-button');
    
    if (panel && panel.classList.contains('active')) {
        if (!panel.contains(e.target) && !fab.contains(e.target)) {
            panel.classList.remove('active');
        }
    }
});

// 页面加载完成后创建按钮
document.addEventListener('DOMContentLoaded', function() {
    // 延迟创建，确保主题管理器已加载
    setTimeout(createThemeSwitcherButton, 100);
});
