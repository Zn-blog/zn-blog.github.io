/* ========================================
   后台背景图片配置文件
   ======================================== */

// 配置说明：
// 1. 将你的背景图片放到 uploads/images/background/ 文件夹中
// 2. 在下面的数组中添加图片文件名
// 3. 支持 jpg, jpeg, png, gif, webp 等格式

const ADMIN_BACKGROUND_IMAGES = [
    // 示例图片（请替换为你自己的图片）
    'bg-1.jpg',
    'bg-2.jpg',
    'bg-3.jpg',
    'bg-4.jpg',
    'bg-5.jpg',
    'bg-6.jpg',
    'bg-7.jpg',
    'bg-8.jpg',
    'bg-9.jpg',
    'bg-10.jpg',
    'bg-11.jpg',
    'bg-12.jpg',
    'bg-13.jpg',
    'bg-14.jpg',
    'bg-15.jpg',
    
    // 添加更多图片...
    // 'your-image-1.jpg',
    // 'your-image-2.png',
    // 'your-image-3.webp',
];

// 自动应用配置
if (typeof window !== 'undefined' && window.adminBackgroundManager) {
    window.adminBackgroundManager.updateImageList(ADMIN_BACKGROUND_IMAGES);
}

// 如果管理器还未初始化，保存到 localStorage
if (typeof localStorage !== 'undefined') {
    localStorage.setItem('admin_background_images', JSON.stringify(ADMIN_BACKGROUND_IMAGES));
}
