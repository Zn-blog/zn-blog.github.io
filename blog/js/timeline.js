/* ========================================
   时光轴功能
   ======================================== */

let currentView = 'list';
let articlesData = [];

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== 时光轴页面初始化 ===');
    try {
        await loadArticlesData();
        console.log('文章数据加载完成，共', articlesData.length, '篇');
        
        renderCalendar();
        console.log('日历渲染完成');
        
        renderListView();
        console.log('列表视图渲染完成');
        
        loadSiteAvatar();
        console.log('头像加载完成');
    } catch (error) {
        console.error('初始化错误:', error);
    }
});

// 加载文章数据（异步）
async function loadArticlesData() {
    console.log('loadArticlesData: 开始加载文章数据');
    
    if (!window.blogDataStore) {
        console.error('loadArticlesData: blogDataStore 未定义！');
        articlesData = [];
        return;
    }
    
    try {
        const allArticles = await window.blogDataStore.getArticles('published');
        console.log('loadArticlesData: 获取到的文章', allArticles);
        
        if (!allArticles || allArticles.length === 0) {
            console.warn('loadArticlesData: 没有已发布的文章');
            articlesData = [];
            return;
        }
        
        articlesData = allArticles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        console.log('loadArticlesData: 排序后的文章数据', articlesData);
    } catch (error) {
        console.error('loadArticlesData: 加载失败', error);
        articlesData = [];
    }
}

// 渲染文章日历
function renderCalendar() {
    console.log('renderCalendar: 开始渲染日历');
    console.log('renderCalendar: articlesData长度', articlesData.length);
    
    const calendar = document.getElementById('articleCalendar');
    
    if (!calendar) {
        console.error('renderCalendar: 找不到日历容器元素 #articleCalendar');
        return;
    }
    
    if (articlesData.length === 0) {
        console.warn('renderCalendar: articlesData为空，显示提示信息');
        calendar.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #999;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                <h3>暂无文章数据</h3>
                <p style="margin-top: 1rem;">请先在后台发布一些文章</p>
            </div>
        `;
        return;
    }
    
    const articlesByDate = {};
    
    // 统计每天的文章数量
    articlesData.forEach(article => {
        const date = article.publishDate; // 格式: YYYY-MM-DD
        if (!articlesByDate[date]) {
            articlesByDate[date] = 0;
        }
        articlesByDate[date]++;
    });
    
    console.log('renderCalendar: 按日期统计', articlesByDate);
    
    // 按年份分组
    const articlesByYear = {};
    articlesData.forEach(article => {
        const year = article.publishDate.split('-')[0];
        if (!articlesByYear[year]) {
            articlesByYear[year] = [];
        }
        articlesByYear[year].push(article);
    });
    
    console.log('renderCalendar: 按年份分组', articlesByYear);
    
    // 生成日历HTML
    let calendarHTML = '<div class="calendar-container">';
    
    Object.keys(articlesByYear).sort((a, b) => b - a).forEach(year => {
        calendarHTML += `
            <div class="calendar-year">
                <div class="calendar-year-title">${year}年</div>
                ${renderYearCalendar(year, articlesByDate)}
            </div>
        `;
    });
    
    calendarHTML += '</div>';
    calendar.innerHTML = calendarHTML;
    console.log('日历HTML已设置，年份数:', Object.keys(articlesByYear).length);
}

// 渲染年度日历（GitHub风格）
function renderYearCalendar(year, articlesByDate) {
    try {
        // 确保year是数字
        year = parseInt(year);
        if (isNaN(year)) {
            console.error('renderYearCalendar: 无效的年份', year);
            return '<div style="color: red;">年份参数无效</div>';
        }
        
        const monthNames = ['四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月', '一月', '二月', '三月'];
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        
        // 计算从4月1日到次年3月31日的所有日期
        const startDate = new Date(year, 3, 1); // 4月1日
        const endDate = new Date(year + 1, 3, 0); // 次年3月31日
        
        console.log(`渲染${year}年日历，从${startDate.toLocaleDateString()}到${endDate.toLocaleDateString()}`);
    
    // 计算需要多少周
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const totalWeeks = Math.ceil(totalDays / 7);
    
    // 创建日期网格 [周][天]
    const grid = [];
    let currentDate = new Date(startDate);
    
    for (let week = 0; week < totalWeeks; week++) {
        const weekData = [];
        for (let day = 0; day < 7; day++) {
            if (currentDate <= endDate) {
                weekData.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            } else {
                weekData.push(null);
            }
        }
        grid.push(weekData);
    }
    
    let html = `
        <div class="github-calendar">
            <div class="github-calendar-graph">
                <div class="github-calendar-months">
                    <div class="github-calendar-month-spacer"></div>
    `;
    
    // 月份标签
    let lastMonth = -1;
    let monthStartWeek = 0;
    for (let week = 0; week < grid.length; week++) {
        const firstDay = grid[week][0];
        if (firstDay) {
            const month = firstDay.getMonth();
            if (month !== lastMonth) {
                if (lastMonth !== -1) {
                    const monthWidth = (week - monthStartWeek) * 14;
                    // 月份索引映射：0=1月, 1=2月, ..., 3=4月, ..., 11=12月
                    // 我们的数组：['四月', '五月', ..., '一月', '二月', '三月']
                    // 需要将月份索引映射到数组索引
                    let monthIndex;
                    if (month >= 3) { // 4月(3)到12月(11)
                        monthIndex = month - 3;
                    } else { // 1月(0)到3月(2)
                        monthIndex = month + 9;
                    }
                    html += `<div class="github-calendar-month" style="width: ${monthWidth}px;">${monthNames[monthIndex]}</div>`;
                }
                lastMonth = month;
                monthStartWeek = week;
            }
        }
    }
    // 最后一个月
    if (lastMonth !== -1) {
        const monthWidth = (grid.length - monthStartWeek) * 14;
        let monthIndex;
        if (lastMonth >= 3) {
            monthIndex = lastMonth - 3;
        } else {
            monthIndex = lastMonth + 9;
        }
        html += `<div class="github-calendar-month" style="width: ${monthWidth}px;">${monthNames[monthIndex]}</div>`;
    }
    
    html += `
                </div>
                <div class="github-calendar-body">
                    <div class="github-calendar-weekdays">
    `;
    
    // 星期标签（只显示一、三、五）
    for (let i = 0; i < 7; i++) {
        if (i === 1 || i === 3 || i === 5) {
            html += `<div class="github-calendar-weekday">${weekDays[i]}</div>`;
        } else {
            html += `<div class="github-calendar-weekday"></div>`;
        }
    }
    
    html += `
                    </div>
                    <div class="github-calendar-weeks">
    `;
    
    // 渲染每一周
    for (let week = 0; week < grid.length; week++) {
        html += '<div class="github-calendar-week">';
        
        for (let day = 0; day < 7; day++) {
            const date = grid[week][day];
            
            if (date) {
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const count = articlesByDate[dateStr] || 0;
                
                let levelClass = 'level-0';
                if (count > 0) {
                    if (count === 1) levelClass = 'level-1';
                    else if (count === 2) levelClass = 'level-2';
                    else if (count === 3) levelClass = 'level-3';
                    else levelClass = 'level-4';
                }
                
                const title = count > 0 ? `${date.getMonth() + 1}月${date.getDate()}日 - ${count}篇文章` : `${date.getMonth() + 1}月${date.getDate()}日`;
                
                html += `
                    <div class="github-calendar-day ${levelClass}" 
                         data-date="${dateStr}"
                         data-count="${count}"
                         title="${title}"
                         ${count > 0 ? `onclick="filterByDate('${dateStr}')"` : ''}></div>
                `;
            } else {
                html += '<div class="github-calendar-day empty"></div>';
            }
        }
        
        html += '</div>';
    }
    
    html += `
                    </div>
                </div>
            </div>
            <div class="github-calendar-legend">
                <span>少</span>
                <div class="github-calendar-legend-item level-0"></div>
                <div class="github-calendar-legend-item level-1"></div>
                <div class="github-calendar-legend-item level-2"></div>
                <div class="github-calendar-legend-item level-3"></div>
                <div class="github-calendar-legend-item level-4"></div>
                <span>多</span>
            </div>
        </div>
    `;
    
        console.log(`${year}年日历HTML生成完成，长度:`, html.length);
        return html;
    } catch (error) {
        console.error('renderYearCalendar错误:', error);
        return `<div style="color: red; padding: 1rem;">日历渲染错误: ${error.message}</div>`;
    }
}

// 按日期筛选（可选功能）
function filterByDate(date) {
    const articles = articlesData.filter(article => article.publishDate === date);
    if (articles.length > 0) {
        // 滚动到时间列表并高亮
        switchView('list');
        setTimeout(() => {
            const element = document.querySelector(`[data-date="${date}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.style.background = '#fff3cd';
                setTimeout(() => {
                    element.style.background = '';
                }, 2000);
            }
        }, 300);
    }
}

// 切换视图
function switchView(view) {
    currentView = view;
    
    const listViewBtn = document.getElementById('listViewBtn');
    const timelineViewBtn = document.getElementById('timelineViewBtn');
    const listView = document.getElementById('listView');
    const timelineView = document.getElementById('timelineView');
    
    if (view === 'list') {
        listViewBtn.style.background = 'linear-gradient(135deg, #4fc3f7 0%, #2c5f7c 100%)';
        listViewBtn.style.color = 'white';
        listViewBtn.style.borderColor = 'transparent';
        listViewBtn.style.boxShadow = '0 2px 8px rgba(79, 195, 247, 0.3)';
        
        timelineViewBtn.style.background = 'white';
        timelineViewBtn.style.color = '#2c5f7c';
        timelineViewBtn.style.borderColor = '#e0e0e0';
        timelineViewBtn.style.boxShadow = 'none';
        
        listView.style.display = 'block';
        timelineView.style.display = 'none';
    } else {
        timelineViewBtn.style.background = 'linear-gradient(135deg, #4fc3f7 0%, #2c5f7c 100%)';
        timelineViewBtn.style.color = 'white';
        timelineViewBtn.style.borderColor = 'transparent';
        timelineViewBtn.style.boxShadow = '0 2px 8px rgba(79, 195, 247, 0.3)';
        
        listViewBtn.style.background = 'white';
        listViewBtn.style.color = '#2c5f7c';
        listViewBtn.style.borderColor = '#e0e0e0';
        listViewBtn.style.boxShadow = 'none';
        
        listView.style.display = 'none';
        timelineView.style.display = 'block';
        
        // 延迟渲染时间轴以提高性能
        if (!timelineView.hasChildNodes() || timelineView.children[0].children.length === 0) {
            renderTimelineView();
        }
    }
}

// 渲染时间列表视图
function renderListView() {
    console.log('renderListView: 开始渲染列表');
    console.log('renderListView: articlesData长度', articlesData.length);
    
    const container = document.getElementById('timelineList');
    
    if (!container) {
        console.error('renderListView: 找不到列表容器元素 #timelineList');
        return;
    }
    
    if (articlesData.length === 0) {
        console.warn('renderListView: articlesData为空，显示提示信息');
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #999;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                <h3>暂无文章数据</h3>
                <p style="margin-top: 1rem;">请先在后台发布一些文章</p>
            </div>
        `;
        return;
    }
    
    // 按年份分组
    const articlesByYear = {};
    articlesData.forEach(article => {
        const year = article.publishDate.split('-')[0];
        if (!articlesByYear[year]) {
            articlesByYear[year] = [];
        }
        articlesByYear[year].push(article);
    });
    
    console.log('renderListView: 按年份分组', articlesByYear);
    
    let html = '<div class="timeline-list-container">';
    
    Object.keys(articlesByYear).sort((a, b) => b - a).forEach(year => {
        const articles = articlesByYear[year];
        
        html += `
            <div class="timeline-year-section">
                <div class="timeline-year-header">
                    📅 ${year}年 · ${articles.length}篇文章
                </div>
                <div class="timeline-articles-list">
        `;
        
        articles.forEach(article => {
            html += `
                <div class="timeline-article-item" data-date="${article.publishDate}" onclick="viewArticle(${article.id})">
                    <div class="timeline-article-date">
                        📆 ${article.publishDate}
                    </div>
                    <div class="timeline-article-title">
                        ${article.title}
                    </div>
                    <div class="timeline-article-category">
                        ${article.category}
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// 渲染时间轴视图
function renderTimelineView() {
    const container = document.getElementById('timelineAxis');
    
    // 按年份分组
    const articlesByYear = {};
    articlesData.forEach(article => {
        const year = article.publishDate.split('-')[0];
        if (!articlesByYear[year]) {
            articlesByYear[year] = [];
        }
        articlesByYear[year].push(article);
    });
    
    let html = '<div class="timeline-axis-container">';
    let isLeft = true;
    
    Object.keys(articlesByYear).sort((a, b) => b - a).forEach(year => {
        const articles = articlesByYear[year];
        
        // 年份标记
        html += `
            <div class="timeline-year-marker">
                <div class="timeline-year-badge">
                    ${year}
                </div>
            </div>
        `;
        
        // 文章节点
        articles.forEach(article => {
            const side = isLeft ? 'left' : 'right';
            
            html += `
                <div class="timeline-item ${side}">
                    <div class="timeline-content">
                        <div class="timeline-article-card" onclick="viewArticle(${article.id})">
                            <div class="timeline-article-image">
                                <img src="${article.image}" alt="${article.title}">
                                <span class="timeline-article-category-badge">${article.category}</span>
                            </div>
                            <div class="timeline-article-body">
                                <div class="timeline-article-header">
                                    <h3>${article.title}</h3>
                                </div>
                                <div class="timeline-article-meta">
                                    📅 ${article.publishDate}
                                </div>
                                <div class="timeline-article-excerpt">
                                    ${article.excerpt}
                                </div>
                                <div class="timeline-article-footer">
                                    <div class="timeline-article-stats">
                                        <span>👁️ ${article.views || 0}</span>
                                        <span>❤️ ${article.likes || 0}</span>
                                    </div>
                                    <div class="timeline-article-tags">
                                        ${article.tags.slice(0, 3).map(tag => `
                                            <span class="timeline-article-tag">#${tag}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="timeline-dot"></div>
                    <div class="timeline-connector"></div>
                </div>
            `;
            
            isLeft = !isLeft;
        });
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// 查看文章详情
function viewArticle(id) {
    window.location.href = `article.html?id=${id}`;
}

// 加载网站头像
async function loadSiteAvatar() {
    if (window.blogDataStore) {
        const settings = await window.blogDataStore.getSettings();
        if (settings && settings.avatar) {
            const avatarEl = document.getElementById('siteAvatar');
            if (avatarEl) {
                avatarEl.src = settings.avatar;
            }
        }
    }
}
