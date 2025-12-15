/**
 * 屏幕录制工具 - 工具函数
 * 提供通用的工具函数和辅助方法
 */

class Utils {
    /**
     * 格式化时间为 HH:MM:SS 格式
     * @param {number} seconds - 秒数
     * @returns {string} 格式化的时间字符串
     */
    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return [hours, minutes, secs]
            .map(val => val.toString().padStart(2, '0'))
            .join(':');
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
     * 生成录制文件名
     * @param {string} extension - 文件扩展名
     * @returns {string} 生成的文件名
     */
    static generateFilename(extension = 'webm') {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        return `screen-recording-${year}${month}${day}-${hours}${minutes}${seconds}.${extension}`;
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
            return Utils.getSupportedMimeType('auto');
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
     * 获取格式信息
     * @param {string} format - 格式类型
     * @returns {Object} 格式信息对象
     */
    static getFormatInfo(format) {
        const formats = {
            'webm': {
                name: 'WebM',
                extension: 'webm',
                description: '现代格式，文件小，质量高',
                mimeTypes: [
                    'video/webm;codecs=vp9,opus',
                    'video/webm;codecs=vp8,opus',
                    'video/webm;codecs=h264,opus',
                    'video/webm'
                ]
            },
            'mp4': {
                name: 'MP4',
                extension: 'mp4',
                description: '兼容性最好，支持所有播放器',
                mimeTypes: [
                    'video/mp4;codecs=h264,aac',
                    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
                    'video/mp4'
                ]
            },
            'auto': {
                name: '自动选择',
                extension: 'auto',
                description: '根据浏览器支持自动选择最佳格式',
                mimeTypes: []
            }
        };
        
        return formats[format] || formats['auto'];
    }

    /**
     * 估算文件大小
     * @param {number} duration - 录制时长（秒）
     * @param {number} bitrate - 比特率
     * @returns {number} 估算的文件大小（字节）
     */
    static estimateFileSize(duration, bitrate = 8000000) {
        // 考虑视频压缩效率和音频开销
        const compressionRatio = 0.8; // 80%的压缩效率
        const audioOverhead = 128000; // 音频比特率开销
        
        const totalBitrate = bitrate + audioOverhead;
        return Math.floor((totalBitrate * duration * compressionRatio) / 8);
    }

    /**
     * 检查浏览器支持
     * @returns {Object} 支持情况对象
     */
    static checkBrowserSupport() {
        const support = {
            screenCapture: false,
            mediaRecorder: false,
            getUserMedia: false,
            fullSupport: false
        };

        // 检查屏幕捕获API
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            support.screenCapture = true;
        }

        // 检查MediaRecorder API
        if (window.MediaRecorder) {
            support.mediaRecorder = true;
        }

        // 检查getUserMedia API
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            support.getUserMedia = true;
        }

        // 检查完整支持
        support.fullSupport = support.screenCapture && support.mediaRecorder;

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
                Utils.hideError();
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
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = Utils.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    /**
     * 获取录制质量配置
     * @param {string} quality - 质量等级
     * @returns {Object} 质量配置对象
     */
    static getQualityConfig(quality) {
        const configs = {
            '4K': {
                width: { ideal: 3840, min: 3840 },
                height: { ideal: 2160, min: 2160 },
                frameRate: { ideal: 60, min: 30 },  // 支持高帧率
                bitrate: 30000000  // 提升到 30 Mbps for 4K
            },
            '1440p': {
                width: { ideal: 2560, min: 2560 },
                height: { ideal: 1440, min: 1440 },
                frameRate: { ideal: 60, min: 30 },
                bitrate: 15000000  // 提升到 15 Mbps for 1440p
            },
            '1080p': {
                width: { ideal: 1920, min: 1920 },
                height: { ideal: 1080, min: 1080 },
                frameRate: { ideal: 60, min: 30 },
                bitrate: 10000000   // 提升到 10 Mbps
            },
            '720p': {
                width: { ideal: 1280, min: 1280 },
                height: { ideal: 720, min: 720 },
                frameRate: { ideal: 60, min: 30 },
                bitrate: 6000000   // 提升到 6 Mbps
            },
            '480p': {
                width: { ideal: 854, min: 854 },
                height: { ideal: 480, min: 480 },
                frameRate: { ideal: 30, min: 15 },
                bitrate: 3000000   // 提升到 3 Mbps
            }
        };
        
        return configs[quality] || configs['1080p'];  // 默认改为1080p
    }

    /**
     * 日志记录
     * @param {string} level - 日志级别
     * @param {string} message - 日志消息
     * @param {any} data - 附加数据
     */
    static log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
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
     * 获取用户代理信息
     * @returns {Object} 浏览器信息
     */
    static getBrowserInfo() {
        const ua = navigator.userAgent;
        const info = {
            isChrome: /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor),
            isFirefox: /Firefox/.test(ua),
            isSafari: /Safari/.test(ua) && /Apple Computer/.test(navigator.vendor),
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
}

// 导出工具类
window.Utils = Utils;