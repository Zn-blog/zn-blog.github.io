// 页面背景管理

// 设置主内容区域背景
function setMainBackground() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    // 判断当前页面路径，确定背景图片路径
    const currentPath = window.location.pathname;
    let backgroundImage;
    
    if (currentPath.includes('/pages/')) {
        // 在 pages 目录下的页面
        backgroundImage = '../images/main-bg.jpg';
    } else {
        // 在根目录的页面（首页）
        backgroundImage = 'images/main-bg.jpg';
    }
    
    // 检查图片是否存在
    const img = new Image();
    img.onload = function() {
        mainContent.style.backgroundImage = `url('${backgroundImage}')`;
        console.log('✅ 主背景图片加载成功');
    };
    
    img.onerror = function() {
        console.log('⚠️ 主背景图片加载失败，使用渐变背景');
        // 图片加载失败时，使用渐变背景（通过 CSS 的 ::before 伪元素）
        mainContent.style.backgroundImage = 'none';
    };
    
    img.src = backgroundImage;
}

// 页面加载完成后设置背景
document.addEventListener('DOMContentLoaded', function() {
    setMainBackground();
});
