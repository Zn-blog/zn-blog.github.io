// Vercel数据同步API - 手动同步JSON数据到KV存储
import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('🔄 开始数据同步...');
    
    // 定义需要同步的数据文件
    const dataFiles = [
      'articles.json',
      'categories.json', 
      'tags.json',
      'comments.json',
      'guestbook.json',
      'images.json',
      'music.json',
      'videos.json',
      'links.json',
      'apps.json',
      'events.json',
      'users.json',
      'resumes.json',
      'settings.json'
    ];

    const syncResults = {};
    let totalRecords = 0;

    // 逐个同步数据文件
    for (const filename of dataFiles) {
      try {
        const filePath = path.join(process.cwd(), 'data', filename);
        
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️ 文件不存在: ${filename}`);
          syncResults[filename] = { status: 'skipped', reason: 'file not found' };
          continue;
        }

        // 读取JSON文件
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        // 获取资源名称（去掉.json后缀）
        const resourceName = filename.replace('.json', '');
        
        // 保存到Vercel KV
        await kv.set(resourceName, data);
        
        const recordCount = Array.isArray(data) ? data.length : 1;
        totalRecords += recordCount;
        
        syncResults[filename] = { 
          status: 'success', 
          records: recordCount,
          dataType: Array.isArray(data) ? 'array' : 'object'
        };
        
        console.log(`✅ 同步完成: ${filename} (${recordCount}条记录)`);
        
      } catch (error) {
        console.error(`❌ 同步失败: ${filename}`, error);
        syncResults[filename] = { 
          status: 'error', 
          error: error.message 
        };
      }
    }

    // 记录同步时间
    await kv.set('last_sync_date', new Date().toISOString());
    await kv.set('sync_results', syncResults);

    console.log('🎉 数据同步完成!');

    return res.json({
      success: true,
      message: `数据同步完成，共同步 ${totalRecords} 条记录`,
      totalRecords,
      results: syncResults,
      syncDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 数据同步失败:', error);
    return res.status(500).json({
      success: false,
      message: '数据同步失败: ' + error.message
    });
  }
}

// 辅助函数：检查同步状态
export async function checkSyncStatus() {
  try {
    const date = await kv.get('last_sync_date');
    const results = await kv.get('sync_results');
    
    return {
      lastSync: date,
      results
    };
  } catch (error) {
    return { lastSync: null, error: error.message };
  }
}