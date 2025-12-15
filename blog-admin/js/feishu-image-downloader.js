/* ========================================
   飞书图片自动下载器
   自动检测并下载飞书图片，上传到本地服务器
   ======================================== */

class FeishuImageDownloader {
    constructor() {
        this.feishuDomains = [
            'feishu.cn',
            'larksuite.com',
            'bytedance.net',
            'lf-static.bytednsdoc.com',
            'lf1-ttcdn-tos.pstatp.com'
        ];
        this.downloadQueue = [];
        this.isProcessing = false;
    }

    // 检测URL是否是飞书图片
    isFeishuImage(url) {
        return this.feishuDomains.some(domain => url.includes(domain));
    }

    // 从Markdown内容中提取所有飞书图片URL
    extractFeishuImages(markdown) {
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const feishuImages = [];
        let match;

        while ((match = imageRegex.exec(markdown)) !== null) {
            const alt = match[1];
            const url = match[2];
            
            if (this.isFeishuImage(url)) {
                feishuImages.push({
                    alt: alt,
                    url: url,
                    originalMatch: match[0]
                });
            }
        }

        return feishuImages;
    }

    // 下载单个图片
    async downloadImage(url) {
        try {
            console.log('正在下载图片:', url);
            
            // 使用fetch下载图片
            const response = await fetch(url, {
                mode: 'cors',
                credentials: 'omit'
            });

            if (!response.ok) {
                throw new Error(`下载失败: ${response.status}`);
            }

            // 获取图片数据
            const blob = await response.blob();
            
            // 从URL或Content-Type推断文件扩展名
            let extension = 'jpg';
            const contentType = response.headers.get('content-type');
            if (contentType) {
                if (contentType.includes('png')) extension = 'png';
                else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpg';
                else if (contentType.includes('gif')) extension = 'gif';
                else if (contentType.includes('webp')) extension = 'webp';
            }

            // 生成文件名
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 8);
            const filename = `feishu_${timestamp}_${random}.${extension}`;

            // 创建File对象
            const file = new File([blob], filename, { type: blob.type });

            return { success: true, file, blob };
        } catch (error) {
            console.error('下载图片失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 上传图片到本地服务器（飞书文档专用）
    async uploadToLocal(file, articleId) {
        try {
            // 直接使用 fileUploader 的上传API
            if (!window.fileUploader) {
                throw new Error('文件上传器未初始化');
            }
            
            const result = await window.fileUploader.uploadFeishuImage(file, articleId);
            
            if (!result.success) {
                throw new Error(result.error || '上传失败');
            }
            
            return result;
        } catch (error) {
            console.error('上传图片失败:', error);
            throw error;
        }
    }

    // 处理单个图片：下载并上传
    async processImage(imageInfo, articleId) {
        try {
            // 1. 下载图片
            const downloadResult = await this.downloadImage(imageInfo.url);
            
            if (!downloadResult.success) {
                return {
                    success: false,
                    original: imageInfo,
                    error: downloadResult.error
                };
            }

            // 2. 上传到本地（传入文档ID）
            const uploadResult = await this.uploadToLocal(downloadResult.file, articleId);

            // 3. 返回新的URL
            return {
                success: true,
                original: imageInfo,
                newUrl: uploadResult.url,
                newMarkdown: `![${imageInfo.alt}](${uploadResult.url})`
            };
        } catch (error) {
            return {
                success: false,
                original: imageInfo,
                error: error.message
            };
        }
    }

    // 批量处理所有飞书图片
    async processAllImages(markdown, articleId, onProgress) {
        const feishuImages = this.extractFeishuImages(markdown);
        
        if (feishuImages.length === 0) {
            return {
                success: true,
                markdown: markdown,
                processed: 0,
                message: '没有检测到飞书图片'
            };
        }

        console.log(`检测到 ${feishuImages.length} 个飞书图片，开始处理...`);
        console.log(`文档ID: ${articleId}`);

        const results = [];
        let successCount = 0;
        let failCount = 0;

        // 逐个处理图片
        for (let i = 0; i < feishuImages.length; i++) {
            const imageInfo = feishuImages[i];
            
            // 调用进度回调
            if (onProgress) {
                onProgress({
                    current: i + 1,
                    total: feishuImages.length,
                    currentImage: imageInfo.url
                });
            }

            const result = await this.processImage(imageInfo, articleId);
            results.push(result);

            if (result.success) {
                successCount++;
                // 替换Markdown中的图片URL
                markdown = markdown.replace(
                    imageInfo.originalMatch,
                    result.newMarkdown
                );
            } else {
                failCount++;
            }

            // 添加小延迟，避免请求过快
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return {
            success: failCount === 0,
            markdown: markdown,
            processed: successCount,
            failed: failCount,
            total: feishuImages.length,
            results: results,
            message: `成功: ${successCount}, 失败: ${failCount}`
        };
    }

    // 显示处理进度对话框
    showProgressDialog() {
        console.log('🔄 开始创建进度对话框...');
        
        // 先清理可能存在的旧对话框
        const existingOverlay = document.getElementById('feishuImageOverlay');
        const existingDialog = document.getElementById('feishuImageProgress');
        if (existingOverlay) {
            console.log('⚠️ 发现旧的遮罩层，正在清理...');
            existingOverlay.remove();
        }
        if (existingDialog) {
            console.log('⚠️ 发现旧的对话框，正在清理...');
            existingDialog.remove();
        }
        
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.id = 'feishuImageOverlay';
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: rgba(0,0,0,0.5) !important;
            z-index: 999999 !important;
            display: block !important;
        `;
        
        // 创建对话框
        const dialog = document.createElement('div');
        dialog.id = 'feishuImageProgress';
        dialog.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            background: white !important;
            padding: 2rem !important;
            border-radius: 12px !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
            z-index: 1000000 !important;
            min-width: 400px !important;
            max-width: 90vw !important;
            display: block !important;
        `;
        
        dialog.innerHTML = `
            <h3 style="margin: 0 0 1rem 0 !important; color: #2c5f7c !important; font-size: 1.2rem !important;">🔄 正在处理飞书图片</h3>
            <div id="progressInfo" style="margin-bottom: 1rem !important; color: #666 !important; font-size: 0.9rem !important;">
                准备中...
            </div>
            <div style="background: #f0f0f0 !important; height: 12px !important; border-radius: 6px !important; overflow: hidden !important; margin: 1rem 0 !important;">
                <div id="progressBar" style="background: linear-gradient(90deg, #4fc3f7, #2196f3) !important; height: 100% !important; width: 0% !important; transition: width 0.3s ease !important; border-radius: 6px !important;"></div>
            </div>
            <div id="currentImage" style="margin-top: 1rem !important; font-size: 0.8rem !important; color: #999 !important; word-break: break-all !important; max-height: 80px !important; overflow: hidden !important; line-height: 1.4 !important;"></div>
            <div style="margin-top: 1rem !important; font-size: 0.75rem !important; color: #aaa !important; text-align: center !important;">
                正在自动下载并上传图片，请稍候...
            </div>
        `;

        // 添加到页面
        try {
            document.body.appendChild(overlay);
            document.body.appendChild(dialog);
            console.log('✅ 进度对话框已添加到页面');
            
            // 验证元素是否正确添加
            const addedOverlay = document.getElementById('feishuImageOverlay');
            const addedDialog = document.getElementById('feishuImageProgress');
            
            if (addedOverlay && addedDialog) {
                console.log('✅ 进度对话框元素验证成功');
                console.log(`遮罩层样式: ${addedOverlay.style.cssText.substring(0, 100)}...`);
                console.log(`对话框样式: ${addedDialog.style.cssText.substring(0, 100)}...`);
            } else {
                console.error('❌ 进度对话框元素验证失败');
            }
            
        } catch (error) {
            console.error('❌ 添加进度对话框到页面失败:', error);
        }

        // 返回控制对象
        const controller = {
            updateProgress: (current, total) => {
                try {
                    const percent = (current / total * 100).toFixed(0);
                    const progressBar = document.getElementById('progressBar');
                    const progressInfo = document.getElementById('progressInfo');
                    
                    if (progressBar) {
                        progressBar.style.width = percent + '%';
                        console.log(`📊 进度更新: ${percent}%`);
                    } else {
                        console.warn('⚠️ 进度条元素未找到');
                    }
                    
                    if (progressInfo) {
                        progressInfo.textContent = `正在处理: ${current} / ${total} (${percent}%)`;
                    } else {
                        console.warn('⚠️ 进度信息元素未找到');
                    }
                } catch (error) {
                    console.error('❌ 更新进度失败:', error);
                }
            },
            updateCurrentImage: (url) => {
                try {
                    const currentImageElement = document.getElementById('currentImage');
                    if (currentImageElement) {
                        // 截断过长的URL
                        const displayUrl = url.length > 80 ? url.substring(0, 80) + '...' : url;
                        currentImageElement.textContent = `当前: ${displayUrl}`;
                        console.log(`📷 当前图片: ${url.substring(0, 50)}...`);
                    } else {
                        console.warn('⚠️ 当前图片元素未找到');
                    }
                } catch (error) {
                    console.error('❌ 更新当前图片失败:', error);
                }
            },
            close: () => {
                try {
                    const overlayToRemove = document.getElementById('feishuImageOverlay');
                    const dialogToRemove = document.getElementById('feishuImageProgress');
                    
                    if (overlayToRemove) {
                        overlayToRemove.remove();
                        console.log('✅ 遮罩层已移除');
                    }
                    
                    if (dialogToRemove) {
                        dialogToRemove.remove();
                        console.log('✅ 对话框已移除');
                    }
                    
                    console.log('✅ 进度对话框已完全关闭');
                } catch (error) {
                    console.error('❌ 关闭进度对话框失败:', error);
                }
            }
        };
        
        console.log('✅ 进度对话框创建完成');
        return controller;
    }
}

// 创建全局实例
window.feishuImageDownloader = new FeishuImageDownloader();
