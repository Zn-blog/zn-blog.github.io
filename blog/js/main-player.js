// 主音乐播放器类
class MainMusicPlayer {
    constructor() {
        this.playlist = [];
        this.initialize();
    }
    
    async initialize() {
        await this.loadPlaylist();
        
        // 如果没有数据，使用默认示例
        if (this.playlist.length === 0) {
            this.playlist = [
                { 
                    id: '1868553', 
                    name: '起风了', 
                    artist: '买辣椒也用券',
                    duration: 320, // 秒数
                    durationFormatted: '05:20',
                    cover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
                    url: '1868553',
                    lyrics: [
                        { time: 0, text: '这一路上走走停停' },
                        { time: 3, text: '顺着少年漂流的痕迹' },
                        { time: 6, text: '迈出车站的前一刻' },
                        { time: 9, text: '竟有些犹豫' },
                        { time: 12, text: '不禁笑这近乡情怯' },
                        { time: 15, text: '仍无法避免' },
                        { time: 18, text: '而长野的天' },
                        { time: 21, text: '依旧那么暖' },
                        { time: 24, text: '风吹起了从前' }
                    ]
                },
                { 
                    id: '1901371647', 
                    name: '风继续吹', 
                    artist: '张国荣',
                    duration: 255, // 秒数
                    durationFormatted: '04:15',
                    cover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
                    url: '1901371647',
                    lyrics: [
                        { time: 0, text: '风继续吹 不忍远离' },
                        { time: 4, text: '心里极渴望 希望留下伴着你' },
                        { time: 8, text: '风继续吹 不忍远离' },
                        { time: 12, text: '心里有泪 不愿流泪望着你' }
                    ]
                },
                { 
                    id: '447925558', 
                    name: '晴天', 
                    artist: '周杰伦',
                    duration: 269, // 秒数
                    durationFormatted: '04:29',
                    cover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
                    url: '447925558',
                    lyrics: [
                        { time: 0, text: '故事的小黄花' },
                        { time: 3, text: '从出生那年就飘着' },
                        { time: 6, text: '童年的荡秋千' },
                        { time: 9, text: '随记忆一直晃到现在' }
                    ]
                }
            ];
        }
        
        this.currentIndex = 0;
        this.isPlaying = false;
        this.audio = null;
        this.userScrolling = false; // 标记用户是否手动滚动了歌词
        this.scrollTimeout = null;  // 滚动超时定时器
        this.init();
    }

    init() {
        // 绑定DOM元素
        this.audio = document.getElementById('mainAudioPlayer');
        this.cover = document.getElementById('mainPlayerCover');
        this.songName = document.getElementById('mainSongName');
        this.songArtist = document.getElementById('mainSongArtist');
        this.playBtn = document.getElementById('mainPlayBtn');
        this.prevBtn = document.getElementById('mainPrevBtn');
        this.nextBtn = document.getElementById('mainNextBtn');
        this.progressBar = document.getElementById('mainProgressBar');
        this.progressFill = document.getElementById('mainProgressFill');
        this.timeCurrent = document.getElementById('mainTimeCurrent');
        this.timeTotal = document.getElementById('mainTimeTotal');
        this.playlistContainer = document.getElementById('playlistContainer');
        this.playlistCount = document.getElementById('playlistCount');
        this.lyricsContent = document.getElementById('lyricsContent');
        this.lyricsToggle = document.getElementById('lyricsToggle');

        // 绑定事件
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.prevSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        this.lyricsToggle.addEventListener('click', () => this.toggleLyrics());

        // 歌词面板滚动监听（检测用户手动滚动）
        this.lyricsContent.addEventListener('wheel', () => {
            this.userScrolling = true;
            this.resetScrollTimeout();
        });
        
        this.lyricsContent.addEventListener('touchmove', () => {
            this.userScrolling = true;
            this.resetScrollTimeout();
        });

        // 音频事件
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgress();
            this.updateLyrics();
        });
        this.audio.addEventListener('ended', () => this.nextSong());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());

        // 初始化播放列表
        this.renderPlaylist();
        
        // 加载第一首歌
        this.loadSong(0);
    }

    // 从数据存储加载播放列表（异步）
    async loadPlaylist() {
        if (!window.blogDataStore) return;
        
        const music = await window.blogDataStore.getMusic();
        this.playlist = music.map(m => ({
            id: m.id.toString(),
            name: m.name,
            artist: m.artist,
            duration: m.duration, // 保存原始秒数，不要格式化
            durationFormatted: this.formatDuration(m.duration), // 格式化后的字符串用于显示
            cover: m.cover,
            url: m.url,
            lyrics: this.parseLyrics(m.lrc || '')
        }));
    }

    // 解析 LRC 歌词
    parseLyrics(lrc) {
        if (!lrc) return [];
        
        const lines = lrc.split('\n');
        const lyrics = [];
        
        lines.forEach(line => {
            const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const time = minutes * 60 + seconds;
                const text = match[4].trim();
                if (text) {
                    lyrics.push({ time, text });
                }
            }
        });
        
        // 按时间排序，确保歌词按顺序显示
        lyrics.sort((a, b) => a.time - b.time);
        
        return lyrics;
    }

    // 格式化时长
    formatDuration(seconds) {
        if (!seconds) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 刷新播放列表（用于动态更新）
    refreshPlaylist() {
        this.loadPlaylist();
        this.renderPlaylist();
        if (this.playlist.length > 0 && this.currentIndex >= this.playlist.length) {
            this.currentIndex = 0;
            this.loadSong(0);
        }
    }

    renderPlaylist() {
        this.playlistCount.textContent = `${this.playlist.length}首`;
        this.playlistContainer.innerHTML = '';
        
        this.playlist.forEach((song, index) => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            if (index === this.currentIndex) {
                item.classList.add('active');
            }
            
            item.innerHTML = `
                <div class="playlist-item-index">${index + 1}</div>
                <div class="playlist-item-info">
                    <div class="playlist-item-name">${song.name}</div>
                    <div class="playlist-item-artist">${song.artist}</div>
                </div>
                <div class="playlist-item-duration">${song.durationFormatted}</div>
            `;
            
            item.addEventListener('click', () => this.loadSong(index));
            this.playlistContainer.appendChild(item);
        });
    }

    loadSong(index) {
        this.currentIndex = index;
        const song = this.playlist[index];
        
        // 切歌时重置用户滚动状态，允许自动滚动
        this.userScrolling = false;
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = null;
        }
        
        // 更新UI
        this.songName.textContent = song.name;
        this.songArtist.textContent = song.artist;
        this.cover.src = song.cover;
        
        // 立即显示数据库中的时长（不等待音频加载）
        this.timeTotal.textContent = this.formatTime(song.duration);
        
        // 更新播放列表高亮
        document.querySelectorAll('.playlist-item').forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // 加载音频 - 支持网易云ID和直链URL
        let musicUrl;
        if (song.url) {
            // 如果 url 字段存在，判断是网易云ID还是直链
            if (/^\d+$/.test(song.url)) {
                // 纯数字，是网易云音乐ID
                musicUrl = `https://music.163.com/song/media/outer/url?id=${song.url}.mp3`;
            } else {
                // 否则是直链URL
                musicUrl = song.url;
            }
        } else {
            // 兼容旧数据，使用 id 字段作为网易云ID
            musicUrl = `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`;
        }
        
        console.log('🎵 加载音乐:', song.name, '| URL:', musicUrl, '| 时长:', song.duration + '秒');
        this.audio.src = musicUrl;
        
        // 加载歌词
        this.loadLyrics(song.lyrics);
        
        // 通知右下角播放器同步
        this.notifyFloatingPlayer();
        
        // 如果正在播放，自动播放下一首
        if (this.isPlaying) {
            this.audio.play().catch(e => {
                console.error('❌ 播放失败:', e);
                console.log('音乐URL:', musicUrl);
            });
        }
    }

    // 通知右下角播放器同步
    notifyFloatingPlayer() {
        if (window.floatingMusicPlayer) {
            window.floatingMusicPlayer.syncWithMainPlayer();
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
            this.playBtn.textContent = '▶';
            this.cover.classList.remove('playing');
            this.isPlaying = false;
        } else {
            this.audio.play().catch(e => {
                console.log('播放失败:', e);
                alert('音乐加载失败，请稍后再试');
            });
            this.playBtn.textContent = '⏸';
            this.cover.classList.add('playing');
            this.isPlaying = true;
        }
    }

    prevSong() {
        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadSong(this.currentIndex);
        if (this.isPlaying) {
            this.audio.play();
        }
    }

    nextSong() {
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.loadSong(this.currentIndex);
        if (this.isPlaying) {
            this.audio.play();
        }
    }

    updateProgress() {
        // 使用数据库中的时长，而不是音频文件的实际时长
        const song = this.playlist[this.currentIndex];
        const duration = song ? song.duration : this.audio.duration;
        
        if (duration) {
            const percent = (this.audio.currentTime / duration) * 100;
            this.progressFill.style.width = percent + '%';
            this.timeCurrent.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateDuration() {
        // 使用数据库中的时长，而不是音频文件的实际时长
        const song = this.playlist[this.currentIndex];
        if (song && song.duration) {
            this.timeTotal.textContent = this.formatTime(song.duration);
        } else {
            this.timeTotal.textContent = this.formatTime(this.audio.duration);
        }
    }

    seek(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        
        // 使用数据库中的时长，而不是音频文件的实际时长
        const song = this.playlist[this.currentIndex];
        const duration = song ? song.duration : this.audio.duration;
        
        this.audio.currentTime = percent * duration;
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    loadLyrics(lyrics) {
        this.lyricsContent.innerHTML = '';
        if (!lyrics || lyrics.length === 0) {
            this.lyricsContent.innerHTML = '<p class="lyrics-line" style="opacity: 0.6;">暂无歌词</p>';
            return;
        }
        
        lyrics.forEach((line, index) => {
            const p = document.createElement('p');
            p.className = 'lyrics-line';
            p.textContent = line.text;
            p.dataset.time = line.time;
            
            // 添加点击事件：点击歌词跳转到对应时间
            p.addEventListener('click', () => {
                if (this.audio && !isNaN(line.time)) {
                    this.audio.currentTime = line.time;
                    // 点击后暂停用户滚动状态，让歌词自动跟随
                    this.userScrolling = false;
                    if (this.scrollTimeout) {
                        clearTimeout(this.scrollTimeout);
                        this.scrollTimeout = null;
                    }
                }
            });
            
            this.lyricsContent.appendChild(p);
        });
    }

    updateLyrics() {
        // 只在歌词面板展开时更新
        if (!this.lyricsContent.classList.contains('expanded')) {
            return;
        }
        
        // 直接使用音频的当前播放时间（歌词时间戳是准确的）
        const currentTime = this.audio.currentTime;
        const lines = this.lyricsContent.querySelectorAll('.lyrics-line');
        
        if (lines.length === 0) {
            return; // 没有歌词，直接返回
        }
        
        // 找到当前应该高亮的歌词行
        let activeLine = null;
        let activeIndex = -1;
        
        lines.forEach((line, index) => {
            const lineTime = parseFloat(line.dataset.time);
            const nextLineTime = lines[index + 1] ? parseFloat(lines[index + 1].dataset.time) : Infinity;
            
            // 判断当前时间是否在这一行的时间范围内
            if (currentTime >= lineTime && currentTime < nextLineTime) {
                line.classList.add('active');
                activeLine = line;
                activeIndex = index;
            } else {
                line.classList.remove('active');
            }
        });
        
        // 为歌词行添加渐变透明度效果
        this.applyLyricsGradient(lines, activeIndex);
        
        // 只有在用户没有手动滚动时，才自动滚动到当前歌词
        if (activeLine && !this.userScrolling) {
            this.scrollToLyric(activeLine);
        }
    }
    
    // 应用歌词渐变透明度效果
    applyLyricsGradient(lines, activeIndex) {
        if (activeIndex === -1) return;
        
        lines.forEach((line, index) => {
            if (index === activeIndex) {
                // 当前歌词：完全不透明
                line.style.opacity = '1';
                line.style.transform = 'scale(1)';
            } else {
                // 计算距离当前歌词的距离
                const distance = Math.abs(index - activeIndex);
                
                // 根据距离计算透明度和缩放
                // 距离越远，透明度越低
                let opacity, scale;
                
                if (distance === 1) {
                    // 紧邻的歌词
                    opacity = index < activeIndex ? 0.5 : 0.7; // 上一句稍暗，下一句稍亮
                    scale = 0.98;
                } else if (distance === 2) {
                    opacity = 0.4;
                    scale = 0.96;
                } else if (distance === 3) {
                    opacity = 0.3;
                    scale = 0.95;
                } else {
                    opacity = 0.25;
                    scale = 0.95;
                }
                
                line.style.opacity = opacity.toString();
                line.style.transform = `scale(${scale})`;
            }
        });
    }
    
    // 平滑滚动到指定歌词
    scrollToLyric(lyricElement) {
        const container = this.lyricsContent;
        const containerHeight = container.clientHeight;
        const lineTop = lyricElement.offsetTop;
        const lineHeight = lyricElement.clientHeight;
        
        // 网易云效果：当前歌词始终居中显示
        // 计算滚动位置，让当前歌词行显示在容器的垂直居中位置
        const targetScroll = lineTop - (containerHeight / 2) + (lineHeight / 2);
        const currentScroll = container.scrollTop;
        
        // 使用平滑动画滚动
        const distance = targetScroll - currentScroll;
        const duration = 300; // 动画持续时间（毫秒）
        const startTime = performance.now();
        
        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用缓动函数（easeOutCubic）
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            container.scrollTop = currentScroll + (distance * easeProgress);
            
            if (progress < 1 && !this.userScrolling) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        requestAnimationFrame(animateScroll);
    }

    // 重置滚动超时（用户停止滚动5秒后，恢复自动滚动）
    resetScrollTimeout() {
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        this.scrollTimeout = setTimeout(() => {
            this.userScrolling = false;
        }, 5000); // 5秒后恢复自动滚动
    }

    toggleLyrics() {
        this.lyricsContent.classList.toggle('expanded');
        if (this.lyricsContent.classList.contains('expanded')) {
            this.lyricsToggle.textContent = '收起';
            // 展开时，确保允许自动滚动
            this.userScrolling = false;
            // 等待CSS过渡动画完成后（300ms），立即滚动到当前歌词
            setTimeout(() => {
                this.updateLyrics();
            }, 350);
        } else {
            this.lyricsToggle.textContent = '展开';
        }
    }
}

// 初始化主音乐播放器
let mainMusicPlayerInstance = null;

function initMusicPlayer() {
    if (window.blogDataStore) {
        mainMusicPlayerInstance = new MainMusicPlayer();
        window.mainMusicPlayerInstance = mainMusicPlayerInstance;
        console.log('🎵 音乐播放器已初始化，播放列表:', mainMusicPlayerInstance.playlist.length, '首');
        return true;
    }
    return false;
}

document.addEventListener('DOMContentLoaded', function() {
    // 等待数据存储加载完成
    function tryInit() {
        if (!initMusicPlayer()) {
            setTimeout(tryInit, 100);
        }
    }
    
    // 监听数据适配器就绪事件
    document.addEventListener('dataAdapterReady', function() {
        if (!mainMusicPlayerInstance) {
            initMusicPlayer();
        }
    });
    
    tryInit();
});
