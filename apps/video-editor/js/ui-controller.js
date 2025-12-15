/**
 * UI控制器
 * 处理用户界面交互和事件
 */

class UIController {
    constructor(videoEditor) {
        this.videoEditor = videoEditor;
        this.modals = {};
        this.fileInputs = {};
        
        this.init();
    }

    /**
     * 初始化UI控制器
     */
    init() {
        this.setupFileInputs();
        this.setupModals();
        this.setupButtons();
        this.setupErrorHandler();
        this.setupLayoutHandlers();
        
        // 初始化时确保布局正确
        setTimeout(() => {
            this.ensureUIVisibility();
        }, 100);
        
        VideoEditorUtils.log('info', 'UI Controller initialized');
    }

    /**
     * 设置文件输入
     */
    setupFileInputs() {
        // 视频文件输入
        this.fileInputs.video = document.getElementById('videoFileInput');
        if (this.fileInputs.video) {
            this.fileInputs.video.addEventListener('change', (e) => {
                this.handleVideoFileSelect(e);
            });
        }

        // 音频文件输入
        this.fileInputs.audio = document.getElementById('audioFileInput');
        if (this.fileInputs.audio) {
            this.fileInputs.audio.addEventListener('change', (e) => {
                this.handleAudioFileSelect(e);
            });
        }
    }

    /**
     * 设置模态框
     */
    setupModals() {
        // 文字模态框
        this.modals.text = {
            element: document.getElementById('textModal'),
            closeBtn: document.getElementById('textModalClose'),
            cancelBtn: document.getElementById('textModalCancel'),
            confirmBtn: document.getElementById('textModalConfirm')
        };

        // 导出模态框
        this.modals.export = {
            element: document.getElementById('exportModal'),
            closeBtn: document.getElementById('exportModalClose'),
            cancelBtn: document.getElementById('exportModalCancel'),
            confirmBtn: document.getElementById('exportModalConfirm')
        };

        // 设置模态框事件
        Object.values(this.modals).forEach(modal => {
            if (modal.closeBtn) {
                modal.closeBtn.addEventListener('click', () => {
                    this.hideModal(modal.element);
                });
            }

            if (modal.cancelBtn) {
                modal.cancelBtn.addEventListener('click', () => {
                    this.hideModal(modal.element);
                });
            }

            // 点击遮罩关闭
            if (modal.element) {
                modal.element.addEventListener('click', (e) => {
                    if (e.target === modal.element) {
                        this.hideModal(modal.element);
                    }
                });
            }
        });

        // 文字模态框确认按钮
        if (this.modals.text.confirmBtn) {
            this.modals.text.confirmBtn.addEventListener('click', () => {
                this.handleTextModalConfirm();
            });
        }

        // 导出模态框确认按钮
        if (this.modals.export.confirmBtn) {
            this.modals.export.confirmBtn.addEventListener('click', () => {
                this.handleExportModalConfirm();
            });
        }

        // 文字位置选择变化
        const textPosition = document.getElementById('textPosition');
        if (textPosition) {
            textPosition.addEventListener('change', (e) => {
                this.handleTextPositionChange(e.target.value);
            });
        }

        // 自定义位置坐标变化
        const textX = document.getElementById('textX');
        const textY = document.getElementById('textY');
        if (textX && textY) {
            textX.addEventListener('input', () => this.updatePositionPreview());
            textY.addEventListener('input', () => this.updatePositionPreview());
        }
    }

    /**
     * 设置按钮事件
     */
    setupButtons() {
        // 导入视频按钮
        const importVideoBtn = document.getElementById('importVideo');
        if (importVideoBtn) {
            importVideoBtn.addEventListener('click', () => {
                this.fileInputs.video.click();
            });
        }

        // 导入音频按钮
        const importAudioBtn = document.getElementById('importAudio');
        if (importAudioBtn) {
            importAudioBtn.addEventListener('click', () => {
                this.fileInputs.audio.click();
            });
        }

        // 添加文字按钮
        const addTextBtn = document.getElementById('addText');
        if (addTextBtn) {
            addTextBtn.addEventListener('click', () => {
                this.showTextModal();
            });
        }

        // 导出视频按钮
        const exportVideoBtn = document.getElementById('exportVideo');
        if (exportVideoBtn) {
            exportVideoBtn.addEventListener('click', () => {
                this.showExportModal();
            });
        }
    }

    /**
     * 设置错误处理
     */
    setupErrorHandler() {
        const errorClose = document.getElementById('errorClose');
        if (errorClose) {
            errorClose.addEventListener('click', () => {
                VideoEditorUtils.hideError();
            });
        }
    }

    /**
     * 设置布局处理器
     */
    setupLayoutHandlers() {
        // 窗口大小变化时重新调整布局
        window.addEventListener('resize', VideoEditorUtils.debounce(() => {
            this.ensureUIVisibility();
        }, 250));

        // 监听DOM变化，确保布局稳定
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    shouldUpdate = true;
                }
            });
            
            if (shouldUpdate) {
                setTimeout(() => {
                    this.ensureUIVisibility();
                }, 50);
            }
        });

        // 观察主要容器的变化
        const mainContainer = document.getElementById('videoEditor');
        if (mainContainer) {
            observer.observe(mainContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }
    }

    /**
     * 处理视频文件选择
     * @param {Event} e - 文件选择事件
     */
    async handleVideoFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        let loader = null;
        
        try {
            // 验证文件
            const validation = this.videoEditor.mediaManager.validateMediaFile(file, 'video');
            if (!validation.valid) {
                VideoEditorUtils.showError(validation.errors[0]);
                return;
            }

            // 显示加载指示器
            loader = VideoEditorUtils.createLoader('正在加载视频...');
            document.body.appendChild(loader);

            // 导入视频
            await this.videoEditor.importVideo(file);

            // 移除加载指示器
            if (loader) {
                VideoEditorUtils.removeLoader(loader);
                loader = null;
            }

            // 显示成功消息
            VideoEditorUtils.showSuccess('视频导入成功！');

            // 确保UI控件可见
            this.ensureUIVisibility();

        } catch (error) {
            VideoEditorUtils.log('error', 'Video import failed', error);
            VideoEditorUtils.showError('导入视频失败: ' + error.message);
        } finally {
            // 清理加载指示器
            if (loader) {
                VideoEditorUtils.removeLoader(loader);
            }
            
            // 清空文件输入
            e.target.value = '';
        }
    }

    /**
     * 处理音频文件选择
     * @param {Event} e - 文件选择事件
     */
    async handleAudioFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // 显示加载指示器
            const loader = VideoEditorUtils.createLoader('正在加载音频...');
            document.body.appendChild(loader);

            // 添加背景音乐
            await this.videoEditor.addBackgroundMusic(file);

            // 移除加载指示器
            VideoEditorUtils.removeLoader(loader);

            // 显示成功消息
            VideoEditorUtils.showSuccess('背景音乐添加成功！');

        } catch (error) {
            // 移除加载指示器
            const loader = document.querySelector('.loader-overlay');
            if (loader) {
                VideoEditorUtils.removeLoader(loader);
            }

            VideoEditorUtils.showError('添加背景音乐失败: ' + error.message);
        } finally {
            // 清空文件输入
            e.target.value = '';
        }
    }

    /**
     * 显示文字模态框
     */
    showTextModal() {
        // 检查是否有视频
        const projectState = this.videoEditor.getProjectState();
        if (!projectState.hasVideo) {
            VideoEditorUtils.showError('请先导入视频');
            return;
        }

        // 重置表单
        this.resetTextModal();

        // 显示模态框
        this.showModal(this.modals.text.element);
    }

    /**
     * 重置文字模态框
     */
    resetTextModal() {
        const textContent = document.getElementById('textContent');
        const textStartTime = document.getElementById('textStartTime');
        const textDuration = document.getElementById('textDuration');
        const textFontSize = document.getElementById('textFontSize');
        const textColor = document.getElementById('textColor');
        const textBgColor = document.getElementById('textBgColor');
        const textBgOpacity = document.getElementById('textBgOpacity');
        const textPosition = document.getElementById('textPosition');

        if (textContent) textContent.value = '';
        if (textStartTime) textStartTime.value = this.videoEditor.currentTime.toFixed(1);
        if (textDuration) textDuration.value = '3';
        if (textFontSize) textFontSize.value = '48';
        if (textColor) textColor.value = '#ffffff';
        if (textBgColor) textBgColor.value = '#000000';
        if (textBgOpacity) textBgOpacity.value = '70';
        if (textPosition) textPosition.value = 'center';

        // 隐藏自定义位置组
        this.handleTextPositionChange('center');
    }

    /**
     * 处理文字位置变化
     * @param {string} position - 位置值
     */
    handleTextPositionChange(position) {
        const customPositionGroup = document.getElementById('customPositionGroup');
        if (customPositionGroup) {
            customPositionGroup.style.display = position === 'custom' ? 'block' : 'none';
        }
    }

    /**
     * 处理文字模态框确认
     */
    handleTextModalConfirm() {
        try {
            // 获取表单数据
            const textData = this.getTextFormData();

            // 验证数据
            const validation = this.validateTextData(textData);
            if (!validation.valid) {
                VideoEditorUtils.showError(validation.errors[0]);
                return;
            }

            // 添加文字
            this.videoEditor.addText(
                textData.text,
                textData.startTime,
                textData.duration,
                textData.style
            );

            // 隐藏模态框
            this.hideModal(this.modals.text.element);

            // 显示成功消息
            VideoEditorUtils.showSuccess('文字添加成功！');

        } catch (error) {
            VideoEditorUtils.showError('添加文字失败: ' + error.message);
        }
    }

    /**
     * 获取文字表单数据
     * @returns {Object} 文字数据
     */
    getTextFormData() {
        const textContent = document.getElementById('textContent').value;
        const startTime = parseFloat(document.getElementById('textStartTime').value);
        const duration = parseFloat(document.getElementById('textDuration').value);
        const fontSize = parseInt(document.getElementById('textFontSize').value);
        const color = document.getElementById('textColor').value;
        const bgColor = document.getElementById('textBgColor').value;
        const bgOpacity = parseInt(document.getElementById('textBgOpacity').value) / 100;
        const position = document.getElementById('textPosition').value;

        // 获取画布尺寸用于位置计算
        const canvas = document.querySelector('#previewContainer canvas');
        const canvasWidth = canvas ? canvas.width : 1920;
        const canvasHeight = canvas ? canvas.height : 1080;

        let style = {
            fontSize: fontSize,
            color: color,
            backgroundColor: VideoEditorUtils.colorToRgba(bgColor, bgOpacity),
            padding: 20,
            borderRadius: 10
        };

        // 根据位置预设计算坐标
        if (position === 'custom') {
            const x = parseInt(document.getElementById('textX').value);
            const y = parseInt(document.getElementById('textY').value);
            
            // 将百分比转换为像素坐标
            style.x = (x / 100) * canvasWidth;
            style.y = (y / 100) * canvasHeight;
            style.textAlign = 'center';
            style.textBaseline = 'middle';
        } else {
            // 使用预设位置
            const positionData = VideoEditorUtils.calculateTextPosition(position, canvasWidth, canvasHeight);
            style.x = positionData.x;
            style.y = positionData.y;
            style.textAlign = positionData.textAlign;
            style.textBaseline = positionData.textBaseline;
        }

        return {
            text: textContent,
            startTime: startTime,
            duration: duration,
            style: style
        };
    }

    /**
     * 处理文字位置变化
     * @param {string} position - 位置值
     */
    handleTextPositionChange(position) {
        const customPositionGroup = document.getElementById('customPositionGroup');
        if (customPositionGroup) {
            customPositionGroup.style.display = position === 'custom' ? 'block' : 'none';
            
            if (position === 'custom') {
                this.updatePositionPreview();
            }
        }
    }

    /**
     * 更新位置预览
     */
    updatePositionPreview() {
        const previewText = document.getElementById('previewText');
        const textX = document.getElementById('textX');
        const textY = document.getElementById('textY');
        
        if (previewText && textX && textY) {
            const x = parseInt(textX.value) || 50;
            const y = parseInt(textY.value) || 50;
            
            previewText.style.left = x + '%';
            previewText.style.top = y + '%';
            previewText.textContent = `${x}%, ${y}%`;
        }
    }



    /**
     * 验证文字数据
     * @param {Object} textData - 文字数据
     * @returns {Object} 验证结果
     */
    validateTextData(textData) {
        const result = { valid: true, errors: [] };

        if (!textData.text.trim()) {
            result.valid = false;
            result.errors.push('请输入文字内容');
        }

        if (textData.startTime < 0) {
            result.valid = false;
            result.errors.push('开始时间不能小于0');
        }

        if (textData.duration <= 0) {
            result.valid = false;
            result.errors.push('持续时间必须大于0');
        }

        const projectState = this.videoEditor.getProjectState();
        if (textData.startTime >= projectState.duration) {
            result.valid = false;
            result.errors.push('开始时间不能超过视频时长');
        }

        if (textData.style.fontSize < 12 || textData.style.fontSize > 200) {
            result.valid = false;
            result.errors.push('字体大小必须在12-200之间');
        }

        return result;
    }

    /**
     * 显示导出模态框
     */
    showExportModal() {
        // 检查是否有视频
        const projectState = this.videoEditor.getProjectState();
        if (!projectState.hasVideo) {
            VideoEditorUtils.showError('请先导入视频');
            return;
        }

        // 重置导出进度
        this.resetExportProgress();

        // 显示模态框
        this.showModal(this.modals.export.element);
    }

    /**
     * 重置导出进度
     */
    resetExportProgress() {
        const exportProgress = document.getElementById('exportProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (exportProgress) exportProgress.style.display = 'none';
        if (progressFill) progressFill.style.width = '0%';
        if (progressText) progressText.textContent = '准备导出...';
    }

    /**
     * 处理导出模态框确认
     */
    async handleExportModalConfirm() {
        try {
            // 获取导出选项
            const exportOptions = this.getExportOptions();

            // 显示进度
            const exportProgress = document.getElementById('exportProgress');
            if (exportProgress) {
                exportProgress.style.display = 'block';
            }

            // 禁用按钮
            const confirmBtn = this.modals.export.confirmBtn;
            const cancelBtn = this.modals.export.cancelBtn;
            if (confirmBtn) confirmBtn.disabled = true;
            if (cancelBtn) cancelBtn.disabled = true;

            // 开始导出
            const result = await this.videoEditor.exportVideo(exportOptions);

            // 自动下载
            VideoEditorUtils.downloadBlob(result.blob, result.filename);

            // 隐藏模态框
            this.hideModal(this.modals.export.element);

        } catch (error) {
            VideoEditorUtils.showError('导出失败: ' + error.message);
        } finally {
            // 恢复按钮状态
            const confirmBtn = this.modals.export.confirmBtn;
            const cancelBtn = this.modals.export.cancelBtn;
            if (confirmBtn) confirmBtn.disabled = false;
            if (cancelBtn) cancelBtn.disabled = false;

            // 隐藏进度
            const exportProgress = document.getElementById('exportProgress');
            if (exportProgress) {
                exportProgress.style.display = 'none';
            }
        }
    }

    /**
     * 获取导出选项
     * @returns {Object} 导出选项
     */
    getExportOptions() {
        const format = document.getElementById('exportFormat').value;
        const quality = document.getElementById('exportQuality').value;
        const fps = parseInt(document.getElementById('exportFps').value);

        return {
            format: format,
            quality: quality,
            fps: fps
        };
    }

    /**
     * 显示模态框
     * @param {HTMLElement} modal - 模态框元素
     */
    showModal(modal) {
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // 聚焦到第一个输入框
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    /**
     * 隐藏模态框
     * @param {HTMLElement} modal - 模态框元素
     */
    hideModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * 更新视频信息显示
     * @param {Object} videoData - 视频数据
     */
    updateVideoInfo(videoData) {
        // 这个方法由VideoEditor调用来更新UI
        VideoEditorUtils.log('debug', 'Video info updated in UI', {
            name: videoData.name,
            duration: videoData.duration,
            resolution: `${videoData.width}x${videoData.height}`
        });
    }

    /**
     * 设置拖拽上传
     */
    setupDragAndDrop() {
        const previewContainer = document.getElementById('previewContainer');
        if (!previewContainer) return;

        // 防止默认拖拽行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            previewContainer.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // 拖拽进入
        ['dragenter', 'dragover'].forEach(eventName => {
            previewContainer.addEventListener(eventName, () => {
                previewContainer.classList.add('dragover');
            });
        });

        // 拖拽离开
        ['dragleave', 'drop'].forEach(eventName => {
            previewContainer.addEventListener(eventName, () => {
                previewContainer.classList.remove('dragover');
            });
        });

        // 文件放置
        previewContainer.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            this.handleDroppedFiles(files);
        });
    }

    /**
     * 处理拖拽文件
     * @param {Array} files - 文件列表
     */
    async handleDroppedFiles(files) {
        for (const file of files) {
            if (file.type.startsWith('video/')) {
                // 模拟文件输入事件
                const event = { target: { files: [file], value: '' } };
                await this.handleVideoFileSelect(event);
                break; // 只处理第一个视频文件
            } else if (file.type.startsWith('audio/')) {
                // 模拟文件输入事件
                const event = { target: { files: [file], value: '' } };
                await this.handleAudioFileSelect(event);
            }
        }
    }

    /**
     * 确保UI控件可见性和布局稳定性
     */
    ensureUIVisibility() {
        // 确保工具栏可见和固定
        const toolbar = document.querySelector('.toolbar');
        if (toolbar) {
            toolbar.style.display = 'flex';
            toolbar.style.visibility = 'visible';
            toolbar.style.position = 'relative';
            toolbar.style.zIndex = '10';
            toolbar.style.height = 'var(--toolbar-height)';
            toolbar.style.minHeight = 'var(--toolbar-height)';
            toolbar.style.flexShrink = '0';
        }

        // 确保按钮可见
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.style.display = btn.style.display || 'inline-flex';
            btn.style.visibility = 'visible';
            btn.style.position = 'relative';
            btn.style.zIndex = '11';
        });

        // 确保预览控制器可见和固定
        const previewControls = document.querySelector('.preview-controls');
        if (previewControls) {
            previewControls.style.display = 'flex';
            previewControls.style.visibility = 'visible';
            previewControls.style.height = '80px';
            previewControls.style.minHeight = '80px';
            previewControls.style.flexShrink = '0';
        }

        // 确保属性面板可见和固定
        const propertiesSection = document.querySelector('.properties-section');
        if (propertiesSection) {
            propertiesSection.style.display = 'flex';
            propertiesSection.style.visibility = 'visible';
            propertiesSection.style.width = '320px';
            propertiesSection.style.minWidth = '320px';
            propertiesSection.style.maxWidth = '320px';
            propertiesSection.style.flexShrink = '0';
        }

        // 确保时间轴区域可见和固定
        const timelineSection = document.querySelector('.timeline-section');
        if (timelineSection) {
            timelineSection.style.display = 'flex';
            timelineSection.style.visibility = 'visible';
            timelineSection.style.height = 'var(--timeline-height)';
            timelineSection.style.minHeight = 'var(--timeline-height)';
            timelineSection.style.maxHeight = 'var(--timeline-height)';
            timelineSection.style.flexShrink = '0';
        }

        // 确保主内容区域布局正确
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.display = 'grid';
            mainContent.style.gridTemplateColumns = '1fr 320px';
            mainContent.style.overflow = 'hidden';
            mainContent.style.maxHeight = '100%';
        }

        // 确保预览区域不会溢出
        const previewArea = document.querySelector('.preview-area');
        if (previewArea) {
            previewArea.style.maxHeight = 'calc(100% - 120px)';
            previewArea.style.overflow = 'hidden';
        }

        // 确保预览容器尺寸固定
        const previewContainer = document.getElementById('previewContainer');
        if (previewContainer) {
            previewContainer.style.maxWidth = '800px';
            previewContainer.style.maxHeight = '450px';
            previewContainer.style.minWidth = '400px';
            previewContainer.style.minHeight = '225px';
            previewContainer.style.overflow = 'hidden';
        }

        VideoEditorUtils.log('debug', 'UI visibility and layout stability ensured');
    }

    /**
     * 显示键盘快捷键帮助
     */
    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Space', action: '播放/暂停' },
            { key: 'Delete', action: '删除选中项目' },
            { key: '←/→', action: '移动选中项目' },
            { key: 'Ctrl + Z', action: '撤销（计划中）' },
            { key: 'Ctrl + S', action: '保存项目（计划中）' }
        ];

        let html = '<div class="shortcuts-help"><h3>键盘快捷键</h3><ul>';
        shortcuts.forEach(shortcut => {
            html += `<li><kbd>${shortcut.key}</kbd> - ${shortcut.action}</li>`;
        });
        html += '</ul></div>';

        // 创建临时模态框显示快捷键
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>帮助</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">${html}</div>
            </div>
        `;

        document.body.appendChild(modal);
        this.showModal(modal);

        // 添加关闭事件
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal(modal);
            document.body.removeChild(modal);
        });
    }
}

// 导出UI控制器类
window.UIController = UIController;