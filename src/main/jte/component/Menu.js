import { BaseComponent } from '../src/core/BaseComponent.js';
import { getComponentCommunication } from '../src/core/ComponentCommunication.js';

/**
 * Menu 組件
 * 提供下拉選單功能和互動管理
 */
export class MenuComponent extends BaseComponent {
    constructor(element, config = {}) {
        super(element, config);
        
        // 設置預設配置
        this.config = {
            trigger: 'click', // 'click', 'hover', 'both'
            closeOnClickOutside: true,
            closeOnEscape: true,
            hoverDelay: 200,
            autoPosition: true,
            group: config.group || null, // 組件群組
            exclusiveGroup: config.exclusiveGroup || false, // 是否為互斥群組
            ...config
        };
        
        // 獲取通信系統實例
        this.communication = getComponentCommunication();
        
        // 獲取下拉選單元素
        this.dropdownSelector = element.dataset.dropdown;
        this.dropdownElement = this.dropdownSelector ? 
            document.querySelector(this.dropdownSelector) : null;
        
        // 初始化狀態
        this.setState({
            isOpen: false,
            isDisabled: element.disabled || false,
            hasDropdown: !!this.dropdownElement
        });
        
        // 懸停計時器
        this.hoverTimer = null;

        // 如果指定了群組，加入群組
        if (this.config.group) {
            this.joinGroup(this.config.group);
        }

        // 監聽組件間消息
        this.setupCommunication();
    }
    
    /**
     * 渲染組件
     */
    render() {
        // 確保選單有正確的類別
        if (!this.element.classList.contains('cg-menu')) {
            this.element.classList.add('cg-menu');
        }
        
        // 標記為已渲染
        if (!this.element.classList.contains('cg-menu-rendered')) {
            this.element.classList.add('cg-menu-rendered');
        }
        
        // 初始化下拉選單狀態
        if (this.dropdownElement) {
            this.updateDropdownState();
        }
        
        // 更新選單狀態
        this.updateMenuState();
    }
    
    /**
     * 綁定事件監聽器
     */
    bindEvents() {
        if (!this.getState('hasDropdown')) return;
        
        // 根據觸發方式綁定事件
        if (this.config.trigger === 'click' || this.config.trigger === 'both') {
            this.addEventListener('click', this.handleClick.bind(this));
        }
        
        if (this.config.trigger === 'hover' || this.config.trigger === 'both') {
            this.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
            this.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
            
            // 為下拉選單也綁定懸停事件
            if (this.dropdownElement) {
                this.addEventListener('mouseenter', this.handleDropdownMouseEnter.bind(this), this.dropdownElement);
                this.addEventListener('mouseleave', this.handleDropdownMouseLeave.bind(this), this.dropdownElement);
            }
        }
        
        // 綁定全域事件
        if (this.config.closeOnClickOutside) {
            this.addEventListener('click', this.handleDocumentClick.bind(this), document);
        }
        
        if (this.config.closeOnEscape) {
            this.addEventListener('keydown', this.handleKeyDown.bind(this), document);
        }
        
        // 監聽視窗大小變更
        if (this.config.autoPosition) {
            this.addEventListener('resize', this.handleWindowResize.bind(this), window);
        }
    }
    
    /**
     * 處理點擊事件
     */
    handleClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        if (this.getState('isDisabled')) return;
        
        this.toggle();
        this.emit('menu:click', { element: this.element, event });
    }
    
    /**
     * 處理滑鼠進入事件
     */
    handleMouseEnter(event) {
        if (this.getState('isDisabled')) return;
        
        // 清除之前的計時器
        if (this.hoverTimer) {
            clearTimeout(this.hoverTimer);
        }
        
        // 延遲顯示
        this.hoverTimer = setTimeout(() => {
            this.open();
            this.emit('menu:hover:enter', { element: this.element, event });
        }, this.config.hoverDelay);
    }
    
    /**
     * 處理滑鼠離開事件
     */
    handleMouseLeave(event) {
        // 清除顯示計時器
        if (this.hoverTimer) {
            clearTimeout(this.hoverTimer);
        }
        
        // 延遲隱藏
        this.hoverTimer = setTimeout(() => {
            this.close();
            this.emit('menu:hover:leave', { element: this.element, event });
        }, this.config.hoverDelay);
    }
    
    /**
     * 處理下拉選單滑鼠進入事件
     */
    handleDropdownMouseEnter(event) {
        // 清除隱藏計時器
        if (this.hoverTimer) {
            clearTimeout(this.hoverTimer);
        }
    }
    
    /**
     * 處理下拉選單滑鼠離開事件
     */
    handleDropdownMouseLeave(event) {
        // 延遲隱藏
        this.hoverTimer = setTimeout(() => {
            this.close();
        }, this.config.hoverDelay);
    }
    
    /**
     * 處理文檔點擊事件
     */
    handleDocumentClick(event) {
        if (!this.getState('isOpen')) return;
        
        // 檢查點擊是否在選單或下拉選單內
        const isClickInside = this.element.contains(event.target) || 
            (this.dropdownElement && this.dropdownElement.contains(event.target));
        
        if (!isClickInside) {
            this.close();
            this.emit('menu:clickoutside', { element: this.element, event });
        }
    }
    
    /**
     * 處理鍵盤事件
     */
    handleKeyDown(event) {
        if (!this.getState('isOpen')) return;
        
        if (event.key === 'Escape') {
            this.close();
            this.element.focus(); // 返回焦點到觸發元素
            this.emit('menu:escape', { element: this.element, event });
        }
    }
    
    /**
     * 處理視窗大小變更事件
     */
    handleWindowResize(event) {
        if (this.getState('isOpen') && this.config.autoPosition) {
            this.updatePosition();
        }
    }
    
    /**
     * 打開選單
     */
    open() {
        if (this.getState('isOpen') || this.getState('isDisabled') || !this.dropdownElement) {
            return;
        }
        
        this.setState({ isOpen: true });
        
        // 更新位置
        if (this.config.autoPosition) {
            this.updatePosition();
        }
        
        this.emit('menu:open', { element: this.element, dropdown: this.dropdownElement });
    }
    
    /**
     * 關閉選單
     */
    close() {
        if (!this.getState('isOpen')) return;
        
        this.setState({ isOpen: false });
        this.emit('menu:close', { element: this.element, dropdown: this.dropdownElement });
    }
    
    /**
     * 切換選單狀態
     */
    toggle() {
        if (this.getState('isOpen')) {
            this.close();
        } else {
            this.open();
        }
    }
    
    /**
     * 更新下拉選單狀態
     */
    updateDropdownState() {
        if (!this.dropdownElement) return;
        
        const isOpen = this.getState('isOpen');
        
        if (isOpen) {
            this.dropdownElement.classList.remove('hidden');
            this.dropdownElement.setAttribute('aria-hidden', 'false');
        } else {
            this.dropdownElement.classList.add('hidden');
            this.dropdownElement.setAttribute('aria-hidden', 'true');
        }
        
        // 設置狀態屬性（向後相容）
        this.dropdownElement.status = isOpen;
    }
    
    /**
     * 更新選單狀態
     */
    updateMenuState() {
        const { isOpen, isDisabled } = this.getState();
        
        // 更新 disabled 狀態
        if (isDisabled) {
            this.element.setAttribute('disabled', 'disabled');
            this.element.classList.add('disabled');
        } else {
            this.element.removeAttribute('disabled');
            this.element.classList.remove('disabled');
        }
        
        // 更新 open 狀態
        if (isOpen) {
            this.element.classList.add('open');
            this.element.setAttribute('aria-expanded', 'true');
        } else {
            this.element.classList.remove('open');
            this.element.setAttribute('aria-expanded', 'false');
        }
    }
    
    /**
     * 更新下拉選單位置
     */
    updatePosition() {
        if (!this.dropdownElement) return;
        
        const menuRect = this.element.getBoundingClientRect();
        const dropdownRect = this.dropdownElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // 重置位置類別
        this.dropdownElement.classList.remove('position-top', 'position-bottom', 'position-left', 'position-right');
        
        // 計算最佳位置
        const spaceBelow = viewportHeight - menuRect.bottom;
        const spaceAbove = menuRect.top;
        const spaceRight = viewportWidth - menuRect.right;
        const spaceLeft = menuRect.left;
        
        // 垂直位置
        if (spaceBelow >= dropdownRect.height || spaceBelow >= spaceAbove) {
            this.dropdownElement.classList.add('position-bottom');
        } else {
            this.dropdownElement.classList.add('position-top');
        }
        
        // 水平位置
        if (spaceRight >= dropdownRect.width || spaceRight >= spaceLeft) {
            this.dropdownElement.classList.add('position-left');
        } else {
            this.dropdownElement.classList.add('position-right');
        }
    }
    
    /**
     * 狀態變更回調
     */
    onStateChange(oldState, newState) {
        // 當狀態變更時更新選單外觀
        if (oldState.isOpen !== newState.isOpen) {
            this.updateDropdownState();
        }
        
        if (oldState.isDisabled !== newState.isDisabled || 
            oldState.isOpen !== newState.isOpen) {
            this.updateMenuState();
        }
    }
    
    /**
     * 啟用選單
     */
    enable() {
        this.setState({ isDisabled: false });
        this.emit('menu:enabled', { element: this.element });
    }
    
    /**
     * 禁用選單
     */
    disable() {
        // 先關閉選單
        if (this.getState('isOpen')) {
            this.close();
        }
        
        this.setState({ isDisabled: true });
        this.emit('menu:disabled', { element: this.element });
    }
    
    /**
     * 設置組件間通信
     */
    setupCommunication() {
        // 監聽組件特定消息
        this.on(`component:${this.componentId}:message`, (event) => {
            this.handleComponentMessage(event.data);
        });

        // 監聽同組件錯誤
        this.on(`component:${this.componentId}:peer-error`, (event) => {
            this.handlePeerError(event.data);
        });

        // 監聽主組件選舉
        this.on(`component:${this.componentId}:master-elected`, (event) => {
            this.handleMasterElected(event.data);
        });
    }

    /**
     * 加入組件群組
     * @param {string} groupName - 群組名稱
     */
    joinGroup(groupName) {
        try {
            // 檢查群組是否存在，不存在則創建
            const groupInfo = this.communication.getGroupInfo(groupName);
            if (!groupInfo) {
                this.communication.createComponentGroup(groupName, [this.componentId], {
                    stateSync: {
                        fields: this.config.exclusiveGroup ? ['isOpen'] : ['isDisabled'],
                        direction: this.config.exclusiveGroup ? 'master-slave' : 'bidirectional',
                        master: this.config.exclusiveGroup ? this.componentId : null
                    },
                    errorRecovery: true,
                    messageRouting: true
                });
            } else {
                this.communication.addComponentToGroup(groupName, this.componentId);
            }

            console.log(`選單組件已加入群組: ${groupName}`);
        } catch (error) {
            this.handleError(error, 'GROUP_JOIN_ERROR');
        }
    }

    /**
     * 處理組件消息
     * @param {Object} messageEvent - 消息事件
     */
    handleComponentMessage(messageEvent) {
        const { eventName, data, sender } = messageEvent;

        switch (eventName) {
            case 'menu:sync-close':
                if (this.getState('isOpen') && this.componentId !== sender) {
                    this.close();
                }
                break;

            case 'menu:sync-disable':
                if (data.disable !== undefined) {
                    this.setState({ isDisabled: data.disable }, { skipRender: false });
                }
                break;

            case 'menu:group-action':
                this.handleGroupAction(data);
                break;

            default:
                console.log(`未處理的選單消息: ${eventName}`, data);
        }
    }

    /**
     * 處理群組動作
     * @param {Object} actionData - 動作數據
     */
    handleGroupAction(actionData) {
        const { action, params } = actionData;

        switch (action) {
            case 'close-all':
                this.close();
                break;

            case 'disable-all':
                this.disable();
                break;

            case 'enable-all':
                this.enable();
                break;

            default:
                console.log(`未知的群組動作: ${action}`);
        }
    }

    /**
     * 處理同組件錯誤
     * @param {Object} errorData - 錯誤數據
     */
    handlePeerError(errorData) {
        const { failedComponent, groupName, errorEvent } = errorData;
        
        console.log(`同組件發生錯誤: ${failedComponent}`, errorEvent);
        
        // 如果失敗的是主選單，關閉當前選單以避免衝突
        if (this.getState('isOpen')) {
            this.close();
        }
    }

    /**
     * 處理主組件選舉
     * @param {Object} electionData - 選舉數據
     */
    handleMasterElected(electionData) {
        const { groupName, previousMaster } = electionData;
        
        console.log(`成為主選單組件 (群組: ${groupName})`);
        
        // 主組件可以執行特殊邏輯
        this.element.classList.add('master-menu');
    }

    /**
     * 發送群組消息
     * @param {string} eventName - 事件名稱
     * @param {*} data - 消息數據
     */
    sendGroupMessage(eventName, data) {
        if (this.config.group) {
            this.communication.sendGroupMessage(this.config.group, eventName, data, {
                sender: this.componentId
            });
        }
    }

    /**
     * 重寫 open 方法以支持群組通信
     */
    open() {
        if (this.getState('isOpen') || this.getState('isDisabled') || !this.dropdownElement) {
            return;
        }

        // 如果是互斥群組，先關閉其他選單
        if (this.config.exclusiveGroup && this.config.group) {
            this.sendGroupMessage('menu:sync-close', {});
        }
        
        this.setState({ isOpen: true });
        
        // 更新位置
        if (this.config.autoPosition) {
            this.updatePosition();
        }
        
        this.emit('menu:open', { element: this.element, dropdown: this.dropdownElement });
    }

    /**
     * 重寫 render 方法以包含錯誤處理
     */
    render() {
        return this.safeExecute(() => {
            // 確保選單有正確的類別
            if (!this.element.classList.contains('cg-menu')) {
                this.element.classList.add('cg-menu');
            }
            
            // 標記為已渲染
            if (!this.element.classList.contains('cg-menu-rendered')) {
                this.element.classList.add('cg-menu-rendered');
            }
            
            // 初始化下拉選單狀態
            if (this.dropdownElement) {
                this.updateDropdownState();
            }
            
            // 更新選單狀態
            this.updateMenuState();
        }, 'RENDER_ERROR');
    }

    /**
     * 重寫 enable 方法以支持群組通信
     */
    enable() {
        this.setState({ isDisabled: false });
        this.emit('menu:enabled', { element: this.element });
        
        // 通知群組中的其他選單
        this.sendGroupMessage('menu:sync-disable', { disable: false });
    }

    /**
     * 重寫 disable 方法以支持群組通信
     */
    disable() {
        // 先關閉選單
        if (this.getState('isOpen')) {
            this.close();
        }
        
        this.setState({ isDisabled: true });
        this.emit('menu:disabled', { element: this.element });
        
        // 通知群組中的其他選單
        this.sendGroupMessage('menu:sync-disable', { disable: true });
    }

    /**
     * 銷毀組件
     */
    destroy() {
        // 清除計時器
        if (this.hoverTimer) {
            clearTimeout(this.hoverTimer);
        }
        
        // 關閉選單
        if (this.getState('isOpen')) {
            this.close();
        }
        
        super.destroy();
    }
}

// 自動初始化函數（向後相容）
function menu() {
    let menus = document.querySelectorAll('.cg-menu:not(.cg-menu-rendered)');
    for (const menuElement of menus) {
        new MenuComponent(menuElement);
    }
}

document.addEventListener('DOMContentLoaded', menu);

// 註冊組件到框架（如果框架已初始化）
if (window.CGFramework && window.CGFramework.registerComponent) {
    window.CGFramework.registerComponent('menu', MenuComponent, {
        selector: '.cg-menu',
        autoInit: true
    });
}