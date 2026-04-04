'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/pages/sidebar.module.css';
import { FaHome, FaPlus, FaListOl, FaFileAlt, FaClone } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { useTranslations } from "next-intl";

export const SidebarDashboard = () => {
    const t = useTranslations("SidebarTranslation");
    const pathname = usePathname(); // Hook para obtener la ruta actual

    const links = [
        { href: `/dashboard`, icon: FaHome, text: t('home') },
        { href: '/dashboard/create-activity', icon: FaPlus, text: t('createActivity') },
        { href: '/dashboard/my-activities', icon: FaListOl, text: t('myActivities') },
        { href: '/dashboard/reports', icon: FaFileAlt, text: t('reports') },
        { href: '/dashboard/templates', icon: FaClone, text: t('templates') }, // Temporarily hardcoded text, could add translation later
    ];

    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>
                <Image
                    src="/images/PartialLogo.png"
                    className={styles.image}
                    alt="logo"
                    width={150}
                    height={55}
                />
            </div>
            <br />
            <nav className="nav flex-column">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`${styles['nav-link']} ${pathname === link.href ? styles.active : ''}`}
                    >
                        <link.icon className={styles.icon} />
                        <span className={styles['nav-text']}>{link.text}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};
