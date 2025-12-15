/* ========================================
   文章抓取工具 - 前端逻辑
   ======================================== */

let currentMarkdown = '';
let currentTitle = '';

// 显示状态消息
function showStatus(message, type = 'info') {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
}

// 隐藏状态消息
function hideStatus() {
    const status = document.getElementById('status');
    status.style.display = 'none';
}

// 抓取文章
async function scrapeArticle() {
    const urlInput = document.getElementById('articleUrl');
    const url = urlInput.value.trim();
    
    if (!url) {
        showStatus('❌ 请输入文章URL地址', 'error');
        return;
    }

    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        showStatus('❌ 请输入有效的URL地址', 'error');
        return;
    }

    const btn = document.getElementById('scrapeBtn');
    btn.disabled = true;
    btn.textContent = '⏳ 抓取中...';
    
    showStatus('🔄 正在抓取文章内容...', 'info');
    document.getElementById('preview').style.display = 'none';

    try {
        // 调用后端API
        const response = await fetch('http://localhost:3001/api/scrape-article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const result = await response.json();

        if (result.success) {
            currentMarkdown = result.markdown;
            currentTitle = result.title || 'article';
            
            // 显示预览
            document.getElementById('markdownContent').textContent = currentMarkdown;
            document.getElementById('preview').style.display = 'block';
            
            showStatus('✅ 抓取成功！', 'success');
        } else {
            showStatus(`❌ 抓取失败: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('抓取错误:', error);
        let errorMsg = '❌ 抓取失败';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMsg = '❌ 无法连接到服务器\n\n⚠️ 请先启动服务器：\n1. 双击运行 start-unified-server.bat\n2. 等待看到"服务器已启动"\n3. 重新尝试抓取';
        } else {
            errorMsg = '❌ 抓取失败：' + error.message + '\n\n请检查网络连接或URL是否正确';
        }
        
        showStatus(errorMsg, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '🚀 开始抓取';
    }
}

// 下载Markdown文件
function downloadMarkdown() {
    if (!currentMarkdown) {
        showStatus('❌ 没有可下载的内容', 'error');
        return;
    }

    // 创建Blob对象
    const blob = new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFilename(currentTitle)}.md`;
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    
    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('✅ 文件已下载！', 'success');
}

// 清理文件名
function sanitizeFilename(filename) {
    return filename
        .replace(/[<>:"/\\|?*]/g, '-')
        .replace(/\s+/g, '_')
        .substring(0, 100);
}

// 回车键触发抓取
document.getElementById('articleUrl').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        scrapeArticle();
    }
});
