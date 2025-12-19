/**
 * 初始化序列管理器
 * 确保所有组件按正确顺序初始化
 */

class InitializationManager {
    constructor() {
        this.components = new Map();
        this.initOrder = [];
        this.initialized = new Set();
        this.failed = new Set();
        this.listeners = new Map();
        
        this.setupComponents();
    }

    // 设置组件依赖关系
    setupComponents() {
        // 环境适配器 - 最高优先级
        this.addComponent('environmentAdapter', {
            priority: 1,
            dependencies: [],
            check: () => window.environmentAdapter?.initialized,
            init: async () => {
                if (!window.environmentAdapter) {
                    if (window.AdminEnvironmentAdapter) {
                        window.environmentAdapter = new AdminEnvironmentAdapter();
                    } else {
                        throw new Error('AdminEnvironmentAdapter class not found');
                    }
                }
                
                // 等待初始化完成
                return await this.waitForCondition(
                    () => window.environmentAdapter?.initialized,
                    5000
                );
            }
        });

        // 错误恢复系统
        this.addComponent('errorRecovery', {
            priority: 2,
            dependencies: [],
            check: () => !!window.errorRecovery,
            init: async () => {
                // 错误恢复系统应该已经自动初始化
                return !!window.errorRecovery;
            }
        });

        // 认证管理器
        this.addComponent('authManager', {
            priority: 3,
            dependencies: ['environmentAdapter'],
            check: () => !!window.AuthManager && typeof window.AuthManager.isLoggedIn === 'function',
            init: async () => {
                // 认证管理器通过脚本加载，检查是否可用
                return await this.waitForCondition(
                    () => !!window.AuthManager,
                    3000
                );
            }
        });

        // 数据适配器
        this.addComponent('dataAdapter', {
            priority: 4,
            dependencies: ['environmentAdapter'],
            check: () => !!window.dataAdapter,
            init: async () => {
                if (!window.dataAdapter && window.DataAdapter) {
                    window.dataAdapter = new DataAdapter();
                }
                return !!window.dataAdapter;
            }
        });

        // 权限管理器
        this.addComponent('permissionManager', {
            priority: 5,
            dependencies: ['authManager'],
            check: () => !!window.permissionManager,
            init: async () => {
                return await this.waitForCondition(
                    () => !!window.permissionManager,
                    3000
                );
            }
        });

        // 用户管理器
        this.addComponent('userManager', {
            priority: 6,
            dependencies: ['dataAdapter', 'authManager'],
            check: () => !!window.userManager,
            init: async () => {
                return await this.waitForCondition(
                    () => !!window.userManager,
                    3000
                );
            }
        });

        // 应用管理器
        this.addComponent('appsManager', {
            priority: 7,
            dependencies: ['dataAdapter'],
            check: () => !!window.appsManager,
            init: async () => {
                return await this.waitForCondition(
                    () => !!window.appsManager,
                    3000
                );
            }
        });

        // 事件管理器
        this.addComponent('eventsManager', {
            priority: 8,
            dependencies: ['dataAdapter'],
            check: () => !!window.eventsManager,
            init: async () => {
                return await this.waitForCondition(
                    () => !!window.eventsManager,
                    3000
                );
            }
        });
    }

    // 添加组件
    addComponent(name, config) {
        this.components.set(name, {
            name,
            priority: config.priority || 999,
            dependencies: config.dependencies || [],
            check: config.check,
            init: config.init,
            timeout: config.timeout || 10000
        });
    }

    // 开始初始化
    async initialize() {
        console.log('🚀 开始组件初始化序列...');
        
        // 按优先级排序
        this.initOrder = Array.from(this.components.values())
            .sort((a, b) => a.priority - b.priority);

        const startTime = Date.now();
        let successCount = 0;
        let failCount = 0;

        for (const component of this.initOrder) {
            try {
                const success = await this.initializeComponent(component);
                if (success) {
                    successCount++;
                    this.initialized.add(component.name);
                } else {
                    failCount++;
                    this.failed.add(component.name);
                }
            } catch (error) {
                console.error(`❌ 组件 ${component.name} 初始化失败:`, error);
                failCount++;
                this.failed.add(component.name);
            }
        }

        const duration = Date.now() - startTime;
        
        console.log(`✅ 初始化完成: ${successCount}个成功, ${failCount}个失败 (${duration}ms)`);
        
        // 触发初始化完成事件
        this.notifyListeners('complete', {
            success: successCount,
            failed: failCount,
            duration,
            initialized: Array.from(this.initialized),
            failedComponents: Array.from(this.failed)
        });

        return { success: successCount, failed: failCount };
    }

    // 初始化单个组件
    async initializeComponent(component) {
        console.log(`🔧 初始化组件: ${component.name}`);

        // 检查依赖
        for (const dep of component.dependencies) {
            if (!this.initialized.has(dep)) {
                console.warn(`⚠️ 组件 ${component.name} 的依赖 ${dep} 未初始化`);
                return false;
            }
        }

        // 检查是否已经初始化
        if (component.check()) {
            console.log(`✅ 组件 ${component.name} 已经初始化`);
            return true;
        }

        // 执行初始化
        try {
            const success = await Promise.race([
                component.init(),
                this.timeout(component.timeout, `${component.name} 初始化超时`)
            ]);

            if (success) {
                console.log(`✅ 组件 ${component.name} 初始化成功`);
                this.notifyListeners('componentReady', { name: component.name });
                return true;
            } else {
                console.warn(`⚠️ 组件 ${component.name} 初始化失败`);
                return false;
            }
        } catch (error) {
            console.error(`❌ 组件 ${component.name} 初始化出错:`, error);
            return false;
        }
    }

    // 等待条件满足
    waitForCondition(condition, timeout = 5000) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const check = () => {
                if (condition()) {
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

    // 超时Promise
    timeout(ms, message) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error(message)), ms);
        });
    }

    // 添加事件监听器
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    // 通知监听器
    notifyListeners(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`事件监听器错误 (${event}):`, error);
            }
        });
    }

    // 获取初始化状态
    getStatus() {
        return {
            total: this.components.size,
            initialized: this.initialized.size,
            failed: this.failed.size,
            pending: this.components.size - this.initialized.size - this.failed.size,
            components: {
                initialized: Array.from(this.initialized),
                failed: Array.from(this.failed),
                pending: this.initOrder
                    .filter(c => !this.initialized.has(c.name) && !this.failed.has(c.name))
                    .map(c => c.name)
            }
        };
    }

    // 重新初始化失败的组件
    async retryFailed() {
        console.log('🔄 重新初始化失败的组件...');
        
        const failedComponents = Array.from(this.failed);
        this.failed.clear();
        
        let retryCount = 0;
        
        for (const componentName of failedComponents) {
            const component = this.components.get(componentName);
            if (component) {
                const success = await this.initializeComponent(component);
                if (success) {
                    this.initialized.add(componentName);
                    retryCount++;
                } else {
                    this.failed.add(componentName);
                }
            }
        }
        
        console.log(`✅ 重试完成，成功恢复 ${retryCount} 个组件`);
        return retryCount;
    }
}

// 创建全局初始化管理器
window.initManager = new InitializationManager();

// 页面加载完成后开始初始化
document.addEventListener('DOMContentLoaded', () => {
    // 稍微延迟，确保所有脚本都已加载
    setTimeout(() => {
        window.initManager.initialize();
    }, 500);
});

// 添加全局函数
window.getInitStatus = () => window.initManager.getStatus();
window.retryFailedInit = () => window.initManager.retryFailed();

console.log('🎯 初始化管理器已加载');