import './index.scss';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { excutebotAction, excuteButtonClick, stateSeletor } from '@feature/keyboardSlice';
import { actionKeys } from '@constant/constants';
const KeyBoard = () => {
    const action = useSelector(stateSeletor) as { state: string };
    const dispatch = useDispatch();
    const handleActions = (action: string) => {
        //if async, it can use batch from 'react-redux'
        dispatch(excutebotAction(action));
        dispatch(excuteButtonClick());
    }
    return (
        <section className='keyboard'>
            <div className='state'>{action.state}</div>
            <div className='emo'>
                {
                    actionKeys.map((item) => {
                        return (
                            <Button key={item.key} onClick={(e) => handleActions(item.key)}>
                                {item.key} <br />( {item.hotkey.toUpperCase()} )
                            </Button>
                        )
                    })
                }
            </div>
            <div className='curve'>
                <Button key='Reset' onClick={() => handleActions('Reset')}>
                    Reset<br />curve
                </Button>
                <Button key='Pass' onClick={() => handleActions('Pass')}>
                    Move<br />along<br />curve
                </Button>
            </div>
        </section >
    )
}

export default KeyBoard;