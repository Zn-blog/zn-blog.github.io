/* ========================================
   通用工具函数库
   ======================================== */

/**
 * 防抖函数
 * 在事件停止触发 n 毫秒后才执行回调
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * 在指定时间内最多执行一次回调
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 时间限制（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 图片懒加载
 * 使用 Intersection Observer API 实现高性能懒加载
 * @param {string} selector - 图片选择器（默认：img[data-src]）
 * @param {object} options - 配置选项
 */
function lazyLoadImages(selector = 'img[data-src]', options = {}) {
    const defaultOptions = {
        rootMargin: '50px', // 提前 50px 开始加载
        threshold: 0.01,
        ...options
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // 加载图片
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                
                // 加载 srcset
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
                
                // 添加加载完成类
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                    img.classList.remove('loading');
                });
                
                // 停止观察
                observer.unobserve(img);
            }
        });
    }, defaultOptions);

    // 观察所有匹配的图片
    document.querySelectorAll(selector).forEach(img => {
        img.classList.add('loading');
        imageObserver.observe(img);
    });

    return imageObserver;
}

/**
 * LocalStorage 管理器
 * 支持过期时间和数据压缩
 */
const StorageManager = {
    /**
     * 设置数据
     * @param {string} key - 键名
     * @param {any} value - 值
     * @param {number} ttl - 过期时间（毫秒），null 表示永不过期
     */
    set(key, value, ttl = null) {
        try {
            const item = {
                value: value,
                timestamp: Date.now(),
                ttl: ttl
            };
            localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (e) {
            console.error('LocalStorage 存储失败:', e);
            return false;
        }
    },

    /**
     * 获取数据
     * @param {string} key - 键名
     * @returns {any} 值，如果不存在或已过期返回 null
     */
    get(key) {
        try {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) return null;

            const item = JSON.parse(itemStr);
            
            // 检查是否过期
            if (item.ttl && Date.now() - item.timestamp > item.ttl) {
                localStorage.removeItem(key);
                return null;
            }

            return item.value;
        } catch (e) {
            console.error('LocalStorage 读取失败:', e);
            return null;
        }
    },

    /**
     * 删除数据
     * @param {string} key - 键名
     */
    remove(key) {
        localStorage.removeItem(key);
    },

    /**
     * 清空所有数据
     */
    clear() {
        localStorage.clear();
    },

    /**
     * 获取存储大小（字节）
     * @returns {number} 存储大小
     */
    getSize() {
        let size = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                size += localStorage[key].length + key.length;
            }
        }
        return size;
    },

    /**
     * 清理过期数据
     */
    cleanup() {
        const keys = Object.keys(localStorage);
        let cleaned = 0;
        
        keys.forEach(key => {
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (item.ttl && Date.now() - item.timestamp > item.ttl) {
                    localStorage.removeItem(key);
                    cleaned++;
                }
            } catch (e) {
                // 忽略解析错误
            }
        });

        console.log(`✅ 清理了 ${cleaned} 个过期项`);
        return cleaned;
    }
};

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式（默认：YYYY-MM-DD HH:mm:ss）
 * @returns {string} 格式化后的日期
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * 相对时间格式化
 * @param {Date|string|number} date - 日期
 * @returns {string} 相对时间（如：3分钟前）
 */
function timeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diff = now - past;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    if (months < 12) return `${months}个月前`;
    return `${years}年前`;
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 是否成功
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    } catch (e) {
        console.error('复制失败:', e);
        return false;
    }
}

/**
 * 显示通知消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型（success/error/warning/info）
 * @param {number} duration - 显示时长（毫秒）
 */
function showNotification(message, type = 'info', duration = 3000) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 样式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontSize: '0.9rem',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '400px',
        wordWrap: 'break-word'
    });

    // 根据类型设置背景色
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    notification.style.background = colors[type] || colors.info;

    // 添加到页面
    document.body.appendChild(notification);

    // 自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, duration);
}

/**
 * 添加动画样式（如果不存在）
 */
if (!document.getElementById('utils-animations')) {
    const style = document.createElement('style');
    style.id = 'utils-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        img.loading {
            filter: blur(5px);
            transition: filter 0.3s;
        }
        img.loaded {
            filter: blur(0);
        }
    `;
    document.head.appendChild(style);
}

/**
 * 滚动到元素
 * @param {string|Element} target - 目标元素或选择器
 * @param {object} options - 配置选项
 */
function scrollToElement(target, options = {}) {
    const element = typeof target === 'string' 
        ? document.querySelector(target) 
        : target;
    
    if (!element) return;

    const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
        ...options
    };

    element.scrollIntoView(defaultOptions);
}

/**
 * 检测设备类型
 * @returns {object} 设备信息
 */
function detectDevice() {
    const ua = navigator.userAgent;
    return {
        isMobile: /Mobile|Android|iPhone/i.test(ua),
        isTablet: /Tablet|iPad/i.test(ua),
        isDesktop: !/Mobile|Android|iPhone|Tablet|iPad/i.test(ua),
        isIOS: /iPhone|iPad|iPod/i.test(ua),
        isAndroid: /Android/i.test(ua),
        isChrome: /Chrome/i.test(ua),
        isFirefox: /Firefox/i.test(ua),
        isSafari: /Safari/i.test(ua) && !/Chrome/i.test(ua),
        isEdge: /Edg/i.test(ua)
    };
}

/**
 * 生成唯一 ID
 * @returns {string} 唯一 ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 深度克隆对象
 * @param {any} obj - 要克隆的对象
 * @returns {any} 克隆后的对象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    
    const clonedObj = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    return clonedObj;
}

// 导出到全局
window.Utils = {
    debounce,
    throttle,
    lazyLoadImages,
    StorageManager,
    formatFileSize,
    formatDate,
    timeAgo,
    copyToClipboard,
    showNotification,
    scrollToElement,
    detectDevice,
    generateId,
    deepClone
};

console.log('✅ 工具函数库已加载');
