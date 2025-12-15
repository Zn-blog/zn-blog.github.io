/**
 * 屏幕录制工具 - UI交互管理
 * 处理用户界面交互和状态更新
 */

class UIManager {
    constructor() {
        // DOM元素引用
        this.elements = {
            // 状态指示器
            statusDot: document.getElementById('statusDot'),
            statusText: document.getElementById('statusText'),
            
            // 设置控件
            qualitySelect: document.getElementById('qualitySelect'),
            framerateSelect: document.getElementById('framerateSelect'),
            formatSelect: document.getElementById('formatSelect'),
            highQualityMode: document.getElementById('highQualityMode'),
            includeAudio: document.getElementById('includeAudio'),
            includeMicrophone: document.getElementById('includeMicrophone'),
            
            // 控制按钮
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resumeBtn: document.getElementById('resumeBtn'),
            stopBtn: document.getElementById('stopBtn'),
            
            // 预览区域
            previewVideo: document.getElementById('previewVideo'),
            previewPlaceholder: document.getElementById('previewPlaceholder'),
            
            // 录制信息
            recordingInfo: document.getElementById('recordingInfo'),
            recordingTimer: document.getElementById('recordingTimer'),
            fileSize: document.getElementById('fileSize'),
            currentFormat: document.getElementById('currentFormat'),
            recordingStatus: document.getElementById('recordingStatus'),
            
            // 下载区域
            downloadArea: document.getElementById('downloadArea'),
            downloadBtn: document.getElementById('downloadBtn'),
            newRecordingBtn: document.getElementById('newRecordingBtn'),
            downloadPreview: document.getElementById('downloadPreview'),
            
            // 错误提示
            errorMessage: document.getElementById('errorMessage'),
            errorRetry: document.getElementById('errorRetry'),
            errorClose: document.getElementById('errorClose')
        };
        
        // 当前录制结果
        this.currentRecording = null;
        
        // 初始化UI
        this.init();
    }

    /**
     * 初始化UI
     */
    init() {
        this.setupEventListeners();
        this.updateUI('ready');
        this.checkBrowserSupport();
        
        Utils.log('info', 'UI Manager initialized');
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 控制按钮事件
        this.elements.startBtn?.addEventListener('click', () => this.handleStart());
        this.elements.pauseBtn?.addEventListener('click', () => this.handlePause());
        this.elements.resumeBtn?.addEventListener('click', () => this.handleResume());
        this.elements.stopBtn?.addEventListener('click', () => this.handleStop());
        
        // 下载按钮事件
        this.elements.downloadBtn?.addEventListener('click', () => this.handleDownload());
        this.elements.newRecordingBtn?.addEventListener('click', () => this.handleNewRecording());
        
        // 错误按钮事件
        this.elements.errorRetry?.addEventListener('click', () => this.handleErrorRetry());
        this.elements.errorClose?.addEventListener('click', () => Utils.hideError());
        
        // 设置变化事件
        this.elements.qualitySelect?.addEventListener('change', () => this.handleSettingsChange());
        this.elements.framerateSelect?.addEventListener('change', () => this.handleSettingsChange());
        this.elements.formatSelect?.addEventListener('change', () => this.handleSettingsChange());
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        Utils.log('info', 'Event listeners setup completed');
    }

    /**
     * 检查浏览器支持
     */
    checkBrowserSupport() {
        const support = Utils.checkBrowserSupport();
        
        if (!support.fullSupport) {
            const message = this.getSupportMessage(support);
            this.showError(message);
            this.disableRecording();
        } else if (!Utils.isHTTPS()) {
            this.showError('屏幕录制需要在HTTPS环境下运行，请使用https://访问');
            this.disableRecording();
        }
    }

    /**
     * 获取支持信息消息
     * @param {Object} support - 支持情况
     * @returns {string} 支持消息
     */
    getSupportMessage(support) {
        const browserInfo = Utils.getBrowserInfo();
        let message = '您的浏览器不完全支持屏幕录制功能。\n\n';
        
        if (!support.screenCapture) {
            message += '• 不支持屏幕捕获API\n';
        }
        if (!support.mediaRecorder) {
            message += '• 不支持媒体录制API\n';
        }
        
        message += '\n推荐使用以下浏览器：\n';
        message += '• Chrome 72+ ✅\n';
        message += '• Firefox 66+ ✅\n';
        message += '• Edge 79+ ✅\n';
        message += '• Safari 13+ ⚠️（部分支持）';
        
        return message;
    }

    /**
     * 禁用录制功能
     */
    disableRecording() {
        this.elements.startBtn.disabled = true;
        this.elements.startBtn.textContent = '🚫 不支持录制';
        this.updateStatus('error', '不支持');
    }

    /**
     * 处理开始录制
     */
    async handleStart() {
        try {
            this.updateUI('starting');
            
            // 触发开始录制事件
            const event = new CustomEvent('startRecording', {
                detail: this.getRecordingConfig()
            });
            document.dispatchEvent(event);
            
        } catch (error) {
            Utils.log('error', 'Failed to start recording from UI', error);
            this.showError(error.message);
            this.updateUI('ready');
        }
    }

    /**
     * 处理暂停录制
     */
    handlePause() {
        try {
            const event = new CustomEvent('pauseRecording');
            document.dispatchEvent(event);
        } catch (error) {
            Utils.log('error', 'Failed to pause recording from UI', error);
            this.showError(error.message);
        }
    }

    /**
     * 处理恢复录制
     */
    handleResume() {
        try {
            const event = new CustomEvent('resumeRecording');
            document.dispatchEvent(event);
        } catch (error) {
            Utils.log('error', 'Failed to resume recording from UI', error);
            this.showError(error.message);
        }
    }

    /**
     * 处理停止录制
     */
    handleStop() {
        try {
            const event = new CustomEvent('stopRecording');
            document.dispatchEvent(event);
        } catch (error) {
            Utils.log('error', 'Failed to stop recording from UI', error);
            this.showError(error.message);
        }
    }

    /**
     * 处理下载
     */
    handleDownload() {
        if (this.currentRecording) {
            Utils.downloadBlob(this.currentRecording.blob, this.currentRecording.filename);
            Utils.log('info', 'Recording downloaded', this.currentRecording.filename);
        }
    }

    /**
     * 处理新建录制
     */
    handleNewRecording() {
        // 清理当前录制
        if (this.currentRecording && this.currentRecording.url) {
            URL.revokeObjectURL(this.currentRecording.url);
        }
        this.currentRecording = null;
        
        // 重置UI
        this.updateUI('ready');
        
        Utils.log('info', 'New recording session started');
    }

    /**
     * 处理设置变化
     */
    handleSettingsChange() {
        const config = this.getRecordingConfig();
        Utils.log('info', 'Recording settings changed', config);
        
        // 触发设置变化事件
        const event = new CustomEvent('settingsChanged', { detail: config });
        document.dispatchEvent(event);
    }

    /**
     * 处理键盘快捷键
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyboard(e) {
        // Ctrl/Cmd + R: 开始/停止录制
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            
            if (!this.elements.startBtn.disabled && this.elements.startBtn.style.display !== 'none') {
                this.handleStart();
            } else if (!this.elements.stopBtn.disabled) {
                this.handleStop();
            }
        }
        
        // 空格键: 暂停/恢复
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
            e.preventDefault();
            
            if (!this.elements.pauseBtn.disabled && this.elements.pauseBtn.style.display !== 'none') {
                this.handlePause();
            } else if (!this.elements.resumeBtn.disabled && this.elements.resumeBtn.style.display !== 'none') {
                this.handleResume();
            }
        }
    }

    /**
     * 获取录制配置
     * @returns {Object} 录制配置
     */
    getRecordingConfig() {
        const quality = this.elements.qualitySelect?.value || '1080p';
        const framerate = parseInt(this.elements.framerateSelect?.value) || 30;
        const format = this.elements.formatSelect?.value || 'auto';
        const highQualityMode = this.elements.highQualityMode?.checked || false;
        const includeAudio = this.elements.includeAudio?.checked || false;
        const includeMicrophone = this.elements.includeMicrophone?.checked || false;
        
        const qualityConfig = Utils.getQualityConfig(quality);
        
        // 高质量模式提升比特率
        let bitrate = qualityConfig.bitrate;
        if (highQualityMode) {
            bitrate = Math.floor(bitrate * 1.5); // 提升50%比特率
        }
        
        return {
            video: {
                ...qualityConfig,
                frameRate: { ideal: framerate }
            },
            audio: includeAudio,
            includeMicrophone: includeMicrophone,
            format: format,
            bitrate: bitrate,
            highQuality: highQualityMode
        };
    }

    /**
     * 更新UI状态
     * @param {string} state - 状态
     * @param {any} data - 附加数据
     */
    updateUI(state, data = null) {
        switch (state) {
            case 'ready':
                this.updateStatus('ready', '就绪');
                this.showButtons(['start']);
                this.hideRecordingInfo();
                this.hideDownloadArea();
                this.hidePreview();
                this.enableSettings();
                break;
                
            case 'starting':
                this.updateStatus('starting', '启动中...');
                this.showButtons([]);
                this.disableSettings();
                break;
                
            case 'recording':
                this.updateStatus('recording', '录制中');
                this.showButtons(['pause', 'stop']);
                this.showRecordingInfo();
                this.showPreview(data?.stream);
                this.disableSettings();
                break;
                
            case 'paused':
                this.updateStatus('paused', '已暂停');
                this.showButtons(['resume', 'stop']);
                break;
                
            case 'stopping':
                this.updateStatus('stopping', '停止中...');
                this.showButtons([]);
                break;
                
            case 'stopped':
                this.updateStatus('ready', '就绪');
                this.showButtons(['start']);
                this.hideRecordingInfo();
                this.hidePreview();
                this.showDownloadArea(data);
                this.enableSettings();
                break;
                
            case 'error':
                this.updateStatus('error', '错误');
                this.showButtons(['start']);
                this.hideRecordingInfo();
                this.hidePreview();
                this.enableSettings();
                break;
        }
        
        Utils.log('debug', 'UI updated', { state, data });
    }

    /**
     * 更新状态指示器
     * @param {string} status - 状态
     * @param {string} text - 状态文本
     */
    updateStatus(status, text) {
        if (this.elements.statusDot) {
            this.elements.statusDot.className = `status-dot ${status}`;
        }
        
        if (this.elements.statusText) {
            this.elements.statusText.textContent = text;
        }
    }

    /**
     * 显示指定按钮
     * @param {Array<string>} buttons - 要显示的按钮
     */
    showButtons(buttons) {
        const allButtons = ['start', 'pause', 'resume', 'stop'];
        
        allButtons.forEach(button => {
            const element = this.elements[button + 'Btn'];
            if (element) {
                if (buttons.includes(button)) {
                    element.style.display = 'flex';
                    element.disabled = false;
                } else {
                    element.style.display = 'none';
                }
            }
        });
    }

    /**
     * 显示录制信息
     */
    showRecordingInfo() {
        if (this.elements.recordingInfo) {
            this.elements.recordingInfo.style.display = 'block';
            this.elements.recordingInfo.classList.add('fade-in');
        }
    }

    /**
     * 隐藏录制信息
     */
    hideRecordingInfo() {
        if (this.elements.recordingInfo) {
            this.elements.recordingInfo.style.display = 'none';
            this.elements.recordingInfo.classList.remove('fade-in');
        }
    }

    /**
     * 显示预览
     * @param {MediaStream} stream - 媒体流
     */
    showPreview(stream) {
        if (stream && this.elements.previewVideo) {
            this.elements.previewVideo.srcObject = stream;
            this.elements.previewVideo.style.display = 'block';
            
            if (this.elements.previewPlaceholder) {
                this.elements.previewPlaceholder.style.display = 'none';
            }
        }
    }

    /**
     * 隐藏预览
     */
    hidePreview() {
        if (this.elements.previewVideo) {
            this.elements.previewVideo.srcObject = null;
            this.elements.previewVideo.style.display = 'none';
        }
        
        if (this.elements.previewPlaceholder) {
            this.elements.previewPlaceholder.style.display = 'flex';
        }
    }

    /**
     * 显示下载区域
     * @param {Object} recording - 录制结果
     */
    showDownloadArea(recording) {
        if (recording && this.elements.downloadArea) {
            this.currentRecording = recording;
            
            // 设置预览视频
            if (this.elements.downloadPreview && recording.url) {
                this.elements.downloadPreview.src = recording.url;
            }
            
            this.elements.downloadArea.style.display = 'block';
            this.elements.downloadArea.classList.add('fade-in');
        }
    }

    /**
     * 隐藏下载区域
     */
    hideDownloadArea() {
        if (this.elements.downloadArea) {
            this.elements.downloadArea.style.display = 'none';
            this.elements.downloadArea.classList.remove('fade-in');
        }
    }

    /**
     * 启用设置
     */
    enableSettings() {
        const settings = ['qualitySelect', 'framerateSelect', 'formatSelect', 'highQualityMode', 'includeAudio', 'includeMicrophone'];
        settings.forEach(setting => {
            if (this.elements[setting]) {
                this.elements[setting].disabled = false;
            }
        });
    }

    /**
     * 禁用设置
     */
    disableSettings() {
        const settings = ['qualitySelect', 'framerateSelect', 'formatSelect', 'highQualityMode', 'includeAudio', 'includeMicrophone'];
        settings.forEach(setting => {
            if (this.elements[setting]) {
                this.elements[setting].disabled = true;
            }
        });
    }

    /**
     * 更新录制时间
     * @param {number} duration - 录制时长（秒）
     */
    updateRecordingTime(duration) {
        if (this.elements.recordingTimer) {
            this.elements.recordingTimer.textContent = Utils.formatTime(duration);
        }
    }

    /**
     * 更新文件大小
     * @param {number} duration - 录制时长（秒）
     * @param {number} bitrate - 比特率
     */
    updateFileSize(duration, bitrate = 2500000) {
        if (this.elements.fileSize) {
            const estimatedSize = Utils.estimateFileSize(duration, bitrate);
            this.elements.fileSize.textContent = Utils.formatFileSize(estimatedSize);
        }
    }

    /**
     * 更新录制状态
     * @param {string} status - 状态文本
     */
    updateRecordingStatus(status) {
        if (this.elements.recordingStatus) {
            this.elements.recordingStatus.textContent = status;
        }
    }

    /**
     * 更新当前格式显示
     * @param {string} mimeType - MIME类型
     */
    updateCurrentFormat(mimeType) {
        if (this.elements.currentFormat) {
            let formatText = 'Unknown';
            
            if (mimeType.includes('webm')) {
                if (mimeType.includes('vp9')) {
                    formatText = 'WebM (VP9)';
                } else if (mimeType.includes('vp8')) {
                    formatText = 'WebM (VP8)';
                } else {
                    formatText = 'WebM';
                }
            } else if (mimeType.includes('mp4')) {
                if (mimeType.includes('h264')) {
                    formatText = 'MP4 (H.264)';
                } else {
                    formatText = 'MP4';
                }
            }
            
            this.elements.currentFormat.textContent = formatText;
        }
    }

    /**
     * 处理错误重试
     */
    handleErrorRetry() {
        // 隐藏错误消息
        Utils.hideError();
        
        // 重置UI状态
        this.updateUI('ready');
        
        // 触发重试事件
        const event = new CustomEvent('retryRecording');
        document.dispatchEvent(event);
    }

    /**
     * 显示错误消息
     * @param {string} message - 错误消息
     */
    showError(message) {
        Utils.showError(message);
    }

    /**
     * 销毁UI管理器
     */
    destroy() {
        // 清理录制结果
        if (this.currentRecording && this.currentRecording.url) {
            URL.revokeObjectURL(this.currentRecording.url);
        }
        
        // 清理预览视频
        if (this.elements.previewVideo) {
            this.elements.previewVideo.srcObject = null;
        }
        
        Utils.log('info', 'UI Manager destroyed');
    }
}

// 导出UI管理器类
window.UIManager = UIManager;