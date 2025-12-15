/**
 * 网站描述编辑器
 * 支持Markdown格式和实时预览
 */

class DescriptionEditor {
    constructor() {
        this.textarea = null;
        this.previewContainer = null;
        this.currentTab = 'edit';
        this.init();
    }

    /**
     * 初始化编辑器
     */
    init() {
        this.textarea = document.getElementById('siteDescription');
        this.previewContainer = document.getElementById('descriptionPreview');
        
        if (!this.textarea || !this.previewContainer) {
            console.warn('描述编辑器元素未找到');
            return;
        }

        this.bindEvents();
        this.updatePreview();
        
        console.log('✅ 网站描述编辑器初始化完成');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // 工具栏按钮
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleToolbarAction(action);
            });
        });

        // 文本变化时更新预览
        this.textarea.addEventListener('input', () => {
            this.updatePreview();
        });

        // 键盘快捷键
        this.textarea.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * 切换标签页
     */
    switchTab(tab) {
        // 更新按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}-tab`).classList.add('active');

        this.currentTab = tab;

        // 如果切换到预览标签，更新预览
        if (tab === 'preview') {
            this.updatePreview();
        }
    }

    /**
     * 处理工具栏操作
     */
    handleToolbarAction(action) {
        const textarea = this.textarea;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let replacement = '';
        let cursorOffset = 0;

        switch (action) {
            case 'bold':
                replacement = `**${selectedText || '加粗文本'}**`;
                cursorOffset = selectedText ? 0 : -4;
                break;
            
            case 'italic':
                replacement = `*${selectedText || '斜体文本'}*`;
                cursorOffset = selectedText ? 0 : -3;
                break;
            
            case 'heading':
                replacement = `### ${selectedText || '标题文本'}`;
                cursorOffset = selectedText ? 0 : -4;
                break;
            
            case 'link':
                const url = selectedText.startsWith('http') ? selectedText : 'https://example.com';
                const linkText = selectedText.startsWith('http') ? '链接文本' : (selectedText || '链接文本');
                replacement = `[${linkText}](${url})`;
                cursorOffset = selectedText ? 0 : -15;
                break;
            
            case 'list':
                const lines = selectedText.split('\n');
                replacement = lines.map(line => `- ${line || '列表项'}`).join('\n');
                cursorOffset = selectedText ? 0 : -3;
                break;
            
            case 'quote':
                replacement = `> ${selectedText || '引用内容'}`;
                cursorOffset = selectedText ? 0 : -4;
                break;
            
            case 'code':
                replacement = `\`${selectedText || '代码'}\``;
                cursorOffset = selectedText ? 0 : -3;
                break;
            
            // 文本对齐功能
            case 'align-left':
                replacement = this.wrapWithAlignment(selectedText || '左对齐文本', 'left');
                cursorOffset = selectedText ? 0 : -4;
                break;
            
            case 'align-center':
                replacement = this.wrapWithAlignment(selectedText || '居中文本', 'center');
                cursorOffset = selectedText ? 0 : -4;
                break;
            
            case 'align-right':
                replacement = this.wrapWithAlignment(selectedText || '右对齐文本', 'right');
                cursorOffset = selectedText ? 0 : -4;
                break;
        }

        // 插入文本
        this.insertText(replacement, start, end, cursorOffset);
    }

    /**
     * 包装文本对齐标记
     */
    wrapWithAlignment(text, alignment) {
        // 使用HTML div标签包装，因为Markdown本身不支持对齐
        return `<div class="text-${alignment}">${text}</div>`;
    }

    /**
     * 插入文本
     */
    insertText(text, start, end, cursorOffset = 0) {
        const textarea = this.textarea;
        const before = textarea.value.substring(0, start);
        const after = textarea.value.substring(end);
        
        textarea.value = before + text + after;
        
        // 设置光标位置
        const newCursorPos = start + text.length + cursorOffset;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
        
        // 更新预览
        this.updatePreview();
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    this.handleToolbarAction('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    this.handleToolbarAction('italic');
                    break;
                case 'k':
                    e.preventDefault();
                    this.handleToolbarAction('link');
                    break;
            }
        }
    }

    /**
     * 更新预览
     */
    updatePreview() {
        if (!this.previewContainer) return;
        
        const markdown = this.textarea.value;
        const html = this.markdownToHtml(markdown);
        this.previewContainer.innerHTML = html;
    }

    /**
     * 简单的Markdown转HTML
     */
    markdownToHtml(markdown) {
        if (!markdown.trim()) {
            return '<p style="color: #999; font-style: italic; text-align: center; padding: 40px;">预览将在这里显示...</p>';
        }

        let html = markdown;

        // 首先处理文本对齐（在HTML转义之前）
        html = html.replace(/<div class="text-left">(.*?)<\/div>/g, '<div style="text-align: left;">$1</div>');
        html = html.replace(/<div class="text-center">(.*?)<\/div>/g, '<div style="text-align: center;">$1</div>');
        html = html.replace(/<div class="text-right">(.*?)<\/div>/g, '<div style="text-align: right;">$1</div>');

        // 转义HTML标签（但保留我们刚刚添加的对齐div标签）
        html = html.replace(/&/g, '&amp;');
        
        // 临时保护对齐div标签
        const alignDivs = [];
        html = html.replace(/<div style="text-align: (left|center|right);">(.*?)<\/div>/g, (match, align, content) => {
            const placeholder = `__ALIGN_DIV_${alignDivs.length}__`;
            alignDivs.push({ align, content });
            return placeholder;
        });
        
        // 转义其他HTML标签
        html = html.replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');

        // 恢复对齐div标签
        alignDivs.forEach((div, index) => {
            html = html.replace(`__ALIGN_DIV_${index}__`, `<div style="text-align: ${div.align};">${div.content}</div>`);
        });

        // 标题
        html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // 加粗和斜体
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.*?)_/g, '<em>$1</em>');

        // 行内代码
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');

        // 链接
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // 引用
        html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

        // 无序列表
        html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
        html = html.replace(/^(\* .*$)/gm, '<li>$1</li>');
        
        // 包装列表项
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
        
        // 有序列表
        html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
        
        // 段落处理
        const lines = html.split('\n');
        const processedLines = [];
        let inList = false;
        let inBlockquote = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line) {
                if (!inList && !inBlockquote) {
                    processedLines.push('</p><p>');
                }
                continue;
            }

            if (line.startsWith('<ul>') || line.startsWith('<ol>')) {
                inList = true;
            } else if (line.startsWith('</ul>') || line.startsWith('</ol>')) {
                inList = false;
            } else if (line.startsWith('<blockquote>')) {
                inBlockquote = true;
            } else if (line.startsWith('</blockquote>')) {
                inBlockquote = false;
            }

            processedLines.push(line);
        }

        html = processedLines.join('\n');
        
        // 包装段落
        if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<blockquote')) {
            html = '<p>' + html + '</p>';
        }

        // 清理多余的段落标签
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[1-6]>)/g, '$1');
        html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<blockquote>)/g, '$1');
        html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');

        return html;
    }

    /**
     * 获取当前内容
     */
    getValue() {
        return this.textarea.value;
    }

    /**
     * 设置内容
     */
    setValue(value) {
        this.textarea.value = value;
        this.updatePreview();
    }
}

// 全局实例
let descriptionEditor = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保DOM完全加载
    setTimeout(() => {
        descriptionEditor = new DescriptionEditor();
        window.descriptionEditor = descriptionEditor; // 暴露到全局
    }, 100);
});

// 导出供其他脚本使用
window.DescriptionEditor = DescriptionEditor;