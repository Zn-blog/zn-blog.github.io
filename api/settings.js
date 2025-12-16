// Vercel API for settings - 网站设置管理
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { method } = req;

  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (method) {
      case 'GET':
        // 获取设置
        const settings = await kv.get('settings') || {};
        return res.json({ success: true, data: settings });

      case 'PUT':
        // 更新设置
        const newSettings = req.body;
        await kv.set('settings', newSettings);
        return res.json({ success: true, data: newSettings });

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Settings API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}