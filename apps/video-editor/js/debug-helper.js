/**
 * 视频编辑器调试助手
 * 在主页面中提供调试功能
 */

class VideoEditorDebugHelper {
    constructor() {
        this.debugPanel = null;
        this.isVisible = false;
        this.logs = [];
        
        this.init();
    }

    /**
     * 初始化调试助手
     */
    init() {
        // 创建调试面板
        this.createDebugPanel();
        
        // 监听键盘快捷键 (F12 或 Ctrl+Shift+D)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'D')) {
                e.preventDefault();
                this.toggle();
            }
        });
        
        // 拦截控制台日志
        this.interceptConsole();
        
        VideoEditorUtils.log('info', 'Debug Helper initialized - Press F12 or Ctrl+Shift+D to toggle');
    }

    /**
     * 创建调试面板
     */
    createDebugPanel() {
        this.debugPanel = document.createElement('div');
        this.debugPanel.id = 'videoEditorDebugPanel';
        this.debugPanel.innerHTML = `
            <div class="debug-header">
                <h3>🔧 视频编辑器调试面板</h3>
                <div class="debug-controls">
                    <button class="debug-btn" onclick="debugHelper.runAllTests()">全部测试</button>
                    <button class="debug-btn" onclick="debugHelper.clearLogs()">清空日志</button>
                    <button class="debug-btn" onclick="debugHelper.exportLogs()">导出日志</button>
                    <button class="debug-close" onclick="debugHelper.hide()">&times;</button>
                </div>
            </div>
            
            <div class="debug-content">
                <div class="debug-tabs">
                    <button class="debug-tab active" onclick="debugHelper.showTab('status')">状态</button>
                    <button class="debug-tab" onclick="debugHelper.showTab('tests')">测试</button>
                    <button class="debug-tab" onclick="debugHelper.showTab('logs')">日志</button>
                    <button class="debug-tab" onclick="debugHelper.showTab('performance')">性能</button>
                </div>
                
                <div class="debug-tab-content">
                    <div id="debug-status" class="debug-tab-panel active">
                        <div id="statusContent">点击"全部测试"开始检测...</div>
                    </div>
                    
                    <div id="debug-tests" class="debug-tab-panel">
                        <div class="debug-test-group">
                            <h4>浏览器支持测试</h4>
                            <button class="debug-btn" onclick="debugHelper.testBrowserSupport()">检查浏览器支持</button>
                            <div id="browserTestResult"></div>
                        </div>
                        
                        <div class="debug-test-group">
                            <h4>类加载测试</h4>
                            <button class="debug-btn" onclick="debugHelper.testClassLoading()">检查类加载</button>
                            <div id="classTestResult"></div>
                        </div>
                        
                        <div class="debug-test-group">
                            <h4>DOM元素测试</h4>
                            <button class="debug-btn" onclick="debugHelper.testDOMElements()">检查DOM元素</button>
                            <div id="domTestResult"></div>
                        </div>
                        
                        <div class="debug-test-group">
                            <h4>视频编辑器测试</h4>
                            <button class="debug-btn" onclick="debugHelper.testVideoEditor()">测试编辑器状态</button>
                            <div id="editorTestResult"></div>
                        </div>
                    </div>
                    
                    <div id="debug-logs" class="debug-tab-panel">
                        <div class="debug-log-controls">
                            <select id="logLevel">
                                <option value="all">所有日志</option>
                                <option value="error">错误</option>
                                <option value="warn">警告</option>
                                <option value="info">信息</option>
                                <option value="debug">调试</option>
                            </select>
                            <button class="debug-btn" onclick="debugHelper.filterLogs()">过滤</button>
                        </div>
                        <div id="logContent" class="debug-log-content"></div>
                    </div>
                    
                    <div id="debug-performance" class="debug-tab-panel">
                        <div id="performanceContent">
                            <button class="debug-btn" onclick="debugHelper.testPerformance()">性能测试</button>
                            <div id="performanceResult"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加样式
        this.addDebugStyles();
        
        // 添加到页面
        document.body.appendChild(this.debugPanel);
        
        // 默认隐藏
        this.hide();
    }

    /**
     * 添加调试面板样式
     */
    addDebugStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #videoEditorDebugPanel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 500px;
                max-height: 80vh;
                background: #1a1a1a;
                border: 1px solid #444;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                z-index: 10000;
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 13px;
                color: #fff;
                display: none;
            }
            
            .debug-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: #2d2d2d;
                border-bottom: 1px solid #444;
                border-radius: 8px 8px 0 0;
            }
            
            .debug-header h3 {
                margin: 0;
                font-size: 16px;
                color: #fff;
            }
            
            .debug-controls {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            
            .debug-btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.2s;
            }
            
            .debug-btn:hover {
                background: #0056b3;
            }
            
            .debug-close {
                background: #dc3545;
                color: white;
                border: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .debug-content {
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .debug-tabs {
                display: flex;
                background: #2d2d2d;
                border-bottom: 1px solid #444;
            }
            
            .debug-tab {
                background: none;
                border: none;
                color: #ccc;
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: all 0.2s;
            }
            
            .debug-tab:hover {
                background: #3a3a3a;
                color: #fff;
            }
            
            .debug-tab.active {
                color: #007bff;
                border-bottom-color: #007bff;
                background: #3a3a3a;
            }
            
            .debug-tab-content {
                padding: 15px;
            }
            
            .debug-tab-panel {
                display: none;
            }
            
            .debug-tab-panel.active {
                display: block;
            }
            
            .debug-test-group {
                margin-bottom: 20px;
                padding: 15px;
                background: #2d2d2d;
                border-radius: 6px;
                border: 1px solid #444;
            }
            
            .debug-test-group h4 {
                margin: 0 0 10px 0;
                color: #fff;
                font-size: 14px;
            }
            
            .debug-log-content {
                background: #000;
                color: #0f0;
                padding: 10px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                max-height: 300px;
                overflow-y: auto;
                white-space: pre-wrap;
                line-height: 1.4;
            }
            
            .debug-log-controls {
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
                align-items: center;
            }
            
            .debug-log-controls select {
                background: #2d2d2d;
                color: #fff;
                border: 1px solid #444;
                padding: 4px 8px;
                border-radius: 4px;
            }
            
            .test-result {
                margin-top: 10px;
                padding: 10px;
                border-radius: 4px;
                font-size: 12px;
            }
            
            .test-success {
                background: #155724;
                color: #d4edda;
                border: 1px solid #c3e6cb;
            }
            
            .test-error {
                background: #721c24;
                color: #f8d7da;
                border: 1px solid #f5c6cb;
            }
            
            .test-warning {
                background: #856404;
                color: #fff3cd;
                border: 1px solid #ffeaa7;
            }
            
            .status-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #444;
            }
            
            .status-item:last-child {
                border-bottom: none;
            }
            
            .status-label {
                color: #ccc;
            }
            
            .status-value {
                color: #fff;
                font-weight: bold;
            }
            
            .status-ok {
                color: #28a745;
            }
            
            .status-error {
                color: #dc3545;
            }
            
            .status-warning {
                color: #ffc107;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 拦截控制台日志
     */
    interceptConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        console.log = (...args) => {
            this.addLog('log', args.join(' '));
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            this.addLog('error', args.join(' '));
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            this.addLog('warn', args.join(' '));
            originalWarn.apply(console, args);
        };

        console.info = (...args) => {
            this.addLog('info', args.join(' '));
            originalInfo.apply(console, args);
        };
    }

    /**
     * 添加日志
     */
    addLog(level, message) {
        const timestamp = new Date().toLocaleTimeString();
        this.logs.push({
            timestamp,
            level,
            message
        });

        // 限制日志数量
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-500);
        }

        // 更新日志显示
        this.updateLogDisplay();
    }

    /**
     * 更新日志显示
     */
    updateLogDisplay() {
        const logContent = document.getElementById('logContent');
        if (!logContent) return;

        const filteredLogs = this.getFilteredLogs();
        const logText = filteredLogs.map(log => 
            `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`
        ).join('\n');

        logContent.textContent = logText;
        logContent.scrollTop = logContent.scrollHeight;
    }

    /**
     * 获取过滤后的日志
     */
    getFilteredLogs() {
        const levelSelect = document.getElementById('logLevel');
        const selectedLevel = levelSelect ? levelSelect.value : 'all';

        if (selectedLevel === 'all') {
            return this.logs;
        }

        return this.logs.filter(log => log.level === selectedLevel);
    }

    /**
     * 显示/隐藏调试面板
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 显示调试面板
     */
    show() {
        this.debugPanel.style.display = 'block';
        this.isVisible = true;
        this.updateLogDisplay();
    }

    /**
     * 隐藏调试面板
     */
    hide() {
        this.debugPanel.style.display = 'none';
        this.isVisible = false;
    }

    /**
     * 显示标签页
     */
    showTab(tabName) {
        // 隐藏所有标签页
        document.querySelectorAll('.debug-tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.querySelectorAll('.debug-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // 显示选中的标签页
        const panel = document.getElementById(`debug-${tabName}`);
        const tab = event.target;
        
        if (panel) panel.classList.add('active');
        if (tab) tab.classList.add('active');
    }

    /**
     * 运行所有测试
     */
    runAllTests() {
        this.testBrowserSupport();
        this.testClassLoading();
        this.testDOMElements();
        this.testVideoEditor();
        this.updateStatusTab();
    }

    /**
     * 测试浏览器支持
     */
    testBrowserSupport() {
        const result = document.getElementById('browserTestResult');
        if (!result) return;

        try {
            const support = VideoEditorUtils.checkBrowserSupport();
            const browserInfo = VideoEditorUtils.getBrowserInfo();

            let html = `
                <div class="test-result ${support.fullSupport ? 'test-success' : 'test-warning'}">
                    <h5>浏览器信息</h5>
                    <p>浏览器: ${this.getBrowserName(browserInfo)} ${browserInfo.version}</p>
                    <p>HTTPS: ${VideoEditorUtils.isHTTPS() ? '✅' : '❌'}</p>
                    
                    <h5>API支持</h5>
                    <p>Canvas API: ${support.canvas ? '✅' : '❌'}</p>
                    <p>Web Audio API: ${support.webAudio ? '✅' : '❌'}</p>
                    <p>MediaRecorder API: ${support.mediaRecorder ? '✅' : '❌'}</p>
                    <p>File API: ${support.fileAPI ? '✅' : '❌'}</p>
                    <p><strong>完整支持: ${support.fullSupport ? '✅' : '❌'}</strong></p>
                </div>
            `;

            result.innerHTML = html;
        } catch (error) {
            result.innerHTML = `<div class="test-result test-error">错误: ${error.message}</div>`;
        }
    }

    /**
     * 测试类加载
     */
    testClassLoading() {
        const result = document.getElementById('classTestResult');
        if (!result) return;

        const classes = [
            'VideoEditorUtils', 'MediaManager', 'Timeline', 'AudioMixer',
            'TextRenderer', 'ExportManager', 'UIController', 'VideoEditor'
        ];

        let html = '<div class="test-result">';
        let allLoaded = true;

        classes.forEach(className => {
            const isLoaded = typeof window[className] !== 'undefined';
            html += `<p>${className}: ${isLoaded ? '✅' : '❌'}</p>`;
            if (!isLoaded) allLoaded = false;
        });

        html += `<p><strong>所有类已加载: ${allLoaded ? '✅' : '❌'}</strong></p>`;
        html += '</div>';

        result.innerHTML = html;
        result.firstChild.className += allLoaded ? ' test-success' : ' test-error';
    }

    /**
     * 测试DOM元素
     */
    testDOMElements() {
        const result = document.getElementById('domTestResult');
        if (!result) return;

        const elements = [
            'videoEditor', 'previewContainer', 'timelineRuler', 'timelineTracks',
            'importVideo', 'playBtn', 'pauseBtn', 'stopBtn'
        ];

        let html = '<div class="test-result">';
        let allFound = true;

        elements.forEach(elementId => {
            const element = document.getElementById(elementId);
            html += `<p>#${elementId}: ${element ? '✅' : '❌'}</p>`;
            if (!element) allFound = false;
        });

        html += `<p><strong>所有元素已找到: ${allFound ? '✅' : '❌'}</strong></p>`;
        html += '</div>';

        result.innerHTML = html;
        result.firstChild.className += allFound ? ' test-success' : ' test-error';
    }

    /**
     * 测试视频编辑器
     */
    testVideoEditor() {
        const result = document.getElementById('editorTestResult');
        if (!result) return;

        try {
            const app = window.getVideoEditorApp ? window.getVideoEditorApp() : null;
            
            let html = '<div class="test-result">';
            
            if (app) {
                const editor = app.videoEditor;
                const state = editor ? editor.getProjectState() : null;
                
                html += `<p>应用实例: ${app ? '✅' : '❌'}</p>`;
                html += `<p>编辑器实例: ${editor ? '✅' : '❌'}</p>`;
                html += `<p>画布: ${editor && editor.canvas ? '✅' : '❌'}</p>`;
                html += `<p>上下文: ${editor && editor.ctx ? '✅' : '❌'}</p>`;
                html += `<p>媒体管理器: ${editor && editor.mediaManager ? '✅' : '❌'}</p>`;
                html += `<p>时间轴: ${editor && editor.timeline ? '✅' : '❌'}</p>`;
                
                if (state) {
                    html += `<h5>项目状态</h5>`;
                    html += `<p>有视频: ${state.hasVideo ? '✅' : '❌'}</p>`;
                    html += `<p>音频轨道: ${state.audioTrackCount}</p>`;
                    html += `<p>文字轨道: ${state.textTrackCount}</p>`;
                    html += `<p>时长: ${VideoEditorUtils.formatTime(state.duration)}</p>`;
                    html += `<p>正在播放: ${state.isPlaying ? '✅' : '❌'}</p>`;
                }
                
                html += '</div>';
                result.innerHTML = html;
                result.firstChild.className += ' test-success';
            } else {
                html += '<p>视频编辑器应用未初始化</p></div>';
                result.innerHTML = html;
                result.firstChild.className += ' test-warning';
            }
        } catch (error) {
            result.innerHTML = `<div class="test-result test-error">错误: ${error.message}</div>`;
        }
    }

    /**
     * 更新状态标签页
     */
    updateStatusTab() {
        const statusContent = document.getElementById('statusContent');
        if (!statusContent) return;

        try {
            const app = window.getVideoEditorApp ? window.getVideoEditorApp() : null;
            const support = VideoEditorUtils.checkBrowserSupport();
            
            let html = '<div class="status-overview">';
            
            // 总体状态
            html += `<div class="status-item">
                <span class="status-label">总体状态:</span>
                <span class="status-value ${app && support.fullSupport ? 'status-ok' : 'status-error'}">
                    ${app && support.fullSupport ? '正常' : '异常'}
                </span>
            </div>`;
            
            // 浏览器支持
            html += `<div class="status-item">
                <span class="status-label">浏览器支持:</span>
                <span class="status-value ${support.fullSupport ? 'status-ok' : 'status-error'}">
                    ${support.fullSupport ? '完全支持' : '部分支持'}
                </span>
            </div>`;
            
            // 应用状态
            html += `<div class="status-item">
                <span class="status-label">应用状态:</span>
                <span class="status-value ${app ? 'status-ok' : 'status-error'}">
                    ${app ? '已初始化' : '未初始化'}
                </span>
            </div>`;
            
            if (app && app.videoEditor) {
                const state = app.videoEditor.getProjectState();
                
                html += `<div class="status-item">
                    <span class="status-label">项目状态:</span>
                    <span class="status-value ${state.hasVideo ? 'status-ok' : 'status-warning'}">
                        ${state.hasVideo ? '有视频' : '无视频'}
                    </span>
                </div>`;
                
                html += `<div class="status-item">
                    <span class="status-label">轨道数量:</span>
                    <span class="status-value">
                        视频:${state.hasVideo ? 1 : 0} 音频:${state.audioTrackCount} 文字:${state.textTrackCount}
                    </span>
                </div>`;
            }
            
            html += '</div>';
            statusContent.innerHTML = html;
        } catch (error) {
            statusContent.innerHTML = `<div class="test-result test-error">状态更新失败: ${error.message}</div>`;
        }
    }

    /**
     * 性能测试
     */
    testPerformance() {
        const result = document.getElementById('performanceResult');
        if (!result) return;

        const startTime = performance.now();
        
        // 测试画布渲染性能
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        
        const renderStart = performance.now();
        for (let i = 0; i < 100; i++) {
            ctx.fillStyle = `hsl(${i * 3.6}, 50%, 50%)`;
            ctx.fillRect(i * 10, i * 5, 100, 100);
        }
        const renderTime = performance.now() - renderStart;
        
        const totalTime = performance.now() - startTime;
        
        let html = `
            <div class="test-result test-success">
                <h5>性能测试结果</h5>
                <p>画布渲染测试 (100次): ${renderTime.toFixed(2)}ms</p>
                <p>总测试时间: ${totalTime.toFixed(2)}ms</p>
                <p>内存使用: ${this.getMemoryUsage()}</p>
                <p>FPS估算: ${(1000 / (renderTime / 100)).toFixed(1)} fps</p>
            </div>
        `;
        
        result.innerHTML = html;
    }

    /**
     * 获取内存使用情况
     */
    getMemoryUsage() {
        if (performance.memory) {
            const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
            const total = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
            return `${used}MB / ${total}MB`;
        }
        return '不可用';
    }

    /**
     * 获取浏览器名称
     */
    getBrowserName(browserInfo) {
        if (browserInfo.isChrome) return 'Chrome';
        if (browserInfo.isFirefox) return 'Firefox';
        if (browserInfo.isSafari) return 'Safari';
        if (browserInfo.isEdge) return 'Edge';
        return 'Unknown';
    }

    /**
     * 过滤日志
     */
    filterLogs() {
        this.updateLogDisplay();
    }

    /**
     * 清空日志
     */
    clearLogs() {
        this.logs = [];
        this.updateLogDisplay();
    }

    /**
     * 导出日志
     */
    exportLogs() {
        const logText = this.logs.map(log => 
            `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`
        ).join('\n');
        
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video-editor-debug-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// 全局调试助手实例
let debugHelper = null;

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保其他脚本已加载
    setTimeout(() => {
        debugHelper = new VideoEditorDebugHelper();
        window.debugHelper = debugHelper; // 暴露到全局作用域
    }, 1000);
});