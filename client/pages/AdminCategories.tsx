import React, { useState, useEffect } from 'react';
import { categoryApi } from '../services/api';
import { Category } from '../types';

const AdminCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category>({ name: '', color: '#3b82f6', icon: 'category', mccCodes: [], isFrequent: false });
    const [isSeeding, setIsSeeding] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const data = await categoryApi.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setIsEditing(false);
        setCurrentCategory({ name: '', color: '#3b82f6', icon: 'category', mccCodes: [], isFrequent: false });
        setShowModal(true);
    };

    const handleOpenEdit = (cate: Category) => {
        setIsEditing(true);
        setCurrentCategory(cate);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
        try {
            await categoryApi.delete(id);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const handleSeed = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn khởi tạo hàng loạt mã MCC chuẩn quốc tế?')) return;
        setIsSeeding(true);
        try {
            await categoryApi.seedMcc();
            await fetchCategories();
            alert('Khởi tạo chuẩn MCC thành công!');
        } catch (error) {
            console.error('Error seeding MCC:', error);
            alert('Có lỗi xảy ra khi tạo mã MCC');
        } finally {
            setIsSeeding(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && currentCategory.id) {
                await categoryApi.update(currentCategory.id, currentCategory);
            } else {
                await categoryApi.create(currentCategory);
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    // Calculate pagination Data
    // Auto sort so Frequent are on top
    const sortedCategories = [...categories].sort((a, b) => {
        if (a.isFrequent === b.isFrequent) return 0;
        return a.isFrequent ? -1 : 1;
    });
    
    const totalPages = Math.ceil(sortedCategories.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedCategories = sortedCategories.slice(startIndex, startIndex + pageSize);

    // Ensure currentPage is valid if pageSize changes
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [pageSize, categories]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý danh mục</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Định nghĩa các nhóm chi tiêu, màu sắc và MCC tự động định tuyến</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSeed}
                        disabled={isSeeding}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        <span className={`material-symbols-outlined text-[20px] ${isSeeding ? 'animate-spin' : ''}`}>sync</span>
                        Khởi tạo Chuẩn MCC
                    </button>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all hover:scale-105 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Thêm danh mục
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/4">Danh mục</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-32">Phân Loại</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/5">Giao diện</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-auto">Danh sách Tag MCC</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right w-32">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div></td>
                                    </tr>
                                ))
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold text-sm">Chưa có danh mục nào</td>
                                </tr>
                            ) : (
                                paginatedCategories.map((cate) => (
                                    <tr key={cate.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cate.color}20`, color: cate.color }}>
                                                    <span className="material-symbols-outlined text-[18px]">{cate.icon || 'category'}</span>
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{cate.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {cate.isFrequent ? (
                                                <span className="px-2 py-1 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 text-[10px] font-black flex items-center gap-1 w-fit">
                                                    <span className="text-xs">🔥</span> Thường dùng
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold flex items-center gap-1 w-fit">
                                                    Mặc định
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700 shrink-0" style={{ backgroundColor: cate.color }}></div>
                                                <span className="font-mono text-[11px] text-slate-400 font-bold">{cate.color}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 relative">
                                            {(!cate.mccCodes || cate.mccCodes.length === 0) ? (
                                                <span className="text-[10px] text-slate-400 font-bold italic">Chưa map MCC</span>
                                            ) : (
                                                <div className="group relative">
                                                    <div className="flex flex-wrap gap-1.5 items-center max-w-[280px]">
                                                        {cate.mccCodes.slice(0, 5).map(code => (
                                                            <span key={code} className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 flex items-center gap-1 border border-slate-200/50 dark:border-slate-700/50">
                                                                <span className="material-symbols-outlined text-[10px] opacity-70">sell</span>
                                                                {code}
                                                            </span>
                                                        ))}
                                                        {cate.mccCodes.length > 5 && (
                                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 cursor-help transition-all hover:bg-slate-300 dark:hover:bg-slate-600">
                                                                +{cate.mccCodes.length - 5} mã nữa...
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Tooltip hiển thị toàn bộ MCC khi hover */}
                                                    {cate.mccCodes.length > 5 && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 ml-[290px] hidden group-hover:block z-50 animate-fade-in wmax">
                                                            <div className="bg-slate-800 dark:bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl w-[320px]">
                                                                <p className="text-[10px] text-slate-400 font-bold mb-2 uppercase tracking-widest border-b border-slate-700 pb-2">Toàn bộ {cate.mccCodes.length} mã MCC</p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {cate.mccCodes.map(code => (
                                                                        <span key={code} className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-700 text-slate-300 border border-slate-600">
                                                                            {code}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-slate-800 dark:bg-slate-900 border-l border-b border-slate-700 transform rotate-45"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(cate)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => cate.id && handleDelete(cate.id)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {categories.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-500">Hiển thị</span>
                                <select 
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 text-[11px] font-bold outline-none cursor-pointer"
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                                <span className="text-[11px] font-bold text-slate-500">danh mục</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium text-slate-500 mr-2">Trang {currentPage} / {totalPages || 1}</span>
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                                </button>
                                <button 
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 min-h-screen">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{isEditing ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Option Checkbox cho Thường Gặp */}
                            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only"
                                        checked={currentCategory.isFrequent}
                                        onChange={(e) => setCurrentCategory({...currentCategory, isFrequent: e.target.checked})}
                                    />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${currentCategory.isFrequent ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                    <div className={`absolute w-4 h-4 bg-white rounded-full transition-transform transform shadow-sm ${currentCategory.isFrequent ? 'translate-x-5' : 'translate-x-1'}`}></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">Đánh dấu là hay xài 🔥</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Danh mục này sẽ được đẩy lên đầu</p>
                                </div>
                            </label>

                            <div className="space-y-1.5 focus-within:ring-2 focus-within:ring-primary-500/20 rounded-xl transition-all p-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên danh mục</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:border-primary-500 transition-all outline-none"
                                    placeholder="Vd: Ăn uống, Du lịch..."
                                    value={currentCategory.name}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5 focus-within:ring-2 focus-within:ring-primary-500/20 rounded-xl transition-all p-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Màu sắc hiển thị</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        className="h-[42px] w-14 rounded-lg bg-transparent border border-slate-200 dark:border-slate-700 p-0 overflow-hidden cursor-pointer shrink-0"
                                        value={currentCategory.color}
                                        onChange={(e) => setCurrentCategory({ ...currentCategory, color: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white focus:border-primary-500 transition-all outline-none"
                                        value={currentCategory.color}
                                        onChange={(e) => setCurrentCategory({ ...currentCategory, color: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 focus-within:ring-2 focus-within:ring-primary-500/20 rounded-xl transition-all p-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Icon (Material Symbols)</label>
                                <div className="flex gap-2">
                                    <div className="h-[42px] w-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                                        <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-slate-300">{currentCategory.icon || 'category'}</span>
                                    </div>
                                    <input
                                        type="text"
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white focus:border-primary-500 transition-all outline-none"
                                        value={currentCategory.icon || ''}
                                        onChange={(e) => setCurrentCategory({ ...currentCategory, icon: e.target.value })}
                                        placeholder="Vd: restaurant, flight..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 focus-within:ring-2 focus-within:ring-primary-500/20 rounded-xl transition-all p-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">sell</span> Mã MCC (Ngăn cách bởi dấu phẩy)
                                </label>
                                <textarea
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white focus:border-primary-500 transition-all outline-none resize-y min-h-[80px]"
                                    value={currentCategory.mccCodes ? currentCategory.mccCodes.join(', ') : ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const array = val.split(',').map(s => s.trim()).filter(Boolean);
                                        setCurrentCategory({ ...currentCategory, mccCodes: array });
                                    }}
                                    placeholder="5812, 5814, 4511..."
                                />
                                <p className="text-[10px] text-slate-500 ml-1">Hãy ấn Cập nhật MCC tự động để ưu tiên tính chuẩn xác.</p>
                            </div>

                            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="submit"
                                    className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98]"
                                >
                                    {isEditing ? 'Lưu thay đổi' : 'Tạo ngay'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
