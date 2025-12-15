/**
 * 媒体管理器
 * 处理视频和音频文件的加载和管理
 */

class MediaManager {
    constructor() {
        this.loadedMedia = new Map();
        this.supportedVideoTypes = [
            'video/mp4',
            'video/webm',
            'video/ogg',
            'video/avi',
            'video/mov',
            'video/wmv'
        ];
        this.supportedAudioTypes = [
            'audio/mp3',
            'audio/wav',
            'audio/ogg',
            'audio/aac',
            'audio/m4a',
            'audio/flac'
        ];
    }

    /**
     * 检查文件类型是否支持
     * @param {File} file - 文件对象
     * @param {string} mediaType - 媒体类型 ('video' | 'audio')
     * @returns {boolean} 是否支持
     */
    isFileSupported(file, mediaType) {
        const supportedTypes = mediaType === 'video' ? 
            this.supportedVideoTypes : this.supportedAudioTypes;
        
        return supportedTypes.some(type => 
            file.type.startsWith(type.split('/')[0]) || 
            file.type === type
        );
    }

    /**
     * 加载视频文件
     * @param {File} file - 视频文件
     * @returns {Promise<Object>} 视频数据对象
     */
    async loadVideo(file) {
        return new Promise((resolve, reject) => {
            // 检查文件类型
            if (!this.isFileSupported(file, 'video')) {
                reject(new Error(`不支持的视频格式: ${file.type}`));
                return;
            }

            // 检查文件大小 (限制为1000MB)
            const maxSize = 1000 * 1024 * 1024; // 1000MB
            if (file.size > maxSize) {
                reject(new Error(`视频文件过大，请选择小于1000MB的文件`));
                return;
            }

            const video = document.createElement('video');
            const url = URL.createObjectURL(file);
            
            video.onloadedmetadata = () => {
                // 检查视频时长 (限制为60分钟)
                const maxDuration = 60 * 60; // 60分钟
                if (video.duration > maxDuration) {
                    URL.revokeObjectURL(url);
                    reject(new Error(`视频时长过长，请选择60分钟以内的视频`));
                    return;
                }

                const videoData = {
                    id: VideoEditorUtils.generateId(),
                    name: file.name,
                    element: video,
                    duration: video.duration,
                    width: video.videoWidth,
                    height: video.videoHeight,
                    size: file.size,
                    type: file.type,
                    url: url,
                    file: file
                };
                
                this.loadedMedia.set(videoData.id, videoData);
                
                VideoEditorUtils.log('info', 'Video loaded successfully', {
                    name: file.name,
                    duration: video.duration,
                    resolution: `${video.videoWidth}x${video.videoHeight}`,
                    size: VideoEditorUtils.formatFileSize(file.size)
                });
                
                resolve(videoData);
            };
            
            video.onerror = (error) => {
                URL.revokeObjectURL(url);
                VideoEditorUtils.log('error', 'Failed to load video', error);
                reject(new Error(`无法加载视频文件: ${error.message || '未知错误'}`));
            };
            
            video.onabort = () => {
                URL.revokeObjectURL(url);
                reject(new Error('视频加载被中断'));
            };
            
            // 设置视频属性
            video.preload = 'metadata';
            video.muted = true; // 避免自动播放策略问题
            video.crossOrigin = 'anonymous';
            video.src = url;
            
            // 开始加载
            video.load();
        });
    }

    /**
     * 加载音频文件
     * @param {File} file - 音频文件
     * @returns {Promise<Object>} 音频数据对象
     */
    async loadAudio(file) {
        try {
            // 检查文件类型
            if (!this.isFileSupported(file, 'audio')) {
                throw new Error(`不支持的音频格式: ${file.type}`);
            }

            // 检查文件大小 (限制为100MB)
            const maxSize = 100 * 1024 * 1024; // 100MB
            if (file.size > maxSize) {
                throw new Error(`音频文件过大，请选择小于100MB的文件`);
            }

            // 创建音频上下文
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 读取文件数据
            const arrayBuffer = await file.arrayBuffer();
            
            // 解码音频数据
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // 检查音频时长 (限制为60分钟)
            const maxDuration = 60 * 60; // 60分钟
            if (audioBuffer.duration > maxDuration) {
                throw new Error(`音频时长过长，请选择60分钟以内的音频`);
            }
            
            const audioData = {
                id: VideoEditorUtils.generateId(),
                name: file.name,
                buffer: audioBuffer,
                duration: audioBuffer.duration,
                sampleRate: audioBuffer.sampleRate,
                channels: audioBuffer.numberOfChannels,
                size: file.size,
                type: file.type,
                file: file
            };
            
            this.loadedMedia.set(audioData.id, audioData);
            
            VideoEditorUtils.log('info', 'Audio loaded successfully', {
                name: file.name,
                duration: audioBuffer.duration,
                sampleRate: audioBuffer.sampleRate,
                channels: audioBuffer.numberOfChannels,
                size: VideoEditorUtils.formatFileSize(file.size)
            });
            
            return audioData;
            
        } catch (error) {
            VideoEditorUtils.log('error', 'Failed to load audio', error);
            
            let errorMessage = '无法加载音频文件';
            if (error.name === 'EncodingError') {
                errorMessage = '音频文件格式不受支持或已损坏';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = '浏览器不支持此音频格式';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            throw new Error(errorMessage);
        }
    }

    /**
     * 创建音频波形数据
     * @param {AudioBuffer} audioBuffer - 音频缓冲区
     * @param {number} samples - 采样点数量
     * @returns {Array} 波形数据数组
     */
    createWaveformData(audioBuffer, samples = 1000) {
        const channelData = audioBuffer.getChannelData(0); // 使用第一个声道
        const blockSize = Math.floor(channelData.length / samples);
        const waveformData = [];
        
        for (let i = 0; i < samples; i++) {
            const start = i * blockSize;
            const end = start + blockSize;
            let sum = 0;
            
            // 计算块内的RMS值
            for (let j = start; j < end && j < channelData.length; j++) {
                sum += channelData[j] * channelData[j];
            }
            
            const rms = Math.sqrt(sum / blockSize);
            waveformData.push(rms);
        }
        
        // 归一化到0-1范围
        const maxValue = Math.max(...waveformData);
        if (maxValue > 0) {
            return waveformData.map(value => value / maxValue);
        }
        
        return waveformData;
    }

    /**
     * 获取视频缩略图
     * @param {HTMLVideoElement} video - 视频元素
     * @param {number} time - 时间点（秒）
     * @param {number} width - 缩略图宽度
     * @param {number} height - 缩略图高度
     * @returns {Promise<string>} 缩略图数据URL
     */
    async getVideoThumbnail(video, time = 0, width = 160, height = 90) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = width;
            canvas.height = height;
            
            const originalTime = video.currentTime;
            
            const onSeeked = () => {
                try {
                    // 绘制视频帧到画布
                    ctx.drawImage(video, 0, 0, width, height);
                    
                    // 获取数据URL
                    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                    
                    // 恢复原始时间
                    video.currentTime = originalTime;
                    video.removeEventListener('seeked', onSeeked);
                    
                    resolve(dataURL);
                } catch (error) {
                    video.removeEventListener('seeked', onSeeked);
                    reject(error);
                }
            };
            
            video.addEventListener('seeked', onSeeked);
            video.currentTime = time;
        });
    }

    /**
     * 获取媒体信息
     * @param {string} id - 媒体ID
     * @returns {Object|null} 媒体信息
     */
    getMediaInfo(id) {
        return this.loadedMedia.get(id) || null;
    }

    /**
     * 获取所有媒体
     * @returns {Array} 媒体列表
     */
    getAllMedia() {
        return Array.from(this.loadedMedia.values());
    }

    /**
     * 获取指定类型的媒体
     * @param {string} type - 媒体类型 ('video' | 'audio')
     * @returns {Array} 媒体列表
     */
    getMediaByType(type) {
        return this.getAllMedia().filter(media => {
            if (type === 'video') {
                return media.element && media.element.tagName === 'VIDEO';
            } else if (type === 'audio') {
                return media.buffer && media.buffer instanceof AudioBuffer;
            }
            return false;
        });
    }

    /**
     * 清理媒体资源
     * @param {string} id - 媒体ID
     */
    cleanup(id) {
        const media = this.loadedMedia.get(id);
        if (media) {
            // 清理视频URL
            if (media.url) {
                URL.revokeObjectURL(media.url);
            }
            
            // 清理视频元素
            if (media.element) {
                media.element.src = '';
                media.element.load();
            }
            
            this.loadedMedia.delete(id);
            
            VideoEditorUtils.log('info', 'Media cleaned up', { id, name: media.name });
        }
    }

    /**
     * 清理所有媒体资源
     */
    cleanupAll() {
        const mediaIds = Array.from(this.loadedMedia.keys());
        mediaIds.forEach(id => this.cleanup(id));
        
        VideoEditorUtils.log('info', 'All media cleaned up');
    }

    /**
     * 验证媒体文件
     * @param {File} file - 文件对象
     * @param {string} expectedType - 期望的媒体类型
     * @returns {Object} 验证结果
     */
    validateMediaFile(file, expectedType) {
        const result = {
            valid: true,
            errors: []
        };

        // 检查文件是否存在
        if (!file) {
            result.valid = false;
            result.errors.push('未选择文件');
            return result;
        }

        // 检查文件类型
        if (!this.isFileSupported(file, expectedType)) {
            result.valid = false;
            result.errors.push(`不支持的${expectedType === 'video' ? '视频' : '音频'}格式: ${file.type}`);
        }

        // 检查文件大小
        const maxSize = expectedType === 'video' ? 1000 * 1024 * 1024 : 100 * 1024 * 1024;
        if (file.size > maxSize) {
            result.valid = false;
            const maxSizeMB = expectedType === 'video' ? '1000MB' : '100MB';
            result.errors.push(`文件过大，请选择小于${maxSizeMB}的文件`);
        }

        // 检查文件名
        if (file.name.length > 255) {
            result.valid = false;
            result.errors.push('文件名过长');
        }

        return result;
    }

    /**
     * 获取支持的文件格式列表
     * @param {string} type - 媒体类型
     * @returns {Array} 支持的格式列表
     */
    getSupportedFormats(type) {
        if (type === 'video') {
            return [...this.supportedVideoTypes];
        } else if (type === 'audio') {
            return [...this.supportedAudioTypes];
        }
        return [];
    }

    /**
     * 获取媒体统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        const allMedia = this.getAllMedia();
        const videoMedia = this.getMediaByType('video');
        const audioMedia = this.getMediaByType('audio');
        
        const totalSize = allMedia.reduce((sum, media) => sum + media.size, 0);
        const totalDuration = allMedia.reduce((sum, media) => sum + (media.duration || 0), 0);
        
        return {
            total: allMedia.length,
            video: videoMedia.length,
            audio: audioMedia.length,
            totalSize: totalSize,
            totalDuration: totalDuration,
            formattedSize: VideoEditorUtils.formatFileSize(totalSize),
            formattedDuration: VideoEditorUtils.formatTime(totalDuration)
        };
    }
}

// 导出媒体管理器类
window.MediaManager = MediaManager;