"use client";

import React, { useState } from 'react';
import { Asset } from './types';
import { FolderFilled, DeleteFilled, CheckCircleFilled, HomeOutlined, RightOutlined } from '@ant-design/icons';

interface AssetGridProps {
    assets: Asset[];
    searchQuery: string;
    currentPath: string[];
    onSelect: (asset: Asset) => void;
    onNavigate: (folderId: string | null) => void;
    onDeleteAssets: (assets: Asset[]) => void;
}

const AssetGrid: React.FC<AssetGridProps> = ({ assets, searchQuery, currentPath, onSelect, onNavigate, onDeleteAssets }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const filtered = assets.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const formatSize = (bytes?: number) => {
        if (!bytes) return '';
        return (bytes / 1024).toFixed(1) + ' KB';
    };

    const toggleSelect = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleDeleteSelected = () => {
        const assetsToDelete = assets.filter(a => selectedIds.has(a.id));
        if (assetsToDelete.length > 0) {
            onDeleteAssets(assetsToDelete);
            setSelectedIds(new Set());
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 min-h-[500px] flex flex-col">
            {/* Top Toolbar: Breadcrumbs & Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-solid border-[#f2f2f2] dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                    <button 
                        onClick={() => onNavigate('ROOT')} 
                        className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors"
                    >
                        <HomeOutlined className="text-base" />
                        <span>Home</span>
                    </button>
                    
                    {currentPath.map((folder, index) => {
                        const pathId = currentPath.slice(0, index + 1).join('/');
                        return (
                            <React.Fragment key={pathId}>
                                <RightOutlined className="text-[10px] text-slate-300 dark:text-slate-600" />
                                <button 
                                    onClick={() => onNavigate(pathId)}
                                    className="hover:text-emerald-500 transition-colors"
                                >
                                    {folder}
                                </button>
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-slate-400">Hiển thị {filtered.length} mục</span>
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                            <DeleteFilled />
                            Xoá ({selectedIds.size})
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {filtered.map(asset => {
                        const isSelected = selectedIds.has(asset.id);
                        return (
                            <div
                                key={asset.id}
                                className={`group relative flex flex-col gap-2 rounded-xl border border-solid p-2 transition-all cursor-pointer ${isSelected ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10' : 'border-[#e5e5e5] dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 hover:shadow-md'}`}
                                onClick={() => onSelect(asset)}
                            >
                                {/* Checkbox for Selection */}
                                <div 
                                    onClick={(e) => toggleSelect(e, asset.id)}
                                    className={`absolute top-4 left-4 z-10 w-5 h-5 flex items-center justify-center rounded-full border-2 transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/50 bg-black/20 opacity-0 group-hover:opacity-100 hover:border-emerald-500 backdrop-blur-sm'}`}
                                >
                                    {isSelected && <CheckCircleFilled className="text-sm" />}
                                </div>

                                <div className="aspect-[4/3] bg-[#f5f5f5] dark:bg-slate-800/50 rounded-lg flex items-center justify-center overflow-hidden border border-transparent dark:border-slate-800 transition-all">
                                    {asset.type === 'folder' ? (
                                        <FolderFilled className={`text-[3.5rem] drop-shadow-sm transition-transform ${isSelected ? 'scale-110 text-emerald-400' : 'text-amber-400 group-hover:scale-110'}`} />
                                    ) : (
                                        <img src={asset.url} alt={asset.name} className={`w-full h-full object-cover transition-transform ${isSelected ? 'scale-105 opacity-90' : 'group-hover:scale-105'}`} />
                                    )}
                                </div>
                                <div className="flex flex-col px-1">
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{asset.name}</span>
                                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                        {asset.type === 'folder' ? 'Thư mục' : formatSize(asset.size)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 gap-4 mt-20">
                        <FolderFilled className="text-6xl text-slate-200 dark:text-slate-800" />
                        <p className="text-sm font-semibold">Không tìm thấy kho lưu trữ nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetGrid;
