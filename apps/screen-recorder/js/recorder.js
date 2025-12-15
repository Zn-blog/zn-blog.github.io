/**
 * 屏幕录制工具 - 录制核心逻辑
 * 处理屏幕捕获、录制控制和媒体流管理
 */

class ScreenRecorder {
    constructor() {
        // 录制状态
        this.isRecording = false;
        this.isPaused = false;
        this.stream = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        
        // 录制配置
        this.config = {
            video: {
                mediaSource: 'screen',
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 30 }
            },
            audio: false
        };
        
        // 时间相关
        this.startTime = null;
        this.pausedTime = 0;
        this.timer = null;
        
        // 回调函数
        this.onStateChange = null;
        this.onDataAvailable = null;
        this.onError = null;
        this.onTimeUpdate = null;
        
        // 检查浏览器支持
        this.checkSupport();
    }

    /**
     * 检查浏览器支持
     */
    checkSupport() {
        const support = Utils.checkBrowserSupport();
        
        if (!support.fullSupport) {
            const message = this.getSupportErrorMessage(support);
            Utils.log('error', 'Browser support check failed', support);
            throw new Error(message);
        }
        
        Utils.log('info', 'Browser support check passed', support);
    }

    /**
     * 获取支持错误消息
     * @param {Object} support - 支持情况
     * @returns {string} 错误消息
     */
    getSupportErrorMessage(support) {
        if (!support.screenCapture) {
            return '您的浏览器不支持屏幕捕获功能，请使用 Chrome 72+、Firefox 66+ 或 Edge 79+';
        }
        if (!support.mediaRecorder) {
            return '您的浏览器不支持媒体录制功能，请更新到最新版本';
        }
        return '您的浏览器不支持屏幕录制功能';
    }

    /**
     * 更新录制配置
     * @param {Object} newConfig - 新的配置
     */
    updateConfig(newConfig) {
        // 深度合并配置，确保嵌套对象正确更新
        if (newConfig.video) {
            this.config.video = { ...this.config.video, ...newConfig.video };
        }
        
        // 更新其他配置
        Object.keys(newConfig).forEach(key => {
            if (key !== 'video') {
                this.config[key] = newConfig[key];
            }
        });
        
        // 保存格式偏好
        if (newConfig.format) {
            this.preferredFormat = newConfig.format;
        }
        
        // 保存比特率配置
        if (newConfig.bitrate) {
            this.config.bitrate = newConfig.bitrate;
        }
        
        Utils.log('info', 'Recording config updated', this.config);
    }

    /**
     * 开始屏幕捕获
     * @returns {Promise<MediaStream>} 媒体流
     */
    async startCapture() {
        try {
            Utils.log('info', 'Starting screen capture', this.config);
            
            // 构建高质量配置
            let captureConfig = {
                video: {
                    width: this.config.video.width,
                    height: this.config.video.height,
                    frameRate: this.config.video.frameRate,
                    aspectRatio: { ideal: 16/9 },
                    // 添加更多约束以确保高质量
                    resizeMode: 'crop-and-scale'
                },
                audio: this.config.audio
            };
            
            Utils.log('info', 'Attempting capture with config', captureConfig);
            
            try {
                // 请求屏幕共享
                this.stream = await navigator.mediaDevices.getDisplayMedia(captureConfig);
                
                // 验证获得的流质量
                const videoTrack = this.stream.getVideoTracks()[0];
                if (videoTrack) {
                    const settings = videoTrack.getSettings();
                    Utils.log('info', 'Actual capture settings', {
                        width: settings.width,
                        height: settings.height,
                        frameRate: settings.frameRate,
                        aspectRatio: settings.aspectRatio
                    });
                    
                    // 如果实际设置与期望差距太大，给出提示
                    const expectedWidth = this.config.video.width.ideal;
                    const expectedHeight = this.config.video.height.ideal;
                    const expectedFrameRate = this.config.video.frameRate.ideal;
                    
                    if (settings.width < expectedWidth * 0.8 || 
                        settings.height < expectedHeight * 0.8 ||
                        settings.frameRate < expectedFrameRate * 0.8) {
                        Utils.log('warn', 'Capture quality lower than expected', {
                            expected: { width: expectedWidth, height: expectedHeight, frameRate: expectedFrameRate },
                            actual: { width: settings.width, height: settings.height, frameRate: settings.frameRate }
                        });
                    }
                }
                
            } catch (constraintError) {
                Utils.log('warn', 'High quality config failed, trying medium config', constraintError);
                
                // 尝试中等质量配置
                captureConfig = {
                    video: {
                        width: { ideal: 1920, min: 1280 },
                        height: { ideal: 1080, min: 720 },
                        frameRate: { ideal: 30, min: 15 },
                        aspectRatio: { ideal: 16/9 }
                    },
                    audio: this.config.audio
                };
                
                try {
                    this.stream = await navigator.mediaDevices.getDisplayMedia(captureConfig);
                    Utils.log('info', 'Screen capture started with medium config');
                } catch (mediumError) {
                    Utils.log('warn', 'Medium quality config failed, trying basic config', mediumError);
                    
                    // 回退到基础配置
                    captureConfig = {
                        video: true,
                        audio: this.config.audio
                    };
                    
                    this.stream = await navigator.mediaDevices.getDisplayMedia(captureConfig);
                    Utils.log('info', 'Screen capture started with basic config');
                }
            }
            
            // 监听流结束事件
            this.stream.getVideoTracks()[0].addEventListener('ended', () => {
                Utils.log('info', 'Screen sharing ended by user');
                this.handleRecordingStop();
            });
            
            Utils.log('info', 'Screen capture started successfully');
            return this.stream;
            
        } catch (error) {
            Utils.log('error', 'Failed to start screen capture', error);
            
            let errorMessage = '屏幕捕获失败';
            if (error.name === 'NotAllowedError') {
                errorMessage = '用户拒绝了屏幕共享权限，请重新尝试并允许屏幕共享';
            } else if (error.name === 'NotFoundError') {
                errorMessage = '未找到可用的屏幕源，请检查系统设置';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = '浏览器不支持屏幕捕获，请使用Chrome、Firefox或Edge浏览器';
            } else if (error.name === 'NotReadableError') {
                errorMessage = '屏幕捕获设备被占用，请关闭其他录屏软件';
            } else if (error.name === 'OverconstrainedError') {
                errorMessage = '录制参数设置过高，系统不支持此分辨率或帧率。请尝试降低录制质量设置';
            } else if (error.name === 'TypeError') {
                errorMessage = '录制配置错误，请刷新页面后重试';
            } else {
                errorMessage = `屏幕捕获失败: ${error.message || '未知错误'}`;
            }
            
            throw new Error(errorMessage);
        }
    }

    /**
     * 添加音频流
     * @param {boolean} includeMicrophone - 是否包含麦克风
     * @returns {Promise<void>}
     */
    async addAudioStream(includeMicrophone = false) {
        if (!this.stream) {
            throw new Error('请先开始屏幕捕获');
        }

        try {
            if (includeMicrophone) {
                Utils.log('info', 'Adding microphone audio');
                
                const audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        sampleRate: 44100
                    }
                });
                
                // 合并音频轨道
                const audioTrack = audioStream.getAudioTracks()[0];
                this.stream.addTrack(audioTrack);
                
                Utils.log('info', 'Microphone audio added successfully');
            }
        } catch (error) {
            Utils.log('warn', 'Failed to add microphone audio', error);
            // 音频失败不影响视频录制，只显示警告
            Utils.showError('无法访问麦克风，将只录制屏幕画面', 3000);
        }
    }

    /**
     * 开始录制
     * @returns {Promise<void>}
     */
    async startRecording() {
        if (this.isRecording) {
            throw new Error('录制已在进行中');
        }

        try {
            Utils.log('info', 'Starting recording');
            
            // 重置录制数据
            this.recordedChunks = [];
            this.startTime = Date.now();
            this.pausedTime = 0;
            
            // 获取支持的MIME类型
            const mimeType = Utils.getSupportedMimeType(this.preferredFormat || 'auto');
            Utils.log('info', 'Using MIME type', mimeType);
            
            // 创建MediaRecorder
            const options = {
                mimeType: mimeType
            };
            
            // 设置比特率（如果支持）
            if (this.config.bitrate) {
                options.videoBitsPerSecond = this.config.bitrate;
                
                // 设置音频比特率
                if (this.config.audio) {
                    options.audioBitsPerSecond = 128000; // 128 kbps 高质量音频
                }
                
                // 设置总比特率（视频+音频）
                options.bitsPerSecond = this.config.bitrate + (this.config.audio ? 128000 : 0);
            }
            
            this.mediaRecorder = new MediaRecorder(this.stream, options);
            
            // 设置事件监听器
            this.setupRecorderEvents();
            
            // 开始录制
            this.mediaRecorder.start(1000); // 每秒收集一次数据
            
            this.isRecording = true;
            this.isPaused = false;
            
            // 开始计时器
            this.startTimer();
            
            // 触发状态变化回调
            this.triggerStateChange('recording');
            
            Utils.log('info', 'Recording started successfully');
            
        } catch (error) {
            Utils.log('error', 'Failed to start recording', error);
            throw new Error('开始录制失败: ' + error.message);
        }
    }

    /**
     * 设置录制器事件监听
     */
    setupRecorderEvents() {
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                this.recordedChunks.push(event.data);
                Utils.log('debug', 'Data chunk received', { size: event.data.size });
                
                // 触发数据可用回调
                if (this.onDataAvailable) {
                    this.onDataAvailable(event.data);
                }
            }
        };

        this.mediaRecorder.onstop = () => {
            Utils.log('info', 'MediaRecorder stopped');
            this.handleRecordingStop();
        };

        this.mediaRecorder.onerror = (event) => {
            Utils.log('error', 'MediaRecorder error', event.error);
            this.handleRecordingError(event.error);
        };

        this.mediaRecorder.onpause = () => {
            Utils.log('info', 'MediaRecorder paused');
            this.triggerStateChange('paused');
        };

        this.mediaRecorder.onresume = () => {
            Utils.log('info', 'MediaRecorder resumed');
            this.triggerStateChange('recording');
        };
    }

    /**
     * 暂停录制
     */
    pauseRecording() {
        if (!this.isRecording || this.isPaused) {
            throw new Error('当前状态无法暂停录制');
        }

        try {
            this.mediaRecorder.pause();
            this.isPaused = true;
            this.stopTimer();
            
            Utils.log('info', 'Recording paused');
            this.triggerStateChange('paused');
            
        } catch (error) {
            Utils.log('error', 'Failed to pause recording', error);
            throw new Error('暂停录制失败: ' + error.message);
        }
    }

    /**
     * 恢复录制
     */
    resumeRecording() {
        if (!this.isRecording || !this.isPaused) {
            throw new Error('当前状态无法恢复录制');
        }

        try {
            this.mediaRecorder.resume();
            this.isPaused = false;
            this.startTimer();
            
            Utils.log('info', 'Recording resumed');
            this.triggerStateChange('recording');
            
        } catch (error) {
            Utils.log('error', 'Failed to resume recording', error);
            throw new Error('恢复录制失败: ' + error.message);
        }
    }

    /**
     * 停止录制
     */
    stopRecording() {
        if (!this.isRecording) {
            throw new Error('当前没有进行录制');
        }

        try {
            Utils.log('info', 'Stopping recording');
            
            this.mediaRecorder.stop();
            this.stopTimer();
            
            // 停止所有轨道
            if (this.stream) {
                this.stream.getTracks().forEach(track => {
                    track.stop();
                });
            }
            
        } catch (error) {
            Utils.log('error', 'Failed to stop recording', error);
            throw new Error('停止录制失败: ' + error.message);
        }
    }

    /**
     * 处理录制停止
     */
    handleRecordingStop() {
        this.isRecording = false;
        this.isPaused = false;
        
        // 创建录制结果
        const blob = new Blob(this.recordedChunks, {
            type: this.mediaRecorder.mimeType || 'video/webm'
        });
        
        const duration = this.getRecordingDuration();
        const result = {
            blob: blob,
            duration: duration,
            size: blob.size,
            mimeType: blob.type,
            url: URL.createObjectURL(blob),
            filename: Utils.generateFilename(Utils.getFileExtension(blob.type))
        };
        
        Utils.log('info', 'Recording completed', {
            duration: duration,
            size: blob.size,
            type: blob.type
        });
        
        // 触发状态变化回调
        this.triggerStateChange('stopped', result);
        
        // 清理资源
        this.cleanup();
    }

    /**
     * 处理录制错误
     * @param {Error} error - 错误对象
     */
    handleRecordingError(error) {
        Utils.log('error', 'Recording error occurred', error);
        
        this.isRecording = false;
        this.isPaused = false;
        this.stopTimer();
        
        // 触发错误回调
        if (this.onError) {
            this.onError(error);
        }
        
        // 清理资源
        this.cleanup();
    }

    /**
     * 开始计时器
     */
    startTimer() {
        this.timer = setInterval(() => {
            const duration = this.getRecordingDuration();
            
            // 触发时间更新回调
            if (this.onTimeUpdate) {
                this.onTimeUpdate(duration);
            }
        }, 1000);
    }

    /**
     * 停止计时器
     */
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * 获取录制时长
     * @returns {number} 录制时长（秒）
     */
    getRecordingDuration() {
        if (!this.startTime) return 0;
        
        const now = Date.now();
        const elapsed = now - this.startTime - this.pausedTime;
        return Math.floor(elapsed / 1000);
    }

    /**
     * 触发状态变化回调
     * @param {string} state - 新状态
     * @param {any} data - 附加数据
     */
    triggerStateChange(state, data = null) {
        if (this.onStateChange) {
            this.onStateChange(state, data);
        }
    }

    /**
     * 清理资源
     */
    cleanup() {
        // 停止计时器
        this.stopTimer();
        
        // 清理媒体流
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
        }
        
        // 清理录制器
        this.mediaRecorder = null;
        
        Utils.log('info', 'Resources cleaned up');
    }

    /**
     * 获取当前状态
     * @returns {Object} 状态对象
     */
    getState() {
        return {
            isRecording: this.isRecording,
            isPaused: this.isPaused,
            duration: this.getRecordingDuration(),
            hasStream: !!this.stream,
            chunksCount: this.recordedChunks.length
        };
    }

    /**
     * 销毁录制器
     */
    destroy() {
        if (this.isRecording) {
            this.stopRecording();
        }
        
        this.cleanup();
        
        // 清理回调
        this.onStateChange = null;
        this.onDataAvailable = null;
        this.onError = null;
        this.onTimeUpdate = null;
        
        Utils.log('info', 'ScreenRecorder destroyed');
    }
}

// 导出录制器类
window.ScreenRecorder = ScreenRecorder;