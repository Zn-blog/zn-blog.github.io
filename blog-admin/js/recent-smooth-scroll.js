// 最近文章和最新评论的丝滑滚动效果 - 与热搜榜保持一致
class RecentListScroller {
    constructor(selector, speed = 1) {
        this.container = document.querySelector(selector);
        this.scrollSpeed = speed; // 滚动速度（像素/帧）
        this.scrollAnimationId = null;
        this.scrollDirection = 1; // 1: 向下, -1: 向上
        this.isPaused = false;
        
        if (this.container) {
            this.init();
        }
    }
    
    init() {
        // 鼠标悬停时暂停滚动
        this.container.addEventListener('mouseenter', () => {
            this.stopAutoScroll();
        });
        
        this.container.addEventListener('mouseleave', () => {
            this.startAutoScroll();
        });
        
        // 开始自动滚动
        this.startAutoScroll();
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

        // 使用 requestAnimationFrame 实现丝滑滚动 - 与热搜榜一致
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
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 等待数据渲染完成后再初始化滚动
    setTimeout(() => {
        // 初始化最近文章滚动 - 速度设置为3
        new RecentListScroller('#page-dashboard .dashboard-grid .dashboard-card:first-child .recent-list', 3);
        
        // 初始化最新评论滚动 - 速度设置为3
        new RecentListScroller('#page-dashboard .dashboard-grid .dashboard-card:last-child .recent-list', 3);
    }, 1000); // 延迟1秒确保数据已加载
});
