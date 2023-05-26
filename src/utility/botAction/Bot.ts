'use client'
import * as THREE from 'three';
import { actionKeys } from '@constant/constants';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Editor3D, actionTypes } from '@type/index';
import BotAnimation from './BotAnimation';
import KeyControl from './KeyControl';
import MousePoint from './MousePoint';
import CurveControl from './CurveControl';

enum MoveTypeVelocity {
    Walking = 0.07,
    Running = 0.15
}

class BotAction extends THREE.EventDispatcher {
    _editor: Editor3D | null;
    _model: THREE.Object3D | null;
    _BotAnimation: BotAnimation | null;
    _KeyControl: KeyControl | null;
    _MousePoint: MousePoint | null;
    _modelEndPosition: THREE.Vector3 | null;
    _progress: number;
    _velocity: number;
    _movePassPosition: THREE.Vector3[];
    _totalTimes: number;
    _timeInterval: number;
    _CurveContorl: CurveControl | null;
    _enabled: boolean;
    _clock: THREE.Clock;
    _grid: THREE.Object3D | null;
    _animate: boolean;
    _botMoveType: 'Running' | 'Walking';
    constructor() {
        super();
        this._editor = null;
        this._model = null;
        this._BotAnimation = null;
        this._KeyControl = null;
        this._MousePoint = null;

        this._modelEndPosition = null;
        this._movePassPosition = [];
        this._progress = 0;
        this._velocity = MoveTypeVelocity.Running;
        this._totalTimes = 1;
        this._timeInterval = 0;

        this._CurveContorl = null;
        this._enabled = true;

        this._clock = new THREE.Clock();
        this._grid = null;
        this._animate = false;
        this._botMoveType = 'Running';
    }

    set enabled(enabled: boolean) {
        this._enabled = enabled;
    }
    get model() { return this._model; }

    setEnvironment = (editor: Editor3D) => {
        this._editor = editor;
    }

    load = (path: string, callback?: React.Dispatch<React.SetStateAction<THREE.Object3D | null>>) => {
        if (!this._editor) return;
        const loader = new GLTFLoader();
        loader.load(path,
            (gltf) => {
                const { scene, animations } = gltf;

                this._model = scene;
                this._addScene();

                let botAnimation = new BotAnimation(scene);
                botAnimation.activeActions(animations);
                this._BotAnimation = botAnimation;

                this.animate();

                if (callback) callback(this._model);
            },
            undefined
            , function (e) {
                console.error(e);
            });


    }

    setMaps = () => {
        if (!this._editor) return;
        //add curve
        const { scene, camera, container } = this._editor;
        let fit = new CurveControl(scene, camera, container);
        fit.toExample();
        this._CurveContorl = fit;

        //add grid
        this._addGrid();

        //add event listeners
        let keyControl = new KeyControl();
        this._KeyControl = keyControl;
        (this._KeyControl as THREE.EventDispatcher).addEventListener('action', this._botKeyPressAction);
        (this._KeyControl as THREE.EventDispatcher).addEventListener('moveType-change', this._botKeyUpMoveTypeChanged);

        if (camera && container && this._grid) {
            this._MousePoint = new MousePoint(camera, container, [this._grid]);
            (this._MousePoint as THREE.EventDispatcher).addEventListener('mouseUp', this._botMouseSpaceMove);
        }
        camera?.position.set(0, 19.4419, 77.70790);
    }

    _addScene = () => {
        if (!this._editor || !this._model) return;
        const { scene } = this._editor;
        scene.add(this._model);
        let skeleton = new THREE.SkeletonHelper(this._model);
        scene.add(skeleton);
    }

    _addGrid = () => {
        if (!this._editor) return;
        const { scene } = this._editor;
        const grid = new THREE.GridHelper(20, 20, 0x000000, 0x000000);
        (grid.material as THREE.Material).opacity = 0.1;
        (grid.material as THREE.Material).transparent = true;
        this._grid = grid;
        scene.add(grid);
    }

    setbotAction = (action: actionTypes, type: string = 'additive') => {
        if (action == 'Running' || action == 'Walking')
            this._animate = true;
        else if (action == 'Idle')
            this._animate = false;
        if (this._BotAnimation)
            this._BotAnimation.setCurrentAction(action);
        if (this._progress < 1 && type == 'base')
            this._progress = 1;
    }

    _botKeyPressAction = (event: { [type: string]: { type: string, action: actionTypes } }) => {
        if (!this._enabled) return;
        const { action, type } = event.message;
        this.setbotAction(action, type);
        this.dispatchEvent({ type: 'ui-state-changed', message: { state: action } });
    }

    //TODO: Change moveType between 'Running' and 'Walking' at any time even in 'Moving'
    //      need to consider current position and rest time with changed-velocity and fadeIn/fadeOut
    _botKeyUpMoveTypeChanged = () => {
        if (!this._KeyControl) return;
        if (this._animate) return;
        this._botMoveType = this._KeyControl.moveType;
        this._velocity = MoveTypeVelocity[this._botMoveType];
    }

    _setControlEnabled = (enabled: boolean) => {
        if (this._CurveContorl) this._CurveContorl.enabled = enabled;
        if (this._MousePoint) this._MousePoint.enabled = enabled;
        if (this._KeyControl) this._KeyControl.enabled = enabled;
    }

    _botAlongCurvePass = () => {
        if (!this._enabled) return;
        this.setbotAction(this._botMoveType);
        this._progress = 0;
        if (!this._CurveContorl) return;
        if (!this._model) return;

        //start and end to original position
        let passPoints = this._CurveContorl.passPoints as THREE.Vector3[];
        this._modelEndPosition = passPoints[passPoints.length - 1];

        const { position } = this._model;
        let currentPassPoints = this._computePassPosition(position, passPoints[0], this._velocity * 0.2);
        let extraPassPoints = this._computePassPosition(this._modelEndPosition, position, this._velocity * 0.2);
        this._movePassPosition = [...currentPassPoints, ...passPoints, ...extraPassPoints];

        let d1 = position.distanceTo(passPoints[0]);
        let d2 = position.distanceTo(this._modelEndPosition);
        let distance = this._CurveContorl.distance + d1 + d2;

        this._timeInterval = this._totalTimes / (distance / this._velocity);
    }

    _botMouseSpaceMove = (event: { [type: string]: THREE.Vector3 }) => {
        if (!this._enabled) return;
        if (!this._model) return;
        this.setbotAction(this._botMoveType);
        this._modelEndPosition = event.message;
        this._progress = 0;
        const { position } = this._model;
        this._movePassPosition = this._computePassPosition(position, this._modelEndPosition, this._velocity);
    }

    _computePassPosition = (startPosition: THREE.Vector3, endPosition: THREE.Vector3, velocity: number): THREE.Vector3[] => {
        const distance = endPosition.distanceTo(startPosition);
        this._timeInterval = this._totalTimes / (distance / velocity);

        let _mousePassPoints: THREE.Vector3[] = [];
        for (let i = 0; i < 1; i += this._timeInterval) {
            let point = new THREE.Vector3().lerpVectors(startPosition, endPosition, i);
            _mousePassPoints.push(point);
        }
        return _mousePassPoints;
    }

    //Mouse Click on grid motion
    _botMouseAnimate = () => {
        if (!this._model) return;
        if (!this._BotAnimation) return;
        if (!this._modelEndPosition) return;
        if (this._progress < this._totalTimes) {
            this.setbotAction(this._botMoveType);
            let count = Math.round(this._progress / this._timeInterval);

            let totalCount = this._totalTimes / this._timeInterval;

            let index = count > 0 ? Math.round(this._movePassPosition.length / totalCount * count) : 0;

            if (index >= this._movePassPosition.length)
                index = this._movePassPosition.length - 1

            let current = this._movePassPosition[index];
            let previous = index == 0 ? this._movePassPosition[0] : this._movePassPosition[index - 1];

            this._botRotation(current, previous);

            this._progress += this._timeInterval;
            if (index == this._movePassPosition.length - 1)
                this._progress = 1;
        }
        else {
            this._progress = this._totalTimes;
            if (this._KeyControl && this._KeyControl.ismove) return;
            this.setbotAction('Idle');
            this._animate = false;
            this._model.quaternion.x = this._model.quaternion.z = 0;
            this._model.up.copy(new THREE.Vector3(0, 1, 0));
            this._setControlEnabled(true);
        }
    }

    _botRotation = (current: THREE.Vector3, previous: THREE.Vector3) => {
        if (!this._model) return;
        const { position, up } = this._model;
        let target = new THREE.Vector3().copy(current);
        let offsetAngle = 0;

        let matrix = new THREE.Matrix4();
        matrix.lookAt(target, position, up);

        this._model.position.set(current.x, current.y, current.z);

        matrix.multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, offsetAngle, 0)));
        let rotation = new THREE.Quaternion().setFromRotationMatrix(matrix);
        this._model.quaternion.copy(rotation);

        let tangent = new THREE.Vector3().copy(current).sub(previous);

        //inner normal of curve
        //if want to move along outter normal of curve, need to use tangent cross z axis
        let normal = new THREE.Vector3(0, 0, 1).cross(tangent).normalize();

        //if normal is (0, 1 ,0) or (0, -1 ,0) , it will not change the model up ( only move on grid )
        let copynormal = normal.x == 0 ? new THREE.Vector3(0, 1, 0) : normal;
        up.copy(copynormal);
    }

    //W,A,S,D motion
    _botKeyAnimate = () => {
        if (!this._model) return;

        const motion = this._KeyControl;

        if (!motion) return;
        if (!motion.ismove) return;

        let moveTranslationValue = this._velocity;
        let eulerY = 0;
        if (motion.isW) {
            eulerY = Math.PI;
            this._model.position.z -= moveTranslationValue;
        }
        if (motion.isS) {
            eulerY = 0;
            this._model.position.z += moveTranslationValue;
        }
        if (motion.isD) {
            eulerY = Math.PI * 0.5;
            this._model.position.x += moveTranslationValue;
        }
        if (motion.isA) {
            eulerY = -Math.PI * 0.5;
            this._model.position.x -= moveTranslationValue;
        }
        if (motion.isW && motion.isD) eulerY = Math.PI * 0.75;
        if (motion.isW && motion.isA) eulerY = Math.PI * 0.75 * -1;
        if (motion.isS && motion.isD) eulerY = Math.PI * 0.25;
        if (motion.isS && motion.isA) eulerY = Math.PI * 0.25 * -1;

        let matrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, eulerY, 0));
        let rotation = new THREE.Quaternion().setFromRotationMatrix(matrix);
        this._model.quaternion.slerp(rotation, 0.2);
    }

    animate = () => {
        window.requestAnimationFrame(this.animate.bind(this))

        //Get the time elapsed since the last frame, used for mixer update
        const mixerUpdateDelta = this._clock.getDelta();

        // Update the animation mixer, the stats panel, and render this frame
        if (this._BotAnimation)
            this._BotAnimation.update(mixerUpdateDelta);

        if (!this._animate) return;
        if (this._model && this._enabled) {
            this._botKeyAnimate();
            this._botMouseAnimate();
        }
    }

    onClick = (action: actionTypes | 'Reset' | 'Pass') => {
        let object = actionKeys.find((el) => el.key == action);
        if (object)
            this.setbotAction(action as actionTypes, 'additive');
        else {
            if (this._KeyControl && !this._KeyControl.enabled) return;
            if (action == 'Reset')
                this._CurveContorl?.reset();
            else if (action == 'Pass') {
                this._setControlEnabled(false);
                this._botAlongCurvePass();
            }
            else
                console.log('There is no button.');
        }
    }

}

export default BotAction;