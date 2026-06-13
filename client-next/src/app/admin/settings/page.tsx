"use client";
import React, { useEffect, useState } from 'react';
import { settingsApi, notificationApi } from '@/services/api';

export default function SystemSettingsPage() {
    const [settings, setSettings] = useState({
        isAutoScraperEnabled: false,
        autoScraperIntervalHours: 168,
        lastAutoScrapeTime: null as string | null,
        isPromoScraperEnabled: false,
        promoScraperIntervalHours: 168,
        lastPromoScrapeTime: null as string | null,
        lastReminderRunTime: null as string | null,
        lastReminderUsersProcessed: 0,
        lastReminderCardsProcessed: 0,
        lastReminderNotificationsSent: 0,
        reminderDaysBefore: 3,
        reminderRunHour: 23,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTriggering, setIsTriggering] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await settingsApi.getSettings();
            setSettings({
                isAutoScraperEnabled: data.isAutoScraperEnabled,
                autoScraperIntervalHours: data.autoScraperIntervalHours,
                lastAutoScrapeTime: data.lastAutoScrapeTime,
                isPromoScraperEnabled: data.isPromoScraperEnabled,
                promoScraperIntervalHours: data.promoScraperIntervalHours,
                lastPromoScrapeTime: data.lastPromoScrapeTime,
                lastReminderRunTime: data.lastReminderRunTime,
                lastReminderUsersProcessed: data.lastReminderUsersProcessed,
                lastReminderCardsProcessed: data.lastReminderCardsProcessed,
                lastReminderNotificationsSent: data.lastReminderNotificationsSent,
                reminderDaysBefore: data.reminderDaysBefore ?? 3,
                reminderRunHour: data.reminderRunHour ?? 23,
            });
        } catch (error) {
            console.error('Failed to fetch settings', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await settingsApi.updateSettings(settings);
            alert('Đã cập nhật cài đặt thành công!');
        } catch (error) {
            alert('Lỗi khi lưu cài đặt.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTriggerReminders = async () => {
        if (!confirm('Bạn có chắc chắn muốn chạy Job nhắc nợ ngay bây giờ không?')) return;
        setIsTriggering(true);
        try {
            const res = await notificationApi.triggerReminders();
            await fetchSettings(); // Refresh stats
            alert(res.message);
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        } finally {
            setIsTriggering(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Chưa từng chạy';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    if (isLoading) {
        return (
            <div className="p-8">Đang tải cài đặt...</div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in transition-all">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Cài Đặt Hệ Thống</h1>
                <p className="text-sm text-slate-500 mt-1">Cấu hình các tác vụ chạy ngầm và tính năng tự động của ứng dụng.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

                {/* Left Column: Data Scrapers */}
                <div className="space-y-6">
                    {/* Bot Cào Thẻ (Auto Scraper) */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-500">credit_card</span>
                            Bot Cào Thẻ (Thẻ tín dụng)
                        </h2>

                        <div className="grid grid-cols-1 gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Trạng thái hoạt động</label>
                                <label className="relative inline-flex items-center cursor-pointer w-fit">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.isAutoScraperEnabled}
                                        onChange={(e) => setSettings({ ...settings, isAutoScraperEnabled: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                                    <span className="ml-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                                        {settings.isAutoScraperEnabled ? 'Đang Bật' : 'Đã Tắt'}
                                    </span>
                                </label>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Chu kỳ quét (Giờ)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={settings.autoScraperIntervalHours}
                                    onChange={(e) => setSettings({ ...settings, autoScraperIntervalHours: parseInt(e.target.value) || 1 })}
                                    className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold w-full max-w-xs focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="text-xs text-slate-400">Bot tự động cập nhật thẻ sau mỗi {settings.autoScraperIntervalHours} giờ.</p>
                            </div>

                            <div className="pt-2">
                                <p className="text-sm text-slate-500">
                                    Lần chạy thành công gần nhất: <strong className="text-slate-700 dark:text-slate-300 block mt-1">{formatDate(settings.lastAutoScrapeTime)}</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bot Cào Ưu Đãi (Ưu đãi thẻ tín dụng) */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">local_offer</span>
                            Bot Cào Ưu Đãi (Ưu đãi thẻ tín dụng)
                        </h2>

                        <div className="grid grid-cols-1 gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Trạng thái hoạt động</label>
                                <label className="relative inline-flex items-center cursor-pointer w-fit">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.isPromoScraperEnabled}
                                        onChange={(e) => setSettings({ ...settings, isPromoScraperEnabled: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
                                    <span className="ml-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                                        {settings.isPromoScraperEnabled ? 'Đang Bật' : 'Đã Tắt'}
                                    </span>
                                </label>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Chu kỳ quét (Giờ)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={settings.promoScraperIntervalHours}
                                    onChange={(e) => setSettings({ ...settings, promoScraperIntervalHours: parseInt(e.target.value) || 1 })}
                                    className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold w-full max-w-xs focus:ring-2 focus:ring-amber-500"
                                />
                                <p className="text-xs text-slate-400">Bot tự động cập nhật ưu đãi sau mỗi {settings.promoScraperIntervalHours} giờ.</p>
                            </div>

                            <div className="pt-2">
                                <p className="text-sm text-slate-500">
                                    Lần chạy thành công gần nhất: <strong className="text-slate-700 dark:text-slate-300 block mt-1">{formatDate(settings.lastPromoScrapeTime)}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Statement Reminder & Actions */}
                <div className="space-y-6">
                    {/* Statement Reminder Logic */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500">notifications_active</span>
                            Hệ Thống Nhắc Nợ Tự Động
                        </h2>

                        <div className="bg-slate-50 dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col items-start gap-6">
                            <div className="w-full flex flex-col gap-4">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">Cấu hình lịch trình thông báo</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                        Kiểm tra ngày đến hạn (DueDate) của các thẻ VIP và gửi In-app & Email.
                                    </p>

                                    <div className="flex flex-col gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
                                        <div className="flex justify-between items-center">
                                            <span>Lần chạy gần nhất:</span>
                                            <strong className="text-slate-700 dark:text-slate-300">{formatDate(settings.lastReminderRunTime)}</strong>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Tài khoản đã quét:</span>
                                            <strong className="text-slate-700 dark:text-slate-300">{settings.lastReminderUsersProcessed}</strong>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Thẻ đã xử lý:</span>
                                            <strong className="text-slate-700 dark:text-slate-300">{settings.lastReminderCardsProcessed}</strong>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Thông báo đã gửi:</span>
                                            <strong className="text-emerald-600 dark:text-emerald-400">{settings.lastReminderNotificationsSent}</strong>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleTriggerReminders}
                                    disabled={isTriggering}
                                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-green-100 text-green-700 hover:bg-green-600 hover:text-white dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-600 dark:hover:text-white border border-green-200 dark:border-green-800/50 rounded-xl font-bold transition-all disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[20px]">{isTriggering ? 'sync' : 'play_arrow'}</span>
                                    {isTriggering ? 'Đang xử lý...' : 'Chạy Job Ngay Bây Giờ'}
                                </button>
                            </div>

                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Giờ chạy hàng ngày</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={settings.reminderRunHour}
                                        onChange={(e) => setSettings({ ...settings, reminderRunHour: parseInt(e.target.value) || 0 })}
                                        className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold w-full focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="text-[11px] text-slate-400">Từ 0-23. VD: 23 là 23:00</p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Báo trước (Ngày)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="15"
                                        value={settings.reminderDaysBefore}
                                        onChange={(e) => setSettings({ ...settings, reminderDaysBefore: parseInt(e.target.value) || 1 })}
                                        className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold w-full focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="text-[11px] text-slate-400">Gửi nhắc nhở trước X ngày</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save Actions Card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800/80 dark:to-slate-900 rounded-2xl shadow-sm border border-indigo-100 dark:border-slate-700 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-black text-slate-800 dark:text-slate-200">Lưu Các Thay Đổi</h3>
                            <p className="text-sm text-slate-500">Áp dụng thiết lập cho toàn hệ thống.</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[20px]">{isSaving ? 'sync' : 'save'}</span>
                            {isSaving ? 'Đang lưu...' : 'Lưu Cài Đặt'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
