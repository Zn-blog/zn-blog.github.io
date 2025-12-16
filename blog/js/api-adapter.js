/**
 * API适配器 - 根据部署环境自动选择数据获取方式
 */

class APIAdapter {
    constructor() {
        this.isVercel = window.location.hostname.includes('vercel.app');
        this.isGitHubPages = window.location.hostname.includes('github.io');
        this.isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        console.log('🔧 API适配器初始化:', {
            isLocal: this.isLocal,
            isVercel: this.isVercel,
            isGitHubPages: this.isGitHubPages,
            hostname: window.location.hostname
        });
    }
    
    /**
     * 获取数据 - 自动适配不同部署环境
     */
    async getData(resource) {
        try {
            if (this.isLocal) {
                // 本地环境：使用API服务器
                const response = await fetch(`http://localhost:3001/api/${resource}`);
                if (!response.ok) {
                    throw new Error(`API请求失败: ${response.status}`);
                }
                return await response.json();
            } else {
                // 静态部署：直接读取JSON文件
                const jsonPath = this.getJsonPath(resource);
                const response = await fetch(jsonPath);
                if (!response.ok) {
                    throw new Error(`JSON文件读取失败: ${response.status}`);
                }
                return await response.json();
            }
        } catch (error) {
            console.error(`❌ 获取${resource}数据失败:`, error);
            return this.getDefaultData(resource);
        }
    }
    
    /**
     * 保存数据 - 本地环境使用API，静态部署显示提示
     */
    async saveData(resource, data) {
        if (this.isLocal) {
            try {
                const response = await fetch(`http://localhost:3001/api/${resource}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) {
                    throw new Error(`保存失败: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error(`❌ 保存${resource}数据失败:`, error);
                throw error;
            }
        } else {
            // 静态部署环境：显示提示信息
            this.showStaticModeNotice('保存功能在静态部署中不可用');
            throw new Error('静态部署模式下无法保存数据');
        }
    }
    
    /**
     * 更新数据
     */
    async updateData(resource, id, data) {
        if (this.isLocal) {
            try {
                const response = await fetch(`http://localhost:3001/api/${resource}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) {
                    throw new Error(`更新失败: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error(`❌ 更新${resource}数据失败:`, error);
                throw error;
            }
        } else {
            this.showStaticModeNotice('编辑功能在静态部署中不可用');
            throw new Error('静态部署模式下无法更新数据');
        }
    }
    
    /**
     * 删除数据
     */
    async deleteData(resource, id) {
        if (this.isLocal) {
            try {
                const response = await fetch(`http://localhost:3001/api/${resource}/${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error(`删除失败: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error(`❌ 删除${resource}数据失败:`, error);
                throw error;
            }
        } else {
            this.showStaticModeNotice('删除功能在静态部署中不可用');
            throw new Error('静态部署模式下无法删除数据');
        }
    }
    
    /**
     * 获取JSON文件路径
     */
    getJsonPath(resource) {
        const pathMap = {
            'articles': '/data/articles.json',
            'categories': '/data/categories.json',
            'tags': '/data/tags.json',
            'comments': '/data/comments.json',
            'guestbook': '/data/guestbook.json',
            'images': '/data/images.json',
            'music': '/data/music.json',
            'videos': '/data/videos.json',
            'links': '/data/links.json',
            'apps': '/data/apps.json',
            'events': '/data/events.json',
            'users': '/data/users.json',
            'settings': '/data/settings.json'
        };
        
        return pathMap[resource] || `/data/${resource}.json`;
    }
    
    /**
     * 获取默认数据
     */
    getDefaultData(resource) {
        const defaults = {
            'articles': [],
            'categories': [],
            'tags': [],
            'comments': [],
            'guestbook': [],
            'images': [],
            'music': [],
            'videos': [],
            'links': [],
            'apps': [],
            'events': [],
            'users': [],
            'settings': {}
        };
        
        return defaults[resource] || [];
    }
    
    /**
     * 显示静态模式提示
     */
    showStaticModeNotice(message) {
        // 创建提示框
        const notice = document.createElement('div');
        notice.className = 'static-mode-notice';
        notice.innerHTML = `
            <div class="notice-content">
                <div class="notice-icon">ℹ️</div>
                <div class="notice-text">${message}</div>
                <div class="notice-subtext">如需完整功能，请在本地环境使用</div>
            </div>
        `;
        
        // 添加样式
        notice.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 123, 255, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // 添加动画样式
        if (!document.querySelector('#static-notice-styles')) {
            const styles = document.createElement('style');
            styles.id = 'static-notice-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notice-content { display: flex; align-items: center; gap: 10px; }
                .notice-icon { font-size: 20px; }
                .notice-text { font-weight: 500; }
                .notice-subtext { font-size: 12px; opacity: 0.8; margin-top: 4px; }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notice);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (notice.parentNode) {
                notice.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => notice.remove(), 300);
            }
        }, 3000);
    }
    
    /**
     * 检查是否支持服务器功能
     */
    get supportsServerFeatures() {
        return this.isLocal;
    }
    
    /**
     * 获取环境信息
     */
    get environment() {
        if (this.isLocal) return 'local';
        if (this.isVercel) return 'vercel';
        if (this.isGitHubPages) return 'github-pages';
        return 'unknown';
    }
}

// 创建全局实例
window.apiAdapter = new APIAdapter();

console.log('🔧 API适配器已加载，当前环境:', window.apiAdapter.environment);