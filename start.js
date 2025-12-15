#!/usr/bin/env node

/**
 * 个人博客系统启动脚本
 * Personal Blog System Startup Script
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 启动个人博客系统...');
console.log('🚀 Starting Personal Blog System...\n');

// 检查Node.js版本
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 14) {
    console.error('❌ 需要 Node.js 14.0.0 或更高版本');
    console.error('❌ Node.js 14.0.0 or higher is required');
    console.error(`   当前版本 Current version: ${nodeVersion}`);
    process.exit(1);
}

// 检查依赖是否安装
const packageJsonPath = path.join(__dirname, 'package.json');
const nodeModulesPath = path.join(__dirname, 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 检测到未安装依赖，正在安装...');
    console.log('📦 Dependencies not found, installing...\n');
    
    const npm = spawn('npm', ['install'], {
        stdio: 'inherit',
        shell: true
    });
    
    npm.on('close', (code) => {
        if (code === 0) {
            console.log('\n✅ 依赖安装完成！');
            console.log('✅ Dependencies installed successfully!\n');
            startServer();
        } else {
            console.error('\n❌ 依赖安装失败');
            console.error('❌ Failed to install dependencies');
            process.exit(1);
        }
    });
} else {
    startServer();
}

function startServer() {
    console.log('🌟 启动统一服务器...');
    console.log('🌟 Starting unified server...\n');
    
    // 启动统一服务器
    const server = spawn('node', ['unified-server.js'], {
        stdio: 'inherit',
        shell: true
    });
    
    server.on('close', (code) => {
        console.log(`\n📊 服务器已停止，退出代码: ${code}`);
        console.log(`📊 Server stopped with exit code: ${code}`);
    });
    
    server.on('error', (err) => {
        console.error('❌ 启动服务器时出错:', err.message);
        console.error('❌ Error starting server:', err.message);
    });
    
    // 处理进程退出
    process.on('SIGINT', () => {
        console.log('\n\n👋 正在关闭服务器...');
        console.log('👋 Shutting down server...');
        server.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
        console.log('\n\n👋 正在关闭服务器...');
        console.log('👋 Shutting down server...');
        server.kill('SIGTERM');
    });
}