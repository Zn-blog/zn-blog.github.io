/**
 * 视频编辑器工具函数
 * 提供通用的工具函数和辅助方法
 */

class VideoEditorUtils {
    /**
     * 格式化时间为 HH:MM:SS 格式
     * @param {number} seconds - 秒数
     * @returns {string} 格式化的时间字符串
     */
    static formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '00:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return [hours, minutes, secs]
                .map(val => val.toString().padStart(2, '0'))
                .join(':');
        } else {
            return [minutes, secs]
                .map(val => val.toString().padStart(2, '0'))
                .join(':');
        }
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化的文件大小
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 生成文件名
     * @param {string} extension - 文件扩展名
     * @param {string} prefix - 文件名前缀
     * @returns {string} 生成的文件名
     */
    static generateFilename(extension = 'webm', prefix = 'video-edit') {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        return `${prefix}-${year}${month}${day}-${hours}${minutes}${seconds}.${extension}`;
    }

    /**
     * 下载Blob文件
     * @param {Blob} blob - 要下载的Blob对象
     * @param {string} filename - 文件名
     */
    static downloadBlob(blob, filename) {
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
     * 获取支持的MIME类型
     * @param {string} preferredFormat - 首选格式 ('webm', 'mp4', 'auto')
     * @returns {string} 支持的MIME类型
     */
    static getSupportedMimeType(preferredFormat = 'auto') {
        let types = [];
        
        if (preferredFormat === 'webm') {
            types = [
                'video/webm;codecs=vp9,opus',
                'video/webm;codecs=vp8,opus',
                'video/webm;codecs=h264,opus',
                'video/webm'
            ];
        } else if (preferredFormat === 'mp4') {
            types = [
                'video/mp4;codecs=h264,aac',
                'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
                'video/mp4'
            ];
        } else {
            // 自动选择，优先WebM
            types = [
                'video/webm;codecs=vp9,opus',
                'video/webm;codecs=vp8,opus',
                'video/mp4;codecs=h264,aac',
                'video/webm;codecs=h264,opus',
                'video/webm',
                'video/mp4'
            ];
        }
        
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        
        // 如果首选格式不支持，回退到自动选择
        if (preferredFormat !== 'auto') {
            return VideoEditorUtils.getSupportedMimeType('auto');
        }
        
        return 'video/webm'; // 最终回退
    }

    /**
     * 获取文件扩展名
     * @param {string} mimeType - MIME类型
     * @returns {string} 文件扩展名
     */
    static getFileExtension(mimeType) {
        if (mimeType.includes('mp4')) return 'mp4';
        if (mimeType.includes('webm')) return 'webm';
        return 'webm'; // 默认
    }

    /**
     * 检查浏览器支持
     * @returns {Object} 支持情况对象
     */
    static checkBrowserSupport() {
        const support = {
            canvas: false,
            webAudio: false,
            mediaRecorder: false,
            fileAPI: false,
            fullSupport: false
        };

        // 检查Canvas API
        try {
            const canvas = document.createElement('canvas');
            support.canvas = !!(canvas.getContext && canvas.getContext('2d'));
        } catch (e) {
            support.canvas = false;
        }

        // 检查Web Audio API
        support.webAudio = !!(window.AudioContext || window.webkitAudioContext);

        // 检查MediaRecorder API
        support.mediaRecorder = !!window.MediaRecorder;

        // 检查File API
        support.fileAPI = !!(window.File && window.FileReader && window.FileList && window.Blob);

        // 检查完整支持
        support.fullSupport = support.canvas && support.webAudio && 
                             support.mediaRecorder && support.fileAPI;

        return support;
    }

    /**
     * 显示错误消息
     * @param {string} message - 错误消息
     * @param {number} duration - 显示时长（毫秒）
     */
    static showError(message, duration = 5000) {
        const errorElement = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        if (errorElement && errorText) {
            errorText.textContent = message;
            errorElement.style.display = 'block';
            errorElement.classList.add('fade-in');
            
            // 自动隐藏
            setTimeout(() => {
                VideoEditorUtils.hideError();
            }, duration);
        }
    }

    /**
     * 隐藏错误消息
     */
    static hideError() {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.classList.add('fade-out');
            setTimeout(() => {
                errorElement.style.display = 'none';
                errorElement.classList.remove('fade-in', 'fade-out');
            }, 300);
        }
    }

    /**
     * 显示成功消息
     * @param {string} message - 成功消息
     * @param {number} duration - 显示时长（毫秒）
     */
    static showSuccess(message, duration = 3000) {
        // 创建成功提示元素
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.innerHTML = `
            <div class="success-content">
                <span class="success-icon">✅</span>
                <span class="success-text">${message}</span>
            </div>
        `;
        
        // 添加样式
        successElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 2000;
            max-width: 400px;
            background: linear-gradient(135deg, var(--success-color) 0%, #20c997 100%);
            color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-heavy);
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(successElement);
        
        // 自动移除
        setTimeout(() => {
            successElement.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (successElement.parentNode) {
                    successElement.parentNode.removeChild(successElement);
                }
            }, 300);
        }, duration);
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
     * 深拷贝对象
     * @param {Object} obj - 要拷贝的对象
     * @returns {Object} 拷贝后的对象
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => VideoEditorUtils.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = VideoEditorUtils.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    /**
     * 获取视频质量配置
     * @param {string} quality - 质量等级
     * @returns {Object} 质量配置对象
     */
    static getQualityConfig(quality) {
        const configs = {
            'ultra': {
                bitrate: 15000000,  // 15 Mbps
                description: '超高质量'
            },
            'high': {
                bitrate: 8000000,   // 8 Mbps
                description: '高质量'
            },
            'medium': {
                bitrate: 5000000,   // 5 Mbps
                description: '中等质量'
            },
            'low': {
                bitrate: 2000000,   // 2 Mbps
                description: '低质量'
            }
        };
        
        return configs[quality] || configs['high'];
    }

    /**
     * 计算文本位置
     * @param {string} position - 位置预设
     * @param {number} canvasWidth - 画布宽度
     * @param {number} canvasHeight - 画布高度
     * @returns {Object} 位置坐标
     */
    static calculateTextPosition(position, canvasWidth, canvasHeight) {
        const positions = {
            'center': {
                x: canvasWidth / 2,
                y: canvasHeight / 2,
                textAlign: 'center',
                textBaseline: 'middle'
            },
            'top': {
                x: canvasWidth / 2,
                y: canvasHeight * 0.15,
                textAlign: 'center',
                textBaseline: 'top'
            },
            'bottom': {
                x: canvasWidth / 2,
                y: canvasHeight * 0.85,
                textAlign: 'center',
                textBaseline: 'bottom'
            },
            'left': {
                x: canvasWidth * 0.1,
                y: canvasHeight / 2,
                textAlign: 'left',
                textBaseline: 'middle'
            },
            'right': {
                x: canvasWidth * 0.9,
                y: canvasHeight / 2,
                textAlign: 'right',
                textBaseline: 'middle'
            },
            'top-left': {
                x: canvasWidth * 0.1,
                y: canvasHeight * 0.15,
                textAlign: 'left',
                textBaseline: 'top'
            },
            'top-right': {
                x: canvasWidth * 0.9,
                y: canvasHeight * 0.15,
                textAlign: 'right',
                textBaseline: 'top'
            },
            'bottom-left': {
                x: canvasWidth * 0.1,
                y: canvasHeight * 0.85,
                textAlign: 'left',
                textBaseline: 'bottom'
            },
            'bottom-right': {
                x: canvasWidth * 0.9,
                y: canvasHeight * 0.85,
                textAlign: 'right',
                textBaseline: 'bottom'
            }
        };
        
        return positions[position] || positions['center'];
    }

    /**
     * 颜色转换工具
     * @param {string} color - 颜色值
     * @param {number} alpha - 透明度 (0-1)
     * @returns {string} RGBA颜色值
     */
    static colorToRgba(color, alpha = 1) {
        // 如果已经是rgba格式，直接返回
        if (color.startsWith('rgba')) return color;
        
        // 处理hex颜色
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        
        // 处理rgb颜色
        if (color.startsWith('rgb')) {
            const values = color.match(/\d+/g);
            if (values && values.length >= 3) {
                return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${alpha})`;
            }
        }
        
        return color;
    }

    /**
     * 日志记录
     * @param {string} level - 日志级别
     * @param {string} message - 日志消息
     * @param {any} data - 附加数据
     */
    static log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [VideoEditor] [${level.toUpperCase()}] ${message}`;
        
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

    /**
     * 检查是否为HTTPS环境
     * @returns {boolean} 是否为HTTPS
     */
    static isHTTPS() {
        return location.protocol === 'https:' || location.hostname === 'localhost';
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
            version: ''
        };

        // 获取版本号
        if (info.isChrome) {
            const match = ua.match(/Chrome\/(\d+)/);
            info.version = match ? match[1] : '';
        } else if (info.isFirefox) {
            const match = ua.match(/Firefox\/(\d+)/);
            info.version = match ? match[1] : '';
        } else if (info.isSafari) {
            const match = ua.match(/Version\/(\d+)/);
            info.version = match ? match[1] : '';
        } else if (info.isEdge) {
            const match = ua.match(/Edg\/(\d+)/);
            info.version = match ? match[1] : '';
        }

        return info;
    }

    /**
     * 创建加载指示器
     * @param {string} message - 加载消息
     * @returns {HTMLElement} 加载元素
     */
    static createLoader(message = '处理中...') {
        const loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <div class="loader-text">${message}</div>
            </div>
        `;
        
        // 添加样式
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            backdrop-filter: blur(5px);
        `;
        
        return loader;
    }

    /**
     * 移除加载指示器
     * @param {HTMLElement} loader - 加载元素
     */
    static removeLoader(loader) {
        if (loader && loader.parentNode) {
            loader.style.opacity = '0';
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 300);
        }
    }
}

// 导出工具类
window.VideoEditorUtils = VideoEditorUtils;