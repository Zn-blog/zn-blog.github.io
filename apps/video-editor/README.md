# 视频剪辑工具

一个基于Web技术的现代化视频编辑器，支持视频导入、背景音乐添加、文字叠加和高质量视频导出。

## ✨ 功能特性

### 🎬 核心功能
- **视频导入**：支持多种视频格式（MP4、WebM、AVI等）
- **背景音乐**：添加多轨道音频，支持音量调节和淡入淡出
- **文字叠加**：丰富的文字样式和位置选项
- **实时预览**：所见即所得的编辑体验
- **高质量导出**：支持多种格式和质量选项

### 🎨 界面特性
- **现代化UI**：响应式设计，支持桌面和移动设备
- **直观时间轴**：拖拽式编辑，可视化轨道管理
- **实时渲染**：流畅的预览和编辑体验
- **键盘快捷键**：提高编辑效率

### 🔧 技术特性
- **纯Web技术**：基于Canvas API、Web Audio API等现代Web标准
- **无需插件**：直接在浏览器中运行，无需安装额外软件
- **高性能**：优化的渲染引擎和内存管理
- **跨平台**：支持Windows、macOS、Linux等操作系统

## 🚀 快速开始

### 系统要求
- **浏览器**：Chrome 88+、Firefox 85+、Safari 14+、Edge 88+
- **内存**：建议4GB以上
- **网络**：建议HTTPS环境（本地开发可使用HTTP）

### 使用步骤

1. **导入视频**
   ```
   点击"导入视频"按钮或直接拖拽视频文件到预览区域
   支持格式：MP4、WebM、AVI、MOV等
   文件大小：建议不超过500MB
   ```

2. **添加背景音乐**
   ```
   点击"添加音乐"按钮选择音频文件
   支持格式：MP3、WAV、AAC、OGG等
   可调节音量、设置淡入淡出效果
   ```

3. **添加文字**
   ```
   点击"添加文字"按钮打开文字编辑器
   设置文字内容、样式、位置和时间
   支持多种预设样式和自定义选项
   ```

4. **预览和编辑**
   ```
   使用播放控件预览效果
   在时间轴上拖拽调整元素位置
   实时查看编辑结果
   ```

5. **导出视频**
   ```
   点击"导出视频"按钮
   选择格式、质量和帧率
   等待处理完成后自动下载
   ```

## 📖 详细使用指南

### 视频导入

支持的视频格式：
- **MP4**：最佳兼容性，推荐使用
- **WebM**：现代格式，文件较小
- **AVI**：传统格式，文件较大
- **MOV**：Apple格式，质量较高

导入限制：
- 文件大小：最大500MB
- 视频时长：最长60分钟
- 分辨率：支持720p到4K

### 音频处理

音频功能：
- **多轨道支持**：可添加多个音频文件
- **音量控制**：0-100%音量调节
- **淡入淡出**：平滑的音频过渡效果
- **时间同步**：精确的音视频同步

音频格式支持：
- MP3、WAV、AAC、OGG、M4A、FLAC

### 文字叠加

文字样式选项：
- **字体**：系统字体和Web字体
- **大小**：12px - 200px
- **颜色**：支持十六进制和RGB颜色
- **背景**：可设置背景色和透明度
- **位置**：预设位置或自定义坐标

预设样式：
- **标题**：大字体，适合主标题
- **副标题**：中等字体，适合副标题
- **说明文字**：小字体，适合注释
- **水印**：半透明，适合版权信息

### 时间轴操作

时间轴功能：
- **拖拽移动**：直接拖拽元素调整位置
- **调整大小**：拖拽边缘调整时长
- **多选操作**：Ctrl+点击选择多个元素
- **缩放控制**：Ctrl+滚轮缩放时间轴

快捷键：
- **空格**：播放/暂停
- **Delete**：删除选中元素
- **←/→**：微调元素位置
- **Home/End**：跳到开始/结束

### 导出设置

格式选择：
- **WebM**：现代格式，文件小，质量高
- **MP4**：兼容性最好，支持所有播放器

质量选项：
- **低质量**：2 Mbps，文件小，适合网络分享
- **中等质量**：5 Mbps，平衡质量和文件大小
- **高质量**：8 Mbps，高质量，推荐使用
- **超高质量**：15 Mbps，最佳质量，文件较大

帧率选择：
- **24 fps**：电影标准，文件较小
- **30 fps**：网络视频标准，推荐使用
- **60 fps**：高帧率，适合游戏录制

## 🛠️ 技术架构

### 核心技术栈
```javascript
// 主要API
- Canvas API：视频渲染和文字叠加
- Web Audio API：音频处理和混合
- MediaRecorder API：视频录制和导出
- File API：文件读取和处理

// 架构模式
- 模块化设计：独立的功能模块
- 事件驱动：组件间通信
- 响应式UI：适配不同屏幕尺寸
```

### 项目结构
```
apps/video-editor/
├── index.html              # 主页面
├── css/                    # 样式文件
│   ├── style.css          # 主样式
│   ├── timeline.css       # 时间轴样式
│   └── controls.css       # 控件样式
├── js/                     # JavaScript文件
│   ├── app.js             # 应用入口
│   ├── video-editor.js    # 视频编辑器核心
│   ├── media-manager.js   # 媒体管理
│   ├── timeline.js        # 时间轴管理
│   ├── audio-mixer.js     # 音频混合
│   ├── text-renderer.js   # 文字渲染
│   ├── export-manager.js  # 导出管理
│   ├── ui-controller.js   # UI控制
│   └── utils.js           # 工具函数
└── README.md              # 说明文档
```

### 核心类说明

#### VideoEditor（主控制器）
```javascript
class VideoEditor {
    // 统一管理所有编辑功能
    constructor(container)
    importVideo(file)          // 导入视频
    addBackgroundMusic(file)   // 添加背景音乐
    addText(text, time, style) // 添加文字
    exportVideo(options)       // 导出视频
}
```

#### MediaManager（媒体管理）
```javascript
class MediaManager {
    // 处理媒体文件加载和管理
    loadVideo(file)           // 加载视频文件
    loadAudio(file)           // 加载音频文件
    getVideoThumbnail()       // 获取视频缩略图
    createWaveformData()      // 创建音频波形
}
```

#### Timeline（时间轴）
```javascript
class Timeline {
    // 管理时间轴显示和交互
    setDuration(duration)     // 设置时长
    addVideoTrack(data)       // 添加视频轨道
    addAudioTrack(data)       // 添加音频轨道
    addTextTrack(data)        // 添加文字轨道
}
```

#### AudioMixer（音频混合）
```javascript
class AudioMixer {
    // 处理多轨道音频混合
    addTrack(trackData)       // 添加音频轨道
    setTrackVolume(id, vol)   // 设置轨道音量
    play(currentTime)         // 播放音频
    exportMixedAudio()        // 导出混合音频
}
```

#### TextRenderer（文字渲染）
```javascript
class TextRenderer {
    // 处理文字渲染和样式
    render(ctx, textTrack)    // 渲染文字
    getPresetStyle(name)      // 获取预设样式
    measureText(text, style)  // 测量文字尺寸
}
```

#### ExportManager（导出管理）
```javascript
class ExportManager {
    // 处理视频导出和编码
    export(project, options)  // 导出视频
    renderAllFrames()         // 渲染所有帧
    createAudioStream()       // 创建音频流
}
```

## 🎯 性能优化

### 内存管理
- **对象池**：重用频繁创建的对象
- **及时清理**：释放不用的媒体资源
- **分块处理**：大文件分块加载和处理

### 渲染优化
- **帧缓存**：缓存渲染结果避免重复计算
- **按需渲染**：只在需要时更新画面
- **异步处理**：使用Web Workers处理耗时操作

### 用户体验
- **进度显示**：实时显示处理进度
- **错误处理**：友好的错误提示和恢复
- **响应式设计**：适配不同设备和屏幕

## 🔧 开发指南

### 本地开发
```bash
# 1. 克隆项目
git clone <repository-url>

# 2. 启动本地服务器
# 使用Python
python -m http.server 8000

# 使用Node.js
npx http-server

# 3. 访问应用
http://localhost:8000/apps/video-editor/
```

### 调试模式
```javascript
// 在URL中添加debug参数启用调试模式
http://localhost:8000/apps/video-editor/?debug=true

// 或在控制台中启用
videoEditorApp.enableDebugMode();
```

### 扩展功能
```javascript
// 添加新的文字样式
const customStyle = {
    fontSize: 64,
    fontFamily: 'Impact',
    color: '#ff0000',
    strokeColor: '#ffffff',
    strokeWidth: 2
};

// 添加新的导出格式
const customFormat = {
    format: 'avi',
    mimeType: 'video/avi',
    bitrate: 10000000
};
```

## 📱 浏览器兼容性

| 功能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| 视频导入 | ✅ 88+ | ✅ 85+ | ✅ 14+ | ✅ 88+ |
| 音频处理 | ✅ 88+ | ✅ 85+ | ✅ 14+ | ✅ 88+ |
| 视频导出 | ✅ 88+ | ✅ 85+ | ⚠️ 限制 | ✅ 88+ |
| 文字渲染 | ✅ 88+ | ✅ 85+ | ✅ 14+ | ✅ 88+ |

注意事项：
- Safari对某些视频格式支持有限
- 移动浏览器性能可能受限
- 建议在桌面浏览器中使用

## 🐛 常见问题

### Q: 视频导入失败怎么办？
A: 检查以下几点：
- 文件格式是否支持
- 文件大小是否超过限制
- 浏览器是否支持该编码格式
- 尝试转换为MP4格式

### Q: 导出的视频没有声音？
A: 可能的原因：
- 原视频没有音轨
- 浏览器不支持音频编码
- 音频轨道被静音
- 检查音频混合器设置

### Q: 导出速度很慢？
A: 优化建议：
- 降低导出质量设置
- 减少文字轨道数量
- 使用较低的帧率
- 关闭其他浏览器标签页

### Q: 在移动设备上无法使用？
A: 移动设备限制：
- 性能和内存限制
- 某些API支持不完整
- 建议在桌面设备上使用

## 📄 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

### 贡献步骤
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

### 开发规范
- 遵循现有代码风格
- 添加适当的注释
- 编写测试用例
- 更新文档

## 📞 支持

如果您在使用过程中遇到问题，可以：
- 查看本文档的常见问题部分
- 在GitHub上提交Issue
- 联系开发团队

---

**享受视频编辑的乐趣！** 🎬✨