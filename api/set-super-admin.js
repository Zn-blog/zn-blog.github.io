// Vercel API - 设置指定用户为超级管理员
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { method } = req;

  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  // 检查KV环境变量
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.error('KV环境变量未配置');
    return res.status(500).json({ 
      success: false, 
      error: 'KV数据库未配置，请检查环境变量'
    });
  }

  try {
    // 解析请求体
    let requestBody = req.body;
    if (typeof requestBody === 'string') {
      try {
        requestBody = JSON.parse(requestBody);
      } catch (error) {
        return res.status(400).json({ success: false, error: '无效的JSON格式' });
      }
    }

    const { username = 'admin', password, createIfNotExists = true } = requestBody || {};

    console.log(`🔐 开始设置用户 "${username}" 为超级管理员...`);

    // 获取当前用户数据
    let users = await kv.get('users') || [];
    console.log('📋 当前用户数据:', users.map(u => ({ username: u.username, role: u.role })));

    // 查找指定用户
    const userIndex = users.findIndex(user => user.username === username);
    
    if (userIndex !== -1) {
      // 更新现有用户为超级管理员
      const originalRole = users[userIndex].role;
      users[userIndex] = {
        ...users[userIndex],
        role: 'super_admin',
        displayName: '超级管理员',
        updatedAt: new Date().toISOString()
      };
      
      console.log(`✅ 更新用户 "${username}": ${originalRole} → super_admin`);
    } else if (createIfNotExists) {
      // 创建新的超级管理员用户
      const newSuperAdmin = {
        id: `user_${Date.now()}`,
        username: username,
        password: password || 'admin123',
        role: 'super_admin',
        email: `${username}@example.com`,
        displayName: '超级管理员',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(newSuperAdmin);
      console.log(`✅ 创建新的超级管理员用户: ${username}`);
    } else {
      return res.status(404).json({
        success: false,
        error: `用户 "${username}" 不存在，且未启用自动创建`
      });
    }

    // 保存更新后的用户数据
    await kv.set('users', users);
    
    // 获取最终的超级管理员列表
    const finalSuperAdmins = users.filter(user => user.role === 'super_admin');
    const targetUser = users.find(user => user.username === username);
    
    console.log('🎉 超级管理员权限设置完成');
    console.log('👑 当前超级管理员:', finalSuperAdmins.map(u => u.username));

    return res.json({
      success: true,
      message: `用户 "${username}" 已设置为超级管理员`,
      data: {
        user: {
          username: targetUser.username,
          displayName: targetUser.displayName,
          email: targetUser.email,
          role: targetUser.role,
          updatedAt: targetUser.updatedAt
        },
        totalUsers: users.length,
        superAdmins: finalSuperAdmins.map(user => ({
          username: user.username,
          displayName: user.displayName,
          email: user.email
        })),
        superAdminCount: finalSuperAdmins.length
      }
    });

  } catch (error) {
    console.error('❌ 设置超级管理员权限失败:', error);
    return res.status(500).json({ 
      success: false, 
      error: '设置超级管理员权限失败: ' + error.message 
    });
  }
}