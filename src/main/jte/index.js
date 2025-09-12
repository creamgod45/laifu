// 導入核心框架
import { initCGFramework } from './src/core/Framework.js';

// 導入重構後的組件
import { ButtonComponent } from './component/Button.js';
import { MenuComponent } from './component/Menu.js';
import './component/CustomTrigger.js';
import './component/Tippy.js';

// 初始化框架
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 初始化 CG Framework
        const framework = await initCGFramework({
            apiBaseUrl: '/api',
            autoInitComponents: true,
            enableErrorHandling: true,
            debugMode: process.env.NODE_ENV === 'development'
        });
        
        // 註冊重構後的組件
        framework.registerComponent('button', ButtonComponent, {
            selector: '.cg-buttons',
            autoInit: true
        });
        
        framework.registerComponent('menu', MenuComponent, {
            selector: '.cg-menu',
            autoInit: true
        });
        
        console.log('CG Framework 初始化成功');
        console.log('框架狀態:', framework.getStatus());
        
        // 發送自定義事件通知其他腳本框架已準備就緒
        document.dispatchEvent(new CustomEvent('CGFramework:Ready', {
            detail: { framework }
        }));
        
    } catch (error) {
        console.error('CG Framework 初始化失敗:', error);
    }
});