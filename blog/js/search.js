// 搜索功能

// 获取 URL 参数
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 处理搜索按键事件
function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

// 执行搜索
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('请输入搜索关键词');
        return;
    }
    
    // 判断当前页面位置，决定跳转路径
    const currentPath = window.location.pathname;
    let searchPageUrl;
    
    if (currentPath.includes('/pages/')) {
        // 如果在 pages 目录下，直接跳转到同级的 search.html
        searchPageUrl = `search.html?q=${encodeURIComponent(query)}`;
    } else {
        // 如果在根目录（首页），跳转到 pages/search.html
        searchPageUrl = `pages/search.html?q=${encodeURIComponent(query)}`;
    }
    
    window.location.href = searchPageUrl;
}

// 高亮关键词
function highlightKeywords(text, keywords) {
    if (!text || !keywords) return text;
    
    let result = text;
    keywords.forEach(keyword => {
        const regex = new RegExp(`(${keyword})`, 'gi');
        result = result.replace(regex, '<mark>$1</mark>');
    });
    
    return result;
}

// 搜索文章
async function searchArticles(query, filters) {
    if (!window.blogDataStore) {
        console.error('数据存储未初始化');
        return [];
    }
    
    const articles = await window.blogDataStore.getArticles();
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);
    
    const results = articles.filter(article => {
        let matchScore = 0;
        
        // 搜索标题
        if (filters.title) {
            const titleMatch = keywords.some(keyword => 
                article.title.toLowerCase().includes(keyword)
            );
            if (titleMatch) matchScore += 10;
        }
        
        // 搜索内容
        if (filters.content) {
            const contentMatch = keywords.some(keyword => 
                article.content.toLowerCase().includes(keyword)
            );
            if (contentMatch) matchScore += 5;
        }
        
        // 搜索标签
        if (filters.tags && article.tags) {
            const tagsMatch = keywords.some(keyword => 
                article.tags.some(tag => tag.toLowerCase().includes(keyword))
            );
            if (tagsMatch) matchScore += 8;
        }
        
        // 搜索分类
        if (filters.categories && article.category) {
            const categoryMatch = keywords.some(keyword => 
                article.category.toLowerCase().includes(keyword)
            );
            if (categoryMatch) matchScore += 8;
        }
        
        article.matchScore = matchScore;
        return matchScore > 0;
    });
    
    // 按匹配分数排序
    results.sort((a, b) => b.matchScore - a.matchScore);
    
    return results;
}

// 生成摘要
function generateExcerpt(content, keywords, maxLength = 150) {
    if (!content) return '';
    
    // 移除 HTML 标签
    const plainText = content.replace(/<[^>]*>/g, '');
    
    // 查找关键词位置
    let bestPosition = 0;
    let maxMatches = 0;
    
    keywords.forEach(keyword => {
        const index = plainText.toLowerCase().indexOf(keyword.toLowerCase());
        if (index !== -1) {
            const start = Math.max(0, index - 50);
            const end = Math.min(plainText.length, index + 100);
            const snippet = plainText.substring(start, end);
            const matches = keywords.filter(k => 
                snippet.toLowerCase().includes(k.toLowerCase())
            ).length;
            
            if (matches > maxMatches) {
                maxMatches = matches;
                bestPosition = start;
            }
        }
    });
    
    // 生成摘要
    const start = bestPosition;
    const end = Math.min(plainText.length, start + maxLength);
    let excerpt = plainText.substring(start, end);
    
    // 添加省略号
    if (start > 0) excerpt = '...' + excerpt;
    if (end < plainText.length) excerpt = excerpt + '...';
    
    return excerpt;
}

// 渲染搜索结果
function renderSearchResults(results, query) {
    const resultsContainer = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    const searchQuery = document.getElementById('searchQuery');
    const searchStats = document.getElementById('searchStats');
    
    // 更新搜索信息
    searchQuery.textContent = `"${query}"`;
    searchStats.textContent = `找到 ${results.length} 篇相关文章`;
    
    if (results.length === 0) {
        resultsContainer.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    resultsContainer.style.display = 'grid';
    noResults.style.display = 'none';
    resultsContainer.innerHTML = '';
    
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);
    
    results.forEach(article => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        // 生成摘要
        const excerpt = generateExcerpt(article.content, keywords);
        
        // 高亮标题和摘要
        const highlightedTitle = highlightKeywords(article.title, keywords);
        const highlightedExcerpt = highlightKeywords(excerpt, keywords);
        
        // 格式化日期
        const date = new Date(article.publishDate);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        // 生成标签 HTML
        let tagsHtml = '';
        if (article.tags && article.tags.length > 0) {
            tagsHtml = `
                <div class="result-tags">
                    ${article.tags.slice(0, 3).map(tag => 
                        `<span class="result-tag">${highlightKeywords(tag, keywords)}</span>`
                    ).join('')}
                </div>
            `;
        }
        
        resultItem.innerHTML = `
            <div class="result-header">
                <h3 class="result-title">
                    <a href="article.html?id=${article.id}">${highlightedTitle}</a>
                </h3>
                <span class="result-date">📅 ${formattedDate}</span>
            </div>
            <div class="result-meta">
                <span class="result-category">📁 ${highlightKeywords(article.category || '未分类', keywords)}</span>
                ${tagsHtml}
            </div>
            <p class="result-excerpt">${highlightedExcerpt}</p>
            <div class="result-footer">
                <div class="result-stats">
                    <span class="result-stat">👁️ ${article.views || 0}</span>
                    <span class="result-stat">💬 ${article.comments || 0}</span>
                    <span class="result-stat">❤️ ${article.likes || 0}</span>
                </div>
                <a href="article.html?id=${article.id}" class="result-link">阅读全文 →</a>
            </div>
        `;
        
        resultsContainer.appendChild(resultItem);
    });
}

// 应用筛选（异步）
async function applyFilters() {
    const query = getUrlParameter('q');
    if (!query) return;
    
    const filters = {
        title: document.getElementById('searchTitle').checked,
        content: document.getElementById('searchContent').checked,
        tags: document.getElementById('searchTags').checked,
        categories: document.getElementById('searchCategories').checked
    };
    
    const results = await searchArticles(query, filters);
    renderSearchResults(results, query);
}

// 初始化搜索页面（异步）
async function initSearchPage() {
    const query = getUrlParameter('q');
    
    if (!query) {
        document.getElementById('searchQuery').textContent = '请输入搜索关键词';
        document.getElementById('searchStats').textContent = '';
        document.getElementById('noResults').style.display = 'block';
        return;
    }
    
    // 设置搜索框的值
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = query;
    }
    
    // 等待数据加载完成
    if (!window.blogDataStore) {
        setTimeout(initSearchPage, 100);
        return;
    }
    
    // 执行搜索
    const filters = {
        title: document.getElementById('searchTitle').checked,
        content: document.getElementById('searchContent').checked,
        tags: document.getElementById('searchTags').checked,
        categories: document.getElementById('searchCategories').checked
    };
    
    const results = await searchArticles(query, filters);
    renderSearchResults(results, query);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 如果是搜索页面，初始化搜索
    if (window.location.pathname.includes('search.html')) {
        initSearchPage();
    }
});
