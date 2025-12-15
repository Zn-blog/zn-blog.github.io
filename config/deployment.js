// 部署配置
const DEPLOYMENT_CONFIG = {
    // 部署环境：'local' | 'vercel' | 'github-pages'
    ENVIRONMENT: typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') ? 'vercel' : 
                 typeof window !== 'undefined' && window.location.hostname.includes('github.io') ? 'github-pages' : 'local',
    
    // API基础URL
    get API_BASE_URL() {
        switch (this.ENVIRONMENT) {
            case 'local':
                return 'http://localhost:3001/api';
            case 'vercel':
                return '/api'; // Vercel Serverless Functions
            case 'github-pages':
                return null; // 纯静态，不使用API
            default:
                return null;
        }
    },
    
    // 是否启用服务器功能
    get ENABLE_SERVER_FEATURES() {
        return this.ENVIRONMENT === 'local' || this.ENVIRONMENT === 'vercel';
    },
    
    // 数据存储模式
    get DATA_MODE() {
        switch (this.ENVIRONMENT) {
            case 'local':
                return 'api'; // 通过API读写
            case 'vercel':
                return 'api'; // 通过Serverless Functions
            case 'github-pages':
                return 'static'; // 只读JSON文件
            default:
                return 'static';
        }
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DEPLOYMENT_CONFIG;
} else {
    window.DEPLOYMENT_CONFIG = DEPLOYMENT_CONFIG;
}