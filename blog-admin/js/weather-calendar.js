// 天气和日历管理
class WeatherCalendarManager {
    constructor() {
        this.weatherContainer = null;
        this.calendarContainer = null;
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.currentCity = localStorage.getItem('selectedCity') || '北京';
        this.events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
        this.currentEventIndex = 0;
        this.cities = [
            '北京', '上海', '广州', '深圳', '成都', '杭州', '重庆', '武汉',
            '西安', '苏州', '天津', '南京', '长沙', '郑州', '东莞', '青岛',
            '沈阳', '宁波', '昆明', '大连', '厦门', '合肥', '佛山', '福州',
            '哈尔滨', '济南', '温州', '南宁', '长春', '泉州', '石家庄', '贵阳'
        ];
        this.init();
    }

    init() {
        this.weatherContainer = document.getElementById('weatherInfo');
        this.calendarContainer = document.getElementById('calendarInfo');
        
        if (this.weatherContainer) {
            this.loadWeather();
        }
        
        if (this.calendarContainer) {
            this.renderCalendar();
        }
        
        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.city-selector')) {
                this.closeCityDropdown();
            }
        });
    }

    // 天气模块
    async loadWeather() {
        try {
            this.fetchWeatherByCity(this.currentCity);
        } catch (error) {
            console.error('获取天气失败:', error);
            this.showMockWeather();
        }
    }

    changeCity(city) {
        this.currentCity = city;
        localStorage.setItem('selectedCity', city);
        this.closeCityDropdown();
        this.loadWeather();
    }

    toggleCityDropdown() {
        const dropdown = document.getElementById('cityDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    closeCityDropdown() {
        const dropdown = document.getElementById('cityDropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }

    filterCities(searchText) {
        const cityList = document.getElementById('cityList');
        if (!cityList) return;
        
        const filtered = this.cities.filter(city => 
            city.toLowerCase().includes(searchText.toLowerCase())
        );
        
        this.renderCityList(filtered);
    }

    async fetchWeatherByCity(city) {
        try {
            // 方案1: 使用高德地图天气API（推荐）
            // 需要申请key: https://console.amap.com/dev/key/app
            // const adcode = await this.getCityAdcode(city);
            // const response = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?city=${adcode}&key=你的高德key`);
            
            // 方案2: 使用和风天气API（免费版）
            // 需要申请key: https://dev.qweather.com
            // const location = await this.getCityLocation(city);
            // const response = await fetch(`https://devapi.qweather.com/v7/weather/now?location=${location}&key=你的和风key`);
            
            // 方案3: 使用免费的天气API（无需key，但可能不稳定）
            const response = await fetch(`https://api.vvhan.com/api/weather?city=${encodeURIComponent(city)}`);
            const result = await response.json();
            console.log('天气数据:', result);
            
            if (result.success && result.data) {
                // 转换数据格式
                const weatherData = {
                    city: result.data.city || city,
                    temperature: result.data.tem || result.data.temperature || '25',
                    weather: result.data.wea || result.data.weather || '晴',
                    tips: result.data.air_tips || result.data.tips || '天气不错',
                    humidity: result.data.humidity || '60',
                    wind: result.data.win_speed || result.data.wind || '3',
                    air: result.data.air_level || result.data.air || '良'
                };
                this.renderWeather(weatherData);
                // 获取24小时天气数据
                this.fetch24HourWeather(city);
            } else {
                console.warn('天气API返回数据格式异常，使用模拟数据');
                this.showMockWeather();
            }
        } catch (error) {
            console.error('获取天气API失败:', error);
            this.showMockWeather();
        }
    }
    
    // 高德地图：获取城市adcode
    async getCityAdcode(cityName) {
        // 城市adcode映射表（部分常用城市）
        const cityAdcodes = {
            '北京': '110000', '上海': '310000', '广州': '440100', '深圳': '440300',
            '成都': '510100', '杭州': '330100', '重庆': '500000', '武汉': '420100',
            '西安': '610100', '苏州': '320500', '天津': '120000', '南京': '320100',
            '长沙': '430100', '郑州': '410100', '东莞': '441900', '青岛': '370200',
            '沈阳': '210100', '宁波': '330200', '昆明': '530100', '大连': '210200'
        };
        return cityAdcodes[cityName] || '110000'; // 默认返回北京
    }
    
    // 和风天气：获取城市location ID
    async getCityLocation(cityName) {
        // 可以通过和风天气的城市搜索API获取
        // 这里简化处理，直接使用城市名
        return cityName;
    }

    async fetch24HourWeather(city) {
        // 生成模拟的24小时天气数据
        const hourlyData = this.generateMock24HourData();
        this.render24HourChart(hourlyData);
    }

    generateMock24HourData() {
        const now = new Date();
        const data = [];
        const baseTemp = 20 + Math.random() * 10;
        
        for (let i = 0; i < 24; i++) {
            const hour = (now.getHours() + i) % 24;
            // 模拟温度变化：白天高，夜晚低
            let temp = baseTemp;
            if (hour >= 6 && hour <= 18) {
                temp += Math.sin((hour - 6) / 12 * Math.PI) * 5;
            } else {
                temp -= 3;
            }
            temp += (Math.random() - 0.5) * 2;
            
            data.push({
                hour: hour,
                temp: Math.round(temp),
                weather: hour >= 6 && hour <= 18 ? '☀️' : '🌙'
            });
        }
        
        return data;
    }

    async fetchWeatherByCoords(lat, lon) {
        // 使用坐标获取天气（可以调用其他API）
        this.fetchWeatherByCity('当前位置');
    }

    renderWeather(data) {
        const weatherIcons = {
            '晴': '☀️',
            '多云': '⛅',
            '阴': '☁️',
            '雨': '🌧️',
            '雪': '❄️',
            '雷': '⛈️'
        };

        const icon = weatherIcons[data.weather] || '🌤️';
        
        // 生成动态背景
        const backgroundHTML = this.generateWeatherBackground(data.weather);
        
        const html = `
            ${backgroundHTML}
            <div class="weather-main">
                <div class="weather-icon">${icon}</div>
                <div class="weather-info">
                    <div class="weather-city">
                        <div class="city-selector">
                            <span class="weather-city-name" onclick="weatherCalendarManager.toggleCityDropdown()">
                                📍 ${data.city || this.currentCity}
                            </span>
                            <div id="cityDropdown" class="city-dropdown">
                                <input type="text" 
                                       class="city-search" 
                                       placeholder="搜索城市..." 
                                       oninput="weatherCalendarManager.filterCities(this.value)"
                                       onclick="event.stopPropagation()">
                                <div id="cityList" class="city-list">
                                    ${this.renderCityListHTML()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="weather-temp">${data.temperature || data.temp || '25'}°C</div>
                    <div class="weather-desc">${data.weather || '晴'} · ${data.tips || '天气不错'}</div>
                </div>
            </div>
            <div class="weather-details">
                <div class="weather-detail-item">
                    <div class="weather-detail-label">湿度</div>
                    <div class="weather-detail-value">${data.humidity || '60'}%</div>
                </div>
                <div class="weather-detail-item">
                    <div class="weather-detail-label">风力</div>
                    <div class="weather-detail-value">${data.wind || '3'}级</div>
                </div>
                <div class="weather-detail-item">
                    <div class="weather-detail-label">空气</div>
                    <div class="weather-detail-value">${data.air || '良'}</div>
                </div>
            </div>
            <div class="weather-chart">
                <div class="weather-chart-title">📈 24小时温度趋势</div>
                <div class="weather-chart-container">
                    <div id="weatherChart" class="weather-chart-canvas">
                        <div class="loading-text" style="padding: 2rem;">加载中...</div>
                    </div>
                </div>
            </div>
        `;
        
        this.weatherContainer.innerHTML = html;
    }

    render24HourChart(data) {
        const chartContainer = document.getElementById('weatherChart');
        if (!chartContainer || !data || data.length === 0) return;

        // 计算温度范围
        const temps = data.map(d => d.temp);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        const tempRange = maxTemp - minTemp || 10;

        // 创建SVG路径
        const width = 600;
        const height = 80;
        const pointWidth = width / (data.length - 1);

        let pathData = '';
        const points = data.map((item, index) => {
            const x = index * pointWidth;
            const y = height - ((item.temp - minTemp) / tempRange) * height;
            
            if (index === 0) {
                pathData = `M ${x} ${y}`;
            } else {
                pathData += ` L ${x} ${y}`;
            }
            
            return { x, y, temp: item.temp, hour: item.hour };
        });

        // 生成HTML
        let html = `
            <svg class="weather-chart-svg" viewBox="0 0 ${width} ${height}">
                <defs>
                    <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <path class="weather-chart-path" d="${pathData}" />
            </svg>
            <div class="weather-chart-line">
        `;

        // 添加温度点
        points.forEach(point => {
            html += `
                <div class="weather-chart-point" 
                     style="left: ${point.x}px; top: ${point.y}px;"
                     data-temp="${point.temp}°"
                     title="${point.hour}:00 - ${point.temp}°C">
                </div>
            `;
        });

        html += `</div><div class="weather-chart-labels">`;

        // 添加时间标签（每3小时显示一次）
        data.forEach((item, index) => {
            if (index % 3 === 0) {
                html += `<div class="weather-chart-label">${item.hour}:00</div>`;
            }
        });

        html += `</div>`;

        chartContainer.innerHTML = html;
    }

    renderCityListHTML() {
        return this.cities.map(city => `
            <div class="city-item ${city === this.currentCity ? 'active' : ''}" 
                 onclick="weatherCalendarManager.changeCity('${city}')">
                ${city}
            </div>
        `).join('');
    }

    renderCityList(cities) {
        const cityList = document.getElementById('cityList');
        if (!cityList) return;
        
        cityList.innerHTML = cities.map(city => `
            <div class="city-item ${city === this.currentCity ? 'active' : ''}" 
                 onclick="weatherCalendarManager.changeCity('${city}')">
                ${city}
            </div>
        `).join('');
    }

    generateWeatherBackground(weather) {
        let bgClass = 'weather-bg-sunny';
        let effects = '';

        if (weather.includes('晴')) {
            bgClass = 'weather-bg-sunny';
            effects = this.generateSunRays();
        } else if (weather.includes('云') || weather.includes('阴')) {
            bgClass = 'weather-bg-cloudy';
            effects = this.generateClouds();
        } else if (weather.includes('雨') || weather.includes('雷')) {
            bgClass = 'weather-bg-rainy';
            effects = this.generateRain();
        } else if (weather.includes('雪')) {
            bgClass = 'weather-bg-snowy';
            effects = this.generateSnow();
        }

        return `<div class="weather-background ${bgClass}">${effects}</div>`;
    }

    generateSunRays() {
        let html = '<div class="sun-rays">';
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30);
            html += `<div class="sun-ray" style="transform: rotate(${angle}deg) translateX(-2px);"></div>`;
        }
        html += '</div>';
        return html;
    }

    generateClouds() {
        let html = '';
        for (let i = 0; i < 3; i++) {
            const top = 20 + Math.random() * 60;
            const width = 80 + Math.random() * 40;
            const height = 30 + Math.random() * 20;
            const duration = 30 + Math.random() * 20;
            const delay = Math.random() * 10;
            
            html += `
                <div class="cloud" style="
                    width: ${width}px;
                    height: ${height}px;
                    top: ${top}%;
                    animation-duration: ${duration}s;
                    animation-delay: ${delay}s;
                "></div>
            `;
        }
        return html;
    }

    generateRain() {
        let html = '';
        for (let i = 0; i < 50; i++) {
            const left = Math.random() * 100;
            const duration = 0.5 + Math.random() * 0.5;
            const delay = Math.random() * 2;
            
            html += `
                <div class="rain-drop" style="
                    left: ${left}%;
                    animation-duration: ${duration}s;
                    animation-delay: ${delay}s;
                "></div>
            `;
        }
        return html;
    }

    generateSnow() {
        let html = '';
        for (let i = 0; i < 30; i++) {
            const left = Math.random() * 100;
            const size = 5 + Math.random() * 10;
            const duration = 3 + Math.random() * 3;
            const delay = Math.random() * 5;
            
            html += `
                <div class="snow-flake" style="
                    left: ${left}%;
                    width: ${size}px;
                    height: ${size}px;
                    animation-duration: ${duration}s;
                    animation-delay: ${delay}s;
                "></div>
            `;
        }
        return html;
    }

    showMockWeather() {
        const mockData = {
            city: this.currentCity,
            temperature: '25',
            weather: '晴',
            tips: '天气不错，适合出行',
            humidity: '60',
            wind: '3',
            air: '良'
        };
        this.renderWeather(mockData);
        // 显示模拟的24小时数据
        const hourlyData = this.generateMock24HourData();
        this.render24HourChart(hourlyData);
    }

    // 日历模块
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        
        const firstDayWeek = firstDay.getDay();
        const lastDate = lastDay.getDate();
        const prevLastDate = prevLastDay.getDate();
        
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                           '七月', '八月', '九月', '十月', '十一月', '十二月'];
        
        let html = `
            <div class="calendar-header">
                <div class="calendar-month">${year}年 ${monthNames[month]}</div>
                <div class="calendar-nav">
                    <button onclick="weatherCalendarManager.prevMonth()">‹</button>
                    <button onclick="weatherCalendarManager.nextMonth()">›</button>
                </div>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day-header">日</div>
                <div class="calendar-day-header">一</div>
                <div class="calendar-day-header">二</div>
                <div class="calendar-day-header">三</div>
                <div class="calendar-day-header">四</div>
                <div class="calendar-day-header">五</div>
                <div class="calendar-day-header">六</div>
        `;
        
        // 上个月的日期
        for (let i = firstDayWeek - 1; i >= 0; i--) {
            html += `<div class="calendar-day other-month">${prevLastDate - i}</div>`;
        }
        
        // 当前月的日期
        const today = new Date();
        for (let i = 1; i <= lastDate; i++) {
            const isToday = year === today.getFullYear() && 
                           month === today.getMonth() && 
                           i === today.getDate();
            const isSelected = year === this.selectedDate.getFullYear() && 
                              month === this.selectedDate.getMonth() && 
                              i === this.selectedDate.getDate();
            
            const classes = ['calendar-day'];
            if (isToday) classes.push('today');
            if (isSelected) classes.push('selected');
            
            html += `<div class="${classes.join(' ')}" onclick="weatherCalendarManager.selectDate(${year}, ${month}, ${i})">${i}</div>`;
        }
        
        // 下个月的日期
        const remainingDays = 42 - (firstDayWeek + lastDate);
        for (let i = 1; i <= remainingDays; i++) {
            html += `<div class="calendar-day other-month">${i}</div>`;
        }
        
        html += `</div>`;
        
        // 添加日期信息
        const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const selectedWeekDay = weekDays[this.selectedDate.getDay()];
        
        html += `
            <div class="calendar-info">
                <div class="calendar-date-info">
                    ${this.selectedDate.getFullYear()}年${this.selectedDate.getMonth() + 1}月${this.selectedDate.getDate()}日 ${selectedWeekDay}
                </div>
                <div class="calendar-lunar">农历信息</div>
            </div>
        `;
        
        this.calendarContainer.innerHTML = html;
        this.renderEvents();
    }

    renderEvents() {
        const eventsList = document.getElementById('eventsList');
        const container = document.getElementById('eventsListContainer');
        
        if (!eventsList) return;

        // 停止之前的自动滚动
        if (this.autoScrollInterval) {
            cancelAnimationFrame(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }

        // 按时间排序
        const sortedEvents = [...this.events].sort((a, b) => new Date(a.date) - new Date(b.date));

        if (sortedEvents.length === 0) {
            eventsList.innerHTML = '<div style="text-align: center; color: #999; padding: 2rem;">暂无事项</div>';
            return;
        }

        const html = sortedEvents.map((event, index) => {
            const countdown = this.calculateCountdown(event.date);
            const priorityClass = event.priority || 'low';
            const completedClass = event.completed ? 'completed' : '';
            
            return `
                <div class="event-item priority-${priorityClass} ${completedClass}">
                    <div class="event-header">
                        <div class="event-title">${event.title}</div>
                        <span class="event-priority ${priorityClass}">
                            ${priorityClass === 'high' ? '重要' : priorityClass === 'medium' ? '一般' : '普通'}
                        </span>
                    </div>
                    <div class="event-body">${event.description || '无描述'}</div>
                    <div class="event-footer">
                        <div class="event-countdown ${countdown.urgent ? 'urgent' : ''}">${countdown.text}</div>
                        <div class="event-actions">
                            <button class="event-action-btn" onclick="weatherCalendarManager.toggleEventComplete(${index})" title="${event.completed ? '标记未完成' : '标记完成'}">
                                ${event.completed ? '↩️' : '✅'}
                            </button>
                            <button class="event-action-btn" onclick="weatherCalendarManager.deleteEvent(${index})" title="删除">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        eventsList.innerHTML = html;
        
        // 检查是否需要自动滚动
        setTimeout(() => {
            if (container && eventsList) {
                const containerHeight = container.offsetHeight;
                const listHeight = eventsList.scrollHeight;
                
                // 如果内容超出容器，启动自动滚动
                if (listHeight > containerHeight) {
                    this.startAutoScroll(container);
                }
            }
        }, 100);
    }

    startAutoScroll(container) {
        if (!container) {
            console.log('❌ 容器不存在');
            return;
        }
        
        // 停止之前的滚动
        if (this.autoScrollInterval) {
            cancelAnimationFrame(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
        
        // 检查是否真的需要滚动
        const maxScroll = container.scrollHeight - container.clientHeight;
        console.log(`📊 容器高度: ${container.clientHeight}px, 内容高度: ${container.scrollHeight}px, 可滚动: ${maxScroll}px`);
        
        if (maxScroll <= 0) {
            console.log('⚠️ 内容未超出容器，不需要滚动');
            return;
        }
        
        console.log('✅ 启动自动滚动');
        
        let direction = 1; // 1: 向下, -1: 向上
        let isPaused = false;
        const speed = 1; // 滚动速度（像素/帧）
        
        // 移除旧的事件监听器（如果存在）
        if (this.scrollMouseEnter) {
            container.removeEventListener('mouseenter', this.scrollMouseEnter);
        }
        if (this.scrollMouseLeave) {
            container.removeEventListener('mouseleave', this.scrollMouseLeave);
        }
        
        // 创建新的事件监听器
        this.scrollMouseEnter = () => {
            isPaused = true;
            console.log('🖱️ 鼠标悬停，暂停滚动');
        };
        
        this.scrollMouseLeave = () => {
            isPaused = false;
            console.log('🖱️ 鼠标离开，恢复滚动');
        };
        
        container.addEventListener('mouseenter', this.scrollMouseEnter);
        container.addEventListener('mouseleave', this.scrollMouseLeave);
        
        let frameCount = 0;
        
        const scroll = () => {
            if (!isPaused && container) {
                const maxScroll = container.scrollHeight - container.clientHeight;
                const currentScroll = container.scrollTop;
                
                // 每100帧输出一次调试信息
                if (frameCount % 100 === 0) {
                    console.log(`📊 scrollHeight: ${container.scrollHeight}px, clientHeight: ${container.clientHeight}px, maxScroll: ${maxScroll}px, current: ${currentScroll.toFixed(1)}px, direction: ${direction === 1 ? '↓' : '↑'}`);
                }
                frameCount++;
                
                // 使用单边界检测，留2px容差
                if (direction === 1) {
                    // 向下滚动
                    if (currentScroll >= maxScroll - 2) {
                        // 到达底部，切换方向
                        direction = -1;
                        console.log(`🔄 到达底部 (scrollTop: ${currentScroll.toFixed(1)} >= maxScroll-2: ${(maxScroll-2).toFixed(1)})，切换向上`);
                    } else {
                        container.scrollTop += speed;
                    }
                } else {
                    // 向上滚动
                    if (currentScroll <= 2) {
                        // 到达顶部，切换方向
                        direction = 1;
                        console.log(`🔄 到达顶部 (scrollTop: ${currentScroll.toFixed(1)} <= 2)，切换向下`);
                    } else {
                        container.scrollTop -= speed;
                    }
                }
            }
            
            this.autoScrollInterval = requestAnimationFrame(scroll);
        };
        
        this.autoScrollInterval = requestAnimationFrame(scroll);
    }

    calculateCountdown(dateStr) {
        const now = new Date();
        const target = new Date(dateStr);
        const diff = target - now;
        
        if (diff < 0) {
            return { text: '已过期', urgent: true };
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days === 0) {
            return { text: `今天 ${hours}小时后`, urgent: true };
        } else if (days === 1) {
            return { text: '明天', urgent: true };
        } else if (days <= 7) {
            return { text: `${days}天后`, urgent: true };
        } else {
            return { text: `${days}天后`, urgent: false };
        }
    }



    showEventModal() {
        const modal = document.getElementById('eventModal');
        if (!modal) {
            this.createEventModal();
        }
        document.getElementById('eventModal').classList.add('show');
    }

    hideEventModal() {
        document.getElementById('eventModal').classList.remove('show');
        document.getElementById('eventForm').reset();
    }

    createEventModal() {
        const modalHTML = `
            <div id="eventModal" class="event-modal">
                <div class="event-modal-content">
                    <div class="event-modal-header">添加重要事项</div>
                    <form id="eventForm" onsubmit="weatherCalendarManager.saveEvent(event)">
                        <div class="event-form-group">
                            <label class="event-form-label">标题 *</label>
                            <input type="text" class="event-form-input" name="title" required>
                        </div>
                        <div class="event-form-group">
                            <label class="event-form-label">时间 *</label>
                            <input type="datetime-local" class="event-form-input" name="date" required>
                        </div>
                        <div class="event-form-group">
                            <label class="event-form-label">重要程度</label>
                            <select class="event-form-select" name="priority">
                                <option value="low">普通</option>
                                <option value="medium">一般</option>
                                <option value="high">重要</option>
                            </select>
                        </div>
                        <div class="event-form-group">
                            <label class="event-form-label">描述</label>
                            <textarea class="event-form-textarea" name="description"></textarea>
                        </div>
                        <div class="event-modal-footer">
                            <button type="submit" class="btn-modal btn-modal-primary">保存</button>
                            <button type="button" class="btn-modal btn-modal-secondary" onclick="weatherCalendarManager.hideEventModal()">取消</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 点击背景关闭
        document.getElementById('eventModal').addEventListener('click', (e) => {
            if (e.target.id === 'eventModal') {
                this.hideEventModal();
            }
        });
    }

    saveEvent(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        const event = {
            id: Date.now(),
            title: formData.get('title'),
            date: formData.get('date'),
            priority: formData.get('priority'),
            description: formData.get('description'),
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.events.push(event);
        this.saveEventsToStorage();
        this.renderEvents();
        this.hideEventModal();
    }

    toggleEventComplete(index) {
        if (!this.events || this.events.length === 0) return;
        
        const sortedEvents = [...this.events].sort((a, b) => new Date(a.date) - new Date(b.date));
        const event = sortedEvents[index];
        
        if (!event) return;
        
        const originalIndex = this.events.findIndex(e => e.id === event.id);
        
        if (originalIndex !== -1) {
            this.events[originalIndex].completed = !this.events[originalIndex].completed;
            this.saveEventsToStorage();
            this.renderEvents();
        }
    }

    deleteEvent(index) {
        if (!confirm('确定要删除这个事项吗？')) return;
        
        if (!this.events || this.events.length === 0) return;
        
        const sortedEvents = [...this.events].sort((a, b) => new Date(a.date) - new Date(b.date));
        const event = sortedEvents[index];
        
        if (!event) return;
        
        const originalIndex = this.events.findIndex(e => e.id === event.id);
        
        if (originalIndex !== -1) {
            this.events.splice(originalIndex, 1);
            this.saveEventsToStorage();
            this.renderEvents();
        }
    }

    saveEventsToStorage() {
        localStorage.setItem('calendarEvents', JSON.stringify(this.events));
    }

    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    selectDate(year, month, day) {
        this.selectedDate = new Date(year, month, day);
        this.renderCalendar();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.weatherCalendarManager = new WeatherCalendarManager();
});
