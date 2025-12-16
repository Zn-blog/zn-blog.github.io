// Vercel通用资源API - 处理所有数据类型的CRUD操作
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { method, query } = req;
  const { resource, id } = query;

  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 验证资源类型
  const allowedResources = [
    'articles', 'categories', 'tags', 'comments', 'guestbook',
    'users', 'images', 'music', 'videos', 'links', 'apps', 
    'resumes', 'events', 'settings'
  ];

  if (!allowedResources.includes(resource)) {
    return res.status(400).json({ success: false, error: '不支持的资源类型' });
  }

  try {
    switch (method) {
      case 'GET':
        if (id) {
          // 获取单个项目
          const items = await kv.get(resource) || [];
          
          if (resource === 'settings') {
            // settings是对象，不是数组
            const settings = await kv.get('settings') || {};
            return res.json({ success: true, data: settings });
          }
          
          const item = items.find(i => String(i.id) === String(id));
          
          if (item) {
            return res.json({ success: true, data: item });
          } else {
            return res.status(404).json({ success: false, error: '项目未找到' });
          }
        } else {
          // 获取所有项目
          const items = await kv.get(resource) || (resource === 'settings' ? {} : []);
          return res.json({ success: true, data: items });
        }

      case 'POST':
        if (req.url.includes('/batch')) {
          // 批量导入
          const data = req.body;
          await kv.set(resource, data);
          const count = Array.isArray(data) ? data.length : 1;
          return res.json({ 
            success: true, 
            message: `成功导入 ${count} 条数据`,
            count 
          });
        } else {
          // 创建新项目
          if (resource === 'settings') {
            // settings直接更新
            await kv.set('settings', req.body);
            return res.json({ success: true, data: req.body });
          }
          
          const items = await kv.get(resource) || [];
          
          // 生成新ID
          let maxId = 0;
          items.forEach(item => {
            const itemId = parseInt(item.id) || 0;
            if (itemId > maxId) {
              maxId = itemId;
            }
          });
          const newId = String(maxId + 1);
          
          const newItem = {
            id: newId,
            ...req.body,
            createdAt: new Date().toISOString()
          };
          
          items.push(newItem);
          await kv.set(resource, items);
          
          return res.json({ success: true, data: newItem });
        }

      case 'PUT':
        if (resource === 'settings') {
          // settings直接更新
          await kv.set('settings', req.body);
          return res.json({ success: true, data: req.body });
        }
        
        // 更新项目
        const items = await kv.get(resource) || [];
        const index = items.findIndex(i => String(i.id) === String(id));
        
        if (index !== -1) {
          items[index] = {
            ...items[index],
            ...req.body,
            updatedAt: new Date().toISOString()
          };
          
          await kv.set(resource, items);
          return res.json({ success: true, data: items[index] });
        } else {
          return res.status(404).json({ success: false, error: '项目未找到' });
        }

      case 'DELETE':
        if (resource === 'settings') {
          return res.status(400).json({ success: false, error: '不能删除设置' });
        }
        
        // 删除项目
        let allItems = await kv.get(resource) || [];
        const originalLength = allItems.length;
        allItems = allItems.filter(i => String(i.id) !== String(id));
        
        if (allItems.length < originalLength) {
          await kv.set(resource, allItems);
          return res.json({ success: true, message: '项目已删除' });
        } else {
          return res.status(404).json({ success: false, error: '项目未找到' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`${resource} API error:`, error);
    return res.status(500).json({ success: false, error: error.message });
  }
}