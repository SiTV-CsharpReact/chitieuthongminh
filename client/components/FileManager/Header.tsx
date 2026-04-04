import React, { useRef } from 'react';
import {
    SearchOutlined,
    FolderAddOutlined,
    CloudUploadOutlined,
    CloseOutlined,
} from '@ant-design/icons';

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onUpload: () => void;
    onCreateFolder: () => void;
    onFilesSelected?: (files: File[]) => void;
    onClose: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, onUpload, onCreateFolder, onFilesSelected, onClose }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        if (onFilesSelected && fileInputRef.current) {
            fileInputRef.current.click();
        } else {
            onUpload();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && onFilesSelected) {
            onFilesSelected(Array.from(e.target.files));
            e.target.value = '';
        }
    };

    return (
        <header className="flex items-center justify-between border-b border-solid border-[#f2f2f2] dark:border-slate-800 px-6 py-4 shrink-0 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-8 flex-1">
                <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">Quản Lý Hình Ảnh</h2>
                <div className="flex flex-col max-w-sm w-full relative">
                    <div className="flex w-full items-center bg-[#f2f2f2] dark:bg-slate-800 rounded-lg px-4 h-10 focus-within:bg-white focus-within:dark:bg-slate-950 focus-within:ring-1 focus-within:ring-black/10 transition-all">
                        <SearchOutlined className="text-[#757575] dark:text-slate-400 text-base mr-3" />
                        <input
                            type="text"
                            className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-[#757575] dark:placeholder:text-slate-500 text-slate-900 dark:text-white outline-none"
                            placeholder="Tìm kiếm ảnh..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onCreateFolder();
                    }}
                    className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 border border-[#e5e5e5] dark:border-slate-700 bg-white dark:bg-slate-800 text-black dark:text-white text-sm font-semibold hover:bg-[#f9f9f9] dark:hover:bg-slate-700 transition-all"
                >
                    <FolderAddOutlined className="text-base" />
                    <span>Thư Mục Mới</span>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleUploadClick();
                    }}
                    className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 bg-emerald-500 !text-white text-sm font-bold tracking-[0.015em] hover:bg-emerald-600 transition-all shadow-sm"
                >
                    <CloudUploadOutlined className="text-base" />
                    <span>Tải Ảnh Lên</span>
                </button>
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="!hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                />
                <div className="h-6 w-[1px] bg-[#f2f2f2] dark:bg-slate-800 mx-2"></div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onClose();
                    }}
                    className="flex cursor-pointer items-center justify-center rounded-lg h-10 w-10 bg-[#f2f2f2] dark:bg-slate-800 text-black dark:text-slate-300 hover:bg-[#e5e5e5] dark:hover:bg-slate-700 transition-all"
                >
                    <CloseOutlined className="text-base" />
                </button>
            </div>
        </header>
    );
};

export default Header;
