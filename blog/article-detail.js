/* ========================================
   文章详情页面功能
   ======================================== */

let currentArticle = null;
let currentArticleId = null;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadArticleDetail();
    loadSiteAvatar();
});

// 加载文章详情（异步）
async function loadArticleDetail() {
    // 从URL获取文章ID
    const urlParams = new URLSearchParams(window.location.search);
    currentArticleId = urlParams.get('id');
    const isPreview = urlParams.get('preview') === 'true';
    
    if (!currentArticleId) {
        showError('文章不存在');
        return;
    }
    
    // 如果是预览模式，从 sessionStorage 加载
    if (isPreview && currentArticleId.startsWith('preview-')) {
        const previewData = sessionStorage.getItem('previewArticle');
        if (previewData) {
            currentArticle = JSON.parse(previewData);
            
            // 显示预览提示
            showPreviewNotice();
            
            // 渲染文章
            renderArticle();
            
            // 预览模式不加载评论和相关文章
            document.getElementById('commentsSection').style.display = 'none';
            document.getElementById('relatedArticles').style.display = 'none';
            
            return;
        }
    }
    
    try {
        // 获取文章数据
        currentArticle = await window.blogDataStore.getArticleById(currentArticleId);
        
        if (!currentArticle) {
            showError('文章不存在');
            return;
        }
        
        // 增加文章浏览量
        await incrementArticleViews(currentArticleId);
        
        // 渲染文章
        renderArticle();
        
        // 加载评论
        await loadComments();
        
        // 加载相关文章
        await loadRelatedArticles();
    } catch (error) {
        console.error('加载文章失败:', error);
        showError('加载文章失败');
    }
}

// 显示预览提示
function showPreviewNotice() {
    const notice = document.createElement('div');
    notice.style.cssText = `
        position: fixed;
        top: 6rem;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%);
        color: #856404;
        padding: 1rem 2rem;
        border-radius: 25px;
        box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
        z-index: 1000;
        font-weight: 600;
        border: 2px solid #ffc107;
        animation: slideDown 0.3s ease-out;
    `;
    notice.innerHTML = '📝 预览模式 - 这是文章预览，未保存到数据库';
    document.body.appendChild(notice);
    
    // 添加动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// 渲染文章
function renderArticle() {
    // 设置页面标题
    document.getElementById('articleTitle').textContent = currentArticle.title + ' - ℳঞ执念ꦿ的博客';
    
    // 设置文章标题
    document.getElementById('articleTitleText').textContent = currentArticle.title;
    
    // 设置元数据
    document.getElementById('articleDate').textContent = currentArticle.publishDate || currentArticle.date;
    document.getElementById('articleCategory').textContent = currentArticle.category;
    document.getElementById('articleAuthor').textContent = currentArticle.author || '管理员';
    document.getElementById('articleViews').textContent = currentArticle.views || 0;
    
    // 渲染标签
    const tagsContainer = document.getElementById('articleTags');
    if (currentArticle.tags && currentArticle.tags.length > 0) {
        tagsContainer.innerHTML = currentArticle.tags.map(tag => 
            `<a href="tags.html?tag=${encodeURIComponent(tag)}" class="article-tag">#${tag}</a>`
        ).join('');
        tagsContainer.style.display = 'flex';
    } else {
        tagsContainer.style.display = 'none';
    }
    
    // 渲染内容（简单的Markdown渲染）
    const content = markdownToHtml(currentArticle.content);
    document.getElementById('articleContent').innerHTML = content;
    
    // 设置点赞数
    document.getElementById('likeCount').textContent = currentArticle.likes || 0;
    
    // 检查是否已点赞
    const liked = localStorage.getItem(`article_liked_${currentArticleId}`);
    if (liked) {
        document.getElementById('likeBtn').classList.add('liked');
    }
    
    // 为代码块添加复制按钮和生成目录
    setTimeout(() => {
        // 🔥 触发 Prism 代码高亮
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
            console.log('✅ 代码高亮已应用');
        }
        
        addCopyButtonsToCodeBlocks();
        // 生成文章目录
        if (typeof generateTableOfContents === 'function') {
            generateTableOfContents();
        }
    }, 100);
}

// 增强的Markdown转HTML（支持更多格式）
function markdownToHtml(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    console.log('=== Markdown转换开始 ===');
    console.log('原始内容长度:', markdown.length);
    
    // 使用占位符保护特殊内容
    const protectedBlocks = [];
    let blockIndex = 0;
    
    // 1. 保护代码块（支持语法高亮）
    html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, function(match, lang, code) {
        const placeholder = `___CODE_BLOCK_${blockIndex}___`;
        const language = lang || 'javascript';
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        
        protectedBlocks[blockIndex] = `<pre class="line-numbers"><code class="language-${language}">${escapedCode}</code></pre>`;
        blockIndex++;
        return placeholder;
    });
    
    // 2. 保护并转换图片（必须在链接之前）
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function(match, alt, src) {
        const placeholder = `___IMAGE_BLOCK_${blockIndex}___`;
        let imgHtml = '';
        
        if (src.startsWith('data:image/') || src.startsWith('blob:') || 
            src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
            imgHtml = `<img src="${src}" alt="${alt}" class="article-image" style="max-width: 100%; height: auto; display: block; margin: 1.5rem auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">`;
        } else if (src.includes('图片已移除') || src.includes('需要手动上传')) {
            imgHtml = `<div style="padding: 2rem; background: #f5f5f5; border-radius: 8px; text-align: center; color: #999; margin: 1rem 0;">📷 ${alt || '图片'} - ${src}</div>`;
        } else {
            imgHtml = `<img src="${src}" alt="${alt}" class="article-image" style="max-width: 100%; height: auto; display: block; margin: 1.5rem auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">`;
        }
        
        protectedBlocks[blockIndex] = imgHtml;
        blockIndex++;
        return placeholder;
    });
    
    // 3. 保护表格
    html = html.replace(/(\|.+\|[\r\n]+\|[-:\s|]+\|[\r\n]+(?:\|.+\|[\r\n]*)+)/g, function(match) {
        const placeholder = `___TABLE_BLOCK_${blockIndex}___`;
        const tableHtml = convertTableToHtml(match);
        protectedBlocks[blockIndex] = tableHtml;
        blockIndex++;
        return placeholder;
    });
    
    // 4. 标题（支持1-6级，从高到低匹配避免冲突）
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // 5. 水平分隔线
    html = html.replace(/^([-*_]){3,}$/gim, '<hr style="border: none; border-top: 2px solid #e0e0e0; margin: 2rem 0;">');
    
    // 6. 粗体和斜体（按优先级处理）
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // 7. 删除线
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
    
    // 8. 链接（在图片之后处理）
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // 9. 引用块（支持多行）
    html = html.replace(/^> (.+)$/gim, function(match, content) {
        return `<blockquote style="border-left: 4px solid #4fc3f7; padding-left: 1rem; margin: 1rem 0; color: #666; font-style: italic;">${content}</blockquote>`;
    });
    
    // 10. 行内代码
    html = html.replace(/`([^`]+)`/g, '<code style="background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: \'Courier New\', monospace; font-size: 0.9em; color: #e91e63;">$1</code>');
    
    // 11. 任务列表
    html = html.replace(/^- \[([ x])\] (.+)$/gim, function(match, checked, content) {
        const isChecked = checked.toLowerCase() === 'x';
        return `<div style="display: flex; align-items: center; margin: 0.5rem 0;">
            <input type="checkbox" ${isChecked ? 'checked' : ''} disabled style="margin-right: 0.5rem;">
            <span style="${isChecked ? 'text-decoration: line-through; color: #999;' : ''}">${content}</span>
        </div>`;
    });
    
    // 12. 有序列表
    const orderedListRegex = /^(\d+)\.\s+(.+)$/gim;
    let orderedListItems = [];
    html = html.replace(orderedListRegex, function(match, num, content) {
        orderedListItems.push(`<li>${content}</li>`);
        return `___ORDERED_LIST_ITEM___`;
    });
    
    // 13. 无序列表
    const unorderedListRegex = /^[\-\*\+]\s+(.+)$/gim;
    let unorderedListItems = [];
    html = html.replace(unorderedListRegex, function(match, content) {
        // 跳过任务列表
        if (content.match(/^\[([ x])\]/)) {
            return match;
        }
        unorderedListItems.push(`<li>${content}</li>`);
        return `___UNORDERED_LIST_ITEM___`;
    });
    
    // 14. 包裹列表
    if (orderedListItems.length > 0) {
        const orderedListHtml = `<ol style="margin: 1rem 0; padding-left: 2rem;">${orderedListItems.join('')}</ol>`;
        html = html.replace(/___ORDERED_LIST_ITEM___(\n___ORDERED_LIST_ITEM___)*/g, orderedListHtml);
    }
    
    if (unorderedListItems.length > 0) {
        const unorderedListHtml = `<ul style="margin: 1rem 0; padding-left: 2rem;">${unorderedListItems.join('')}</ul>`;
        html = html.replace(/___UNORDERED_LIST_ITEM___(\n___UNORDERED_LIST_ITEM___)*/g, unorderedListHtml);
    }
    
    // 15. 恢复保护的内容（在段落处理之前）
    protectedBlocks.forEach((block, index) => {
        html = html.replace(new RegExp(`___CODE_BLOCK_${index}___`, 'g'), block);
        html = html.replace(new RegExp(`___IMAGE_BLOCK_${index}___`, 'g'), block);
        html = html.replace(new RegExp(`___TABLE_BLOCK_${index}___`, 'g'), block);
    });
    
    // 16. 段落处理
    html = html.split('\n\n').map(para => {
        para = para.trim();
        if (!para) return '';
        
        // 跳过HTML标签和占位符
        if (para.match(/^<(h[1-6]|ul|ol|li|pre|blockquote|div|hr|table)/i) || 
            para.includes('___ORDERED_LIST_ITEM___') ||
            para.includes('___UNORDERED_LIST_ITEM___')) {
            return para;
        }
        
        return `<p style="margin: 1rem 0; line-height: 1.8;">${para}</p>`;
    }).join('\n');
    
    // 17. 换行处理
    // 将单个换行符替换为 <br>，但保留段落之间的换行
    html = html.replace(/([^\n])\n([^\n])/g, '$1<br>$2');
    
    console.log('转换后HTML长度:', html.length);
    console.log('=== Markdown转换完成 ===');
    
    return html;
}

// 转换Markdown表格为HTML
function convertTableToHtml(markdown) {
    const lines = markdown.trim().split('\n');
    if (lines.length < 2) return markdown;
    
    // 解析表头
    const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
    
    // 解析对齐方式
    const alignments = lines[1].split('|').map(a => {
        a = a.trim();
        if (a.startsWith(':') && a.endsWith(':')) return 'center';
        if (a.endsWith(':')) return 'right';
        return 'left';
    }).filter((a, i) => i < headers.length);
    
    // 解析数据行
    const rows = lines.slice(2).map(line => 
        line.split('|').map(cell => cell.trim()).filter(cell => cell)
    );
    
    // 生成HTML
    let html = '<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">';
    
    // 表头
    html += '<thead><tr>';
    headers.forEach((header, i) => {
        const align = alignments[i] || 'left';
        html += `<th style="background: #4fc3f7; color: white; padding: 0.75rem; text-align: ${align}; border: 1px solid #ddd;">${header}</th>`;
    });
    html += '</tr></thead>';
    
    // 表体
    html += '<tbody>';
    rows.forEach((row, rowIndex) => {
        const bgColor = rowIndex % 2 === 0 ? '#fff' : '#f9f9f9';
        html += `<tr style="background: ${bgColor};">`;
        row.forEach((cell, i) => {
            const align = alignments[i] || 'left';
            html += `<td style="padding: 0.75rem; text-align: ${align}; border: 1px solid #ddd;">${cell}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';
    
    html += '</table>';
    return html;
}

// 切换点赞
async function toggleLike() {
    if (!currentArticleId || !currentArticle) {
        showNotification('文章信息加载中，请稍候...', 'warning');
        return;
    }
    
    const likeBtn = document.getElementById('likeBtn');
    const likeCount = document.getElementById('likeCount');
    const liked = localStorage.getItem(`article_liked_${currentArticleId}`);
    
    try {
        if (liked) {
            // 取消点赞
            await window.blogDataStore.decrementLikes(currentArticleId);
            localStorage.removeItem(`article_liked_${currentArticleId}`);
            likeBtn.classList.remove('liked');
            const newCount = Math.max(0, parseInt(likeCount.textContent) - 1);
            likeCount.textContent = newCount;
            
            // 更新当前文章对象
            if (currentArticle) {
                currentArticle.likes = newCount;
            }
            
            showNotification('已取消点赞', 'info');
        } else {
            // 点赞
            await window.blogDataStore.incrementLikes(currentArticleId);
            localStorage.setItem(`article_liked_${currentArticleId}`, 'true');
            likeBtn.classList.add('liked');
            const newCount = parseInt(likeCount.textContent) + 1;
            likeCount.textContent = newCount;
            
            // 更新当前文章对象
            if (currentArticle) {
                currentArticle.likes = newCount;
            }
            
            showNotification('点赞成功！❤️', 'success');
        }
    } catch (error) {
        console.error('点赞操作失败:', error);
        showNotification('操作失败，请重试', 'error');
    }
}

// 分享文章
function shareArticle() {
    const url = window.location.href;
    const title = currentArticle.title;
    
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        }).then(() => {
            showNotification('分享成功！', 'success');
        }).catch(() => {
            copyToClipboard(url);
        });
    } else {
        copyToClipboard(url);
    }
}

// 复制到剪贴板
function copyToClipboard(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showNotification('链接已复制到剪贴板', 'success');
}

// 加载评论（异步）
async function loadComments() {
    const commentsList = document.getElementById('commentsList');
    const commentCount = document.getElementById('commentCount');
    
    try {
        const comments = await window.blogDataStore.getCommentsByArticle(currentArticleId);
        
        // 计算总评论数（包括回复）
        let totalCount = comments.length;
        for (const comment of comments) {
            const replies = await window.blogDataStore.getRepliesByComment(comment.id);
            totalCount += replies.length;
        }
        
        // 更新评论数
        commentCount.textContent = `(${totalCount})`;
        
        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="no-comments">
                    <div class="icon">💬</div>
                    <p>还没有评论，快来抢沙发吧！</p>
                </div>
            `;
            return;
        }
        
        // 渲染评论列表
        const renderedComments = [];
        for (const comment of comments) {
            renderedComments.push(await renderComment(comment));
        }
        commentsList.innerHTML = renderedComments.join('');
    } catch (error) {
        console.error('加载评论失败:', error);
        commentsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #999;">加载评论失败</div>';
    }
}

// 渲染单条评论（异步）
async function renderComment(comment) {
    const timeAgo = getTimeAgo(new Date(comment.time));
    const initial = comment.author.charAt(0).toUpperCase();
    const replies = await window.blogDataStore.getRepliesByComment(comment.id);
    
    // 检查用户是否已投票
    const likedKey = `comment_liked_${comment.id}`;
    const dislikedKey = `comment_disliked_${comment.id}`;
    const hasLiked = localStorage.getItem(likedKey) === 'true';
    const hasDisliked = localStorage.getItem(dislikedKey) === 'true';
    
    return `
        <div class="comment-item" data-id="${comment.id}">
            <div class="comment-header">
                <div class="comment-author">
                    <div class="author-avatar">${initial}</div>
                    <div class="author-info">
                        <div class="author-name">${comment.author}</div>
                        <div class="comment-time">${timeAgo}</div>
                    </div>
                </div>
                ${comment.status === 'pending' ? '<span class="comment-status status-pending">待审核</span>' : ''}
            </div>
            <div class="comment-content">${escapeHtml(comment.content)}</div>
            <div class="comment-actions">
                <button class="comment-action-btn ${hasLiked ? 'active' : ''}" onclick="toggleCommentLike(${comment.id})">
                    <span class="icon">👍</span>
                    <span class="count">${comment.likes || 0}</span>
                </button>
                <button class="comment-action-btn ${hasDisliked ? 'active' : ''}" onclick="toggleCommentDislike(${comment.id})">
                    <span class="icon">👎</span>
                    <span class="count">${comment.dislikes || 0}</span>
                </button>
                <button class="comment-action-btn" onclick="showReplyForm(${comment.id}, '${comment.author}')">
                    <span class="icon">💬</span>
                    <span>回复</span>
                </button>
            </div>
            
            <!-- 回复表单（默认隐藏） -->
            <div class="reply-form" id="replyForm${comment.id}" style="display: none;">
                <div class="form-group">
                    <input type="text" id="replyName${comment.id}" placeholder="昵称 *" required>
                </div>
                <div class="form-group">
                    <textarea id="replyContent${comment.id}" rows="3" placeholder="回复 @${comment.author}..." required></textarea>
                </div>
                <div class="form-actions">
                    <button class="submit-btn small" onclick="submitReply(${comment.id})">发表回复</button>
                    <button class="cancel-btn small" onclick="hideReplyForm(${comment.id})">取消</button>
                </div>
            </div>
            
            <!-- 回复列表 -->
            ${replies.length > 0 ? `
                <div class="replies-list">
                    ${replies.map(reply => renderReply(reply)).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// 渲染回复
function renderReply(reply) {
    const timeAgo = getTimeAgo(new Date(reply.time));
    const initial = reply.author.charAt(0).toUpperCase();
    
    // 检查用户是否已投票
    const likedKey = `comment_liked_${reply.id}`;
    const dislikedKey = `comment_disliked_${reply.id}`;
    const hasLiked = localStorage.getItem(likedKey) === 'true';
    const hasDisliked = localStorage.getItem(dislikedKey) === 'true';
    
    return `
        <div class="reply-item" data-id="${reply.id}">
            <div class="comment-header">
                <div class="comment-author">
                    <div class="author-avatar small">${initial}</div>
                    <div class="author-info">
                        <div class="author-name">${reply.author}</div>
                        <div class="comment-time">${timeAgo}</div>
                    </div>
                </div>
            </div>
            <div class="comment-content">${escapeHtml(reply.content)}</div>
            <div class="comment-actions">
                <button class="comment-action-btn ${hasLiked ? 'active' : ''}" onclick="toggleCommentLike(${reply.id})">
                    <span class="icon">👍</span>
                    <span class="count">${reply.likes || 0}</span>
                </button>
                <button class="comment-action-btn ${hasDisliked ? 'active' : ''}" onclick="toggleCommentDislike(${reply.id})">
                    <span class="icon">👎</span>
                    <span class="count">${reply.dislikes || 0}</span>
                </button>
            </div>
        </div>
    `;
}

// 提交评论
async function submitComment() {
    if (!currentArticleId || !currentArticle) {
        showNotification('文章信息加载中，请稍候...', 'warning');
        return;
    }
    
    const name = document.getElementById('commentName').value.trim();
    const email = document.getElementById('commentEmail').value.trim();
    const content = document.getElementById('commentContent').value.trim();
    
    // 验证
    if (!name) {
        showNotification('请输入昵称', 'error');
        return;
    }
    
    if (!content) {
        showNotification('请输入评论内容', 'error');
        return;
    }
    
    if (email && !isValidEmail(email)) {
        showNotification('邮箱格式不正确', 'error');
        return;
    }
    
    try {
        // 创建评论对象
        const comment = {
            articleId: parseInt(currentArticleId),
            articleTitle: currentArticle.title,
            author: name,
            email: email,
            content: content,
            time: new Date().toISOString(),
            status: 'approved', // 前台评论直接通过
            likes: 0,
            dislikes: 0
        };
        
        // 添加评论
        await window.blogDataStore.addComment(comment);
        
        // 清空表单
        document.getElementById('commentName').value = '';
        document.getElementById('commentEmail').value = '';
        document.getElementById('commentContent').value = '';
        
        // 显示成功消息
        showNotification('评论发表成功！', 'success');
        
        // 重新加载评论列表
        await loadComments();
    } catch (error) {
        console.error('提交评论失败:', error);
        showNotification('评论提交失败，请重试', 'error');
    }
}

// 显示回复表单
function showReplyForm(commentId, authorName) {
    // 隐藏所有其他回复表单
    document.querySelectorAll('.reply-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // 显示当前回复表单
    const replyForm = document.getElementById(`replyForm${commentId}`);
    if (replyForm) {
        replyForm.style.display = 'block';
        document.getElementById(`replyContent${commentId}`).focus();
    }
}

// 隐藏回复表单
function hideReplyForm(commentId) {
    const replyForm = document.getElementById(`replyForm${commentId}`);
    if (replyForm) {
        replyForm.style.display = 'none';
        document.getElementById(`replyName${commentId}`).value = '';
        document.getElementById(`replyContent${commentId}`).value = '';
    }
}

// 提交回复
async function submitReply(parentId) {
    if (!currentArticleId || !currentArticle) {
        showNotification('文章信息加载中，请稍候...', 'warning');
        return;
    }
    
    const name = document.getElementById(`replyName${parentId}`).value.trim();
    const content = document.getElementById(`replyContent${parentId}`).value.trim();
    
    // 验证
    if (!name) {
        showNotification('请输入昵称', 'error');
        return;
    }
    
    if (!content) {
        showNotification('请输入回复内容', 'error');
        return;
    }
    
    try {
        // 添加回复
        const reply = {
            articleId: parseInt(currentArticleId),
            articleTitle: currentArticle.title,
            author: name,
            email: '',
            content: content,
            time: new Date().toISOString(),
            status: 'approved', // 前台回复直接通过
            parentId: parentId, // 父评论ID
            likes: 0,
            dislikes: 0
        };
        
        await window.blogDataStore.addComment(reply);
        
        // 隐藏表单
        hideReplyForm(parentId);
        
        // 显示成功消息
        showNotification('回复发表成功！', 'success');
        
        // 重新加载评论
        await loadComments();
    } catch (error) {
        console.error('提交回复失败:', error);
        showNotification('回复提交失败，请重试', 'error');
    }
}

// 评论点赞（点一次+1，再点一次-1，互斥差评）
async function toggleCommentLike(commentId) {
    const likedKey = `comment_liked_${commentId}`;
    const dislikedKey = `comment_disliked_${commentId}`;
    const hasLiked = localStorage.getItem(likedKey) === 'true';
    const hasDisliked = localStorage.getItem(dislikedKey) === 'true';
    
    // 找到对应的评论元素
    const commentItem = document.querySelector(`[data-id="${commentId}"]`);
    if (!commentItem) {
        console.error('找不到评论元素:', commentId);
        return;
    }
    
    const actionBtns = commentItem.querySelectorAll('.comment-action-btn');
    const likeBtn = actionBtns[0];
    const dislikeBtn = actionBtns[1];
    
    if (!likeBtn || !dislikeBtn) {
        console.error('找不到按钮');
        return;
    }
    
    const likeCount = likeBtn.querySelector('.count');
    const dislikeCount = dislikeBtn.querySelector('.count');
    
    try {
        if (hasLiked) {
            // 已点赞，取消点赞：调用API -1
            await window.blogDataStore.unlikeComment(commentId);
            
            // 更新UI
            localStorage.removeItem(likedKey);
            likeBtn.classList.remove('active');
            likeCount.textContent = Math.max(0, parseInt(likeCount.textContent) - 1);
            
            console.log('✅ 取消点赞成功');
        } else {
            // 如果已经差评，先取消差评
            if (hasDisliked) {
                await window.blogDataStore.undislikeComment(commentId);
                localStorage.removeItem(dislikedKey);
                dislikeBtn.classList.remove('active');
                dislikeCount.textContent = Math.max(0, parseInt(dislikeCount.textContent) - 1);
                console.log('✅ 自动取消差评');
            }
            
            // 执行点赞：调用API +1
            await window.blogDataStore.likeComment(commentId);
            
            // 更新UI
            localStorage.setItem(likedKey, 'true');
            likeBtn.classList.add('active');
            likeCount.textContent = parseInt(likeCount.textContent) + 1;
            
            console.log('✅ 点赞成功');
        }
    } catch (error) {
        console.error('❌ 点赞操作失败:', error);
    }
}

// 评论差评（点一次+1，再点一次-1，互斥点赞）
async function toggleCommentDislike(commentId) {
    const likedKey = `comment_liked_${commentId}`;
    const dislikedKey = `comment_disliked_${commentId}`;
    const hasLiked = localStorage.getItem(likedKey) === 'true';
    const hasDisliked = localStorage.getItem(dislikedKey) === 'true';
    
    // 找到对应的评论元素
    const commentItem = document.querySelector(`[data-id="${commentId}"]`);
    if (!commentItem) {
        console.error('找不到评论元素:', commentId);
        return;
    }
    
    const actionBtns = commentItem.querySelectorAll('.comment-action-btn');
    const likeBtn = actionBtns[0];
    const dislikeBtn = actionBtns[1];
    
    if (!likeBtn || !dislikeBtn) {
        console.error('找不到按钮');
        return;
    }
    
    const likeCount = likeBtn.querySelector('.count');
    const dislikeCount = dislikeBtn.querySelector('.count');
    
    try {
        if (hasDisliked) {
            // 已差评，取消差评：调用API -1
            await window.blogDataStore.undislikeComment(commentId);
            
            // 更新UI
            localStorage.removeItem(dislikedKey);
            dislikeBtn.classList.remove('active');
            dislikeCount.textContent = Math.max(0, parseInt(dislikeCount.textContent) - 1);
            
            console.log('✅ 取消差评成功');
        } else {
            // 如果已经点赞，先取消点赞
            if (hasLiked) {
                await window.blogDataStore.unlikeComment(commentId);
                localStorage.removeItem(likedKey);
                likeBtn.classList.remove('active');
                likeCount.textContent = Math.max(0, parseInt(likeCount.textContent) - 1);
                console.log('✅ 自动取消点赞');
            }
            
            // 执行差评：调用API +1
            await window.blogDataStore.dislikeComment(commentId);
            
            // 更新UI
            localStorage.setItem(dislikedKey, 'true');
            dislikeBtn.classList.add('active');
            dislikeCount.textContent = parseInt(dislikeCount.textContent) + 1;
            
            console.log('✅ 差评成功');
        }
    } catch (error) {
        console.error('❌ 差评操作失败:', error);
    }
}

// 验证邮箱
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 加载相关文章（异步）
async function loadRelatedArticles() {
    const relatedList = document.getElementById('relatedList');
    
    try {
        // 获取同分类或同标签的文章
        const allArticles = await window.blogDataStore.getArticles('published');
        const related = allArticles
            .filter(article => 
                article.id !== currentArticle.id && 
                (article.category === currentArticle.category || 
                 (article.tags && currentArticle.tags && article.tags.some(tag => currentArticle.tags.includes(tag))))
            )
            .slice(0, 3);
        
        if (related.length === 0) {
            relatedList.innerHTML = '<p style="text-align: center; color: #999;">暂无相关文章</p>';
            return;
        }
        
        relatedList.innerHTML = related.map(article => `
            <a href="article.html?id=${article.id}" class="related-item">
                <div class="related-item-title">${article.title}</div>
                <div class="related-item-meta">
                    <span>${article.publishDate || article.date}</span>
                    <span> · </span>
                    <span>${article.category}</span>
                </div>
            </a>
        `).join('');
    } catch (error) {
        console.error('加载相关文章失败:', error);
        relatedList.innerHTML = '<p style="text-align: center; color: #999;">加载失败</p>';
    }
}

// 显示错误
function showError(message) {
    document.getElementById('articleDetail').innerHTML = `
        <div style="text-align: center; padding: 4rem; color: #999;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">😕</div>
            <h2>${message}</h2>
            <p style="margin-top: 1rem;">
                <a href="../index.html" style="color: #4fc3f7;">返回首页</a>
            </p>
        </div>
    `;
}

// 计算时间差
function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
        return '刚刚';
    } else if (minutes < 60) {
        return `${minutes}分钟前`;
    } else if (hours < 24) {
        return `${hours}小时前`;
    } else if (days < 30) {
        return `${days}天前`;
    } else {
        return date.toLocaleDateString('zh-CN');
    }
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '100000',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    });
    
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
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


// 为所有代码块添加复制按钮
function addCopyButtonsToCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.article-content pre');
    
    codeBlocks.forEach((block, index) => {
        // 检查是否已经添加了复制按钮
        if (block.querySelector('.code-copy-btn')) {
            return;
        }
        
        // 创建复制按钮
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.innerHTML = '<span class="icon">📋</span><span class="text">复制</span>';
        copyBtn.setAttribute('data-index', index);
        
        // 添加点击事件
        copyBtn.addEventListener('click', function() {
            const code = block.querySelector('code');
            const text = code ? code.textContent : block.textContent;
            
            // 复制到剪贴板
            navigator.clipboard.writeText(text).then(() => {
                // 显示复制成功
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = '<span class="icon">✓</span><span class="text">已复制</span>';
                
                // 2秒后恢复原状
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = '<span class="icon">📋</span><span class="text">复制</span>';
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
                // 降级方案：使用旧的复制方法
                fallbackCopyTextToClipboard(text, copyBtn);
            });
        });
        
        // 将按钮添加到代码块
        block.appendChild(copyBtn);
    });
}

// 降级复制方案（兼容旧浏览器）
function fallbackCopyTextToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            button.classList.add('copied');
            button.innerHTML = '<span class="icon">✓</span><span class="text">已复制</span>';
            
            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = '<span class="icon">📋</span><span class="text">复制</span>';
            }, 2000);
        }
    } catch (err) {
        console.error('降级复制方案也失败了:', err);
        alert('复制失败，请手动复制');
    }
    
    document.body.removeChild(textArea);
}

// 在文章渲染完成后调用
document.addEventListener('DOMContentLoaded', function() {
    // 延迟执行，确保文章内容已经渲染
    setTimeout(() => {
        addCopyButtonsToCodeBlocks();
    }, 500);
});

// 如果文章内容是动态加载的，也需要在加载完成后调用
// 可以在 renderArticle 函数的最后添加调用


// 增加文章浏览量
async function incrementArticleViews(articleId) {
    try {
        const response = await fetch(`http://localhost:3001/api/articles/${articleId}/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ 文章 ${articleId} 浏览量已更新:`, result.data.views);
            
            // 更新页面显示
            const viewsElement = document.getElementById('articleViews');
            if (viewsElement && result.data.views) {
                viewsElement.textContent = result.data.views;
            }
        }
    } catch (error) {
        console.error('❌ 更新文章浏览量失败:', error);
    }
}
