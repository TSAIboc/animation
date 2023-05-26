declare interface Editor3D {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera | null;
    control: ArcballControls | null;
    initialize: (ref: HTMLElement | null) => void;
    animate: () => void;
}
export { Editor3D };