# 背景图片目录

此目录用于存放网站背景图片。

## 说明

- 所有用于网站背景的图片都应放在这里
- 图片路径格式：`uploads/images/background/文件名.jpg`
- 支持的格式：JPG, PNG, GIF, WebP
- 建议使用高质量的大图（1920x1080 或更高）

## 使用方法

### 方法1：手动添加
1. 将背景图片复制到此目录
2. 编辑 `blog-admin/background-config.js` 文件
3. 在数组中添加图片文件名

### 方法2：通过后台管理
1. 登录后台管理系统
2. 在系统设置中选择背景图片
3. 图片会自动应用到前后台

## 配置示例

在 `background-config.js` 中：

```javascript
const backgroundImages = [
    'bg1.jpg',
    'bg2.jpg',
    'bg3.jpg'
];
```

## 注意事项

- 图片文件名不要包含中文或特殊字符
- 建议使用有意义的文件名，如 `nature-1.jpg`
- 图片大小建议控制在 500KB - 2MB 之间
- 定期清理不再使用的背景图片
