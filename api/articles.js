// Vercel API for articles - 支持动态数据操作
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (method) {
      case 'GET':
        if (id) {
          // 获取单个文章
          const articles = await kv.get('articles') || [];
          const article = articles.find(a => String(a.id) === String(id));
          
          if (article) {
            return res.json({ success: true, data: article });
          } else {
            return res.status(404).json({ success: false, error: '文章未找到' });
          }
        } else {
          // 获取所有文章
          const articles = await kv.get('articles') || [];
          return res.json({ success: true, data: articles });
        }

      case 'POST':
        if (req.url.includes('/batch')) {
          // 批量导入
          const articles = req.body;
          await kv.set('articles', articles);
          return res.json({ 
            success: true, 
            message: `成功导入 ${articles.length} 篇文章`,
            count: articles.length 
          });
        } else {
          // 创建新文章
          const articles = await kv.get('articles') || [];
          
          // 生成新ID
          let maxId = 0;
          articles.forEach(item => {
            const itemId = parseInt(item.id) || 0;
            if (itemId > maxId) {
              maxId = itemId;
            }
          });
          const newId = String(maxId + 1);
          
          const newArticle = {
            id: newId,
            ...req.body,
            createdAt: new Date().toISOString()
          };
          
          articles.push(newArticle);
          await kv.set('articles', articles);
          
          return res.json({ success: true, data: newArticle });
        }

      case 'PUT':
        // 更新文章
        const articles = await kv.get('articles') || [];
        const index = articles.findIndex(a => String(a.id) === String(id));
        
        if (index !== -1) {
          articles[index] = {
            ...articles[index],
            ...req.body,
            updatedAt: new Date().toISOString()
          };
          
          await kv.set('articles', articles);
          return res.json({ success: true, data: articles[index] });
        } else {
          return res.status(404).json({ success: false, error: '文章未找到' });
        }

      case 'DELETE':
        // 删除文章
        let allArticles = await kv.get('articles') || [];
        const originalLength = allArticles.length;
        allArticles = allArticles.filter(a => String(a.id) !== String(id));
        
        if (allArticles.length < originalLength) {
          await kv.set('articles', allArticles);
          return res.json({ success: true, message: '文章已删除' });
        } else {
          return res.status(404).json({ success: false, error: '文章未找到' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Articles API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}