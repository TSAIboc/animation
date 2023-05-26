"use client";
import React, { useEffect, useRef } from "react";
import { Editor3D } from '@types/3d';

const Canvas = (props: { id: string, editor: Editor3D }) => {
    const { id, editor } = props;
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (editor) {
            editor.initialize(ref.current);
            editor.animate();
            return () => {
                editor.remove();
            }
        }
    }, [editor])
    return (
        <div
            id={id}
            style={{ width: '100%', height: '100%', }}
            ref={ref}
        />
    );
}
export default Canvas;