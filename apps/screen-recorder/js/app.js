/**
 * 屏幕录制工具 - 主应用程序
 * 协调录制器和UI管理器，处理应用程序逻辑
 */

class ScreenRecorderApp {
    constructor() {
        // 核心组件
        this.recorder = null;
        this.uiManager = null;
        
        // 应用状态
        this.isInitialized = false;
        this.currentConfig = null;
        
        // 初始化应用
        this.init();
    }

    /**
     * 初始化应用程序
     */
    async init() {
        try {
            Utils.log('info', 'Initializing Screen Recorder App');
            
            // 检查浏览器支持
            this.checkBrowserSupport();
            
            // 初始化UI管理器
            this.uiManager = new UIManager();
            
            // 初始化录制器
            this.recorder = new ScreenRecorder();
            
            // 设置事件监听
            this.setupEventListeners();
            
            // 设置录制器回调
            this.setupRecorderCallbacks();
            
            this.isInitialized = true;
            
            Utils.log('info', 'Screen Recorder App initialized successfully');
            
        } catch (error) {
            Utils.log('error', 'Failed to initialize app', error);
            this.handleInitError(error);
        }
    }

    /**
     * 检查浏览器支持
     */
    checkBrowserSupport() {
        const support = Utils.checkBrowserSupport();
        
        if (!support.fullSupport) {
            throw new Error('浏览器不支持屏幕录制功能');
        }
        
        if (!Utils.isHTTPS()) {
            throw new Error('屏幕录制需要在HTTPS环境下运行');
        }
        
        Utils.log('info', 'Browser support check passed');
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 录制控制事件
        document.addEventListener('startRecording', (e) => this.handleStartRecording(e.detail));
        document.addEventListener('pauseRecording', () => this.handlePauseRecording());
        document.addEventListener('resumeRecording', () => this.handleResumeRecording());
        document.addEventListener('stopRecording', () => this.handleStopRecording());
        
        // 设置变化事件
        document.addEventListener('settingsChanged', (e) => this.handleSettingsChanged(e.detail));
        
        // 重试事件
        document.addEventListener('retryRecording', () => this.handleRetry());
        
        // 页面卸载事件
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        Utils.log('info', 'Event listeners setup completed');
    }

    /**
     * 设置录制器回调
     */
    setupRecorderCallbacks() {
        // 状态变化回调
        this.recorder.onStateChange = (state, data) => {
            Utils.log('info', 'Recorder state changed', { state, data });
            this.handleRecorderStateChange(state, data);
        };
        
        // 时间更新回调
        this.recorder.onTimeUpdate = (duration) => {
            this.handleTimeUpdate(duration);
        };
        
        // 错误回调
        this.recorder.onError = (error) => {
            Utils.log('error', 'Recorder error', error);
            this.handleRecorderError(error);
        };
        
        // 数据可用回调
        this.recorder.onDataAvailable = (data) => {
            Utils.log('debug', 'Recorder data available', { size: data.size });
        };
        
        Utils.log('info', 'Recorder callbacks setup completed');
    }

    /**
     * 处理开始录制
     * @param {Object} config - 录制配置
     */
    async handleStartRecording(config) {
        try {
            Utils.log('info', 'Starting recording with config', config);
            
            // 保存当前配置
            this.currentConfig = config;
            
            // 更新录制器配置
            this.recorder.updateConfig({
                video: config.video,
                audio: config.audio,
                format: config.format
            });
            
            // 开始屏幕捕获
            const stream = await this.recorder.startCapture();
            
            // 添加音频流（如果需要）
            if (config.includeMicrophone) {
                await this.recorder.addAudioStream(true);
            }
            
            // 更新UI显示预览
            this.uiManager.updateUI('recording', { stream });
            
            // 开始录制
            await this.recorder.startRecording();
            
            // 更新格式显示
            if (this.recorder.mediaRecorder && this.recorder.mediaRecorder.mimeType) {
                this.uiManager.updateCurrentFormat(this.recorder.mediaRecorder.mimeType);
            }
            
            Utils.log('info', 'Recording started successfully');
            
        } catch (error) {
            Utils.log('error', 'Failed to start recording', error);
            
            // 提供更友好的错误提示
            let userMessage = error.message;
            if (error.message.includes('屏幕捕获失败')) {
                userMessage += '\n\n建议解决方案：\n1. 刷新页面后重试\n2. 降低录制质量设置\n3. 检查浏览器权限设置';
            }
            
            this.uiManager.showError(userMessage);
            this.uiManager.updateUI('error');
        }
    }

    /**
     * 处理暂停录制
     */
    handlePauseRecording() {
        try {
            this.recorder.pauseRecording();
            Utils.log('info', 'Recording paused');
        } catch (error) {
            Utils.log('error', 'Failed to pause recording', error);
            this.uiManager.showError(error.message);
        }
    }

    /**
     * 处理恢复录制
     */
    handleResumeRecording() {
        try {
            this.recorder.resumeRecording();
            Utils.log('info', 'Recording resumed');
        } catch (error) {
            Utils.log('error', 'Failed to resume recording', error);
            this.uiManager.showError(error.message);
        }
    }

    /**
     * 处理停止录制
     */
    handleStopRecording() {
        try {
            this.uiManager.updateUI('stopping');
            this.recorder.stopRecording();
            Utils.log('info', 'Recording stop requested');
        } catch (error) {
            Utils.log('error', 'Failed to stop recording', error);
            this.uiManager.showError(error.message);
            this.uiManager.updateUI('error');
        }
    }

    /**
     * 处理设置变化
     * @param {Object} config - 新配置
     */
    handleSettingsChanged(config) {
        this.currentConfig = config;
        Utils.log('info', 'Settings updated', config);
    }

    /**
     * 处理录制器状态变化
     * @param {string} state - 新状态
     * @param {any} data - 附加数据
     */
    handleRecorderStateChange(state, data) {
        switch (state) {
            case 'recording':
                this.uiManager.updateRecordingStatus('正在录制');
                break;
                
            case 'paused':
                this.uiManager.updateUI('paused');
                this.uiManager.updateRecordingStatus('已暂停');
                break;
                
            case 'stopped':
                this.uiManager.updateUI('stopped', data);
                this.uiManager.updateRecordingStatus('录制完成');
                break;
        }
    }

    /**
     * 处理时间更新
     * @param {number} duration - 录制时长
     */
    handleTimeUpdate(duration) {
        this.uiManager.updateRecordingTime(duration);
        
        // 更新估算文件大小
        if (this.currentConfig && this.currentConfig.bitrate) {
            this.uiManager.updateFileSize(duration, this.currentConfig.bitrate);
        }
    }

    /**
     * 处理录制器错误
     * @param {Error} error - 错误对象
     */
    handleRecorderError(error) {
        let message = '录制过程中发生错误';
        
        if (error.name === 'NotSupportedError') {
            message = '当前录制格式不被支持，请尝试其他格式';
        } else if (error.name === 'SecurityError') {
            message = '录制权限被拒绝，请检查浏览器设置';
        } else if (error.name === 'InvalidStateError') {
            message = '录制器状态异常，请刷新页面重试';
        } else if (error.message) {
            message = error.message;
        }
        
        // 添加通用解决建议
        message += '\n\n如果问题持续存在，请尝试：\n1. 刷新页面\n2. 重启浏览器\n3. 检查系统权限';
        
        this.uiManager.showError(message);
        this.uiManager.updateUI('error');
        
        // 重置录制器状态
        this.resetRecorder();
    }

    /**
     * 处理重试
     */
    handleRetry() {
        Utils.log('info', 'Retrying recording');
        
        // 重置录制器
        this.resetRecorder();
        
        // 如果有之前的配置，使用它重新开始录制
        if (this.currentConfig) {
            // 稍微延迟一下，让UI更新完成
            setTimeout(() => {
                this.handleStartRecording(this.currentConfig);
            }, 500);
        }
    }

    /**
     * 重置录制器状态
     */
    resetRecorder() {
        try {
            if (this.recorder) {
                this.recorder.cleanup();
            }
        } catch (error) {
            Utils.log('warn', 'Error during recorder reset', error);
        }
    }

    /**
     * 处理初始化错误
     * @param {Error} error - 错误对象
     */
    handleInitError(error) {
        Utils.log('error', 'App initialization failed', error);
        
        // 显示错误信息
        const errorElement = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        if (errorElement && errorText) {
            errorText.textContent = error.message;
            errorElement.style.display = 'block';
        }
        
        // 禁用所有控件
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.textContent = '🚫 初始化失败';
        }
    }

    /**
     * 处理页面卸载前事件
     * @param {BeforeUnloadEvent} e - 事件对象
     */
    handleBeforeUnload(e) {
        if (this.recorder && this.recorder.isRecording) {
            e.preventDefault();
            e.returnValue = '正在录制中，确定要离开页面吗？录制内容将会丢失。';
            return e.returnValue;
        }
    }

    /**
     * 处理页面可见性变化
     */
    handleVisibilityChange() {
        if (document.hidden) {
            Utils.log('info', 'Page hidden during recording');
        } else {
            Utils.log('info', 'Page visible during recording');
        }
    }

    /**
     * 获取应用状态
     * @returns {Object} 应用状态
     */
    getAppState() {
        return {
            isInitialized: this.isInitialized,
            recorderState: this.recorder ? this.recorder.getState() : null,
            currentConfig: this.currentConfig
        };
    }

    /**
     * 销毁应用程序
     */
    destroy() {
        Utils.log('info', 'Destroying Screen Recorder App');
        
        // 停止录制（如果正在录制）
        if (this.recorder && this.recorder.isRecording) {
            try {
                this.recorder.stopRecording();
            } catch (error) {
                Utils.log('warn', 'Error stopping recording during destroy', error);
            }
        }
        
        // 销毁组件
        if (this.recorder) {
            this.recorder.destroy();
            this.recorder = null;
        }
        
        if (this.uiManager) {
            this.uiManager.destroy();
            this.uiManager = null;
        }
        
        // 移除事件监听器
        document.removeEventListener('startRecording', this.handleStartRecording);
        document.removeEventListener('pauseRecording', this.handlePauseRecording);
        document.removeEventListener('resumeRecording', this.handleResumeRecording);
        document.removeEventListener('stopRecording', this.handleStopRecording);
        document.removeEventListener('settingsChanged', this.handleSettingsChanged);
        
        this.isInitialized = false;
        
        Utils.log('info', 'Screen Recorder App destroyed');
    }
}

// 应用程序实例
let screenRecorderApp = null;

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    try {
        screenRecorderApp = new ScreenRecorderApp();
        
        // 全局访问
        window.screenRecorderApp = screenRecorderApp;
        
        Utils.log('info', 'Screen Recorder App loaded successfully');
        
    } catch (error) {
        Utils.log('error', 'Failed to load Screen Recorder App', error);
        console.error('屏幕录制工具加载失败:', error);
    }
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (screenRecorderApp) {
        screenRecorderApp.destroy();
    }
});

// 导出应用类
window.ScreenRecorderApp = ScreenRecorderApp;