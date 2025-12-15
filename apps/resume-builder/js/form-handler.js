/**
 * 表单处理器
 * 处理表单数据收集、验证和存储
 */

class FormHandler {
    constructor() {
        this.data = this.getDefaultData();
        this.currentResumeId = null;
        this.validators = this.setupValidators();
        // 修复端口问题：强制使用3001端口的API服务器
        this.apiBaseUrl = window.location.protocol + '//' + window.location.hostname + ':3001';
        
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.bindEvents();
        this.loadFromLocalStorage();
        ResumeUtils.log('info', 'FormHandler initialized');
    }

    /**
     * 获取默认数据结构
     * @returns {Object} 默认数据
     */
    getDefaultData() {
        return {
            // 基本信息（必填）
            personal: {
                name: '',
                phone: '',
                email: '',
                position: '',
                age: '',
                gender: '',
                address: ''
            },
            // 教育背景
            education: [],
            // 工作经历
            experience: [],
            // 项目经验
            projects: [],
            // 技能特长
            skills: '',
            // 自我评价
            evaluation: '',
            // 元数据
            meta: {
                template: 'classic',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };
    }

    /**
     * 设置验证器
     * @returns {Object} 验证器对象
     */
    setupValidators() {
        return {
            required: (value) => {
                return value && value.toString().trim().length > 0;
            },
            email: (value) => {
                return !value || ResumeUtils.validateEmail(value);
            },
            phone: (value) => {
                return !value || ResumeUtils.validatePhone(value);
            },
            minLength: (value, min) => {
                return !value || value.toString().trim().length >= min;
            },
            maxLength: (value, max) => {
                return !value || value.toString().trim().length <= max;
            }
        };
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 基本信息表单事件
        this.bindPersonalFormEvents();
        
        // 动态列表事件
        this.bindDynamicListEvents();
        
        // 自动保存
        this.bindAutoSave();
    }

    /**
     * 绑定基本信息表单事件
     */
    bindPersonalFormEvents() {
        const personalFields = ['name', 'phone', 'email', 'position', 'age', 'gender', 'address'];
        
        personalFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', ResumeUtils.debounce(() => {
                    this.updatePersonalData(field, element.value);
                    this.validateField(element);
                }, 300));
                
                element.addEventListener('blur', () => {
                    this.validateField(element);
                });
            }
        });

        // 技能和自我评价
        const skillsElement = document.getElementById('skills');
        const evaluationElement = document.getElementById('evaluation');
        
        if (skillsElement) {
            skillsElement.addEventListener('input', ResumeUtils.debounce(() => {
                this.data.skills = skillsElement.value;
                this.triggerDataChange();
            }, 300));
        }
        
        if (evaluationElement) {
            evaluationElement.addEventListener('input', ResumeUtils.debounce(() => {
                this.data.evaluation = evaluationElement.value;
                this.triggerDataChange();
            }, 300));
        }
    }

    /**
     * 绑定动态列表事件
     */
    bindDynamicListEvents() {
        // 添加教育背景
        const addEducationBtn = document.getElementById('addEducation');
        if (addEducationBtn) {
            addEducationBtn.addEventListener('click', () => {
                this.addEducationItem();
            });
        }

        // 添加工作经历
        const addExperienceBtn = document.getElementById('addExperience');
        if (addExperienceBtn) {
            addExperienceBtn.addEventListener('click', () => {
                this.addExperienceItem();
            });
        }

        // 添加项目经验
        const addProjectBtn = document.getElementById('addProject');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => {
                this.addProjectItem();
            });
        }
    }

    /**
     * 绑定自动保存
     */
    bindAutoSave() {
        // 每30秒自动保存到本地存储
        setInterval(() => {
            this.saveToLocalStorage();
        }, 30000);

        // 页面卸载前保存
        window.addEventListener('beforeunload', () => {
            this.saveToLocalStorage();
        });
    }

    /**
     * 更新个人信息数据
     * @param {string} field - 字段名
     * @param {string} value - 字段值
     */
    updatePersonalData(field, value) {
        console.log('Updating personal data:', field, '=', value);
        this.data.personal[field] = value;
        this.data.meta.updatedAt = new Date().toISOString();
        console.log('Current data:', this.data);
        this.triggerDataChange();
    }

    /**
     * 验证字段
     * @param {HTMLElement} element - 表单元素
     * @returns {boolean} 验证结果
     */
    validateField(element) {
        const value = element.value;
        const fieldName = element.name || element.id;
        const isRequired = element.hasAttribute('required');
        
        // 清除之前的错误状态
        this.clearFieldError(element);
        
        // 必填验证
        if (isRequired && !this.validators.required(value)) {
            this.setFieldError(element, '此字段为必填项');
            return false;
        }
        
        // 邮箱验证
        if (fieldName === 'email' && value && !this.validators.email(value)) {
            this.setFieldError(element, '请输入有效的邮箱地址');
            return false;
        }
        
        // 手机号验证
        if (fieldName === 'phone' && value && !this.validators.phone(value)) {
            this.setFieldError(element, '请输入有效的手机号码');
            return false;
        }
        
        return true;
    }

    /**
     * 设置字段错误
     * @param {HTMLElement} element - 表单元素
     * @param {string} message - 错误消息
     */
    setFieldError(element, message) {
        element.classList.add('error');
        
        // 移除已存在的错误消息
        const existingError = element.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // 添加错误消息
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #dc3545;
            font-size: 12px;
            margin-top: 4px;
        `;
        
        element.parentNode.appendChild(errorElement);
    }

    /**
     * 清除字段错误
     * @param {HTMLElement} element - 表单元素
     */
    clearFieldError(element) {
        element.classList.remove('error');
        
        const errorElement = element.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * 验证所有必填字段
     * @returns {boolean} 验证结果
     */
    validateRequired() {
        console.log('=== 开始验证必填字段 ===');
        
        // 首先同步DOM数据到FormHandler（确保数据是最新的）
        this.syncDOMToData();
        
        // 基于数据验证（主要验证方式）
        const requiredPersonalFields = ['name', 'phone', 'email', 'position'];
        const invalidFields = [];
        
        // 验证基本个人信息
        requiredPersonalFields.forEach(fieldName => {
            const fieldValue = this.data.personal[fieldName];
            console.log(`验证必填字段: ${fieldName} = "${fieldValue}"`);
            
            if (!fieldValue || !fieldValue.toString().trim()) {
                invalidFields.push(fieldName);
                console.log(`❌ 字段 ${fieldName} 验证失败: 值为空`);
            } else {
                console.log(`✅ 字段 ${fieldName} 验证通过`);
            }
        });
        
        const isValid = invalidFields.length === 0;
        
        if (!isValid) {
            console.error('❌ 必填字段验证失败，以下字段为空:', invalidFields);
            // 显示具体的错误信息
            this.showValidationErrors(invalidFields);
        } else {
            console.log('✅ 所有必填字段验证通过');
            this.clearAllValidationErrors();
        }
        
        return isValid;
    }

    /**
     * 同步DOM数据到FormHandler
     */
    syncDOMToData() {
        const personalFields = ['name', 'phone', 'email', 'position', 'age', 'gender', 'address'];
        
        personalFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.value !== undefined) {
                const currentValue = this.data.personal[field];
                const domValue = element.value;
                
                if (currentValue !== domValue) {
                    console.log(`同步字段 ${field}: "${currentValue}" -> "${domValue}"`);
                    this.data.personal[field] = domValue;
                }
            }
        });
        
        // 同步技能和自我评价
        const skillsElement = document.getElementById('skills');
        const evaluationElement = document.getElementById('evaluation');
        
        if (skillsElement) {
            this.data.skills = skillsElement.value;
        }
        
        if (evaluationElement) {
            this.data.evaluation = evaluationElement.value;
        }
    }

    /**
     * 显示验证错误
     * @param {Array} invalidFields - 无效字段列表
     */
    showValidationErrors(invalidFields) {
        invalidFields.forEach(fieldName => {
            const element = document.getElementById(fieldName);
            if (element) {
                this.setFieldError(element, '此字段为必填项');
            }
        });
    }

    /**
     * 清除所有验证错误
     */
    clearAllValidationErrors() {
        const personalFields = ['name', 'phone', 'email', 'position', 'age', 'gender', 'address'];
        personalFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                this.clearFieldError(element);
            }
        });
    }

    /**
     * 添加教育背景项目
     */
    addEducationItem() {
        const item = {
            id: ResumeUtils.generateId(),
            school: '',
            major: '',
            degree: '',
            startDate: '',
            endDate: '',
            description: ''
        };
        
        this.data.education.push(item);
        this.renderEducationItem(item);
        this.triggerDataChange();
    }

    /**
     * 渲染教育背景项目
     * @param {Object} item - 教育背景项目
     */
    renderEducationItem(item) {
        const container = document.getElementById('educationList');
        const itemElement = document.createElement('div');
        itemElement.className = 'dynamic-item';
        itemElement.dataset.itemId = item.id;
        
        itemElement.innerHTML = `
            <div class="item-header">
                <span class="item-title">教育背景</span>
                <button class="btn-remove" onclick="formHandler.removeEducationItem('${item.id}')">
                    <span class="icon">🗑️</span>
                    删除
                </button>
            </div>
            <div class="form-row">
                <div class="form-field">
                    <label>学校名称</label>
                    <input type="text" name="school" value="${item.school}" placeholder="请输入学校名称">
                </div>
                <div class="form-field">
                    <label>专业</label>
                    <input type="text" name="major" value="${item.major}" placeholder="请输入专业">
                </div>
            </div>
            <div class="form-row">
                <div class="form-field">
                    <label>学历</label>
                    <select name="degree">
                        <option value="">请选择学历</option>
                        <option value="高中" ${item.degree === '高中' ? 'selected' : ''}>高中</option>
                        <option value="大专" ${item.degree === '大专' ? 'selected' : ''}>大专</option>
                        <option value="本科" ${item.degree === '本科' ? 'selected' : ''}>本科</option>
                        <option value="硕士" ${item.degree === '硕士' ? 'selected' : ''}>硕士</option>
                        <option value="博士" ${item.degree === '博士' ? 'selected' : ''}>博士</option>
                    </select>
                </div>
                <div class="form-field">
                    <label>在校时间</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="date" name="startDate" value="${item.startDate}" style="flex: 1;">
                        <span style="color: #999;">至</span>
                        <input type="date" name="endDate" value="${item.endDate}" style="flex: 1;">
                    </div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-field full-width">
                    <label>描述</label>
                    <textarea name="description" placeholder="请描述主要课程、获得荣誉等" rows="2">${item.description}</textarea>
                </div>
            </div>
        `;
        
        container.appendChild(itemElement);
        
        // 绑定事件
        this.bindItemEvents(itemElement, 'education', item.id);
    }

    /**
     * 添加工作经历项目
     */
    addExperienceItem() {
        const item = {
            id: ResumeUtils.generateId(),
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            description: ''
        };
        
        this.data.experience.push(item);
        this.renderExperienceItem(item);
        this.triggerDataChange();
    }

    /**
     * 渲染工作经历项目
     * @param {Object} item - 工作经历项目
     */
    renderExperienceItem(item) {
        const container = document.getElementById('experienceList');
        const itemElement = document.createElement('div');
        itemElement.className = 'dynamic-item';
        itemElement.dataset.itemId = item.id;
        
        itemElement.innerHTML = `
            <div class="item-header">
                <span class="item-title">工作经历</span>
                <button class="btn-remove" onclick="formHandler.removeExperienceItem('${item.id}')">
                    <span class="icon">🗑️</span>
                    删除
                </button>
            </div>
            <div class="form-row">
                <div class="form-field">
                    <label>公司名称</label>
                    <input type="text" name="company" value="${item.company}" placeholder="请输入公司名称">
                </div>
                <div class="form-field">
                    <label>职位</label>
                    <input type="text" name="position" value="${item.position}" placeholder="请输入职位">
                </div>
            </div>
            <div class="form-row">
                <div class="form-field">
                    <label>工作时间</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="date" name="startDate" value="${item.startDate}" style="flex: 1;">
                        <span style="color: #999;">至</span>
                        <input type="date" name="endDate" value="${item.endDate}" style="flex: 1;">
                    </div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-field full-width">
                    <label>工作描述</label>
                    <textarea name="description" placeholder="请描述主要工作内容、职责和成就" rows="3">${item.description}</textarea>
                </div>
            </div>
        `;
        
        container.appendChild(itemElement);
        
        // 绑定事件
        this.bindItemEvents(itemElement, 'experience', item.id);
    }

    /**
     * 添加项目经验项目
     */
    addProjectItem() {
        const item = {
            id: ResumeUtils.generateId(),
            name: '',
            role: '',
            startDate: '',
            endDate: '',
            description: '',
            technologies: ''
        };
        
        this.data.projects.push(item);
        this.renderProjectItem(item);
        this.triggerDataChange();
    }

    /**
     * 渲染项目经验项目
     * @param {Object} item - 项目经验项目
     */
    renderProjectItem(item) {
        const container = document.getElementById('projectList');
        const itemElement = document.createElement('div');
        itemElement.className = 'dynamic-item';
        itemElement.dataset.itemId = item.id;
        
        itemElement.innerHTML = `
            <div class="item-header">
                <span class="item-title">项目经验</span>
                <button class="btn-remove" onclick="formHandler.removeProjectItem('${item.id}')">
                    <span class="icon">🗑️</span>
                    删除
                </button>
            </div>
            <div class="form-row">
                <div class="form-field">
                    <label>项目名称</label>
                    <input type="text" name="name" value="${item.name}" placeholder="请输入项目名称">
                </div>
                <div class="form-field">
                    <label>担任角色</label>
                    <input type="text" name="role" value="${item.role}" placeholder="请输入担任角色">
                </div>
            </div>
            <div class="form-row">
                <div class="form-field">
                    <label>项目时间</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="date" name="startDate" value="${item.startDate}" style="flex: 1;">
                        <span style="color: #999;">至</span>
                        <input type="date" name="endDate" value="${item.endDate}" style="flex: 1;">
                    </div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-field full-width">
                    <label>技术栈</label>
                    <input type="text" name="technologies" value="${item.technologies}" placeholder="请输入使用的技术栈，用逗号分隔">
                </div>
            </div>
            <div class="form-row">
                <div class="form-field full-width">
                    <label>项目描述</label>
                    <textarea name="description" placeholder="请描述项目背景、主要功能、个人贡献等" rows="3">${item.description}</textarea>
                </div>
            </div>
        `;
        
        container.appendChild(itemElement);
        
        // 绑定事件
        this.bindItemEvents(itemElement, 'projects', item.id);
    }

    /**
     * 绑定项目事件
     * @param {HTMLElement} itemElement - 项目元素
     * @param {string} type - 项目类型
     * @param {string} itemId - 项目ID
     */
    bindItemEvents(itemElement, type, itemId) {
        const inputs = itemElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('input', ResumeUtils.debounce(() => {
                this.updateItemData(type, itemId, input.name, input.value);
            }, 300));
        });
    }

    /**
     * 更新项目数据
     * @param {string} type - 项目类型
     * @param {string} itemId - 项目ID
     * @param {string} field - 字段名
     * @param {string} value - 字段值
     */
    updateItemData(type, itemId, field, value) {
        const items = this.data[type];
        const item = items.find(item => item.id === itemId);
        
        if (item) {
            item[field] = value;
            this.data.meta.updatedAt = new Date().toISOString();
            this.triggerDataChange();
        }
    }

    /**
     * 删除教育背景项目
     * @param {string} itemId - 项目ID
     */
    removeEducationItem(itemId) {
        this.removeItem('education', itemId);
    }

    /**
     * 删除工作经历项目
     * @param {string} itemId - 项目ID
     */
    removeExperienceItem(itemId) {
        this.removeItem('experience', itemId);
    }

    /**
     * 删除项目经验项目
     * @param {string} itemId - 项目ID
     */
    removeProjectItem(itemId) {
        this.removeItem('projects', itemId);
    }

    /**
     * 删除项目
     * @param {string} type - 项目类型
     * @param {string} itemId - 项目ID
     */
    removeItem(type, itemId) {
        // 从数据中删除
        this.data[type] = this.data[type].filter(item => item.id !== itemId);
        
        // 从DOM中删除
        const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemElement) {
            itemElement.remove();
        }
        
        this.triggerDataChange();
    }

    /**
     * 触发数据变化事件
     */
    triggerDataChange() {
        console.log('Triggering data change event with data:', this.data);
        
        // 触发自定义事件
        const event = new CustomEvent('dataChange', {
            detail: { data: this.data }
        });
        document.dispatchEvent(event);
        
        // 保存到本地存储
        this.saveToLocalStorage();
    }

    /**
     * 保存到本地存储
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('resumeBuilder_currentData', JSON.stringify(this.data));
            localStorage.setItem('resumeBuilder_currentId', this.currentResumeId || '');
            ResumeUtils.log('debug', 'Data saved to localStorage');
        } catch (error) {
            ResumeUtils.log('error', 'Failed to save to localStorage', error);
        }
    }

    /**
     * 从本地存储加载
     */
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('resumeBuilder_currentData');
            const savedId = localStorage.getItem('resumeBuilder_currentId');
            
            if (savedData) {
                this.data = { ...this.getDefaultData(), ...JSON.parse(savedData) };
                this.currentResumeId = savedId || null;
                this.populateForm();
                ResumeUtils.log('debug', 'Data loaded from localStorage');
            }
        } catch (error) {
            ResumeUtils.log('error', 'Failed to load from localStorage', error);
        }
    }

    /**
     * 填充表单
     */
    populateForm() {
        // 填充基本信息
        Object.keys(this.data.personal).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = this.data.personal[key] || '';
            }
        });

        // 填充技能和自我评价
        const skillsElement = document.getElementById('skills');
        const evaluationElement = document.getElementById('evaluation');
        
        if (skillsElement) skillsElement.value = this.data.skills || '';
        if (evaluationElement) evaluationElement.value = this.data.evaluation || '';

        // 填充动态列表
        this.renderEducationList();
        this.renderExperienceList();
        this.renderProjectList();

        // 触发数据变化事件
        this.triggerDataChange();
    }

    /**
     * 渲染教育背景列表
     */
    renderEducationList() {
        const container = document.getElementById('educationList');
        container.innerHTML = '';
        
        this.data.education.forEach(item => {
            this.renderEducationItem(item);
        });
    }

    /**
     * 渲染工作经历列表
     */
    renderExperienceList() {
        const container = document.getElementById('experienceList');
        container.innerHTML = '';
        
        this.data.experience.forEach(item => {
            this.renderExperienceItem(item);
        });
    }

    /**
     * 渲染项目经验列表
     */
    renderProjectList() {
        const container = document.getElementById('projectList');
        container.innerHTML = '';
        
        this.data.projects.forEach(item => {
            this.renderProjectItem(item);
        });
    }

    /**
     * 获取当前数据
     * @returns {Object} 当前数据
     */
    getData() {
        return ResumeUtils.deepClone(this.data);
    }

    /**
     * 设置数据
     * @param {Object} data - 数据
     * @param {string} resumeId - 简历ID
     */
    setData(data, resumeId = null) {
        this.data = { ...this.getDefaultData(), ...data };
        this.currentResumeId = resumeId;
        this.populateForm();
    }

    /**
     * 清空数据
     */
    clearData() {
        this.data = this.getDefaultData();
        this.currentResumeId = null;
        this.populateForm();
        localStorage.removeItem('resumeBuilder_currentData');
        localStorage.removeItem('resumeBuilder_currentId');
    }

    /**
     * 保存简历到服务器
     * @param {string} name - 简历名称
     * @param {string} description - 简历描述
     * @returns {Promise} 保存结果
     */
    async saveResume(name, description = '') {
        try {
            if (!this.validateRequired()) {
                throw new Error('请填写所有必填项');
            }

            const resumeData = {
                id: this.currentResumeId || ResumeUtils.generateId(),
                name: name,
                description: description,
                data: this.getData(),
                createdAt: this.currentResumeId ? this.data.meta.createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // 发送到服务器
            const url = this.currentResumeId 
                ? `${this.apiBaseUrl}/api/resumes/${this.currentResumeId}`
                : `${this.apiBaseUrl}/api/resumes`;
            
            const response = await fetch(url, {
                method: this.currentResumeId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resumeData)
            });

            if (!response.ok) {
                throw new Error('保存失败');
            }

            const result = await response.json();
            const resumeId = result.success ? result.data.id : result.id;
            this.currentResumeId = resumeId;
            
            ResumeUtils.log('info', 'Resume saved successfully', { id: resumeId });
            return result.success ? result.data : result;
        } catch (error) {
            ResumeUtils.log('error', 'Failed to save resume', error);
            throw error;
        }
    }

    /**
     * 加载简历列表
     * @returns {Promise<Array>} 简历列表
     */
    async loadResumeList() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/resumes`);
            
            if (!response.ok) {
                throw new Error('加载失败');
            }

            const result = await response.json();
            const resumes = result.success ? result.data : [];
            ResumeUtils.log('info', 'Resume list loaded', { count: resumes.length });
            return resumes;
        } catch (error) {
            ResumeUtils.log('error', 'Failed to load resume list', error);
            throw error;
        }
    }

    /**
     * 加载指定简历
     * @param {string} resumeId - 简历ID
     * @returns {Promise<Object>} 简历数据
     */
    async loadResume(resumeId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/resumes/${resumeId}`);
            
            if (!response.ok) {
                throw new Error('加载失败');
            }

            const result = await response.json();
            const resume = result.success ? result.data : result;
            this.setData(resume.data, resume.id);
            
            ResumeUtils.log('info', 'Resume loaded', { id: resumeId });
            return resume;
        } catch (error) {
            ResumeUtils.log('error', 'Failed to load resume', error);
            throw error;
        }
    }

    /**
     * 删除简历
     * @param {string} resumeId - 简历ID
     * @returns {Promise} 删除结果
     */
    async deleteResume(resumeId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/resumes/${resumeId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('删除失败');
            }

            ResumeUtils.log('info', 'Resume deleted', { id: resumeId });
            return true;
        } catch (error) {
            ResumeUtils.log('error', 'Failed to delete resume', error);
            throw error;
        }
    }
}

// 导出表单处理器
window.FormHandler = FormHandler;