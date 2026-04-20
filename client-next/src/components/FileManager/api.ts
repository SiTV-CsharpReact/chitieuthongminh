import axios from 'axios';

// Using relative path for Next.js proxy/API routes
const BASE_URL = '/api/image';

export interface BackendFile {
    name: string;
    path: string;
    size: number;
    url: string;
}

export interface BackendFolder {
    name: string;
    path: string;
}

export interface TreeItem {
    name: string;
    path: string;
    children: TreeItem[];
}

export const api = {
    list: async (folder: string = '') => {
        const res = await axios.get(`${BASE_URL}/list`, { params: { folder } });
        return res.data;
    },

    upload: async (files: File[], folder: string = '') => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        const res = await axios.post(`${BASE_URL}/upload`, formData, {
            params: { folder },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    createFolder: async (name: string, parent: string = '') => {
        const res = await axios.post(`${BASE_URL}/create`, { name, parent });
        return res.data;
    },

    rename: async (oldPath: string, newName: string) => {
        const res = await axios.post(`${BASE_URL}/rename`, { oldPath, newName });
        return res.data;
    },

    move: async (source: string, target: string) => {
        const res = await axios.post(`${BASE_URL}/move`, { source, target });
        return res.data;
    },

    delete: async (items: { path: string }[]) => {
        const res = await axios.delete(`${BASE_URL}/delete`, { data: { items } });
        return res.data;
    },

    getTree: async () => {
        const res = await axios.get(`${BASE_URL}/tree`);
        return res.data;
    },

    search: async (keyword: string, folder: string = '') => {
        const res = await axios.get(`${BASE_URL}/search`, { params: { keyword, folder } });
        return res.data;
    },

    getStorageInfo: async () => {
        const res = await axios.get(`${BASE_URL}/storage`);
        return res.data;
    }
};
