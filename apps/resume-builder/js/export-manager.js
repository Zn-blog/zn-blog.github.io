/**
 * 导出管理器
 * 负责将简历导出为PDF和Word格式
 */

class ExportManager {
    constructor() {
        this.isExporting = false;
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.bindEvents();
        ResumeUtils.log('info', 'ExportManager initialized');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // PDF导出按钮
        const exportPdfBtn = document.getElementById('exportPdfBtn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => {
                this.exportToPDF();
            });
        }

        // Word导出按钮
        const exportWordBtn = document.getElementById('exportWordBtn');
        if (exportWordBtn) {
            exportWordBtn.addEventListener('click', () => {
                this.exportToWord();
            });
        }
    }

    /**
     * 导出为PDF
     */
    async exportToPDF() {
        if (this.isExporting) return;

        try {
            this.isExporting = true;
            this.showLoading('正在生成PDF...');

            // 获取简历预览元素
            const resumePreview = document.getElementById('resumePreview');
            if (!resumePreview) {
                throw new Error('找不到简历预览内容');
            }

            // 检查是否有内容
            if (resumePreview.querySelector('.preview-placeholder')) {
                throw new Error('请先填写简历内容');
            }

            // 创建临时容器用于导出
            const exportContainer = this.createExportContainer(resumePreview);
            document.body.appendChild(exportContainer);

            // 使用html2canvas生成图片
            const canvas = await html2canvas(exportContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 794, // A4宽度 (210mm * 3.78)
                height: 1123, // A4高度 (297mm * 3.78)
                scrollX: 0,
                scrollY: 0
            });

            // 创建PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // 计算图片尺寸
            const imgWidth = 210; // A4宽度
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // 如果内容超过一页，需要分页
            if (imgHeight > 297) {
                await this.addMultiplePages(pdf, canvas, imgWidth);
            } else {
                // 单页内容
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            }

            // 清理临时容器
            document.body.removeChild(exportContainer);

            // 生成文件名
            const fileName = this.generateFileName('pdf');
            
            // 下载PDF
            pdf.save(fileName);

            this.hideLoading();
            ResumeUtils.showMessage('PDF导出成功！', 'success');

        } catch (error) {
            this.hideLoading();
            ResumeUtils.log('error', 'PDF export failed', error);
            ResumeUtils.showMessage(`PDF导出失败: ${error.message}`, 'error');
        } finally {
            this.isExporting = false;
        }
    }
    /**
     * 添加多页内容到PDF
     * @param {jsPDF} pdf - PDF对象
     * @param {HTMLCanvasElement} canvas - 画布
     * @param {number} imgWidth - 图片宽度
     */
    async addMultiplePages(pdf, canvas, imgWidth) {
        const pageHeight = 297; // A4高度
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const totalPages = Math.ceil(imgHeight / pageHeight);

        for (let i = 0; i < totalPages; i++) {
            if (i > 0) {
                pdf.addPage();
            }

            // 创建每页的画布
            const pageCanvas = document.createElement('canvas');
            const pageCtx = pageCanvas.getContext('2d');
            
            pageCanvas.width = canvas.width;
            pageCanvas.height = (pageHeight * canvas.width) / imgWidth;

            // 绘制当前页内容
            pageCtx.drawImage(
                canvas,
                0, i * pageCanvas.height,
                canvas.width, pageCanvas.height,
                0, 0,
                pageCanvas.width, pageCanvas.height
            );

            const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
            pdf.addImage(pageImgData, 'JPEG', 0, 0, imgWidth, pageHeight);
        }
    }

    /**
     * 导出为Word
     */
    async exportToWord() {
        if (this.isExporting) return;

        try {
            this.isExporting = true;
            this.showLoading('正在生成Word文档...');

            // 获取表单数据
            const data = window.formHandler ? window.formHandler.getData() : null;
            if (!data) {
                throw new Error('无法获取简历数据');
            }

            // 检查必要数据
            if (!data.personal.name) {
                throw new Error('请先填写基本信息');
            }

            // 获取预览区域的HTML和样式
            const previewContent = this.getPreviewContent();
            
            // 创建Word文档内容（使用预览样式）
            const docContent = this.createWordContentFromPreview(previewContent);

            // 生成文件名
            const fileName = this.generateFileName('docx');

            // 下载Word文件
            this.downloadWordFile(docContent, fileName);

            this.hideLoading();
            ResumeUtils.showMessage('Word文档导出成功！', 'success');

        } catch (error) {
            this.hideLoading();
            ResumeUtils.log('error', 'Word export failed', error);
            ResumeUtils.showMessage(`Word导出失败: ${error.message}`, 'error');
        } finally {
            this.isExporting = false;
        }
    }

    /**
     * 获取预览区域的内容和样式
     * @returns {Object} 包含HTML和CSS的对象
     */
    getPreviewContent() {
        const resumePreview = document.getElementById('resumePreview');
        if (!resumePreview) {
            throw new Error('找不到简历预览区域');
        }

        // 检查是否有内容
        if (resumePreview.querySelector('.preview-placeholder')) {
            throw new Error('请先填写简历内容');
        }

        // 获取预览区域的HTML
        const previewHTML = resumePreview.innerHTML;
        
        // 获取相关的CSS样式（包括计算样式）
        const cssStyles = this.extractAllRelevantStyles();
        
        return {
            html: previewHTML,
            css: cssStyles
        };
    }

    /**
     * 提取所有相关的CSS样式（包括计算样式）
     * @returns {string} CSS样式字符串
     */
    extractAllRelevantStyles() {
        let cssText = '';
        
        // 1. 首先提取样式表中的规则
        cssText += this.extractStyleSheetRules();
        
        // 2. 提取内联样式和计算样式
        cssText += this.extractComputedStyles();
        
        // 3. 如果没有提取到样式，使用默认样式
        if (!cssText.trim()) {
            cssText = this.getDefaultResumeStyles();
        }
        
        return cssText;
    }

    /**
     * 提取样式表规则
     * @returns {string} CSS样式字符串
     */
    extractStyleSheetRules() {
        const styleSheets = document.styleSheets;
        let cssText = '';
        
        // 遍历所有样式表
        for (let i = 0; i < styleSheets.length; i++) {
            try {
                const styleSheet = styleSheets[i];
                
                // 跳过外部样式表（避免CORS问题）
                if (styleSheet.href && !styleSheet.href.includes(window.location.origin)) {
                    continue;
                }
                
                const rules = styleSheet.cssRules || styleSheet.rules;
                if (rules) {
                    for (let j = 0; j < rules.length; j++) {
                        const rule = rules[j];
                        
                        // 提取简历相关的样式
                        if (rule.selectorText && this.isResumeRelatedSelector(rule.selectorText)) {
                            cssText += rule.cssText + '\n';
                        }
                    }
                }
            } catch (e) {
                // 忽略跨域样式表错误
                console.warn('无法访问样式表:', e);
            }
        }
        
        return cssText;
    }

    /**
     * 检查选择器是否与简历相关
     * @param {string} selector - CSS选择器
     * @returns {boolean} 是否相关
     */
    isResumeRelatedSelector(selector) {
        const resumeSelectors = [
            '.resume-template',
            '.classic-template',
            '.modern-template', 
            '.creative-template',
            '.tech-template',
            '.academic-template',
            '.resume-header',
            '.resume-main',
            '.resume-section',
            '.section-title',
            '.personal-info',
            '.contact-info',
            '.contact-item',
            '.profile-photo',
            '.photo-container',
            '.experience-item',
            '.education-item',
            '.project-item',
            '.item-header',
            '.company',
            '.school',
            '.project-name',
            '.position',
            '.degree',
            '.role',
            '.period',
            '.description',
            '.skills-list',
            '.skill-tag',
            '.skill-item',
            '.evaluation',
            '.technologies'
        ];
        
        return resumeSelectors.some(resumeSelector => 
            selector.includes(resumeSelector)
        );
    }

    /**
     * 提取计算样式
     * @returns {string} CSS样式字符串
     */
    extractComputedStyles() {
        const resumePreview = document.getElementById('resumePreview');
        if (!resumePreview) return '';
        
        let cssText = '';
        
        // 获取预览区域内所有元素的计算样式
        const allElements = resumePreview.querySelectorAll('*');
        const processedClasses = new Set();
        
        allElements.forEach(element => {
            // 为每个唯一的class组合生成样式
            const classList = Array.from(element.classList);
            if (classList.length > 0) {
                const classKey = classList.sort().join(' ');
                
                if (!processedClasses.has(classKey)) {
                    processedClasses.add(classKey);
                    
                    const computedStyle = window.getComputedStyle(element);
                    const selector = '.' + classList.join('.');
                    
                    // 提取重要的样式属性
                    const importantProps = [
                        'font-family', 'font-size', 'font-weight', 'font-style',
                        'color', 'background-color', 'background',
                        'margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
                        'padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
                        'border', 'border-top', 'border-bottom', 'border-left', 'border-right',
                        'border-radius', 'border-color', 'border-width', 'border-style',
                        'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
                        'display', 'flex-direction', 'justify-content', 'align-items', 'gap',
                        'line-height', 'text-align', 'text-decoration', 'text-transform',
                        'position', 'top', 'bottom', 'left', 'right', 'z-index',
                        'opacity', 'box-shadow', 'transform'
                    ];
                    
                    let styleDeclarations = '';
                    importantProps.forEach(prop => {
                        const value = computedStyle.getPropertyValue(prop);
                        if (value && value !== 'none' && value !== 'auto' && value !== 'normal') {
                            styleDeclarations += `    ${prop}: ${value};\n`;
                        }
                    });
                    
                    if (styleDeclarations) {
                        cssText += `${selector} {\n${styleDeclarations}}\n\n`;
                    }
                }
            }
        });
        
        return cssText;
    }

    /**
     * 获取默认简历样式
     * @returns {string} 默认CSS样式
     */
    getDefaultResumeStyles() {
        return `
            .resume-template {
                background: white;
                color: #333;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                padding: 40px;
                margin: 0 auto;
                box-sizing: border-box;
            }
            
            .classic-template .resume-header {
                border-bottom: 3px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }
            
            .classic-template .name {
                font-size: 32px;
                font-weight: 700;
                color: #007bff;
                margin-bottom: 8px;
            }
            
            .classic-template .position {
                font-size: 20px;
                color: #666;
                margin-bottom: 15px;
                font-weight: 500;
            }
            
            .classic-template .contact-info {
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
            }
            
            .classic-template .contact-item {
                font-size: 14px;
                color: #555;
            }
            
            .classic-template .section-title {
                font-size: 20px;
                font-weight: 700;
                color: #007bff;
                margin: 30px 0 15px 0;
                padding-bottom: 8px;
                border-bottom: 2px solid #e9ecef;
                position: relative;
            }
            
            .classic-template .section-title::before {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                width: 50px;
                height: 2px;
                background: #007bff;
            }
            
            .classic-template .experience-item,
            .classic-template .education-item,
            .classic-template .project-item {
                margin-bottom: 20px;
                padding: 15px;
                border-left: 4px solid #e9ecef;
                background: #f8f9fa;
            }
            
            .classic-template .item-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }
            
            .classic-template .company,
            .classic-template .school,
            .classic-template .project-name {
                font-size: 18px;
                font-weight: 600;
                color: #333;
            }
            
            .classic-template .period {
                font-size: 14px;
                color: #666;
                background: #e9ecef;
                padding: 4px 8px;
                border-radius: 4px;
            }
            
            .classic-template .description {
                font-size: 14px;
                line-height: 1.6;
                margin-top: 8px;
            }
            
            .classic-template .skill-tag {
                background: #007bff;
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
                display: inline-block;
                margin: 2px;
            }
        `;
    }

    /**
     * 从预览内容创建Word文档
     * @param {Object} previewContent - 预览内容对象
     * @returns {string} Word文档HTML内容
     */
    createWordContentFromPreview(previewContent) {
        // 处理HTML内容，确保图片路径正确
        const processedHTML = this.processHTMLForWord(previewContent.html);
        
        // 优化CSS样式，确保在Word中正确显示
        const optimizedCSS = this.optimizeCSSForWord(previewContent.css);
        
        return `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="utf-8">
    <title>简历</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
            <w:DoNotPromptForConvert/>
            <w:DoNotShowInsertionsAndDeletions/>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        /* 基础重置样式 */
        * {
            box-sizing: border-box;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        /* 预览区域的原始样式 */
        ${optimizedCSS}
        
        /* Word导出专用优化样式 */
        .resume-template {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 40px !important;
            background: white !important;
        }
        
        /* 确保在Word中正确显示 */
        .resume-header {
            page-break-inside: avoid;
        }
        
        .resume-section {
            page-break-inside: avoid;
            margin-bottom: 25px;
        }
        
        .experience-item,
        .education-item,
        .project-item {
            page-break-inside: avoid;
            margin-bottom: 20px;
        }
        
        /* 修复Word中的图片显示 */
        .profile-photo {
            max-width: 120px !important;
            height: auto !important;
            display: block;
        }
        
        .photo-container {
            text-align: center;
        }
        
        /* 确保文字在Word中正确换行 */
        .description,
        .evaluation {
            word-wrap: break-word;
            word-break: break-word;
            hyphens: auto;
        }
        
        /* 修复Flex布局在Word中的问题 */
        .item-header {
            display: block !important;
        }
        
        .contact-info {
            display: block !important;
        }
        
        .contact-item {
            display: inline-block;
            margin-right: 20px;
            margin-bottom: 5px;
        }
        
        /* 确保颜色在Word中正确显示 */
        .name {
            color: #007bff !important;
        }
        
        .section-title {
            color: #007bff !important;
        }
        
        /* 修复边框和背景 */
        .classic-template .resume-header {
            border-bottom: 3px solid #007bff !important;
        }
        
        .classic-template .section-title::before {
            background: #007bff !important;
        }
        
        /* 隐藏页面指示器 */
        .page-indicator {
            display: none !important;
        }
        
        /* 确保技能标签正确显示 */
        .skill-tag,
        .skill-item {
            display: inline-block;
            margin: 2px;
            padding: 6px 12px;
            background: #007bff !important;
            color: white !important;
            border-radius: 20px;
        }
    </style>
</head>
<body>
    ${processedHTML}
</body>
</html>`;
    }

    /**
     * 处理HTML内容以适配Word
     * @param {string} html - 原始HTML
     * @returns {string} 处理后的HTML
     */
    processHTMLForWord(html) {
        let processedHTML = html;
        
        // 处理图片路径，确保base64图片正确显示
        processedHTML = processedHTML.replace(
            /<img([^>]*?)src="data:image\/([^"]*?)"([^>]*?)>/g,
            '<img$1src="data:image/$2"$3>'
        );
        
        // 移除页面指示器
        processedHTML = processedHTML.replace(
            /<div class="page-indicator"[^>]*>.*?<\/div>/g,
            ''
        );
        
        // 确保所有文本内容都被正确包装
        processedHTML = processedHTML.replace(
            /(<p[^>]*>)(.*?)(<\/p>)/g,
            '$1$2$3'
        );
        
        return processedHTML;
    }

    /**
     * 优化CSS样式以适配Word
     * @param {string} css - 原始CSS
     * @returns {string} 优化后的CSS
     */
    optimizeCSSForWord(css) {
        let optimizedCSS = css;
        
        // 移除可能导致Word显示问题的属性
        const problematicProps = [
            'transform',
            'transition',
            'animation',
            'backdrop-filter',
            'filter',
            'clip-path',
            'mask'
        ];
        
        problematicProps.forEach(prop => {
            const regex = new RegExp(`\\s*${prop}\\s*:[^;]+;`, 'g');
            optimizedCSS = optimizedCSS.replace(regex, '');
        });
        
        // 修复flex布局问题
        optimizedCSS = optimizedCSS.replace(
            /display\s*:\s*flex\s*;/g,
            'display: block;'
        );
        
        // 确保重要样式使用!important
        optimizedCSS = optimizedCSS.replace(
            /(font-family\s*:\s*[^;]+);/g,
            '$1 !important;'
        );
        
        optimizedCSS = optimizedCSS.replace(
            /(color\s*:\s*[^;]+);/g,
            '$1 !important;'
        );
        
        return optimizedCSS;
    }

    /**
     * 创建Word文档内容（备用方法）
     * @param {Object} data - 简历数据
     * @returns {string} Word文档HTML内容
     */
    createWordContent(data) {
        const { personal, education, experience, projects, skills, evaluation } = data;
        
        let content = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: "Microsoft YaHei", "SimSun", Arial, sans-serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .position {
            font-size: 18px;
            color: #666;
            margin-bottom: 15px;
        }
        .contact-info {
            font-size: 14px;
            line-height: 1.8;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .item {
            margin-bottom: 20px;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }
        .item-title {
            font-weight: bold;
            font-size: 16px;
        }
        .item-date {
            color: #666;
            font-size: 14px;
        }
        .item-subtitle {
            color: #555;
            font-size: 14px;
            margin-bottom: 8px;
        }
        .item-description {
            font-size: 14px;
            line-height: 1.5;
        }
        .skills-content, .evaluation-content {
            font-size: 14px;
            line-height: 1.6;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
    </style>
</head>
<body>`;

        // 头部信息
        content += `
    <div class="header">
        <div class="name">${personal.name || ''}</div>
        <div class="position">${personal.position || ''}</div>
        <div class="contact-info">
            ${personal.phone ? `电话：${personal.phone}` : ''}
            ${personal.phone && personal.email ? ' | ' : ''}
            ${personal.email ? `邮箱：${personal.email}` : ''}
            ${(personal.phone || personal.email) && personal.address ? ' | ' : ''}
            ${personal.address ? `地址：${personal.address}` : ''}
            ${personal.age || personal.gender ? '<br>' : ''}
            ${personal.age ? `年龄：${personal.age}` : ''}
            ${personal.age && personal.gender ? ' | ' : ''}
            ${personal.gender ? `性别：${personal.gender}` : ''}
        </div>
    </div>`;

        // 技能特长
        if (skills) {
            content += `
    <div class="section">
        <div class="section-title">技能特长</div>
        <div class="skills-content">${skills}</div>
    </div>`;
        }

        // 自我评价
        if (evaluation) {
            content += `
    <div class="section">
        <div class="section-title">自我评价</div>
        <div class="evaluation-content">${evaluation}</div>
    </div>`;
        }

        // 教育背景
        if (education && education.length > 0) {
            content += `
    <div class="section">
        <div class="section-title">教育背景</div>`;
            
            education.forEach(edu => {
                const dateRange = this.formatDateRange(edu.startDate, edu.endDate);
                content += `
        <div class="item">
            <div class="item-header">
                <div class="item-title">${edu.school || ''}</div>
                <div class="item-date">${dateRange}</div>
            </div>
            <div class="item-subtitle">${edu.major || ''} | ${edu.degree || ''}</div>
            ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
        </div>`;
            });
            
            content += `</div>`;
        }

        // 工作经历
        if (experience && experience.length > 0) {
            content += `
    <div class="section">
        <div class="section-title">工作经历</div>`;
            
            experience.forEach(exp => {
                const dateRange = this.formatDateRange(exp.startDate, exp.endDate);
                content += `
        <div class="item">
            <div class="item-header">
                <div class="item-title">${exp.company || ''}</div>
                <div class="item-date">${dateRange}</div>
            </div>
            <div class="item-subtitle">${exp.position || ''}</div>
            ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
        </div>`;
            });
            
            content += `</div>`;
        }

        // 项目经验
        if (projects && projects.length > 0) {
            content += `
    <div class="section">
        <div class="section-title">项目经验</div>`;
            
            projects.forEach(project => {
                const dateRange = this.formatDateRange(project.startDate, project.endDate);
                content += `
        <div class="item">
            <div class="item-header">
                <div class="item-title">${project.name || ''}</div>
                <div class="item-date">${dateRange}</div>
            </div>
            <div class="item-subtitle">${project.role || ''}</div>
            ${project.technologies ? `<div class="item-subtitle">技术栈：${project.technologies}</div>` : ''}
            ${project.description ? `<div class="item-description">${project.description}</div>` : ''}
        </div>`;
            });
            
            content += `</div>`;
        }

        content += `
</body>
</html>`;

        return content;
    }

    /**
     * 格式化日期范围
     * @param {string} startDate - 开始日期
     * @param {string} endDate - 结束日期
     * @returns {string} 格式化的日期范围
     */
    formatDateRange(startDate, endDate) {
        if (!startDate && !endDate) return '';
        
        const start = startDate ? this.formatDate(startDate) : '';
        const end = endDate ? this.formatDate(endDate) : '至今';
        
        if (!start) return end;
        if (!endDate) return `${start} - 至今`;
        
        return `${start} - ${end}`;
    }

    /**
     * 格式化日期
     * @param {string} dateStr - 日期字符串
     * @returns {string} 格式化的日期
     */
    formatDate(dateStr) {
        if (!dateStr) return '';
        
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        
        return `${year}.${month}`;
    }

    /**
     * 下载Word文件
     * @param {string} content - HTML内容
     * @param {string} filename - 文件名
     */
    downloadWordFile(content, filename) {
        // 创建Word文档的HTML格式
        const wordContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="utf-8">
    <title>简历</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
            <w:DoNotPromptForConvert/>
            <w:DoNotShowInsertionsAndDeletions/>
        </w:WordDocument>
    </xml>
    <![endif]-->
</head>
${content.replace('<body>', '<body>').replace('</body>', '</body>')}
</html>`;

        // 创建Blob并下载
        const blob = new Blob(['\ufeff', wordContent], {
            type: 'application/msword'
        });
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * 导出为CSV (备用方案)
     */
    async exportToCSV() {
        if (this.isExporting) return;

        try {
            this.isExporting = true;
            this.showLoading('正在生成CSV文件...');

            // 获取表单数据
            const data = window.formHandler ? window.formHandler.getData() : null;
            if (!data) {
                throw new Error('无法获取简历数据');
            }

            // 检查必要数据
            if (!data.personal.name) {
                throw new Error('请先填写基本信息');
            }

            // 创建CSV内容
            let csvContent = '';
            
            // 基本信息部分
            csvContent += '基本信息\n';
            csvContent += '字段,内容\n';
            csvContent += `姓名,"${this.escapeCSV(data.personal.name || '')}"\n`;
            csvContent += `联系电话,"${this.escapeCSV(data.personal.phone || '')}"\n`;
            csvContent += `邮箱地址,"${this.escapeCSV(data.personal.email || '')}"\n`;
            csvContent += `求职意向,"${this.escapeCSV(data.personal.position || '')}"\n`;
            csvContent += `年龄,"${this.escapeCSV(data.personal.age || '')}"\n`;
            csvContent += `性别,"${this.escapeCSV(data.personal.gender || '')}"\n`;
            csvContent += `居住地址,"${this.escapeCSV(data.personal.address || '')}"\n`;
            csvContent += `技能特长,"${this.escapeCSV(data.skills || '')}"\n`;
            csvContent += `自我评价,"${this.escapeCSV(data.evaluation || '')}"\n`;
            csvContent += '\n';

            // 教育背景部分
            if (data.education && data.education.length > 0) {
                csvContent += '教育背景\n';
                csvContent += '学校名称,专业,学历,开始时间,结束时间,描述\n';
                data.education.forEach(edu => {
                    csvContent += `"${this.escapeCSV(edu.school || '')}","${this.escapeCSV(edu.major || '')}","${this.escapeCSV(edu.degree || '')}","${this.escapeCSV(edu.startDate || '')}","${this.escapeCSV(edu.endDate || '')}","${this.escapeCSV(edu.description || '')}"\n`;
                });
                csvContent += '\n';
            }

            // 工作经历部分
            if (data.experience && data.experience.length > 0) {
                csvContent += '工作经历\n';
                csvContent += '公司名称,职位,开始时间,结束时间,工作描述\n';
                data.experience.forEach(exp => {
                    csvContent += `"${this.escapeCSV(exp.company || '')}","${this.escapeCSV(exp.position || '')}","${this.escapeCSV(exp.startDate || '')}","${this.escapeCSV(exp.endDate || '')}","${this.escapeCSV(exp.description || '')}"\n`;
                });
                csvContent += '\n';
            }

            // 项目经验部分
            if (data.projects && data.projects.length > 0) {
                csvContent += '项目经验\n';
                csvContent += '项目名称,担任角色,开始时间,结束时间,技术栈,项目描述\n';
                data.projects.forEach(project => {
                    csvContent += `"${this.escapeCSV(project.name || '')}","${this.escapeCSV(project.role || '')}","${this.escapeCSV(project.startDate || '')}","${this.escapeCSV(project.endDate || '')}","${this.escapeCSV(project.technologies || '')}","${this.escapeCSV(project.description || '')}"\n`;
                });
            }

            // 生成文件名
            const fileName = this.generateFileName('csv');

            // 下载CSV文件
            this.downloadCSV(csvContent, fileName);

            this.hideLoading();
            ResumeUtils.showMessage('CSV导出成功！可以用Excel打开', 'success');

        } catch (error) {
            this.hideLoading();
            ResumeUtils.log('error', 'CSV export failed', error);
            ResumeUtils.showMessage(`CSV导出失败: ${error.message}`, 'error');
        } finally {
            this.isExporting = false;
        }
    }

    /**
     * 转义CSV字段
     * @param {string} text - 要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeCSV(text) {
        if (!text) return '';
        return text.toString().replace(/"/g, '""');
    }

    /**
     * 下载CSV文件
     * @param {string} content - CSV内容
     * @param {string} filename - 文件名
     */
    downloadCSV(content, filename) {
        // 添加BOM以支持中文
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * 创建导出容器
     * @param {HTMLElement} source - 源元素
     * @returns {HTMLElement} 导出容器
     */
    createExportContainer(source) {
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            top: -10000px;
            left: -10000px;
            width: 794px;
            background: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            z-index: -1;
        `;

        // 复制内容
        container.innerHTML = source.innerHTML;

        // 添加导出专用样式
        this.addExportStyles(container);

        return container;
    }

    /**
     * 添加导出专用样式
     * @param {HTMLElement} container - 容器元素
     */
    addExportStyles(container) {
        const style = document.createElement('style');
        style.textContent = `
            .resume-template {
                padding: 40px;
                color: #333;
                line-height: 1.6;
            }
            
            .resume-header {
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
            }
            
            .name {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 8px;
            }
            
            .position {
                font-size: 18px;
                color: #666;
                margin-bottom: 15px;
            }
            
            .contact-info {
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
            }
            
            .contact-item {
                font-size: 14px;
            }
            
            .profile-photo {
                width: 120px;
                height: 120px;
                border-radius: 8px;
                object-fit: cover;
            }
            
            .section-title {
                font-size: 18px;
                font-weight: bold;
                margin: 25px 0 15px 0;
                color: #333;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
            }
            
            .resume-section {
                margin-bottom: 25px;
            }
            
            .experience-item,
            .education-item,
            .project-item {
                margin-bottom: 20px;
            }
            
            .item-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }
            
            .company,
            .school,
            .project-name {
                font-size: 16px;
                font-weight: bold;
                color: #333;
            }
            
            .period {
                font-size: 14px;
                color: #666;
            }
            
            .position,
            .degree,
            .role {
                font-size: 14px;
                color: #555;
                margin-bottom: 8px;
            }
            
            .description {
                font-size: 14px;
                line-height: 1.5;
                margin-top: 8px;
            }
            
            .skills-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .skill-tag {
                background: #f0f0f0;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
            }
        `;
        
        container.appendChild(style);
    }

    /**
     * 生成文件名
     * @param {string} extension - 文件扩展名
     * @returns {string} 文件名
     */
    generateFileName(extension) {
        const data = window.formHandler ? window.formHandler.getData() : null;
        const name = data && data.personal.name ? data.personal.name : '简历';
        const timestamp = ResumeUtils.formatDate(new Date(), 'YYYYMMDD');
        
        return `${name}_${timestamp}.${extension}`;
    }

    /**
     * 显示加载状态
     * @param {string} message - 加载消息
     */
    showLoading(message = '正在处理...') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingText = document.querySelector('.loading-text');
        
        if (loadingOverlay) {
            if (loadingText) {
                loadingText.textContent = message;
            }
            loadingOverlay.style.display = 'flex';
        }
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}

// 导出管理器
window.ExportManager = ExportManager;