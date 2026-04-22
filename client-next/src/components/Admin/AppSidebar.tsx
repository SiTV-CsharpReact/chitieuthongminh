"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight as ChevronRightIcon } from "lucide-react";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
    {
        title: "Tổng quan",
        url: "/admin",
        icon: "dashboard",
    },
    {
        title: "Tín dụng",
        items: [
            { title: "Quản lý thẻ", url: "/admin/cards", icon: "credit_card" },
            { title: "Danh mục hoàn tiền", url: "/admin/categories", icon: "category" },
            { title: "Ưu đãi thẻ (VIB)", url: "/admin/promotions", icon: "redeem" },
        ],
    },
    {
        title: "Quản lý bài viết",
        icon: "article",
        isActive: true,
        items: [
            { title: "Danh sách bài viết", url: "/admin/articles", icon: "article" },
            { title: "Chuyên mục bài viết", url: "/admin/article-categories", icon: "topic" },
        ],
    },
    {
        title: "Hệ thống",
        items: [
            { title: "Người dùng", url: "/admin/users", icon: "group" },
            { title: "Cài đặt hệ thống", url: "/admin/settings", icon: "settings" },
        ],
    },
];

// Styles chung cho tất cả menu button
const menuBtnBase =
    "flex w-full items-center gap-2.5 h-9 px-2.5 rounded-lg font-semibold transition-all duration-200 " +
    "group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!px-0";

const menuBtnInactive =
    "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent";

const menuBtnActive =
    "!bg-primary-500 !text-white shadow-md shadow-primary-500/30";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <Sidebar collapsible="icon" {...props}>
            {/* Header / Logo */}
            <SidebarHeader className="h-16 border-b border-sidebar-border flex items-center px-4 justify-center bg-sidebar overflow-hidden">
                <Link href="/" className="flex items-center gap-3 group/logo w-full overflow-hidden">
                    <div className="flex h-8 w-8 items-center justify-center shrink-0">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
                            <defs>
                                <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#4ade80" />
                                    <stop offset="40%" stopColor="#22c55e" />
                                    <stop offset="100%" stopColor="#14532d" />
                                </linearGradient>
                                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#fef08a" />
                                    <stop offset="50%" stopColor="#eab308" />
                                    <stop offset="100%" stopColor="#a16207" />
                                </linearGradient>
                                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx={0} dy={8} stdDeviation={6} floodColor="#000" floodOpacity="0.4" />
                                </filter>
                                <style dangerouslySetInnerHTML={{ __html: `@keyframes dollarFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.25)}}.dollar-anim{transform-origin:center;transform-box:fill-box;animation:dollarFloat 3s ease-in-out infinite}` }} />
                            </defs>
                            <g transform="rotate(-15 100 100) translate(-15, 0)">
                                <rect x={50} y={15} width={100} height={170} rx={12} fill="#000" opacity="0.3" filter="url(#shadow)" />
                                <rect x={50} y={15} width={100} height={170} rx={12} fill="url(#cardBg)" />
                                <rect x={51} y={16} width={98} height={168} rx={11} fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.2" />
                                <g transform="translate(65, 35)">
                                    <rect x={0} y={0} width={18} height={24} rx={4} fill="url(#goldGrad)" />
                                </g>
                            </g>
                            <g filter="url(#shadow)">
                                <path d="M 180 100 A 80 35 0 0 1 20 100" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" />
                                <text className="dollar-anim" x={100} y={118} fontWeight={900} fontSize={52} fill="url(#goldGrad)" textAnchor="middle">$</text>
                            </g>
                        </svg>
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden transition-all duration-300">
                        <h1 className="text-sm font-extrabold leading-tight text-sidebar-foreground truncate">Admin Portal</h1>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-sidebar-foreground/60 truncate">CredBack</p>
                    </div>
                </Link>
            </SidebarHeader>

            {/* Navigation */}
            <SidebarContent className="px-2 py-3">
                {navItems.map((group, idx) => (
                    <SidebarGroup key={idx} className="py-1 px-0">
                        {group.items && (
                            <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/40 mb-1 px-2 group-data-[collapsible=icon]:hidden">
                                {group.title}
                            </SidebarGroupLabel>
                        )}
                        <SidebarGroupContent>
                            <SidebarMenu>

                                {/* === Top-level single link (Tổng quan) === */}
                                {group.url ? (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            render={<Link href={group.url} />}
                                            isActive={pathname === group.url}
                                            tooltip={group.title}
                                            className={cn(
                                                menuBtnBase,
                                                pathname === group.url ? menuBtnActive : menuBtnInactive
                                            )}
                                        >
                                            <span className={cn(
                                                "material-symbols-outlined shrink-0 leading-none text-[16px] group-data-[collapsible=icon]:text-[20px]",
                                                pathname === group.url ? "text-white" : "text-sidebar-foreground/50"
                                            )}>
                                                {group.icon}
                                            </span>
                                            <span className="text-[13px] group-data-[collapsible=icon]:hidden truncate">{group.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>

                                    /* === Collapsible group (Quản lý bài viết) === */
                                ) : group.icon && group.items ? (
                                    <SidebarMenuItem>
                                        {/*
                                         * base-ui Collapsible.Trigger tự render <button>.
                                         * Không dùng asChild — chỉ pass className trực tiếp.
                                         */}
                                        <Collapsible defaultOpen={group.isActive} className="w-full">
                                            <CollapsibleTrigger className={cn(menuBtnBase, menuBtnInactive)}>
                                                <span className="material-symbols-outlined shrink-0 leading-none text-[16px] group-data-[collapsible=icon]:text-[20px] text-sidebar-foreground/50">
                                                    {group.icon}
                                                </span>
                                                <span className="text-[13px] text-left group-data-[collapsible=icon]:hidden truncate flex-1">{group.title}</span>
                                                <ChevronRightIcon className="ml-auto size-3.5 transition-transform duration-200 group-data-[collapsible=icon]:hidden shrink-0 [[data-open]_&]:rotate-90" />
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub className="ml-4 border-l border-sidebar-border pl-2.5 mt-0.5">
                                                    {group.items.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton
                                                                render={<Link href={subItem.url} />}
                                                                className={cn(
                                                                    "flex items-center gap-2 h-8 px-2 rounded-md font-medium transition-all",
                                                                    pathname === subItem.url
                                                                        ? "text-primary-500"
                                                                        : "text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                                                )}
                                                                style={pathname === subItem.url
                                                                    ? { backgroundColor: 'rgba(34, 197, 94, 0.12)' }
                                                                    : undefined
                                                                }
                                                            >
                                                                <span className="material-symbols-outlined shrink-0 leading-none text-[14px]">
                                                                    {subItem.icon}
                                                                </span>
                                                                <span className="text-xs group-data-[collapsible=icon]:hidden truncate">{subItem.title}</span>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </SidebarMenuItem>

                                    /* === Flat group items (Tín dụng, Hệ thống) === */
                                ) : group.items ? (
                                    group.items.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                render={<Link href={item.url} />}
                                                isActive={pathname === item.url}
                                                tooltip={item.title}
                                                className={cn(
                                                    menuBtnBase,
                                                    pathname === item.url ? menuBtnActive : menuBtnInactive
                                                )}
                                            >
                                                <span className={cn(
                                                    "material-symbols-outlined shrink-0 leading-none text-[16px] group-data-[collapsible=icon]:text-[20px]",
                                                    pathname === item.url ? "text-white" : "text-sidebar-foreground/50"
                                                )}>
                                                    {item.icon}
                                                </span>
                                                <span className="text-[13px] group-data-[collapsible=icon]:hidden truncate">{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))
                                ) : null}

                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            {/* Footer / User info */}
            <SidebarFooter className="px-3 py-3 border-t border-sidebar-border bg-sidebar">
                <div className="rounded-xl p-2.5 flex items-center gap-2.5 bg-sidebar-accent/60 transition-all group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
                    <div className="w-7 h-7 rounded-full bg-primary-500/15 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px] text-primary-500 leading-none">person</span>
                    </div>
                    <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                        <p className="text-xs font-bold text-sidebar-foreground truncate">{user?.name || "Administrator"}</p>
                        <p className="text-[10px] text-sidebar-foreground/45 font-medium truncate">Premium Account</p>
                    </div>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
