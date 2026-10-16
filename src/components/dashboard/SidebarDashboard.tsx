'use client';

import Link from 'next/link';
import Image from 'next/image';
import designStyles from '@/styles/pages/LudiDesign.module.css';
import { FaHome, FaPlus, FaListOl, FaFileAlt, FaClone, FaChartPie, FaChevronLeft } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { useTranslations } from "next-intl";
import { useEffect, useState } from 'react';

interface SidebarDashboardProps {
    collapsed: boolean;
    onToggle: () => void;
}

export const SidebarDashboard = ({ collapsed, onToggle }: SidebarDashboardProps) => {
    const t = useTranslations("SidebarTranslation");
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkRole = async () => {
            try {
                const res = await fetch('/api/auth');
                if (res.ok) {
                    const data = await res.json();
                    if (data.role === 'ADMIN') {
                        setIsAdmin(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching user role", error);
            }
        };
        checkRole();
    }, []);

    const links = [
        { href: `/dashboard`, icon: FaHome, text: t('home') },
        { href: '/dashboard/create-activity', icon: FaPlus, text: t('createActivity') },
        { href: '/dashboard/my-activities', icon: FaListOl, text: t('myActivities') },
        { href: '/dashboard/reports', icon: FaFileAlt, text: t('reports') },
        { href: '/dashboard/templates', icon: FaClone, text: t('templates') },
        ...(isAdmin ? [{ href: '/admin/reports', icon: FaChartPie, text: t('watching') }] : []),
    ];

    const toggleLabel = collapsed ? t('expand') : t('collapse');

    return (
        <div id="sidebar-dashboard" data-tour="sidebar" className={`${designStyles.sidebarDark} ${collapsed ? designStyles.sidebarCollapsed : ''}`}>
            <div className={`text-center ${designStyles.sidebarLogo}`}>
                {collapsed ? (
                    <Image src="/images/PartialLogo.png" alt="LudiGame" width={44} height={48} style={{ objectFit: 'contain' }} />
                ) : (
                    <Image src="/images/Logo-LudiGame.png" alt="LudiGame" width={190} height={114} style={{ objectFit: 'contain' }} />
                )}
            </div>
            <button
                type="button"
                className={designStyles.sidebarToggle}
                onClick={onToggle}
                aria-expanded={!collapsed}
                aria-controls="sidebar-dashboard-nav"
                aria-label={toggleLabel}
                title={toggleLabel}
            >
                <FaChevronLeft aria-hidden="true" />
            </button>
            <nav id="sidebar-dashboard-nav" className="nav flex-column w-100" aria-label={t('navigation')}>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${designStyles.navLink} ${isActive ? designStyles.active : ''}`}
                            aria-current={isActive ? 'page' : undefined}
                            data-tour={link.href === '/dashboard/create-activity' ? 'sidebar-create-activity' : undefined}
                        >
                            <link.icon className={designStyles.icon} aria-hidden="true" />
                            {/* When collapsed this label becomes the hover/focus tooltip, so it still names the link. */}
                            <span className={designStyles.navLabel}>{link.text}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
