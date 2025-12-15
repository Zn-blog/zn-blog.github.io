/* ========================================
   欢迎界面名言警句功能
   支持打字机效果和API获取
   ======================================== */

class WelcomeQuote {
    constructor() {
        this.quoteElement = document.getElementById('quoteContent');
        this.authorElement = document.getElementById('quoteAuthor');
        this.currentText = '';
        this.targetText = '';
        this.currentIndex = 0;
        this.typingSpeed = 80; // 打字速度（毫秒）
        this.deletingSpeed = 50; // 删除速度（毫秒）
        this.displayDuration = 5000; // 显示时长（毫秒）
        this.isTyping = false;
        this.isDeleting = false;
        this.quoteQueue = []; // 名言队列
        this.currentQuoteIndex = 0;
        
        // 备用名言列表（API失败时使用）
        this.fallbackQuotes = [
            { text: '生活不止眼前的苟且，还有诗和远方的田野。', author: '高晓松' },
            { text: '世界上只有一种真正的英雄主义，那就是认清生活的真相后依然热爱生活。', author: '罗曼·罗兰' },
            { text: '你的时间有限，不要浪费在重复他人的生活上。', author: '史蒂夫·乔布斯' },
            { text: '成功不是终点，失败也不是终结，唯有勇气才是永恒。', author: '温斯顿·丘吉尔' },
            { text: '人生最大的荣耀不在于从不跌倒，而在于每次跌倒后都能站起来。', author: '纳尔逊·曼德拉' },
            { text: '不要问国家能为你做什么，而要问你能为国家做什么。', author: '约翰·肯尼迪' },
            { text: '黑夜给了我黑色的眼睛，我却用它寻找光明。', author: '顾城' },
            { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
            { text: '天生我材必有用，千金散尽还复来。', author: '李白' },
            { text: '海内存知己，天涯若比邻。', author: '王勃' }
        ];
    }
    
    // 初始化
    async init() {
        // 初始化名言队列
        await this.initQuoteQueue();
        // 开始循环显示
        this.startQuoteLoop();
    }
    
    // 初始化名言队列
    async initQuoteQueue() {
        // 尝试从API获取多条名言
        const apiQuotes = await this.fetchMultipleQuotes(3);
        
        if (apiQuotes.length > 0) {
            this.quoteQueue = apiQuotes;
        } else {
            // API失败，使用备用名言
            this.quoteQueue = [...this.fallbackQuotes];
            // 打乱顺序
            this.quoteQueue.sort(() => Math.random() - 0.5);
        }
        
        console.log('📚 名言队列已初始化，共', this.quoteQueue.length, '条');
    }
    
    // 获取多条名言
    async fetchMultipleQuotes(count) {
        const quotes = [];
        const apis = [
            // API 1: 一言
            {
                url: 'https://v1.hitokoto.cn/?c=i&encode=json',
                parse: (data) => ({
                    text: data.hitokoto,
                    author: data.from_who || data.from || '佚名'
                })
            },
            // API 2: 今日诗词
            {
                url: 'https://v1.jinrishici.com/all.json',
                parse: (data) => ({
                    text: data.content,
                    author: `${data.author}《${data.origin}》`
                })
            }
        ];
        
        // 尝试获取指定数量的名言
        for (let i = 0; i < count; i++) {
            const api = apis[i % apis.length];
            try {
                const response = await fetch(api.url, {
                    method: 'GET',
                    timeout: 5000
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const quote = api.parse(data);
                    quotes.push(quote);
                    console.log(`✅ 名言 ${i + 1} 获取成功:`, quote);
                }
            } catch (error) {
                console.warn(`⚠️ API ${api.url} 失败:`, error);
            }
            
            // 避免请求过快
            if (i < count - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        return quotes;
    }
    
    // 开始名言循环
    startQuoteLoop() {
        this.showNextQuote();
    }
    
    // 显示下一条名言
    showNextQuote() {
        if (this.quoteQueue.length === 0) {
            // 队列为空，重新初始化
            this.quoteQueue = [...this.fallbackQuotes];
            this.quoteQueue.sort(() => Math.random() - 0.5);
        }
        
        const quote = this.quoteQueue[this.currentQuoteIndex];
        this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quoteQueue.length;
        
        this.displayQuote(quote.text, quote.author);
    }
    
    // 显示名言（打字机效果）
    displayQuote(text, author) {
        this.targetText = text;
        this.targetAuthor = author;
        this.currentIndex = 0;
        this.currentText = '';
        this.isTyping = true;
        this.isDeleting = false;
        
        // 隐藏作者
        if (this.authorElement) {
            this.authorElement.style.opacity = '0';
        }
        
        this.typeText();
    }
    
    // 打字机效果（输入）
    typeText() {
        if (!this.isTyping) return;
        
        if (this.currentIndex < this.targetText.length) {
            this.currentText += this.targetText[this.currentIndex];
            this.quoteElement.textContent = this.currentText;
            this.currentIndex++;
            
            setTimeout(() => this.typeText(), this.typingSpeed);
        } else {
            // 打字完成
            this.isTyping = false;
            
            // 显示作者
            if (this.authorElement) {
                this.authorElement.textContent = `—— ${this.targetAuthor}`;
                setTimeout(() => {
                    this.authorElement.style.transition = 'opacity 0.5s';
                    this.authorElement.style.opacity = '1';
                }, 300);
            }
            
            // 等待displayDuration后开始删除
            setTimeout(() => {
                this.startDeleting();
            }, this.displayDuration);
        }
    }
    
    // 开始删除
    startDeleting() {
        this.isDeleting = true;
        
        // 先隐藏作者
        if (this.authorElement) {
            this.authorElement.style.transition = 'opacity 0.3s';
            this.authorElement.style.opacity = '0';
        }
        
        // 等待作者淡出后开始删除文字
        setTimeout(() => {
            this.deleteText();
        }, 400);
    }
    
    // 打字机效果（删除）
    deleteText() {
        if (!this.isDeleting) return;
        
        if (this.currentText.length > 0) {
            this.currentText = this.currentText.slice(0, -1);
            this.quoteElement.textContent = this.currentText;
            
            setTimeout(() => this.deleteText(), this.deletingSpeed);
        } else {
            // 删除完成，显示下一条
            this.isDeleting = false;
            
            // 短暂延迟后显示下一条
            setTimeout(() => {
                this.showNextQuote();
            }, 500);
        }
    }
    
    // 刷新名言
    async refresh() {
        this.quoteElement.textContent = '';
        if (this.authorElement) {
            this.authorElement.textContent = '';
            this.authorElement.style.opacity = '0';
        }
        await this.fetchQuote();
    }
}

// 滚动到内容区域
function scrollToContent() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const welcomeQuote = new WelcomeQuote();
    welcomeQuote.init();
    
    // 将实例挂载到window，方便调试和刷新
    window.welcomeQuote = welcomeQuote;
    
    console.log('✨ 欢迎界面名言系统已初始化');
});
