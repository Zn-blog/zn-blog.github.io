// 视频播放器类
class VideoPlayer {
    constructor() {
        this.playlist = [];
        this.currentIndex = 0;
        this.initialize();
    }
    
    async initialize() {
        await this.loadPlaylist();
        this.init();
    }

    // 从数据存储加载播放列表
    async loadPlaylist() {
        if (window.blogDataStore) {
            const videos = await window.blogDataStore.getVideos();
            this.playlist = videos.map(v => ({
                id: v.id,
                title: v.name,
                description: v.description || '暂无描述',
                duration: this.formatDuration(v.duration),
                thumbnail: v.cover,
                src: v.url,
                category: v.category || ''
            }));
        }

        // 如果没有数据，使用默认示例
        if (this.playlist.length === 0) {
            this.playlist = [
                {
                    title: 'Big Buck Bunny',
                    description: '一只可爱的大兔子的冒险故事，这是一个开源的测试视频。',
                    duration: '0:10',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217',
                    src: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/aa5308fc5285890804986750388/v.f42906.mp4'
                },
                {
                    title: 'Elephant Dream',
                    description: '一部充满想象力的开源动画短片。',
                    duration: '0:10',
                    thumbnail: 'https://orange.blender.org/wp-content/themes/orange/images/media/screenshots/15.jpg',
                    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
                }
            ];
        }
    }

    // 格式化时长
    formatDuration(seconds) {
        if (!seconds) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    init() {
        // 绑定DOM元素
        this.videoPlayer = document.getElementById('videoPlayer');
        this.videoName = document.getElementById('videoName');
        this.videoDescription = document.getElementById('videoDescription');
        this.videoListContainer = document.getElementById('videoListContainer');
        this.videoCount = document.getElementById('videoCount');

        // 渲染视频列表
        this.renderPlaylist();
        
        // 加载第一个视频信息（不自动播放）
        this.loadVideo(0, false);
    }

    renderPlaylist() {
        this.videoCount.textContent = `${this.playlist.length}个`;
        this.videoListContainer.innerHTML = '';
        
        this.playlist.forEach((video, index) => {
            const item = document.createElement('div');
            item.className = 'video-item';
            if (index === this.currentIndex) {
                item.classList.add('active');
            }
            
            item.innerHTML = `
                <img class="video-item-thumbnail" src="${video.thumbnail}" alt="${video.title}">
                <div class="video-item-info">
                    <div class="video-item-title">${video.title}</div>
                    <div class="video-item-duration">${video.duration}</div>
                </div>
            `;
            
            item.addEventListener('click', () => this.loadVideo(index, true));
            this.videoListContainer.appendChild(item);
        });
    }

    loadVideo(index, autoplay = false) {
        this.currentIndex = index;
        const video = this.playlist[index];
        
        // 更新视频信息
        this.videoName.textContent = video.title;
        this.videoDescription.textContent = video.description;
        
        // 更新列表高亮
        document.querySelectorAll('.video-item').forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // 加载视频（如果有视频源）
        if (video.src) {
            this.videoPlayer.src = video.src;
            if (autoplay) {
                this.videoPlayer.play().catch(e => console.log('视频播放失败:', e));
            }
        } else {
            // 如果没有视频源，显示占位符
            this.videoPlayer.src = '';
            this.videoPlayer.poster = video.thumbnail;
        }
    }

    // 刷新播放列表（用于动态更新）
    refreshPlaylist() {
        this.loadPlaylist();
        this.renderPlaylist();
        if (this.playlist.length > 0) {
            this.loadVideo(0, false);
        }
    }
}

// 初始化视频播放器
let videoPlayerInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    // 等待数据存储加载完成
    setTimeout(() => {
        videoPlayerInstance = new VideoPlayer();
        
        // 将实例暴露给全局，方便其他脚本调用
        window.videoPlayerInstance = videoPlayerInstance;
    }, 100);
});
