# 🚀 快速开始 - 文章抓取工具

## 📋 3步开始使用

### 第1步：安装依赖

双击运行 `install.bat` 或在命令行执行：

```bash
pip install -r requirements.txt
```

### 第2步：启动服务器

确保统一服务器正在运行：

```bash
node unified-server.js
```

或使用快捷脚本：`start-unified-server.bat`

### 第3步：打开工具

1. 在浏览器中打开应用中心
2. 找到"文章抓取工具"
3. 输入文章URL，点击"开始抓取"

## 💡 使用示例

### 示例1：抓取技术博客

```
URL: https://www.cnblogs.com/example/p/12345678.html
```

### 示例2：抓取知乎文章

```
URL: https://zhuanlan.zhihu.com/p/123456789
```

### 示例3：抓取掘金文章

```
URL: https://juejin.cn/post/7123456789012345678
```

## 🎯 支持的网站

- ✅ CSDN
- ✅ 博客园
- ✅ 掘金
- ✅ 知乎专栏
- ✅ 简书
- ✅ SegmentFault
- ✅ 开源中国
- ✅ 个人博客（WordPress、Hexo等）
- ✅ 大多数标准HTML文章页面

## 📝 输出格式

生成的Markdown文件包含：

```markdown
---
title: 文章标题
source: 原文链接
scraped_at: 抓取时间
---

# 文章标题

文章内容...
```

## ⚠️ 常见问题

### Q: 提示"Python环境未找到"

**A:** 需要安装Python 3.6+
- 下载地址：https://www.python.org/downloads/
- 安装时勾选"Add Python to PATH"

### Q: 提示"依赖未安装"

**A:** 运行安装脚本：
```bash
pip install -r requirements.txt
```

### Q: 抓取失败或内容不完整

**A:** 可能原因：
1. 网站有反爬虫机制
2. 需要登录才能查看
3. 动态加载的内容（JavaScript渲染）
4. 网络连接问题

**解决方案：**
- 尝试在浏览器中打开文章，确认可以正常访问
- 对于动态内容，可以手动复制粘贴
- 检查网络连接

### Q: 图片无法显示

**A:** 图片已转换为绝对URL，需要网络访问才能查看。如需离线查看，可以：
1. 手动下载图片
2. 使用图床工具上传
3. 使用本地图片路径替换

## 🔧 高级用法

### 命令行使用

```bash
# 抓取单篇文章
python scraper.py https://example.com/article

# 批量抓取（需要自己编写脚本）
for url in urls.txt; do
    python scraper.py $url
done
```

### 自定义配置

编辑 `scraper.py` 可以自定义：
- User-Agent
- 超时时间
- 选择器规则
- Markdown格式

## 📞 获取帮助

如果遇到问题：
1. 查看 `README.md` 详细文档
2. 检查 `unified-server.js` 日志
3. 运行 `test.bat` 测试环境

## 🎉 开始使用

现在你可以：
1. 打开应用中心
2. 找到"文章抓取工具"
3. 输入任意文章URL
4. 点击"开始抓取"
5. 下载生成的Markdown文件

祝你使用愉快！📄✨
