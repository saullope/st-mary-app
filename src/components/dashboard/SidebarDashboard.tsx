'use client';

import Link from 'next/link';
import Image from 'next/image';
import designStyles from '@/styles/pages/LudiDesign.module.css';
import { FaHome, FaPlus, FaListOl, FaFileAlt, FaClone, FaChartPie } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { useTranslations } from "next-intl";
import { useEffect, useState } from 'react';

export const SidebarDashboard = () => {
    const t = useTranslations("SidebarTranslation");
    const pathname = usePathname(); // Hook para obtener la ruta actual
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
        { href: `/dashboard`, icon: FaHome, text: t('home'), target: '' },
        { href: '/dashboard/create-activity', icon: FaPlus, text: t('createActivity'), target: '' },
        { href: '/dashboard/my-activities', icon: FaListOl, text: t('myActivities'), target: '' },
        { href: '/dashboard/reports', icon: FaFileAlt, text: t('reports'), target: '' },
        { href: '/dashboard/templates', icon: FaClone, text: t('templates'), target: '' }, // Temporarily hardcoded text, could add translation later
        ...(isAdmin ? [{ href: '/admin/reports', icon: FaChartPie, text: 'Efectividad Global', target: '' }] : []),
    ];

    return (
        <div className={designStyles.sidebarDark}>
            <div className="text-center mb-3">
                <Image
                    src="/images/Logo-LudiGame.png"
                    alt="logo"
                    width={80}
                    height={80}
                    style={{ objectFit: 'contain' }}
                />
            </div>
            <br />
            <nav className="nav flex-column w-100">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        target={link.target}
                        className={`${designStyles.navLink} ${pathname === link.href ? designStyles.active : ''}`}
                    >
                        <link.icon className={designStyles.icon} />
                        <span>{link.text}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};
