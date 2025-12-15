// 热榜API配置
// 使用统一的 UAPIS 热榜API：https://uapis.cn/docs/api-reference/get-misc-hotboard

const HotlistAPIConfig = {
    // 抖音热搜配置
    douyin: {
        name: '抖音',
        icon: '📱',
        apiUrl: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://uapis.cn/api/v1/misc/hotboard?type=douyin'),
        apiType: 'douyin',
        method: 'GET',
        // 响应数据解析配置
        responseParser: {
            successCheck: (result) => result && result.list && Array.isArray(result.list),
            dataPath: 'list', // UAPIS 返回的数据在 list 字段
            itemMapping: {
                title: ['title'], // UAPIS 统一使用 title 字段
                url: ['url'],     // UAPIS 统一使用 url 字段
                hot: ['hot']      // UAPIS 统一使用 hot 字段
            }
        },
        // 默认链接模板（当API没有返回链接时使用）
        defaultUrlTemplate: (title) => `https://www.douyin.com/search/${encodeURIComponent(title)}`,
        // 模拟数据（API失败时使用）
        mockData: [
            { title: '抖音热搜榜 - 点击查看实时热搜', url: 'https://www.douyin.com/hot', hot: 1000000 }
        ]
    },

    // 微博热搜配置
    weibo: {
        name: '微博',
        icon: '🐦',
        apiUrl: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://uapis.cn/api/v1/misc/hotboard?type=weibo'),
        apiType: 'weibo',
        method: 'GET',
        responseParser: {
            successCheck: (result) => result && result.list && Array.isArray(result.list),
            dataPath: 'list',
            itemMapping: {
                title: ['title'],
                url: ['url'],
                hot: ['hot']
            }
        },
        defaultUrlTemplate: (title) => `https://s.weibo.com/weibo?q=${encodeURIComponent(title)}`,
        mockData: [
            { title: '微博热搜榜 - 点击查看实时热搜', url: 'https://s.weibo.com/top/summary', hot: 1000000 }
        ]
    },

    // 知乎热榜配置
    zhihu: {
        name: '知乎',
        icon: '🐧',
        apiUrl: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://uapis.cn/api/v1/misc/hotboard?type=zhihu'),
        apiType: 'zhihu',
        method: 'GET',
        responseParser: {
            successCheck: (result) => result && result.list && Array.isArray(result.list),
            dataPath: 'list',
            itemMapping: {
                title: ['title'],
                url: ['url'],
                hot: ['hot']
            }
        },
        defaultUrlTemplate: (title) => 'https://www.zhihu.com/',
        mockData: [
            { title: '知乎热榜 - 点击查看实时热搜', url: 'https://www.zhihu.com/hot', hot: 1000000 }
        ]
    },

    // 今日头条热榜配置
    toutiao: {
        name: '今日头条',
        icon: '📰',
        apiUrl: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://uapis.cn/api/v1/misc/hotboard?type=toutiao'),
        apiType: 'toutiao',
        method: 'GET',
        responseParser: {
            successCheck: (result) => result && result.list && Array.isArray(result.list),
            dataPath: 'list',
            itemMapping: {
                title: ['title'],
                url: ['url'],
                hot: ['hot']
            }
        },
        defaultUrlTemplate: (title) => `https://www.toutiao.com/search/?keyword=${encodeURIComponent(title)}`,
        mockData: [
            { title: '今日头条热榜 - 点击查看实时热搜', url: 'https://www.toutiao.com/', hot: 1000000 }
        ]
    },

    // B站热搜配置
    bilibili: {
        name: 'B站',
        icon: '📺',
        apiUrl: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://uapis.cn/api/v1/misc/hotboard?type=bilibili'),
        apiType: 'bilibili',
        method: 'GET',
        responseParser: {
            successCheck: (result) => result && result.list && Array.isArray(result.list),
            dataPath: 'list',
            itemMapping: {
                title: ['title'],
                url: ['url'],
                hot: ['hot']
            }
        },
        defaultUrlTemplate: (title) => 'https://www.bilibili.com/',
        mockData: [
            { title: 'B站热搜榜 - 点击查看实时热搜', url: 'https://www.bilibili.com/', hot: 1000000 }
        ]
    }
};

// 保存配置到localStorage
function saveHotlistConfig(config) {
    try {
        localStorage.setItem('hotlistAPIConfig', JSON.stringify(config));
        return true;
    } catch (error) {
        console.error('保存热榜配置失败:', error);
        return false;
    }
}

// 从localStorage加载配置
function loadHotlistConfig() {
    try {
        const saved = localStorage.getItem('hotlistAPIConfig');
        if (saved) {
            const savedConfig = JSON.parse(saved);
            // 深度合并：保存的配置覆盖默认配置
            const mergedConfig = {};
            
            // 先复制默认配置
            for (const key in HotlistAPIConfig) {
                mergedConfig[key] = JSON.parse(JSON.stringify(HotlistAPIConfig[key]));
            }
            
            // 用保存的配置覆盖
            for (const key in savedConfig) {
                if (mergedConfig[key]) {
                    // 只覆盖基本字段
                    if (savedConfig[key].apiUrl) {
                        mergedConfig[key].apiUrl = savedConfig[key].apiUrl;
                    }
                    if (savedConfig[key].method) {
                        mergedConfig[key].method = savedConfig[key].method;
                    }
                    if (savedConfig[key].responseParser && savedConfig[key].responseParser.dataPath) {
                        mergedConfig[key].responseParser.dataPath = savedConfig[key].responseParser.dataPath;
                    }
                }
            }
            
            return mergedConfig;
        }
    } catch (error) {
        console.error('加载热榜配置失败:', error);
    }
    return JSON.parse(JSON.stringify(HotlistAPIConfig)); // 返回深拷贝
}

// 重置为默认配置
function resetHotlistConfig() {
    localStorage.removeItem('hotlistAPIConfig');
    return HotlistAPIConfig;
}

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HotlistAPIConfig, saveHotlistConfig, loadHotlistConfig, resetHotlistConfig };
}
