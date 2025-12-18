// Vercel API - 检查用户权限状态
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { method } = req;

  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use GET.' 
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
    console.log('🔍 检查用户权限状态...');

    // 获取当前用户数据
    const users = await kv.get('users') || [];
    console.log('📋 用户数据获取成功，共', users.length, '个用户');

    // 按角色分组统计
    const roleStats = {
      super_admin: [],
      admin: [],
      editor: [],
      viewer: [],
      other: []
    };

    users.forEach(user => {
      const role = user.role || 'other';
      if (roleStats[role]) {
        roleStats[role].push({
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        });
      } else {
        roleStats.other.push({
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          role: user.role,
          status: user.status
        });
      }
    });

    // 权限级别定义
    const roleDescriptions = {
      super_admin: {
        name: '超级管理员',
        level: 4,
        description: '拥有所有权限，包括用户管理',
        permissions: ['所有模块的完整权限', '用户管理', '系统设置', '数据管理']
      },
      admin: {
        name: '管理员',
        level: 3,
        description: '除用户管理外的所有权限',
        permissions: ['内容管理', '系统设置', '媒体管理', '应用管理']
      },
      editor: {
        name: '编辑者',
        level: 2,
        description: '内容管理权限，无系统设置权限',
        permissions: ['文章管理', '分类标签', '评论留言', '媒体查看']
      },
      viewer: {
        name: '查看者',
        level: 1,
        description: '只能查看内容，无编辑权限',
        permissions: ['内容查看', '数据浏览']
      }
    };

    // 检查权限问题
    const issues = [];
    
    if (roleStats.super_admin.length === 0) {
      issues.push({
        type: 'critical',
        message: '没有超级管理员用户，系统无法进行用户管理'
      });
    }
    
    if (roleStats.super_admin.length > 3) {
      issues.push({
        type: 'warning',
        message: `超级管理员用户过多 (${roleStats.super_admin.length}个)，建议控制在1-2个`
      });
    }

    const inactiveUsers = users.filter(user => user.status !== 'active');
    if (inactiveUsers.length > 0) {
      issues.push({
        type: 'info',
        message: `有 ${inactiveUsers.length} 个非活跃用户`
      });
    }

    console.log('✅ 权限检查完成');

    return res.json({
      success: true,
      message: '用户权限状态检查完成',
      data: {
        summary: {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.status === 'active').length,
          superAdminCount: roleStats.super_admin.length,
          adminCount: roleStats.admin.length,
          editorCount: roleStats.editor.length,
          viewerCount: roleStats.viewer.length,
          otherCount: roleStats.other.length
        },
        roleStats,
        roleDescriptions,
        issues,
        recommendations: [
          '确保至少有1个超级管理员用户',
          '定期检查和清理非活跃用户',
          '为每个用户设置合适的权限级别',
          '使用强密码保护管理员账号'
        ]
      }
    });

  } catch (error) {
    console.error('❌ 检查用户权限失败:', error);
    return res.status(500).json({ 
      success: false, 
      error: '检查用户权限失败: ' + error.message 
    });
  }
}