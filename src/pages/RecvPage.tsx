import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Peer, { type DataConnection } from "peerjs";
import UploadIcon from "../assets/UploadIcon";
import DownloadIcon from "../assets/DownloadIcon";
import { Link, useSearchParams } from "react-router-dom";
import type { DownloadRequest, DownloadResponse, ListRequest, ListResponse, Message } from "../utils/protocol";
import { formatBytes, sleep } from "../utils/utils";
import streamSaver from 'streamsaver';
import LoopIcon from "../assets/LoopIcon";
import OkIcon from "../assets/OkIcon";

export default function RecvPage(props:{peer?:Peer}) {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [peerId, setPeerId] = useState(searchParams.get('id')??"");
    const [conn, setConn] = useState<DataConnection>();
    const [connecting, setConnecting] = useState(false);
    const [files, setFiles] = useState<{name:string, size:number}[]>([]);
    const [doing, setDoing] = useState<number[]>([]);
    const [done, setDone] = useState<number[]>([]);
    const streamsRef = useRef(new Map<number, WritableStreamDefaultWriter<Uint8Array<ArrayBufferLike>>>());

    const connect = useCallback((id:string) => {
        if (!props.peer) return;
        if (conn) conn.close();

        setConnecting(true);
        const newConn = props.peer.connect(id);
        
        newConn.on('open', () => {
            setConn(newConn);
            newConn?.on('data', (data) => {
                const message = data as Message;
                switch (message.method) {
                    case 'list': {
                        setFiles((data as ListResponse).list);
                        setDoing([]);
                        setDone([]);
                        newConn?.off('data');
                        break;
                    }
                }
            });

            newConn.on("close", () => {
                setDoing([]);
                setDone([]);
                setConn(undefined);
            })

            const message:ListRequest = {
                type:'request', 
                method:'list', 
            };
            newConn.send(message);
            setConnecting(false);
        });

        newConn.on("error", () => {
            setConnecting(false);
        })
    }, [props]);

    useEffect(() => {
        if (!props.peer || !peerId) return;
        connect(peerId);
    }, [props.peer, searchParams]);

    const download = useCallback((index:number) => {
        const promies = new Promise<void>((resolve) => {
            conn?.on('data', async (data) => {
                const message = data as Message;
                switch (message.method) {
                    case 'download': {
                        const response = data as DownloadResponse;
                        if (response.pos === 0) {
                            setDoing((doing)=>[...doing, response.index]);
                            const fileStream = streamSaver.createWriteStream(response.name, {size:response.size});
                            const writer = fileStream.getWriter();
                            streamsRef.current.set(response.index, writer);
                            await writer.write(new Uint8Array(response.data!));
                        } else if (response.done) {
                            const writer = streamsRef.current.get(response.index);
                            await writer?.close();
                            streamsRef.current.delete(response.index);
                            setDoing((doing)=>doing.filter(x => x != response.index));
                            setDone((done)=>[...done, response.index]);
                            conn?.off('data');
                            resolve();
                        } else {
                            const writer = streamsRef.current.get(response.index);
                            try {
                                await writer?.write(new Uint8Array(response.data!));
                            } catch {
                            }
                        }
                    }
                }
            });
        });
        const message:DownloadRequest = {
            type: 'request',
            method: 'download',
            index: index,
        }
        conn?.send(message);
        return promies;
    }, [conn]);

    const downloadAll = useCallback(async () => {
        for (let i = 0; i < files.length; i++) {
            if (doing.includes(i) || done.includes(i)) {
                continue;
            }
            await download(i);
            await sleep(10);
        }
    }, [files, doing, done,download]);

    return (
        <div className='w-full flex-1 flex flex-col items-center gap-3 '>
            <div className="flex gap-2">
                <Link className="flex gap-1 cursor-pointer px-6 py-3 rounded-md font-medium shadow transition-all duration-200 ease-in-out focus:outline-none flex gap-1 bg-gray-200 text-gray-900 hover:bg-[#60d0c8] active:scale-95 active:shadow-inner" to='/'><UploadIcon/>{t('send')}</Link>
                <Link className="flex gap-1 cursor-pointer px-6 py-3 rounded-md font-medium shadow transition-all duration-200 ease-in-out focus:outline-none flex gap-1 bg-[#39c5bb] text-white hover:bg-[#60d0c8] active:scale-95 active:shadow-inner" to='/recv'><DownloadIcon/>{t('recv')}</Link>
            </div>
            <input type="text" className="w-full border-2 border-gray-400 rounded-md p-2 text-center fade-in-from-right" placeholder={t("placeholder")} value={peerId} onChange={ev=>setPeerId(ev.target.value)}/>
            <div className="flex gap-2 fade-in-from-right">
                {
                    !connecting && doing.length === 0 ?
                    <button className="rounded-md px-4 py-2 cursor-pointer font-medium shadow text-black bg-[#66CCFF] hover:bg-[#84d6ff] active:scale-95 w-30" onClick={()=>connect(peerId)}>{conn ? t('refresh') : t('connect')}</button> :
                    <button className="rounded-md px-4 py-2 font-medium shadow text-black bg-gray-300 w-30" disabled>{conn ? t('refresh') : t('connect')}</button> 
                }
                { 
                    conn && doing.length === 0 ?
                    <button className={"rounded-md px-4 py-2 cursor-pointer font-medium shadow text-black bg-[#66CCFF] hover:bg-[#84d6ff] active:scale-95 w-30"} onClick={downloadAll}>{t('download')}</button> :
                    <button className={"rounded-md px-4 py-2 font-medium shadow text-black bg-gray-300 w-30"} disabled>{t('download')}</button>
                }
            </div>
            <p className="text-md sm:text-sm bg-gradient-to-r from-[#e91e63] to-[#d500f9] bg-clip-text text-transparent drop-shadow-md fade-in-from-right">
                { props.peer ? props.peer.id : t('waiting')}
            </p>
            <div className="flex flex-col gap-1 w-full">
                {
                    files.map((file,i) => {
                        return (
                            <div key={i} className="rounded-md px-4 py-2 font-medium shadow text-black bg-pink-50 flex gap-2 items-center fade-in-from-right">
                                <div className="flex-1 flex gap-2 justify-between items-baseline overflow-hidden">
                                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{file.name}</span>
                                <span className="whitespace-nowrap text-xs text-slate-500">{formatBytes(file.size)}</span>
                                </div>
                                {
                                    doing.includes(i) ? 
                                    <button className="text-green-500 animate-spin" disabled><LoopIcon/></button> : 
                                    done.includes(i) ? 
                                    <button className="text-green-500" disabled><OkIcon/></button> : 
                                    doing.length === 0 ?
                                    <button className="cursor-pointer active:scale-95 hover:text-green-500" onClick={()=>download(i)}><DownloadIcon/></button> :
                                    <button disabled><DownloadIcon/></button>
                                }
                                
                            </div>
                        )
                    })
                }
            </div>

            <div className="flex-1"/>
        </div>
    )
}