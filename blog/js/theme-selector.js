/* ========================================
   主题选择器组件
   ======================================== */

// 创建主题选择器UI
function createThemeSelector() {
    const themes = window.themeManager.getAllThemes();
    const currentTheme = window.themeManager.getCurrentTheme();
    
    let html = '<div class="theme-selector-grid">';
    
    Object.values(themes).forEach(theme => {
        const isActive = theme.id === currentTheme;
        html += `
            <div class="theme-card ${isActive ? 'active' : ''}" onclick="selectTheme('${theme.id}')">
                <div class="theme-icon">${theme.icon}</div>
                <div class="theme-preview">
                    <div class="preview-color" style="background: ${theme.preview.primary}"></div>
                    <div class="preview-color" style="background: ${theme.preview.secondary}"></div>
                    <div class="preview-color" style="background: ${theme.preview.accent}"></div>
                </div>
                <div class="theme-name">${theme.name}</div>
                <div class="theme-description">${theme.description}</div>
                ${isActive ? '<div class="theme-badge">当前主题</div>' : ''}
            </div>
        `;
    });
    
    html += '</div>';
    
    return html;
}

// 选择主题
function selectTheme(themeId) {
    window.themeManager.switchTheme(themeId);
    
    // 更新UI
    const container = document.querySelector('.theme-selector-grid');
    if (container) {
        container.innerHTML = '';
        container.outerHTML = createThemeSelector();
    }
    
    // 显示通知
    if (typeof showNotification === 'function') {
        const themeInfo = window.themeManager.getThemeInfo(themeId);
        showNotification(`主题已切换到：${themeInfo.name}`, 'success');
    }
}

// 主题选择器样式
const themeSelectorStyles = `
<style>
.theme-selector-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
    padding: 1rem 0;
}

.theme-card {
    background: var(--bg-color);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    text-align: center;
}

.theme-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-color);
}

.theme-card.active {
    border-color: var(--primary-color);
    background: var(--primary-light);
}

.theme-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.theme-preview {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1rem;
}

.preview-color {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.theme-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.theme-description {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
}

.theme-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: var(--primary-color);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

@media (max-width: 768px) {
    .theme-selector-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }
    
    .theme-card {
        padding: 1rem;
    }
    
    .theme-icon {
        font-size: 2rem;
    }
    
    .preview-color {
        width: 30px;
        height: 30px;
    }
}
</style>
`;

// 将样式添加到页面
document.head.insertAdjacentHTML('beforeend', themeSelectorStyles);
