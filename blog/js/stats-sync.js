// 统计信息同步脚本
// 用于在所有页面显示统一的统计信息

class StatsSync {
    constructor() {
        this.init();
    }

    init() {
        // 等待数据存储加载完成
        if (window.blogDataStore) {
            this.updateAllStats();
            this.startAutoUpdate();
        } else {
            // 如果数据存储还未加载，等待一下
            setTimeout(() => this.init(), 100);
        }
    }

    // 更新所有统计信息
    async updateAllStats() {
        const stats = await window.blogDataStore.getStats();
        
        // 更新总字数
        this.updateElement('totalWords', stats.totalWords);
        
        // 更新总访问量
        this.updateElement('totalViews', stats.totalViews);
        
        // 更新访问人数
        this.updateElement('totalVisitors', stats.totalVisitors);
        
        // 更新运行时长
        await this.updateRunningTime(stats.runningDays);
    }

    // 更新单个元素
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = this.formatNumber(value);
        }
    }

    // 更新运行时长（异步）
    async updateRunningTime(days) {
        const element = document.getElementById('runningTime');
        if (!element) return;

        const settings = await window.blogDataStore.getSettings();
        const startDate = new Date(settings.startDate);
        const now = new Date();
        const diff = now - startDate;
        
        const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (totalDays > 0) {
            element.textContent = `${totalDays}天${hours}时`;
        } else if (hours > 0) {
            element.textContent = `${hours}时${minutes}分`;
        } else {
            element.textContent = `${minutes}分${seconds}秒`;
        }
    }

    // 格式化数字
    formatNumber(num) {
        return num.toLocaleString();
    }

    // 启动自动更新（每秒更新运行时长）
    startAutoUpdate() {
        setInterval(async () => {
            const stats = await window.blogDataStore.getStats();
            this.updateRunningTime(stats.runningDays);
        }, 1000);
    }

    // 增加访问量（可在文章详情页调用）
    incrementViews(articleId = null) {
        window.blogDataStore.incrementViews(articleId);
        this.updateAllStats();
    }

    // 增加访客数（可在首次访问时调用）
    incrementVisitors() {
        const data = window.blogDataStore.getAllData();
        data.settings.totalVisitors++;
        window.blogDataStore.saveAllData(data);
        this.updateAllStats();
    }
}

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    window.statsSync = new StatsSync();
});
