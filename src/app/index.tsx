"use client";
import './style.scss';
import { useEffect } from 'react';

import KeyBoard from '@component/KeyBoard';
import CanvasDraw from '@component/Canvas';
import Description from '@component/Description';

const Home = () => {
  useEffect(() => {
    document.oncontextmenu = () => { return false; }
  }, []);

  return (
    <>
      <div className='canvas'>
        <CanvasDraw />
      </div>
      <div className='description'>
        <Description />
      </div>
      <div className='bottom'>
        <KeyBoard />
      </div>
    </>
  )
}

export default Home;