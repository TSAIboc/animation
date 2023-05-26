import * as THREE from 'three';
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls';

export interface Editor3D {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera | null;
    control: ArcballControls | null;
    container: HTMLElement | null;
    initialize: (ref: HTMLElement | null) => void;
    animate: () => void;
    remove: () => void;
}

export type actionTypes = 'Idle' | 'Walking' | 'Running' | 'Dance' | 'Death' | 'Sitting' |
    'Standing' | 'Jump' | 'Yes' | 'No' | 'Wave' | 'Punch' | 'ThumbsUp';
