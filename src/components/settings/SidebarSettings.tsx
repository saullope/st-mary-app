'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaShieldAlt, FaGamepad, FaDatabase, FaPalette, FaArrowLeft, FaUsersCog, FaRoute } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import styles from './SidebarSettings.module.css';
import { useTranslations } from 'next-intl';

export const SidebarSettings = ({ rolId }: { rolId?: number }) => {
    const pathname = usePathname();
    const t = useTranslations('SettingsNav');

    const links = [
        { href: '/settings', icon: FaUser, text: t('personal') },
        { href: '/settings/security', icon: FaShieldAlt, text: t('security') },
        { href: '/settings/appearance', icon: FaPalette, text: t('appearance') },
        { href: '/settings/preferences', icon: FaGamepad, text: t('gamification') },
        { href: '/settings/tours', icon: FaRoute, text: t('tours') },
        { href: '/settings/data', icon: FaDatabase, text: t('data') },
    ];

    if (rolId === 1) {
        links.push({ href: '/settings/admin', icon: FaUsersCog, text: t('users') });
    }

    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>
                <Image
                    src="/images/PartialLogo.png"
                    className={styles.image}
                    alt="LudiGame"
                    width={150}
                    height={55}
                    priority
                />
            </div>
            
            <div className={styles.backLink}>
                <Link href="/dashboard" className="text-decoration-none">
                    <div className={styles.backItem}>
                        <FaArrowLeft className={styles.icon} />
                        <span>{t('back')}</span>
                    </div>
                </Link>
            </div>

            <hr className={styles.divider} />

            <div className={styles.navLinks}>
                <h5 className={styles.headerTitle}>{t('title')}</h5>
                {links.map((link, index) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link key={index} href={link.href} className="text-decoration-none">
                            <div className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                                <link.icon className={styles.icon} />
                                <span>{link.text}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
