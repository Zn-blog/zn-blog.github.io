/* ========================================
   代码主题管理器
   ======================================== */

const CodeThemeManager = {
    // 可用的代码主题
    themes: {
        'default': {
            name: 'Default',
            description: '默认浅色主题',
            css: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css',
            preview: '#f5f2f0'
        },
        'dark': {
            name: 'Dark',
            description: '经典深色主题',
            css: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-dark.min.css',
            preview: '#1e1e1e'
        },
        'twilight': {
            name: 'Twilight',
            description: '暮光主题',
            css: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-twilight.min.css',
            preview: '#141414'
        },
        'okaidia': {
            name: 'Okaidia',
            description: '流行的深色主题',
            css: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css',
            preview: '#272822'
        },
        'tomorrow': {
            name: 'Tomorrow Night',
            description: '经典 Tomorrow 主题',
            css: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css',
            preview: '#1d1f21'
        },
        'solarizedlight': {
            name: 'Solarized Light',
            description: 'Solarized 浅色主题',
            css: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-solarizedlight.min.css',
            preview: '#fdf6e3'
        }
    },
    
    // 当前主题
    currentTheme: 'okaidia',
    
    // 初始化
    init() {
        // 从 localStorage 加载保存的主题
        const savedTheme = localStorage.getItem('code_theme');
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        }
        
        // 应用主题
        this.applyTheme(this.currentTheme);
        
        console.log('✅ 代码主题管理器已初始化，当前主题:', this.currentTheme);
    },
    
    // 应用主题
    applyTheme(themeId) {
        if (!this.themes[themeId]) {
            console.error('主题不存在:', themeId);
            return false;
        }
        
        const theme = this.themes[themeId];
        
        // 移除旧的主题 link
        const oldLink = document.getElementById('prism-theme');
        if (oldLink) {
            oldLink.remove();
        }
        
        // 添加新的主题 link
        const link = document.createElement('link');
        link.id = 'prism-theme';
        link.rel = 'stylesheet';
        link.href = theme.css;
        document.head.appendChild(link);
        
        // 保存到 localStorage
        this.currentTheme = themeId;
        localStorage.setItem('code_theme', themeId);
        
        // 重新高亮代码（如果 Prism 已加载）
        if (typeof Prism !== 'undefined') {
            setTimeout(() => {
                Prism.highlightAll();
            }, 100);
        }
        
        console.log('✅ 代码主题已切换:', theme.name);
        return true;
    },
    
    // 获取当前主题
    getCurrentTheme() {
        return this.currentTheme;
    },
    
    // 获取主题信息
    getThemeInfo(themeId) {
        return this.themes[themeId] || null;
    },
    
    // 获取所有主题
    getAllThemes() {
        return this.themes;
    }
};

// 立即初始化（不等待 DOM 加载，因为只是添加 link 标签）
CodeThemeManager.init();

// 导出到全局
window.CodeThemeManager = CodeThemeManager;
