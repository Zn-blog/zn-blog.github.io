// 仪表盘调试脚本
console.log('🔍 开始仪表盘调试...');

// 检查关键对象是否存在
console.log('🔍 检查关键对象:');
console.log('- window.environmentAdapter:', !!window.environmentAdapter);
console.log('- window.dataAdapter:', !!window.dataAdapter);
console.log('- window.blogDataStore:', !!window.blogDataStore);

if (window.environmentAdapter) {
    console.log('🌍 环境适配器信息:', {
        environment: window.environmentAdapter.environment,
        apiBase: window.environmentAdapter.apiBase,
        initialized: window.environmentAdapter.initialized
    });
}

if (window.blogDataStore) {
    console.log('📊 数据存储信息:', {
        adapter: window.blogDataStore.adapter?.constructor?.name,
        useJSON: window.blogDataStore.adapter?.useJSON,
        useEnvironmentAdapter: window.blogDataStore.adapter?.useEnvironmentAdapter
    });
}

// 测试数据获取
async function testDataFetch() {
    console.log('🧪 测试数据获取...');
    
    try {
        // 测试获取文章
        console.log('📝 测试获取文章...');
        const articles = await window.blogDataStore.getArticles();
        console.log('✅ 文章获取成功:', articles?.length || 0, '篇');
        
        // 测试获取评论
        console.log('💬 测试获取评论...');
        const comments = await window.blogDataStore.getComments();
        console.log('✅ 评论获取成功:', comments?.length || 0, '条');
        
        // 测试获取统计
        console.log('📊 测试获取统计...');
        const stats = await window.blogDataStore.getStats();
        console.log('✅ 统计获取成功:', stats);
        
        // 测试仪表盘渲染
        console.log('🎨 测试仪表盘渲染...');
        if (typeof updateDashboardUI === 'function') {
            updateDashboardUI(stats, articles, comments);
            console.log('✅ 仪表盘UI更新成功');
        } else {
            console.error('❌ updateDashboardUI 函数不存在');
        }
        
    } catch (error) {
        console.error('❌ 数据获取测试失败:', error);
        
        // 详细错误分析
        if (error.message.includes('KV')) {
            console.error('💡 这是KV数据库配置问题');
        } else if (error.message.includes('fetch')) {
            console.error('💡 这是网络请求问题');
        } else if (error.message.includes('undefined')) {
            console.error('💡 这是对象未定义问题');
        }
    }
}

// 页面加载完成后执行测试
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testDataFetch, 1000);
    });
} else {
    setTimeout(testDataFetch, 1000);
}