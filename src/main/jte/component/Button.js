import { BaseComponent } from '../src/core/BaseComponent.js';
import { getComponentCommunication } from '../src/core/ComponentCommunication.js';

/**
 * Button 組件
 * 提供按鈕的漣漪效果和互動功能
 */
export class ButtonComponent extends BaseComponent {
    constructor(element, config = {}) {
        super(element, config);

        // 設置預設配置
        this.config = {
            enableRipple: true,
            rippleDuration: 600,
            autoInit: true,
            group: config.group || null, // 組件群組
            ...config
        };

        // 獲取通信系統實例
        this.communication = getComponentCommunication();

        // 初始化狀態
        this.setState({
            isPressed: false,
            isDisabled: element.disabled || false,
            rippleActive: false
        });

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
        // 確保按鈕有正確的類別
        if (!this.element.classList.contains('cg-buttons')) {
            this.element.classList.add('cg-buttons');
        }

        // 標記為已渲染
        if (!this.element.classList.contains('cg-buttons-rippled')) {
            this.element.classList.add('cg-buttons-rippled');
        }

        // 設置按鈕狀態
        this.updateButtonState();
    }

    /**
     * 綁定事件監聽器
     */
    bindEvents() {
        // 綁定滑鼠事件
        this.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

        // 綁定觸控事件
        this.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // 監聽全域事件
        this.on('CG::BtnRipple', this.handleGlobalRipple.bind(this));
        this.on('BtnLoad', this.handleBtnLoad.bind(this));
    }

    /**
     * 處理滑鼠按下事件
     */
    handleMouseDown(event) {
        this.setState({ isPressed: true });
        this.emit('button:mousedown', { element: this.element, event });
    }

    /**
     * 處理滑鼠放開事件
     */
    handleMouseUp(event) {
        this.setState({ isPressed: false });

        if (this.config.enableRipple && !this.getState('isDisabled')) {
            this.createRipple(event);
        }

        this.emit('button:mouseup', { element: this.element, event });
        this.emit('button:click', { element: this.element, event });
    }

    /**
     * 處理滑鼠離開事件
     */
    handleMouseLeave(event) {
        this.setState({ isPressed: false });
        this.emit('button:mouseleave', { element: this.element, event });
    }

    /**
     * 處理觸控開始事件
     */
    handleTouchStart(event) {
        this.setState({ isPressed: true });
        this.emit('button:touchstart', { element: this.element, event });
    }

    /**
     * 處理觸控結束事件
     */
    handleTouchEnd(event) {
        this.setState({ isPressed: false });

        if (this.config.enableRipple && !this.getState('isDisabled')) {
            // 對於觸控事件，使用觸控點位置
            const touch = event.changedTouches[0];
            const syntheticEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                currentTarget: this.element
            };
            this.createRipple(syntheticEvent);
        }

        this.emit('button:touchend', { element: this.element, event });
    }

    /**
     * 創建漣漪效果
     */
    createRipple(event) {
        if (this.getState('rippleActive')) return;

        this.setState({ rippleActive: true });

        const button = event.currentTarget;
        const circle = document.createElement("span");
        const rect = button.getBoundingClientRect();
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.x - radius}px`;
        circle.style.top = `${event.clientY - rect.y - radius}px`;
        circle.classList.add("ripple");

        button.appendChild(circle);

        // 發送漣漪開始事件
        this.emit('button:ripple:start', { element: button, circle });

        setTimeout(() => {
            if (circle.parentNode) {
                circle.remove();
            }
            this.setState({ rippleActive: false });
            this.emit('button:ripple:end', { element: button });
        }, this.config.rippleDuration);
    }

    /**
     * 處理全域漣漪事件
     */
    handleGlobalRipple(eventData) {
        if (eventData.data && eventData.data === this.element) {
            this.createRippleFromElement();
        }
    }

    /**
     * 從元素創建漣漪效果（無事件對象）
     */
    createRippleFromElement() {
        const rect = this.element.getBoundingClientRect();
        const syntheticEvent = {
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
            currentTarget: this.element
        };
        this.createRipple(syntheticEvent);
    }

    /**
     * 處理按鈕載入事件
     */
    handleBtnLoad() {
        this.render();
        this.emit('button:loaded', { element: this.element });
    }

    /**
     * 更新按鈕狀態
     */
    updateButtonState() {
        const { isPressed, isDisabled } = this.getState();

        // 更新 disabled 狀態
        if (isDisabled) {
            this.element.setAttribute('disabled', 'disabled');
            this.element.classList.add('disabled');
        } else {
            this.element.removeAttribute('disabled');
            this.element.classList.remove('disabled');
        }

        // 更新 pressed 狀態
        if (isPressed) {
            this.element.classList.add('pressed');
        } else {
            this.element.classList.remove('pressed');
        }
    }

    /**
     * 狀態變更回調
     */
    onStateChange(oldState, newState) {
        // 當狀態變更時更新按鈕外觀
        if (oldState.isDisabled !== newState.isDisabled ||
            oldState.isPressed !== newState.isPressed) {
            this.updateButtonState();
        }
    }

    /**
     * 啟用按鈕
     */
    enable() {
        this.setState({ isDisabled: false });
        this.emit('button:enabled', { element: this.element });
    }

    /**
     * 禁用按鈕
     */
    disable() {
        this.setState({ isDisabled: true });
        this.emit('button:disabled', { element: this.element });
    }

    /**
     * 切換按鈕啟用狀態
     */
    toggle() {
        if (this.getState('isDisabled')) {
            this.enable();
        } else {
            this.disable();
        }
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
                        fields: ['isDisabled'], // 同步禁用狀態
                        direction: 'bidirectional'
                    },
                    errorRecovery: true,
                    messageRouting: true
                });
            } else {
                this.communication.addComponentToGroup(groupName, this.componentId);
            }

            console.log(`按鈕組件已加入群組: ${groupName}`);
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
            case 'button:sync-disable':
                if (data.disable !== undefined) {
                    this.setState({ isDisabled: data.disable }, { skipRender: false });
                }
                break;

            case 'button:sync-ripple':
                if (this.config.enableRipple && !this.getState('isDisabled')) {
                    this.createRippleFromElement();
                }
                break;

            case 'button:group-action':
                this.handleGroupAction(data);
                break;

            default:
                console.log(`未處理的按鈕消息: ${eventName}`, data);
        }
    }

    /**
     * 處理群組動作
     * @param {Object} actionData - 動作數據
     */
    handleGroupAction(actionData) {
        const { action, params } = actionData;

        switch (action) {
            case 'disable-all':
                this.disable();
                break;

            case 'enable-all':
                this.enable();
                break;

            case 'ripple-all':
                if (this.config.enableRipple && !this.getState('isDisabled')) {
                    this.createRippleFromElement();
                }
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
        
        // 可以在這裡實現錯誤恢復邏輯
        // 例如：如果是主按鈕失敗，其他按鈕可以接管某些功能
    }

    /**
     * 處理主組件選舉
     * @param {Object} electionData - 選舉數據
     */
    handleMasterElected(electionData) {
        const { groupName, previousMaster } = electionData;
        
        console.log(`成為主按鈕組件 (群組: ${groupName})`);
        
        // 主組件可以執行特殊邏輯
        this.element.classList.add('master-button');
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
     * 觸發點擊事件
     */
    click() {
        if (!this.getState('isDisabled')) {
            this.element.click();
        }
    }

    /**
     * 重寫 render 方法以包含錯誤處理
     */
    render() {
        return this.safeExecute(() => {
            // 確保按鈕有正確的類別
            if (!this.element.classList.contains('cg-buttons')) {
                this.element.classList.add('cg-buttons');
            }

            // 標記為已渲染
            if (!this.element.classList.contains('cg-buttons-rippled')) {
                this.element.classList.add('cg-buttons-rippled');
            }

            // 設置按鈕狀態
            this.updateButtonState();
        }, 'RENDER_ERROR');
    }

    /**
     * 重寫 enable 方法以支持群組通信
     */
    enable() {
        this.setState({ isDisabled: false });
        this.emit('button:enabled', { element: this.element });
        
        // 通知群組中的其他按鈕
        this.sendGroupMessage('button:sync-disable', { disable: false });
    }

    /**
     * 重寫 disable 方法以支持群組通信
     */
    disable() {
        this.setState({ isDisabled: true });
        this.emit('button:disabled', { element: this.element });
        
        // 通知群組中的其他按鈕
        this.sendGroupMessage('button:sync-disable', { disable: true });
    }
}

// 自動初始化函數（向後相容）
function ripple() {
    let buttons = document.querySelectorAll('.cg-buttons:not(.cg-buttons-rippled)');
    for (let button of buttons) {
        new ButtonComponent(button);
    }
}

// 向後相容的事件監聽器
document.addEventListener('CG::BtnRipple', (event) => {
    // 觸發全域事件，讓組件實例處理
    if (window.CGFramework && window.CGFramework.eventBus) {
        window.CGFramework.eventBus.emit('CG::BtnRipple', event.detail);
    }
});

document.addEventListener('BtnLoad', () => {
    // 觸發全域事件，讓組件實例處理
    if (window.CGFramework && window.CGFramework.eventBus) {
        window.CGFramework.eventBus.emit('BtnLoad');
    } else {
        // 如果框架未初始化，使用舊的初始化方式
        ripple();
    }
});

document.addEventListener('DOMContentLoaded', ripple);

// 註冊組件到框架（如果框架已初始化）
if (window.CGFramework && window.CGFramework.registerComponent) {
    window.CGFramework.registerComponent('button', ButtonComponent, {
        selector: '.cg-buttons',
        autoInit: true
    });
}