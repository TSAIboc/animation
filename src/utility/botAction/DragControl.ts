import * as THREE from 'three';
import { acceleratedRaycast } from "three-mesh-bvh";
THREE.Mesh.prototype.raycast = acceleratedRaycast;

import { getMousePosition } from '@utility/getMousePosition';

class DragControl extends THREE.EventDispatcher {
    private _raycaster: THREE.Raycaster;
    private _container: HTMLElement | null;
    private _camera: THREE.PerspectiveCamera | THREE.OrthographicCamera | null;
    private _rootObjects: THREE.Object3D[];
    private _insecPlane: THREE.Plane;
    private _insecPoint: THREE.Vector3;
    private _offset: THREE.Vector3;
    private _worldPosition: THREE.Vector3;
    private _selectObject: THREE.Object3D | null;
    private _hovered: THREE.Object3D | null;
    private _hoversize: number;
    private _enabled: boolean;
    constructor(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera, container: HTMLElement, rootObject: THREE.Object3D[]) {
        super();
        this._raycaster = new THREE.Raycaster();
        this._container = container;
        this._camera = camera;
        this._rootObjects = rootObject;

        this._insecPlane = new THREE.Plane();
        this._insecPoint = new THREE.Vector3();
        this._offset = new THREE.Vector3();
        this._worldPosition = new THREE.Vector3();

        this._selectObject = null;
        this._hovered = null;

        this._hoversize = 1.4;
        this._enabled = true;

        this._addEvent();
    }

    get rootsObject() {
        return this._rootObjects;
    }
    get enabled() { return this._enabled; }
    set enabled(enabled: boolean) {
        this._enabled = enabled;
    }

    _addEvent = () => {
        if (!this._container) return;
        this._container.addEventListener('mousemove', this._onMouseMove);
        this._container.addEventListener('mousedown', this._onMouseDown);
        this._container.addEventListener('mouseup', this._onMouseUp);
    }
    removeEvent = () => {
        if (!this._container) return;
        this._container.removeEventListener('mousemove', this._onMouseMove);
        this._container.removeEventListener('mousedown', this._onMouseDown);
        this._container.removeEventListener('mouseup', this._onMouseUp);
    }

    _onMouseDown = (event: MouseEvent) => {
        if (!this._enabled) return;
        if (!this._camera) return;
        if (!this._container) return;
        if (event.button != 0) return;

        let vector2D = getMousePosition(event, this._container);
        let mouse = new THREE.Vector2(vector2D.x, vector2D.y);

        this._raycaster.firstHitOnly = false;
        this._raycaster.setFromCamera(mouse, this._camera);
        const res = this._raycaster.intersectObjects(this._rootObjects);

        if (res.length > 0) {
            this._selectObject = res[0].object;
            if (this._raycaster.ray.intersectPlane(this._insecPlane, this._insecPoint)) {
                if (this._selectObject.parent) {
                    this._offset.copy(this._insecPoint)
                        .sub(this._worldPosition.setFromMatrixPosition(this._selectObject.matrixWorld));

                }
                this._container.style.cursor = 'none';
            }
        }
    }

    _onMouseMove = (event: MouseEvent) => {
        if (!this._enabled) return;
        if (!this._camera) return;
        if (!this._container) return;

        let vector2D = getMousePosition(event, this._container);
        let mouse = new THREE.Vector2(vector2D.x, vector2D.y);
        this._raycaster.setFromCamera(mouse, this._camera);

        if (this._selectObject) {
            if (this._raycaster.ray.intersectPlane(this._insecPlane, this._insecPoint)) {
                let position = new THREE.Vector3().copy(
                    this._insecPoint.sub(this._offset)
                );
                this._selectObject.position.set(position.x, position.y, position.z);
                this.dispatchEvent({ type: 'dragMouseMove', object: this._selectObject });
            }
            return;
        }
        this._raycaster.setFromCamera(mouse, this._camera);
        let res = this._raycaster.intersectObjects(this._rootObjects);
        if (res.length > 0) {
            let _object = res[0].object;
            this._insecPlane.setFromNormalAndCoplanarPoint(
                this._camera.getWorldDirection(this._insecPlane.normal),
                this._worldPosition.setFromMatrixPosition(_object.matrixWorld)
            );
            if (this._hovered !== _object) {
                this._container.style.cursor = 'pointer';
                this._hovered = _object;
                this._hovered.scale.set(this._hoversize, this._hoversize, this._hoversize);
            }
        } else {
            if (this._hovered !== null) {
                this._container.style.cursor = 'auto';
                this._hovered.scale.set(1, 1, 1);
                this._hovered = null;
            }
        }
    }

    _onMouseUp = (event: MouseEvent) => {
        if (!this._container) return;
        if (this._selectObject)
            this._selectObject = null;
        this._container.style.cursor = this._hovered ? 'pointer' : 'auto';
    }

}

export default DragControl;