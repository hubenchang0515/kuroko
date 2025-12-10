import { useCallback, useEffect, useState } from "react";
import FileSelector from "../components/FileSelector";
import { useTranslation } from "react-i18next";
import Peer from "peerjs";
import QRCode from "qrcode";
import UploadIcon from "../assets/UploadIcon";
import DownloadIcon from "../assets/DownloadIcon";
import { Link } from "react-router-dom";
import type { DownloadRequest, DownloadResponse, ListResponse, Message } from "../utils/protocol";
import { sleep } from "../utils/utils";

export default function SendPage(props:{peer?:Peer}) {
    const { t } = useTranslation();
    const [qrcode, setQrcode] = useState<string>();
    const [files, setFiles] = useState<File[]>([]);
    const shareLink = `${window.location.origin}${window.location.pathname}#/recv?id=${props.peer?.id}`;
    useEffect(() => {
        if (props.peer) {
            QRCode.toDataURL(shareLink).then(setQrcode);
        }
    }, [props.peer]);

    useEffect(() => {
        if (!props.peer) return;
 
        props.peer.on('connection', (conn) => {
            conn.on('close', () => conn.close());
            conn.on('data', (data) => {
                const request = data as Message;
                switch (request.method) {
                    case 'list': {
                        const response:ListResponse = {
                            type:'response', 
                            method:'list', 
                            list:files.map((file)=>{return {name:file.name, size:file.size}}),
                        };
                        conn.send(response);
                        break;
                    }

                    case 'download': {
                        const request = data as DownloadRequest;
                        const index = request.index;
                        const reader = files[index].stream().getReader();
                        let pos = 0;
                        const read = () => {
                            reader.read().then(async ({done, value}) => {
                                const response:DownloadResponse = {
                                    type:'response', 
                                    method:'download', 
                                    index: index,
                                    name: files[index].name,
                                    size: files[index].size,
                                    done: done,
                                    pos: pos,
                                    block: value?.byteLength,
                                    data: value?.buffer,
                                };
                                
                                pos += value?.byteLength || 0;
                                conn.send(response);
                                await sleep(1);

                                if (!done) {
                                    read();
                                }
                            });
                        }
                        read();
                        break;
                    }
                }
            });
        })

        return () => {
            if (!props.peer) return;
            props.peer.off('connection');
        }
    }, [props.peer, files]);

    const copyId = useCallback(() => {
        if (props.peer) {
            navigator.clipboard.writeText(props.peer.id);
        }
    }, [props.peer]);

    const copyUrl = useCallback(() => {
        if (props.peer) {
            navigator.clipboard.writeText(shareLink);
        }
    }, [props.peer]);

    return (
        <div className='w-full flex-1 flex flex-col items-center gap-3'>
            <div className="flex gap-2">
                <Link className="flex gap-1 cursor-pointer px-6 py-3 rounded-md font-medium shadow transition-all duration-200 ease-in-out focus:outline-none flex gap-1 bg-[#39c5bb] text-white hover:bg-[#60d0c8] active:scale-95 active:shadow-inner" to='/'><UploadIcon/>{t('send')}</Link>
                <Link className="flex gap-1 cursor-pointer px-6 py-3 rounded-md font-medium shadow transition-all duration-200 ease-in-out focus:outline-none flex gap-1 bg-gray-200 text-gray-900 hover:bg-[#60d0c8] active:scale-95 active:shadow-inner" to='/recv'><DownloadIcon/>{t('recv')}</Link>
            </div>
            { props.peer ? <img className="size-40 border-none fade-in-from-left" src={qrcode}/> : <div className="size-40"/>}
            <p className="text-md sm:text-sm bg-gradient-to-r from-[#e91e63] to-[#d500f9] bg-clip-text text-transparent drop-shadow-md fade-in-from-left">
                { props.peer ? props.peer.id : t('waiting')}
            </p>
            { 
                !props.peer ? <></> :
                <div className="flex gap-2 fade-in-from-left">
                    <button className="rounded-md px-4 py-2 cursor-pointer font-medium shadow text-black bg-[#66CCFF] hover:bg-[#84d6ff] active:scale-95 w-30" onClick={copyId}>{t('copy-id')}</button>
                    <button className="rounded-md px-4 py-2 cursor-pointer font-medium shadow text-black bg-[#66CCFF] hover:bg-[#84d6ff] active:scale-95 w-30" onClick={copyUrl}>{t('copy-url')}</button>
                </div>
            }
            { props.peer ? <FileSelector files={files} onFilesChanged={setFiles} className='w-full flex-1 flex flex-col fade-in-from-left'/> : <div className="flex-1"/> }
        </div>
    )
}