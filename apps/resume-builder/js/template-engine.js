/**
 * 模板引擎
 * 负责渲染不同样式的简历模板
 */

class TemplateEngine {
    constructor() {
        this.currentTemplate = 'classic';
        this.photoUrl = null;
        
        // 在init中设置模板，确保方法已经定义
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 设置模板映射
        this.templates = {
            classic: this.classicTemplate,
            modern: this.modernTemplate,
            creative: this.creativeTemplate,
            tech: this.techTemplate,
            academic: this.academicTemplate
        };
        
        this.bindEvents();
        ResumeUtils.log('info', 'TemplateEngine initialized');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 模板选择事件
        document.addEventListener('click', (e) => {
            const templateCard = e.target.closest('.template-card');
            if (templateCard) {
                const template = templateCard.dataset.template;
                this.selectTemplate(template);
            }
        });

        // 数据变化事件
        document.addEventListener('dataChange', (e) => {
            if (e.detail && e.detail.data) {
                this.render(e.detail.data);
            }
        });

        // 照片上传事件
        this.setupPhotoUpload();
    }

    /**
     * 设置照片上传
     */
    setupPhotoUpload() {
        // 检查是否已经存在照片上传区域
        if (document.getElementById('photoUploadArea')) {
            this.bindPhotoEvents();
            return;
        }

        // 创建照片上传区域
        const photoUploadHtml = `
            <div class="form-group">
                <h3 class="section-title">
                    <span class="icon">📷</span>
                    个人照片
                </h3>
                <div class="photo-upload-area" id="photoUploadArea">
                    <div class="photo-preview" id="photoPreview" style="display: none;">
                        <img id="photoImg" src="" alt="个人照片">
                        <button class="btn-remove-photo" id="removePhotoBtn">
                            <span class="icon">🗑️</span>
                        </button>
                    </div>
                    <div class="photo-upload-placeholder" id="photoPlaceholder">
                        <div class="upload-icon">📷</div>
                        <p>点击上传个人照片</p>
                        <p class="upload-hint">支持 JPG、PNG 格式，建议尺寸 200x200</p>
                    </div>
                    <input type="file" id="photoInput" accept="image/*" style="display: none;">
                </div>
            </div>
        `;

        // 插入到基本信息后面
        const personalGroup = document.querySelector('.form-group');
        if (personalGroup) {
            personalGroup.insertAdjacentHTML('afterend', photoUploadHtml);
            this.bindPhotoEvents();
        }
    }
    /**
     * 绑定照片相关事件
     */
    bindPhotoEvents() {
        const photoUploadArea = document.getElementById('photoUploadArea');
        const photoInput = document.getElementById('photoInput');
        const photoPreview = document.getElementById('photoPreview');
        const photoImg = document.getElementById('photoImg');
        const photoPlaceholder = document.getElementById('photoPlaceholder');
        const removePhotoBtn = document.getElementById('removePhotoBtn');

        // 点击上传区域
        photoUploadArea.addEventListener('click', (e) => {
            if (e.target.closest('.btn-remove-photo')) return;
            photoInput.click();
        });

        // 文件选择
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handlePhotoUpload(file);
            }
        });

        // 删除照片
        removePhotoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removePhoto();
        });

        // 拖拽上传
        photoUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            photoUploadArea.classList.add('drag-over');
        });

        photoUploadArea.addEventListener('dragleave', () => {
            photoUploadArea.classList.remove('drag-over');
        });

        photoUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            photoUploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handlePhotoUpload(files[0]);
            }
        });
    }

    /**
     * 处理照片上传
     * @param {File} file - 照片文件
     */
    handlePhotoUpload(file) {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            ResumeUtils.showMessage('请选择图片文件', 'error');
            return;
        }

        // 验证文件大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            ResumeUtils.showMessage('图片文件不能超过5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.setPhoto(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    /**
     * 设置照片
     * @param {string} photoUrl - 照片URL
     */
    setPhoto(photoUrl) {
        this.photoUrl = photoUrl;
        
        const photoPreview = document.getElementById('photoPreview');
        const photoImg = document.getElementById('photoImg');
        const photoPlaceholder = document.getElementById('photoPlaceholder');

        if (photoUrl) {
            photoImg.src = photoUrl;
            photoPreview.style.display = 'block';
            photoPlaceholder.style.display = 'none';
        } else {
            photoPreview.style.display = 'none';
            photoPlaceholder.style.display = 'block';
        }

        // 触发重新渲染
        const event = new CustomEvent('photoChange', {
            detail: { photoUrl: this.photoUrl }
        });
        document.dispatchEvent(event);
    }

    /**
     * 删除照片
     */
    removePhoto() {
        this.setPhoto(null);
        document.getElementById('photoInput').value = '';
    }

    /**
     * 选择模板
     * @param {string} template - 模板名称
     */
    selectTemplate(template) {
        if (!this.templates[template]) {
            ResumeUtils.log('error', 'Template not found', { template });
            return;
        }

        // 更新当前模板
        this.currentTemplate = template;

        // 更新UI状态
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const selectedCard = document.querySelector(`[data-template="${template}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
        }

        // 触发重新渲染
        const event = new CustomEvent('templateChange', {
            detail: { template: this.currentTemplate }
        });
        document.dispatchEvent(event);

        ResumeUtils.log('info', 'Template selected', { template });
    }

    /**
     * 渲染简历
     * @param {Object} data - 简历数据
     */
    render(data) {
        console.log('TemplateEngine.render called with data:', data);
        
        const previewArea = document.getElementById('resumePreview');
        if (!previewArea) {
            console.error('Preview area not found');
            return;
        }

        // 检查是否有基本信息（只要有任意一个基本信息就显示预览）
        const hasBasicInfo = data.personal.name || data.personal.email || data.personal.phone || data.personal.position;
        console.log('Has basic info:', hasBasicInfo, data.personal);
        
        if (!hasBasicInfo) {
            console.log('No basic info, showing placeholder');
            this.renderPlaceholder(previewArea);
            return;
        }

        // 渲染对应模板
        const templateFunction = this.templates[this.currentTemplate];
        console.log('Current template:', this.currentTemplate, 'Template function:', templateFunction);
        
        if (templateFunction) {
            try {
                const html = templateFunction.call(this, data);
                console.log('Generated HTML length:', html.length);
                
                // 应用A4分页
                const pagedHtml = this.applyA4Pagination(html);
                previewArea.innerHTML = pagedHtml;
                
                console.log('Preview updated successfully with pagination');
            } catch (error) {
                console.error('Error rendering template:', error);
                this.renderPlaceholder(previewArea);
            }
        } else {
            console.error('Template function not found for:', this.currentTemplate);
            this.renderPlaceholder(previewArea);
        }
    }

    /**
     * 应用A4分页
     * @param {string} html - 原始HTML
     * @returns {string} 分页后的HTML
     */
    applyA4Pagination(html) {
        // 创建临时容器来测量内容高度
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            position: absolute;
            top: -10000px;
            left: -10000px;
            width: 794px;
            visibility: hidden;
        `;
        tempContainer.innerHTML = html;
        document.body.appendChild(tempContainer);

        // A4页面高度（减去页边距）
        const pageHeight = 1123 - 80; // 减去上下边距
        let currentPageHeight = 0;
        let pageNumber = 1;
        let pages = [];
        let currentPageContent = '';

        // 遍历所有子元素
        const elements = tempContainer.children;
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const elementHeight = element.offsetHeight;

            // 如果当前元素会超出页面高度，则开始新页面
            if (currentPageHeight + elementHeight > pageHeight && currentPageContent) {
                pages.push({
                    content: currentPageContent,
                    pageNumber: pageNumber
                });
                pageNumber++;
                currentPageHeight = 0;
                currentPageContent = '';
            }

            currentPageContent += element.outerHTML;
            currentPageHeight += elementHeight;
        }

        // 添加最后一页
        if (currentPageContent) {
            pages.push({
                content: currentPageContent,
                pageNumber: pageNumber
            });
        }

        // 清理临时容器
        document.body.removeChild(tempContainer);

        // 生成分页HTML
        if (pages.length <= 1) {
            // 单页内容，直接返回
            return html;
        } else {
            // 多页内容，包装成页面
            return pages.map(page => `
                <div class="resume-page">
                    ${page.content}
                    <div class="page-indicator">第 ${page.pageNumber} 页，共 ${pages.length} 页</div>
                </div>
            `).join('');
        }
    }

    /**
     * 渲染占位符
     * @param {HTMLElement} container - 容器元素
     */
    renderPlaceholder(container) {
        container.innerHTML = `
            <div class="preview-placeholder">
                <div class="placeholder-icon">📄</div>
                <p>请填写基本信息以查看简历预览</p>
            </div>
        `;
    }

    /**
     * 经典商务模板
     * @param {Object} data - 简历数据
     * @returns {string} HTML字符串
     */
    classicTemplate(data) {
        const { personal, education, experience, projects, skills, evaluation } = data;
        
        return `
            <div class="resume-template classic-template">
                <!-- 页眉 -->
                <header class="resume-header">
                    <div class="header-content">
                        <div class="personal-info">
                            <h1 class="name">${personal.name || '姓名'}</h1>
                            <h2 class="position">${personal.position || '求职意向'}</h2>
                            <div class="contact-info">
                                ${personal.phone ? `<span class="contact-item">📞 ${personal.phone}</span>` : ''}
                                ${personal.email ? `<span class="contact-item">📧 ${personal.email}</span>` : ''}
                                ${personal.address ? `<span class="contact-item">📍 ${personal.address}</span>` : ''}
                            </div>
                        </div>
                        ${this.photoUrl ? `<div class="photo-container"><img src="${this.photoUrl}" alt="个人照片" class="profile-photo"></div>` : ''}
                    </div>
                </header>

                <!-- 主要内容 -->
                <main class="resume-main">
                    ${evaluation ? `
                    <section class="resume-section">
                        <h3 class="section-title">个人简介</h3>
                        <div class="section-content">
                            <p class="evaluation">${evaluation}</p>
                        </div>
                    </section>
                    ` : ''}

                    ${experience.length > 0 ? `
                    <section class="resume-section">
                        <h3 class="section-title">工作经历</h3>
                        <div class="section-content">
                            ${experience.map(exp => `
                                <div class="experience-item">
                                    <div class="item-header">
                                        <h4 class="company">${exp.company}</h4>
                                        <span class="period">${ResumeUtils.formatDateRange(exp.startDate, exp.endDate)}</span>
                                    </div>
                                    <div class="position">${exp.position}</div>
                                    ${exp.description ? `<p class="description">${exp.description}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </section>
                    ` : ''}

                    ${projects.length > 0 ? `
                    <section class="resume-section">
                        <h3 class="section-title">项目经验</h3>
                        <div class="section-content">
                            ${projects.map(project => `
                                <div class="project-item">
                                    <div class="item-header">
                                        <h4 class="project-name">${project.name}</h4>
                                        <span class="period">${ResumeUtils.formatDateRange(project.startDate, project.endDate)}</span>
                                    </div>
                                    <div class="role">${project.role}</div>
                                    ${project.technologies ? `<div class="technologies">技术栈: ${project.technologies}</div>` : ''}
                                    ${project.description ? `<p class="description">${project.description}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </section>
                    ` : ''}

                    ${education.length > 0 ? `
                    <section class="resume-section">
                        <h3 class="section-title">教育背景</h3>
                        <div class="section-content">
                            ${education.map(edu => `
                                <div class="education-item">
                                    <div class="item-header">
                                        <h4 class="school">${edu.school}</h4>
                                        <span class="period">${ResumeUtils.formatDateRange(edu.startDate, edu.endDate)}</span>
                                    </div>
                                    <div class="degree">${edu.degree} · ${edu.major}</div>
                                    ${edu.description ? `<p class="description">${edu.description}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </section>
                    ` : ''}

                    ${skills ? `
                    <section class="resume-section">
                        <h3 class="section-title">技能特长</h3>
                        <div class="section-content">
                            <div class="skills-list">
                                ${skills.split(',').map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
                            </div>
                        </div>
                    </section>
                    ` : ''}
                </main>
            </div>
        `;
    }

    /**
     * 现代简约模板
     * @param {Object} data - 简历数据
     * @returns {string} HTML字符串
     */
    modernTemplate(data) {
        const { personal, education, experience, projects, skills, evaluation } = data;
        
        return `
            <div class="resume-template modern-template">
                <!-- 侧边栏 -->
                <aside class="resume-sidebar">
                    ${this.photoUrl ? `<div class="photo-container"><img src="${this.photoUrl}" alt="个人照片" class="profile-photo"></div>` : ''}
                    
                    <div class="personal-info">
                        <h1 class="name">${personal.name || '姓名'}</h1>
                        <h2 class="position">${personal.position || '求职意向'}</h2>
                    </div>

                    <div class="contact-section">
                        <h3 class="sidebar-title">联系方式</h3>
                        <div class="contact-list">
                            ${personal.phone ? `<div class="contact-item">📞 ${personal.phone}</div>` : ''}
                            ${personal.email ? `<div class="contact-item">📧 ${personal.email}</div>` : ''}
                            ${personal.address ? `<div class="contact-item">📍 ${personal.address}</div>` : ''}
                        </div>
                    </div>

                    ${skills ? `
                    <div class="skills-section">
                        <h3 class="sidebar-title">技能特长</h3>
                        <div class="skills-list">
                            ${skills.split(',').map(skill => `<div class="skill-item">${skill.trim()}</div>`).join('')}
                        </div>
                    </div>
                    ` : ''}
                </aside>

                <!-- 主要内容 -->
                <main class="resume-content">
                    ${evaluation ? `
                    <section class="resume-section">
                        <h3 class="section-title">个人简介</h3>
                        <div class="section-content">
                            <p class="evaluation">${evaluation}</p>
                        </div>
                    </section>
                    ` : ''}

                    ${experience.length > 0 ? `
                    <section class="resume-section">
                        <h3 class="section-title">工作经历</h3>
                        <div class="section-content">
                            ${experience.map(exp => `
                                <div class="timeline-item">
                                    <div class="timeline-marker"></div>
                                    <div class="timeline-content">
                                        <div class="item-header">
                                            <h4 class="company">${exp.company}</h4>
                                            <span class="period">${ResumeUtils.formatDateRange(exp.startDate, exp.endDate)}</span>
                                        </div>
                                        <div class="position">${exp.position}</div>
                                        ${exp.description ? `<p class="description">${exp.description}</p>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                    ` : ''}

                    ${projects.length > 0 ? `
                    <section class="resume-section">
                        <h3 class="section-title">项目经验</h3>
                        <div class="section-content">
                            ${projects.map(project => `
                                <div class="project-card">
                                    <div class="card-header">
                                        <h4 class="project-name">${project.name}</h4>
                                        <span class="period">${ResumeUtils.formatDateRange(project.startDate, project.endDate)}</span>
                                    </div>
                                    <div class="role">${project.role}</div>
                                    ${project.technologies ? `<div class="technologies">${project.technologies}</div>` : ''}
                                    ${project.description ? `<p class="description">${project.description}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </section>
                    ` : ''}

                    ${education.length > 0 ? `
                    <section class="resume-section">
                        <h3 class="section-title">教育背景</h3>
                        <div class="section-content">
                            ${education.map(edu => `
                                <div class="education-item">
                                    <div class="item-header">
                                        <h4 class="school">${edu.school}</h4>
                                        <span class="period">${ResumeUtils.formatDateRange(edu.startDate, edu.endDate)}</span>
                                    </div>
                                    <div class="degree">${edu.degree} · ${edu.major}</div>
                                    ${edu.description ? `<p class="description">${edu.description}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </section>
                    ` : ''}
                </main>
            </div>
        `;
    }
    /**
     * 创意设计模板
     * @param {Object} data - 简历数据
     * @returns {string} HTML字符串
     */
    creativeTemplate(data) {
        const { personal, education, experience, projects, skills, evaluation } = data;
        
        return `
            <div class="resume-template creative-template">
                <!-- 创意头部 -->
                <header class="creative-header">
                    <div class="header-bg"></div>
                    <div class="header-content">
                        ${this.photoUrl ? `<div class="photo-container"><img src="${this.photoUrl}" alt="个人照片" class="profile-photo"></div>` : ''}
                        <div class="personal-info">
                            <h1 class="name">${personal.name || '姓名'}</h1>
                            <h2 class="position">${personal.position || '求职意向'}</h2>
                            <div class="contact-info">
                                ${personal.phone ? `<span class="contact-item">📞 ${personal.phone}</span>` : ''}
                                ${personal.email ? `<span class="contact-item">📧 ${personal.email}</span>` : ''}
                                ${personal.address ? `<span class="contact-item">📍 ${personal.address}</span>` : ''}
                            </div>
                        </div>
                    </div>
                </header>

                <!-- 主要内容 -->
                <main class="creative-main">
                    <div class="content-grid">
                        <div class="left-column">
                            ${evaluation ? `
                            <section class="resume-section highlight-section">
                                <h3 class="section-title">关于我</h3>
                                <div class="section-content">
                                    <p class="evaluation">${evaluation}</p>
                                </div>
                            </section>
                            ` : ''}

                            ${skills ? `
                            <section class="resume-section">
                                <h3 class="section-title">技能专长</h3>
                                <div class="section-content">
                                    <div class="creative-skills">
                                        ${skills.split(',').map(skill => `<div class="skill-bubble">${skill.trim()}</div>`).join('')}
                                    </div>
                                </div>
                            </section>
                            ` : ''}

                            ${education.length > 0 ? `
                            <section class="resume-section">
                                <h3 class="section-title">教育背景</h3>
                                <div class="section-content">
                                    ${education.map(edu => `
                                        <div class="creative-item">
                                            <div class="item-icon">🎓</div>
                                            <div class="item-content">
                                                <h4 class="school">${edu.school}</h4>
                                                <div class="degree">${edu.degree} · ${edu.major}</div>
                                                <div class="period">${ResumeUtils.formatDateRange(edu.startDate, edu.endDate)}</div>
                                                ${edu.description ? `<p class="description">${edu.description}</p>` : ''}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </section>
                            ` : ''}
                        </div>

                        <div class="right-column">
                            ${experience.length > 0 ? `
                            <section class="resume-section">
                                <h3 class="section-title">工作经历</h3>
                                <div class="section-content">
                                    ${experience.map(exp => `
                                        <div class="creative-item">
                                            <div class="item-icon">💼</div>
                                            <div class="item-content">
                                                <h4 class="company">${exp.company}</h4>
                                                <div class="position">${exp.position}</div>
                                                <div class="period">${ResumeUtils.formatDateRange(exp.startDate, exp.endDate)}</div>
                                                ${exp.description ? `<p class="description">${exp.description}</p>` : ''}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </section>
                            ` : ''}

                            ${projects.length > 0 ? `
                            <section class="resume-section">
                                <h3 class="section-title">项目经验</h3>
                                <div class="section-content">
                                    ${projects.map(project => `
                                        <div class="creative-item">
                                            <div class="item-icon">🚀</div>
                                            <div class="item-content">
                                                <h4 class="project-name">${project.name}</h4>
                                                <div class="role">${project.role}</div>
                                                <div class="period">${ResumeUtils.formatDateRange(project.startDate, project.endDate)}</div>
                                                ${project.technologies ? `<div class="technologies">${project.technologies}</div>` : ''}
                                                ${project.description ? `<p class="description">${project.description}</p>` : ''}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </section>
                            ` : ''}
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    /**
     * 技术极客模板
     * @param {Object} data - 简历数据
     * @returns {string} HTML字符串
     */
    techTemplate(data) {
        const { personal, education, experience, projects, skills, evaluation } = data;
        
        return `
            <div class="resume-template tech-template">
                <!-- 终端风格头部 -->
                <header class="tech-header">
                    <div class="terminal-window">
                        <div class="terminal-header">
                            <div class="terminal-buttons">
                                <span class="btn-close"></span>
                                <span class="btn-minimize"></span>
                                <span class="btn-maximize"></span>
                            </div>
                            <div class="terminal-title">resume.json</div>
                        </div>
                        <div class="terminal-content">
                            <div class="code-line">
                                <span class="code-key">"name"</span>: <span class="code-value">"${personal.name || 'Developer'}"</span>,
                            </div>
                            <div class="code-line">
                                <span class="code-key">"position"</span>: <span class="code-value">"${personal.position || 'Software Engineer'}"</span>,
                            </div>
                            <div class="code-line">
                                <span class="code-key">"contact"</span>: {
                            </div>
                            ${personal.email ? `<div class="code-line indent"><span class="code-key">"email"</span>: <span class="code-value">"${personal.email}"</span>,</div>` : ''}
                            ${personal.phone ? `<div class="code-line indent"><span class="code-key">"phone"</span>: <span class="code-value">"${personal.phone}"</span>,</div>` : ''}
                            ${personal.address ? `<div class="code-line indent"><span class="code-key">"location"</span>: <span class="code-value">"${personal.address}"</span></div>` : ''}
                            <div class="code-line">}</div>
                        </div>
                    </div>
                    ${this.photoUrl ? `<div class="tech-photo"><img src="${this.photoUrl}" alt="个人照片" class="profile-photo"></div>` : ''}
                </header>

                <!-- 主要内容 -->
                <main class="tech-main">
                    ${evaluation ? `
                    <section class="resume-section">
                        <h3 class="section-title">// 关于我</h3>
                        <div class="section-content">
                            <div class="code-block">
                                <pre><code>function aboutMe() {
    return "${evaluation}";
}</code></pre>
                            </div>
                        </div>
                    </section>
                    ` : ''}

                    ${skills ? `
                    <section class="resume-section">
                        <h3 class="section-title">// 技术栈</h3>
                        <div class="section-content">
                            <div class="tech-skills">
                                ${skills.split(',').map(skill => `<span class="tech-tag">${skill.trim()}</span>`).join('')}
                            </div>
                        </div>
                    </section>
                    ` : ''}

                    ${experience.length > 0 ? `
                    <section class="resume-section">
                        <h3 class="section-title">// 工作经历</h3>
                        <div class="section-content">
                            ${experience.map((exp, index) => `
                                <div class="tech-item">
                                    <div class="item-header">
                                        <span class="line-number">${String(index + 1).padStart(2, '0')}</span>
                                        <h4 class="company">${exp.company}</h4>
                                        <span class="period">${ResumeUtils.formatDateRange(exp.startDate, exp.endDate)}</span>
                                    </div>
                                    <div class="position">${exp.position}</div>
                                    ${exp.description ? `<pre class="description"><code>${exp.description}</code></pre>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </section>
                    ` : ''}

                    ${projects.length > 0 ? `
                    <section class="resume-section">
                        <h3 class="section-title">// 项目经验</h3>
                        <div class="section-content">
                            ${projects.map((project, index) => `
                                <div class="tech-item">
                                    <div class="item-header">
                                        <span class="line-number">${String(index + 1).padStart(2, '0')}</span>
                                        <h4 class="project-name">${project.name}</h4>
                                        <span class="period">${ResumeUtils.formatDateRange(project.startDate, project.endDate)}</span>
                                    </div>
                                    <div class="role">${project.role}</div>
                                    ${project.technologies ? `<div class="technologies">Tech Stack: ${project.technologies}</div>` : ''}
                                    ${project.description ? `<pre class="description"><code>${project.description}</code></pre>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </section>
                    ` : ''}

                    ${education.length > 0 ? `
                    <section class="resume-section">
                        <h3 class="section-title">// 教育背景</h3>
                        <div class="section-content">
                            ${education.map((edu, index) => `
                                <div class="tech-item">
                                    <div class="item-header">
                                        <span class="line-number">${String(index + 1).padStart(2, '0')}</span>
                                        <h4 class="school">${edu.school}</h4>
                                        <span class="period">${ResumeUtils.formatDateRange(edu.startDate, edu.endDate)}</span>
                                    </div>
                                    <div class="degree">${edu.degree} · ${edu.major}</div>
                                    ${edu.description ? `<pre class="description"><code>${edu.description}</code></pre>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </section>
                    ` : ''}
                </main>
            </div>
        `;
    }

    /**
     * 学术研究模板
     * @param {Object} data - 简历数据
     * @returns {string} HTML字符串
     */
    academicTemplate(data) {
        const { personal, education, experience, projects, skills, evaluation } = data;
        
        return `
            <div class="resume-template academic-template">
                <!-- 学术头部 -->
                <header class="academic-header">
                    <div class="header-content">
                        <div class="personal-info">
                            <h1 class="name">${personal.name || '姓名'}</h1>
                            <h2 class="position">${personal.position || '研究方向'}</h2>
                            <div class="contact-info">
                                ${personal.email ? `<div class="contact-item">Email: ${personal.email}</div>` : ''}
                                ${personal.phone ? `<div class="contact-item">Phone: ${personal.phone}</div>` : ''}
                                ${personal.address ? `<div class="contact-item">Address: ${personal.address}</div>` : ''}
                            </div>
                        </div>
                        ${this.photoUrl ? `<div class="photo-container"><img src="${this.photoUrl}" alt="个人照片" class="profile-photo"></div>` : ''}
                    </div>
                </header>

                <!-- 主要内容 -->
                <main class="academic-main">
                    ${evaluation ? `
                    <section class="resume-section">
                        <h3 class="section-title">Research Interests</h3>
                        <div class="section-content">
                            <p class="evaluation">${evaluation}</p>
                        </div>
                    </section>
                    ` : ''}

                    ${education.length > 0 ? `
                    <section class="resume-section">
                        <h3 class="section-title">Education</h3>
                        <div class="section-content">
                            ${education.map(edu => `
                                <div class="academic-item">
                                    <div class="item-header">
                                        <h4 class="degree">${edu.degree}</h4>
                                        <span class="period">${ResumeUtils.formatDateRange(edu.startDate, edu.endDate)}</span>
                                    </div>
                                    <div class="school">${edu.school}</div>
                                    <div class="major">Major: ${edu.major}</div>
                                    ${edu.description ? `<p class="description">${edu.description}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </section>
                    ` : ''}

                    ${experience.length > 0 ? `
                    <section class="resume-section">
                        <h3 class="section-title">Professional Experience</h3>
                        <div class="section-content">
                            ${experience.map(exp => `
                                <div class="academic-item">
                                    <div class="item-header">
                                        <h4 class="position">${exp.position}</h4>
                                        <span class="period">${ResumeUtils.formatDateRange(exp.startDate, exp.endDate)}</span>
                                    </div>
                                    <div class="company">${exp.company}</div>
                                    ${exp.description ? `<p class="description">${exp.description}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </section>
                    ` : ''}

                    ${projects.length > 0 ? `
                    <section class="resume-section">
                        <h3 class="section-title">Research Projects</h3>
                        <div class="section-content">
                            ${projects.map(project => `
                                <div class="academic-item">
                                    <div class="item-header">
                                        <h4 class="project-name">${project.name}</h4>
                                        <span class="period">${ResumeUtils.formatDateRange(project.startDate, project.endDate)}</span>
                                    </div>
                                    <div class="role">Role: ${project.role}</div>
                                    ${project.technologies ? `<div class="technologies">Methods/Tools: ${project.technologies}</div>` : ''}
                                    ${project.description ? `<p class="description">${project.description}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </section>
                    ` : ''}

                    ${skills ? `
                    <section class="resume-section">
                        <h3 class="section-title">Skills & Competencies</h3>
                        <div class="section-content">
                            <div class="academic-skills">
                                ${skills.split(',').map(skill => `<span class="skill-item">${skill.trim()}</span>`).join('')}
                            </div>
                        </div>
                    </section>
                    ` : ''}
                </main>
            </div>
        `;
    }

    /**
     * 获取当前模板
     * @returns {string} 当前模板名称
     */
    getCurrentTemplate() {
        return this.currentTemplate;
    }

    /**
     * 获取照片URL
     * @returns {string|null} 照片URL
     */
    getPhotoUrl() {
        return this.photoUrl;
    }
}

// 导出模板引擎
window.TemplateEngine = TemplateEngine;