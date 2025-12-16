// Vercel API Functions 示例
// api/articles.js

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        // 获取所有文章
        const articles = await kv.get('articles') || [];
        return res.json({ success: true, data: articles });

      case 'POST':
        // 创建新文章
        const newArticle = {
          id: Date.now(),
          ...req.body,
          createdAt: new Date().toISOString()
        };
        
        const existingArticles = await kv.get('articles') || [];
        existingArticles.unshift(newArticle);
        
        await kv.set('articles', existingArticles);
        return res.json({ success: true, data: newArticle });

      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// api/articles/[id].js
export default async function handler(req, res) {
  const { id } = req.query;
  
  try {
    const articles = await kv.get('articles') || [];
    const articleIndex = articles.findIndex(a => a.id === parseInt(id));
    
    switch (req.method) {
      case 'GET':
        if (articleIndex === -1) {
          return res.status(404).json({ success: false, message: 'Article not found' });
        }
        return res.json({ success: true, data: articles[articleIndex] });

      case 'PUT':
        if (articleIndex === -1) {
          return res.status(404).json({ success: false, message: 'Article not found' });
        }
        
        articles[articleIndex] = { ...articles[articleIndex], ...req.body };
        await kv.set('articles', articles);
        return res.json({ success: true, data: articles[articleIndex] });

      case 'DELETE':
        if (articleIndex === -1) {
          return res.status(404).json({ success: false, message: 'Article not found' });
        }
        
        articles.splice(articleIndex, 1);
        await kv.set('articles', articles);
        return res.json({ success: true });

      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// api/upload/image.js
import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { file } = req.body; // Base64 encoded file
    const filename = `img-${Date.now()}.jpg`;
    
    // 上传到Vercel Blob
    const blob = await put(filename, Buffer.from(file, 'base64'), {
      access: 'public',
      contentType: 'image/jpeg'
    });

    return res.json({
      success: true,
      url: blob.url,
      filename: filename
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 环境变量配置 (.env.local)
/*
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token
BLOB_READ_WRITE_TOKEN=your_blob_token
*/