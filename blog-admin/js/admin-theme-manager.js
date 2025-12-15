/* ========================================
   后台主题管理系统
   ======================================== */

// 主题配置（与前台相同）
const ADMIN_THEMES = {
    ocean: {
        id: 'ocean',
        name: '蓝色海洋',
        description: '清新的蓝色主题，如海洋般宁静',
        icon: '🌊',
        preview: {
            primary: '#81c4e8',
            secondary: '#5a8ca8',
            accent: '#ff9eb8'
        }
    },
    purple: {
        id: 'purple',
        name: '紫色梦幻',
        description: '优雅的紫色主题，充满梦幻气息',
        icon: '💜',
        preview: {
            primary: '#ba68c8',
            secondary: '#8e5a9f',
            accent: '#f06292'
        }
    },
    green: {
        id: 'green',
        name: '绿色自然',
        description: '清新的绿色主题，贴近自然',
        icon: '🌿',
        preview: {
            primary: '#81c784',
            secondary: '#66a86a',
            accent: '#aed581'
        }
    },
    orange: {
        id: 'orange',
        name: '橙色活力',
        description: '充满活力的橙色主题',
        icon: '🔥',
        preview: {
            primary: '#ffb74d',
            secondary: '#f57c00',
            accent: '#ff8a65'
        }
    },
    dark: {
        id: 'dark',
        name: '深色模式',
        description: '护眼的深色主题，适合夜间使用',
        icon: '🌙',
        preview: {
            primary: '#90caf9',
            secondary: '#5d99c6',
            accent: '#f8bbd0'
        }
    },
    pink: {
        id: 'pink',
        name: '粉色浪漫',
        description: '温柔甜美的粉色主题，充满浪漫气息',
        icon: '🌸',
        preview: {
            primary: '#f48fb1',
            secondary: '#d16a8a',
            accent: '#f8bbd0'
        }
    },
    'glass-dark': {
        id: 'glass-dark',
        name: '玻璃暗黑',
        description: '深色半透明黑白系，高级科技感',
        icon: '🖤',
        preview: {
            primary: '#ffffff',
            secondary: '#e0e0e0',
            accent: '#b0b0b0'
        }
    },
    cyberpunk: {
        id: 'cyberpunk',
        name: '赛博朋克',
        description: '霓虹灯效果，科技感十足的未来主义风格',
        icon: '🤖',
        preview: {
            primary: '#00f0ff',
            secondary: '#ff006e',
            accent: '#ffbe0b'
        }
    }
};

class AdminThemeManager {
    constructor() {
        this.init();
    }
    
    async init() {
        // 检查主题系统是否启用
        if (window.blogDataStore) {
            const settings = await window.blogDataStore.getSettings();
            if (settings && settings.enableThemeSystem === false) {
                console.log('主题系统已禁用');
                return;
            }
        }
        
        this.currentTheme = await this.loadTheme();
        this.applyTheme(this.currentTheme);
    }
    
    // 加载主题设置（后台独立）
    async loadTheme() {
        // 从 blogDataStore 加载后台主题（优先级最高）
        if (window.blogDataStore) {
            const settings = await window.blogDataStore.getSettings();
            if (settings && settings.backendTheme && ADMIN_THEMES[settings.backendTheme]) {
                return settings.backendTheme;
            }
            // 兼容旧的adminTheme字段
            if (settings && settings.adminTheme && ADMIN_THEMES[settings.adminTheme]) {
                return settings.adminTheme;
            }
        }
        
        // 从 localStorage 加载后台主题
        const savedTheme = localStorage.getItem('admin_theme');
        if (savedTheme && ADMIN_THEMES[savedTheme]) {
            return savedTheme;
        }
        
        // 默认主题
        return 'ocean';
    }
    
    // 应用主题
    async applyTheme(themeId) {
        // 检查主题系统是否启用
        if (window.blogDataStore) {
            const settings = await window.blogDataStore.getSettings();
            if (settings && settings.enableThemeSystem === false) {
                document.documentElement.removeAttribute('data-theme');
                console.log('主题系统已禁用');
                return;
            }
        }
        
        if (!ADMIN_THEMES[themeId]) {
            console.warn(`主题 ${themeId} 不存在，使用默认主题`);
            themeId = 'ocean';
        }
        
        // 设置 data-theme 属性
        document.documentElement.setAttribute('data-theme', themeId);
        
        // 保存到 localStorage（后台独立）
        localStorage.setItem('admin_theme', themeId);
        
        // 保存到 blogDataStore（后台独立字段）
        if (window.blogDataStore) {
            window.blogDataStore.updateSettings({ 
                backendTheme: themeId,
                adminTheme: themeId // 兼容旧字段
            });
        }
        
        this.currentTheme = themeId;
        
        // 触发主题变更事件
        window.dispatchEvent(new CustomEvent('adminThemeChanged', { 
            detail: { theme: themeId, themeData: ADMIN_THEMES[themeId] }
        }));
        
        console.log(`后台主题已切换到: ${ADMIN_THEMES[themeId].name}`);
    }
    
    // 切换主题
    switchTheme(themeId) {
        this.applyTheme(themeId);
    }
    
    // 获取当前主题
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    // 获取主题信息
    getThemeInfo(themeId) {
        return ADMIN_THEMES[themeId] || null;
    }
    
    // 获取所有主题
    getAllThemes() {
        return ADMIN_THEMES;
    }
}

// 创建全局后台主题管理器实例
window.adminThemeManager = new AdminThemeManager();

// 页面加载时应用主题
document.addEventListener('DOMContentLoaded', function() {
    if (!window.adminThemeManager) {
        window.adminThemeManager = new AdminThemeManager();
    }
});
