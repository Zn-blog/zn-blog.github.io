/* ========================================
   分类页面功能
   ======================================== */

let currentCategory = 'all';

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadSiteAvatar();
});

// 加载分类标签（异步）
async function loadCategories() {
    const [categories, articles] = await Promise.all([
        window.blogDataStore.getCategories(),
        window.blogDataStore.getArticles('published')
    ]);
    
    const categoryTabs = document.getElementById('categoryTabs');
    
    // 添加"全部"标签
    let tabsHTML = `
        <button class="category-tab active" data-category="all" onclick="selectCategory('all')" style="
            padding: 0.8rem 2rem;
            background: linear-gradient(135deg, #4fc3f7 0%, #2c5f7c 100%);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s;
            box-shadow: 0 2px 8px rgba(79, 195, 247, 0.3);
        ">
            📚 全部 (${articles.length})
        </button>
    `;
    
    // 添加分类标签
    tabsHTML += categories
        .filter(cat => cat.count > 0)
        .sort((a, b) => b.count - a.count)
        .map(cat => `
            <button class="category-tab" data-category="${cat.name}" onclick="selectCategory('${cat.name}')" style="
                padding: 0.8rem 2rem;
                background: white;
                color: #2c5f7c;
                border: 2px solid #e0e0e0;
                border-radius: 25px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 500;
                transition: all 0.3s;
            ">
                ${cat.name} (${cat.count})
            </button>
        `).join('');
    
    categoryTabs.innerHTML = tabsHTML;
    
    // 检查URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
        selectCategory(categoryParam);
    } else {
        selectCategory('all');
    }
}

// 选择分类
function selectCategory(category) {
    currentCategory = category;
    
    // 更新标签样式
    document.querySelectorAll('.category-tab').forEach(tab => {
        const tabCategory = tab.getAttribute('data-category');
        if (tabCategory === category) {
            tab.style.background = 'linear-gradient(135deg, #4fc3f7 0%, #2c5f7c 100%)';
            tab.style.color = 'white';
            tab.style.borderColor = 'transparent';
            tab.style.boxShadow = '0 2px 8px rgba(79, 195, 247, 0.3)';
            tab.classList.add('active');
        } else {
            tab.style.background = 'white';
            tab.style.color = '#2c5f7c';
            tab.style.borderColor = '#e0e0e0';
            tab.style.boxShadow = 'none';
            tab.classList.remove('active');
        }
    });
    
    // 加载文章
    loadArticlesByCategory(category);
}

// 根据分类加载文章（异步）
async function loadArticlesByCategory(category) {
    const articlesContainer = document.getElementById('categoryArticles');
    let articles = await window.blogDataStore.getArticles('published');
    
    // 过滤分类
    if (category !== 'all') {
        articles = articles.filter(article => article.category === category);
    }
    
    if (articles.length === 0) {
        articlesContainer.innerHTML = `
            <div style="text-align: center; padding: 4rem; color: #999;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">📭</div>
                <h3>该分类下暂无文章</h3>
                <p style="margin-top: 1rem;">
                    <a href="../index.html" style="color: #4fc3f7; text-decoration: none;">返回首页</a>
                </p>
            </div>
        `;
        return;
    }
    
    // 渲染文章列表（使用与首页相同的样式）
    articlesContainer.innerHTML = `
        <div class="articles-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-bottom: 2rem;">
            ${articles.map(article => `
                <article class="article-card" style="
                    background: white;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    transition: all 0.3s;
                    cursor: pointer;
                " onclick="viewArticle(${article.id})">
                    <div class="article-image" style="
                        position: relative;
                        height: 200px;
                        overflow: hidden;
                    ">
                        <img src="${article.image}" alt="${article.title}" style="
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            transition: transform 0.3s;
                        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                        <span class="article-category" style="
                            position: absolute;
                            top: 1rem;
                            right: 1rem;
                            background: rgba(79, 195, 247, 0.9);
                            color: white;
                            padding: 0.4rem 1rem;
                            border-radius: 20px;
                            font-size: 0.85rem;
                            font-weight: 500;
                        ">${article.category}</span>
                    </div>
                    <div class="article-content" style="padding: 1.5rem;">
                        <div class="article-header">
                            <h3 style="
                                color: #2c5f7c;
                                font-size: 1.3rem;
                                margin-bottom: 0.5rem;
                                display: -webkit-box;
                                -webkit-line-clamp: 2;
                                -webkit-box-orient: vertical;
                                overflow: hidden;
                            ">${article.title}</h3>
                            <p class="article-date" style="
                                color: #999;
                                font-size: 0.9rem;
                                margin-bottom: 1rem;
                            ">📅 ${article.publishDate}</p>
                        </div>
                        <p class="article-excerpt" style="
                            color: #666;
                            line-height: 1.6;
                            margin-bottom: 1rem;
                            display: -webkit-box;
                            -webkit-line-clamp: 3;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        ">${article.excerpt}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #f0f0f0;">
                            <div style="display: flex; gap: 1rem; font-size: 0.85rem; color: #999;">
                                <span>👁️ ${article.views || 0}</span>
                                <span>❤️ ${article.likes || 0}</span>
                            </div>
                            <span class="read-more" style="
                                color: #4fc3f7;
                                font-weight: 500;
                                transition: color 0.3s;
                            ">阅读更多 →</span>
                        </div>
                    </div>
                </article>
            `).join('')}
        </div>
    `;
}

// 查看文章详情
function viewArticle(id) {
    window.location.href = `article.html?id=${id}`;
}

// 加载网站头像（异步）
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
