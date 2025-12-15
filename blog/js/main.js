// 名言警句库
const quotes = [
    "生活不止眼前的苟且，还有诗和远方的田野。",
    "世界上只有一种真正的英雄主义，那就是认清生活的真相后依然热爱生活。",
    "你所浪费的今天，是昨天死去的人奢望的明天。",
    "不要因为走得太远，而忘记为什么出发。",
    "人生天地之间，若白驹过隙，忽然而已。",
    "愿你历尽千帆，归来仍是少年。",
    "山川是不卷收的文章，日月为你掌灯伴读。",
    "纵有疾风起，人生不言弃。",
    "星光不问赶路人，时光不负有心人。",
    "心之所向，素履以往，生如逆旅，一苇以航。",
    "世间所有的相遇，都是久别重逢。",
    "愿你走出半生，归来仍是少年。",
    "人间值得，未来可期。",
    "慢慢来，比较快。",
    "凡是过往，皆为序章。"
];

// 随机显示名言警句
function displayRandomQuote() {
    const quoteElement = document.getElementById('quoteText');
    if (quoteElement) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteElement.textContent = quotes[randomIndex];
        quoteElement.style.opacity = '0';
        setTimeout(() => {
            quoteElement.style.opacity = '0.8';
        }, 100);
    }
}

// 背景切换功能
let currentSlide = 0;
const totalSlides = 7;
let backgroundImages = [];

// 从 images 文件夹获取背景图片（固定路径）
function loadBackgroundImages() {
    // 只从 images 文件夹获取固定的背景图片
    const imageFiles = [
        'images/bg-1.png',
        'images/bg-2.png',
        'images/bg-3.png',
        'images/bg-4.png',
        'images/bg-5.png',
        'images/bg-6.png',
        'images/bg-7.png'
    ];
    
    // 随机打乱顺序
    backgroundImages = imageFiles.sort(() => Math.random() - 0.5);
    
    console.log('🖼️ 已加载背景图片:', backgroundImages.length, '张');
}

function changeBackground(slideIndex) {
    const welcomeSection = document.getElementById('welcome');
    const indicators = document.querySelectorAll('.indicator');
    
    // 如果welcome元素不存在（不在首页），直接返回
    if (!welcomeSection) return;
    
    // 设置背景图片
    if (backgroundImages[slideIndex]) {
        welcomeSection.style.backgroundImage = `url('${backgroundImages[slideIndex]}')`;
        welcomeSection.style.backgroundSize = 'cover';
        welcomeSection.style.backgroundPosition = 'center';
        welcomeSection.style.backgroundRepeat = 'no-repeat';
    } else {
        // 使用渐变背景作为后备
        const gradients = [
            'linear-gradient(135deg, #87CEEB 0%, #98D8C8 50%, #F7DC6F 100%)',
            'linear-gradient(135deg, #FFB6C1 0%, #FFA07A 50%, #FFE4B5 100%)',
            'linear-gradient(135deg, #B0E0E6 0%, #87CEEB 50%, #E0F6FF 100%)',
            'linear-gradient(135deg, #98FB98 0%, #90EE90 50%, #F0FFF0 100%)',
            'linear-gradient(135deg, #DDA0DD 0%, #DA70D6 50%, #F8E8FF 100%)',
            'linear-gradient(135deg, #F0E68C 0%, #FFD700 50%, #FFF8DC 100%)',
            'linear-gradient(135deg, #FFA07A 0%, #FF7F50 50%, #FFE4E1 100%)'
        ];
        welcomeSection.style.backgroundImage = gradients[slideIndex];
    }
    
    // 更新指示器
    indicators.forEach((indicator, index) => {
        if (index === slideIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
    
    currentSlide = slideIndex;
}

// 平滑滚动功能
document.addEventListener('DOMContentLoaded', function() {
    // 加载背景图片
    loadBackgroundImages();
    
    // 初始化背景
    changeBackground(0);
    
    // 初始化随机名言
    displayRandomQuote();
    
    // 上一张按钮（仅在首页）
    const prevBtn = document.getElementById('prevSlide');
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            changeBackground(currentSlide);
        });
    }
    
    // 下一张按钮（仅在首页）
    const nextBtn = document.getElementById('nextSlide');
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentSlide = (currentSlide + 1) % totalSlides;
            changeBackground(currentSlide);
        });
    }
    
    // 指示器点击（仅在首页）
    const indicators = document.querySelectorAll('.indicator');
    if (indicators.length > 0) {
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', function() {
                changeBackground(index);
            });
        });
    }
    
    // 键盘左右键切换（仅在首页）
    const welcomeSection = document.getElementById('welcome');
    if (welcomeSection) {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                changeBackground(currentSlide);
            } else if (e.key === 'ArrowRight') {
                currentSlide = (currentSlide + 1) % totalSlides;
                changeBackground(currentSlide);
            }
        });
    }
    
    // 触摸滑动支持（移动端，仅在首页）
    const welcomeSectionForTouch = document.getElementById('welcome');
    if (welcomeSectionForTouch) {
        let touchStartX = 0;
        let touchEndX = 0;
        
        welcomeSectionForTouch.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        welcomeSectionForTouch.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            if (touchEndX < touchStartX - 50) {
                // 向左滑动
                currentSlide = (currentSlide + 1) % totalSlides;
                changeBackground(currentSlide);
            }
            if (touchEndX > touchStartX + 50) {
                // 向右滑动
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                changeBackground(currentSlide);
            }
        }
    }
    // 点击滚动指示器时平滑滚动到主内容
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const mainContent = document.querySelector('.main-content');
    
    if (scrollIndicator && mainContent) {
        scrollIndicator.addEventListener('click', function() {
            mainContent.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // 监听滚动事件，控制导航栏显示（仅在首页）
    const header = document.querySelector('.site-header');
    const welcomeSectionEl = document.querySelector('.welcome-section');
    
    if (header && welcomeSectionEl) {
        const welcomeSectionHeight = welcomeSectionEl.offsetHeight;
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            // 当滚动超过欢迎页面高度的50%时，显示导航栏
            if (currentScroll > welcomeSectionHeight * 0.5) {
                header.classList.add('visible');
            } else {
                header.classList.remove('visible');
            }
            
            // 根据滚动位置调整阴影
            if (currentScroll > welcomeSectionHeight) {
                header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            } else {
                header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            }
        });
    }
    
    // 为所有导航链接添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});


// 右下角音乐播放器功能（与主播放器联动）
class MusicPlayer {
    constructor() {
        this.mainPlayer = null; // 主播放器实例引用
        this.init();
    }

    init() {
        // 绑定DOM元素
        this.playerToggle = document.getElementById('playerToggle');
        this.playerContent = document.getElementById('playerContent');
        this.playerClose = document.getElementById('playerClose');
        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.timeCurrent = document.getElementById('timeCurrent');
        this.timeTotal = document.getElementById('timeTotal');
        this.songName = document.getElementById('songName');
        this.songArtist = document.getElementById('songArtist');
        this.playerCover = document.getElementById('playerCover');

        // 检查关键元素是否存在
        if (!this.playerToggle || !this.playBtn) {
            console.warn('音乐播放器关键元素缺失，跳过事件绑定');
            return;
        }

        // 绑定事件（添加null检查）
        if (this.playerToggle) this.playerToggle.addEventListener('click', () => this.togglePlayer());
        if (this.playerClose) this.playerClose.addEventListener('click', () => this.closePlayer());
        if (this.playBtn) this.playBtn.addEventListener('click', () => this.togglePlay());
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevSong());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSong());
        if (this.progressBar) this.progressBar.addEventListener('click', (e) => this.seek(e));

        // 等待主播放器初始化
        this.waitForMainPlayer();
    }

    // 等待主播放器初始化完成
    waitForMainPlayer() {
        const checkMainPlayer = () => {
            if (window.mainMusicPlayerInstance) {
                this.mainPlayer = window.mainMusicPlayerInstance;
                this.syncWithMainPlayer();
                console.log('🔗 右下角播放器已与主播放器联动');
                
                // 监听主播放器的音频事件，同步UI
                this.mainPlayer.audio.addEventListener('timeupdate', () => this.updateProgress());
                this.mainPlayer.audio.addEventListener('loadedmetadata', () => this.updateDuration());
                this.mainPlayer.audio.addEventListener('play', () => this.onMainPlayerPlay());
                this.mainPlayer.audio.addEventListener('pause', () => this.onMainPlayerPause());
                this.mainPlayer.audio.addEventListener('ended', () => this.onMainPlayerPause());
            } else {
                setTimeout(checkMainPlayer, 100);
            }
        };
        checkMainPlayer();
    }

    // 与主播放器同步
    syncWithMainPlayer() {
        if (!this.mainPlayer) return;
        
        const currentSong = this.mainPlayer.playlist[this.mainPlayer.currentIndex];
        if (currentSong) {
            this.songName.textContent = currentSong.name;
            this.songArtist.textContent = currentSong.artist;
            this.playerCover.src = currentSong.cover;
        }
        
        // 同步播放状态
        if (this.mainPlayer.isPlaying) {
            this.playBtn.textContent = '⏸';
        } else {
            this.playBtn.textContent = '▶';
        }
    }

    // 主播放器开始播放时
    onMainPlayerPlay() {
        this.playBtn.textContent = '⏸';
        this.syncWithMainPlayer();
    }

    // 主播放器暂停时
    onMainPlayerPause() {
        this.playBtn.textContent = '▶';
    }

    togglePlayer() {
        this.playerContent.classList.toggle('active');
    }

    closePlayer() {
        this.playerContent.classList.remove('active');
    }

    togglePlay() {
        if (!this.mainPlayer) return;
        this.mainPlayer.togglePlay();
    }

    prevSong() {
        if (!this.mainPlayer) return;
        this.mainPlayer.prevSong();
        this.syncWithMainPlayer();
    }

    nextSong() {
        if (!this.mainPlayer) return;
        this.mainPlayer.nextSong();
        this.syncWithMainPlayer();
    }

    updateProgress() {
        if (!this.mainPlayer) return;
        
        // 使用数据库中的时长，而不是音频文件的实际时长
        const song = this.mainPlayer.playlist[this.mainPlayer.currentIndex];
        const duration = song ? song.duration : this.mainPlayer.audio.duration;
        
        if (duration) {
            const percent = (this.mainPlayer.audio.currentTime / duration) * 100;
            this.progressFill.style.width = percent + '%';
            this.timeCurrent.textContent = this.formatTime(this.mainPlayer.audio.currentTime);
        }
    }

    updateDuration() {
        if (!this.mainPlayer) return;
        
        // 使用数据库中的时长，而不是音频文件的实际时长
        const song = this.mainPlayer.playlist[this.mainPlayer.currentIndex];
        if (song && song.duration) {
            this.timeTotal.textContent = this.formatTime(song.duration);
        } else {
            this.timeTotal.textContent = this.formatTime(this.mainPlayer.audio.duration);
        }
    }

    seek(e) {
        if (!this.mainPlayer) return;
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        
        // 使用数据库中的时长，而不是音频文件的实际时长
        const song = this.mainPlayer.playlist[this.mainPlayer.currentIndex];
        const duration = song ? song.duration : this.mainPlayer.audio.duration;
        
        this.mainPlayer.audio.currentTime = percent * duration;
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

// 初始化右下角音乐播放器
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否应该跳过音乐播放器初始化
    if (window.skipMusicPlayer) {
        console.log('⏭️ 跳过音乐播放器初始化');
        return;
    }
    
    // 检查必要的DOM元素是否存在
    const requiredElements = ['playerToggle', 'playBtn', 'prevBtn', 'nextBtn'];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.log('⏭️ 音乐播放器DOM元素不完整，跳过初始化:', missingElements);
        return;
    }
    
    try {
        const musicPlayer = new MusicPlayer();
        window.floatingMusicPlayer = musicPlayer; // 暴露到全局，方便调试
    } catch (error) {
        console.error('音乐播放器初始化失败:', error);
    }
});


// ========== 加载头像 ==========
async function loadSiteAvatar() {
    try {
        console.log('🖼️ 开始加载头像...');
        
        // 等待数据存储系统初始化
        if (!window.blogDataStore) {
            console.warn('⚠️ blogDataStore 未初始化，等待中...');
            // 延迟重试
            setTimeout(loadSiteAvatar, 200);
            return;
        }
        
        const settings = await window.blogDataStore.getSettings();
        console.log('📋 获取到设置:', settings);
        
        if (settings && settings.avatar) {
            const avatarEl = document.getElementById('siteAvatar');
            if (avatarEl) {
                console.log('✅ 设置头像:', settings.avatar);
                avatarEl.src = settings.avatar;
                
                // 添加加载错误处理
                avatarEl.onerror = function() {
                    console.warn('⚠️ 头像加载失败，使用默认头像');
                    this.src = 'https://ui-avatars.com/api/?name=执念&size=200&background=4fc3f7&color=fff&bold=true';
                };
            } else {
                console.warn('⚠️ 未找到头像元素 #siteAvatar');
            }
        } else {
            console.log('ℹ️ 未设置头像，使用默认头像');
        }
    } catch (error) {
        console.error('❌ 加载头像失败:', error);
    }
}

// 页面加载时加载头像
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 页面加载完成，准备加载头像');
    setTimeout(loadSiteAvatar, 100);
});
