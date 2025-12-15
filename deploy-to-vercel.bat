@echo off
chcp 65001 >nul
echo ========================================
echo   博客自动部署到 Vercel
echo ========================================
echo.

REM 检查是否安装了 Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Git，请先安装 Git
    echo 下载地址: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/6] 检查 Git 状态...
git status >nul 2>nul
if %errorlevel% neq 0 (
    echo [提示] 初始化 Git 仓库...
    git init
    echo Git 仓库初始化完成
)

echo.
echo [2/6] 添加文件到 Git...
git add .
if %errorlevel% neq 0 (
    echo [错误] 添加文件失败
    pause
    exit /b 1
)
echo 文件添加成功

echo.
echo [3/6] 提交更改...
set /p commit_msg="请输入提交信息 (直接回车使用默认): "
if "%commit_msg%"=="" set commit_msg=Update blog content

git commit -m "%commit_msg%"
if %errorlevel% neq 0 (
    echo [提示] 没有新的更改需要提交，或提交失败
)

echo.
echo [4/6] 检查远程仓库...
git remote -v | findstr "origin" >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [提示] 未检测到远程仓库，需要配置 GitHub 仓库
    echo.
    echo 请按照以下步骤操作：
    echo 1. 访问 https://github.com/new 创建新仓库
    echo 2. 仓库名称建议: my-blog
    echo 3. 选择 Public（公开）
    echo 4. 不要勾选 "Initialize this repository with a README"
    echo 5. 点击 "Create repository"
    echo.
    set /p github_url="请输入 GitHub 仓库地址 (例如: https://github.com/username/my-blog.git): "
    
    if "%github_url%"=="" (
        echo [错误] 未输入仓库地址
        pause
        exit /b 1
    )
    
    git remote add origin %github_url%
    echo 远程仓库配置成功
) else (
    echo 远程仓库已配置
)

echo.
echo [5/6] 推送到 GitHub...
git branch -M main
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo [提示] 推送失败，可能需要配置 Git 凭据
    echo.
    echo 如果是首次推送，请按照以下步骤：
    echo 1. 访问 https://github.com/settings/tokens
    echo 2. 点击 "Generate new token" - "Generate new token (classic)"
    echo 3. 勾选 "repo" 权限
    echo 4. 生成 token 并复制
    echo 5. 推送时使用 token 作为密码
    echo.
    pause
    
    echo 重试推送...
    git push -u origin main
    if %errorlevel% neq 0 (
        echo [错误] 推送失败，请检查网络连接和 Git 凭据
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   推送成功！
echo ========================================
echo.
echo [6/6] 接下来请访问 Vercel 完成部署：
echo.
echo 步骤 1: 访问 https://vercel.com
echo 步骤 2: 使用 GitHub 账号登录
echo 步骤 3: 点击 "Add New..." - "Project"
echo 步骤 4: 导入你的 GitHub 仓库
echo 步骤 5: 配置项目（使用默认设置即可）
echo 步骤 6: 点击 "Deploy" 开始部署
echo.
echo 部署完成后，你将获得一个访问链接：
echo https://你的项目名.vercel.app/
echo.
echo ========================================
echo   提示：后续更新只需运行此脚本即可
echo ========================================
echo.
pause
