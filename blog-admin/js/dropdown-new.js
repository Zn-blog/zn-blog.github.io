/* ========================================
   全新下拉框系统 - JavaScript控制
   ======================================== */

(function() {
    'use strict';
    
    // 下拉框管理器
    const DropdownManager = {
        currentDropdown: null,
        
        // 初始化
        init() {
            this.setupEventListeners();
            console.log('✅ 下拉框系统已初始化');
        },
        
        // 设置事件监听
        setupEventListeners() {
            // 监听切换按钮点击
            document.addEventListener('click', (e) => {
                const toggle = e.target.closest('.user-dropdown-toggle');
                if (toggle) {
                    e.stopPropagation();
                    this.toggle(toggle);
                    return;
                }
                
                // 点击外部关闭
                if (!e.target.closest('.user-dropdown-menu')) {
                    this.closeAll();
                }
            });
            
            // ESC键关闭
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeAll();
                }
            });
        },
        
        // 切换下拉框
        toggle(toggleButton) {
            const dropdown = toggleButton.closest('.user-dropdown');
            const menu = dropdown.querySelector('.user-dropdown-menu');
            
            if (!menu) {
                console.error('未找到下拉菜单元素');
                return;
            }
            
            const isOpen = menu.classList.contains('show') || menu.classList.contains('active');
            
            // 先关闭所有下拉框
            this.closeAll();
            
            // 如果之前是关闭的，则打开
            if (!isOpen) {
                this.open(dropdown, menu);
            }
        },
        
        // 打开下拉框
        open(dropdown, menu) {
            dropdown.classList.add('open', 'active');
            menu.classList.add('show', 'active');
            this.currentDropdown = { dropdown, menu };
            console.log('✅ 下拉框已打开');
        },
        
        // 关闭下拉框
        close(dropdown, menu) {
            dropdown.classList.remove('open', 'active');
            menu.classList.remove('show', 'active');
            console.log('✅ 下拉框已关闭');
        },
        
        // 关闭所有下拉框
        closeAll() {
            if (this.currentDropdown) {
                this.close(this.currentDropdown.dropdown, this.currentDropdown.menu);
                this.currentDropdown = null;
            }
        }
    };
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            DropdownManager.init();
        });
    } else {
        DropdownManager.init();
    }
    
    // 暴露到全局（用于调试）
    window.DropdownManager = DropdownManager;
    
})();

// 保持原有的全局函数兼容性
function toggleUserDropdown() {
    const toggle = document.querySelector('.user-dropdown-toggle');
    if (toggle) {
        toggle.click();
    }
}
