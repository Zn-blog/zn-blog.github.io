// 简单的健康检查API - 不依赖任何外部服务
export default async function handler(req, res) {
  try {
    const response = {
      success: true,
      message: 'Vercel Functions 工作正常',
      timestamp: new Date().toISOString(),
      environment: 'vercel',
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'host': req.headers['host']
      }
    };
    
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
}