# 📦 安装指南 - 文章抓取工具

## Python依赖安装说明

### 🎯 依赖安装位置

Python的依赖包会安装到**系统全局位置**，而不是项目目录中。

#### Windows系统

**标准Python安装**：
```
C:\Users\你的用户名\AppData\Local\Programs\Python\Python3x\Lib\site-packages\
```

**Anaconda安装**：
```
C:\Users\你的用户名\Anaconda3\Lib\site-packages\
```

**Python.org安装**：
```
C:\Python3x\Lib\site-packages\
```

### 📋 为什么是全局安装？

与Node.js的 `node_modules` 不同，Python采用全局包管理：

**优点**：
- ✅ 所有项目共享同一套包，节省磁盘空间
- ✅ 不需要在每个项目中重复安装
- ✅ 包管理更简单

**注意**：
- ⚠️ 不同项目可能需要不同版本的包
- 💡 可以使用虚拟环境（venv）隔离项目依赖

## 🚀 安装方法

### 方法一：使用安装脚本（推荐）

双击运行：
```
apps\article-scraper\install.bat
```

脚本会自动：
1. 检查Python环境
2. 显示安装位置
3. 安装所有依赖
4. 验证安装结果

### 方法二：手动安装

打开命令行，进入项目目录：

```bash
cd apps\article-scraper
pip install -r requirements.txt
```

### 方法三：逐个安装

```bash
pip install requests
pip install beautifulsoup4
pip install html2text
pip install lxml
```

## 🔍 验证安装

### 检查是否安装成功

运行检查脚本：
```bash
apps\article-scraper\check-install.bat
```

或手动检查：

```bash
# 检查单个包
pip show requests

# 列出所有已安装的包
pip list

# 检查特定包
pip list | findstr "requests beautifulsoup4 html2text lxml"
```

### 测试导入

```bash
python -c "import requests; import bs4; import html2text; print('✅ 所有依赖已安装')"
```

## 📦 依赖包说明

### requests (HTTP请求库)
- **版本**: >= 2.28.0
- **用途**: 发送HTTP请求获取网页内容
- **大小**: ~500KB
- **安装位置**: `site-packages/requests/`

### beautifulsoup4 (HTML解析库)
- **版本**: >= 4.11.0
- **用途**: 解析HTML，提取文章内容
- **大小**: ~200KB
- **安装位置**: `site-packages/bs4/`

### html2text (HTML转Markdown)
- **版本**: >= 2020.1.16
- **用途**: 将HTML转换为Markdown格式
- **大小**: ~50KB
- **安装位置**: `site-packages/html2text/`

### lxml (XML/HTML解析器)
- **版本**: >= 4.9.0
- **用途**: 高性能的HTML/XML解析
- **大小**: ~5MB
- **安装位置**: `site-packages/lxml/`

## 🔧 高级选项

### 使用虚拟环境（可选）

如果你想隔离项目依赖：

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 使用完毕后退出
deactivate
```

**虚拟环境的依赖位置**：
```
项目目录\venv\Lib\site-packages\
```

### 指定安装位置（不推荐）

```bash
# 安装到用户目录
pip install --user -r requirements.txt

# 安装到指定目录
pip install --target=./libs -r requirements.txt
```

### 升级依赖

```bash
# 升级单个包
pip install --upgrade requests

# 升级所有包
pip install --upgrade -r requirements.txt
```

## ⚠️ 常见问题

### Q1: 提示"pip不是内部或外部命令"

**原因**: Python未添加到PATH环境变量

**解决方案**:
1. 重新安装Python，勾选"Add Python to PATH"
2. 或手动添加Python到PATH
3. 或使用完整路径：`C:\Python3x\Scripts\pip.exe`

### Q2: 安装失败，提示权限不足

**解决方案**:
```bash
# 方法1：以管理员身份运行命令行
# 方法2：安装到用户目录
pip install --user -r requirements.txt
```

### Q3: 安装速度很慢

**解决方案**: 使用国内镜像源

```bash
# 临时使用
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 永久配置
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

### Q4: 提示"No module named 'xxx'"

**原因**: 依赖未正确安装

**解决方案**:
```bash
# 重新安装
pip install --force-reinstall -r requirements.txt

# 或逐个安装
pip install requests beautifulsoup4 html2text lxml
```

### Q5: lxml安装失败

**原因**: lxml需要编译，可能缺少编译工具

**解决方案**:
```bash
# Windows: 下载预编译的wheel文件
# 访问: https://www.lfd.uci.edu/~gohlke/pythonlibs/#lxml
# 下载对应版本的.whl文件，然后：
pip install lxml-xxx.whl

# 或使用conda安装
conda install lxml
```

## 📊 磁盘空间

安装所有依赖大约需要：
- requests: ~500KB
- beautifulsoup4: ~200KB
- html2text: ~50KB
- lxml: ~5MB
- **总计**: ~6MB

## 🔄 卸载依赖

如果需要卸载：

```bash
# 卸载单个包
pip uninstall requests

# 卸载所有依赖
pip uninstall -r requirements.txt -y
```

## 📝 查看安装信息

```bash
# 查看包详细信息
pip show requests

# 查看包安装位置
python -c "import requests; print(requests.__file__)"

# 查看所有site-packages目录
python -c "import site; print(site.getsitepackages())"

# 查看pip版本
pip --version

# 查看Python版本和路径
python --version
python -c "import sys; print(sys.executable)"
```

## 🎯 总结

1. **依赖安装位置**: 系统全局 `site-packages` 目录
2. **安装方法**: 运行 `install.bat` 或 `pip install -r requirements.txt`
3. **验证安装**: 运行 `check-install.bat`
4. **不需要**: 在项目目录中创建任何文件夹
5. **共享使用**: 所有Python项目都可以使用这些包

---

**需要帮助？** 查看 `README.md` 或运行 `check-install.bat` 检查环境
