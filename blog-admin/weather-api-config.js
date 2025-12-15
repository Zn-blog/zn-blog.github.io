// 天气API配置文件
// 可以选择以下任一方案，取消注释即可使用

const WeatherAPIConfig = {
    // 当前使用的API类型
    // 可选值: 'vvhan', 'amap', 'qweather', 'mock'
    currentAPI: 'vvhan',
    
    // 方案1: vvhan API（免费，无需key，推荐）
    vvhan: {
        name: 'vvhan天气API',
        baseURL: 'https://api.vvhan.com/api/weather',
        needKey: false,
        key: '',
        description: '免费API，无需注册，但可能不稳定',
        rateLimit: '无限制',
        features: ['实时天气', '基本信息'],
        
        // 数据转换函数
        transformData: (result) => {
            if (result.success && result.data) {
                return {
                    city: result.data.city,
                    temperature: result.data.tem || result.data.temperature || '25',
                    weather: result.data.wea || result.data.weather || '晴',
                    tips: result.data.air_tips || result.data.tips || '天气不错',
                    humidity: result.data.humidity || '60',
                    wind: result.data.win_speed || result.data.wind || '3',
                    air: result.data.air_level || result.data.air || '良'
                };
            }
            return null;
        }
    },
    
    // 方案2: 高德地图天气API（推荐，稳定）
    amap: {
        name: '高德地图天气API',
        baseURL: 'https://restapi.amap.com/v3/weather/weatherInfo',
        needKey: true,
        key: '', // 在这里填入你的高德key
        description: '需要注册高德开放平台，每天免费30万次',
        rateLimit: '30万次/天',
        features: ['实时天气', '预报天气', '生活指数'],
        signupURL: 'https://console.amap.com/dev/key/app',
        
        // 城市adcode映射
        cityAdcodes: {
            '北京': '110000', '上海': '310000', '广州': '440100', '深圳': '440300',
            '成都': '510100', '杭州': '330100', '重庆': '500000', '武汉': '420100',
            '西安': '610100', '苏州': '320500', '天津': '120000', '南京': '320100',
            '长沙': '430100', '郑州': '410100', '东莞': '441900', '青岛': '370200',
            '沈阳': '210100', '宁波': '330200', '昆明': '530100', '大连': '210200',
            '厦门': '350200', '合肥': '340100', '佛山': '440600', '福州': '350100',
            '哈尔滨': '230100', '济南': '370100', '温州': '330300', '南宁': '450100',
            '长春': '220100', '泉州': '350500', '石家庄': '130100', '贵阳': '520100'
        },
        
        // 数据转换函数
        transformData: (result) => {
            if (result.status === '1' && result.lives && result.lives[0]) {
                const live = result.lives[0];
                return {
                    city: live.city,
                    temperature: live.temperature,
                    weather: live.weather,
                    tips: `${live.weather}，${live.winddirection}风${live.windpower}级`,
                    humidity: live.humidity,
                    wind: live.windpower,
                    air: '良' // 高德基础版不包含空气质量
                };
            }
            return null;
        }
    },
    
    // 方案3: 和风天气API（专业，功能强大）
    qweather: {
        name: '和风天气API',
        baseURL: 'https://devapi.qweather.com/v7/weather/now',
        needKey: true,
        key: '', // 在这里填入你的和风key
        description: '专业天气服务，免费版每天1000次',
        rateLimit: '1000次/天（免费版）',
        features: ['实时天气', '逐小时预报', '7天预报', '空气质量', '生活指数'],
        signupURL: 'https://dev.qweather.com',
        
        // 数据转换函数
        transformData: (result) => {
            if (result.code === '200' && result.now) {
                const now = result.now;
                return {
                    city: '当前城市',
                    temperature: now.temp,
                    weather: now.text,
                    tips: `体感温度${now.feelsLike}°C`,
                    humidity: now.humidity,
                    wind: now.windScale,
                    air: '良' // 需要单独调用空气质量API
                };
            }
            return null;
        }
    },
    
    // 方案4: 心知天气API
    seniverse: {
        name: '心知天气API',
        baseURL: 'https://api.seniverse.com/v3/weather/now.json',
        needKey: true,
        key: '', // 在这里填入你的心知key
        description: '免费版每天400次',
        rateLimit: '400次/天（免费版）',
        features: ['实时天气', '预报天气', '空气质量'],
        signupURL: 'https://www.seniverse.com',
        
        // 数据转换函数
        transformData: (result) => {
            if (result.results && result.results[0]) {
                const weather = result.results[0];
                const now = weather.now;
                return {
                    city: weather.location.name,
                    temperature: now.temperature,
                    weather: now.text,
                    tips: `${now.text}`,
                    humidity: '60', // 需要单独API
                    wind: '3', // 需要单独API
                    air: '良'
                };
            }
            return null;
        }
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherAPIConfig;
}
