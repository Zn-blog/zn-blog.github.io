# 📁 数据文件夹

这个文件夹存储博客的所有数据，使用JSON格式。

---

## 📋 文件说明

| 文件名 | 说明 | 数据类型 |
|--------|------|----------|
| `articles.json` | 文章数据 | Array |
| `categories.json` | 分类数据 | Array |
| `tags.json` | 标签数据 | Array |
| `comments.json` | 评论数据 | Array |
| `guestbook.json` | 留言数据 | Array |
| `users.json` | 用户数据 | Array |
| `settings.json` | 系统设置 | Object |
| `images.json` | 图片数据 | Array |
| `music.json` | 音乐数据 | Array |
| `videos.json` | 视频数据 | Array |
| `links.json` | 友链数据 | Array |
| `events.json` | 事项数据 | Array |

---

## 🔄 数据格式示例

### articles.json
```json
[
  {
    "id": "1234567890",
    "title": "文章标题",
    "content": "文章内容（Markdown格式）",
    "category": "分类名称",
    "tags": ["标签1", "标签2"],
    "status": "published",
    "publishDate": "2023-11-23T10:00:00.000Z",
    "createdAt": "2023-11-23T10:00:00.000Z",
    "updatedAt": "2023-11-23T10:00:00.000Z"
  }
]
```

### categories.json
```json
[
  {
    "id": "1234567890",
    "name": "分类名称",
    "description": "分类描述",
    "color": "#4fc3f7",
    "createdAt": "2023-11-23T10:00:00.000Z"
  }
]
```

### tags.json
```json
[
  {
    "id": "1234567890",
    "name": "标签名称",
    "color": "#ff9800",
    "createdAt": "2023-11-23T10:00:00.000Z"
  }
]
```

### settings.json
```json
{
  "siteName": "我的博客",
  "siteDescription": "博客描述",
  "theme": "light",
  "codeTheme": "github",
  "backgroundImage": "url",
  "backgroundOpacity": 0.9
}
```

---

## 💾 备份建议

### 方法1：手动备份
```bash
# 复制整个data文件夹
xcopy data data-backup-20231123 /E /I
```

### 方法2：Git版本控制
```bash
# 提交数据变更
git add data/
git commit -m "更新数据"
git push
```

### 方法3：定时备份脚本
创建一个批处理文件 `backup-data.bat`:
```batch
@echo off
set BACKUP_DIR=data-backup-%date:~0,4%%date:~5,2%%date:~8,2%
xcopy data %BACKUP_DIR% /E /I
echo 备份完成: %BACKUP_DIR%
```

---

## 🔧 数据恢复

### 从备份恢复
```bash
# 删除当前数据
rmdir /s /q data

# 恢复备份
xcopy data-backup-20231123 data /E /I
```

### 从Git恢复
```bash
# 恢复到上一个版本
git checkout HEAD~1 -- data/

# 恢复到特定提交
git checkout <commit-hash> -- data/
```

---

## ⚠️ 注意事项

1. **不要手动编辑JSON文件**（除非你知道自己在做什么）
   - 使用后台管理界面进行数据操作
   - 手动编辑可能导致格式错误

2. **定期备份**
   - 建议每天备份一次
   - 重要操作前先备份

3. **Git版本控制**
   - 如果使用Git，确保 `.gitignore` 配置正确
   - 敏感数据不要提交到公开仓库

4. **文件权限**
   - 确保API服务器有读写权限
   - Windows系统通常不需要特殊配置

5. **数据迁移**
   - 从localStorage迁移时使用提供的工具
   - 不要直接复制粘贴数据

---

## 📊 数据统计

查看数据统计：
```bash
# 打开测试页面
http://localhost:8080/test-api-migration.html
```

或使用API：
```bash
# 获取文章数量
curl http://localhost:3001/api/articles | jq 'length'
```

---

## 🔍 数据验证

确保数据完整性：

1. **检查文件是否存在**
   ```bash
   dir data\*.json
   ```

2. **验证JSON格式**
   - 使用在线工具：https://jsonlint.com/
   - 或使用Node.js：
   ```javascript
   const fs = require('fs');
   const data = JSON.parse(fs.readFileSync('data/articles.json', 'utf8'));
   console.log('数据有效！');
   ```

3. **对比数据**
   - 使用测试工具对比localStorage和JSON数据
   - 确保数据迁移完整

---

## 📞 需要帮助？

- 查看完整迁移指南：`数据迁移完整指南.md`
- 使用自动迁移工具：`auto-export-data.html`
- 查看API文档：`api-server.js`

---

**最后更新：** 2023-11-23
