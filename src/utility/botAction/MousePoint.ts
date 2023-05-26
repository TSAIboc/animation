import * as THREE from 'three';
import { acceleratedRaycast } from "three-mesh-bvh";
THREE.Mesh.prototype.raycast = acceleratedRaycast;

import { getMousePosition } from '@utility/getMousePosition';

class MousePoint extends THREE.EventDispatcher {
    private _raycaster: THREE.Raycaster;
    private _container: HTMLElement | null;
    private _camera: THREE.PerspectiveCamera | THREE.OrthographicCamera | null;
    private _rootObjects: THREE.Object3D[];
    private _mouseVector3D: THREE.Vector3 | null;
    private _enabled: boolean;
    constructor(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera, container: HTMLElement, rootObject: THREE.Object3D[]) {
        super();
        this._raycaster = new THREE.Raycaster();
        this._container = container;
        this._camera = camera;
        this._rootObjects = rootObject;
        this._mouseVector3D = null;
        this._enabled = true;
        this._addEvent();
    }

    get enabled() { return this._enabled; }
    set enabled(enabled: boolean) {
        this._enabled = enabled;
    }

    _addEvent = () => {
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);
    }
    removeEvent = () => {
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mouseup', this._onMouseUp);
    }

    _onMouseMove = (event: MouseEvent) => {
        if (!this._camera) return;
        if (!this._container) return;

        let vector2D = getMousePosition(event, this._container);
        let mouse = new THREE.Vector2(vector2D.x, vector2D.y);

        this._raycaster.firstHitOnly = false;
        this._raycaster.setFromCamera(mouse, this._camera);

        const res = this._raycaster.intersectObjects(this._rootObjects);

        this._mouseVector3D = res.length > 0 ? res[0].point : null;

        this.dispatchEvent({ type: 'mouseMove', message: this._mouseVector3D });
    }
    _onMouseUp = (event: MouseEvent) => {
        if (!this._enabled) return;
        if (event.button != 0) return;
        if (this._mouseVector3D)
            this.dispatchEvent({ type: 'mouseUp', message: this._mouseVector3D });
    }
}

export default MousePoint;
