# 媒体库文件夹说明

## 文件夹结构

```
uploads/
├── images/          # 原始图片存储
├── thumbnails/      # 缩略图存储
└── README.md        # 本说明文件
```

## 使用说明

### 图片上传
- 支持的格式：JPG, PNG, GIF, WebP
- 最大文件大小：5MB（可配置）
- 自动生成缩略图

### 文件命名规则
- 格式：`timestamp_randomstring.ext`
- 示例：`1700123456789_abc123.jpg`

### 存储位置
- **原始图片**：`uploads/images/`
- **缩略图**：`uploads/thumbnails/`（300x300px）

## 当前实现

由于这是前端演示版本，图片实际上存储在：
1. **localStorage** - 图片信息（URL、名称、大小等）
2. **Base64** - 小图片可以转换为 Base64 存储
3. **外部链接** - 推荐使用图床或 CDN

## 生产环境建议

### 1. 使用云存储
- **阿里云 OSS**
- **腾讯云 COS**
- **七牛云**
- **AWS S3**

### 2. 图片处理
- 自动压缩
- 格式转换（WebP）
- 响应式图片
- 懒加载

### 3. CDN 加速
- 使用 CDN 分发图片
- 提高加载速度
- 减少服务器压力

## 示例代码

### 上传图片到云存储
```javascript
// 使用阿里云 OSS
const OSS = require('ali-oss');
const client = new OSS({
    region: 'oss-cn-hangzhou',
    accessKeyId: 'your-access-key',
    accessKeySecret: 'your-secret-key',
    bucket: 'your-bucket'
});

async function uploadImage(file) {
    const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.type.split('/')[1]}`;
    const result = await client.put(`images/${filename}`, file);
    return result.url;
}
```

### 生成缩略图
```javascript
// 使用 Canvas 生成缩略图
function generateThumbnail(file, maxWidth = 300, maxHeight = 300) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(resolve, 'image/jpeg', 0.8);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
```

## 注意事项

⚠️ **重要提示**：
- 当前版本为演示版本，不包含真实的文件上传功能
- 图片数据存储在浏览器 localStorage 中
- 清除浏览器缓存会丢失所有图片数据
- 生产环境请使用后端 API 和云存储服务

## 未来改进

- [ ] 实现真实的文件上传
- [ ] 集成云存储服务
- [ ] 添加图片编辑功能
- [ ] 支持批量上传
- [ ] 添加图片搜索功能
- [ ] 实现图片分类管理
