/**
 * 简历生成器主应用
 * 协调各个模块的工作
 */

class ResumeBuilderApp {
    constructor() {
        this.formHandler = null;
        this.templateEngine = null;
        this.exportManager = null;
        this.currentZoom = 100;
        
        this.init();
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // 初始化各个模块
            this.initModules();
            
            // 绑定事件
            this.bindEvents();
            
            // 初始化UI
            this.initUI();
            
            ResumeUtils.log('info', 'ResumeBuilderApp initialized successfully');
            
        } catch (error) {
            ResumeUtils.log('error', 'Failed to initialize app', error);
            ResumeUtils.showMessage('应用初始化失败，请刷新页面重试', 'error');
        }
    }

    /**
     * 初始化模块
     */
    initModules() {
        // 初始化表单处理器
        this.formHandler = new FormHandler();
        window.formHandler = this.formHandler; // 全局引用，供HTML调用

        // 初始化模板引擎
        this.templateEngine = new TemplateEngine();
        window.templateEngine = this.templateEngine;

        // 初始化导出管理器
        this.exportManager = new ExportManager();
        window.exportManager = this.exportManager;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 简历管理相关事件
        this.bindResumeManagementEvents();
        
        // 缩放控制事件
        this.bindZoomEvents();
        
        // 模板变化事件
        document.addEventListener('templateChange', (e) => {
            this.handleTemplateChange(e.detail.template);
        });

        // 照片变化事件
        document.addEventListener('photoChange', (e) => {
            this.handlePhotoChange(e.detail.photoUrl);
        });

        // 数据变化事件
        document.addEventListener('dataChange', (e) => {
            this.handleDataChange(e.detail.data);
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * 绑定简历管理事件
     */
    bindResumeManagementEvents() {
        // 简历管理按钮
        const manageBtn = document.getElementById('manageBtn');
        if (manageBtn) {
            manageBtn.addEventListener('click', () => {
                this.showResumeManager();
            });
        }

        // 保存简历按钮
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.showSaveDialog();
            });
        }

        // 模态框关闭事件
        this.bindModalEvents();
    }
    /**
     * 绑定模态框事件
     */
    bindModalEvents() {
        // 简历管理模态框
        const resumeManagerModal = document.getElementById('resumeManagerModal');
        const closeManagerModal = document.getElementById('closeManagerModal');
        const newResumeBtn = document.getElementById('newResumeBtn');

        if (closeManagerModal) {
            closeManagerModal.addEventListener('click', () => {
                this.hideModal('resumeManagerModal');
            });
        }

        if (newResumeBtn) {
            newResumeBtn.addEventListener('click', () => {
                this.createNewResume();
            });
        }

        // 保存简历模态框
        const saveResumeModal = document.getElementById('saveResumeModal');
        const closeSaveModal = document.getElementById('closeSaveModal');
        const cancelSaveBtn = document.getElementById('cancelSaveBtn');
        const confirmSaveBtn = document.getElementById('confirmSaveBtn');

        if (closeSaveModal) {
            closeSaveModal.addEventListener('click', () => {
                this.hideModal('saveResumeModal');
            });
        }

        if (cancelSaveBtn) {
            cancelSaveBtn.addEventListener('click', () => {
                this.hideModal('saveResumeModal');
            });
        }

        if (confirmSaveBtn) {
            confirmSaveBtn.addEventListener('click', () => {
                this.saveResume();
            });
        }

        // 点击遮罩关闭模态框
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                const modalId = e.target.id;
                this.hideModal(modalId);
            }
        });
    }

    /**
     * 绑定缩放事件
     */
    bindZoomEvents() {
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                this.zoomIn();
            });
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                this.zoomOut();
            });
        }
    }

    /**
     * 初始化UI
     */
    initUI() {
        // 设置初始缩放
        this.updateZoomLevel();
        
        // 加载简历列表
        this.loadResumeList();
    }

    /**
     * 处理模板变化
     * @param {string} template - 模板名称
     */
    handleTemplateChange(template) {
        // 更新表单数据中的模板信息
        if (this.formHandler) {
            this.formHandler.data.meta.template = template;
            this.formHandler.triggerDataChange();
        }
    }

    /**
     * 处理照片变化
     * @param {string} photoUrl - 照片URL
     */
    handlePhotoChange(photoUrl) {
        // 触发重新渲染
        if (this.formHandler) {
            this.formHandler.triggerDataChange();
        }
    }

    /**
     * 处理数据变化
     * @param {Object} data - 简历数据
     */
    handleDataChange(data) {
        // 更新模板选择
        if (data.meta && data.meta.template) {
            this.templateEngine.selectTemplate(data.meta.template);
        }
    }

    /**
     * 处理键盘快捷键
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyboardShortcuts(e) {
        // Ctrl+S 保存
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.showSaveDialog();
        }
        
        // Ctrl+N 新建
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            this.createNewResume();
        }
        
        // Ctrl+O 打开管理
        if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            this.showResumeManager();
        }
        
        // Ctrl+E 导出PDF
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            this.exportManager.exportToPDF();
        }
    }

    /**
     * 显示简历管理器
     */
    async showResumeManager() {
        try {
            await this.loadResumeList();
            this.showModal('resumeManagerModal');
        } catch (error) {
            ResumeUtils.log('error', 'Failed to show resume manager', error);
            ResumeUtils.showMessage('加载简历列表失败', 'error');
        }
    }

    /**
     * 加载简历列表
     */
    async loadResumeList() {
        try {
            const resumes = await this.formHandler.loadResumeList();
            this.renderResumeList(resumes);
        } catch (error) {
            ResumeUtils.log('error', 'Failed to load resume list', error);
            // 如果是网络错误，尝试从本地存储加载
            this.renderResumeList([]);
        }
    }

    /**
     * 渲染简历列表
     * @param {Array} resumes - 简历列表
     */
    renderResumeList(resumes) {
        const resumeList = document.getElementById('resumeList');
        const emptyState = document.getElementById('emptyState');

        if (!resumeList) return;

        if (resumes.length === 0) {
            resumeList.innerHTML = '';
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }

        if (emptyState) {
            emptyState.style.display = 'none';
        }

        resumeList.innerHTML = resumes.map(resume => `
            <div class="resume-item" data-resume-id="${resume.id}">
                <div class="resume-item-header">
                    <h4 class="resume-item-title">${resume.name}</h4>
                    <div class="resume-item-actions">
                        <button class="btn-icon edit" onclick="app.loadResume('${resume.id}')" title="编辑">
                            ✏️
                        </button>
                        <button class="btn-icon delete" onclick="app.deleteResume('${resume.id}')" title="删除">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="resume-item-meta">
                    创建时间: ${ResumeUtils.formatDate(new Date(resume.createdAt))} | 
                    更新时间: ${ResumeUtils.formatDate(new Date(resume.updatedAt))}
                </div>
                ${resume.description ? `<div class="resume-item-description">${resume.description}</div>` : ''}
            </div>
        `).join('');
    }

    /**
     * 创建新简历
     */
    createNewResume() {
        if (confirm('创建新简历将清空当前内容，是否继续？')) {
            this.formHandler.clearData();
            this.hideModal('resumeManagerModal');
            ResumeUtils.showMessage('已创建新简历', 'success');
        }
    }

    /**
     * 加载简历
     * @param {string} resumeId - 简历ID
     */
    async loadResume(resumeId) {
        try {
            this.showLoading('正在加载简历...');
            await this.formHandler.loadResume(resumeId);
            this.hideModal('resumeManagerModal');
            this.hideLoading();
            ResumeUtils.showMessage('简历加载成功', 'success');
        } catch (error) {
            this.hideLoading();
            ResumeUtils.log('error', 'Failed to load resume', error);
            ResumeUtils.showMessage('加载简历失败', 'error');
        }
    }

    /**
     * 删除简历
     * @param {string} resumeId - 简历ID
     */
    async deleteResume(resumeId) {
        if (!confirm('确定要删除这份简历吗？此操作不可恢复。')) {
            return;
        }

        try {
            this.showLoading('正在删除简历...');
            await this.formHandler.deleteResume(resumeId);
            await this.loadResumeList();
            this.hideLoading();
            ResumeUtils.showMessage('简历删除成功', 'success');
        } catch (error) {
            this.hideLoading();
            ResumeUtils.log('error', 'Failed to delete resume', error);
            ResumeUtils.showMessage('删除简历失败', 'error');
        }
    }

    /**
     * 显示保存对话框
     */
    showSaveDialog() {
        // 验证必填项
        if (!this.formHandler.validateRequired()) {
            ResumeUtils.showMessage('请填写所有必填项', 'warning');
            return;
        }

        // 如果是编辑现有简历，预填名称
        const resumeName = document.getElementById('resumeName');
        const resumeDescription = document.getElementById('resumeDescription');
        
        if (this.formHandler.currentResumeId) {
            // 编辑模式，可以预填当前名称
            if (resumeName && !resumeName.value) {
                resumeName.value = this.formHandler.data.personal.name + '的简历';
            }
        } else {
            // 新建模式，清空输入
            if (resumeName) resumeName.value = '';
            if (resumeDescription) resumeDescription.value = '';
        }

        this.showModal('saveResumeModal');
    }

    /**
     * 保存简历
     */
    async saveResume() {
        const resumeName = document.getElementById('resumeName');
        const resumeDescription = document.getElementById('resumeDescription');

        if (!resumeName || !resumeName.value.trim()) {
            ResumeUtils.showMessage('请输入简历名称', 'warning');
            return;
        }

        try {
            this.showLoading('正在保存简历...');
            
            await this.formHandler.saveResume(
                resumeName.value.trim(),
                resumeDescription ? resumeDescription.value.trim() : ''
            );

            this.hideModal('saveResumeModal');
            this.hideLoading();
            ResumeUtils.showMessage('简历保存成功', 'success');
            
        } catch (error) {
            this.hideLoading();
            ResumeUtils.log('error', 'Failed to save resume', error);
            ResumeUtils.showMessage(`保存失败: ${error.message}`, 'error');
        }
    }

    /**
     * 放大预览
     */
    zoomIn() {
        if (this.currentZoom < 200) {
            this.currentZoom += 10;
            this.updateZoomLevel();
        }
    }

    /**
     * 缩小预览
     */
    zoomOut() {
        if (this.currentZoom > 50) {
            this.currentZoom -= 10;
            this.updateZoomLevel();
        }
    }

    /**
     * 更新缩放级别
     */
    updateZoomLevel() {
        const resumePreview = document.getElementById('resumePreview');
        const zoomLevel = document.getElementById('zoomLevel');

        if (resumePreview) {
            resumePreview.style.transform = `scale(${this.currentZoom / 100})`;
        }

        if (zoomLevel) {
            zoomLevel.textContent = `${this.currentZoom}%`;
        }
    }

    /**
     * 显示模态框
     * @param {string} modalId - 模态框ID
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }
    }

    /**
     * 隐藏模态框
     * @param {string} modalId - 模态框ID
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    /**
     * 显示加载状态
     * @param {string} message - 加载消息
     */
    showLoading(message = '正在处理...') {
        if (this.exportManager) {
            this.exportManager.showLoading(message);
        }
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        if (this.exportManager) {
            this.exportManager.hideLoading();
        }
    }
}

// 创建全局应用实例
window.app = new ResumeBuilderApp();