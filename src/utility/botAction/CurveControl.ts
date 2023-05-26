import * as THREE from 'three';
import { curvefit } from '../curvefitting';
import { drawPoints, drawLines, drawDashLine } from '../draw/draw';
import DragControl from './DragControl';
type points = THREE.Vector3[] | { x: number, y: number, z: number }[];

import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

const controlPoints = [
    new THREE.Vector3(10, 0, 0),
    new THREE.Vector3(15, 5, 0),
    new THREE.Vector3(20, 15, 0),
    new THREE.Vector3(0, 25, 0),
    new THREE.Vector3(-20, 15, 0),
    new THREE.Vector3(-15, 5, 0),
    new THREE.Vector3(-10, 0, 0)
];
class CurveControl {
    _controlPoints: points;
    _passPoints: points;
    _distance: number;
    private _container: HTMLElement | null;
    private _camera: THREE.PerspectiveCamera | THREE.OrthographicCamera | null;
    private _scene: THREE.Scene | null;
    private _control: DragControl | null;
    private _lineObject: Line2 | null;
    private _dashLineObject: THREE.Line | null;
    private _enabled: boolean;
    constructor(scene: THREE.Scene | null, camera: THREE.PerspectiveCamera | THREE.OrthographicCamera | null, container: HTMLElement | null) {
        this._controlPoints = [];
        this._passPoints = [];
        this._distance = 0;

        this._scene = scene;
        this._camera = camera;
        this._container = container;

        this._control = null;
        this._dashLineObject = null;
        this._lineObject = null;
        this._enabled = true;
    }

    get passPoints() { return this._passPoints; }
    get controlPoints() { return this._controlPoints; }
    get distance() { return this._distance; }
    get enabled() { return this._enabled; }
    set enabled(enabled: boolean) {
        this._enabled = enabled;
        if (this._control)
            this._control.enabled = enabled;
    }

    toExample = () => {
        let curve = curvefit(controlPoints);
        this._controlPoints = controlPoints;
        this._passPoints = curve.vector3D;
        this._distance = curve.distance;

        if (this._scene) {
            let pointsLine = drawLines(this._passPoints);
            let controls = drawPoints(this._controlPoints, 0xff0000, 0.4);
            let dashline = drawDashLine(this._controlPoints as THREE.Vector3[]);
            this._setControl(controls.children);

            let object = new THREE.Object3D();
            object.add(pointsLine);
            object.add(controls);
            object.add(dashline);

            this._scene.add(object);

            this._lineObject = pointsLine;
            this._dashLineObject = dashline;
        }
    }

    reset = () => {
        if (!this._control) return;
        for (let i = 0; i < controlPoints.length; ++i) {
            let position = controlPoints[i];
            this._control.rootsObject[i].position.set(position.x, position.y, position.z)
        }
        this._updateCurve();
    }

    _setControl = (objects: THREE.Object3D[]) => {
        if (!this._camera) return;
        if (!this._container) return;

        this._control = new DragControl(this._camera, this._container, objects);
        (this._control as THREE.EventDispatcher).addEventListener('dragMouseMove', this._dragObjectMouseMove);
    }

    _dragObjectMouseMove = (event: { [type: string]: { type: string, object: THREE.Object3D | null } }) => {
        if (!event.object) return;
        this._updateCurve();
    }

    _updateCurve = () => {
        if (!this._control) return;
        if (!this._lineObject) return;
        if (!this._dashLineObject) return;

        let objects = this._control.rootsObject;

        let vector3Ds = new Array(objects.length);
        for (let i = 0; i < objects.length; ++i) {
            vector3Ds[i] = objects[i].position;
        }

        let curve = curvefit(vector3Ds);
        let positions = new Array(curve.vector3D.length * 3)
        for (let i = 0; i < curve.vector3D.length; ++i) {
            positions[i * 3] = curve.vector3D[i].x;
            positions[i * 3 + 1] = curve.vector3D[i].y;
            positions[i * 3 + 2] = curve.vector3D[i].z;
        }

        //There is a display bug if does not set the geometry to new LineGeometry
        this._lineObject.geometry = new LineGeometry();
        this._lineObject.geometry.setPositions(positions);

        let dashgeometry = this._dashLineObject.geometry as THREE.BufferGeometry;
        dashgeometry.setFromPoints(vector3Ds);

        this._controlPoints = vector3Ds;
        this._passPoints = curve.vector3D;
        this._distance = curve.distance;
    }

    computeRestDistance = (currentPosition: THREE.Vector3) => {
        let _currentIndex = this._findPassIndex(currentPosition);
        if (_currentIndex) {
            let distance = 0;
            for (let i = _currentIndex; i < this._passPoints.length - 1; i++) {
                distance += (this._passPoints[i] as THREE.Vector3).distanceTo(this._passPoints[i + 1] as THREE.Vector3)
            }
            return distance;
        }
        return 0;
    }

    _findPassIndex = (position: THREE.Vector3) => {
        let _index: number | null = null;
        for (let i = 0; i < this._passPoints.length; i++) {
            if (Math.abs(position.x - this._passPoints[i].x) < 0.000001 &&
                Math.abs(position.y - this._passPoints[i].y) < 0.000001 &&
                Math.abs(position.z - this._passPoints[i].z) < 0.000001
            ) {
                _index = i;
                break;
            }
        }
        return _index;
    }

}

export default CurveControl;