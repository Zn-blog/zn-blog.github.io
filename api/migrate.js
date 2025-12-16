// Vercel数据迁移API - 首次部署时自动导入JSON数据
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
    console.log('🔄 开始数据迁移...');
    
    // 检查是否已经迁移过
    const migrationStatus = await kv.get('migration_status');
    if (migrationStatus === 'completed') {
      return res.json({ 
        success: true, 
        message: '数据已经迁移过了',
        alreadyMigrated: true 
      });
    }

    // 定义需要迁移的数据文件
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
      'settings.json'
    ];

    const migrationResults = {};
    let totalRecords = 0;

    // 逐个迁移数据文件
    for (const filename of dataFiles) {
      try {
        const filePath = path.join(process.cwd(), 'data', filename);
        
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️ 文件不存在: ${filename}`);
          migrationResults[filename] = { status: 'skipped', reason: 'file not found' };
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
        
        migrationResults[filename] = { 
          status: 'success', 
          records: recordCount,
          dataType: Array.isArray(data) ? 'array' : 'object'
        };
        
        console.log(`✅ 迁移完成: ${filename} (${recordCount}条记录)`);
        
      } catch (error) {
        console.error(`❌ 迁移失败: ${filename}`, error);
        migrationResults[filename] = { 
          status: 'error', 
          error: error.message 
        };
      }
    }

    // 标记迁移完成
    await kv.set('migration_status', 'completed');
    await kv.set('migration_date', new Date().toISOString());
    await kv.set('migration_results', migrationResults);

    console.log('🎉 数据迁移完成!');

    return res.json({
      success: true,
      message: `数据迁移完成，共迁移 ${totalRecords} 条记录`,
      totalRecords,
      results: migrationResults,
      migrationDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 数据迁移失败:', error);
    return res.status(500).json({
      success: false,
      message: '数据迁移失败: ' + error.message
    });
  }
}

// 辅助函数：检查迁移状态
export async function checkMigrationStatus() {
  try {
    const status = await kv.get('migration_status');
    const date = await kv.get('migration_date');
    const results = await kv.get('migration_results');
    
    return {
      completed: status === 'completed',
      date,
      results
    };
  } catch (error) {
    return { completed: false, error: error.message };
  }
}