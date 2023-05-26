type Point2D = { x: number, y: number };

//計算滑鼠位置，以canvas中心為原點，區分四個象限，座標值介於 0-1 之間
export const getMousePosition = (event: MouseEvent, container: HTMLElement): Point2D => {
    let rect = container.getBoundingClientRect();
    let mouse = { x: 0, y: 0 };
    mouse.x = ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
    mouse.y = - ((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;
    return mouse;
}

//計算滑鼠螢幕座標系位置，以canvas左上角為原點，往右為x座標正值，往下為y座標正值
export const getMouseScreenPosition = (mouse: Point2D | THREE.Vector2, container: HTMLElement): Point2D => {
    let rect = container.getBoundingClientRect();
    let client = {
        x: (mouse.x + 1) * 0.5 * (rect.right - rect.left) + rect.left,
        y: -(mouse.y - 1) * 0.5 * (rect.bottom - rect.top) + - rect.top
    }
    return client;
}