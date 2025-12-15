/**
 * 文字渲染器
 * 处理文字叠加和样式渲染
 */

class TextRenderer {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.presetStyles = this.createPresetStyles();
    }

    /**
     * 渲染文字到画布
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {Object} textTrack - 文字轨道对象
     */
    render(ctx, textTrack) {
        const { text, style } = textTrack;
        
        if (!text || !style) return;

        // 保存当前画布状态
        ctx.save();
        
        try {
            // 设置字体样式
            const fontSize = style.fontSize || 48;
            const fontFamily = style.fontFamily || 'Arial, sans-serif';
            const fontWeight = style.fontWeight || 'normal';
            
            ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
            ctx.textAlign = style.textAlign || 'center';
            ctx.textBaseline = style.textBaseline || 'middle';
            
            // 处理多行文本
            const lines = this.wrapText(ctx, text, style.maxWidth || ctx.canvas.width * 0.8);
            const lineHeight = fontSize * (style.lineHeight || 1.2);
            
            // 计算文本总高度
            const totalHeight = lines.length * lineHeight;
            
            // 计算起始Y坐标
            let startY = style.y || ctx.canvas.height / 2;
            if (style.textBaseline === 'middle') {
                startY -= (totalHeight - lineHeight) / 2;
            } else if (style.textBaseline === 'bottom') {
                startY -= totalHeight - lineHeight;
            }
            
            // 渲染每一行
            lines.forEach((line, index) => {
                const y = startY + (index * lineHeight);
                this.renderTextLine(ctx, line, style.x || ctx.canvas.width / 2, y, style);
            });
            
        } catch (error) {
            VideoEditorUtils.log('error', 'Text rendering failed', error);
        } finally {
            // 恢复画布状态
            ctx.restore();
        }
    }

    /**
     * 渲染单行文字
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {string} text - 文字内容
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Object} style - 样式对象
     */
    renderTextLine(ctx, text, x, y, style) {
        // 测量文字尺寸
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = style.fontSize || 48;
        
        // 绘制背景
        if (style.backgroundColor && style.backgroundColor !== 'transparent') {
            this.renderTextBackground(ctx, x, y, textWidth, textHeight, style);
        }
        
        // 绘制文字阴影
        if (style.shadowColor && style.shadowBlur) {
            ctx.save();
            ctx.shadowColor = style.shadowColor;
            ctx.shadowBlur = style.shadowBlur || 4;
            ctx.shadowOffsetX = style.shadowOffsetX || 2;
            ctx.shadowOffsetY = style.shadowOffsetY || 2;
            ctx.fillStyle = style.color || '#ffffff';
            ctx.fillText(text, x, y);
            ctx.restore();
        }
        
        // 绘制文字描边
        if (style.strokeColor && style.strokeWidth) {
            ctx.strokeStyle = style.strokeColor;
            ctx.lineWidth = style.strokeWidth;
            ctx.lineJoin = 'round';
            ctx.strokeText(text, x, y);
        }
        
        // 绘制文字填充
        ctx.fillStyle = style.color || '#ffffff';
        ctx.fillText(text, x, y);
        
        // 绘制文字装饰
        if (style.textDecoration) {
            this.renderTextDecoration(ctx, text, x, y, textWidth, style);
        }
    }

    /**
     * 渲染文字背景
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} textWidth - 文字宽度
     * @param {number} textHeight - 文字高度
     * @param {Object} style - 样式对象
     */
    renderTextBackground(ctx, x, y, textWidth, textHeight, style) {
        const padding = style.padding || 10;
        const borderRadius = style.borderRadius || 0;
        
        // 计算背景位置和尺寸
        let bgX = x;
        let bgY = y;
        let bgWidth = textWidth + (padding * 2);
        let bgHeight = textHeight + (padding * 2);
        
        // 根据对齐方式调整位置
        if (style.textAlign === 'center') {
            bgX -= bgWidth / 2;
        } else if (style.textAlign === 'right') {
            bgX -= bgWidth;
        }
        
        if (style.textBaseline === 'middle') {
            bgY -= bgHeight / 2;
        } else if (style.textBaseline === 'bottom') {
            bgY -= bgHeight;
        } else if (style.textBaseline === 'top') {
            // 不需要调整
        } else {
            // 默认为alphabetic基线
            bgY -= bgHeight * 0.8;
        }
        
        // 设置背景颜色
        ctx.fillStyle = style.backgroundColor;
        
        // 绘制背景
        if (borderRadius > 0) {
            this.drawRoundedRect(ctx, bgX, bgY, bgWidth, bgHeight, borderRadius);
        } else {
            ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
        }
        
        // 绘制边框
        if (style.borderColor && style.borderWidth) {
            ctx.strokeStyle = style.borderColor;
            ctx.lineWidth = style.borderWidth;
            
            if (borderRadius > 0) {
                ctx.stroke();
            } else {
                ctx.strokeRect(bgX, bgY, bgWidth, bgHeight);
            }
        }
    }

    /**
     * 绘制圆角矩形
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} radius - 圆角半径
     */
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 渲染文字装饰（下划线、删除线等）
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {string} text - 文字内容
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} textWidth - 文字宽度
     * @param {Object} style - 样式对象
     */
    renderTextDecoration(ctx, text, x, y, textWidth, style) {
        const fontSize = style.fontSize || 48;
        const lineWidth = Math.max(1, fontSize / 20);
        
        ctx.strokeStyle = style.color || '#ffffff';
        ctx.lineWidth = lineWidth;
        
        let lineY = y;
        let startX = x;
        
        // 根据对齐方式调整起始X坐标
        if (style.textAlign === 'center') {
            startX = x - textWidth / 2;
        } else if (style.textAlign === 'right') {
            startX = x - textWidth;
        }
        
        switch (style.textDecoration) {
            case 'underline':
                lineY = y + fontSize * 0.1;
                break;
            case 'line-through':
                lineY = y - fontSize * 0.2;
                break;
            case 'overline':
                lineY = y - fontSize * 0.8;
                break;
        }
        
        ctx.beginPath();
        ctx.moveTo(startX, lineY);
        ctx.lineTo(startX + textWidth, lineY);
        ctx.stroke();
    }

    /**
     * 文字换行处理
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {string} text - 文字内容
     * @param {number} maxWidth - 最大宽度
     * @returns {Array} 行数组
     */
    wrapText(ctx, text, maxWidth) {
        if (!maxWidth || maxWidth <= 0) {
            return [text];
        }
        
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        
        lines.push(currentLine);
        return lines;
    }

    /**
     * 创建预设样式
     * @returns {Object} 预设样式对象
     */
    createPresetStyles() {
        return {
            title: {
                fontSize: 72,
                fontFamily: 'Arial Black, sans-serif',
                fontWeight: 'bold',
                color: '#ffffff',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: 30,
                borderRadius: 15,
                strokeColor: '#000000',
                strokeWidth: 2,
                shadowColor: 'rgba(0,0,0,0.8)',
                shadowBlur: 8,
                shadowOffsetX: 3,
                shadowOffsetY: 3
            },
            subtitle: {
                fontSize: 48,
                fontFamily: 'Arial, sans-serif',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: 20,
                borderRadius: 10,
                shadowColor: 'rgba(0,0,0,0.6)',
                shadowBlur: 4,
                shadowOffsetX: 2,
                shadowOffsetY: 2
            },
            caption: {
                fontSize: 32,
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'normal',
                color: '#ffffff',
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: 15,
                borderRadius: 8,
                shadowColor: 'rgba(0,0,0,0.5)',
                shadowBlur: 3,
                shadowOffsetX: 1,
                shadowOffsetY: 1
            },
            watermark: {
                fontSize: 24,
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'normal',
                color: 'rgba(255,255,255,0.7)',
                backgroundColor: 'transparent',
                padding: 0
            },
            modern: {
                fontSize: 56,
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: '300',
                color: '#ffffff',
                backgroundColor: 'rgba(0,123,255,0.8)',
                padding: 25,
                borderRadius: 12,
                shadowColor: 'rgba(0,123,255,0.4)',
                shadowBlur: 12,
                shadowOffsetX: 0,
                shadowOffsetY: 4
            },
            retro: {
                fontSize: 64,
                fontFamily: 'Courier New, monospace',
                fontWeight: 'bold',
                color: '#00ff00',
                backgroundColor: 'rgba(0,0,0,0.9)',
                padding: 20,
                borderRadius: 0,
                strokeColor: '#008800',
                strokeWidth: 1,
                shadowColor: 'rgba(0,255,0,0.5)',
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowOffsetY: 0
            }
        };
    }

    /**
     * 获取预设样式
     * @param {string} presetName - 预设名称
     * @returns {Object} 样式对象
     */
    getPresetStyle(presetName) {
        return this.presetStyles[presetName] || this.presetStyles.subtitle;
    }

    /**
     * 获取所有预设样式名称
     * @returns {Array} 预设名称数组
     */
    getPresetNames() {
        return Object.keys(this.presetStyles);
    }

    /**
     * 测量文字尺寸
     * @param {string} text - 文字内容
     * @param {Object} style - 样式对象
     * @returns {Object} 尺寸信息
     */
    measureText(text, style) {
        // 设置字体
        const fontSize = style.fontSize || 48;
        const fontFamily = style.fontFamily || 'Arial, sans-serif';
        const fontWeight = style.fontWeight || 'normal';
        
        this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        
        // 处理多行文本
        const lines = this.wrapText(this.ctx, text, style.maxWidth);
        const lineHeight = fontSize * (style.lineHeight || 1.2);
        
        // 计算最大宽度
        let maxWidth = 0;
        lines.forEach(line => {
            const metrics = this.ctx.measureText(line);
            maxWidth = Math.max(maxWidth, metrics.width);
        });
        
        const totalHeight = lines.length * lineHeight;
        const padding = style.padding || 0;
        
        return {
            width: maxWidth + (padding * 2),
            height: totalHeight + (padding * 2),
            lines: lines.length,
            lineHeight: lineHeight
        };
    }

    /**
     * 创建文字预览
     * @param {string} text - 文字内容
     * @param {Object} style - 样式对象
     * @param {number} width - 预览宽度
     * @param {number} height - 预览高度
     * @returns {string} 预览图片数据URL
     */
    createPreview(text, style, width = 300, height = 150) {
        // 设置预览画布尺寸
        this.canvas.width = width;
        this.canvas.height = height;
        
        // 清空画布
        this.ctx.clearRect(0, 0, width, height);
        
        // 设置背景
        this.ctx.fillStyle = '#2d2d2d';
        this.ctx.fillRect(0, 0, width, height);
        
        // 创建临时样式（居中显示）
        const previewStyle = {
            ...style,
            x: width / 2,
            y: height / 2,
            textAlign: 'center',
            textBaseline: 'middle',
            maxWidth: width * 0.9
        };
        
        // 渲染文字
        this.render(this.ctx, { text, style: previewStyle });
        
        // 返回数据URL
        return this.canvas.toDataURL('image/png');
    }

    /**
     * 验证样式对象
     * @param {Object} style - 样式对象
     * @returns {Object} 验证结果
     */
    validateStyle(style) {
        const result = {
            valid: true,
            errors: []
        };

        // 检查必需属性
        if (typeof style.fontSize !== 'number' || style.fontSize <= 0) {
            result.errors.push('字体大小必须是正数');
            result.valid = false;
        }

        if (style.fontSize > 200) {
            result.errors.push('字体大小不能超过200px');
            result.valid = false;
        }

        // 检查颜色格式
        if (style.color && !this.isValidColor(style.color)) {
            result.errors.push('文字颜色格式无效');
            result.valid = false;
        }

        if (style.backgroundColor && !this.isValidColor(style.backgroundColor)) {
            result.errors.push('背景颜色格式无效');
            result.valid = false;
        }

        return result;
    }

    /**
     * 检查颜色格式是否有效
     * @param {string} color - 颜色值
     * @returns {boolean} 是否有效
     */
    isValidColor(color) {
        if (color === 'transparent') return true;
        
        // 检查hex格式
        if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) return true;
        
        // 检查rgb/rgba格式
        if (/^rgba?\([\d\s,\.]+\)$/i.test(color)) return true;
        
        // 检查颜色名称
        const colorNames = ['red', 'green', 'blue', 'white', 'black', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray', 'grey'];
        if (colorNames.includes(color.toLowerCase())) return true;
        
        return false;
    }
}

// 导出文字渲染器类
window.TextRenderer = TextRenderer;