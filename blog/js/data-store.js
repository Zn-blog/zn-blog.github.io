// 博客数据存储管理
class BlogDataStore {
    constructor() {
        this.initializeData();
    }

    // 初始化数据
    initializeData() {
        if (!localStorage.getItem('blogData')) {
            const initialData = {
                articles: [
                    {
                        id: 1,
                        title: '如何使用 Vue 3 构建现代化应用',
                        content: '这是一篇关于 Vue 3 的详细教程...',
                        excerpt: '学习如何使用 Vue 3 的最新特性构建现代化的 Web 应用',
                        category: '技术',
                        tags: ['Vue.js', '前端开发'],
                        status: 'published',
                        publishDate: '2025-11-15',
                        image: 'https://picsum.photos/seed/vue3/400/250',
                        views: 256,
                        author: '管理员'
                    },
                    {
                        id: 2,
                        title: 'JavaScript 异步编程最佳实践',
                        content: '深入理解 JavaScript 的异步编程...',
                        excerpt: '掌握 Promise、async/await 等异步编程技术',
                        category: '技术',
                        tags: ['JavaScript'],
                        status: 'published',
                        publishDate: '2025-11-10',
                        image: 'https://picsum.photos/seed/js-async/400/250',
                        views: 189,
                        author: '管理员'
                    },
                    {
                        id: 3,
                        title: 'CSS Grid 布局完全指南',
                        content: 'CSS Grid 是现代网页布局的强大工具...',
                        excerpt: '全面了解 CSS Grid 布局系统的使用方法',
                        category: '技术',
                        tags: ['CSS', '前端开发'],
                        status: 'draft',
                        publishDate: '2025-11-05',
                        image: 'https://picsum.photos/seed/css-grid/400/250',
                        views: 142,
                        author: '管理员'
                    }
                ],
                categories: [
                    { id: 1, name: '技术', description: '技术相关文章', count: 12 },
                    { id: 2, name: '生活', description: '生活随笔', count: 8 },
                    { id: 3, name: '设计', description: '设计相关内容', count: 5 }
                ],
                tags: [
                    { id: 1, name: 'JavaScript', count: 15 },
                    { id: 2, name: '前端开发', count: 20 },
                    { id: 3, name: 'CSS', count: 10 },
                    { id: 4, name: 'Vue.js', count: 12 },
                    { id: 5, name: 'React', count: 8 }
                ],
                comments: [
                    {
                        id: 1,
                        articleId: 1,
                        articleTitle: 'Vue 3 构建应用',
                        content: '很棒的文章，学到了很多！',
                        author: '张三',
                        email: 'zhangsan@example.com',
                        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        status: 'approved'
                    },
                    {
                        id: 2,
                        articleId: 2,
                        articleTitle: 'JavaScript 异步编程',
                        content: '期待更多这样的内容',
                        author: '李四',
                        email: 'lisi@example.com',
                        time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                        status: 'pending'
                    }
                ],
                images: [
                    {
                        id: 1,
                        name: 'sample-image-1.jpg',
                        url: 'https://picsum.photos/seed/media1/800/600',
                        thumbnail: 'https://picsum.photos/seed/media1/300/300',
                        size: 245678,
                        type: 'image/jpeg',
                        description: '示例图片 1',
                        uploadDate: '2025-11-15',
                        usedIn: []
                    },
                    {
                        id: 2,
                        name: 'sample-image-2.jpg',
                        url: 'https://picsum.photos/seed/media2/800/600',
                        thumbnail: 'https://picsum.photos/seed/media2/300/300',
                        size: 189234,
                        type: 'image/jpeg',
                        description: '示例图片 2',
                        uploadDate: '2025-11-14',
                        usedIn: []
                    }
                ],
                music: [
                    {
                        id: 1,
                        name: '示例歌曲 1',
                        artist: '示例歌手',
                        album: '示例专辑',
                        cover: 'https://picsum.photos/seed/music1/300/300',
                        url: 'https://example.com/music1.mp3',
                        lrc: '[00:00.00]这是示例歌词\n[00:05.00]第二行歌词',
                        duration: 240,
                        description: '这是一首示例歌曲',
                        uploadDate: '2025-11-15'
                    },
                    {
                        id: 2,
                        name: '示例歌曲 2',
                        artist: '示例歌手',
                        album: '示例专辑',
                        cover: 'https://picsum.photos/seed/music2/300/300',
                        url: 'https://example.com/music2.mp3',
                        lrc: '[00:00.00]示例歌词内容',
                        duration: 180,
                        description: '另一首示例歌曲',
                        uploadDate: '2025-11-14'
                    }
                ],
                videos: [
                    {
                        id: 1,
                        name: '示例视频 1',
                        cover: 'https://picsum.photos/seed/video1/640/360',
                        url: 'https://example.com/video1.mp4',
                        duration: 300,
                        description: '这是一个示例视频',
                        category: '教程',
                        uploadDate: '2025-11-15'
                    },
                    {
                        id: 2,
                        name: '示例视频 2',
                        cover: 'https://picsum.photos/seed/video2/640/360',
                        url: 'https://example.com/video2.mp4',
                        duration: 420,
                        description: '另一个示例视频',
                        category: '生活',
                        uploadDate: '2025-11-14'
                    }
                ],
                settings: {
                    siteName: 'ℳঞ执念ꦿ的博客',
                    siteDescription: '一个记录生活和技术的博客',
                    postsPerPage: 10,
                    commentModeration: true,
                    totalWords: 125000,
                    totalViews: 5432,
                    totalVisitors: 1234,
                    startDate: '2025-01-01',
                    avatar: 'https://ui-avatars.com/api/?name=执念&size=200&background=4fc3f7&color=fff&bold=true'
                }
            };
            localStorage.setItem('blogData', JSON.stringify(initialData));
        }
    }

    // 获取所有数据
    getAllData() {
        return JSON.parse(localStorage.getItem('blogData'));
    }

    // 保存所有数据
    saveAllData(data) {
        localStorage.setItem('blogData', JSON.stringify(data));
    }

    // 文章相关方法
    getArticles(status = null) {
        const data = this.getAllData();
        if (status) {
            return data.articles.filter(article => article.status === status);
        }
        return data.articles;
    }

    getArticleById(id) {
        const data = this.getAllData();
        return data.articles.find(article => article.id === parseInt(id));
    }

    addArticle(article) {
        const data = this.getAllData();
        article.id = Math.max(...data.articles.map(a => a.id), 0) + 1;
        article.views = 0;
        data.articles.unshift(article);
        this.saveAllData(data);
        return article;
    }

    updateArticle(id, updates) {
        const data = this.getAllData();
        const index = data.articles.findIndex(article => article.id === parseInt(id));
        if (index !== -1) {
            data.articles[index] = { ...data.articles[index], ...updates };
            this.saveAllData(data);
            return data.articles[index];
        }
        return null;
    }

    deleteArticle(id) {
        const data = this.getAllData();
        data.articles = data.articles.filter(article => article.id !== parseInt(id));
        this.saveAllData(data);
    }

    // 分类相关方法
    getCategories() {
        const data = this.getAllData();
        return data.categories;
    }

    addCategory(category) {
        const data = this.getAllData();
        category.id = Math.max(...data.categories.map(c => c.id), 0) + 1;
        category.count = 0;
        data.categories.push(category);
        this.saveAllData(data);
        return category;
    }

    updateCategory(id, updates) {
        const data = this.getAllData();
        const index = data.categories.findIndex(cat => cat.id === parseInt(id));
        if (index !== -1) {
            data.categories[index] = { ...data.categories[index], ...updates };
            this.saveAllData(data);
            return data.categories[index];
        }
        return null;
    }

    deleteCategory(id) {
        const data = this.getAllData();
        data.categories = data.categories.filter(cat => cat.id !== parseInt(id));
        this.saveAllData(data);
    }

    // 标签相关方法
    getTags() {
        const data = this.getAllData();
        return data.tags;
    }

    addTag(tag) {
        const data = this.getAllData();
        tag.id = Math.max(...data.tags.map(t => t.id), 0) + 1;
        tag.count = 0;
        data.tags.push(tag);
        this.saveAllData(data);
        return tag;
    }

    updateTag(id, updates) {
        const data = this.getAllData();
        const index = data.tags.findIndex(tag => tag.id === parseInt(id));
        if (index !== -1) {
            data.tags[index] = { ...data.tags[index], ...updates };
            this.saveAllData(data);
            return data.tags[index];
        }
        return null;
    }

    deleteTag(id) {
        const data = this.getAllData();
        data.tags = data.tags.filter(tag => tag.id !== parseInt(id));
        this.saveAllData(data);
    }

    // 评论相关方法
    getComments(status = null) {
        const data = this.getAllData();
        if (status) {
            return data.comments.filter(comment => comment.status === status);
        }
        return data.comments;
    }

    addComment(comment) {
        const data = this.getAllData();
        comment.id = Math.max(...data.comments.map(c => c.id), 0) + 1;
        comment.time = new Date().toISOString();
        comment.status = data.settings.commentModeration ? 'pending' : 'approved';
        comment.likes = 0;
        comment.dislikes = 0;
        comment.parentId = comment.parentId || null; // 父评论ID，用于二级评论
        data.comments.unshift(comment);
        this.saveAllData(data);
        return comment;
    }

    updateComment(id, updates) {
        const data = this.getAllData();
        const index = data.comments.findIndex(comment => comment.id === parseInt(id));
        if (index !== -1) {
            data.comments[index] = { ...data.comments[index], ...updates };
            this.saveAllData(data);
            return data.comments[index];
        }
        return null;
    }

    deleteComment(id) {
        const data = this.getAllData();
        data.comments = data.comments.filter(comment => comment.id !== parseInt(id));
        this.saveAllData(data);
    }
    
    // 根据文章ID获取评论（只返回一级评论）
    getCommentsByArticle(articleId) {
        const data = this.getAllData();
        return data.comments.filter(comment => 
            comment.articleId === parseInt(articleId) && 
            comment.status === 'approved' &&
            !comment.parentId // 只返回一级评论
        ).sort((a, b) => new Date(b.time) - new Date(a.time));
    }
    
    // 获取某条评论的回复（二级评论）
    getRepliesByComment(commentId) {
        const data = this.getAllData();
        return data.comments.filter(comment => 
            comment.parentId === parseInt(commentId) && 
            comment.status === 'approved'
        ).sort((a, b) => new Date(a.time) - new Date(b.time)); // 回复按时间正序
    }
    
    // 评论点赞
    likeComment(commentId) {
        const data = this.getAllData();
        const comment = data.comments.find(c => c.id === parseInt(commentId));
        if (comment) {
            comment.likes = (comment.likes || 0) + 1;
            this.saveAllData(data);
            return comment;
        }
        return null;
    }
    
    // 取消评论点赞
    unlikeComment(commentId) {
        const data = this.getAllData();
        const comment = data.comments.find(c => c.id === parseInt(commentId));
        if (comment) {
            comment.likes = Math.max((comment.likes || 0) - 1, 0);
            this.saveAllData(data);
            return comment;
        }
        return null;
    }
    
    // 评论差评
    dislikeComment(commentId) {
        const data = this.getAllData();
        const comment = data.comments.find(c => c.id === parseInt(commentId));
        if (comment) {
            comment.dislikes = (comment.dislikes || 0) + 1;
            this.saveAllData(data);
            return comment;
        }
        return null;
    }
    
    // 取消评论差评
    undislikeComment(commentId) {
        const data = this.getAllData();
        const comment = data.comments.find(c => c.id === parseInt(commentId));
        if (comment) {
            comment.dislikes = Math.max((comment.dislikes || 0) - 1, 0);
            this.saveAllData(data);
            return comment;
        }
        return null;
    }
    
    // 增加文章浏览量
    incrementViews(articleId) {
        const data = this.getAllData();
        const article = data.articles.find(a => a.id === parseInt(articleId));
        if (article) {
            article.views = (article.views || 0) + 1;
            this.saveAllData(data);
        }
    }
    
    // 增加文章点赞数
    incrementLikes(articleId) {
        const data = this.getAllData();
        const article = data.articles.find(a => a.id === parseInt(articleId));
        if (article) {
            article.likes = (article.likes || 0) + 1;
            this.saveAllData(data);
        }
    }
    
    // 减少文章点赞数
    decrementLikes(articleId) {
        const data = this.getAllData();
        const article = data.articles.find(a => a.id === parseInt(articleId));
        if (article && article.likes > 0) {
            article.likes--;
            this.saveAllData(data);
        }
    }
    
    // 留言相关方法（只返回一级留言）
    async getGuestbookMessages() {
        // 直接从 JSON 文件读取留言数据
        try {
            const response = await fetch('../data/guestbook.json');
            if (!response.ok) {
                throw new Error('无法加载 guestbook.json');
            }
            const allMessages = await response.json();
            console.log('✅ 从 JSON 文件加载留言:', allMessages.length);
            return allMessages.filter(m => !m.parentId); // 只返回一级留言
        } catch (error) {
            console.error('❌ 从 JSON 文件加载留言失败:', error);
            // 备用：从 localStorage 读取
            const data = this.getAllData();
            const allMessages = data.guestbook || [];
            console.log('⚠️ 从 localStorage 加载留言:', allMessages.length);
            return allMessages.filter(m => !m.parentId);
        }
    }
    
    // 获取某条留言的回复（二级留言）
    async getRepliesByMessage(messageId) {
        // 直接从 JSON 文件读取留言数据
        try {
            const response = await fetch('../data/guestbook.json');
            if (!response.ok) {
                throw new Error('无法加载 guestbook.json');
            }
            const allMessages = await response.json();
            return allMessages.filter(m => m.parentId === parseInt(messageId))
                .sort((a, b) => new Date(a.time) - new Date(b.time)); // 回复按时间正序
        } catch (error) {
            console.error('❌ 从 JSON 文件加载回复失败:', error);
            // 备用：从 localStorage 读取
            const data = this.getAllData();
            const allMessages = data.guestbook || [];
            return allMessages.filter(m => m.parentId === parseInt(messageId))
                .sort((a, b) => new Date(a.time) - new Date(b.time));
        }
    }
    
    addGuestbookMessage(message) {
        const data = this.getAllData();
        if (!data.guestbook) {
            data.guestbook = [];
        }
        message.id = Math.max(...data.guestbook.map(m => m.id), 0) + 1;
        const timestamp = new Date().toISOString();
        message.time = timestamp;  // 主要字段
        message.createdAt = timestamp;  // 兼容字段
        message.likes = 0;
        message.dislikes = 0;
        message.pinned = false;
        message.parentId = message.parentId || null; // 父留言ID，用于二级回复
        data.guestbook.unshift(message);
        this.saveAllData(data);
        return message;
    }
    
    updateGuestbookMessage(id, updates) {
        const data = this.getAllData();
        if (!data.guestbook) return null;
        const index = data.guestbook.findIndex(m => m.id === parseInt(id));
        if (index !== -1) {
            data.guestbook[index] = { ...data.guestbook[index], ...updates };
            this.saveAllData(data);
            return data.guestbook[index];
        }
        return null;
    }
    
    deleteGuestbookMessage(id) {
        const data = this.getAllData();
        if (!data.guestbook) return;
        data.guestbook = data.guestbook.filter(m => m.id !== parseInt(id));
        this.saveAllData(data);
    }
    
    // 留言点赞
    likeGuestbookMessage(id) {
        const data = this.getAllData();
        if (!data.guestbook) return null;
        const message = data.guestbook.find(m => m.id === parseInt(id));
        if (message) {
            message.likes = (message.likes || 0) + 1;
            this.saveAllData(data);
            return message;
        }
        return null;
    }
    
    // 取消留言点赞
    unlikeGuestbookMessage(id) {
        const data = this.getAllData();
        if (!data.guestbook) return null;
        const message = data.guestbook.find(m => m.id === parseInt(id));
        if (message) {
            message.likes = Math.max((message.likes || 0) - 1, 0);
            this.saveAllData(data);
            return message;
        }
        return null;
    }
    
    // 留言差评
    dislikeGuestbookMessage(id) {
        const data = this.getAllData();
        if (!data.guestbook) return null;
        const message = data.guestbook.find(m => m.id === parseInt(id));
        if (message) {
            message.dislikes = (message.dislikes || 0) + 1;
            this.saveAllData(data);
            return message;
        }
        return null;
    }
    
    // 取消留言差评
    undislikeGuestbookMessage(id) {
        const data = this.getAllData();
        if (!data.guestbook) return null;
        const message = data.guestbook.find(m => m.id === parseInt(id));
        if (message) {
            message.dislikes = Math.max((message.dislikes || 0) - 1, 0);
            this.saveAllData(data);
            return message;
        }
        return null;
    }
    
    // 兼容旧方法
    toggleGuestbookLike(id) {
        return this.likeGuestbookMessage(id);
    }
    
    toggleGuestbookPin(id) {
        const data = this.getAllData();
        if (!data.guestbook) return null;
        const message = data.guestbook.find(m => m.id === parseInt(id));
        if (message) {
            message.pinned = !message.pinned;
            this.saveAllData(data);
            return message;
        }
        return null;
    }

    // 设置相关方法
    getSettings() {
        const data = this.getAllData();
        return data.settings;
    }

    updateSettings(updates) {
        const data = this.getAllData();
        data.settings = { ...data.settings, ...updates };
        this.saveAllData(data);
        return data.settings;
    }

    // 统计方法
    getStats() {
        const data = this.getAllData();
        
        // 计算总字数（所有已发布文章的字数总和）
        const totalWords = data.articles
            .filter(a => a.status === 'published')
            .reduce((sum, article) => sum + (article.content?.length || 0), 0);
        
        // 计算总浏览量（所有文章的浏览量总和）
        const totalViews = data.articles.reduce((sum, article) => sum + (article.views || 0), 0);
        
        // 计算运行天数
        const runningDays = Math.floor((Date.now() - new Date(data.settings.startDate).getTime()) / (1000 * 60 * 60 * 24));
        
        // 更新设置中的统计数据
        data.settings.totalWords = totalWords;
        data.settings.totalViews = totalViews;
        this.saveAllData(data);
        
        return {
            totalArticles: data.articles.filter(a => a.status === 'published').length,
            totalComments: data.comments.length,
            totalViews: totalViews,
            totalVisitors: data.settings.totalVisitors,
            totalWords: totalWords,
            runningDays: runningDays
        };
    }

    // 增加浏览量
    incrementViews(articleId = null) {
        const data = this.getAllData();
        data.settings.totalViews++;
        if (articleId) {
            const article = data.articles.find(a => a.id === parseInt(articleId));
            if (article) {
                article.views++;
            }
        }
        this.saveAllData(data);
    }

    // 图片管理方法
    async getImages() {
        // 直接从 JSON 文件读取图片数据
        try {
            const response = await fetch('../data/images.json');
            if (!response.ok) {
                throw new Error('无法加载 images.json');
            }
            const images = await response.json();
            console.log('✅ 从 JSON 文件加载图片:', images.length);
            return images;
        } catch (error) {
            console.error('❌ 从 JSON 文件加载图片失败:', error);
            // 备用：从 localStorage 读取
            try {
                const mediaData = JSON.parse(localStorage.getItem('blog_media') || '[]');
                let images = mediaData.filter(item => item.type === 'image' || item.type?.startsWith('image/'));
                
                if (images.length === 0) {
                    const data = this.getAllData();
                    images = data.images || [];
                }
                
                console.log('⚠️ 从 localStorage 加载图片:', images.length);
                return images;
            } catch (localError) {
                console.error('❌ 从 localStorage 加载图片也失败:', localError);
                return [];
            }
        }
    }

    getImageById(id) {
        const data = this.getAllData();
        return data.images?.find(img => img.id === parseInt(id));
    }

    addImage(image) {
        const data = this.getAllData();
        if (!data.images) data.images = [];
        image.id = Math.max(...data.images.map(m => m.id), 0) + 1;
        image.uploadDate = new Date().toISOString().split('T')[0];
        image.usedIn = image.usedIn || [];
        data.images.unshift(image);
        this.saveAllData(data);
        return image;
    }

    updateImage(id, updates) {
        const data = this.getAllData();
        if (!data.images) return null;
        const index = data.images.findIndex(img => img.id === parseInt(id));
        if (index !== -1) {
            data.images[index] = { ...data.images[index], ...updates };
            this.saveAllData(data);
            return data.images[index];
        }
        return null;
    }

    deleteImage(id) {
        const data = this.getAllData();
        if (!data.images) return;
        data.images = data.images.filter(img => img.id !== parseInt(id));
        this.saveAllData(data);
    }

    // 音乐管理方法
    getMusic() {
        const data = this.getAllData();
        return data.music || [];
    }

    getMusicById(id) {
        const data = this.getAllData();
        return data.music?.find(m => m.id === parseInt(id));
    }

    addMusic(music) {
        const data = this.getAllData();
        if (!data.music) data.music = [];
        music.id = Math.max(...data.music.map(m => m.id), 0) + 1;
        music.uploadDate = new Date().toISOString().split('T')[0];
        data.music.unshift(music);
        this.saveAllData(data);
        return music;
    }

    updateMusic(id, updates) {
        const data = this.getAllData();
        if (!data.music) return null;
        const index = data.music.findIndex(m => m.id === parseInt(id));
        if (index !== -1) {
            data.music[index] = { ...data.music[index], ...updates };
            this.saveAllData(data);
            return data.music[index];
        }
        return null;
    }

    deleteMusic(id) {
        const data = this.getAllData();
        if (!data.music) return;
        data.music = data.music.filter(m => m.id !== parseInt(id));
        this.saveAllData(data);
    }

    // 视频管理方法
    getVideos() {
        const data = this.getAllData();
        return data.videos || [];
    }

    getVideoById(id) {
        const data = this.getAllData();
        return data.videos?.find(v => v.id === parseInt(id));
    }

    addVideo(video) {
        const data = this.getAllData();
        if (!data.videos) data.videos = [];
        video.id = Math.max(...data.videos.map(v => v.id), 0) + 1;
        video.uploadDate = new Date().toISOString().split('T')[0];
        data.videos.unshift(video);
        this.saveAllData(data);
        return video;
    }

    updateVideo(id, updates) {
        const data = this.getAllData();
        if (!data.videos) return null;
        const index = data.videos.findIndex(v => v.id === parseInt(id));
        if (index !== -1) {
            data.videos[index] = { ...data.videos[index], ...updates };
            this.saveAllData(data);
            return data.videos[index];
        }
        return null;
    }

    deleteVideo(id) {
        const data = this.getAllData();
        if (!data.videos) return;
        data.videos = data.videos.filter(v => v.id !== parseInt(id));
        this.saveAllData(data);
    }

    // 兼容旧的 getMedia 方法
    async getMedia() {
        return await this.getImages();
    }

    getMediaById(id) {
        return this.getImageById(id);
    }

    addMedia(media) {
        return this.addImage(media);
    }

    deleteMedia(id) {
        return this.deleteImage(id);
    }

    // 上传图片（转换为 Base64 或使用外部 URL）
    uploadImage(file) {
        return new Promise((resolve, reject) => {
            // 不限制文件大小
            console.log('上传文件大小:', (file.size / 1024 / 1024).toFixed(2) + 'MB');

            // 检查文件类型
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                reject(new Error('只支持 JPG、PNG、GIF、WebP 格式'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const media = {
                    name: file.name,
                    url: e.target.result, // Base64 URL
                    thumbnail: e.target.result, // 简化版本，实际应该生成缩略图
                    size: file.size,
                    type: file.type
                };
                const savedMedia = this.addMedia(media);
                resolve(savedMedia);
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsDataURL(file);
        });
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // ========== 友情链接管理方法 ==========
    
    // 获取所有友情链接
    getLinks() {
        const data = this.getAllData();
        return data.links || [];
    }

    // 根据ID获取友情链接
    getLinkById(id) {
        const links = this.getLinks();
        return links.find(link => link.id === id);
    }

    // 添加友情链接
    addLink(link) {
        const data = this.getAllData();
        if (!data.links) data.links = [];
        
        const newLink = {
            id: Date.now(),
            name: link.name || '未命名',
            url: link.url || '',
            description: link.description || '',
            avatar: link.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(link.name || 'Link') + '&size=200&background=4fc3f7&color=fff&bold=true',
            category: link.category || '默认',
            status: link.status || 'active', // active, inactive
            addedDate: new Date().toISOString().split('T')[0]
        };
        
        data.links.push(newLink);
        this.saveAllData(data);
        return newLink;
    }

    // 更新友情链接
    updateLink(id, updates) {
        const data = this.getAllData();
        const index = data.links.findIndex(link => link.id === id);
        
        if (index !== -1) {
            data.links[index] = { ...data.links[index], ...updates };
            this.saveAllData(data);
            return data.links[index];
        }
        return null;
    }

    // 删除友情链接
    deleteLink(id) {
        const data = this.getAllData();
        data.links = data.links.filter(link => link.id !== id);
        this.saveAllData(data);
    }

    // 获取友情链接分类
    getLinkCategories() {
        const links = this.getLinks();
        const categories = [...new Set(links.map(link => link.category))];
        return categories.length > 0 ? categories : ['默认'];
    }

    // 按分类获取友情链接
    getLinksByCategory(category) {
        const links = this.getLinks();
        return links.filter(link => link.category === category && link.status === 'active');
    }

    // 获取活跃的友情链接
    getActiveLinks() {
        const links = this.getLinks();
        return links.filter(link => link.status === 'active');
    }
}

// 创建全局实例
window.blogDataStore = new BlogDataStore();
