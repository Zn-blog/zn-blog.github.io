/**
 * 路径修复脚本 - 专门为GitHub Pages修复路径问题
 */

class PathFixer {
    constructor() {
        this.isGitHubPages = window.location.hostname.includes('github.io');
        this.baseUrl = this.getBaseUrl();
        
        console.log('🔧 路径修复器初始化:', {
            isGitHubPages: this.isGitHubPages,
            baseUrl: this.baseUrl,
            currentPath: window.location.pathname
        });
        
        if (this.isGitHubPages) {
            this.fixAllPaths();
        }
    }
    
    getBaseUrl() {
        if (!this.isGitHubPages) return '';
        
        const pathParts = window.location.pathname.split('/').filter(p => p);
        // 对于GitHub Pages，第一个部分通常是仓库名
        return pathParts.length > 0 ? `/${pathParts[0]}` : '';
    }
    
    fixAllPaths() {
        console.log('🔧 开始修复数据文件路径...');
        
        // 只修复数据文件路径（通过重写fetch）
        this.fixDataPaths();
        
        console.log('✅ 数据路径修复完成');
    }
    

    
    fixDataPaths() {
        // 重写fetch函数来修复数据文件路径
        const originalFetch = window.fetch;
        const pathFixer = this;
        
        window.fetch = function(url, options) {
            if (typeof url === 'string' && !url.startsWith('http')) {
                // 检查是否是数据文件
                if (url.includes('.json') && (url.includes('data/') || url.startsWith('../data/') || url.startsWith('../../data/'))) {
                    const fixedUrl = pathFixer.fixDataPath(url);
                    console.log('📊 修复数据路径:', url, '→', fixedUrl);
                    return originalFetch(fixedUrl, options);
                }
            }
            return originalFetch(url, options);
        };
    }
    
    fixRelativePath(path) {
        if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('#')) {
            return path;
        }
        
        const currentPath = window.location.pathname;
        const isInPages = currentPath.includes('/blog/pages/');
        const isInBlog = currentPath.includes('/blog/');
        
        // 处理相对路径
        if (path.startsWith('../')) {
            // 移除相对路径前缀
            let cleanPath = path;
            while (cleanPath.startsWith('../')) {
                cleanPath = cleanPath.substring(3);
            }
            
            if (isInPages) {
                // 从pages目录，../xxx -> /repo/blog/xxx, ../../xxx -> /repo/xxx
                const levels = (path.match(/\.\.\//g) || []).length;
                if (levels === 1) {
                    return `${this.baseUrl}/blog/${cleanPath}`;
                } else if (levels >= 2) {
                    return `${this.baseUrl}/${cleanPath}`;
                }
            } else if (isInBlog) {
                // 从blog目录，../xxx -> /repo/xxx
                return `${this.baseUrl}/${cleanPath}`;
            }
        } else if (path.startsWith('./')) {
            // 当前目录相对路径
            const cleanPath = path.substring(2);
            if (isInPages || isInBlog) {
                return `${this.baseUrl}/blog/${cleanPath}`;
            }
            return `${this.baseUrl}/${cleanPath}`;
        } else if (path.startsWith('/')) {
            // 绝对路径
            return `${this.baseUrl}${path}`;
        } else {
            // 相对路径
            if (isInPages || isInBlog) {
                return `${this.baseUrl}/blog/${path}`;
            }
            return `${this.baseUrl}/${path}`;
        }
        
        return path;
    }
    
    fixDataPath(url) {
        // 专门处理数据文件路径
        let dataPath = url;
        
        // 移除所有相对路径前缀
        while (dataPath.startsWith('../')) {
            dataPath = dataPath.substring(3);
        }
        
        // 确保以data/开头
        if (!dataPath.startsWith('data/')) {
            if (dataPath.includes('/data/')) {
                dataPath = dataPath.substring(dataPath.indexOf('/data/') + 1);
            } else {
                dataPath = `data/${dataPath}`;
            }
        }
        
        return `${this.baseUrl}/${dataPath}`;
    }
}

// 页面加载完成后立即初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pathFixer = new PathFixer();
    });
} else {
    window.pathFixer = new PathFixer();
}