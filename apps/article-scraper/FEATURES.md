# 📄 文章抓取工具 - 功能说明

## 🎯 核心功能

### 1. 智能内容提取
- 自动识别文章标题（支持多种HTML结构）
- 智能提取正文内容（过滤广告、导航等无关内容）
- 保留文章原有结构（标题层级、段落、列表等）

### 2. 代码块处理
- 完整保留代码块格式
- 支持多种编程语言
- 保持代码缩进和语法高亮标记

### 3. 图片处理
- 自动提取所有图片
- 转换相对路径为绝对URL
- 保留图片alt属性

### 4. Markdown生成
- 生成标准Markdown格式
- 添加文章元数据（标题、来源、时间）
- 清理多余空行和格式

### 5. 多站点支持
- 支持常见博客平台
- 支持个人博客
- 支持文档网站
- 自适应不同HTML结构

## 🔍 技术细节

### 内容提取策略

#### 标题提取
按优先级尝试以下选择器：
1. `<h1>` 标签
2. `<article> <h1>` 
3. `.article-title` 类
4. `.post-title` 类
5. `#article-title` ID
6. `<meta property="og:title">` 元标签
7. `<title>` 标签

#### 正文提取
按优先级尝试以下选择器：
1. `<article>` 标签
2. `.article-content` 类
3. `.post-content` 类
4. `.entry-content` 类
5. `#article-content` ID
6. `#content` ID
7. `<main> <article>`
8. `[role="main"]` 属性
9. `.markdown-body` 类
10. 最大的 `<div>` 元素

### 内容清理

自动移除以下元素：
- `<script>` - JavaScript脚本
- `<style>` - CSS样式
- `<nav>` - 导航栏
- `<footer>` - 页脚
- `<header>` - 页头
- `<aside>` - 侧边栏
- `<iframe>` - 内嵌框架

### Markdown转换

使用 `html2text` 库进行转换：
- 保留链接
- 保留图片
- 保留强调格式
- 不自动换行（body_width=0）

## 📊 支持的内容类型

### 文本内容
- ✅ 标题（H1-H6）
- ✅ 段落
- ✅ 列表（有序/无序）
- ✅ 引用块
- ✅ 粗体/斜体
- ✅ 链接

### 代码内容
- ✅ 行内代码
- ✅ 代码块
- ✅ 语法高亮标记

### 媒体内容
- ✅ 图片（转为绝对URL）
- ⚠️ 视频（保留链接）
- ⚠️ 音频（保留链接）

### 表格
- ✅ 简单表格
- ⚠️ 复杂表格（可能格式不完美）

## 🌐 已测试网站

### 技术博客
- ✅ CSDN
- ✅ 博客园
- ✅ 掘金
- ✅ SegmentFault
- ✅ 开源中国

### 知识平台
- ✅ 知乎专栏
- ✅ 简书
- ✅ Medium

### 文档网站
- ✅ MDN
- ✅ GitBook
- ✅ VuePress
- ✅ Docusaurus

### 个人博客
- ✅ WordPress
- ✅ Hexo
- ✅ Hugo
- ✅ Jekyll

## ⚠️ 限制说明

### 无法处理的内容

1. **JavaScript渲染的内容**
   - 动态加载的文章
   - 需要登录的内容
   - 懒加载的图片

2. **特殊格式**
   - 复杂的交互式内容
   - Canvas绘图
   - SVG图形（部分）

3. **受保护的内容**
   - 需要付费的文章
   - 有反爬虫机制的网站
   - 需要验证码的页面

### 可能不完美的情况

1. **格式问题**
   - 复杂的表格布局
   - 特殊的CSS样式
   - 自定义的HTML结构

2. **图片问题**
   - 懒加载的图片可能丢失
   - Base64编码的图片
   - 需要登录才能访问的图片

## 🔧 自定义配置

### 修改选择器

编辑 `scraper.py` 中的选择器列表：

```python
# 标题选择器
selectors = [
    'h1',
    'article h1',
    '.article-title',
    # 添加你的选择器
]

# 正文选择器
selectors = [
    'article',
    '.article-content',
    '.post-content',
    # 添加你的选择器
]
```

### 修改User-Agent

```python
self.headers = {
    'User-Agent': '你的User-Agent'
}
```

### 修改超时时间

```python
response = requests.get(url, headers=self.headers, timeout=30)
```

### 自定义Markdown格式

```python
self.h2t.ignore_links = False  # 是否忽略链接
self.h2t.ignore_images = False # 是否忽略图片
self.h2t.body_width = 0        # 换行宽度
```

## 📈 性能说明

### 抓取速度
- 简单文章：1-3秒
- 复杂文章：3-10秒
- 大量图片：10-30秒

### 资源占用
- 内存：< 100MB
- CPU：低
- 网络：取决于文章大小

### 并发限制
- 建议单线程使用
- 避免频繁请求同一网站
- 遵守robots.txt规则

## 🚀 未来计划

### 计划功能
- [ ] 图片下载到本地
- [ ] 批量抓取多篇文章
- [ ] 自定义选择器配置
- [ ] 支持更多输出格式（PDF、HTML等）
- [ ] 浏览器扩展版本
- [ ] 云端服务版本

### 优化方向
- [ ] 提高抓取成功率
- [ ] 优化Markdown格式
- [ ] 支持更多网站
- [ ] 添加缓存机制
- [ ] 改进错误处理

## 📝 版本历史

### v1.0.0 (2024-12-08)
- ✨ 初始版本发布
- 📝 基础文章抓取功能
- 💻 代码块保留
- 🖼️ 图片URL转换
- 📋 Markdown生成
- 🌐 Web界面
- 🔧 API集成

---

**最后更新**: 2024-12-08
**维护状态**: 活跃开发中
