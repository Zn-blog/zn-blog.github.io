// 页脚统计信息（使用数据存储）
class FooterStats {
    constructor() {
        this.init();
    }

    async init() {
        await this.updateStats();
        this.startRunningTimeCounter();
        
        // 增加访问统计
        await this.incrementPageView();
        await this.incrementVisitor();
    }

    // 更新统计数据
    async updateStats() {
        if (window.blogDataStore) {
            const stats = await window.blogDataStore.getStats();
            
            // 更新总字数
            document.getElementById('totalWords').textContent = this.formatNumber(stats.totalWords);
            
            // 更新总访问量
            document.getElementById('totalViews').textContent = this.formatNumber(stats.totalViews);
            
            // 更新访问人数
            document.getElementById('totalVisitors').textContent = this.formatNumber(stats.totalVisitors);
            
            // 更新运行时长
            this.updateRunningTime();
        }
    }

    // 格式化数字（添加千位分隔符）
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // 计算运行时长（异步）
    async calculateRunningTime() {
        if (!window.blogDataStore) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        
        const settings = await window.blogDataStore.getSettings();
        const startDateStr = settings.startDate || '2025-01-01';
        const startDate = new Date(startDateStr);
        
        // 🔥 检查日期是否有效
        if (isNaN(startDate.getTime())) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        
        const now = new Date();
        const diff = now - startDate;
        
        // 如果差值为负数，返回0
        if (diff < 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return { days, hours, minutes, seconds };
    }

    // 更新运行时长显示（异步）
    async updateRunningTime() {
        const time = await this.calculateRunningTime();
        const runningTimeElement = document.getElementById('runningTime');
        
        if (!runningTimeElement) return;
        
        if (time.days > 0) {
            runningTimeElement.textContent = `${time.days}天${time.hours}时`;
        } else if (time.hours > 0) {
            runningTimeElement.textContent = `${time.hours}时${time.minutes}分`;
        } else {
            runningTimeElement.textContent = `${time.minutes}分${time.seconds}秒`;
        }
    }

    // 启动运行时长计时器
    startRunningTimeCounter() {
        // 立即更新一次
        this.updateRunningTime();
        
        // 每秒更新一次运行时长
        setInterval(() => {
            this.updateRunningTime();
        }, 1000);
    }
    
    // 增加访问次数（页面加载时调用）
    async incrementPageView() {
        try {
            const response = await fetch('http://localhost:3001/api/stats/pageview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ 访问次数已更新:', result.data.totalViews);
                // 更新显示
                await this.updateStats();
            }
        } catch (error) {
            console.error('❌ 更新访问次数失败:', error);
        }
    }
    
    // 增加访问人数（使用 cookie 判断是否新访客）
    async incrementVisitor() {
        // 检查是否已访问过（24小时内）
        const visited = localStorage.getItem('blog_visited');
        const lastVisit = localStorage.getItem('blog_last_visit');
        const now = Date.now();
        
        // 如果从未访问，或距离上次访问超过24小时，则计为新访客
        if (!visited || !lastVisit || (now - parseInt(lastVisit)) > 24 * 60 * 60 * 1000) {
            try {
                const response = await fetch('http://localhost:3001/api/stats/visitor', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ 访问人数已更新:', result.data.totalVisitors);
                    
                    // 标记为已访问
                    localStorage.setItem('blog_visited', 'true');
                    localStorage.setItem('blog_last_visit', now.toString());
                    
                    // 更新显示
                    await this.updateStats();
                }
            } catch (error) {
                console.error('❌ 更新访问人数失败:', error);
            }
        }
    }
}

// 初始化页脚统计
document.addEventListener('DOMContentLoaded', function() {
    new FooterStats();
});
