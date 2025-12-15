/* ========================================
   文章目录（TOC）功能
   ======================================== */

// 生成文章目录
function generateTableOfContents() {
    const content = document.getElementById('articleContent');
    const tocList = document.getElementById('tocList');
    const tocWrapper = document.getElementById('articleToc');
    
    if (!content || !tocList) {
        console.log('目录容器未找到');
        return;
    }
    
    // 获取所有标题
    const headings = content.querySelectorAll('h2, h3');
    
    if (headings.length === 0) {
        // 没有标题，显示空状态
        tocList.innerHTML = `
            <div class="article-toc-empty">
                <div class="icon">📄</div>
                <div>本文暂无目录</div>
            </div>
        `;
        return;
    }
    
    // 为每个标题添加ID（如果没有的话）
    headings.forEach((heading, index) => {
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }
    });
    
    // 生成目录HTML
    let tocHTML = '';
    headings.forEach((heading, index) => {
        const level = heading.tagName.toLowerCase();
        const text = heading.textContent;
        const id = heading.id;
        
        tocHTML += `
            <li class="article-toc-item level-${level.charAt(1)}">
                <a href="#${id}" class="article-toc-link" data-target="${id}">
                    ${text}
                </a>
            </li>
        `;
    });
    
    tocList.innerHTML = tocHTML;
    
    // 添加点击事件
    const tocLinks = tocList.querySelectorAll('.article-toc-link');
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // 平滑滚动到目标位置
                const offsetTop = targetElement.offsetTop - 100; // 留出导航栏空间
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // 移动端关闭目录
                if (window.innerWidth <= 1200) {
                    toggleToc();
                }
            }
        });
    });
    
    // 初始化滚动监听
    initScrollSpy();
}

// 滚动监听，高亮当前章节
function initScrollSpy() {
    const content = document.getElementById('articleContent');
    if (!content) return;
    
    const headings = content.querySelectorAll('h2, h3');
    const tocLinks = document.querySelectorAll('.article-toc-link');
    
    if (headings.length === 0 || tocLinks.length === 0) return;
    
    let ticking = false;
    
    function updateActiveLink() {
        const scrollPos = window.scrollY + 150; // 偏移量
        
        let currentHeading = null;
        
        // 找到当前滚动位置对应的标题
        headings.forEach(heading => {
            if (heading.offsetTop <= scrollPos) {
                currentHeading = heading;
            }
        });
        
        // 更新目录高亮
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (currentHeading && link.getAttribute('data-target') === currentHeading.id) {
                link.classList.add('active');
            }
        });
        
        ticking = false;
    }
    
    // 使用节流优化性能
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateActiveLink);
            ticking = true;
        }
    });
    
    // 初始化时执行一次
    updateActiveLink();
}

// 切换目录折叠状态（桌面端）
function toggleTocCollapse() {
    const tocWrapper = document.getElementById('articleToc');
    
    if (!tocWrapper) return;
    
    // 只在桌面端生效
    if (window.innerWidth <= 1200) return;
    
    const isCollapsed = tocWrapper.classList.contains('collapsed');
    
    if (isCollapsed) {
        // 展开目录
        tocWrapper.classList.remove('collapsed');
        localStorage.setItem('toc-collapsed', 'false');
    } else {
        // 折叠目录
        tocWrapper.classList.add('collapsed');
        localStorage.setItem('toc-collapsed', 'true');
    }
}

// 切换目录显示（移动端）
function toggleToc() {
    const tocWrapper = document.getElementById('articleToc');
    const tocOverlay = document.getElementById('tocOverlay');
    
    if (!tocWrapper || !tocOverlay) return;
    
    const isShowing = tocWrapper.classList.contains('mobile-show');
    
    if (isShowing) {
        // 关闭目录
        tocWrapper.classList.remove('mobile-show');
        tocOverlay.classList.remove('show');
        document.body.style.overflow = '';
    } else {
        // 打开目录
        tocWrapper.classList.add('mobile-show');
        tocOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// 恢复目录折叠状态
function restoreTocState() {
    const tocWrapper = document.getElementById('articleToc');
    if (!tocWrapper) return;
    
    // 只在桌面端恢复状态
    if (window.innerWidth > 1200) {
        const isCollapsed = localStorage.getItem('toc-collapsed') === 'true';
        if (isCollapsed) {
            tocWrapper.classList.add('collapsed');
        }
    }
}

// 响应式处理
function handleTocResize() {
    const tocWrapper = document.getElementById('articleToc');
    const tocOverlay = document.getElementById('tocOverlay');
    
    if (!tocWrapper || !tocOverlay) return;
    
    if (window.innerWidth > 1200) {
        // 桌面端，移除移动端样式
        tocWrapper.classList.remove('mobile-show');
        tocOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// 监听窗口大小变化
window.addEventListener('resize', handleTocResize);

// 页面加载时恢复目录状态
document.addEventListener('DOMContentLoaded', function() {
    restoreTocState();
});

// 导出函数供外部调用
window.generateTableOfContents = generateTableOfContents;
window.toggleToc = toggleToc;
window.toggleTocCollapse = toggleTocCollapse;
