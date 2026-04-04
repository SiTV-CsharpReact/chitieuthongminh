import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import AssetGrid from './AssetGrid';
import { api, BackendFile, BackendFolder } from './api';
import { Asset, DirectoryNode } from './types';
import './FM.css';

interface FileManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

const FileManager: React.FC<FileManagerProps> = ({ isOpen, onClose, onSelect }) => {
    const [tree, setTree] = useState<DirectoryNode[]>([]);
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [creatingFolder, setCreatingFolder] = useState(false);

    const loadTree = async () => {
        try {
            const data = await api.getTree();
            setTree([{ name: 'ROOT', path: '', children: data }]);
        } catch (err) {
            console.error('Failed to load tree:', err);
        }
    };

    const loadAssets = useCallback(async (pathString: string) => {
        try {
            const data = await api.list(pathString);
            const parentId = pathString || 'ROOT';

            const folders: Asset[] = data.folders.map((f: BackendFolder) => ({
                id: f.path,
                name: f.name,
                type: 'folder',
                parentId,
            }));

            const files: Asset[] = data.files.map((f: BackendFile) => ({
                id: f.path,
                name: f.name,
                type: 'image',
                parentId,
                size: f.size,
                url: f.url
            }));

            setAssets([...folders, ...files]);
        } catch (err) {
            console.error('Failed to load assets:', err);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadTree();
            const pathStr = currentPath.join('/');
            loadAssets(pathStr);
        }
    }, [isOpen, currentPath, loadAssets]);

    if (!isOpen) return null;

    const handleNavigate = (folderId: string | null) => {
        if (!folderId || folderId === 'ROOT') {
            setCurrentPath([]);
        } else {
            setCurrentPath(folderId.split('/'));
        }
    };

    const handleUpload = async (files: File[]) => {
        try {
            const pathStr = currentPath.join('/');
            await api.upload(files, pathStr);
            loadAssets(pathStr);
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Tải ảnh lên thất bại');
        }
    };

    const handleCreateFolder = async (name: string) => {
        try {
            const pathStr = currentPath.join('/');
            await api.createFolder(name, pathStr);
            setCreatingFolder(false);
            loadTree();
            loadAssets(pathStr);
        } catch (err) {
            console.error('Create folder failed:', err);
            alert('Tạo thư mục thất bại');
        }
    };

    const handleDeleteMulti = async (assetsToDelete: Asset[]) => {
        if (!window.confirm(`Xoá ${assetsToDelete.length} mục đã chọn?`)) return;
        try {
            await api.delete(assetsToDelete.map(a => ({ path: a.id })));
            const pathStr = currentPath.join('/');
            loadTree();
            loadAssets(pathStr);
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleAssetSelect = (asset: Asset) => {
        if (asset.type === 'folder') {
            handleNavigate(asset.id);
        } else if (asset.type === 'image' && asset.url) {
            onSelect(asset.url);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 lg:p-8 animate-fade-in backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full h-full max-w-[1400px] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
                <Header
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onUpload={() => { }}
                    onCreateFolder={() => setCreatingFolder(true)}
                    onFilesSelected={handleUpload}
                    onClose={onClose}
                />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar
                        tree={tree}
                        assets={assets}
                        currentPath={currentPath}
                        onNavigate={handleNavigate}
                        creatingFolder={creatingFolder}
                        onConfirmCreate={handleCreateFolder}
                        onCancelCreate={() => setCreatingFolder(false)}
                    />
                    <AssetGrid
                        assets={assets}
                        searchQuery={searchQuery}
                        currentPath={currentPath}
                        onNavigate={handleNavigate}
                        onSelect={handleAssetSelect}
                        onDeleteAssets={handleDeleteMulti}
                    />
                </div>
            </div>
        </div>
    );
};

export default FileManager;
