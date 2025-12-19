/**
 * 错误恢复系统
 * 自动检测和修复常见的Vercel部署问题
 */

class ErrorRecoverySystem {
    constructor() {
        this.recoveryAttempts = 0;
        this.maxAttempts = 3;
        this.recoveryStrategies = [];
        this.errorLog = [];
        
        this.initErrorHandling();
        this.registerRecoveryStrategies();
    }

    // 初始化全局错误处理
    initErrorHandling() {
        // 捕获未处理的Promise错误
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('UnhandledPromiseRejection', event.reason);
        });

        // 捕获JavaScript错误
        window.addEventListener('error', (event) => {
            this.handleError('JavaScriptError', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // 重写console.error来捕获应用错误
        const originalError = console.error;
        console.error = (...args) => {
            this.logError('ConsoleError', args);
            originalError.apply(console, args);
        };
    }

    // 注册恢复策略
    registerRecoveryStrategies() {
        // 环境适配器恢复
        this.addRecoveryStrategy('EnvironmentAdapter', {
            detect: () => !window.environmentAdapter || !window.environmentAdapter.initialized,
            recover: async () => {
                console.log('🔄 尝试恢复环境适配器...');
                
                // 重新创建环境适配器
                if (window.AdminEnvironmentAdapter) {
                    window.environmentAdapter = new AdminEnvironmentAdapter();
                    await this.waitForInitialization();
                    return window.environmentAdapter?.initialized;
                }
                return false;
            }
        });

        // API连接恢复
        this.addRecoveryStrategy('APIConnection', {
            detect: async () => {
                try {
                    const response = await fetch('/api/health', { method: 'GET' });
                    return !response.ok;
                } catch {
                    return true;
                }
            },
            recover: async () => {
                console.log('🔄 尝试恢复API连接...');
                
                // 等待一段时间后重试
                await this.delay(2000);
                
                try {
                    const response = await fetch('/api/health', { method: 'GET' });
                    return response.ok;
                } catch {
                    return false;
                }
            }
        });

        // 数据适配器恢复
        this.addRecoveryStrategy('DataAdapter', {
            detect: () => !window.dataAdapter || window.dataAdapter.useEnvironmentAdapter === undefined,
            recover: async () => {
                console.log('🔄 尝试恢复数据适配器...');
                
                if (window.DataAdapter) {
                    window.dataAdapter = new DataAdapter();
                    return !!window.dataAdapter;
                }
                return false;
            }
        });

        // 认证状态恢复
        this.addRecoveryStrategy('Authentication', {
            detect: () => !window.AuthManager || typeof window.AuthManager.isLoggedIn !== 'function',
            recover: async () => {
                console.log('🔄 尝试恢复认证管理器...');
                
                // 重新加载认证脚本
                try {
                    const script = document.createElement('script');
                    script.src = '/blog-admin/js/auth.js';
                    document.head.appendChild(script);
                    
                    await this.delay(1000);
                    return !!window.AuthManager;
                } catch {
                    return false;
                }
            }
        });
    }

    // 添加恢复策略
    addRecoveryStrategy(name, strategy) {
        this.recoveryStrategies.push({ name, ...strategy });
    }

    // 处理错误
    async handleError(type, error) {
        this.logError(type, error);
        
        // 如果恢复次数超过限制，停止尝试
        if (this.recoveryAttempts >= this.maxAttempts) {
            console.error('❌ 错误恢复次数超过限制，停止自动恢复');
            this.showFatalErrorMessage();
            return;
        }

        // 尝试自动恢复
        await this.attemptRecovery();
    }

    // 记录错误
    logError(type, error) {
        const errorEntry = {
            type,
            error,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        this.errorLog.push(errorEntry);
        
        // 保存到localStorage
        try {
            const existingLog = JSON.parse(localStorage.getItem('error_log') || '[]');
            existingLog.push(errorEntry);
            
            // 只保留最近50条错误
            if (existingLog.length > 50) {
                existingLog.splice(0, existingLog.length - 50);
            }
            
            localStorage.setItem('error_log', JSON.stringify(existingLog));
        } catch (e) {
            console.warn('无法保存错误日志到localStorage:', e);
        }
    }

    // 尝试恢复
    async attemptRecovery() {
        this.recoveryAttempts++;
        console.log(`🔄 开始第${this.recoveryAttempts}次错误恢复尝试...`);

        let recoveredCount = 0;

        for (const strategy of this.recoveryStrategies) {
            try {
                const needsRecovery = await strategy.detect();
                
                if (needsRecovery) {
                    console.log(`🔧 检测到${strategy.name}需要恢复`);
                    const success = await strategy.recover();
                    
                    if (success) {
                        console.log(`✅ ${strategy.name}恢复成功`);
                        recoveredCount++;
                    } else {
                        console.warn(`⚠️ ${strategy.name}恢复失败`);
                    }
                }
            } catch (error) {
                console.error(`❌ ${strategy.name}恢复过程中出错:`, error);
            }
        }

        if (recoveredCount > 0) {
            console.log(`✅ 恢复完成，成功修复${recoveredCount}个问题`);
            this.showRecoveryMessage(recoveredCount);
            
            // 重置恢复计数
            setTimeout(() => {
                this.recoveryAttempts = 0;
            }, 30000);
        } else {
            console.warn('⚠️ 未检测到需要恢复的问题，或恢复失败');
        }
    }

    // 等待初始化完成
    waitForInitialization(timeout = 5000) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const check = () => {
                if (window.environmentAdapter?.initialized) {
                    resolve(true);
                } else if (Date.now() - startTime > timeout) {
                    resolve(false);
                } else {
                    setTimeout(check, 100);
                }
            };
            
            check();
        });
    }

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 显示恢复消息
    showRecoveryMessage(count) {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: rgba(76, 175, 80, 0.9); color: white;
            padding: 15px 20px; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            max-width: 300px;
        `;
        message.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">✅</span>
                <div>
                    <div style="font-weight: 500;">系统已自动恢复</div>
                    <div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">
                        修复了 ${count} 个问题
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    }

    // 显示致命错误消息
    showFatalErrorMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            z-index: 10001; background: rgba(244, 67, 54, 0.95); color: white;
            padding: 30px; border-radius: 12px; text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            max-width: 400px;
        `;
        message.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <h2 style="margin: 0 0 15px 0; font-size: 20px;">系统遇到问题</h2>
            <p style="margin: 0 0 20px 0; opacity: 0.9;">
                自动恢复失败，请刷新页面或联系管理员
            </p>
            <button onclick="window.location.reload()" style="
                background: white; color: #f44336; border: none;
                padding: 10px 20px; border-radius: 6px; cursor: pointer;
                font-weight: 500;
            ">刷新页面</button>
        `;
        
        document.body.appendChild(message);
    }

    // 获取错误统计
    getErrorStats() {
        const stats = {
            totalErrors: this.errorLog.length,
            recoveryAttempts: this.recoveryAttempts,
            errorsByType: {},
            recentErrors: this.errorLog.slice(-10)
        };

        this.errorLog.forEach(error => {
            stats.errorsByType[error.type] = (stats.errorsByType[error.type] || 0) + 1;
        });

        return stats;
    }

    // 手动触发恢复
    async manualRecovery() {
        console.log('🔧 手动触发系统恢复...');
        this.recoveryAttempts = 0; // 重置计数
        await this.attemptRecovery();
    }

    // 清除错误日志
    clearErrorLog() {
        this.errorLog = [];
        localStorage.removeItem('error_log');
        console.log('🗑️ 错误日志已清除');
    }
}

// 创建全局错误恢复系统
window.errorRecovery = new ErrorRecoverySystem();

// 添加全局恢复函数
window.recoverSystem = () => window.errorRecovery.manualRecovery();
window.getErrorStats = () => window.errorRecovery.getErrorStats();
window.clearErrors = () => window.errorRecovery.clearErrorLog();

console.log('🛡️ 错误恢复系统已启动');