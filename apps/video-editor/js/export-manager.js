/**
 * 导出管理器
 * 处理视频导出和编码
 */

class ExportManager {
    constructor() {
        this.isExporting = false;
        this.exportCanvas = null;
        this.exportCtx = null;
        this.mediaRecorder = null;
        this.exportProgress = 0;
        this.onProgress = null;
    }

    /**
     * 导出视频
     * @param {Object} project - 项目数据
     * @param {Object} options - 导出选项
     * @returns {Promise<Object>} 导出结果
     */
    async export(project, options = {}) {
        if (this.isExporting) {
            throw new Error('导出已在进行中');
        }

        this.isExporting = true;
        this.exportProgress = 0;

        try {
            VideoEditorUtils.log('info', 'Export started', options);

            // 设置默认选项
            const exportOptions = {
                format: 'webm',
                quality: 'high',
                fps: 30,
                ...options
            };

            // 验证项目数据
            this.validateProject(project);

            // 设置导出画布
            this.setupExportCanvas(project.width, project.height);

            // 获取画布流
            const canvasStream = this.exportCanvas.captureStream(exportOptions.fps);

            // 添加音频流
            const audioStream = await this.createAudioStream(project);
            if (audioStream) {
                const audioTrack = audioStream.getAudioTracks()[0];
                canvasStream.addTrack(audioTrack);
            }

            // 设置录制器
            const mimeType = VideoEditorUtils.getSupportedMimeType(exportOptions.format);
            const recordOptions = {
                mimeType: mimeType,
                videoBitsPerSecond: this.getBitrate(exportOptions.quality)
            };

            this.mediaRecorder = new MediaRecorder(canvasStream, recordOptions);

            // 收集录制数据
            const chunks = [];
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            // 开始录制
            this.mediaRecorder.start(100); // 每100ms收集一次数据

            // 渲染所有帧
            await this.renderAllFrames(project, exportOptions.fps);

            // 停止录制
            this.mediaRecorder.stop();

            // 等待录制完成
            const blob = await new Promise((resolve) => {
                this.mediaRecorder.onstop = () => {
                    const finalBlob = new Blob(chunks, { type: mimeType });
                    resolve(finalBlob);
                };
            });

            // 创建结果对象
            const result = {
                blob: blob,
                url: URL.createObjectURL(blob),
                filename: VideoEditorUtils.generateFilename(
                    VideoEditorUtils.getFileExtension(mimeType),
                    'video-edit'
                ),
                size: blob.size,
                duration: project.duration,
                mimeType: mimeType,
                options: exportOptions
            };

            VideoEditorUtils.log('info', 'Export completed successfully', {
                size: VideoEditorUtils.formatFileSize(result.size),
                duration: VideoEditorUtils.formatTime(result.duration),
                format: exportOptions.format
            });

            return result;

        } catch (error) {
            VideoEditorUtils.log('error', 'Export failed', error);
            throw error;
        } finally {
            this.isExporting = false;
            this.cleanup();
        }
    }

    /**
     * 验证项目数据
     * @param {Object} project - 项目数据
     */
    validateProject(project) {
        if (!project) {
            throw new Error('项目数据不能为空');
        }

        if (!project.tracks || !project.tracks.video) {
            throw new Error('项目必须包含视频轨道');
        }

        if (project.duration <= 0) {
            throw new Error('项目时长必须大于0');
        }

        if (!project.width || !project.height) {
            throw new Error('项目必须设置分辨率');
        }
    }

    /**
     * 设置导出画布
     * @param {number} width - 画布宽度
     * @param {number} height - 画布高度
     */
    setupExportCanvas(width, height) {
        this.exportCanvas = document.createElement('canvas');
        this.exportCanvas.width = width;
        this.exportCanvas.height = height;
        this.exportCtx = this.exportCanvas.getContext('2d');

        VideoEditorUtils.log('debug', 'Export canvas setup', { width, height });
    }

    /**
     * 渲染所有帧
     * @param {Object} project - 项目数据
     * @param {number} fps - 帧率
     */
    async renderAllFrames(project, fps) {
        const frameDuration = 1 / fps;
        const totalFrames = Math.ceil(project.duration * fps);
        
        VideoEditorUtils.log('info', 'Rendering frames', { totalFrames, fps });

        for (let frame = 0; frame < totalFrames; frame++) {
            const currentTime = frame * frameDuration;
            
            // 更新进度
            this.exportProgress = (frame / totalFrames) * 100;
            if (this.onProgress) {
                this.onProgress(this.exportProgress, frame, totalFrames);
            }

            // 清空画布
            this.exportCtx.clearRect(0, 0, this.exportCanvas.width, this.exportCanvas.height);

            // 渲染视频帧
            await this.renderVideoFrame(project, currentTime);

            // 渲染文字
            this.renderTextTracks(project, currentTime);

            // 等待下一帧（控制渲染速度）
            await new Promise(resolve => setTimeout(resolve, 16));
        }

        this.exportProgress = 100;
        if (this.onProgress) {
            this.onProgress(100, totalFrames, totalFrames);
        }
    }

    /**
     * 渲染视频帧
     * @param {Object} project - 项目数据
     * @param {number} currentTime - 当前时间
     */
    async renderVideoFrame(project, currentTime) {
        const videoTrack = project.tracks.video;
        if (!videoTrack || !videoTrack.element) return;

        const video = videoTrack.element;
        
        // 设置视频时间
        if (Math.abs(video.currentTime - currentTime) > 0.1) {
            video.currentTime = currentTime;
            
            // 等待视频帧加载
            await new Promise((resolve) => {
                const onSeeked = () => {
                    video.removeEventListener('seeked', onSeeked);
                    resolve();
                };
                
                video.addEventListener('seeked', onSeeked);
                
                // 超时保护
                setTimeout(resolve, 100);
            });
        }

        // 绘制视频帧
        try {
            this.exportCtx.drawImage(
                video, 
                0, 0, 
                this.exportCanvas.width, 
                this.exportCanvas.height
            );
        } catch (error) {
            VideoEditorUtils.log('warn', 'Failed to draw video frame', error);
        }
    }

    /**
     * 渲染文字轨道
     * @param {Object} project - 项目数据
     * @param {number} currentTime - 当前时间
     */
    renderTextTracks(project, currentTime) {
        if (!project.tracks.text) return;

        const textRenderer = new TextRenderer();
        
        project.tracks.text.forEach(textTrack => {
            if (currentTime >= textTrack.startTime && 
                currentTime <= textTrack.startTime + textTrack.duration) {
                textRenderer.render(this.exportCtx, textTrack);
            }
        });
    }

    /**
     * 创建音频流
     * @param {Object} project - 项目数据
     * @returns {Promise<MediaStream|null>} 音频流
     */
    async createAudioStream(project) {
        if (!project.tracks.audio || project.tracks.audio.length === 0) {
            return null;
        }

        try {
            // 创建离线音频上下文进行混音
            const sampleRate = 44100;
            const duration = project.duration;
            const offlineContext = new OfflineAudioContext(2, duration * sampleRate, sampleRate);
            
            // 添加所有音频轨道
            project.tracks.audio.forEach(audioTrack => {
                if (audioTrack.buffer) {
                    const source = offlineContext.createBufferSource();
                    const gainNode = offlineContext.createGain();
                    
                    source.buffer = audioTrack.buffer;
                    source.connect(gainNode);
                    gainNode.connect(offlineContext.destination);
                    
                    gainNode.gain.value = audioTrack.volume || 1.0;
                    source.start(audioTrack.startTime || 0);
                }
            });

            // 渲染混合音频
            const renderedBuffer = await offlineContext.startRendering();
            
            // 创建音频流
            const audioContext = new AudioContext();
            const source = audioContext.createBufferSource();
            const destination = audioContext.createMediaStreamDestination();
            
            source.buffer = renderedBuffer;
            source.connect(destination);
            source.start();
            
            VideoEditorUtils.log('info', 'Audio stream created for export');
            return destination.stream;
            
        } catch (error) {
            VideoEditorUtils.log('error', 'Failed to create audio stream for export', error);
            return null;
        }
    }

    /**
     * 获取比特率
     * @param {string} quality - 质量等级
     * @returns {number} 比特率
     */
    getBitrate(quality) {
        const config = VideoEditorUtils.getQualityConfig(quality);
        return config.bitrate;
    }

    /**
     * 取消导出
     */
    cancelExport() {
        if (!this.isExporting) return;

        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }

        this.isExporting = false;
        this.cleanup();

        VideoEditorUtils.log('info', 'Export cancelled');
    }

    /**
     * 获取导出进度
     * @returns {number} 进度百分比
     */
    getProgress() {
        return this.exportProgress;
    }

    /**
     * 设置进度回调
     * @param {Function} callback - 进度回调函数
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    /**
     * 预估导出时间
     * @param {Object} project - 项目数据
     * @param {Object} options - 导出选项
     * @returns {number} 预估时间（秒）
     */
    estimateExportTime(project, options = {}) {
        const fps = options.fps || 30;
        const quality = options.quality || 'high';
        
        // 基础时间：每秒视频需要的处理时间
        let baseTimePerSecond = 2; // 2秒处理时间对应1秒视频
        
        // 根据质量调整
        const qualityMultiplier = {
            'low': 0.8,
            'medium': 1.0,
            'high': 1.3,
            'ultra': 1.8
        };
        
        baseTimePerSecond *= qualityMultiplier[quality] || 1.0;
        
        // 根据帧率调整
        baseTimePerSecond *= (fps / 30);
        
        // 根据文字轨道数量调整
        const textTrackCount = project.tracks.text ? project.tracks.text.length : 0;
        baseTimePerSecond += textTrackCount * 0.1;
        
        // 根据音频轨道数量调整
        const audioTrackCount = project.tracks.audio ? project.tracks.audio.length : 0;
        baseTimePerSecond += audioTrackCount * 0.2;
        
        const estimatedTime = project.duration * baseTimePerSecond;
        
        VideoEditorUtils.log('debug', 'Export time estimated', {
            duration: project.duration,
            estimatedTime: estimatedTime,
            quality: quality,
            fps: fps
        });
        
        return Math.ceil(estimatedTime);
    }

    /**
     * 获取支持的导出格式
     * @returns {Array} 支持的格式列表
     */
    getSupportedFormats() {
        const formats = [];
        
        // 检查WebM支持
        if (MediaRecorder.isTypeSupported('video/webm')) {
            formats.push({
                format: 'webm',
                name: 'WebM',
                description: '现代格式，文件小，质量高',
                mimeType: 'video/webm'
            });
        }
        
        // 检查MP4支持
        if (MediaRecorder.isTypeSupported('video/mp4')) {
            formats.push({
                format: 'mp4',
                name: 'MP4',
                description: '兼容性最好，支持所有播放器',
                mimeType: 'video/mp4'
            });
        }
        
        return formats;
    }

    /**
     * 清理资源
     */
    cleanup() {
        if (this.exportCanvas) {
            this.exportCanvas = null;
            this.exportCtx = null;
        }
        
        if (this.mediaRecorder) {
            this.mediaRecorder = null;
        }
        
        this.exportProgress = 0;
        
        VideoEditorUtils.log('debug', 'Export manager cleaned up');
    }
}

// 导出管理器类
window.ExportManager = ExportManager;