# 🔧 故障排查 - 文章抓取工具

## ❌ 错误：Could not open requirements file

### 错误信息
```
ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'requirements.txt'
```

### 原因
脚本在错误的目录运行，找不到 `requirements.txt` 文件。

### 解决方案

#### 方法1：直接双击运行（推荐）
直接双击 `install.bat` 文件，脚本会自动切换到正确的目录。

#### 方法2：手动切换目录
```bash
cd apps\article-scraper
install.bat
```

#### 方法3：使用完整路径
```bash
cd apps\article-scraper
pip install -r requirements.txt
```

#### 方法4：直接安装包
```bash
pip install requests beautifulsoup4 html2text lxml
```

---

## ❌ 错误：pip不是内部或外部命令

### 错误信息
```
'pip' 不是内部或外部命令，也不是可运行的程序或批处理文件。
```

### 原因
Python未添加到系统PATH环境变量。

### 解决方案

#### 方法1：重新安装Python
1. 下载Python：https://www.python.org/downloads/
2. 安装时**勾选** "Add Python to PATH"
3. 完成安装后重启命令行

#### 方法2：使用完整路径
```bash
C:\Python3x\Scripts\pip.exe install -r requirements.txt
```

#### 方法3：使用python -m pip
```bash
python -m pip install -r requirements.txt
```

---

## ❌ 错误：Python未找到

### 错误信息
```
'python' 不是内部或外部命令
```

### 原因
Python未安装或未添加到PATH。

### 解决方案

1. **检查是否已安装**
   - 打开"开始"菜单，搜索"Python"
   - 或查看 `C:\Python3x\` 或 `C:\Users\你的用户名\AppData\Local\Programs\Python\`

2. **安装Python**
   - 下载：https://www.python.org/downloads/
   - 安装时勾选 "Add Python to PATH"

3. **手动添加到PATH**
   - 右键"此电脑" → 属性 → 高级系统设置
   - 环境变量 → 系统变量 → Path → 编辑
   - 添加Python安装目录和Scripts目录

---

## ❌ 错误：权限不足

### 错误信息
```
ERROR: Could not install packages due to an EnvironmentError: [WinError 5] 拒绝访问
```

### 原因
没有管理员权限安装到系统目录。

### 解决方案

#### 方法1：以管理员身份运行
1. 右键 `install.bat`
2. 选择"以管理员身份运行"

#### 方法2：安装到用户目录
```bash
pip install --user -r requirements.txt
```

#### 方法3：使用虚拟环境
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

## ❌ 错误：网络连接失败

### 错误信息
```
WARNING: Retrying ... after connection broken
ERROR: Could not find a version that satisfies the requirement
```

### 原因
网络连接问题或PyPI服务器访问慢。

### 解决方案

#### 方法1：使用国内镜像源
```bash
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

#### 方法2：永久配置镜像源
```bash
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

#### 方法3：逐个安装
```bash
pip install requests
pip install beautifulsoup4
pip install html2text
pip install lxml
```

---

## ❌ 错误：lxml安装失败

### 错误信息
```
error: Microsoft Visual C++ 14.0 is required
```

### 原因
lxml需要编译，缺少C++编译工具。

### 解决方案

#### 方法1：下载预编译版本
1. 访问：https://www.lfd.uci.edu/~gohlke/pythonlibs/#lxml
2. 下载对应Python版本的 `.whl` 文件
3. 安装：`pip install lxml-xxx.whl`

#### 方法2：使用Anaconda
```bash
conda install lxml
```

#### 方法3：跳过lxml（不推荐）
修改 `requirements.txt`，删除 `lxml` 行，但可能影响性能。

---

## ❌ 错误：pip版本过旧

### 错误信息
```
WARNING: You are using pip version X.X.X; however, version Y.Y.Y is available.
```

### 解决方案

```bash
python -m pip install --upgrade pip
```

---

## ❌ 错误：模块未找到

### 错误信息
```
ModuleNotFoundError: No module named 'requests'
```

### 原因
依赖未正确安装或Python环境不匹配。

### 解决方案

#### 方法1：重新安装
```bash
pip install --force-reinstall -r requirements.txt
```

#### 方法2：检查Python版本
```bash
python --version
pip --version
```
确保pip和python使用同一个Python环境。

#### 方法3：指定Python版本
```bash
python3 -m pip install -r requirements.txt
```

---

## 🔍 诊断命令

### 检查Python环境
```bash
python --version
python -c "import sys; print(sys.executable)"
```

### 检查pip
```bash
pip --version
pip list
```

### 检查依赖
```bash
pip show requests
pip show beautifulsoup4
pip show html2text
pip show lxml
```

### 查看安装位置
```bash
python -c "import site; print(site.getsitepackages())"
```

### 测试导入
```bash
python -c "import requests, bs4, html2text; print('✅ 所有依赖已安装')"
```

---

## 📞 获取帮助

如果以上方法都无法解决问题：

1. **运行检查脚本**
   ```bash
   apps\article-scraper\check-install.bat
   ```

2. **查看详细错误**
   ```bash
   pip install -r requirements.txt --verbose
   ```

3. **检查系统信息**
   - Windows版本
   - Python版本
   - pip版本
   - 错误完整信息

4. **查看文档**
   - `INSTALL.md` - 安装指南
   - `README.md` - 完整文档
   - `QUICK-START.md` - 快速开始

---

## ✅ 验证安装成功

运行以下命令验证：

```bash
# 方法1：运行检查脚本
apps\article-scraper\check-install.bat

# 方法2：测试导入
python -c "import requests, bs4, html2text, lxml; print('✅ 安装成功')"

# 方法3：查看已安装的包
pip list | findstr "requests beautifulsoup4 html2text lxml"
```

如果看到所有包都已列出，说明安装成功！
