/* ========================================
   背景音乐生成器
   使用Web Audio API生成简单的背景音乐
   ======================================== */

// 由于无法直接提供MP3文件，这里提供一个使用Web Audio API生成音乐的方案
// 在实际使用中，你可以替换为真实的MP3文件

class MusicGenerator {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.gainNode = null;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = 0.3; // 音量30%
        }
    }

    // 播放一个音符
    playNote(frequency, duration, startTime) {
        const oscillator = this.audioContext.createOscillator();
        const noteGain = this.audioContext.createGain();

        oscillator.connect(noteGain);
        noteGain.connect(this.gainNode);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        // 音符淡入淡出
        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        noteGain.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }

    // 播放旋律
    playMelody() {
        this.init();

        // 简单的旋律（C大调音阶）
        const notes = [
            { freq: 523.25, duration: 0.3 }, // C5
            { freq: 587.33, duration: 0.3 }, // D5
            { freq: 659.25, duration: 0.3 }, // E5
            { freq: 698.46, duration: 0.3 }, // F5
            { freq: 783.99, duration: 0.3 }, // G5
            { freq: 880.00, duration: 0.3 }, // A5
            { freq: 987.77, duration: 0.3 }, // B5
            { freq: 1046.50, duration: 0.6 }, // C6
        ];

        let currentTime = this.audioContext.currentTime;

        // 循环播放旋律
        const playLoop = () => {
            if (!this.isPlaying) return;

            notes.forEach((note, index) => {
                const startTime = currentTime + index * 0.4;
                this.playNote(note.freq, note.duration, startTime);
            });

            currentTime += notes.length * 0.4;

            // 每隔一段时间重复
            setTimeout(playLoop, notes.length * 400);
        };

        this.isPlaying = true;
        playLoop();
    }

    start() {
        if (!this.isPlaying) {
            this.playMelody();
        }
    }

    stop() {
        this.isPlaying = false;
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    setVolume(volume) {
        if (this.gainNode) {
            this.gainNode.gain.value = volume;
        }
    }
}

// 导出
window.MusicGenerator = MusicGenerator;
