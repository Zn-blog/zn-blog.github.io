// Vercel API - 强制设置超级管理员权限
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
    console.log('🔐 开始强制设置超级管理员权限...');

    // 获取当前用户数据
    let users = await kv.get('users') || [];
    console.log('📋 当前用户数据:', users.map(u => ({ username: u.username, role: u.role })));

    // 查找admin用户
    const adminIndex = users.findIndex(user => user.username === 'admin');
    
    if (adminIndex !== -1) {
      // 更新现有admin用户为超级管理员
      const originalRole = users[adminIndex].role;
      users[adminIndex] = {
        ...users[adminIndex],
        role: 'super_admin',
        displayName: '超级管理员',
        updatedAt: new Date().toISOString()
      };
      
      console.log(`✅ 更新admin用户: ${originalRole} → super_admin`);
    } else {
      // 创建新的超级管理员用户
      const newSuperAdmin = {
        id: `user_${Date.now()}`,
        username: 'admin',
        password: 'admin123',
        role: 'super_admin',
        email: 'admin@example.com',
        displayName: '超级管理员',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(newSuperAdmin);
      console.log('✅ 创建新的超级管理员用户');
    }

    // 确保至少有一个超级管理员
    const superAdminCount = users.filter(user => user.role === 'super_admin').length;
    if (superAdminCount === 0) {
      // 如果没有超级管理员，将第一个用户设为超级管理员
      if (users.length > 0) {
        users[0].role = 'super_admin';
        users[0].displayName = '超级管理员';
        users[0].updatedAt = new Date().toISOString();
        console.log(`✅ 将用户 ${users[0].username} 设为超级管理员`);
      }
    }

    // 保存更新后的用户数据
    await kv.set('users', users);
    
    // 获取最终的超级管理员列表
    const finalSuperAdmins = users.filter(user => user.role === 'super_admin');
    
    console.log('🎉 超级管理员权限设置完成');
    console.log('👑 当前超级管理员:', finalSuperAdmins.map(u => u.username));

    return res.json({
      success: true,
      message: '超级管理员权限设置成功',
      data: {
        totalUsers: users.length,
        superAdmins: finalSuperAdmins.map(user => ({
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          updatedAt: user.updatedAt
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