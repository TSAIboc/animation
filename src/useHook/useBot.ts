import { Event } from 'three';
import { useEffect, useState, useMemo } from 'react';
import { Editor3D } from '@types/3d';
import BotAction from '@utility/botAction/Bot';
import { excutebotAction } from '@feature/keyboardSlice';
import { useDispatch } from 'react-redux';
const useBot = (editor: Editor3D, path: string, callback?: void) => {
    const bot = useMemo(() => {
        return new BotAction();
    }, [])
    const dispatch = useDispatch();
    const uiEvent = (e: Event) => {
        dispatch(excutebotAction(e.message.state))
    }
    useEffect(() => {
        if (bot) {
            bot.setEnvironment(editor);
            bot.load(path, callback);
            bot.addEventListener('ui-state-changed', uiEvent);
        }
    }, [editor])
    return bot;
}

export default useBot;