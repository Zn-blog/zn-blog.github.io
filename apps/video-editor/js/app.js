/**
 * 视频编辑器应用入口
 * 初始化和启动应用
 */

class VideoEditorApp {
    constructor() {
        this.videoEditor = null;
        this.uiController = null;
        this.isInitialized = false;
        
        // 应用配置
        this.config = {
            name: '视频剪辑工具',
            version: '1.0.0',
            author: 'Video Editor Team',
            debug: false
        };
        
        this.init();
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            VideoEditorUtils.log('info', `Initializing ${this.config.name} v${this.config.version}`);
            
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // 检查必要的DOM元素
            this.checkRequiredElements();
            
            // 初始化核心组件
            await this.initializeComponents();
            
            // 设置全局事件监听器
            this.setupGlobalEventListeners();
            
            // 显示欢迎信息
            this.showWelcomeMessage();
            
            this.isInitialized = true;
            
            VideoEditorUtils.log('info', 'Video Editor App initialized successfully');
            
        } catch (error) {
            VideoEditorUtils.log('error', 'Failed to initialize Video Editor App', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * 检查必要的DOM元素
     */
    checkRequiredElements() {
        const requiredElements = [
            'videoEditor',
            'previewContainer',
            'timelineRuler',
            'timelineTracks'
        ];
        
        const missingElements = [];
        
        requiredElements.forEach(id => {
            if (!document.getElementById(id)) {
                missingElements.push(id);
            }
        });
        
        if (missingElements.length > 0) {
            throw new Error(`缺少必要的DOM元素: ${missingElements.join(', ')}`);
        }
    }

    /**
     * 初始化核心组件
     */
    async initializeComponents() {
        // 初始化视频编辑器
        const container = document.getElementById('videoEditor');
        this.videoEditor = new VideoEditor(container);
        
        // 初始化UI控制器
        this.uiController = new UIController(this.videoEditor);
        
        // 设置拖拽上传
        this.uiController.setupDragAndDrop();
        
        VideoEditorUtils.log('info', 'Core components initialized');
    }

    /**
     * 设置全局事件监听器
     */
    setupGlobalEventListeners() {
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyDown(e);
        });
        
        // 窗口大小变化
        window.addEventListener('resize', VideoEditorUtils.debounce(() => {
            this.handleWindowResize();
        }, 250));
        
        // 页面卸载前清理
        window.addEventListener('beforeunload', (e) => {
            this.handleBeforeUnload(e);
        });
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // 错误处理
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });
        
        // 未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e);
        });
        
        VideoEditorUtils.log('debug', 'Global event listeners setup');
    }

    /**
     * 处理全局键盘事件
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleGlobalKeyDown(e) {
        // 如果焦点在输入框中，不处理快捷键
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key) {
            case ' ': // 空格键 - 播放/暂停
                e.preventDefault();
                if (this.videoEditor.isPlaying) {
                    this.videoEditor.pause();
                } else {
                    this.videoEditor.play();
                }
                break;
                
            case 'Escape': // ESC键 - 关闭模态框
                const openModal = document.querySelector('.modal[style*="flex"]');
                if (openModal) {
                    this.uiController.hideModal(openModal);
                }
                break;
                
            case 'F1': // F1键 - 显示帮助
                e.preventDefault();
                this.uiController.showKeyboardShortcuts();
                break;
                
            case 'Home': // Home键 - 跳到开始
                e.preventDefault();
                this.videoEditor.setCurrentTime(0);
                break;
                
            case 'End': // End键 - 跳到结束
                e.preventDefault();
                this.videoEditor.setCurrentTime(this.videoEditor.project.duration);
                break;
        }
        
        // Ctrl组合键
        if (e.ctrlKey) {
            switch (e.key) {
                case 'o': // Ctrl+O - 打开文件
                    e.preventDefault();
                    document.getElementById('videoFileInput').click();
                    break;
                    
                case 's': // Ctrl+S - 保存项目（未来功能）
                    e.preventDefault();
                    VideoEditorUtils.showError('保存功能即将推出');
                    break;
                    
                case 'e': // Ctrl+E - 导出视频
                    e.preventDefault();
                    this.uiController.showExportModal();
                    break;
            }
        }
    }

    /**
     * 处理窗口大小变化
     */
    handleWindowResize() {
        // 重新计算画布大小和时间轴布局
        if (this.videoEditor && this.videoEditor.timeline) {
            this.videoEditor.timeline.updateRuler();
        }
        
        VideoEditorUtils.log('debug', 'Window resized, layout updated');
    }

    /**
     * 处理页面卸载前事件
     * @param {BeforeUnloadEvent} e - 卸载事件
     */
    handleBeforeUnload(e) {
        const projectState = this.videoEditor ? this.videoEditor.getProjectState() : null;
        
        // 如果有未保存的工作，提示用户
        if (projectState && (projectState.hasVideo || projectState.audioTrackCount > 0 || projectState.textTrackCount > 0)) {
            const message = '您有未保存的工作，确定要离开吗？';
            e.returnValue = message;
            return message;
        }
    }

    /**
     * 处理页面可见性变化
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // 页面隐藏时暂停播放
            if (this.videoEditor && this.videoEditor.isPlaying) {
                this.videoEditor.pause();
            }
        }
    }

    /**
     * 处理全局错误
     * @param {ErrorEvent} e - 错误事件
     */
    handleGlobalError(e) {
        VideoEditorUtils.log('error', 'Global error occurred', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            error: e.error
        });
        
        // 显示用户友好的错误消息
        VideoEditorUtils.showError('应用发生错误，请刷新页面重试');
    }

    /**
     * 处理未处理的Promise拒绝
     * @param {PromiseRejectionEvent} e - Promise拒绝事件
     */
    handleUnhandledRejection(e) {
        VideoEditorUtils.log('error', 'Unhandled promise rejection', e.reason);
        
        // 防止默认的控制台错误
        e.preventDefault();
        
        // 显示用户友好的错误消息
        VideoEditorUtils.showError('操作失败，请重试');
    }

    /**
     * 处理初始化错误
     * @param {Error} error - 错误对象
     */
    handleInitializationError(error) {
        // 显示错误页面
        const container = document.getElementById('videoEditor');
        if (container) {
            container.innerHTML = `
                <div class="error-page">
                    <div class="error-icon">⚠️</div>
                    <h2>应用初始化失败</h2>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        重新加载
                    </button>
                </div>
            `;
        }
        
        // 添加错误页面样式
        const style = document.createElement('style');
        style.textContent = `
            .error-page {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                text-align: center;
                color: var(--text-primary);
                background: var(--bg-primary);
            }
            
            .error-icon {
                font-size: 64px;
                margin-bottom: 20px;
            }
            
            .error-page h2 {
                margin-bottom: 16px;
                color: var(--danger-color);
            }
            
            .error-page p {
                margin-bottom: 24px;
                color: var(--text-secondary);
                max-width: 400px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 显示欢迎信息
     */
    showWelcomeMessage() {
        const browserInfo = VideoEditorUtils.getBrowserInfo();
        const support = VideoEditorUtils.checkBrowserSupport();
        
        VideoEditorUtils.log('info', 'Welcome to Video Editor', {
            browser: `${browserInfo.isChrome ? 'Chrome' : browserInfo.isFirefox ? 'Firefox' : browserInfo.isSafari ? 'Safari' : browserInfo.isEdge ? 'Edge' : 'Unknown'} ${browserInfo.version}`,
            support: support,
            https: VideoEditorUtils.isHTTPS()
        });
        
        // 显示使用提示
        setTimeout(() => {
            if (!this.videoEditor.getProjectState().hasVideo) {
                VideoEditorUtils.showSuccess('欢迎使用视频剪辑工具！点击"导入视频"开始编辑', 5000);
            }
        }, 1000);
    }

    /**
     * 获取应用信息
     * @returns {Object} 应用信息
     */
    getAppInfo() {
        return {
            ...this.config,
            initialized: this.isInitialized,
            browserSupport: VideoEditorUtils.checkBrowserSupport(),
            browserInfo: VideoEditorUtils.getBrowserInfo(),
            projectState: this.videoEditor ? this.videoEditor.getProjectState() : null
        };
    }

    /**
     * 启用调试模式
     */
    enableDebugMode() {
        this.config.debug = true;
        
        // 添加调试信息到页面
        const debugInfo = document.createElement('div');
        debugInfo.id = 'debugInfo';
        debugInfo.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            max-width: 300px;
        `;
        document.body.appendChild(debugInfo);
        
        // 定期更新调试信息
        setInterval(() => {
            if (this.videoEditor) {
                const state = this.videoEditor.getProjectState();
                debugInfo.innerHTML = `
                    <strong>Debug Info:</strong><br>
                    Current Time: ${VideoEditorUtils.formatTime(state.currentTime)}<br>
                    Duration: ${VideoEditorUtils.formatTime(state.duration)}<br>
                    Playing: ${state.isPlaying}<br>
                    Video: ${state.hasVideo ? 'Yes' : 'No'}<br>
                    Audio Tracks: ${state.audioTrackCount}<br>
                    Text Tracks: ${state.textTrackCount}
                `;
            }
        }, 1000);
        
        VideoEditorUtils.log('info', 'Debug mode enabled');
    }

    /**
     * 清理应用资源
     */
    cleanup() {
        if (this.videoEditor) {
            this.videoEditor.cleanup();
        }
        
        // 移除调试信息
        const debugInfo = document.getElementById('debugInfo');
        if (debugInfo) {
            debugInfo.remove();
        }
        
        VideoEditorUtils.log('info', 'Video Editor App cleaned up');
    }
}

// 全局应用实例
let videoEditorApp = null;

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    videoEditorApp = new VideoEditorApp();
    
    // 开发模式下启用调试
    if (window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) {
        videoEditorApp.enableDebugMode();
    }
});

// 导出到全局作用域（用于调试）
window.VideoEditorApp = VideoEditorApp;
window.getVideoEditorApp = () => videoEditorApp;