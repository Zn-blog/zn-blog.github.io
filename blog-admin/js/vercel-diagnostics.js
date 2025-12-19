/**
 * Vercel环境诊断工具
 * 用于检测和报告Vercel部署中的问题
 */

class VercelDiagnostics {
    constructor() {
        this.diagnostics = [];
        this.startTime = Date.now();
    }

    // 运行完整诊断
    async runDiagnostics() {
        console.log('🔍 开始Vercel环境诊断...');
        
        this.checkEnvironment();
        this.checkGlobalObjects();
        await this.checkAPIEndpoints();
        await this.checkKVConnection();
        this.checkConsoleErrors();
        
        this.generateReport();
    }

    // 检查环境变量和基本环境
    checkEnvironment() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const origin = window.location.origin;
        
        this.addDiagnostic('环境信息', {
            hostname,
            protocol,
            origin,
            userAgent: navigator.userAgent,
            isVercelDomain: hostname.includes('vercel.app') || hostname.includes('web3v.vip') || hostname.includes('slxhdjy.top')
        });
    }

    // 检查全局对象
    checkGlobalObjects() {
        const checks = {
            environmentAdapter: {
                exists: !!window.environmentAdapter,
                initialized: window.environmentAdapter?.initialized,
                environment: window.environmentAdapter?.environment,
                apiBase: window.environmentAdapter?.apiBase,
                supportsWrite: window.environmentAdapter?.supportsWrite
            },
            dataAdapter: {
                exists: !!window.dataAdapter,
                useEnvironmentAdapter: window.dataAdapter?.useEnvironmentAdapter,
                useJSON: window.dataAdapter?.useJSON
            },
            authManager: {
                exists: !!window.AuthManager,
                isLoggedIn: window.AuthManager?.isLoggedIn?.()
            }
        };

        this.addDiagnostic('全局对象状态', checks);
    }

    // 检查API端点
    async checkAPIEndpoints() {
        const endpoints = [
            '/api/health',
            '/api/users',
            '/api/articles',
            '/api/settings'
        ];

        const results = {};
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });
                
                results[endpoint] = {
                    status: response.status,
                    ok: response.ok,
                    headers: Object.fromEntries(response.headers.entries())
                };

                if (response.ok) {
                    try {
                        const data = await response.json();
                        results[endpoint].hasData = true;
                        results[endpoint].dataType = typeof data;
                    } catch (e) {
                        results[endpoint].jsonError = e.message;
                    }
                } else {
                    results[endpoint].errorText = await response.text();
                }
            } catch (error) {
                results[endpoint] = {
                    error: error.message,
                    networkError: true
                };
            }
        }

        this.addDiagnostic('API端点检查', results);
    }

    // 检查KV连接
    async checkKVConnection() {
        try {
            const response = await fetch('/api/health');
            const result = await response.json();
            
            this.addDiagnostic('KV连接检查', {
                healthCheck: result,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            this.addDiagnostic('KV连接检查', {
                error: error.message,
                failed: true
            });
        }
    }

    // 检查控制台错误
    checkConsoleErrors() {
        // 重写console.error来捕获错误
        const originalError = console.error;
        const errors = [];
        
        console.error = function(...args) {
            errors.push({
                timestamp: new Date().toISOString(),
                args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
            });
            originalError.apply(console, args);
        };

        // 5秒后恢复原始console.error并报告
        setTimeout(() => {
            console.error = originalError;
            this.addDiagnostic('控制台错误', { errors, count: errors.length });
        }, 5000);
    }

    // 添加诊断结果
    addDiagnostic(category, data) {
        this.diagnostics.push({
            category,
            data,
            timestamp: Date.now() - this.startTime
        });
    }

    // 生成诊断报告
    generateReport() {
        const report = {
            summary: {
                totalChecks: this.diagnostics.length,
                duration: Date.now() - this.startTime,
                timestamp: new Date().toISOString()
            },
            diagnostics: this.diagnostics
        };

        console.group('🔍 Vercel诊断报告');
        console.log('📊 总览:', report.summary);
        
        this.diagnostics.forEach(diagnostic => {
            console.group(`📋 ${diagnostic.category} (+${diagnostic.timestamp}ms)`);
            console.log(diagnostic.data);
            console.groupEnd();
        });
        
        console.groupEnd();

        // 存储到localStorage供后续分析
        localStorage.setItem('vercel_diagnostics', JSON.stringify(report));
        
        return report;
    }

    // 测试特定功能
    async testFeature(featureName) {
        console.log(`🧪 测试功能: ${featureName}`);
        
        switch (featureName) {
            case 'login':
                return await this.testLogin();
            case 'dataLoad':
                return await this.testDataLoad();
            case 'apiCall':
                return await this.testAPICall();
            default:
                console.warn('未知的测试功能:', featureName);
                return false;
        }
    }

    // 测试登录功能
    async testLogin() {
        try {
            if (!window.environmentAdapter) {
                throw new Error('环境适配器未初始化');
            }

            const testCredentials = {
                action: 'validate_login',
                username: 'test',
                password: 'test'
            };

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testCredentials)
            });

            const result = await response.json();
            console.log('登录测试结果:', result);
            return result;
        } catch (error) {
            console.error('登录测试失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 测试数据加载
    async testDataLoad() {
        try {
            if (!window.environmentAdapter) {
                throw new Error('环境适配器未初始化');
            }

            const articles = await window.environmentAdapter.getData('articles');
            console.log('数据加载测试 - 文章数量:', articles?.length || 0);
            return { success: true, count: articles?.length || 0 };
        } catch (error) {
            console.error('数据加载测试失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 测试API调用
    async testAPICall() {
        try {
            const response = await fetch('/api/health');
            const result = await response.json();
            console.log('API调用测试结果:', result);
            return result;
        } catch (error) {
            console.error('API调用测试失败:', error);
            return { success: false, error: error.message };
        }
    }
}

// 创建全局诊断实例
window.vercelDiagnostics = new VercelDiagnostics();

// 页面加载完成后自动运行诊断
document.addEventListener('DOMContentLoaded', () => {
    // 延迟运行，确保所有组件都已初始化
    setTimeout(() => {
        window.vercelDiagnostics.runDiagnostics();
    }, 2000);
});

console.log('🔧 Vercel诊断工具已加载');