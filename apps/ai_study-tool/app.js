// 应用状态
let currentCourseIndex = -1;
let completedCourses = JSON.parse(localStorage.getItem('completedCourses') || '[]');
let currentProgress = JSON.parse(localStorage.getItem('currentProgress') || '{}');

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    renderCourseList();
    updateProgress();
    
    // 绑定事件
    document.getElementById('startLearningBtn').addEventListener('click', startLearning);
    document.getElementById('nextBtn').addEventListener('click', nextCourse);
    document.getElementById('prevBtn').addEventListener('click', prevCourse);
    
    // 恢复上次学习进度
    if (currentProgress.courseIndex !== undefined) {
        currentCourseIndex = currentProgress.courseIndex;
        loadCourse(currentCourseIndex);
    }
});

// 渲染课程列表
function renderCourseList() {
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';
    
    courses.forEach((course, index) => {
        const isCompleted = completedCourses.includes(course.id);
        const isActive = index === currentCourseIndex;
        
        const li = document.createElement('li');
        li.className = `course-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
        li.innerHTML = `
            <span class="course-number">${course.id}</span>
            <span>${course.title}</span>
        `;
        li.addEventListener('click', () => loadCourse(index));
        courseList.appendChild(li);
    });
}

// 开始学习
function startLearning() {
    currentCourseIndex = 0;
    loadCourse(0);
}

// 加载课程
function loadCourse(index) {
    if (index < 0 || index >= courses.length) return;
    
    currentCourseIndex = index;
    const course = courses[index];
    
    // 更新标题
    document.getElementById('courseTitle').textContent = course.title;
    
    // 渲染内容
    renderCourseContent(course);
    
    // 更新导航按钮
    updateNavigationButtons();
    
    // 更新课程列表高亮
    renderCourseList();
    
    // 保存进度
    saveProgress();
}

// 渲染课程内容
function renderCourseContent(course) {
    const contentBody = document.getElementById('contentBody');
    const content = course.content;
    
    let html = '<div class="lesson-content">';
    
    // 课程描述
    html += `
        <div class="lesson-section">
            <h3><i class="fas fa-info-circle"></i> 课程简介</h3>
            <p>${course.description}</p>
        </div>
    `;
    
    // 渲染各个章节
    content.sections.forEach((section, index) => {
        html += `
            <div class="lesson-section">
                <h3>
                    <i class="fas fa-${section.type === 'code' ? 'code' : 'book'}"></i>
                    ${section.title}
                </h3>
                ${section.content}
            </div>
        `;
    });
    
    // 完成按钮
    html += `
        <div class="lesson-section">
            <button class="btn btn-primary btn-large" onclick="completeCourse(${course.id})" 
                    ${completedCourses.includes(course.id) ? 'disabled' : ''}>
                <i class="fas fa-check"></i>
                ${completedCourses.includes(course.id) ? '已完成' : '标记为完成'}
            </button>
        </div>
    `;
    
    html += '</div>';
    contentBody.innerHTML = html;
    
    // 为代码块添加复制到编辑器按钮
    addCopyToEditorButtons();
    
    // 为代码块添加语法高亮
    highlightCodeBlocks();
    
    // 隐藏欢迎界面
    document.querySelector('.welcome-screen')?.remove();
}

// 为代码块添加语法高亮
function highlightCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.code-block pre');
    codeBlocks.forEach(pre => {
        const codeBlock = pre.closest('.code-block');
        const langSpan = codeBlock?.querySelector('.code-block-header span');
        const language = langSpan?.textContent?.trim() || 'python';
        
        // 添加语言类名
        pre.className = `language-${language}`;
        
        // 使用 Prism.js 高亮
        if (window.Prism) {
            Prism.highlightElement(pre);
        }
    });
}

// 为代码块添加复制到编辑器按钮
function addCopyToEditorButtons() {
    const codeBlocks = document.querySelectorAll('.code-block');
    codeBlocks.forEach(block => {
        const header = block.querySelector('.code-block-header');
        if (header) {
            // 检查是否已有复制到编辑器按钮
            if (!header.querySelector('.copy-to-editor-btn')) {
                const actions = header.querySelector('.code-actions') || document.createElement('div');
                actions.className = 'code-actions';
                
                const copyToEditorBtn = document.createElement('button');
                copyToEditorBtn.className = 'copy-to-editor-btn';
                copyToEditorBtn.innerHTML = '<i class="fas fa-code"></i> 复制到编辑器';
                copyToEditorBtn.title = '将代码复制到代码测试编辑器';
                
                actions.appendChild(copyToEditorBtn);
                if (!header.querySelector('.code-actions')) {
                    header.appendChild(actions);
                }
            }
        }
    });
}

// 更新导航按钮
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentCourseIndex === 0;
    
    if (currentCourseIndex === courses.length - 1) {
        nextBtn.disabled = true;
        nextBtn.innerHTML = '<i class="fas fa-check"></i> 已完成所有课程';
    } else {
        nextBtn.disabled = false;
        nextBtn.innerHTML = '下一课 <i class="fas fa-chevron-right"></i>';
    }
}

// 下一课
function nextCourse() {
    if (currentCourseIndex < courses.length - 1) {
        loadCourse(currentCourseIndex + 1);
        // 滚动到顶部
        document.querySelector('.content-body').scrollTop = 0;
    }
}

// 上一课
function prevCourse() {
    if (currentCourseIndex > 0) {
        loadCourse(currentCourseIndex - 1);
        // 滚动到顶部
        document.querySelector('.content-body').scrollTop = 0;
    }
}

// 完成课程
function completeCourse(courseId) {
    if (!completedCourses.includes(courseId)) {
        completedCourses.push(courseId);
        localStorage.setItem('completedCourses', JSON.stringify(completedCourses));
        
        // 更新UI
        renderCourseList();
        updateProgress();
        
        // 重新渲染当前课程内容
        if (currentCourseIndex >= 0) {
            loadCourse(currentCourseIndex);
        }
        
        // 显示成功消息
        showNotification('课程已完成！', 'success');
        
        // 自动进入下一课
        if (currentCourseIndex < courses.length - 1) {
            setTimeout(() => {
                nextCourse();
            }, 1000);
        }
    }
}

// 更新进度
function updateProgress() {
    const totalCourses = courses.length;
    const completedCount = completedCourses.length;
    const progress = (completedCount / totalCourses) * 100;
    
    document.getElementById('progressPercent').textContent = `${Math.round(progress)}%`;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

// 保存进度
function saveProgress() {
    currentProgress.courseIndex = currentCourseIndex;
    localStorage.setItem('currentProgress', JSON.stringify(currentProgress));
}

// 复制代码
function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const code = codeBlock.querySelector('pre').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        const originalText = button.textContent;
        button.textContent = '已复制！';
        button.style.background = 'rgba(16, 185, 129, 0.2)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    });
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : '#667eea'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    /* 滚动时显示滚动条 */
    .scrolling::-webkit-scrollbar-thumb {
        background: rgba(102, 126, 234, 0.4) !important;
    }
    
    .course-nav.scrolling::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2) !important;
    }
    
    .code-output.scrolling::-webkit-scrollbar-thumb,
    .code-editor.scrolling::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.4) !important;
    }
`;
document.head.appendChild(style);

// 滚动时显示滚动条，不滚动时隐藏
function setupScrollbarVisibility() {
    const scrollableElements = [
        document.querySelector('.content-body'),
        document.querySelector('.course-nav'),
        document.querySelector('.code-output'),
        document.querySelector('.code-editor')
    ];
    
    scrollableElements.forEach(element => {
        if (!element) return;
        
        let scrollTimeout;
        
        element.addEventListener('scroll', () => {
            element.classList.add('scrolling');
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                element.classList.remove('scrolling');
            }, 500);
        });
    });
}

// 页面加载完成后设置滚动条可见性
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(setupScrollbarVisibility, 100);
});

