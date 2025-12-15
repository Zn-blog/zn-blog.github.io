# 📄 文章抓取工具 - Article Scraper

将网页文章智能转换为 Markdown 格式的工具。

## ✨ 功能特性

- 📝 **智能提取** - 自动识别文章标题和正文内容
- 💻 **代码保留** - 完整保留代码块格式
- 🖼️ **图片处理** - 自动转换图片为绝对路径
- 📋 **标准格式** - 生成符合规范的 Markdown 文件
- 🎯 **多站点支持** - 支持大多数常见博客和文章网站

## 🚀 快速开始

### 方式一：Web界面（推荐）

1. 在应用中心打开此工具
2. 输入文章URL
3. 点击"开始抓取"
4. 下载生成的Markdown文件

### 方式二：命令行使用

#### 1. 安装依赖

```bash
pip install -r requirements.txt
```

#### 2. 运行脚本

```bash
python scraper.py https://example.com/article
```

#### 3. 查看生成的文件

脚本会在当前目录生成 `.md` 文件。

## 📦 依赖说明

- **requests** - HTTP请求库
- **beautifulsoup4** - HTML解析库
- **html2text** - HTML转Markdown
- **lxml** - XML/HTML解析器

## 🔧 API集成

需要在 `api-server.js` 或 `unified-server.js` 中添加以下路由：

```javascript
// 文章抓取API
app.post('/api/scrape-article', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.json({ success: false, message: '缺少URL参数' });
    }
    
    try {
        const { spawn } = require('child_process');
        const python = spawn('python', ['apps/article-scraper/scraper.py', url]);
        
        let result = '';
        let error = '';
        
        python.stdout.on('data', (data) => {
            result += data.toString();
        });
        
        python.stderr.on('data', (data) => {
            error += data.toString();
        });
        
        python.on('close', (code) => {
            if (code === 0) {
                try {
                    const data = JSON.parse(result);
                    res.json(data);
                } catch (e) {
                    res.json({ success: false, message: '解析结果失败' });
                }
            } else {
                res.json({ success: false, message: error || '抓取失败' });
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});
```

## 💡 使用示例

### 支持的网站类型

- ✅ 技术博客（CSDN、博客园、掘金等）
- ✅ 知识平台（知乎、简书等）
- ✅ 个人博客（WordPress、Hexo等）
- ✅ 文档网站（GitBook、VuePress等）

### 输出格式

```markdown
---
title: 文章标题
source: https://example.com/article
scraped_at: 2024-12-08 10:30:00
---

# 文章标题

文章正文内容...

## 小标题

段落内容...

\`\`\`javascript
代码块
\`\`\`

![图片](https://example.com/image.jpg)
```

## ⚠️ 注意事项

1. **版权声明** - 请遵守原文章的版权规定，仅用于个人学习
2. **网络访问** - 需要能够访问目标网站
3. **反爬虫** - 某些网站可能有反爬虫机制
4. **Python环境** - 需要安装Python 3.6+

## 🛠️ 故障排查

### 问题：抓取失败

- 检查URL是否正确
- 检查网络连接
- 检查Python依赖是否安装

### 问题：内容不完整

- 某些动态加载的内容可能无法抓取
- 可以尝试直接复制网页内容

### 问题：图片无法显示

- 图片已转换为绝对路径
- 需要网络访问才能查看

## 📝 更新日志

### v1.0.0 (2024-12-08)

- ✨ 初始版本发布
- 📝 支持文章内容提取
- 💻 支持代码块保留
- 🖼️ 支持图片URL转换
- 📋 生成标准Markdown格式

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交问题和改进建议！
