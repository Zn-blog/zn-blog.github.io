/* ========================================
   用户管理页面逻辑
   ======================================== */

let editingUser = null;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ 页面DOM加载完成');
    
    // 检查登录状态
    if (!AuthManager.requireAuth()) {
        console.log('✗ 未登录，重定向到登录页');
        return;
    }
    
    console.log('✓ 登录状态检查通过');
    
    // 等待userManager加载
    let attempts = 0;
    function initPage() {
        attempts++;
        
        if (typeof userManager === 'undefined') {
            console.log(`等待userManager加载... (尝试 ${attempts})`);
            if (attempts < 50) { // 最多等待5秒
                setTimeout(initPage, 100);
            } else {
                console.error('✗ userManager加载超时');
                document.getElementById('usersTableBody').innerHTML = `
                    <tr><td colspan="7" style="text-align: center; padding: 40px; color: #f44336;">
                        <div style="font-size: 32px; margin-bottom: 10px;">❌</div>
                        <div>加载失败：userManager未初始化</div>
                        <div style="margin-top: 10px; font-size: 14px;">
                            <a href="../index.html">返回首页</a>
                        </div>
                    </td></tr>
                `;
            }
            return;
        }
        
        console.log('✓ userManager已加载');
        
        // 检查权限（只有管理员可以访问）
        const currentUser = AuthManager.getCurrentUser();
        if (currentUser) {
            const userData = userManager.getUser(currentUser.username);
            console.log('当前用户:', currentUser.username, '角色:', userData ? userData.role : '未知');
            
            if (!userData || userData.role !== 'admin') {
                alert('只有管理员可以访问用户管理页面');
                window.location.href = '../index.html';
                return;
            }
        }
        
        console.log('✓ 权限检查通过，开始加载数据');
        
        // 加载数据
        try {
            loadStats();
            loadUsers();
            console.log('✓ 数据加载完成');
        } catch (error) {
            console.error('✗ 加载数据时出错:', error);
            document.getElementById('usersTableBody').innerHTML = `
                <tr><td colspan="7" style="text-align: center; padding: 40px; color: #f44336;">
                    <div style="font-size: 32px; margin-bottom: 10px;">❌</div>
                    <div>加载失败：${error.message}</div>
                </td></tr>
            `;
        }
    }
    
    initPage();
});

// 加载统计数据
function loadStats() {
    const stats = userManager.getUserStats();
    
    const statsHTML = `
        <div class="stat-card">
            <h3>总用户数</h3>
            <div class="number">${stats.total}</div>
        </div>
        <div class="stat-card">
            <h3>启用用户</h3>
            <div class="number">${stats.active}</div>
        </div>
        <div class="stat-card">
            <h3>管理员</h3>
            <div class="number">${stats.admins}</div>
        </div>
        <div class="stat-card">
            <h3>编辑</h3>
            <div class="number">${stats.editors}</div>
        </div>
    `;
    
    document.getElementById('statsCards').innerHTML = statsHTML;
}

// 加载用户列表
function loadUsers() {
    const users = userManager.getAllUsers();
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="empty-state-icon">👤</div>
                        <p>暂无用户</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    const currentUser = AuthManager.getCurrentUser();
    
    tbody.innerHTML = users.map(user => {
        const isCurrentUser = currentUser && user.username === currentUser.username;
        const createdDate = new Date(user.createdAt).toLocaleDateString('zh-CN');
        
        return `
            <tr>
                <td>
                    <strong>${user.username}</strong>
                    ${isCurrentUser ? '<span style="color: #4fc3f7; font-size: 12px;">(当前用户)</span>' : ''}
                </td>
                <td>${user.displayName || '-'}</td>
                <td>${user.email || '-'}</td>
                <td>
                    <span class="role-badge role-${user.role}">
                        ${user.role === 'admin' ? '管理员' : '编辑'}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-${user.status}">
                        ${user.status === 'active' ? '启用' : '禁用'}
                    </span>
                </td>
                <td>${createdDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="editUser('${user.username}')">
                            编辑
                        </button>
                        <button class="btn-action btn-reset" onclick="showResetPasswordModal('${user.username}')">
                            重置密码
                        </button>
                        ${!isCurrentUser ? `
                            <button class="btn-action btn-delete" onclick="deleteUser('${user.username}')">
                                删除
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// 显示添加用户模态框
function showAddUserModal() {
    editingUser = null;
    document.getElementById('modalTitle').textContent = '添加用户';
    document.getElementById('userForm').reset();
    document.getElementById('username').disabled = false;
    document.getElementById('passwordGroup').style.display = 'block';
    document.getElementById('password').required = true;
    document.getElementById('userModal').classList.add('active');
}

// 编辑用户
function editUser(username) {
    const user = userManager.getUser(username);
    if (!user) {
        alert('用户不存在');
        return;
    }
    
    editingUser = username;
    document.getElementById('modalTitle').textContent = '编辑用户';
    document.getElementById('username').value = user.username;
    document.getElementById('username').disabled = true;
    document.getElementById('displayName').value = user.displayName || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('role').value = user.role;
    document.getElementById('status').value = user.status;
    
    // 编辑时不显示密码字段
    document.getElementById('passwordGroup').style.display = 'none';
    document.getElementById('password').required = false;
    
    document.getElementById('userModal').classList.add('active');
}

// 关闭用户模态框
function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
    editingUser = null;
}

// 处理用户表单提交
function handleUserSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        username: formData.get('username'),
        password: formData.get('password'),
        displayName: formData.get('displayName'),
        email: formData.get('email'),
        role: formData.get('role'),
        status: formData.get('status')
    };
    
    let result;
    
    if (editingUser) {
        // 更新用户
        const updates = {
            displayName: userData.displayName,
            email: userData.email,
            role: userData.role,
            status: userData.status
        };
        result = userManager.updateUser(editingUser, updates);
    } else {
        // 添加用户
        result = userManager.addUser(userData);
    }
    
    if (result.success) {
        showNotification(result.message, 'success');
        closeUserModal();
        loadStats();
        loadUsers();
    } else {
        showNotification(result.message, 'error');
    }
}

// 显示重置密码模态框
function showResetPasswordModal(username) {
    document.getElementById('resetUsername').value = username;
    document.getElementById('resetPasswordForm').reset();
    document.getElementById('resetPasswordModal').classList.add('active');
}

// 关闭重置密码模态框
function closeResetPasswordModal() {
    document.getElementById('resetPasswordModal').classList.remove('active');
}

// 处理重置密码
function handleResetPassword(event) {
    event.preventDefault();
    
    const username = document.getElementById('resetUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }
    
    const result = userManager.resetPassword(username, newPassword);
    
    if (result.success) {
        showNotification(result.message, 'success');
        closeResetPasswordModal();
    } else {
        showNotification(result.message, 'error');
    }
}

// 删除用户
function deleteUser(username) {
    if (!confirm(`确定要删除用户 "${username}" 吗？此操作不可恢复！`)) {
        return;
    }
    
    const result = userManager.deleteUser(username);
    
    if (result.success) {
        showNotification(result.message, 'success');
        loadStats();
        loadUsers();
    } else {
        showNotification(result.message, 'error');
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '100000',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    });
    
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 点击模态框背景关闭
document.getElementById('userModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeUserModal();
    }
});

document.getElementById('resetPasswordModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeResetPasswordModal();
    }
});

// ESC键关闭模态框
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeUserModal();
        closeResetPasswordModal();
    }
});
