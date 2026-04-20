"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Asset, DirectoryNode } from './types';
import { api } from './api';
import Tooltip from './Tooltip';
import {
    DownOutlined, FolderFilled, FolderOpenFilled,
    EditOutlined, DeleteOutlined,
    FolderAddOutlined, CheckOutlined, CloseOutlined,
} from '@ant-design/icons';

interface SidebarProps {
    assets: Asset[];
    tree: DirectoryNode[];
    currentPath: string[]; // array of path segments
    onNavigate: (folderId: string | null) => void;
    onFolderRenamed?: (oldPath: string, newName: string) => void;
    onFolderDeleted?: (path: string) => void;
    creatingFolder?: boolean;
    onConfirmCreate?: (name: string) => void;
    onCancelCreate?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    tree, currentPath, onNavigate,
    onFolderRenamed, onFolderDeleted,
    creatingFolder, onConfirmCreate, onCancelCreate,
}) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'root': true });
    const [usedGB, setUsedGB] = useState<string>('0');
    const [maxGB, setMaxGB] = useState<string>('0');
    const [percent, setPercent] = useState<number>(0);

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: DirectoryNode } | null>(null);
    const [renamingPath, setRenamingPath] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const renameInputRef = useRef<HTMLInputElement>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);

    const [newFolderName, setNewFolderName] = useState('');
    const newFolderInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentPath.length > 0) {
            const next = { ...expanded };
            currentPath.forEach(p => { next[p] = true; });
            setExpanded(next);
        }
    }, [currentPath]);

    useEffect(() => {
        if (creatingFolder) {
            setNewFolderName('Thư mục mới');
            setTimeout(() => {
                newFolderInputRef.current?.focus();
                newFolderInputRef.current?.select();
            }, 50);
        }
    }, [creatingFolder]);

    useEffect(() => {
        api.getStorageInfo().then(res => {
            if (res.success) {
                setUsedGB(res.usedGB);
                setMaxGB(res.maxGB);
                setPercent(parseInt(res.percent));
            }
        }).catch(e => console.error('storage info', e));
    }, [tree]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node))
                setContextMenu(null);
        };
        if (contextMenu) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [contextMenu]);

    useEffect(() => {
        if (renamingPath && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renamingPath]);

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleContextMenu = (e: React.MouseEvent, node: DirectoryNode) => {
        e.preventDefault(); e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, node });
    };

    const handleStartRename = (node: DirectoryNode) => {
        setContextMenu(null);
        setRenamingPath(node.path);
        setRenameValue(node.name);
    };

    const handleRenameSubmit = async (node: DirectoryNode) => {
        const newName = renameValue.trim();
        if (newName && newName !== node.name) {
            try {
                await api.rename(node.path, newName);
                onFolderRenamed?.(node.path, newName);
            } catch (e: any) { alert('Đổi tên thất bại: ' + e.message); }
        }
        setRenamingPath(null);
        setRenameValue('');
    };

    const handleRenameKeyDown = (e: React.KeyboardEvent, node: DirectoryNode) => {
        if (e.key === 'Enter') handleRenameSubmit(node);
        if (e.key === 'Escape') { setRenamingPath(null); setRenameValue(''); }
    };

    const handleDeleteFolder = async (node: DirectoryNode) => {
        setContextMenu(null);
        if (confirm(`Xóa thư mục "${node.name}" và toàn bộ nội dung?`)) {
            try {
                await api.delete([{ path: node.path }]);
                onFolderDeleted?.(node.path);
            } catch (e: any) { alert('Xóa thất bại: ' + e.message); }
        }
    };

    const handleNewFolderSubmit = () => {
        const name = newFolderName.trim();
        if (name) onConfirmCreate?.(name);
        else onCancelCreate?.();
    };

    const handleNewFolderKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleNewFolderSubmit();
        if (e.key === 'Escape') onCancelCreate?.();
    };

    const currentParentId = currentPath[currentPath.length - 1] ?? null;

    const renderNode = (node: DirectoryNode, depth: number = 0) => {
        const isDirectlySelected = currentPath[currentPath.length - 1] === node.path;
        const isExpanded = expanded[node.path];
        const hasChildren = node.children && node.children.length > 0;
        const isRenaming = renamingPath === node.path;
        const showInlineHere = creatingFolder && currentParentId === node.path;

        return (
            <div key={node.path} className="mt-0.5">
                <div
                    onClick={() => !isRenaming && onNavigate(node.path)}
                    onContextMenu={(e) => handleContextMenu(e, node)}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all
            ${isDirectlySelected ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold border-l-2 border-blue-600 dark:border-blue-400 -ml-[1px]' : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#444] dark:text-slate-300'}`}
                    style={{ paddingLeft: `${depth * 12 + 12}px` }}
                >
                    <span
                        onClick={(e) => hasChildren && toggleExpand(node.path, e)}
                        className={`text-xs transition-transform inline-flex items-center justify-center w-4 h-4 ${isExpanded ? 'rotate-0' : '-rotate-90'} ${hasChildren ? 'opacity-40 cursor-pointer' : 'opacity-0'}`}
                    >
                        <DownOutlined />
                    </span>
                    {isExpanded
                        ? <FolderOpenFilled className={`text-base ${isDirectlySelected ? '!text-blue-500' : '!text-yellow-500'}`} />
                        : <FolderFilled className={`text-base ${isDirectlySelected ? '!text-blue-500' : '!text-yellow-500'}`} />
                    }

                    {isRenaming ? (
                        <input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onBlur={() => handleRenameSubmit(node)}
                            onKeyDown={e => handleRenameKeyDown(e, node)}
                            onClick={e => e.stopPropagation()}
                            className="text-sm flex-1 bg-white dark:bg-slate-800 border border-blue-400 dark:border-blue-500 rounded px-1 py-0 outline-none min-w-0 text-slate-900 dark:text-white"
                        />
                    ) : (
                        <p className="text-sm truncate flex-1">{node.name}</p>
                    )}

                    {!isRenaming && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Tooltip text="Đổi tên">
                                <button
                                    onClick={e => { e.stopPropagation(); handleStartRename(node); }}
                                    className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[#888] dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    <EditOutlined className="text-[13px]" />
                                </button>
                            </Tooltip>
                            <Tooltip text="Xóa thư mục">
                                <button
                                    onClick={e => { e.stopPropagation(); handleDeleteFolder(node); }}
                                    className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[#888] dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                >
                                    <DeleteOutlined className="text-[13px]" />
                                </button>
                            </Tooltip>
                        </div>
                    )}
                </div>

                {isExpanded && (hasChildren || showInlineHere) && (
                    <div>
                        {hasChildren && node.children.map(child => renderNode(child, depth + 1))}
                        {showInlineHere && <InlineFolderInput depth={depth + 1} ref={newFolderInputRef} value={newFolderName} onChange={setNewFolderName} onSubmit={handleNewFolderSubmit} onCancel={() => onCancelCreate?.()} onKeyDown={handleNewFolderKeyDown} />}
                    </div>
                )}
                {!isExpanded && showInlineHere && (
                    <div>
                        <InlineFolderInput depth={depth + 1} ref={newFolderInputRef} value={newFolderName} onChange={setNewFolderName} onSubmit={handleNewFolderSubmit} onCancel={() => onCancelCreate?.()} onKeyDown={handleNewFolderKeyDown} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <React.Fragment>
            <aside className="w-72 flex flex-col border-r border-[#f2f2f2] dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 overflow-hidden">
                <div className="flex-1 p-4 overflow-y-auto fm-scroll">
                    <p className="px-3 text-[11px] font-bold text-[#757575] dark:text-slate-500 uppercase tracking-wider pb-4">Thư Mục</p>

                    <div className="flex flex-col gap-0.5">
                        <div
                            onClick={() => onNavigate(null)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group transition-all ${currentPath.length === 0 ? 'bg-[#f2f2f2] dark:bg-slate-800' : 'hover:bg-black/5 dark:hover:bg-white/5'} text-[#444] dark:text-slate-300`}
                        >
                            <DownOutlined className="text-xs opacity-30" />
                            <FolderFilled className="text-base !text-yellow-500" />
                            <p className="text-sm font-semibold truncate flex-1">Hình Ảnh</p>
                        </div>

                        <div className="border-l border-[#eee] dark:border-slate-800 ml-3">
                            {tree.map(node => renderNode(node, 0))}

                            {creatingFolder && currentParentId === null && (
                                <InlineFolderInput
                                    depth={0}
                                    ref={newFolderInputRef}
                                    value={newFolderName}
                                    onChange={setNewFolderName}
                                    onSubmit={handleNewFolderSubmit}
                                    onCancel={() => onCancelCreate?.()}
                                    onKeyDown={handleNewFolderKeyDown}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 p-4 border-t border-[#f2f2f2] dark:border-slate-800">
                    <div className="flex flex-col gap-2 p-3 bg-[#f9f9f9] dark:bg-slate-800/50 rounded-xl">
                        <div className="flex justify-between items-center text-[#444] dark:text-slate-300">
                            <p className="text-xs font-semibold">Lưu Trữ</p>
                            <p className="text-[11px] font-normal">{percent}%</p>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#e0e0e0] dark:bg-slate-700 overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                        </div>
                        <p className="text-[#757575] dark:text-slate-500 text-[10px] font-normal">{usedGB} GB / {maxGB} GB đã dùng</p>
                    </div>
                </div>
            </aside>

            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999 }}
                    className="bg-white dark:bg-slate-900 border border-[#e8e8e8] dark:border-slate-800 rounded-xl shadow-xl py-1.5 min-w-[160px] text-sm"
                >
                    <button
                        onClick={() => handleStartRename(contextMenu.node)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-[#f5f5f5] dark:hover:bg-slate-800 text-[#333] dark:text-slate-200 transition-colors"
                    >
                        <EditOutlined className="text-[16px] text-blue-500" />
                        Đổi tên
                    </button>
                    <div className="my-1 border-t border-[#f0f0f0] dark:border-slate-800" />
                    <button
                        onClick={() => handleDeleteFolder(contextMenu.node)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                    >
                        <DeleteOutlined className="text-[16px]" />
                        Xóa
                    </button>
                </div>
            )}
        </React.Fragment>
    );
};

interface InlineFolderInputProps {
    depth: number;
    value: string;
    onChange: (v: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

const InlineFolderInput = React.forwardRef<HTMLInputElement, InlineFolderInputProps>(
    ({ depth, value, onChange, onSubmit, onCancel, onKeyDown }, ref) => (
        <div
            className="flex items-center gap-2 mt-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
            style={{ paddingLeft: `${depth * 12 + 12}px`, paddingRight: '8px', paddingTop: '6px', paddingBottom: '6px' }}
        >
            <DownOutlined className="text-xs opacity-0" />
            <FolderAddOutlined className="text-base !text-yellow-500 shrink-0" />
            <input
                ref={ref}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                onBlur={onSubmit}
                className="text-sm flex-1 bg-transparent border-none outline-none text-blue-700 dark:text-blue-300 font-medium min-w-0 placeholder:text-blue-300 dark:placeholder:text-blue-700"
                placeholder="Tên thư mục..."
            />
            <button
                onMouseDown={e => { e.preventDefault(); onSubmit(); }}
                className="shrink-0 p-0.5 rounded hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 transition-colors"
                title="Xác nhận"
            >
                <CheckOutlined className="text-[13px]" />
            </button>
            <button
                onMouseDown={e => { e.preventDefault(); onCancel(); }}
                className="shrink-0 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[#999] dark:text-slate-400 transition-colors"
                title="Huỷ"
            >
                <CloseOutlined className="text-[13px]" />
            </button>
        </div>
    )
);
InlineFolderInput.displayName = 'InlineFolderInput';

export default Sidebar;
