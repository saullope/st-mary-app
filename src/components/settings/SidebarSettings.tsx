'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaShieldAlt, FaGamepad, FaPalette, FaArrowLeft, FaUsersCog, FaRoute } from 'react-icons/fa';
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
    ];

    if (rolId === 1) {
        links.push({ href: '/settings/admin', icon: FaUsersCog, text: t('users') });
    }

    return (
        <nav className={styles.sidebar} aria-label={t('title')}>
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
                <Link href="/dashboard" className={`${styles.backItem} text-decoration-none`}>
                    <FaArrowLeft className={styles.icon} aria-hidden="true" />
                    <span>{t('back')}</span>
                </Link>
            </div>

            <hr className={styles.divider} />

            <div className={styles.navLinks}>
                <h2 className={styles.headerTitle}>{t('title')}</h2>
                {links.map((link, index) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''} text-decoration-none`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <link.icon className={styles.icon} aria-hidden="true" />
                            <span>{link.text}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
