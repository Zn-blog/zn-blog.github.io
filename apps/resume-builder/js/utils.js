/**
 * 简历生成器工具函数
 */

class ResumeUtils {
    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 格式化日期
     * @param {Date|string} date - 日期
     * @returns {string} 格式化的日期字符串
     */
    static formatDate(date) {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }

    /**
     * 格式化显示日期
     * @param {Date|string} date - 日期
     * @returns {string} 显示用的日期字符串
     */
    static formatDisplayDate(date) {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        return d.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * 格式化时间段
     * @param {string} startDate - 开始日期
     * @param {string} endDate - 结束日期
     * @returns {string} 时间段字符串
     */
    static formatDateRange(startDate, endDate) {
        const start = startDate ? this.formatDisplayDate(startDate) : '';
        const end = endDate ? this.formatDisplayDate(endDate) : '至今';
        
        if (!start && !endDate) return '';
        if (!start) return end;
        if (!endDate) return `${start} - 至今`;
        
        return `${start} - ${end}`;
    }

    /**
     * 验证邮箱格式
     * @param {string} email - 邮箱地址
     * @returns {boolean} 是否有效
     */
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 验证手机号格式
     * @param {string} phone - 手机号
     * @returns {boolean} 是否有效
     */
    static validatePhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone.replace(/\s|-/g, ''));
    }

    /**
     * 清理HTML标签
     * @param {string} html - HTML字符串
     * @returns {string} 纯文本
     */
    static stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    /**
     * 转义HTML字符
     * @param {string} text - 文本
     * @returns {string} 转义后的文本
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 深拷贝对象
     * @param {Object} obj - 要拷贝的对象
     * @returns {Object} 拷贝后的对象
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间
     * @returns {Function} 防抖后的函数
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 限制时间
     * @returns {Function} 节流后的函数
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * 显示成功消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    static showSuccess(message, duration = 3000) {
        this.showMessage(message, 'success', duration);
    }

    /**
     * 显示错误消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    static showError(message, duration = 5000) {
        this.showMessage(message, 'error', duration);
    }

    /**
     * 显示信息消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    static showInfo(message, duration = 3000) {
        this.showMessage(message, 'info', duration);
    }

    /**
     * 显示消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型
     * @param {number} duration - 显示时长
     */
    static showMessage(message, type = 'info', duration = 3000) {
        // 移除已存在的消息
        const existingMessage = document.querySelector('.toast-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = `toast-message toast-${type}`;
        messageElement.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getMessageIcon(type)}</span>
                <span class="toast-text">${message}</span>
            </div>
        `;

        // 添加样式
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 3000;
            max-width: 400px;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            color: white;
            font-size: 14px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${this.getMessageStyle(type)}
        `;

        document.body.appendChild(messageElement);

        // 显示动画
        setTimeout(() => {
            messageElement.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            messageElement.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }, duration);
    }

    /**
     * 获取消息图标
     * @param {string} type - 消息类型
     * @returns {string} 图标
     */
    static getMessageIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * 获取消息样式
     * @param {string} type - 消息类型
     * @returns {string} CSS样式
     */
    static getMessageStyle(type) {
        const styles = {
            success: 'background: linear-gradient(135deg, #28a745 0%, #20c997 100%);',
            error: 'background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);',
            warning: 'background: linear-gradient(135deg, #ffc107 0%, #f39c12 100%); color: #000;',
            info: 'background: linear-gradient(135deg, #17a2b8 0%, #3498db 100%);'
        };
        return styles[type] || styles.info;
    }

    /**
     * 显示加载状态
     * @param {string} message - 加载消息
     */
    static showLoading(message = '正在处理...') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingText = loadingOverlay.querySelector('.loading-text');
        
        if (loadingText) {
            loadingText.textContent = message;
        }
        
        loadingOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    /**
     * 隐藏加载状态
     */
    static hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化的文件大小
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 下载文件
     * @param {Blob|string} content - 文件内容
     * @param {string} filename - 文件名
     * @param {string} mimeType - MIME类型
     */
    static downloadFile(content, filename, mimeType = 'application/octet-stream') {
        let blob;
        
        if (content instanceof Blob) {
            blob = content;
        } else {
            blob = new Blob([content], { type: mimeType });
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // 清理URL对象
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * 获取当前时间戳
     * @returns {number} 时间戳
     */
    static now() {
        return Date.now();
    }

    /**
     * 格式化相对时间
     * @param {Date|number} date - 日期或时间戳
     * @returns {string} 相对时间字符串
     */
    static formatRelativeTime(date) {
        const now = new Date();
        const target = new Date(date);
        const diffMs = now - target;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return '刚刚';
        if (diffMin < 60) return `${diffMin}分钟前`;
        if (diffHour < 24) return `${diffHour}小时前`;
        if (diffDay < 7) return `${diffDay}天前`;
        
        return this.formatDisplayDate(target);
    }

    /**
     * 检查是否为移动设备
     * @returns {boolean} 是否为移动设备
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * 检查是否支持触摸
     * @returns {boolean} 是否支持触摸
     */
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * 获取浏览器信息
     * @returns {Object} 浏览器信息
     */
    static getBrowserInfo() {
        const ua = navigator.userAgent;
        const info = {
            isChrome: /Chrome/.test(ua),
            isFirefox: /Firefox/.test(ua),
            isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
            isEdge: /Edg/.test(ua),
            isMobile: this.isMobile(),
            isTouch: this.isTouchDevice()
        };
        return info;
    }

    /**
     * 日志记录
     * @param {string} level - 日志级别
     * @param {string} message - 日志消息
     * @param {any} data - 附加数据
     */
    static log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [ResumeBuilder] [${level.toUpperCase()}] ${message}`;
        
        switch (level.toLowerCase()) {
            case 'error':
                console.error(logMessage, data);
                break;
            case 'warn':
                console.warn(logMessage, data);
                break;
            case 'info':
                console.info(logMessage, data);
                break;
            case 'debug':
                console.debug(logMessage, data);
                break;
            default:
                console.log(logMessage, data);
        }
    }
}

// 导出工具类
window.ResumeUtils = ResumeUtils;