import * as THREE from 'three';
import { actionKeys } from '@constant/constants';
class KeyControl extends THREE.EventDispatcher {
    private _ismove: boolean;
    private _ismoveW: boolean;
    private _ismoveS: boolean;
    private _ismoveA: boolean;
    private _ismoveD: boolean;
    private _moveType: 'Running' | 'Walking';
    private _enabled: boolean;
    constructor() {
        super();
        this._ismove = false;
        this._ismoveW = false;
        this._ismoveS = false;
        this._ismoveA = false;
        this._ismoveD = false;
        this._moveType = 'Running';
        this._enabled = true;
        this._addEvent();
    }

    get ismove() { return this._ismove; }
    get isW() { return this._ismoveW; }
    get isS() { return this._ismoveS; }
    get isA() { return this._ismoveA; }
    get isD() { return this._ismoveD; }
    get moveType() { return this._moveType; }
    get enabled() { return this._enabled; }
    set enabled(enabled: boolean) {
        this._enabled = enabled;
    }

    _addEvent = () => {
        window.addEventListener('keydown', this._keyDownListener);
        window.addEventListener('keyup', this._keyUpListener);
    }

    removeEvent = () => {
        window.removeEventListener('keydown', this._keyDownListener);
        window.removeEventListener('keyup', this._keyUpListener);
    }

    private _keyDownListener = (e: KeyboardEvent) => {
        e.preventDefault();
        let action = actionKeys.find((el) =>
            e.key == el.hotkey ||
            e.key == el.hotkey.toUpperCase()
        );
        if (action)
            this.dispatchEvent({
                type: 'action',
                message: { type: 'additive', action: action.key }
            });
        else {
            if (!this._enabled) return;
            switch (e.key) {
                case 'w':
                case 'W':
                    this._ismoveW = true;
                    break;
                case 's':
                case 'S':
                    this._ismoveS = true;
                    break;
                case 'd':
                case 'D':
                    this._ismoveD = true;
                    break;
                case 'a':
                case 'A':
                    this._ismoveA = true;
                    break;
                default:
                    break;
            }
            switch (e.key) {
                case 'w':
                case 'W':
                case 's':
                case 'S':
                case 'd':
                case 'D':
                case 'a':
                case 'A':
                    this._ismove = true;
                    this.dispatchEvent({
                        type: 'action',
                        message: { type: 'base', action: this._moveType }
                    });
                    break;
                default:
                    break;
            }
        }
    }

    private _keyUpListener = (e: KeyboardEvent) => {
        if (!this._enabled) return;
        e.preventDefault();
        switch (e.key) {
            case 'w':
            case 'W':
                this._ismoveW = false;
                break;
            case 's':
            case 'S':
                this._ismoveS = false;
                break;
            case 'd':
            case 'D':
                this._ismoveD = false;
                break;
            case 'a':
            case 'A':
                this._ismoveA = false;
                break;
            case 'Shift':
                this._moveType = this._moveType == 'Running' ? 'Walking' : 'Running';
                this.dispatchEvent({
                    type: 'moveType-change',
                });
                break;
            default:
                break;
        }
        if (this._ismove && (!this._ismoveW && !this._ismoveS && !this._ismoveA && !this._ismoveD)) {
            this._ismove = false;
            this.dispatchEvent({
                type: 'action',
                message: { type: 'additive', action: 'Idle' }
            });
        }
    }

}

export default KeyControl;