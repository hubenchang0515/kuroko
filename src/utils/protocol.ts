export interface Message {
    type: 'request' | 'response';
    method: 'list' | 'download' | 'abort';
}

export interface ListRequest extends Message {
    type: 'request';
    method: 'list';
}

export interface ListResponse extends Message {
    type: 'response';
    method: 'list';
    list: {
        name: string;
        size: number;
    }[];
}

export interface DownloadRequest extends Message {
    type: 'request';
    method: 'download';
    index: number;
}

export interface DownloadResponse extends Message {
    type: 'response';
    method: 'download';
    index: number;
    name: string;
    size: number;
    done: boolean;
    pos?: number;
    block?: number;
    data?: ArrayBuffer;
}