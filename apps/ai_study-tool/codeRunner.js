// 代码执行器
let pyodide = null;
let isPythonLoading = false;

// 初始化Pyodide
async function initPyodide() {
    if (pyodide) return pyodide;
    if (isPythonLoading) {
        // 如果正在加载，等待加载完成
        while (isPythonLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return pyodide;
    }
    
    isPythonLoading = true;
    showOutput('正在加载Python环境...', 'info');
    
    try {
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
        });
        showOutput('Python环境加载完成！', 'success');
        isPythonLoading = false;
        return pyodide;
    } catch (error) {
        showOutput('Python环境加载失败: ' + error.message, 'error');
        isPythonLoading = false;
        return null;
    }
}

// 执行Python代码
async function runPythonCode(code) {
    if (!pyodide) {
        pyodide = await initPyodide();
        if (!pyodide) {
            showOutput('无法加载Python环境', 'error');
            return;
        }
    }
    
    try {
        // 捕获print输出
        let output = '';
        pyodide.runPython(`
import sys
from io import StringIO

class OutputCapture:
    def __init__(self):
        self.buffer = StringIO()
    
    def write(self, s):
        self.buffer.write(s)
    
    def flush(self):
        pass
    
    def getvalue(self):
        return self.buffer.getvalue()

capture = OutputCapture()
sys.stdout = capture
sys.stderr = capture
`);
        
        // 执行用户代码
        pyodide.runPython(code);
        
        // 获取输出
        const result = pyodide.runPython('capture.getvalue()');
        if (result) {
            showOutput(result, 'output');
        } else {
            showOutput('代码执行完成（无输出）', 'info');
        }
        
        // 恢复标准输出
        pyodide.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
        
    } catch (error) {
        showOutput('错误: ' + error.message, 'error');
    }
}

// 执行JavaScript代码
function runJavaScriptCode(code) {
    try {
        // 重定向console.log
        let output = '';
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = (...args) => {
            output += args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ') + '\n';
            originalLog.apply(console, args);
        };
        
        console.error = (...args) => {
            output += '错误: ' + args.join(' ') + '\n';
            originalError.apply(console, args);
        };
        
        console.warn = (...args) => {
            output += '警告: ' + args.join(' ') + '\n';
            originalWarn.apply(console, args);
        };
        
        // 执行代码
        const result = eval(code);
        
        // 恢复console
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
        
        // 显示输出
        if (output) {
            showOutput(output, 'output');
        } else if (result !== undefined) {
            showOutput(String(result), 'output');
        } else {
            showOutput('代码执行完成（无输出）', 'info');
        }
        
    } catch (error) {
        showOutput('错误: ' + error.message, 'error');
    }
}

// 显示输出
function showOutput(text, type = 'output') {
    const outputDiv = document.getElementById('codeOutput');
    const timestamp = new Date().toLocaleTimeString();
    
    const outputLine = document.createElement('div');
    outputLine.className = `output-line output-${type}`;
    
    if (type === 'error') {
        outputLine.innerHTML = `<span class="output-time">[${timestamp}]</span> <span class="error-text">${escapeHtml(text)}</span>`;
    } else if (type === 'info') {
        outputLine.innerHTML = `<span class="output-time">[${timestamp}]</span> <span class="info-text">${escapeHtml(text)}</span>`;
    } else if (type === 'success') {
        outputLine.innerHTML = `<span class="output-time">[${timestamp}]</span> <span class="success-text">${escapeHtml(text)}</span>`;
    } else {
        outputLine.innerHTML = `<span class="output-time">[${timestamp}]</span> ${escapeHtml(text)}`;
    }
    
    outputDiv.appendChild(outputLine);
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 初始化代码测试面板
document.addEventListener('DOMContentLoaded', () => {
    const runBtn = document.getElementById('runCodeBtn');
    const clearBtn = document.getElementById('clearCodeBtn');
    const clearOutputBtn = document.getElementById('clearOutputBtn');
    const toggleBtn = document.getElementById('toggleCodePanelBtn');
    const codeEditor = document.getElementById('codeEditor');
    const codeTestBody = document.getElementById('codeTestBody');
    const codeTestPanel = document.getElementById('codeTestPanel');
    const codeResizer = document.getElementById('codeResizer');
    const editorContainer = document.querySelector('.code-editor-container');
    const outputContainer = document.querySelector('.code-output-container');
    
    let isPanelExpanded = false;  // 默认关闭
    
    // 初始化时设置为关闭状态
    if (codeTestBody && codeTestPanel) {
        codeTestBody.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        codeTestPanel.classList.add('collapsed');
    }
    let isResizing = false;
    
    // 拖拽调整左右宽度
    if (codeResizer && editorContainer && outputContainer) {
        codeResizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            
            const startX = e.clientX;
            const startEditorWidth = editorContainer.offsetWidth;
            const startOutputWidth = outputContainer.offsetWidth;
            
            const handleMouseMove = (e) => {
                if (!isResizing) return;
                
                const diffX = e.clientX - startX;
                const totalWidth = codeTestBody.offsetWidth;
                const newEditorWidth = startEditorWidth + diffX;
                const newOutputWidth = startOutputWidth - diffX;
                
                // 限制最小宽度
                const minWidth = 150;
                if (newEditorWidth >= minWidth && newOutputWidth >= minWidth) {
                    editorContainer.style.width = newEditorWidth + 'px';
                    editorContainer.style.flex = '0 0 auto';
                    outputContainer.style.width = newOutputWidth + 'px';
                    outputContainer.style.flex = '0 0 auto';
                }
            };
            
            const handleMouseUp = () => {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
    }
    
    // 运行代码
    runBtn.addEventListener('click', async () => {
        const code = codeEditor.value.trim();
        if (!code) {
            showOutput('请输入代码', 'info');
            return;
        }
        
        const language = document.getElementById('codeLanguage').value;
        showOutput(`执行 ${language === 'python' ? 'Python' : 'JavaScript'} 代码...`, 'info');
        
        if (language === 'python') {
            await runPythonCode(code);
        } else {
            runJavaScriptCode(code);
        }
    });
    
    // 清空代码
    clearBtn.addEventListener('click', () => {
        if (confirm('确定要清空代码吗？')) {
            codeEditor.value = '';
            codeEditor.focus();
        }
    });
    
    // 清空输出
    clearOutputBtn.addEventListener('click', () => {
        document.getElementById('codeOutput').innerHTML = '';
    });
    
    // 切换面板
    toggleBtn.addEventListener('click', () => {
        isPanelExpanded = !isPanelExpanded;
        if (isPanelExpanded) {
            codeTestBody.style.display = 'flex';
            toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
            codeTestPanel.classList.remove('collapsed');
        } else {
            codeTestBody.style.display = 'none';
            toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            codeTestPanel.classList.add('collapsed');
        }
    });
    
    // 快捷键：Ctrl+Enter 运行代码
    codeEditor.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            runBtn.click();
        }
    });
    
    // 代码编辑器语法高亮
    const highlightEditor = document.getElementById('codeEditorHighlight');
    if (highlightEditor) {
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };
        
        const updateHighlight = () => {
            const code = codeEditor.value;
            const language = document.getElementById('codeLanguage').value;
            
            // 先转义HTML，防止XSS
            let highlighted = escapeHtml(code);
            
            if (language === 'python') {
                // Python 关键词
                const keywords = ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'import', 'from', 'as', 'return', 'yield', 'lambda', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is'];
                keywords.forEach(keyword => {
                    const regex = new RegExp(`\\b${escapeHtml(keyword)}\\b`, 'g');
                    highlighted = highlighted.replace(regex, `<span class="keyword">${escapeHtml(keyword)}</span>`);
                });
                
                // 字符串（需要更精确的匹配）
                highlighted = highlighted.replace(/(&quot;|&#x27;)((?:(?!\1).)*?)\1/g, '<span class="string">$1$2$1</span>');
                
                // 注释
                highlighted = highlighted.replace(/#(.*)$/gm, '<span class="comment">#$1</span>');
                
                // 数字
                highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');
            } else if (language === 'javascript') {
                // JavaScript 关键词
                const keywords = ['function', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'class', 'extends', 'super', 'async', 'await'];
                keywords.forEach(keyword => {
                    const regex = new RegExp(`\\b${escapeHtml(keyword)}\\b`, 'g');
                    highlighted = highlighted.replace(regex, `<span class="keyword">${escapeHtml(keyword)}</span>`);
                });
                
                // 字符串
                highlighted = highlighted.replace(/(&quot;|&#x27;)((?:(?!\1).)*?)\1/g, '<span class="string">$1$2$1</span>');
                
                // 注释
                highlighted = highlighted.replace(/\/\/(.*)$/gm, '<span class="comment">//$1</span>');
                highlighted = highlighted.replace(/\/\*([\s\S]*?)\*\//g, '<span class="comment">/*$1*/</span>');
                
                // 数字
                highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');
            }
            
            highlightEditor.innerHTML = highlighted;
        };
        
        codeEditor.addEventListener('input', updateHighlight);
        codeEditor.addEventListener('scroll', () => {
            highlightEditor.scrollTop = codeEditor.scrollTop;
            highlightEditor.scrollLeft = codeEditor.scrollLeft;
        });
        
        // 语言切换时更新高亮
        document.getElementById('codeLanguage').addEventListener('change', updateHighlight);
        
        // 初始高亮
        updateHighlight();
    }
    
    // 从代码块复制代码到编辑器
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('copy-to-editor-btn') || 
            e.target.closest('.copy-to-editor-btn')) {
            const btn = e.target.classList.contains('copy-to-editor-btn') 
                ? e.target 
                : e.target.closest('.copy-to-editor-btn');
            const codeBlock = btn.closest('.code-block');
            if (codeBlock) {
                const code = codeBlock.querySelector('pre').textContent;
                codeEditor.value = code;
                
                // 触发input事件以更新语法高亮
                codeEditor.dispatchEvent(new Event('input'));
                
                showOutput('代码已复制到编辑器，可以修改后运行', 'success');
                // 展开面板（如果已收起）
                if (!isPanelExpanded) {
                    toggleBtn.click();
                }
                // 滚动到代码编辑器
                setTimeout(() => {
                    codeTestPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    codeEditor.focus();
                }, 100);
            }
        }
    });
});

// 预加载Pyodide（可选，提升首次运行速度）
window.addEventListener('load', () => {
    // 延迟加载，不阻塞页面
    setTimeout(() => {
        initPyodide();
    }, 2000);
});

