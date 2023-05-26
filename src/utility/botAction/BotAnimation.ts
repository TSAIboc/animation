import * as THREE from 'three';

type baseType = {
    [action: string]: { [weight: string]: number }
}
type actionContent = {
    [propName: string]: THREE.AnimationAction
}
export type actionTypes = 'Idle' | 'Walking' | 'Running' | 'Dance' | 'Death' | 'Sitting' |
    'Standing' | 'Jump' | 'Yes' | 'No' | 'Wave' | 'Punch' | 'ThumbsUp';
//TODO: fadeIn/fadeOut between 'Running' and 'Walking'
class BotAnimation {
    private _baseTypes: baseType;
    private _additiveTypes: baseType;
    private _baseActions: actionContent;
    private _additiveActions: actionContent;
    private _mixer: THREE.AnimationMixer | null;

    constructor(rootObject: THREE.Object3D) {
        this._baseTypes = {
            Idle: { weight: 1 },
            Walking: { weight: 0 },
            Running: { weight: 0 },
        };
        this._additiveTypes = {
            Dance: { weight: 0 },
            Death: { weight: 0 },
            Sitting: { weight: 0 },
            Standing: { weight: 0 },
            Jump: { weight: 0 },
            Yes: { weight: 0 },
            No: { weight: 0 },
            Wave: { weight: 0 },
            Punch: { weight: 0 },
            ThumbsUp: { weight: 0 }
        };
        this._baseActions = {};
        this._additiveActions = {};

        this._mixer = new THREE.AnimationMixer(rootObject);
    }

    activeActions = (animations: THREE.AnimationClip[]): void => {
        if (!this._mixer) return;
        for (let i = 0; i !== animations.length; ++i) {
            let clip = animations[i];
            const name = clip.name;
            if (this._baseTypes[name]) {
                const action = this._mixer.clipAction(clip);
                this._activateAction(action, 'base');
                this._baseActions[name] = action;
            }
            else if (this._additiveTypes[name]) {
                // Make the clip additive and remove the reference frame
                THREE.AnimationUtils.makeClipAdditive(clip);
                const action = this._mixer.clipAction(clip);
                action.clampWhenFinished = true;
                action.loop = THREE.LoopOnce;
                this._activateAction(action, 'additive');
                this._additiveActions[name] = action;
            }
        }
    }

    private _activateAction = (action: THREE.AnimationAction, type: 'base' | 'additive'): void => {
        const clip = action.getClip();
        const settings = this._baseTypes[clip.name] || this._additiveTypes[clip.name];
        action.enabled = true;
        if (type == 'additive')
            action.reset();
        action
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(settings.weight)
            .play();
    }

    private _setWeight = (type: 'base' | 'additive', action: THREE.AnimationAction, weight: number) => {
        action.enabled = true;
        if (type == 'additive')
            action.reset();
        action
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(weight);
    }

    setCurrentAction = (actionType: actionTypes): void => {
        let actions: actionContent | null = null;
        let type: 'base' | 'additive' = 'base';

        if (this._baseTypes.hasOwnProperty(actionType)) {
            //Only 'Death' can not action with base type at the same time.
            let death = this._additiveActions['Death'];
            actions = { ...this._baseActions, death };
        }
        else if (this._additiveTypes.hasOwnProperty(actionType)) {
            actions = this._additiveActions;
            type = 'additive';
        }
        else
            actions = null;

        if (!actions) {
            console.log('There is no action.');
            return;
        };
        for (const key in actions) {
            let weight = key == actionType ? 1 : 0;
            this._setWeight(type, actions[key], weight);
        }
    }

    update = (mixerUpdateDelta: number) => {
        if (this._mixer)
            this._mixer.update(mixerUpdateDelta);
    }
}

export default BotAnimation;