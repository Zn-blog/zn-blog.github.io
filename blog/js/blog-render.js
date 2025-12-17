// 博客前台渲染脚本
let currentPage = 1;
let articlesPerPage = 10; // 默认每页10篇
let allArticles = [];

document.addEventListener('DOMContentLoaded', async function() {
    // 等待数据适配器就绪
    function initWhenReady() {
        if (window.blogDataStore && window.blogDataStore.adapter) {
            initBlogRender();
        } else {
            setTimeout(initWhenReady, 100);
        }
    }
    
    // 监听数据适配器就绪事件
    document.addEventListener('dataAdapterReady', function() {
        initBlogRender();
    });
    
    async function initBlogRender() {
        try {
            await loadSettings();
            await renderArticles();
            updateFooterStats();
            console.log('✅ 博客渲染器已初始化');
        } catch (error) {
            console.error('❌ 博客渲染器初始化失败:', error);
        }
    }
    
    initWhenReady();
});

// 加载设置
async function loadSettings() {
    try {
        const settings = await window.blogDataStore.getSettings();
        if (settings && settings.postsPerPage && settings.postsPerPage > 0) {
            articlesPerPage = settings.postsPerPage;
            console.log(`✅ 每页文章数设置为: ${articlesPerPage}`);
        }
    } catch (error) {
        console.error('加载设置失败，使用默认值:', error);
    }
}

// 渲染文章列表（异步）
async function renderArticles() {
    const articlesGrid = document.getElementById('articlesGrid');
    if (!articlesGrid) return;

    // 显示加载状态
    articlesGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #999;">加载中...</div>';

    try {
        allArticles = await window.blogDataStore.getArticles('published');
        
        if (allArticles.length === 0) {
            articlesGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #999;">暂无文章</div>';
            return;
        }
        
        // 计算分页
        const totalPages = Math.ceil(allArticles.length / articlesPerPage);
        const startIndex = (currentPage - 1) * articlesPerPage;
        const endIndex = startIndex + articlesPerPage;
        const currentArticles = allArticles.slice(startIndex, endIndex);
        
        // 渲染当前页文章
        articlesGrid.innerHTML = currentArticles.map(article => {
            // 直接使用图片路径
            const imagePath = article.image || 'https://via.placeholder.com/400x250/4fc3f7/ffffff?text=No+Image';
            
            return `
            <article class="article-card">
                <div class="article-image">
                    <img src="${imagePath}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/400x250/4fc3f7/ffffff?text=No+Image'">
                    <span class="article-category">${article.category}</span>
                </div>
                <div class="article-content">
                    <div class="article-header">
                        <h3>${article.title}</h3>
                        <p class="article-date">📅 ${article.publishDate}</p>
                    </div>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <a href="#" class="read-more" onclick="viewArticle(${article.id}); return false;">阅读更多 →</a>
                </div>
            </article>
            `;
        }).join('');
        
        // 渲染分页
        renderPagination(totalPages);
    } catch (error) {
        console.error('加载文章失败:', error);
        articlesGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #f44336;">加载文章失败，请刷新页面重试</div>';
    }
}

// 渲染分页
function renderPagination(totalPages) {
    // 查找或创建分页容器
    let paginationContainer = document.querySelector('.pagination-container');
    
    if (!paginationContainer) {
        // 在文章列表后创建分页容器
        const articlesSection = document.querySelector('.articles-section');
        if (articlesSection) {
            paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-container';
            articlesSection.appendChild(paginationContainer);
        } else {
            return;
        }
    }
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="pagination">';
    
    // 上一页
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">上一页</button>`;
    }
    
    // 页码
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="page-btn active">${i}</button>`;
        } else {
            paginationHTML += `<button class="page-btn" onclick="goToPage(${i})">${i}</button>`;
        }
    }
    
    // 下一页
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">下一页</button>`;
    }
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

// 跳转到指定页面
function goToPage(page) {
    currentPage = page;
    renderArticles();
    
    // 滚动到文章区域
    const articlesSection = document.getElementById('articles');
    if (articlesSection) {
        articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// 暴露到全局作用域，供HTML onclick使用
window.goToPage = goToPage;

// 查看文章详情
function viewArticle(id) {
    window.location.href = `pages/article.html?id=${id}`;
}

// 更新页脚统计（异步）
async function updateFooterStats() {
    try {
        const stats = await window.blogDataStore.getStats();
        
        const totalWordsEl = document.getElementById('totalWords');
        const totalViewsEl = document.getElementById('totalViews');
        const totalVisitorsEl = document.getElementById('totalVisitors');
        const runningTimeEl = document.getElementById('runningTime');

        if (totalWordsEl) {
            animateNumber(totalWordsEl, 0, stats.totalWords, 2000);
        }
        if (totalViewsEl) {
            animateNumber(totalViewsEl, 0, stats.totalViews, 2000);
        }
        if (totalVisitorsEl) {
            animateNumber(totalVisitorsEl, 0, stats.totalVisitors, 2000);
        }
        if (runningTimeEl) {
            animateNumber(runningTimeEl, 0, stats.runningDays, 2000, '天');
        }
    } catch (error) {
        console.error('加载统计数据失败:', error);
    }
}

// 数字动画
function animateNumber(element, start, end, duration, suffix = '') {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString() + suffix;
    }, 16);
}
