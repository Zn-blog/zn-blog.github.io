/**
 * 音频混合器
 * 处理多轨道音频混合和播放
 */

class AudioMixer {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.tracks = new Map();
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.currentTime = 0;
        
        this.initAudioContext();
    }

    /**
     * 初始化音频上下文
     */
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            
            VideoEditorUtils.log('info', 'Audio context initialized', {
                sampleRate: this.audioContext.sampleRate,
                state: this.audioContext.state
            });
        } catch (error) {
            VideoEditorUtils.log('error', 'Failed to initialize audio context', error);
            throw new Error('无法初始化音频系统，请检查浏览器支持');
        }
    }

    /**
     * 恢复音频上下文（处理自动播放策略）
     */
    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                VideoEditorUtils.log('info', 'Audio context resumed');
            } catch (error) {
                VideoEditorUtils.log('error', 'Failed to resume audio context', error);
            }
        }
    }

    /**
     * 添加音频轨道
     * @param {Object} trackData - 轨道数据
     * @returns {Object} 轨道对象
     */
    addTrack(trackData) {
        const track = {
            id: trackData.id,
            name: trackData.name || 'Audio Track',
            buffer: trackData.buffer,
            startTime: trackData.startTime || 0,
            duration: trackData.duration || trackData.buffer.duration,
            volume: trackData.volume || 1.0,
            fadeIn: trackData.fadeIn || 0,
            fadeOut: trackData.fadeOut || 0,
            loop: trackData.loop || false,
            muted: trackData.muted || false,
            source: null,
            gainNode: null,
            panNode: null
        };
        
        this.tracks.set(track.id, track);
        
        VideoEditorUtils.log('info', 'Audio track added', {
            id: track.id,
            name: track.name,
            duration: track.duration,
            startTime: track.startTime
        });
        
        return track;
    }

    /**
     * 移除音频轨道
     * @param {string} trackId - 轨道ID
     */
    removeTrack(trackId) {
        const track = this.tracks.get(trackId);
        if (track) {
            // 停止播放中的轨道
            if (track.source) {
                track.source.stop();
                track.source = null;
            }
            
            this.tracks.delete(trackId);
            
            VideoEditorUtils.log('info', 'Audio track removed', { id: trackId });
        }
    }

    /**
     * 播放所有轨道
     * @param {number} currentTime - 当前播放时间
     */
    async play(currentTime = 0) {
        if (this.isPlaying) return;
        
        await this.resumeAudioContext();
        
        this.isPlaying = true;
        this.startTime = this.audioContext.currentTime - currentTime;
        this.currentTime = currentTime;
        
        // 播放所有轨道
        this.tracks.forEach(track => {
            this.playTrack(track, currentTime);
        });
        
        VideoEditorUtils.log('info', 'Audio playback started', { currentTime });
    }

    /**
     * 播放单个轨道
     * @param {Object} track - 轨道对象
     * @param {number} currentTime - 当前播放时间
     */
    playTrack(track, currentTime) {
        if (track.muted) return;
        
        // 计算轨道播放时间
        const trackStartTime = track.startTime;
        const trackEndTime = trackStartTime + track.duration;
        
        // 检查轨道是否在当前时间范围内
        if (currentTime >= trackEndTime) {
            return; // 轨道已结束
        }
        
        // 计算音频开始播放的时间点
        const audioStartTime = Math.max(0, currentTime - trackStartTime);
        const playbackDelay = Math.max(0, trackStartTime - currentTime);
        
        // 创建音频源和节点
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const panNode = this.audioContext.createStereoPanner();
        
        // 设置音频缓冲区
        source.buffer = track.buffer;
        source.loop = track.loop;
        
        // 连接音频节点
        source.connect(gainNode);
        gainNode.connect(panNode);
        panNode.connect(this.masterGain);
        
        // 设置音量
        gainNode.gain.value = track.volume;
        
        // 设置声像
        panNode.pan.value = track.pan || 0;
        
        // 设置淡入淡出效果
        this.applyFadeEffects(gainNode, track, audioStartTime, playbackDelay);
        
        // 开始播放
        const when = this.audioContext.currentTime + playbackDelay;
        const offset = audioStartTime;
        const duration = Math.min(track.duration - audioStartTime, track.buffer.duration - audioStartTime);
        
        if (duration > 0) {
            source.start(when, offset, duration);
            
            // 保存引用
            track.source = source;
            track.gainNode = gainNode;
            track.panNode = panNode;
            
            // 设置结束回调
            source.onended = () => {
                track.source = null;
                track.gainNode = null;
                track.panNode = null;
            };
        }
    }

    /**
     * 应用淡入淡出效果
     * @param {GainNode} gainNode - 增益节点
     * @param {Object} track - 轨道对象
     * @param {number} audioStartTime - 音频开始时间
     * @param {number} playbackDelay - 播放延迟
     */
    applyFadeEffects(gainNode, track, audioStartTime, playbackDelay) {
        const now = this.audioContext.currentTime;
        const startTime = now + playbackDelay;
        
        // 淡入效果
        if (track.fadeIn > 0 && audioStartTime < track.fadeIn) {
            const fadeInStart = startTime;
            const fadeInEnd = startTime + Math.max(0, track.fadeIn - audioStartTime);
            
            gainNode.gain.setValueAtTime(0, fadeInStart);
            gainNode.gain.linearRampToValueAtTime(track.volume, fadeInEnd);
        }
        
        // 淡出效果
        if (track.fadeOut > 0) {
            const trackDuration = track.duration - audioStartTime;
            const fadeOutStart = startTime + Math.max(0, trackDuration - track.fadeOut);
            const fadeOutEnd = startTime + trackDuration;
            
            if (fadeOutStart > startTime) {
                gainNode.gain.setValueAtTime(track.volume, fadeOutStart);
                gainNode.gain.linearRampToValueAtTime(0, fadeOutEnd);
            }
        }
    }

    /**
     * 暂停播放
     */
    pause() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        this.pauseTime = this.audioContext.currentTime - this.startTime;
        
        // 停止所有轨道
        this.tracks.forEach(track => {
            if (track.source) {
                track.source.stop();
                track.source = null;
                track.gainNode = null;
                track.panNode = null;
            }
        });
        
        VideoEditorUtils.log('info', 'Audio playback paused');
    }

    /**
     * 停止播放
     */
    stop() {
        this.pause();
        this.pauseTime = 0;
        this.currentTime = 0;
        
        VideoEditorUtils.log('info', 'Audio playback stopped');
    }

    /**
     * 设置播放时间
     * @param {number} time - 播放时间
     */
    setCurrentTime(time) {
        this.currentTime = time;
        
        if (this.isPlaying) {
            this.pause();
            this.play(time);
        }
    }

    /**
     * 设置轨道音量
     * @param {string} trackId - 轨道ID
     * @param {number} volume - 音量 (0-1)
     */
    setTrackVolume(trackId, volume) {
        const track = this.tracks.get(trackId);
        if (track) {
            track.volume = Math.max(0, Math.min(1, volume));
            
            if (track.gainNode) {
                track.gainNode.gain.value = track.volume;
            }
            
            VideoEditorUtils.log('debug', 'Track volume changed', { 
                trackId, 
                volume: track.volume 
            });
        }
    }

    /**
     * 设置轨道声像
     * @param {string} trackId - 轨道ID
     * @param {number} pan - 声像 (-1到1)
     */
    setTrackPan(trackId, pan) {
        const track = this.tracks.get(trackId);
        if (track) {
            track.pan = Math.max(-1, Math.min(1, pan));
            
            if (track.panNode) {
                track.panNode.pan.value = track.pan;
            }
        }
    }

    /**
     * 设置轨道静音状态
     * @param {string} trackId - 轨道ID
     * @param {boolean} muted - 是否静音
     */
    setTrackMuted(trackId, muted) {
        const track = this.tracks.get(trackId);
        if (track) {
            track.muted = muted;
            
            if (track.gainNode) {
                track.gainNode.gain.value = muted ? 0 : track.volume;
            }
        }
    }

    /**
     * 设置轨道淡入时间
     * @param {string} trackId - 轨道ID
     * @param {number} fadeIn - 淡入时间（秒）
     */
    setTrackFadeIn(trackId, fadeIn) {
        const track = this.tracks.get(trackId);
        if (track) {
            track.fadeIn = Math.max(0, fadeIn);
        }
    }

    /**
     * 设置轨道淡出时间
     * @param {string} trackId - 轨道ID
     * @param {number} fadeOut - 淡出时间（秒）
     */
    setTrackFadeOut(trackId, fadeOut) {
        const track = this.tracks.get(trackId);
        if (track) {
            track.fadeOut = Math.max(0, fadeOut);
        }
    }

    /**
     * 设置主音量
     * @param {number} volume - 主音量 (0-1)
     */
    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * 获取轨道信息
     * @param {string} trackId - 轨道ID
     * @returns {Object|null} 轨道信息
     */
    getTrack(trackId) {
        return this.tracks.get(trackId) || null;
    }

    /**
     * 获取所有轨道
     * @returns {Array} 轨道列表
     */
    getAllTracks() {
        return Array.from(this.tracks.values());
    }

    /**
     * 创建混合音频流
     * @returns {MediaStream} 音频流
     */
    createAudioStream() {
        if (!this.audioContext) return null;
        
        try {
            const destination = this.audioContext.createMediaStreamDestination();
            this.masterGain.connect(destination);
            
            VideoEditorUtils.log('info', 'Audio stream created');
            return destination.stream;
        } catch (error) {
            VideoEditorUtils.log('error', 'Failed to create audio stream', error);
            return null;
        }
    }

    /**
     * 分析音频频谱
     * @param {string} trackId - 轨道ID
     * @returns {AnalyserNode|null} 分析器节点
     */
    createAnalyser(trackId) {
        const track = this.tracks.get(trackId);
        if (!track || !track.gainNode) return null;
        
        try {
            const analyser = this.audioContext.createAnalyser();
            analyser.fftSize = 256;
            
            track.gainNode.connect(analyser);
            
            return analyser;
        } catch (error) {
            VideoEditorUtils.log('error', 'Failed to create analyser', error);
            return null;
        }
    }

    /**
     * 获取音频波形数据
     * @param {AudioBuffer} audioBuffer - 音频缓冲区
     * @param {number} samples - 采样点数
     * @returns {Array} 波形数据
     */
    getWaveformData(audioBuffer, samples = 1000) {
        if (!audioBuffer) return [];
        
        const channelData = audioBuffer.getChannelData(0);
        const blockSize = Math.floor(channelData.length / samples);
        const waveformData = [];
        
        for (let i = 0; i < samples; i++) {
            const start = i * blockSize;
            const end = Math.min(start + blockSize, channelData.length);
            let sum = 0;
            
            // 计算RMS值
            for (let j = start; j < end; j++) {
                sum += channelData[j] * channelData[j];
            }
            
            const rms = Math.sqrt(sum / (end - start));
            waveformData.push(rms);
        }
        
        // 归一化
        const maxValue = Math.max(...waveformData);
        if (maxValue > 0) {
            return waveformData.map(value => value / maxValue);
        }
        
        return waveformData;
    }

    /**
     * 获取播放状态
     * @returns {Object} 播放状态
     */
    getPlaybackState() {
        return {
            isPlaying: this.isPlaying,
            currentTime: this.currentTime,
            trackCount: this.tracks.size,
            audioContextState: this.audioContext ? this.audioContext.state : 'closed'
        };
    }

    /**
     * 清理资源
     */
    cleanup() {
        // 停止播放
        this.stop();
        
        // 清理所有轨道
        this.tracks.forEach((track, trackId) => {
            this.removeTrack(trackId);
        });
        
        // 关闭音频上下文
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        
        VideoEditorUtils.log('info', 'Audio mixer cleaned up');
    }

    /**
     * 导出混合音频
     * @param {number} duration - 导出时长
     * @param {number} sampleRate - 采样率
     * @returns {Promise<AudioBuffer>} 混合后的音频缓冲区
     */
    async exportMixedAudio(duration, sampleRate = 44100) {
        try {
            // 创建离线音频上下文
            const offlineContext = new OfflineAudioContext(2, duration * sampleRate, sampleRate);
            const masterGain = offlineContext.createGain();
            masterGain.connect(offlineContext.destination);
            
            // 添加所有轨道到离线上下文
            this.tracks.forEach(track => {
                if (track.muted) return;
                
                const source = offlineContext.createBufferSource();
                const gainNode = offlineContext.createGain();
                
                source.buffer = track.buffer;
                source.connect(gainNode);
                gainNode.connect(masterGain);
                
                // 设置音量和时间
                gainNode.gain.value = track.volume;
                source.start(track.startTime);
            });
            
            // 渲染音频
            const renderedBuffer = await offlineContext.startRendering();
            
            VideoEditorUtils.log('info', 'Audio exported successfully', {
                duration: duration,
                sampleRate: sampleRate,
                channels: renderedBuffer.numberOfChannels
            });
            
            return renderedBuffer;
            
        } catch (error) {
            VideoEditorUtils.log('error', 'Failed to export mixed audio', error);
            throw error;
        }
    }
}

// 导出音频混合器类
window.AudioMixer = AudioMixer;