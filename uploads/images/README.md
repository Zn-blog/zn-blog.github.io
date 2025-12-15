# 后台背景图片文件夹

## 使用说明

这个文件夹用于存放后台管理系统的背景图片。

### 添加背景图片

1. **将图片文件放到这个文件夹**
   ```
   blog-admin/uploads/images/
   ├── bg1.jpg
   ├── bg2.jpg
   ├── bg3.jpg
   └── ...
   ```

2. **编辑配置文件**
   
   打开 `blog-admin/background-config.js`，添加你的图片文件名：
   
   ```javascript
   const ADMIN_BACKGROUND_IMAGES = [
       'bg1.jpg',
       'bg2.jpg',
       'bg3.jpg',
       'your-new-image.jpg',  // 添加新图片
   ];
   ```

3. **刷新后台页面**
   
   系统会自动从列表中随机选择一张图片作为背景

### 图片要求

- **格式**: JPG, PNG, GIF, WebP
- **大小**: 建议 < 1MB（压缩后）
- **尺寸**: 建议 1920x1080 或更高
- **比例**: 16:9 或 16:10 横向图片效果最佳

### 图片命名建议

- 使用英文和数字
- 避免使用空格和特殊字符
- 示例: `bg1.jpg`, `background-01.png`, `admin-bg-001.webp`

### 示例图片

你可以从以下网站获取免费的背景图片：

- [Unsplash](https://unsplash.com/) - 高质量免费图片
- [Pexels](https://www.pexels.com/) - 免费图片和视频
- [Pixabay](https://pixabay.com/) - 免费图片库

### 快速测试

1. 下载几张图片到这个文件夹
2. 重命名为 bg1.jpg, bg2.jpg, bg3.jpg 等
3. 刷新后台管理页面
4. 在系统设置中使用切换按钮浏览图片

### 故障排除

**问题：看不到背景图片**
- 检查图片文件是否在正确的文件夹中
- 检查 `background-config.js` 中的文件名是否正确
- 打开浏览器控制台查看是否有错误信息
- 确认图片文件名大小写是否匹配

**问题：图片显示不完整**
- 使用更大尺寸的图片
- 确保图片比例适合屏幕

**问题：背景太亮/太暗**
- 在 `admin-background.js` 中调整遮罩透明度
- 修改 `rgba(255, 255, 255, 0.85)` 中的最后一个数字

### 文件夹结构

```
blog-admin/
├── uploads/
│   └── images/           ← 背景图片存放在这里
│       ├── bg1.jpg
│       ├── bg2.jpg
│       └── README.md     ← 当前文件
├── background-config.js  ← 图片列表配置
└── js/
    └── admin-background.js  ← 背景管理脚本
```
