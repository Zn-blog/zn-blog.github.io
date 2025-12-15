/**
 * 时间轴管理器
 * 处理时间轴显示、交互和轨道管理
 */

class Timeline {
    constructor(container) {
        this.container = container;
        this.duration = 0;
        this.currentTime = 0;
        this.zoom = 1;
        this.pixelsPerSecond = 100;
        this.tracks = {
            video: [],
            audio: [],
            text: []
        };
        
        // 拖拽状态
        this.isDragging = false;
        this.dragItem = null;
        this.dragOffset = 0;
        
        // 选中状态
        this.selectedItem = null;
        
        // 回调函数
        this.onTimeChange = null;
        this.onItemSelect = null;
        this.onItemMove = null;
        
        this.init();
    }

    /**
     * 初始化时间轴
     */
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.updateRuler();
        
        VideoEditorUtils.log('info', 'Timeline initialized');
    }

    /**
     * 设置DOM元素
     */
    setupElements() {
        this.rulerElement = document.getElementById('timelineRuler');
        this.rulerContentElement = document.getElementById('timelineRulerContent');
        this.tracksElement = document.getElementById('timelineTracks');
        this.playheadElement = document.getElementById('playhead');
        
        this.videoTrackElement = document.getElementById('videoTrack');
        this.audioTrackElement = document.getElementById('audioTrack');
        this.textTrackElement = document.getElementById('textTrack');
        
        // 创建轨道内容容器
        this.createTrackContainers();
        
        // 设置滚动同步
        this.setupScrollSync();
    }

    /**
     * 创建轨道内容容器
     */
    createTrackContainers() {
        ['video', 'audio', 'text'].forEach(trackType => {
            const trackElement = document.getElementById(`${trackType}Track`);
            if (trackElement) {
                const contentElement = document.createElement('div');
                contentElement.className = 'track-content';
                contentElement.dataset.trackType = trackType;
                trackElement.appendChild(contentElement);
            }
        });
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 时间轴点击
        if (this.rulerElement) {
            this.rulerElement.addEventListener('click', (e) => {
                this.handleRulerClick(e);
            });
        }

        // 轨道点击和拖拽
        if (this.tracksElement) {
            this.tracksElement.addEventListener('mousedown', (e) => {
                this.handleTrackMouseDown(e);
            });
            
            this.tracksElement.addEventListener('mousemove', (e) => {
                this.handleTrackMouseMove(e);
            });
            
            this.tracksElement.addEventListener('mouseup', (e) => {
                this.handleTrackMouseUp(e);
            });
        }

        // 全局鼠标事件（用于拖拽）
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.handleDragMove(e);
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                this.handleDragEnd(e);
            }
        });

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        // 滚轮缩放
        if (this.tracksElement) {
            this.tracksElement.addEventListener('wheel', (e) => {
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.handleZoom(e);
                }
            });
        }
    }

    /**
     * 处理时间轴标尺点击
     * @param {MouseEvent} e - 鼠标事件
     */
    handleRulerClick(e) {
        const rect = this.rulerElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = this.pixelToTime(x);
        
        this.setCurrentTime(time);
        
        if (this.onTimeChange) {
            this.onTimeChange(time);
        }
    }

    /**
     * 处理轨道鼠标按下
     * @param {MouseEvent} e - 鼠标事件
     */
    handleTrackMouseDown(e) {
        const trackItem = e.target.closest('.track-item');
        if (trackItem) {
            e.preventDefault();
            
            // 选中项目
            this.selectItem(trackItem);
            
            // 开始拖拽
            this.startDrag(trackItem, e);
        }
    }

    /**
     * 处理轨道鼠标移动
     * @param {MouseEvent} e - 鼠标事件
     */
    handleTrackMouseMove(e) {
        const trackItem = e.target.closest('.track-item');
        if (trackItem && !this.isDragging) {
            trackItem.style.cursor = 'move';
        }
    }

    /**
     * 处理轨道鼠标抬起
     * @param {MouseEvent} e - 鼠标事件
     */
    handleTrackMouseUp(e) {
        // 由全局mouseup处理
    }

    /**
     * 开始拖拽
     * @param {HTMLElement} item - 拖拽项目
     * @param {MouseEvent} e - 鼠标事件
     */
    startDrag(item, e) {
        this.isDragging = true;
        this.dragItem = item;
        
        const rect = item.getBoundingClientRect();
        this.dragOffset = e.clientX - rect.left;
        
        item.classList.add('dragging');
        document.body.style.cursor = 'move';
        
        VideoEditorUtils.log('debug', 'Drag started', { itemId: item.dataset.itemId });
    }

    /**
     * 处理拖拽移动
     * @param {MouseEvent} e - 鼠标事件
     */
    handleDragMove(e) {
        if (!this.isDragging || !this.dragItem) return;
        
        const trackContent = this.dragItem.parentElement;
        const rect = trackContent.getBoundingClientRect();
        const x = e.clientX - rect.left - this.dragOffset;
        
        // 限制拖拽范围
        const maxX = this.timeToPixel(this.duration) - this.dragItem.offsetWidth;
        const clampedX = Math.max(0, Math.min(x, maxX));
        
        this.dragItem.style.left = clampedX + 'px';
        
        // 更新时间显示
        const newTime = this.pixelToTime(clampedX);
        this.updateItemTime(this.dragItem, newTime);
    }

    /**
     * 处理拖拽结束
     * @param {MouseEvent} e - 鼠标事件
     */
    handleDragEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        document.body.style.cursor = '';
        
        if (this.dragItem) {
            this.dragItem.classList.remove('dragging');
            
            // 计算新的时间位置
            const newTime = this.pixelToTime(parseInt(this.dragItem.style.left));
            
            // 触发移动回调
            if (this.onItemMove) {
                this.onItemMove(this.dragItem.dataset.itemId, newTime);
            }
            
            VideoEditorUtils.log('debug', 'Drag ended', { 
                itemId: this.dragItem.dataset.itemId, 
                newTime 
            });
            
            this.dragItem = null;
        }
    }

    /**
     * 处理键盘事件
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyDown(e) {
        if (!this.selectedItem) return;
        
        switch (e.key) {
            case 'Delete':
            case 'Backspace':
                this.deleteSelectedItem();
                break;
            case 'ArrowLeft':
                this.moveSelectedItem(-0.1);
                break;
            case 'ArrowRight':
                this.moveSelectedItem(0.1);
                break;
        }
    }

    /**
     * 处理缩放
     * @param {WheelEvent} e - 滚轮事件
     */
    handleZoom(e) {
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.setZoom(this.zoom * zoomFactor);
    }

    /**
     * 设置时间轴时长
     * @param {number} duration - 时长（秒）
     */
    setDuration(duration) {
        this.duration = Math.max(0, duration);
        this.updateRuler();
        this.updateTrackWidths();
        
        VideoEditorUtils.log('debug', 'Timeline duration set', { duration });
    }

    /**
     * 设置当前时间
     * @param {number} time - 时间（秒）
     */
    setCurrentTime(time) {
        this.currentTime = Math.max(0, Math.min(time, this.duration));
        this.updatePlayhead();
    }

    /**
     * 设置缩放级别
     * @param {number} zoom - 缩放级别
     */
    setZoom(zoom) {
        this.zoom = Math.max(0.1, Math.min(10, zoom));
        this.pixelsPerSecond = 100 * this.zoom;
        
        this.updateRuler();
        this.updateTrackWidths();
        this.updateAllItems();
        
        VideoEditorUtils.log('debug', 'Timeline zoom changed', { zoom: this.zoom });
    }

    /**
     * 添加视频轨道项目
     * @param {Object} videoData - 视频数据
     */
    addVideoTrack(videoData) {
        const item = {
            id: videoData.id,
            type: 'video',
            name: videoData.name,
            startTime: 0,
            duration: videoData.duration,
            data: videoData
        };
        
        this.tracks.video = [item]; // 只支持一个视频轨道
        this.createTrackItem(item, this.videoTrackElement.querySelector('.track-content'));
        
        VideoEditorUtils.log('info', 'Video track added', item);
    }

    /**
     * 添加音频轨道项目
     * @param {Object} audioData - 音频数据
     */
    addAudioTrack(audioData) {
        const item = {
            id: audioData.id,
            type: 'audio',
            name: audioData.name,
            startTime: audioData.startTime || 0,
            duration: audioData.duration,
            data: audioData
        };
        
        this.tracks.audio.push(item);
        this.createTrackItem(item, this.audioTrackElement.querySelector('.track-content'));
        
        VideoEditorUtils.log('info', 'Audio track added', item);
    }

    /**
     * 添加文字轨道项目
     * @param {Object} textData - 文字数据
     */
    addTextTrack(textData) {
        const item = {
            id: textData.id,
            type: 'text',
            name: textData.text.substring(0, 20) + '...',
            startTime: textData.startTime,
            duration: textData.duration,
            data: textData
        };
        
        this.tracks.text.push(item);
        this.createTrackItem(item, this.textTrackElement.querySelector('.track-content'));
        
        VideoEditorUtils.log('info', 'Text track added', item);
    }

    /**
     * 创建轨道项目元素
     * @param {Object} item - 项目数据
     * @param {HTMLElement} container - 容器元素
     */
    createTrackItem(item, container) {
        const element = document.createElement('div');
        element.className = `track-item ${item.type}-track-item`;
        element.dataset.itemId = item.id;
        element.dataset.itemType = item.type;
        
        // 设置位置和尺寸
        const left = this.timeToPixel(item.startTime);
        const width = this.timeToPixel(item.duration);
        
        element.style.left = left + 'px';
        element.style.width = width + 'px';
        
        // 设置内容
        element.textContent = item.name;
        
        // 添加控制点
        this.addItemHandles(element);
        
        // 添加音频波形（如果是音频轨道）
        if (item.type === 'audio' && item.data.buffer) {
            this.addAudioWaveform(element, item.data.buffer);
        }
        
        container.appendChild(element);
        
        // 添加点击事件
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectItem(element);
        });
    }

    /**
     * 添加项目控制点
     * @param {HTMLElement} element - 项目元素
     */
    addItemHandles(element) {
        const leftHandle = document.createElement('div');
        leftHandle.className = 'track-item-handle left';
        
        const rightHandle = document.createElement('div');
        rightHandle.className = 'track-item-handle right';
        
        element.appendChild(leftHandle);
        element.appendChild(rightHandle);
        
        // 添加调整大小事件
        this.addResizeHandlers(element, leftHandle, rightHandle);
    }

    /**
     * 添加调整大小处理器
     * @param {HTMLElement} element - 项目元素
     * @param {HTMLElement} leftHandle - 左控制点
     * @param {HTMLElement} rightHandle - 右控制点
     */
    addResizeHandlers(element, leftHandle, rightHandle) {
        let isResizing = false;
        let resizeType = '';
        let startX = 0;
        let startLeft = 0;
        let startWidth = 0;
        
        const startResize = (e, type) => {
            e.stopPropagation();
            isResizing = true;
            resizeType = type;
            startX = e.clientX;
            startLeft = parseInt(element.style.left);
            startWidth = element.offsetWidth;
            
            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', endResize);
        };
        
        const handleResize = (e) => {
            if (!isResizing) return;
            
            const deltaX = e.clientX - startX;
            
            if (resizeType === 'left') {
                const newLeft = Math.max(0, startLeft + deltaX);
                const newWidth = Math.max(20, startWidth - deltaX);
                
                element.style.left = newLeft + 'px';
                element.style.width = newWidth + 'px';
            } else if (resizeType === 'right') {
                const newWidth = Math.max(20, startWidth + deltaX);
                element.style.width = newWidth + 'px';
            }
        };
        
        const endResize = () => {
            if (!isResizing) return;
            
            isResizing = false;
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', endResize);
            
            // 更新项目数据
            const newStartTime = this.pixelToTime(parseInt(element.style.left));
            const newDuration = this.pixelToTime(element.offsetWidth);
            
            this.updateItemTiming(element.dataset.itemId, newStartTime, newDuration);
        };
        
        leftHandle.addEventListener('mousedown', (e) => startResize(e, 'left'));
        rightHandle.addEventListener('mousedown', (e) => startResize(e, 'right'));
    }

    /**
     * 添加音频波形
     * @param {HTMLElement} element - 项目元素
     * @param {AudioBuffer} audioBuffer - 音频缓冲区
     */
    addAudioWaveform(element, audioBuffer) {
        const waveformContainer = document.createElement('div');
        waveformContainer.className = 'audio-waveform';
        
        // 创建波形数据
        const waveformData = this.createWaveformData(audioBuffer, element.offsetWidth / 2);
        
        // 绘制波形
        waveformData.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'waveform-bar';
            bar.style.left = (index * 2) + 'px';
            bar.style.height = (value * 100) + '%';
            waveformContainer.appendChild(bar);
        });
        
        element.appendChild(waveformContainer);
    }

    /**
     * 创建波形数据
     * @param {AudioBuffer} audioBuffer - 音频缓冲区
     * @param {number} samples - 采样点数
     * @returns {Array} 波形数据
     */
    createWaveformData(audioBuffer, samples) {
        const channelData = audioBuffer.getChannelData(0);
        const blockSize = Math.floor(channelData.length / samples);
        const waveformData = [];
        
        for (let i = 0; i < samples; i++) {
            const start = i * blockSize;
            const end = start + blockSize;
            let sum = 0;
            
            for (let j = start; j < end && j < channelData.length; j++) {
                sum += Math.abs(channelData[j]);
            }
            
            const average = sum / (end - start);
            waveformData.push(average);
        }
        
        // 归一化
        const maxValue = Math.max(...waveformData);
        if (maxValue > 0) {
            return waveformData.map(value => value / maxValue);
        }
        
        return waveformData;
    }

    /**
     * 选中项目
     * @param {HTMLElement} element - 项目元素
     */
    selectItem(element) {
        // 清除之前的选中状态
        if (this.selectedItem) {
            this.selectedItem.classList.remove('selected');
        }
        
        // 设置新的选中状态
        this.selectedItem = element;
        element.classList.add('selected');
        
        // 触发选中回调
        if (this.onItemSelect) {
            this.onItemSelect(element.dataset.itemId, element.dataset.itemType);
        }
        
        VideoEditorUtils.log('debug', 'Item selected', { 
            itemId: element.dataset.itemId,
            itemType: element.dataset.itemType
        });
    }

    /**
     * 删除选中项目
     */
    deleteSelectedItem() {
        if (!this.selectedItem) return;
        
        const itemId = this.selectedItem.dataset.itemId;
        const itemType = this.selectedItem.dataset.itemType;
        
        // 从轨道数据中移除
        this.tracks[itemType] = this.tracks[itemType].filter(item => item.id !== itemId);
        
        // 从DOM中移除
        this.selectedItem.remove();
        this.selectedItem = null;
        
        VideoEditorUtils.log('info', 'Item deleted', { itemId, itemType });
    }

    /**
     * 移动选中项目
     * @param {number} deltaTime - 时间偏移（秒）
     */
    moveSelectedItem(deltaTime) {
        if (!this.selectedItem) return;
        
        const currentLeft = parseInt(this.selectedItem.style.left);
        const currentTime = this.pixelToTime(currentLeft);
        const newTime = Math.max(0, currentTime + deltaTime);
        const newLeft = this.timeToPixel(newTime);
        
        this.selectedItem.style.left = newLeft + 'px';
        this.updateItemTime(this.selectedItem, newTime);
    }

    /**
     * 更新项目时间
     * @param {HTMLElement} element - 项目元素
     * @param {number} newTime - 新时间
     */
    updateItemTime(element, newTime) {
        const itemId = element.dataset.itemId;
        const itemType = element.dataset.itemType;
        
        // 更新轨道数据
        const item = this.tracks[itemType].find(item => item.id === itemId);
        if (item) {
            item.startTime = newTime;
        }
    }

    /**
     * 更新项目时间和时长
     * @param {string} itemId - 项目ID
     * @param {number} startTime - 开始时间
     * @param {number} duration - 时长
     */
    updateItemTiming(itemId, startTime, duration) {
        // 查找项目
        let item = null;
        let itemType = '';
        
        for (const [type, tracks] of Object.entries(this.tracks)) {
            const found = tracks.find(t => t.id === itemId);
            if (found) {
                item = found;
                itemType = type;
                break;
            }
        }
        
        if (item) {
            item.startTime = startTime;
            item.duration = duration;
            
            VideoEditorUtils.log('debug', 'Item timing updated', { 
                itemId, 
                startTime, 
                duration 
            });
        }
    }

    /**
     * 设置滚动同步
     */
    setupScrollSync() {
        if (!this.rulerElement || !this.tracksElement) return;
        
        // 同步标尺和轨道的水平滚动
        this.rulerElement.addEventListener('scroll', () => {
            if (this.tracksElement.scrollLeft !== this.rulerElement.scrollLeft) {
                this.tracksElement.scrollLeft = this.rulerElement.scrollLeft;
            }
        });
        
        this.tracksElement.addEventListener('scroll', () => {
            if (this.rulerElement.scrollLeft !== this.tracksElement.scrollLeft) {
                this.rulerElement.scrollLeft = this.tracksElement.scrollLeft;
            }
        });
    }

    /**
     * 更新时间轴标尺
     */
    updateRuler() {
        if (!this.rulerContentElement) return;
        
        // 清除现有标记
        const existingMarks = this.rulerContentElement.querySelectorAll('.ruler-mark');
        existingMarks.forEach(mark => mark.remove());
        
        if (this.duration <= 0) return;
        
        // 计算标记间隔
        const interval = this.calculateRulerInterval();
        const totalWidth = this.timeToPixel(this.duration);
        
        VideoEditorUtils.log('debug', 'Updating ruler', {
            duration: this.duration,
            interval: interval,
            totalWidth: totalWidth,
            pixelsPerSecond: this.pixelsPerSecond
        });
        
        // 创建标记
        let markCount = 0;
        for (let time = 0; time <= this.duration && markCount < 500; time += interval) {
            const x = this.timeToPixel(time);
            
            // 主要刻度：根据间隔大小决定
            let isMajor = false;
            if (interval <= 1) {
                // 小间隔：每5个或每整数秒
                isMajor = (time % (interval * 5) === 0) || (time % 1 === 0);
            } else if (interval <= 5) {
                // 中间隔：每3个或每10秒
                isMajor = (time % (interval * 3) === 0) || (time % 10 === 0);
            } else if (interval <= 30) {
                // 大间隔：每2个或每分钟
                isMajor = (time % (interval * 2) === 0) || (time % 60 === 0);
            } else {
                // 超大间隔：每个都是主刻度或每5分钟
                isMajor = true || (time % 300 === 0);
            }
            
            const mark = document.createElement('div');
            mark.className = `ruler-mark ${isMajor ? 'major' : 'minor'}`;
            mark.style.left = x + 'px';
            mark.style.position = 'absolute';
            mark.style.top = '0';
            mark.style.height = isMajor ? '35px' : '15px';
            mark.style.width = '1px';
            mark.style.backgroundColor = isMajor ? '#ffffff' : '#666666';
            mark.style.zIndex = '1';
            
            // 为所有刻度添加时间标签，但样式不同
            const label = document.createElement('div');
            label.className = `ruler-mark-label ${isMajor ? 'major-label' : 'minor-label'}`;
            
            if (isMajor) {
                // 主刻度显示完整时间
                label.textContent = VideoEditorUtils.formatTime(time);
                label.style.fontSize = '11px';
                label.style.fontWeight = '600';
                label.style.color = '#ffffff';
                label.style.textShadow = '0 1px 2px rgba(0,0,0,0.8)';
                label.style.top = '2px';
            } else {
                // 次刻度只显示秒数
                const seconds = Math.floor(time % 60);
                label.textContent = seconds + 's';
                label.style.fontSize = '9px';
                label.style.fontWeight = '400';
                label.style.color = '#999999';
                label.style.top = '18px';
            }
            
            label.style.position = 'absolute';
            label.style.left = '-15px';
            label.style.width = '30px';
            label.style.textAlign = 'center';
            label.style.pointerEvents = 'none';
            label.style.userSelect = 'none';
            label.style.whiteSpace = 'nowrap';
            
            mark.appendChild(label);
            this.rulerContentElement.appendChild(mark);
            markCount++;
        }
        
        // 设置标尺内容宽度
        this.rulerContentElement.style.width = Math.max(totalWidth, this.rulerElement.offsetWidth) + 'px';
        this.rulerContentElement.style.height = '100%';
        
        // 更新轨道宽度
        this.updateTrackWidths();
    }

    /**
     * 计算标尺间隔
     * @returns {number} 间隔时间（秒）
     */
    calculateRulerInterval() {
        const pixelInterval = 60; // 最小像素间隔
        
        // 根据视频时长选择合适的间隔
        let intervals;
        if (this.duration <= 15) {
            intervals = [0.5, 1, 2];
        } else if (this.duration <= 30) {
            intervals = [1, 2, 5];
        } else if (this.duration <= 60) {
            intervals = [2, 5, 10];
        } else if (this.duration <= 300) {
            intervals = [5, 10, 15, 30];
        } else if (this.duration <= 600) {
            intervals = [10, 15, 30, 60];
        } else if (this.duration <= 1800) {
            intervals = [30, 60, 120];
        } else {
            intervals = [60, 120, 300];
        }
        
        // 找到第一个满足最小像素间隔的时间间隔
        for (const interval of intervals) {
            if (this.timeToPixel(interval) >= pixelInterval) {
                return interval;
            }
        }
        
        // 如果没有合适的间隔，根据时长动态计算
        const dynamicInterval = Math.max(1, Math.ceil(this.duration / 20));
        
        // 确保动态间隔是合理的值
        if (dynamicInterval <= 5) return dynamicInterval;
        if (dynamicInterval <= 15) return Math.ceil(dynamicInterval / 5) * 5;
        if (dynamicInterval <= 60) return Math.ceil(dynamicInterval / 15) * 15;
        return Math.ceil(dynamicInterval / 60) * 60;
    }

    /**
     * 更新播放头位置
     */
    updatePlayhead() {
        if (this.playheadElement) {
            const x = this.timeToPixel(this.currentTime);
            this.playheadElement.style.left = x + 'px';
            
            // 更新当前时间显示器
            this.updateCurrentTimeIndicator();
        }
    }

    /**
     * 更新当前时间显示器
     */
    updateCurrentTimeIndicator() {
        if (!this.playheadElement) return;
        
        // 查找或创建时间显示器
        let indicator = this.playheadElement.querySelector('.current-time-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'current-time-indicator';
            this.playheadElement.appendChild(indicator);
        }
        
        // 更新显示的时间
        indicator.textContent = VideoEditorUtils.formatTime(this.currentTime);
        
        // 确保显示器不会超出时间轴边界
        const rulerWidth = this.rulerElement ? this.rulerElement.offsetWidth : 0;
        const playheadX = this.timeToPixel(this.currentTime);
        
        if (playheadX < 30) {
            // 播放头在左边缘，调整显示器位置
            indicator.style.left = '0px';
        } else if (playheadX > rulerWidth - 30) {
            // 播放头在右边缘，调整显示器位置
            indicator.style.left = '-60px';
        } else {
            // 正常居中显示
            indicator.style.left = '-30px';
        }
    }

    /**
     * 更新轨道宽度
     */
    updateTrackWidths() {
        const totalWidth = this.timeToPixel(this.duration);
        const minWidth = Math.max(totalWidth, this.tracksElement ? this.tracksElement.offsetWidth : 800);
        
        [this.videoTrackElement, this.audioTrackElement, this.textTrackElement].forEach(track => {
            if (track) {
                const content = track.querySelector('.track-content');
                if (content) {
                    content.style.width = minWidth + 'px';
                    content.style.minWidth = minWidth + 'px';
                }
            }
        });
        
        // 同步标尺内容宽度
        if (this.rulerContentElement) {
            this.rulerContentElement.style.width = minWidth + 'px';
        }
    }

    /**
     * 更新所有项目位置
     */
    updateAllItems() {
        Object.values(this.tracks).flat().forEach(item => {
            const element = document.querySelector(`[data-item-id="${item.id}"]`);
            if (element) {
                const left = this.timeToPixel(item.startTime);
                const width = this.timeToPixel(item.duration);
                
                element.style.left = left + 'px';
                element.style.width = width + 'px';
            }
        });
    }

    /**
     * 时间转像素
     * @param {number} time - 时间（秒）
     * @returns {number} 像素位置
     */
    timeToPixel(time) {
        return time * this.pixelsPerSecond;
    }

    /**
     * 像素转时间
     * @param {number} pixel - 像素位置
     * @returns {number} 时间（秒）
     */
    pixelToTime(pixel) {
        return pixel / this.pixelsPerSecond;
    }

    /**
     * 格式化时间用于标尺显示
     * @param {number} time - 时间（秒）
     * @returns {string} 格式化的时间字符串
     */
    formatTimeForRuler(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 100);
        
        if (time < 60) {
            // 小于1分钟，显示秒.毫秒
            if (time < 10) {
                return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
            } else {
                return `${seconds}s`;
            }
        } else if (time < 3600) {
            // 小于1小时，显示分:秒
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            // 大于1小时，显示时:分:秒
            const hours = Math.floor(time / 3600);
            const remainingMinutes = Math.floor((time % 3600) / 60);
            return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    /**
     * 获取轨道项目
     * @param {string} itemId - 项目ID
     * @returns {Object|null} 项目对象
     */
    getTrackItem(itemId) {
        for (const tracks of Object.values(this.tracks)) {
            const item = tracks.find(item => item.id === itemId);
            if (item) return item;
        }
        return null;
    }

    /**
     * 清除所有轨道
     */
    clearAllTracks() {
        this.tracks = {
            video: [],
            audio: [],
            text: []
        };
        
        // 清除DOM元素
        [this.videoTrackElement, this.audioTrackElement, this.textTrackElement].forEach(track => {
            if (track) {
                const content = track.querySelector('.track-content');
                if (content) {
                    content.innerHTML = '';
                }
            }
        });
        
        this.selectedItem = null;
        
        VideoEditorUtils.log('info', 'All tracks cleared');
    }
}

// 导出时间轴类
window.Timeline = Timeline;