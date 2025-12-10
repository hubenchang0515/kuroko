
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from './components/Typography'
import { Link, Route, Routes } from 'react-router-dom';
import Peer from "peerjs";
import SendPage from './pages/SendPage';
import RecvPage from './pages/RecvPage';

function App() {
    const { t } = useTranslation();
    const [peer, setPeer] = useState<Peer>()

    const open = useCallback(() => {
        setPeer(undefined);
        const peer = new Peer();
        peer.on('open', () => {
            setPeer(peer);
        });
    }, [])

    useEffect(() => {
        peer?.on("disconnected", ()=>{
            open();
        });

        return () => {
            peer?.off("disconnected");
            peer?.destroy();
        }
    }, [peer, open])

    useEffect(() => {
        open();
    }, [open])

    return (
        <div className='w-full h-full bg-rose-50 overflow-auto'>
            <div className='max-w-7xl h-full flex flex-col items-center gap-3 m-auto p-2'>
                <Typography variant='title'>{t('title')}</Typography>
                <Typography variant='weaken'>{t('subtitle')}</Typography>
                <Routes>
                    <Route path='/' element={<SendPage peer={peer}/>}/>
                    <Route path='/recv' element={<RecvPage peer={peer}/>}/>
                </Routes>
                <Typography variant='weaken'>
                    <span className='flex gap-1'>
                        <Link to="https://xplanc.org/" target='_blank'>{t('my-home')}</Link>
                        <Link to="https://github.com/hubenchang0515/kuroko" target='_blank'>{t('source')}</Link>
                    </span>
                </Typography>
                <Typography variant='weaken'>Powered by <Link to="https://peerjs.com/" target='_blank'>PeerJS</Link></Typography>
            </div>
        </div>
    )
}

export default App
