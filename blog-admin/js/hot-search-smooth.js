// 综合热搜榜管理 - 丝滑滚动版本
class HotSearchManager {
    constructor() {
        this.container = null;
        this.currentType = 'douyin';
        this.cache = {}; // 缓存数据
        this.autoScrollInterval = null; // 滚动动画ID
        this.scrollMouseEnter = null; // 鼠标进入事件
        this.scrollMouseLeave = null; // 鼠标离开事件
        this.init();
    }

    init() {
        this.container = document.getElementById('hotSearchList');
        if (this.container) {
            this.initTabs();
            this.loadHotSearch(this.currentType);
            // 每10分钟刷新一次当前榜单
            setInterval(() => this.loadHotSearch(this.currentType), 10 * 60 * 1000);
        }
    }

    initTabs() {
        const tabs = document.querySelectorAll('.hot-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 移除所有active类
                tabs.forEach(t => t.classList.remove('active'));
                // 添加当前active类
                tab.classList.add('active');
                // 切换榜单
                const type = tab.getAttribute('data-type');
                this.currentType = type;
                this.loadHotSearch(type);
            });
        });
    }

    async loadHotSearch(type) {
        // 如果有缓存且未过期（5分钟），直接使用
        if (this.cache[type] && Date.now() - this.cache[type].time < 5 * 60 * 1000) {
            this.renderHotSearch(this.cache[type].data);
            return;
        }

        this.showLoading();

        try {
            let data = null;
            
            // 优先使用配置的API
            const config = this.getConfig(type);
            if (config && config.apiUrl) {
                console.log(`使用配置的API: ${config.apiUrl}`);
                data = await this.fetchWithConfig(config);
            } else {
                // 使用默认的统一API
                switch(type) {
                    case 'douyin':
                        data = await this.fetchDouyinHot();
                        break;
                    case 'weibo':
                        data = await this.fetchWeiboHot();
                        break;
                    case 'zhihu':
                    case 'tencent': // 兼容旧配置
                        data = await this.fetchTencentHot();
                        break;
                    case 'toutiao':
                    case 'baidu': // 兼容旧配置，映射到今日头条
                        data = await this.fetchToutiaoHot();
                        break;
                    case 'bilibili':
                    case 'global': // 兼容旧配置
                        data = await this.fetchGlobalHot();
                        break;
                }
            }

            if (data && data.length > 0) {
                // 缓存数据
                this.cache[type] = {
                    data: data,
                    time: Date.now()
                };
                this.renderHotSearch(data);
            } else {
                // 使用模拟数据
                this.showMockData(type);
            }
        } catch (error) {
            console.error('获取热搜失败:', error);
            // 使用模拟数据
            this.showMockData(type);
        }
    }

    // 获取配置（优先使用localStorage中的配置）
    getConfig(type) {
        try {
            // 尝试从localStorage加载配置
            const savedConfig = localStorage.getItem('hotlistAPIConfig');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                if (config[type]) {
                    // 检查是否是旧的API（非UAPIS）
                    if (config[type].apiUrl && 
                        (config[type].apiUrl.includes('v2.xxapi.cn') || 
                         config[type].apiUrl.includes('tenapi.cn') ||
                         config[type].apiUrl.includes('api.vvhan.com') ||
                         config[type].apiUrl.includes('localhost:3001'))) {
                        console.log(`⚠️ 检测到${type}使用旧API配置，使用默认UAPIS配置`);
                        // 使用默认配置（UAPIS）
                        if (typeof HotlistAPIConfig !== 'undefined' && HotlistAPIConfig[type]) {
                            return HotlistAPIConfig[type];
                        }
                    }
                    return config[type];
                }
            }
            
            // 使用默认配置
            if (typeof HotlistAPIConfig !== 'undefined' && HotlistAPIConfig[type]) {
                return HotlistAPIConfig[type];
            }
        } catch (error) {
            console.error('获取配置失败:', error);
        }
        return null;
    }

    // 使用配置获取热榜数据
    async fetchWithConfig(config) {
        try {
            const response = await this.fetchWithTimeout(config.apiUrl);
            const result = await response.json();
            
            // 使用配置的数据路径
            const dataPath = config.responseParser.dataPath;
            let list = result;
            
            // 支持嵌套路径，如 "data.list"
            if (dataPath) {
                const paths = dataPath.split('.');
                for (const path of paths) {
                    if (list && list[path]) {
                        list = list[path];
                    } else {
                        console.error(`数据路径 ${dataPath} 不存在`);
                        return null;
                    }
                }
            }
            
            // 检查是否是数组
            if (!Array.isArray(list)) {
                console.error('数据不是数组格式');
                return null;
            }
            
            // 映射字段（显示全部数据）
            return list.map(item => ({
                title: item.title || item.word || '未知',
                url: item.url || item.link || '#',
                hot: item.hot || item.hot_value || 0
            }));
        } catch (error) {
            console.error('使用配置获取热榜失败:', error);
            return null;
        }
    }

    showMockData(type) {
        const mockDataMap = {
            'douyin': Array.from({length: 15}, (_, i) => ({
                title: `抖音热搜 ${i + 1} - 测试内容`,
                url: 'https://www.douyin.com/',
                hot: 1000000 - i * 50000
            })),
            'weibo': Array.from({length: 15}, (_, i) => ({
                title: `微博热搜 ${i + 1} - 测试内容`,
                url: 'https://s.weibo.com/',
                hot: 1000000 - i * 50000
            })),
            'zhihu': Array.from({length: 15}, (_, i) => ({
                title: `知乎热搜 ${i + 1} - 测试内容`,
                url: 'https://www.zhihu.com/',
                hot: 1000000 - i * 50000
            })),
            'tencent': Array.from({length: 15}, (_, i) => ({
                title: `知乎热搜 ${i + 1} - 测试内容`,
                url: 'https://new.qq.com/',
                hot: 1000000 - i * 50000
            })),
            'toutiao': Array.from({length: 15}, (_, i) => ({
                title: `今日头条热搜 ${i + 1} - 测试内容`,
                url: 'https://www.toutiao.com/',
                hot: 1000000 - i * 50000
            })),
            'baidu': Array.from({length: 15}, (_, i) => ({
                title: `今日头条热搜 ${i + 1} - 测试内容`,
                url: 'https://www.toutiao.com/',
                hot: 1000000 - i * 50000
            })),
            'bilibili': Array.from({length: 15}, (_, i) => ({
                title: `B站热搜 ${i + 1} - 测试内容`,
                url: 'https://www.bilibili.com/',
                hot: 1000000 - i * 50000
            })),
            'global': Array.from({length: 15}, (_, i) => ({
                title: `B站热搜 ${i + 1} - 测试内容`,
                url: 'https://www.bilibili.com/',
                hot: 1000000 - i * 50000
            }))
        };

        const mockData = mockDataMap[type] || mockDataMap['weibo'];
        this.renderHotSearch(mockData);
    }

    async fetchWithTimeout(url, timeout = 5000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                mode: 'cors'
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    // 通用的热榜获取方法 - 直接使用UAPIS API
    async fetchHotboard(type) {
        try {
            // 直接调用UAPIS API
            const apiUrl = `https://uapis.cn/api/v1/misc/hotboard?type=${type}`;
            console.log(`📡 请求热榜API: ${apiUrl}`);
            
            const response = await this.fetchWithTimeout(apiUrl);
            const result = await response.json();
            
            // UAPIS 返回格式：{ list: [...], type: "xxx", update_time: "xxx" }
            if (result && result.list && Array.isArray(result.list)) {
                console.log(`✅ 获取${type}热榜成功，共${result.list.length}条`);
                return result.list.map(item => ({
                    title: item.title || '未知',
                    url: item.url || '#',
                    hot: item.hot || 0
                }));
            }
        } catch (error) {
            console.error(`${type}热搜API失败:`, error);
        }
        return null;
    }

    async fetchDouyinHot() {
        return await this.fetchHotboard('douyin');
    }

    async fetchWeiboHot() {
        return await this.fetchHotboard('weibo');
    }

    async fetchTencentHot() {
        // 知乎热榜
        return await this.fetchHotboard('zhihu');
    }

    async fetchToutiaoHot() {
        return await this.fetchHotboard('toutiao');
    }

    async fetchBaiduHot() {
        // 兼容旧配置，映射到今日头条
        return await this.fetchHotboard('toutiao');
    }

    async fetchGlobalHot() {
        // B站热榜
        return await this.fetchHotboard('bilibili');
    }

    renderHotSearch(items) {
        if (!this.container || !items || items.length === 0) {
            this.showError('暂无数据');
            return;
        }

        const sortedItems = items.sort((a, b) => {
            const hotA = parseInt(a.hot) || 0;
            const hotB = parseInt(b.hot) || 0;
            return hotB - hotA;
        });

        // 显示全部数据
        const html = sortedItems.map((item, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `top${rank}` : '';
            
            let tagHtml = '';
            if (rank === 1) {
                tagHtml = '<span class="hot-search-tag hot">热</span>';
            } else if (rank <= 3) {
                tagHtml = '<span class="hot-search-tag new">新</span>';
            }

            const title = item.title || '未知标题';
            const url = item.url && item.url !== '#' ? item.url : null;

            // 如果有URL，生成可点击的链接；否则只显示文本
            if (url) {
                return `
                    <a href="${url}" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       class="hot-search-item"
                       title="${title}">
                        <div class="hot-search-rank ${rankClass}">${rank}</div>
                        <div class="hot-search-content">
                            <span class="hot-search-title">${title}</span>
                            ${tagHtml}
                        </div>
                    </a>
                `;
            } else {
                return `
                    <div class="hot-search-item" title="${title}">
                        <div class="hot-search-rank ${rankClass}">${rank}</div>
                        <div class="hot-search-content">
                            <span class="hot-search-title">${title}</span>
                            ${tagHtml}
                        </div>
                    </div>
                `;
            }
        }).join('');

        this.container.innerHTML = html;
        
        // 渲染完成后启动自动滚动
        setTimeout(() => {
            this.startAutoScroll();
        }, 100);
    }

    startAutoScroll() {
        const container = this.container;
        if (!container) {
            return;
        }
        
        // 停止之前的滚动
        if (this.autoScrollInterval) {
            cancelAnimationFrame(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
        
        // 检查是否真的需要滚动
        const maxScroll = container.scrollHeight - container.clientHeight;
        
        if (maxScroll <= 0) {
            return;
        }
        
        let direction = 1; // 1: 向下, -1: 向上
        let isPaused = false;
        const speed = 1; // 滚动速度（像素/帧）
        
        // 移除旧的事件监听器（如果存在）
        if (this.scrollMouseEnter) {
            container.removeEventListener('mouseenter', this.scrollMouseEnter);
        }
        if (this.scrollMouseLeave) {
            container.removeEventListener('mouseleave', this.scrollMouseLeave);
        }
        
        // 创建新的事件监听器
        this.scrollMouseEnter = () => {
            isPaused = true;
        };
        
        this.scrollMouseLeave = () => {
            isPaused = false;
        };
        
        container.addEventListener('mouseenter', this.scrollMouseEnter);
        container.addEventListener('mouseleave', this.scrollMouseLeave);
        
        const scroll = () => {
            if (!isPaused && container) {
                const maxScroll = container.scrollHeight - container.clientHeight;
                const currentScroll = container.scrollTop;
                
                // 使用单边界检测，留2px容差
                if (direction === 1) {
                    // 向下滚动
                    if (currentScroll >= maxScroll - 2) {
                        // 到达底部，切换方向
                        direction = -1;
                    } else {
                        container.scrollTop += speed;
                    }
                } else {
                    // 向上滚动
                    if (currentScroll <= 2) {
                        // 到达顶部，切换方向
                        direction = 1;
                    } else {
                        container.scrollTop -= speed;
                    }
                }
            }
            
            this.autoScrollInterval = requestAnimationFrame(scroll);
        };
        
        this.autoScrollInterval = requestAnimationFrame(scroll);
    }

    showLoading() {
        if (this.container) {
            this.container.innerHTML = '<div class="loading-text">加载中...</div>';
        }
    }

    showError(message) {
        if (this.container) {
            this.container.innerHTML = `<div class="error-text">${message}</div>`;
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.hotSearchManager = new HotSearchManager();
});
