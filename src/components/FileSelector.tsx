import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import Typography from "./Typography";
import { formatBytes } from "../utils/utils";
import RemoveIcon from "../assets/RemoveIcon";

export interface FileSelectorProps extends React.HTMLAttributes<HTMLElement> {
    files: File[];
    onFilesChanged: (v:File[])=>void;
}

export default function FileSelector(props:FileSelectorProps) {
    const { t } = useTranslation();
    const dropRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = useCallback((newFiles: FileList | null) => {
        if (!newFiles) return;
        props.onFilesChanged(props.files.concat(Array.from(newFiles)));
    }, [props]);

    const removeFile = useCallback((index:number) => {
        props.onFilesChanged(props.files.filter((_, i) => i !== index));
    }, [props])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dropRef.current?.classList.add("border-blue-500");
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dropRef.current?.classList.remove("border-blue-500");
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dropRef.current?.classList.remove("border-blue-500");
        addFiles(e.dataTransfer.files);
    }, [addFiles]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        addFiles(e.target.files);
    }, [addFiles]);

    const handleClick = useCallback(() => {
        inputRef.current?.click();
    }, []);

    return (
        <div className={props.className}>
            <div className="w-full h-full flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                    {
                        props.files.map((file,i) => {
                            return (
                                <div key={i} className="rounded-md px-4 py-2 font-medium shadow text-black bg-pink-50 flex gap-2 items-center fade-in-from-left">
                                    <div className="flex-1 flex gap-2 justify-between items-baseline overflow-hidden">
                                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">{file.name}</span>
                                    <span className="whitespace-nowrap text-xs text-slate-500">{formatBytes(file.size)}</span>
                                    </div>
                                    <button className="cursor-pointer active:scale-95 hover:text-red-500" onClick={()=>removeFile(i)}><RemoveIcon/></button>
                                </div>
                            )
                        })
                    }
                </div>
                <div
                    ref={dropRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick} // 整个 div 可点击
                    className="w-full flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg
                                hover:border-blue-400 transition-colors cursor-pointer text-gray-500 text-center  min-h-40"
                >
                    <Typography variant="highlight">{t('select-files')}</Typography>
                    <Typography variant="weaken">{t('warning')}</Typography>
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        onChange={handleChange}
                        multiple
                    />
                </div>
            </div>
        </div>
    );
}