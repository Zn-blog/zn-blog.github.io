# 第三方库文件

这个目录包含简历生成器所需的第三方JavaScript库。

## 需要的库文件

1. **xlsx.min.js** - Excel文件处理库
   - 下载地址: https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.min.js
   - 用途: 导出Excel格式简历

2. **jspdf.min.js** - PDF生成库
   - 下载地址: https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js
   - 用途: 导出PDF格式简历

3. **html2canvas.min.js** - HTML转图片库
   - 下载地址: https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js
   - 用途: 将HTML简历转换为图片用于PDF导出

## 安装说明

请下载上述文件并放置在此目录中，或者使用CDN链接。

如果使用CDN，请修改 `index.html` 中的引用路径：

```html
<!-- 使用CDN -->
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
```