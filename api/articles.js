// Vercel Serverless Function for articles API
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const articlesPath = path.join(process.cwd(), 'data', 'articles.json');

  try {
    if (req.method === 'GET') {
      // 读取文章数据
      const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
      res.status(200).json(articles);
    } else if (req.method === 'POST') {
      // 创建新文章
      const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
      const newArticle = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      articles.push(newArticle);
      fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2));
      res.status(201).json(newArticle);
    } else if (req.method === 'PUT') {
      // 更新文章
      const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
      const articleId = parseInt(req.query.id);
      const index = articles.findIndex(a => a.id === articleId);
      if (index !== -1) {
        articles[index] = { ...articles[index], ...req.body, updatedAt: new Date().toISOString() };
        fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2));
        res.status(200).json(articles[index]);
      } else {
        res.status(404).json({ error: 'Article not found' });
      }
    } else if (req.method === 'DELETE') {
      // 删除文章
      const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
      const articleId = parseInt(req.query.id);
      const filteredArticles = articles.filter(a => a.id !== articleId);
      fs.writeFileSync(articlesPath, JSON.stringify(filteredArticles, null, 2));
      res.status(200).json({ message: 'Article deleted' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}