/**
 * 视频编辑器主类
 * 统一管理所有编辑功能和组件
 */

class VideoEditor {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        
        // 核心组件
        this.mediaManager = new MediaManager();
        this.timeline = null;
        this.audioMixer = new AudioMixer();
        this.textRenderer = new TextRenderer();
        this.exportManager = new ExportManager();
        
        // 项目状态
        this.project = {
            duration: 0,
            fps: 30,
            width: 1920,
            height: 1080,
            tracks: {
                video: null,
                audio: [],
                text: []
            }
        };
        
        // 播放状态
        this.isPlaying = false;
        this.currentTime = 0;
        this.playbackRate = 1.0;
        this.renderLoop = null;
        
        // 初始化
        this.init();
    }

    /**
     * 初始化编辑器
     */
    init() {
        try {
            // 检查浏览器支持
            this.checkBrowserSupport();
            
            // 设置画布
            this.setupCanvas();
            
            // 初始化时间轴
            this.setupTimeline();
            
            // 设置事件监听器
            this.setupEventListeners();
            
            // 开始渲染循环
            this.startRenderLoop();
            
            VideoEditorUtils.log('info', 'Video Editor initialized successfully');
            
        } catch (error) {
            VideoEditorUtils.log('error', 'Failed to initialize Video Editor', error);
            VideoEditorUtils.showError('视频编辑器初始化失败: ' + error.message);
        }
    }

    /**
     * 检查浏览器支持
     */
    checkBrowserSupport() {
        const support = VideoEditorUtils.checkBrowserSupport();
        
        if (!support.fullSupport) {
            const missing = [];
            if (!support.canvas) missing.push('Canvas API');
            if (!support.webAudio) missing.push('Web Audio API');
            if (!support.mediaRecorder) missing.push('MediaRecorder API');
            if (!support.fileAPI) missing.push('File API');
            
            throw new Error(`浏览器不支持以下功能: ${missing.join(', ')}`);
        }
        
        // 检查HTTPS
        if (!VideoEditorUtils.isHTTPS()) {
            VideoEditorUtils.showError('建议在HTTPS环境下使用以获得最佳体验', 3000);
        }
    }

    /**
     * 设置画布
     */
    setupCanvas() {
        // 如果画布已存在，先清理
        if (this.canvas) {
            this.canvas.remove();
        }
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.project.width;
        this.canvas.height = this.project.height;
        
        // 设置画布样式，确保不会超出容器
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.maxHeight = '100%';
        this.canvas.style.width = 'auto';
        this.canvas.style.height = 'auto';
        this.canvas.style.display = 'block';
        this.canvas.style.objectFit = 'contain';
        this.canvas.style.backgroundColor = '#000';
        
        this.ctx = this.canvas.getContext('2d');
        
        // 添加到预览容器
        const previewContainer = document.getElementById('previewContainer');
        if (previewContainer) {
            // 清除占位符但保持容器结构
            previewContainer.innerHTML = '';
            previewContainer.appendChild(this.canvas);
            
            // 确保容器样式正确
            previewContainer.style.display = 'flex';
            previewContainer.style.alignItems = 'center';
            previewContainer.style.justifyContent = 'center';
            previewContainer.style.overflow = 'hidden';
            previewContainer.style.width = '100%';
            previewContainer.style.height = '100%';
        }
        
        VideoEditorUtils.log('debug', 'Canvas setup completed', {
            width: this.canvas.width,
            height: this.canvas.height,
            containerSize: previewContainer ? {
                width: previewContainer.offsetWidth,
                height: previewContainer.offsetHeight
            } : null
        });
    }

    /**
     * 设置时间轴
     */
    setupTimeline() {
        try {
            this.timeline = new Timeline();
            
            // 设置时间轴回调
            this.timeline.onTimeChange = (time) => {
                this.setCurrentTime(time);
            };
            
            this.timeline.onItemSelect = (itemId, itemType) => {
                this.handleItemSelect(itemId, itemType);
            };
            
            this.timeline.onItemMove = (itemId, newTime) => {
                this.handleItemMove(itemId, newTime);
            };
        } catch (error) {
            VideoEditorUtils.log('warn', 'Timeline initialization failed, using fallback', error);
            // 创建一个简单的时间轴替代品
            this.timeline = {
                setDuration: (duration) => { /* 占位符 */ },
                addVideoTrack: (videoData) => { /* 占位符 */ },
                addAudioTrack: (audioTrack) => { /* 占位符 */ },
                addTextTrack: (textTrack) => { /* 占位符 */ },
                setCurrentTime: (time) => { /* 占位符 */ },
                clearAllTracks: () => { /* 占位符 */ },
                updateRuler: () => { /* 占位符 */ }
            };
        }
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 播放控制
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        if (playBtn) {
            playBtn.addEventListener('click', () => this.play());
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pause());
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stop());
        }
        
        // 时间滑块
        const timeSlider = document.getElementById('timeSlider');
        if (timeSlider) {
            timeSlider.addEventListener('input', (e) => {
                const time = (e.target.value / 100) * this.project.duration;
                this.setCurrentTime(time);
            });
        }
    }

    /**
     * 导入视频文件
     * @param {File} file - 视频文件
     * @returns {Promise<Object>} 视频数据
     */
    async importVideo(file) {
        try {
            VideoEditorUtils.log('info', 'Importing video', { name: file.name });
            
            const videoData = await this.mediaManager.loadVideo(file);
            
            // 更新项目设置
            this.project.tracks.video = videoData;
            this.project.duration = videoData.duration;
            this.project.width = videoData.width;
            this.project.height = videoData.height;
            
            // 重新设置画布
            this.setupCanvas();
            
            // 设置视频元素事件监听器
            const video = videoData.element;
            video.addEventListener('loadeddata', () => {
                this.renderFrame();
            });
            
            video.addEventListener('timeupdate', () => {
                if (!this.isPlaying) {
                    this.renderFrame();
                }
            });
            
            // 更新时间轴
            if (this.timeline) {
                this.timeline.setDuration(this.project.duration);
                this.timeline.addVideoTrack(videoData);
            }
            
            // 更新UI
            this.updateProjectInfo();
            this.enableControls();
            
            // 渲染第一帧
            video.currentTime = 0;
            setTimeout(() => {
                this.renderFrame();
            }, 100);
            
            VideoEditorUtils.log('info', 'Video imported successfully', {
                duration: VideoEditorUtils.formatTime(videoData.duration),
                resolution: `${videoData.width}x${videoData.height}`
            });
            
            return videoData;
            
        } catch (error) {
            VideoEditorUtils.log('error', 'Failed to import video', error);
            VideoEditorUtils.showError('导入视频失败: ' + error.message);
            throw error;
        }
    }

    /**
     * 添加背景音乐
     * @param {File} file - 音频文件
     * @param {number} startTime - 开始时间
     * @returns {Promise<Object>} 音频轨道
     */
    async addBackgroundMusic(file, startTime = 0) {
        try {
            VideoEditorUtils.log('info', 'Adding background music', { name: file.name });
            
            const audioData = await this.mediaManager.loadAudio(file);
            
            // 创建音频轨道
            const audioTrack = {
                id: audioData.id,
                name: audioData.name,
                buffer: audioData.buffer,
                startTime: startTime,
                duration: audioData.duration,
                volume: 0.5,
                fadeIn: 0,
                fadeOut: 0
            };
            
            // 添加到项目
            this.project.tracks.audio.push(audioTrack);
            
            // 添加到音频混合器
            this.audioMixer.addTrack(audioTrack);
            
            // 更新时间轴
            this.timeline.addAudioTrack(audioTrack);
            
            VideoEditorUtils.log('info', 'Background music added successfully');
            
            return audioTrack;
            
        } catch (error) {
            VideoEditorUtils.log('error', 'Failed to add background music', error);
            VideoEditorUtils.showError('添加背景音乐失败: ' + error.message);
            throw error;
        }
    }

    /**
     * 添加文字
     * @param {string} text - 文字内容
     * @param {number} startTime - 开始时间
     * @param {number} duration - 持续时间
     * @param {Object} style - 样式对象
     * @returns {Object} 文字轨道
     */
    addText(text, startTime, duration, style = {}) {
        try {
            // 创建文字轨道，直接使用传入的样式
            const textTrack = {
                id: VideoEditorUtils.generateId(),
                text: text,
                startTime: startTime,
                duration: duration,
                style: {
                    fontSize: 48,
                    fontFamily: 'Arial, sans-serif',
                    color: '#ffffff',
                    backgroundColor: VideoEditorUtils.colorToRgba('#000000', 0.7),
                    padding: 20,
                    borderRadius: 10,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    x: this.project.width / 2,
                    y: this.project.height / 2,
                    ...style  // 覆盖默认样式
                }
            };
            
            // 添加到项目
            this.project.tracks.text.push(textTrack);
            
            // 更新时间轴
            if (this.timeline) {
                this.timeline.addTextTrack(textTrack);
            }
            
            VideoEditorUtils.log('info', 'Text added successfully', {
                text: text.substring(0, 20) + '...',
                startTime,
                duration,
                position: { x: textTrack.style.x, y: textTrack.style.y }
            });
            
            return textTrack;
            
        } catch (error) {
            VideoEditorUtils.log('error', 'Failed to add text', error);
            VideoEditorUtils.showError('添加文字失败: ' + error.message);
            throw error;
        }
    }

    /**
     * 计算文字位置
     * @param {string} position - 位置预设
     * @param {number} customX - 自定义X坐标百分比
     * @param {number} customY - 自定义Y坐标百分比
     * @param {number} canvasWidth - 画布宽度
     * @param {number} canvasHeight - 画布高度
     * @returns {Object} 位置信息
     */
    calculateTextPosition(position, customX, customY, canvasWidth, canvasHeight) {
        let x, y, textAlign, textBaseline;
        
        switch (position) {
            case 'top':
                x = canvasWidth / 2;
                y = canvasHeight * 0.1;
                textAlign = 'center';
                textBaseline = 'top';
                break;
            case 'bottom':
                x = canvasWidth / 2;
                y = canvasHeight * 0.9;
                textAlign = 'center';
                textBaseline = 'bottom';
                break;
            case 'left':
                x = canvasWidth * 0.1;
                y = canvasHeight / 2;
                textAlign = 'left';
                textBaseline = 'middle';
                break;
            case 'right':
                x = canvasWidth * 0.9;
                y = canvasHeight / 2;
                textAlign = 'right';
                textBaseline = 'middle';
                break;
            case 'top-left':
                x = canvasWidth * 0.1;
                y = canvasHeight * 0.1;
                textAlign = 'left';
                textBaseline = 'top';
                break;
            case 'top-right':
                x = canvasWidth * 0.9;
                y = canvasHeight * 0.1;
                textAlign = 'right';
                textBaseline = 'top';
                break;
            case 'bottom-left':
                x = canvasWidth * 0.1;
                y = canvasHeight * 0.9;
                textAlign = 'left';
                textBaseline = 'bottom';
                break;
            case 'bottom-right':
                x = canvasWidth * 0.9;
                y = canvasHeight * 0.9;
                textAlign = 'right';
                textBaseline = 'bottom';
                break;
            case 'custom':
                x = canvasWidth * (customX / 100);
                y = canvasHeight * (customY / 100);
                textAlign = 'center';
                textBaseline = 'middle';
                break;
            default: // center
                x = canvasWidth / 2;
                y = canvasHeight / 2;
                textAlign = 'center';
                textBaseline = 'middle';
                break;
        }
        
        return { x, y, textAlign, textBaseline };
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 颜色转RGBA
     * @param {string} color - 颜色值
     * @param {number} alpha - 透明度
     * @returns {string} RGBA颜色值
     */
    colorToRgba(color, alpha) {
        // 简单的颜色转换，实际项目中可能需要更复杂的处理
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return color;
    }

    /**
     * 显示错误信息
     * @param {string} message - 错误信息
     */
    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        if (errorElement && errorText) {
            errorText.textContent = message;
            errorElement.style.display = 'block';
            
            // 3秒后自动隐藏
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
        } else {
            alert(message);
        }
    }

    /**
     * 播放
     */
    play() {
        if (this.isPlaying || !this.project.tracks.video) return;
        
        this.isPlaying = true;
        this.playStartTime = Date.now() - (this.currentTime * 1000);
        
        // 设置视频播放
        const video = this.project.tracks.video.element;
        if (video) {
            video.currentTime = this.currentTime;
            video.play().catch(error => {
                VideoEditorUtils.log('warn', 'Video play failed', error);
            });
        }
        
        // 开始音频播放
        this.audioMixer.play(this.currentTime);
        
        // 更新播放按钮
        this.updatePlayButtons(true);
        
        VideoEditorUtils.log('debug', 'Playback started', { currentTime: this.currentTime });
    }

    /**
     * 暂停
     */
    pause() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        
        // 暂停视频
        const video = this.project.tracks.video.element;
        if (video) {
            video.pause();
        }
        
        // 暂停音频
        this.audioMixer.pause();
        
        // 更新播放按钮
        this.updatePlayButtons(false);
        
        VideoEditorUtils.log('debug', 'Playback paused');
    }

    /**
     * 停止
     */
    stop() {
        this.isPlaying = false;
        this.currentTime = 0;
        
        // 停止视频
        const video = this.project.tracks.video.element;
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
        
        // 停止音频
        this.audioMixer.stop();
        
        // 更新时间显示
        this.updateTimeDisplay();
        if (this.timeline) {
            this.timeline.setCurrentTime(0);
        }
        
        // 更新播放按钮
        this.updatePlayButtons(false);
        
        // 渲染第一帧
        this.renderFrame();
        
        VideoEditorUtils.log('debug', 'Playback stopped');
    }

    /**
     * 设置播放时间
     * @param {number} time - 时间（秒）
     */
    setCurrentTime(time) {
        this.currentTime = Math.max(0, Math.min(time, this.project.duration));
        
        // 更新视频时间
        if (this.project.tracks.video && this.project.tracks.video.element) {
            const video = this.project.tracks.video.element;
            // 只有在时间差异较大时才更新，避免频繁设置
            if (Math.abs(video.currentTime - this.currentTime) > 0.1) {
                video.currentTime = this.currentTime;
            }
        }
        
        // 更新音频时间
        this.audioMixer.setCurrentTime(this.currentTime);
        
        // 更新时间轴
        if (this.timeline) {
            this.timeline.setCurrentTime(this.currentTime);
        }
        
        // 更新UI
        this.updateTimeDisplay();
        
        // 如果不在播放状态，立即渲染一帧
        if (!this.isPlaying) {
            this.renderFrame();
        }
    }

    /**
     * 渲染当前帧
     */
    renderFrame() {
        if (!this.ctx || !this.canvas) return;
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 渲染视频帧
        if (this.project.tracks.video && this.project.tracks.video.element) {
            const video = this.project.tracks.video.element;
            try {
                // 检查视频是否已加载并且有数据
                if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
                    // 直接绘制视频帧，不管是否在播放
                    this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
                } else if (video.readyState === 1) {
                    // 视频元数据已加载但没有数据
                    this.ctx.fillStyle = '#1a1a1a';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = '20px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('准备中...', this.canvas.width / 2, this.canvas.height / 2);
                } else {
                    // 视频还在加载
                    this.ctx.fillStyle = '#1a1a1a';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = '20px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('加载中...', this.canvas.width / 2, this.canvas.height / 2);
                }
            } catch (error) {
                VideoEditorUtils.log('warn', 'Failed to render video frame', error);
                
                // 显示错误占位符
                this.ctx.fillStyle = '#2d2d2d';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '18px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('视频渲染错误', this.canvas.width / 2, this.canvas.height / 2);
            }
        } else {
            // 没有视频时显示占位符
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#666666';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('请导入视频', this.canvas.width / 2, this.canvas.height / 2);
        }
        
        // 渲染文字
        if (this.textRenderer && this.project.tracks.text) {
            this.project.tracks.text.forEach(textTrack => {
                if (this.currentTime >= textTrack.startTime && 
                    this.currentTime <= textTrack.startTime + textTrack.duration) {
                    this.textRenderer.render(this.ctx, textTrack);
                }
            });
        }
    }

    /**
     * 开始渲染循环
     */
    startRenderLoop() {
        const render = () => {
            // 更新播放时间
            if (this.isPlaying && this.project.tracks.video) {
                const video = this.project.tracks.video.element;
                if (video && !video.paused) {
                    // 使用视频元素的当前时间，更准确
                    this.currentTime = video.currentTime;
                    
                    // 更新UI显示
                    this.updateTimeDisplay();
                    if (this.timeline) {
                        this.timeline.setCurrentTime(this.currentTime);
                    }
                    
                    // 检查是否播放结束
                    if (this.currentTime >= this.project.duration) {
                        this.stop();
                    }
                } else {
                    // 如果视频暂停了，停止播放
                    if (this.isPlaying) {
                        this.pause();
                    }
                }
            }
            
            // 渲染当前帧
            this.renderFrame();
            
            // 继续循环
            this.renderLoop = requestAnimationFrame(render);
        };
        
        render();
    }

    /**
     * 停止渲染循环
     */
    stopRenderLoop() {
        if (this.renderLoop) {
            cancelAnimationFrame(this.renderLoop);
            this.renderLoop = null;
        }
    }

    /**
     * 导出视频
     * @param {Object} options - 导出选项
     * @returns {Promise<Object>} 导出结果
     */
    async exportVideo(options = {}) {
        try {
            VideoEditorUtils.log('info', 'Starting video export', options);
            
            // 验证项目
            if (!this.project.tracks.video) {
                throw new Error('没有视频轨道，无法导出');
            }
            
            // 设置进度回调
            this.exportManager.setProgressCallback((progress, frame, totalFrames) => {
                this.updateExportProgress(progress, frame, totalFrames);
            });
            
            // 开始导出
            const result = await this.exportManager.export(this.project, options);
            
            VideoEditorUtils.log('info', 'Video export completed successfully');
            VideoEditorUtils.showSuccess('视频导出完成！');
            
            return result;
            
        } catch (error) {
            VideoEditorUtils.log('error', 'Video export failed', error);
            VideoEditorUtils.showError('视频导出失败: ' + error.message);
            throw error;
        }
    }

    /**
     * 处理项目选中
     * @param {string} itemId - 项目ID
     * @param {string} itemType - 项目类型
     */
    handleItemSelect(itemId, itemType) {
        // 更新属性面板
        this.updatePropertiesPanel(itemId, itemType);
        
        VideoEditorUtils.log('debug', 'Item selected', { itemId, itemType });
    }

    /**
     * 处理项目移动
     * @param {string} itemId - 项目ID
     * @param {number} newTime - 新时间
     */
    handleItemMove(itemId, newTime) {
        // 更新项目数据
        const item = this.findTrackItem(itemId);
        if (item) {
            item.startTime = newTime;
            
            // 如果是音频轨道，更新音频混合器
            if (item.type === 'audio') {
                // 重新设置音频轨道时间
                this.audioMixer.setCurrentTime(this.currentTime);
            }
        }
        
        VideoEditorUtils.log('debug', 'Item moved', { itemId, newTime });
    }

    /**
     * 查找轨道项目
     * @param {string} itemId - 项目ID
     * @returns {Object|null} 项目对象
     */
    findTrackItem(itemId) {
        // 查找视频轨道
        if (this.project.tracks.video && this.project.tracks.video.id === itemId) {
            return this.project.tracks.video;
        }
        
        // 查找音频轨道
        const audioItem = this.project.tracks.audio.find(item => item.id === itemId);
        if (audioItem) return audioItem;
        
        // 查找文字轨道
        const textItem = this.project.tracks.text.find(item => item.id === itemId);
        if (textItem) return textItem;
        
        return null;
    }

    /**
     * 更新项目信息显示
     */
    updateProjectInfo() {
        const resolutionElement = document.getElementById('projectResolution');
        const durationElement = document.getElementById('projectDuration');
        const fpsElement = document.getElementById('projectFps');
        
        if (resolutionElement) {
            resolutionElement.textContent = `${this.project.width}x${this.project.height}`;
        }
        
        if (durationElement) {
            durationElement.textContent = VideoEditorUtils.formatTime(this.project.duration);
        }
        
        if (fpsElement) {
            fpsElement.textContent = `${this.project.fps} fps`;
        }
    }

    /**
     * 更新时间显示
     */
    updateTimeDisplay() {
        const currentTimeElement = document.getElementById('currentTime');
        const totalTimeElement = document.getElementById('totalTime');
        const timeSlider = document.getElementById('timeSlider');
        
        if (currentTimeElement) {
            currentTimeElement.textContent = VideoEditorUtils.formatTime(this.currentTime);
        }
        
        if (totalTimeElement) {
            totalTimeElement.textContent = VideoEditorUtils.formatTime(this.project.duration);
        }
        
        if (timeSlider && this.project.duration > 0) {
            timeSlider.value = (this.currentTime / this.project.duration) * 100;
        }
    }

    /**
     * 更新播放按钮状态
     * @param {boolean} isPlaying - 是否正在播放
     */
    updatePlayButtons(isPlaying) {
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (playBtn && pauseBtn) {
            playBtn.style.display = isPlaying ? 'none' : 'flex';
            pauseBtn.style.display = isPlaying ? 'flex' : 'none';
        }
    }

    /**
     * 启用控件
     */
    enableControls() {
        const timeSlider = document.getElementById('timeSlider');
        const playBtn = document.getElementById('playBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        if (timeSlider) timeSlider.disabled = false;
        if (playBtn) playBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = false;
    }

    /**
     * 更新属性面板
     * @param {string} itemId - 项目ID
     * @param {string} itemType - 项目类型
     */
    updatePropertiesPanel(itemId, itemType) {
        const propertiesGroup = document.getElementById('selectedItemProperties');
        const propertiesContent = document.getElementById('selectedItemContent');
        
        if (!propertiesGroup || !propertiesContent) return;
        
        const item = this.findTrackItem(itemId);
        if (!item) {
            propertiesGroup.style.display = 'none';
            return;
        }
        
        propertiesGroup.style.display = 'block';
        
        // 根据项目类型显示不同的属性
        let html = '';
        
        if (itemType === 'video') {
            html = `
                <div class="property-item">
                    <label>名称:</label>
                    <span>${item.name}</span>
                </div>
                <div class="property-item">
                    <label>时长:</label>
                    <span>${VideoEditorUtils.formatTime(item.duration)}</span>
                </div>
                <div class="property-item">
                    <label>分辨率:</label>
                    <span>${item.width}x${item.height}</span>
                </div>
            `;
        } else if (itemType === 'audio') {
            html = `
                <div class="property-item">
                    <label>名称:</label>
                    <span>${item.name}</span>
                </div>
                <div class="property-item">
                    <label>开始时间:</label>
                    <span>${VideoEditorUtils.formatTime(item.startTime)}</span>
                </div>
                <div class="property-item">
                    <label>时长:</label>
                    <span>${VideoEditorUtils.formatTime(item.duration)}</span>
                </div>
                <div class="property-item">
                    <label>音量:</label>
                    <span>${Math.round(item.volume * 100)}%</span>
                </div>
            `;
        } else if (itemType === 'text') {
            html = `
                <div class="property-item">
                    <label>文字:</label>
                    <span>${item.text.substring(0, 20)}...</span>
                </div>
                <div class="property-item">
                    <label>开始时间:</label>
                    <span>${VideoEditorUtils.formatTime(item.startTime)}</span>
                </div>
                <div class="property-item">
                    <label>时长:</label>
                    <span>${VideoEditorUtils.formatTime(item.duration)}</span>
                </div>
                <div class="property-item">
                    <label>字体大小:</label>
                    <span>${item.style.fontSize}px</span>
                </div>
            `;
        }
        
        propertiesContent.innerHTML = html;
    }

    /**
     * 更新导出进度
     * @param {number} progress - 进度百分比
     * @param {number} frame - 当前帧
     * @param {number} totalFrames - 总帧数
     */
    updateExportProgress(progress, frame, totalFrames) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        
        if (progressText) {
            progressText.textContent = `正在导出... ${Math.round(progress)}% (${frame}/${totalFrames})`;
        }
    }

    /**
     * 获取项目状态
     * @returns {Object} 项目状态
     */
    getProjectState() {
        return {
            hasVideo: !!this.project.tracks.video,
            audioTrackCount: this.project.tracks.audio.length,
            textTrackCount: this.project.tracks.text.length,
            duration: this.project.duration,
            currentTime: this.currentTime,
            isPlaying: this.isPlaying
        };
    }

    /**
     * 清理资源
     */
    cleanup() {
        // 停止播放
        this.stop();
        
        // 停止渲染循环
        this.stopRenderLoop();
        
        // 清理媒体管理器
        this.mediaManager.cleanupAll();
        
        // 清理音频混合器
        this.audioMixer.cleanup();
        
        // 清理时间轴
        if (this.timeline) {
            this.timeline.clearAllTracks();
        }
        
        VideoEditorUtils.log('info', 'Video Editor cleaned up');
    }
}

// 导出视频编辑器类
window.VideoEditor = VideoEditor;