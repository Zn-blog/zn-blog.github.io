// 综合热搜榜管理
class HotSearchManager {
    constructor() {
        this.container = null;
        this.currentType = 'douyin';
        this.cache = {}; // 缓存数据
        this.scrollAnimationId = null; // 滚动动画ID
        this.scrollDirection = 1; // 1: 向下, -1: 向上
        this.scrollSpeed = 1; // 滚动速度（像素/帧）
        this.isPaused = false; // 是否暂停
        this.config = this.loadConfig(); // 加载API配置
        this.init();
    }

    // 加载API配置
    loadConfig() {
        if (typeof loadHotlistConfig === 'function') {
            return loadHotlistConfig();
        }
        // 如果配置文件未加载，返回默认配置
        return null;
    }

    init() {
        this.container = document.getElementById('hotSearchList');
        if (this.container) {
            this.initTabs();
            this.loadHotSearch(this.currentType);
            // 每10分钟刷新一次当前榜单
            setInterval(() => this.loadHotSearch(this.currentType), 10 * 60 * 1000);
            // 初始化自动滚动
            this.initAutoScroll();
        }
    }

    initAutoScroll() {
        // 鼠标悬停时暂停滚动
        this.container.addEventListener('mouseenter', () => {
            this.stopAutoScroll();
        });

        // 鼠标离开时恢复滚动
        this.container.addEventListener('mouseleave', () => {
            this.startAutoScroll();
        });
    }

    startAutoScroll() {
        // 先停止已存在的动画
        if (this.scrollAnimationId) {
            cancelAnimationFrame(this.scrollAnimationId);
            this.scrollAnimationId = null;
        }

        // 检查是否需要滚动（内容高度大于容器高度）
        if (!this.container || this.container.scrollHeight <= this.container.clientHeight) {
            return;
        }

        this.isPaused = false;

        // 使用 requestAnimationFrame 实现丝滑滚动
        const scroll = () => {
            if (this.isPaused) {
                return;
            }

            const currentScroll = this.container.scrollTop;
            const maxScroll = this.container.scrollHeight - this.container.clientHeight;

            if (this.scrollDirection === 1) {
                // 向下滚动
                if (currentScroll >= maxScroll - 2) {
                    // 到达底部，改为向上滚动
                    this.scrollDirection = -1;
                } else {
                    this.container.scrollTop = currentScroll + this.scrollSpeed;
                }
            } else {
                // 向上滚动
                if (currentScroll <= 2) {
                    // 到达顶部，改为向下滚动
                    this.scrollDirection = 1;
                } else {
                    this.container.scrollTop = currentScroll - this.scrollSpeed;
                }
            }

            // 继续下一帧动画
            this.scrollAnimationId = requestAnimationFrame(scroll);
        };

        // 启动动画
        this.scrollAnimationId = requestAnimationFrame(scroll);
    }

    stopAutoScroll() {
        this.isPaused = true;
        if (this.scrollAnimationId) {
            cancelAnimationFrame(this.scrollAnimationId);
            this.scrollAnimationId = null;
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
            
            switch(type) {
                case 'douyin':
                    data = await this.fetchDouyinHot();
                    break;
                case 'weibo':
                    data = await this.fetchWeiboHot();
                    break;
                case 'tencent':
                    data = await this.fetchTencentHot();
                    break;
                case 'baidu':
                    data = await this.fetchBaiduHot();
                    break;
                case 'global':
                    data = await this.fetchGlobalHot();
                    break;
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

    showMockData(type) {
        const mockDataMap = {
            'douyin': [
                { title: '抖音热搜榜 - 点击查看实时热搜', url: 'https://www.douyin.com/hot', hot: 1000000 },
                { title: '热门话题1 - 这是一个很长的标题用于测试显示效果', url: 'https://www.douyin.com/', hot: 900000 },
                { title: '热门话题2 - 测试内容', url: 'https://www.douyin.com/', hot: 800000 },
                { title: '热门话题3 - 更多精彩内容', url: 'https://www.douyin.com/', hot: 700000 },
                { title: '热门话题4 - 持续关注', url: 'https://www.douyin.com/', hot: 600000 },
                { title: '热门话题5 - 最新动态', url: 'https://www.douyin.com/', hot: 550000 },
                { title: '热门话题6 - 热点新闻', url: 'https://www.douyin.com/', hot: 500000 },
                { title: '热门话题7 - 娱乐八卦', url: 'https://www.douyin.com/', hot: 450000 },
                { title: '热门话题8 - 科技前沿', url: 'https://www.douyin.com/', hot: 400000 },
                { title: '热门话题9 - 生活分享', url: 'https://www.douyin.com/', hot: 350000 },
                { title: '热门话题10 - 美食推荐', url: 'https://www.douyin.com/', hot: 300000 },
                { title: '热门话题11 - 旅游攻略', url: 'https://www.douyin.com/', hot: 280000 },
                { title: '热门话题12 - 时尚潮流', url: 'https://www.douyin.com/', hot: 260000 },
                { title: '热门话题13 - 健康养生', url: 'https://www.douyin.com/', hot: 240000 },
                { title: '热门话题14 - 教育学习', url: 'https://www.douyin.com/', hot: 220000 },
                { title: '热门话题15 - 财经资讯', url: 'https://www.douyin.com/', hot: 200000 }
            ],
            'weibo': [
                { title: '微博热搜榜 - 点击查看实时热搜', url: 'https://s.weibo.com/top/summary', hot: 1000000 },
                { title: '热门话题1 - 这是一个很长的标题用于测试显示效果', url: 'https://s.weibo.com/', hot: 900000 },
                { title: '热门话题2 - 测试内容', url: 'https://s.weibo.com/', hot: 800000 },
                { title: '热门话题3 - 更多精彩内容', url: 'https://s.weibo.com/', hot: 700000 },
                { title: '热门话题4 - 持续关注', url: 'https://s.weibo.com/', hot: 600000 },
                { title: '热门话题5 - 最新动态', url: 'https://s.weibo.com/', hot: 550000 },
                { title: '热门话题6 - 热点新闻', url: 'https://s.weibo.com/', hot: 500000 },
                { title: '热门话题7 - 娱乐八卦', url: 'https://s.weibo.com/', hot: 450000 },
                { title: '热门话题8 - 科技前沿', url: 'https://s.weibo.com/', hot: 400000 },
                { title: '热门话题9 - 生活分享', url: 'https://s.weibo.com/', hot: 350000 },
                { title: '热门话题10 - 美食推荐', url: 'https://s.weibo.com/', hot: 300000 },
                { title: '热门话题11 - 旅游攻略', url: 'https://s.weibo.com/', hot: 280000 },
                { title: '热门话题12 - 时尚潮流', url: 'https://s.weibo.com/', hot: 260000 },
                { title: '热门话题13 - 健康养生', url: 'https://s.weibo.com/', hot: 240000 },
                { title: '热门话题14 - 教育学习', url: 'https://s.weibo.com/', hot: 220000 },
                { title: '热门话题15 - 财经资讯', url: 'https://s.weibo.com/', hot: 200000 }
            ],
            'tencent': [
                { title: '腾讯热搜榜 - 点击查看实时热搜', url: 'https://new.qq.com/ch/hotlist/', hot: 1000000 },
                { title: '热门话题1 - 这是一个很长的标题用于测试显示效果', url: 'https://new.qq.com/', hot: 900000 },
                { title: '热门话题2 - 测试内容', url: 'https://new.qq.com/', hot: 800000 },
                { title: '热门话题3 - 更多精彩内容', url: 'https://new.qq.com/', hot: 700000 },
                { title: '热门话题4 - 持续关注', url: 'https://new.qq.com/', hot: 600000 },
                { title: '热门话题5 - 最新动态', url: 'https://new.qq.com/', hot: 550000 },
                { title: '热门话题6 - 热点新闻', url: 'https://new.qq.com/', hot: 500000 },
                { title: '热门话题7 - 娱乐八卦', url: 'https://new.qq.com/', hot: 450000 },
                { title: '热门话题8 - 科技前沿', url: 'https://new.qq.com/', hot: 400000 },
                { title: '热门话题9 - 生活分享', url: 'https://new.qq.com/', hot: 350000 },
                { title: '热门话题10 - 美食推荐', url: 'https://new.qq.com/', hot: 300000 },
                { title: '热门话题11 - 旅游攻略', url: 'https://new.qq.com/', hot: 280000 },
                { title: '热门话题12 - 时尚潮流', url: 'https://new.qq.com/', hot: 260000 },
                { title: '热门话题13 - 健康养生', url: 'https://new.qq.com/', hot: 240000 },
                { title: '热门话题14 - 教育学习', url: 'https://new.qq.com/', hot: 220000 },
                { title: '热门话题15 - 财经资讯', url: 'https://new.qq.com/', hot: 200000 }
            ],
            'baidu': [
                { title: '百度热搜榜 - 点击查看实时热搜', url: 'https://top.baidu.com/board?tab=realtime', hot: 1000000 },
                { title: '热门话题1 - 这是一个很长的标题用于测试显示效果', url: 'https://www.baidu.com/', hot: 900000 },
                { title: '热门话题2 - 测试内容', url: 'https://www.baidu.com/', hot: 800000 },
                { title: '热门话题3 - 更多精彩内容', url: 'https://www.baidu.com/', hot: 700000 },
                { title: '热门话题4 - 持续关注', url: 'https://www.baidu.com/', hot: 600000 },
                { title: '热门话题5 - 最新动态', url: 'https://www.baidu.com/', hot: 550000 },
                { title: '热门话题6 - 热点新闻', url: 'https://www.baidu.com/', hot: 500000 },
                { title: '热门话题7 - 娱乐八卦', url: 'https://www.baidu.com/', hot: 450000 },
                { title: '热门话题8 - 科技前沿', url: 'https://www.baidu.com/', hot: 400000 },
                { title: '热门话题9 - 生活分享', url: 'https://www.baidu.com/', hot: 350000 },
                { title: '热门话题10 - 美食推荐', url: 'https://www.baidu.com/', hot: 300000 },
                { title: '热门话题11 - 旅游攻略', url: 'https://www.baidu.com/', hot: 280000 },
                { title: '热门话题12 - 时尚潮流', url: 'https://www.baidu.com/', hot: 260000 },
                { title: '热门话题13 - 健康养生', url: 'https://www.baidu.com/', hot: 240000 },
                { title: '热门话题14 - 教育学习', url: 'https://www.baidu.com/', hot: 220000 },
                { title: '热门话题15 - 财经资讯', url: 'https://www.baidu.com/', hot: 200000 }
            ],
            'global': [
                { title: '全球热搜榜 - 点击查看实时热搜', url: 'https://www.zhihu.com/hot', hot: 1000000 },
                { title: '热门话题1 - 这是一个很长的标题用于测试显示效果', url: 'https://www.zhihu.com/', hot: 900000 },
                { title: '热门话题2 - 测试内容', url: 'https://www.zhihu.com/', hot: 800000 },
                { title: '热门话题3 - 更多精彩内容', url: 'https://www.zhihu.com/', hot: 700000 },
                { title: '热门话题4 - 持续关注', url: 'https://www.zhihu.com/', hot: 600000 },
                { title: '热门话题5 - 最新动态', url: 'https://www.zhihu.com/', hot: 550000 },
                { title: '热门话题6 - 热点新闻', url: 'https://www.zhihu.com/', hot: 500000 },
                { title: '热门话题7 - 娱乐八卦', url: 'https://www.zhihu.com/', hot: 450000 },
                { title: '热门话题8 - 科技前沿', url: 'https://www.zhihu.com/', hot: 400000 },
                { title: '热门话题9 - 生活分享', url: 'https://www.zhihu.com/', hot: 350000 },
                { title: '热门话题10 - 美食推荐', url: 'https://www.zhihu.com/', hot: 300000 },
                { title: '热门话题11 - 旅游攻略', url: 'https://www.zhihu.com/', hot: 280000 },
                { title: '热门话题12 - 时尚潮流', url: 'https://www.zhihu.com/', hot: 260000 },
                { title: '热门话题13 - 健康养生', url: 'https://www.zhihu.com/', hot: 240000 },
                { title: '热门话题14 - 教育学习', url: 'https://www.zhihu.com/', hot: 220000 },
                { title: '热门话题15 - 财经资讯', url: 'https://www.zhihu.com/', hot: 200000 }
            ]
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

    // 通用API调用方法（使用配置）
    async fetchHotlistByConfig(type) {
        if (!this.config || !this.config[type]) {
            console.error(`未找到${type}的配置`);
            return null;
        }

        const cfg = this.config[type];
        
        try {
            const response = await this.fetchWithTimeout(cfg.apiUrl);
            const result = await response.json();
            console.log(`${cfg.name}热搜数据:`, result);

            // 使用配置的成功检查函数
            if (cfg.responseParser.successCheck(result)) {
                // 获取数据数组
                const dataArray = result[cfg.responseParser.dataPath];
                
                if (Array.isArray(dataArray)) {
                    return dataArray.slice(0, 20).map(item => {
                        // 使用配置的字段映射
                        const getField = (fieldNames) => {
                            for (const field of fieldNames) {
                                if (item[field]) return item[field];
                            }
                            return null;
                        };

                        const title = getField(cfg.responseParser.itemMapping.title) || '未知';
                        const url = getField(cfg.responseParser.itemMapping.url) || cfg.defaultUrlTemplate(title);
                        const hot = getField(cfg.responseParser.itemMapping.hot) || 0;

                        return { title, url, hot };
                    });
                }
            }
        } catch (error) {
            console.error(`${cfg.name}热搜API失败:`, error);
        }
        return null;
    }

    async fetchDouyinHot() {
        // 优先使用配置，如果没有配置则使用默认API
        if (this.config) {
            return await this.fetchHotlistByConfig('douyin');
        }
        
        // 默认API（兼容旧版本）
        try {
            const response = await this.fetchWithTimeout('https://v2.xxapi.cn/api/douyinhot');
            const result = await response.json();
            console.log('抖音热搜数据:', result);
            if (result.code === 200 && result.data && Array.isArray(result.data)) {
                return result.data.slice(0, 20).map(item => ({
                    title: item.title || item.word || '未知',
                    url: item.url || item.link || `https://www.douyin.com/search/${encodeURIComponent(item.title || '')}`,
                    hot: item.hot || item.hot_value || 0
                }));
            }
        } catch (error) {
            console.error('抖音热搜API失败:', error);
        }
        return null;
    }

    async fetchWeiboHot() {
        return this.config ? await this.fetchHotlistByConfig('weibo') : null;
    }

    async fetchTencentHot() {
        return this.config ? await this.fetchHotlistByConfig('tencent') : null;
    }

    async fetchBaiduHot() {
        return this.config ? await this.fetchHotlistByConfig('baidu') : null;
    }

    async fetchGlobalHot() {
        return this.config ? await this.fetchHotlistByConfig('global') : null;
    }

    renderHotSearch(items) {
        if (!this.container || !items || items.length === 0) {
            this.showError('暂无数据');
            return;
        }

        // 按热度排序（如果有热度值）
        const sortedItems = items.sort((a, b) => {
            const hotA = parseInt(a.hot) || 0;
            const hotB = parseInt(b.hot) || 0;
            return hotB - hotA;
        });

        // 只显示前20条
        const topItems = sortedItems.slice(0, 20);

        const html = topItems.map((item, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `top${rank}` : '';
            
            // 判断标签
            let tagHtml = '';
            if (rank === 1) {
                tagHtml = '<span class="hot-search-tag hot">热</span>';
            } else if (rank <= 3) {
                tagHtml = '<span class="hot-search-tag new">新</span>';
            }

            const title = item.title || '未知标题';
            const url = item.url || '#';

            return `
                <a href="${url}" 
                   target="_blank" 
                   class="hot-search-item"
                   title="${title}">
                    <div class="hot-search-rank ${rankClass}">${rank}</div>
                    <div class="hot-search-content">
                        <span class="hot-search-title">${title}</span>
                        ${tagHtml}
                    </div>
                </a>
            `;
        }).join('');

        this.container.innerHTML = html;
        
        // 渲染完成后启动自动滚动
        setTimeout(() => {
            this.startAutoScroll();
        }, 500);
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
