/**
 * GitHub Pages 适配器
 * 解决静态部署中的路径和功能问题，使用实际仓库文件
 */

class GitHubPagesAdapter {
    constructor() {
        this.isGitHubPages = window.location.hostname.includes('github.io');
        this.baseUrl = this.isGitHubPages ? this.getBaseUrl() : '';
        
        console.log('🌐 GitHub Pages适配器初始化:', {
            isGitHubPages: this.isGitHubPages,
            baseUrl: this.baseUrl,
            hostname: window.location.hostname
        });
        
        if (this.isGitHubPages) {
            this.init();
        }
    }
    
    // 获取基础URL
    getBaseUrl() {
        const pathParts = window.location.pathname.split('/');
        // 对于GitHub Pages，通常是 /repository-name/blog/...
        // 我们需要找到仓库名称
        if (pathParts.length > 1 && pathParts[1]) {
            // 如果路径包含 blog，说明我们在blog目录下
            if (pathParts.includes('blog')) {
                // 找到blog之前的部分作为baseUrl
                const blogIndex = pathParts.indexOf('blog');
                if (blogIndex > 0) {
                    return `/${pathParts[1]}`;
                }
            }
            return `/${pathParts[1]}`;
        }
        return '';
    }
    
    // 初始化适配
    init() {
        this.setupStaticMode();
        // 只设置静态模式，不修复页面路径
        // 路径修复已在data-adapter.js中处理
    }
    
    // 修复图片路径
    fixImagePaths() {
        // 修复头像和背景图片路径
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.src && !img.src.startsWith('http') && !img.src.startsWith('data:')) {
                const newSrc = this.fixPath(img.src);
                img.src = newSrc;
                console.log('🖼️ 修复图片路径:', img.src, '→', newSrc);
            }
        });
        
        // 修复CSS背景图片
        const elements = document.querySelectorAll('[style*="background-image"]');
        elements.forEach(el => {
            const style = el.style.backgroundImage;
            if (style && style.includes('url(') && !style.includes('http')) {
                const newStyle = style.replace(/url\(['"]?([^'"]+)['"]?\)/g, (_, url) => {
                    return `url('${this.fixPath(url)}')`;
                });
                el.style.backgroundImage = newStyle;
            }
        });
    }
    
    // 修复视频路径
    fixVideoPaths() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (video.src && !video.src.startsWith('http')) {
                video.src = this.fixPath(video.src);
            }
            
            // 修复source标签
            const sources = video.querySelectorAll('source');
            sources.forEach(source => {
                if (source.src && !source.src.startsWith('http')) {
                    source.src = this.fixPath(source.src);
                }
            });
        });
    }
    
    // 修复导航路径
    fixNavigationPaths() {
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                link.href = this.fixPath(href);
            }
        });
    }
    
    // 修复路径
    fixPath(path) {
        // 如果已经是完整URL，直接返回
        if (path.startsWith('http') || path.startsWith('data:')) {
            return path;
        }
        
        // 获取当前页面路径信息
        const currentPath = window.location.pathname;
        const isInBlogDir = currentPath.includes('/blog/');
        const isInPagesDir = currentPath.includes('/blog/pages/');
        
        // 处理相对路径
        if (path.startsWith('../')) {
            // 从pages目录：../data/xxx.json -> /repository-name/data/xxx.json
            // 从blog目录：../data/xxx.json -> /repository-name/data/xxx.json
            let relativePath = path;
            while (relativePath.startsWith('../')) {
                relativePath = relativePath.substring(3);
            }
            return `${this.baseUrl}/${relativePath}`;
        } else if (path.startsWith('./')) {
            // ./images/xxx.jpg -> /repository-name/blog/images/xxx.jpg
            const relativePath = path.replace('./', '');
            if (isInPagesDir) {
                return `${this.baseUrl}/blog/${relativePath}`;
            } else {
                return `${this.baseUrl}/blog/${relativePath}`;
            }
        } else if (path.startsWith('/')) {
            // /data/xxx.json -> /repository-name/data/xxx.json
            // /uploads/xxx.jpg -> /repository-name/uploads/xxx.jpg
            return `${this.baseUrl}${path}`;
        } else {
            // 相对路径处理：根据当前页面位置判断
            if (isInPagesDir) {
                // 在pages目录下，需要回到blog目录
                return `${this.baseUrl}/blog/${path}`;
            } else if (isInBlogDir) {
                // 在blog目录下
                return `${this.baseUrl}/blog/${path}`;
            } else {
                // 在根目录
                return `${this.baseUrl}/${path}`;
            }
        }
    }
    
    // 设置静态模式
    setupStaticMode() {
        // 禁用需要服务器的功能
        window.STATIC_MODE = true;
        
        // 显示静态模式提示
        this.showStaticModeNotice();
        
        // 重写可能失败的API调用
        this.mockServerAPIs();
    }
    
    // 模拟服务器API但保留实际文件路径
    mockServerAPIs() {
        // 模拟上传功能
        window.mockUpload = true;
        
        // 模拟保存功能
        window.mockSave = true;
        
        // 路径修复已在data-adapter.js中处理，这里不再重写fetch
        const originalFetch = window.fetch;
        const adapter = this;
        
        // 注释掉fetch重写，避免干扰data-adapter.js的路径处理
        /*
        window.fetch = async function(url, options) {
            if (typeof url === 'string') {
                // 如果是 API 调用（包含 localhost 或以 /api/ 开头）
                if (url.includes('localhost') || url.includes('127.0.0.1') || url.startsWith('/api/')) {
                    console.log('🚫 静态模式下跳过 API 调用:', url);
                    
                    // 返回模拟的成功响应
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve({
                            success: true,
                            message: '静态模式下的模拟响应',
                            data: null
                        })
                    });
                }
                
                // 处理数据文件路径
                let newUrl = url;
                
                // 修复相对路径的数据文件
                if (url.includes('/data/') || url.startsWith('../data/') || url.startsWith('../../data/') || url.startsWith('data/')) {
                    // 统一处理所有数据文件路径
                    let dataPath = url;
                    
                    // 移除所有相对路径前缀
                    dataPath = dataPath.replace(/^\.\.\//, '').replace(/^\.\.\//, '').replace(/^\//, '');
                    
                    // 如果不是以data/开头，添加data/前缀
                    if (!dataPath.startsWith('data/')) {
                        if (dataPath.includes('/data/')) {
                            dataPath = dataPath.substring(dataPath.indexOf('/data/') + 1);
                        } else {
                            dataPath = `data/${dataPath}`;
                        }
                    }
                    
                    newUrl = `${adapter.baseUrl}/${dataPath}`;
                    console.log('📊 修复数据路径:', url, '→', newUrl);
                }
                
                // 处理数据文件，修复其中的路径但保留实际文件引用
                if (url.includes('.json')) {
                    return originalFetch(newUrl, options).then(response => {
                        if (response.ok) {
                            return response.json().then(data => {
                                let processedData = data;
                                
                                // 处理视频数据 - 修复路径但保留实际文件
                                if (url.includes('videos.json') && Array.isArray(data)) {
                                    processedData = data.map(video => {
                                        const newVideo = { ...video };
                                        
                                        // 修复视频URL路径
                                        if (video.url && video.url.startsWith('/uploads/')) {
                                            newVideo.url = `${adapter.baseUrl}${video.url}`;
                                        }
                                        
                                        // 修复封面图片路径
                                        if (video.cover && video.cover.startsWith('/uploads/')) {
                                            newVideo.cover = `${adapter.baseUrl}${video.cover}`;
                                        }
                                        
                                        return newVideo;
                                    });
                                    console.log('🎬 已修复视频文件路径，使用实际仓库文件');
                                }
                                
                                // 处理图片数据 - 修复路径但保留实际文件
                                if (url.includes('images.json') && Array.isArray(data)) {
                                    processedData = data.map(image => {
                                        const newImage = { ...image };
                                        
                                        // 修复图片URL路径
                                        if (image.url && image.url.startsWith('/uploads/')) {
                                            newImage.url = `${adapter.baseUrl}${image.url}`;
                                        }
                                        
                                        // 修复缩略图路径
                                        if (image.thumbnail && image.thumbnail.startsWith('/uploads/')) {
                                            newImage.thumbnail = `${adapter.baseUrl}${image.thumbnail}`;
                                        }
                                        
                                        return newImage;
                                    });
                                    console.log('🖼️ 已修复图片文件路径，使用实际仓库文件');
                                }
                                
                                // 处理设置数据 - 修复头像路径但保留实际文件
                                if (url.includes('settings.json') && data.avatar) {
                                    if (data.avatar.startsWith('/uploads/')) {
                                        processedData = {
                                            ...data,
                                            avatar: `${adapter.baseUrl}${data.avatar}`
                                        };
                                        console.log('👤 已修复头像路径，使用实际仓库文件');
                                    }
                                }
                                
                                // 返回修改后的响应
                                return new Response(JSON.stringify(processedData), {
                                    status: response.status,
                                    statusText: response.statusText,
                                    headers: response.headers
                                });
                            });
                        }
                        return response;
                    });
                }
                
                return originalFetch(newUrl, options);
            }
            
            return originalFetch(url, options);
        };
        */
        
        console.log('🔧 已启用静态模式，路径修复由data-adapter.js处理');
    }
    
    // 显示静态模式提示
    showStaticModeNotice() {
        const notice = document.createElement('div');
        notice.id = 'static-mode-notice';
        notice.innerHTML = `
            <div style="
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 123, 255, 0.9);
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 10000;
                max-width: 250px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            ">
                <div style="font-weight: bold; margin-bottom: 5px;">📡 静态部署模式</div>
                <div style="opacity: 0.9;">部分功能受限，完整功能请访问本地版本</div>
            </div>
        `;
        
        document.body.appendChild(notice);
        
        // 5秒后自动隐藏
        setTimeout(() => {
            if (notice.parentNode) {
                notice.style.transition = 'opacity 0.5s';
                notice.style.opacity = '0';
                setTimeout(() => notice.remove(), 500);
            }
        }, 5000);
    }
    
    // 修复动态背景
    fixVideoBackground() {
        const videoElements = document.querySelectorAll('.video-background video, video');
        videoElements.forEach(video => {
            // 使用示例视频或禁用视频背景
            if (!video.src || video.src.includes('localhost') || video.src.includes('127.0.0.1')) {
                // 使用占位符图片替代视频背景
                const placeholder = document.createElement('div');
                placeholder.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    z-index: -1;
                `;
                
                if (video.parentNode) {
                    video.parentNode.insertBefore(placeholder, video);
                    video.style.display = 'none';
                }
                
                console.log('🎬 视频背景已替换为渐变背景（静态模式）');
            }
        });
        
        
        console.log('🎬 视频背景修复完成');
    }
    
    // 修复头像显示
    fixAvatars() {
        const avatars = document.querySelectorAll('.avatar, .user-avatar, [class*="avatar"]');
        avatars.forEach(avatar => {
            if (avatar.src && (avatar.src.includes('localhost') || avatar.src.includes('127.0.0.1'))) {
                // 使用默认头像
                avatar.src = 'https://via.placeholder.com/40x40/4CAF50/white?text=U';
                console.log('👤 已使用默认头像');
            }
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.githubPagesAdapter = new GitHubPagesAdapter();
    
    // 延迟执行一些修复，确保其他脚本已加载
    setTimeout(() => {
        if (window.githubPagesAdapter.isGitHubPages) {
            window.githubPagesAdapter.fixVideoBackground();
            window.githubPagesAdapter.fixAvatars();
        }
    }, 1000);
});

// 导出适配器
window.GitHubPagesAdapter = GitHubPagesAdapter;