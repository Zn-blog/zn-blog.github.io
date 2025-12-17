// 媒体数据同步脚本
// 用于同步后台管理的音乐和视频数据到前台播放器

// 同步音乐播放列表（异步）
async function syncMusicPlaylist() {
    if (!window.blogDataStore) return [];
    
    const music = await window.blogDataStore.getMusic();
    return music.map(m => ({
        id: m.id.toString(),
        name: m.name,
        artist: m.artist,
        duration: formatDuration(m.duration),
        cover: m.cover,
        url: m.url,
        lyrics: parseLyrics(m.lrc || '')
    }));
}

// 同步视频播放列表（异步）
async function syncVideoPlaylist() {
    if (!window.blogDataStore) return [];
    
    const videos = await window.blogDataStore.getVideos();
    return videos.map(v => ({
        id: v.id.toString(),
        name: v.name,
        cover: v.cover,
        url: v.url,
        description: v.description || ''
    }));
}

// 解析 LRC 歌词
function parseLyrics(lrc) {
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
function formatDuration(seconds) {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 更新音乐播放器
function updateMusicPlayer() {
    // 等待音乐播放器实例加载
    if (window.mainMusicPlayerInstance) {
        const beforeCount = window.mainMusicPlayerInstance.playlist.length;
        window.mainMusicPlayerInstance.refreshPlaylist();
        const afterCount = window.mainMusicPlayerInstance.playlist.length;
        console.log('🔄 音乐播放列表已更新:', beforeCount, '→', afterCount, '首');
        return true;
    }
    return false;
}

// 更新视频播放器
function updateVideoPlayer() {
    // 等待视频播放器实例加载
    if (window.videoPlayerInstance) {
        const beforeCount = window.videoPlayerInstance.playlist.length;
        window.videoPlayerInstance.refreshPlaylist();
        const afterCount = window.videoPlayerInstance.playlist.length;
        console.log('🔄 视频播放列表已更新:', beforeCount, '→', afterCount, '个');
        return true;
    }
    return false;
}

// 自动同步
document.addEventListener('DOMContentLoaded', function() {
    // 等待数据存储和播放器加载完成
    function trySync() {
        if (window.blogDataStore && window.blogDataStore.adapter) {
            const musicSynced = updateMusicPlayer();
            const videoSynced = updateVideoPlayer();
            
            if (musicSynced && videoSynced) {
                console.log('✅ 媒体同步完成');
                return;
            }
        }
        setTimeout(trySync, 100);
    }
    
    // 监听数据适配器就绪事件
    document.addEventListener('dataAdapterReady', function() {
        setTimeout(trySync, 200);
    });
    
    setTimeout(trySync, 200);
});

// 导出函数供其他脚本使用
window.mediaSync = {
    syncMusicPlaylist,
    syncVideoPlaylist,
    updateMusicPlayer,
    updateVideoPlayer
};
