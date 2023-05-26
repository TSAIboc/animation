import { Object3D } from 'three';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { stateSeletor } from '@feature/keyboardSlice';
import Canvas from './Canvas';

import useBot from '@useHook/useBot';
import useEditor from '@useHook/useEditor';

const CanvasDraw = () => {
    const [Bot2Model, setBot2Model] = useState<Object3D | null>(null);
    const action = useSelector(stateSeletor) as { state: string, isButtonClick: boolean };

    const editor = useEditor('window1');
    const Bot = useBot(editor, `/assets/gltf/RobotExpressive.glb`);
    const Bot2 = useBot(editor, `/assets/gltf/RobotExpressive.glb`, setBot2Model);

    useEffect(() => {
        if (Bot) Bot.setMaps();
    }, [editor]);

    useEffect(() => {
        if (Bot2 && Bot2Model) {
            Bot2.enabled = false;
            Bot2Model.position.set(-5, 0, 0);
            Bot2.setbotAction('Death');
        }
    }, [Bot2Model]);

    useEffect(() => {
        if (Bot) Bot.onClick(action.state);
    }, [action.isButtonClick])

    return (
        <>
            <Canvas
                id={'window1'}
                editor={editor}
            />
        </>
    )

}

export default CanvasDraw;