'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaShieldAlt, FaGamepad, FaDatabase, FaPalette, FaArrowLeft, FaUsersCog } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import styles from './SidebarSettings.module.css';

export const SidebarSettings = ({ rolId }: { rolId?: number }) => {
    const pathname = usePathname();

    const links = [
        { href: '/settings', icon: FaUser, text: 'Información Personal' },
        { href: '/settings/security', icon: FaShieldAlt, text: 'Seguridad' },
        { href: '/settings/appearance', icon: FaPalette, text: 'Apariencia e Idioma' },
        { href: '/settings/preferences', icon: FaGamepad, text: 'Gamificación' },
        { href: '/settings/data', icon: FaDatabase, text: 'Gestión de Datos' },
    ];

    if (rolId === 1) {
        links.push({ href: '/settings/admin', icon: FaUsersCog, text: 'Gestión de Usuarios' });
    }

    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>
                <Image
                    src="/images/PartialLogo.png"
                    className={styles.image}
                    alt="logo"
                    width={150}
                    height={55}
                    priority
                />
            </div>
            
            <div className={styles.backLink}>
                <Link href="/dashboard" className="text-decoration-none">
                    <div className={styles.backItem}>
                        <FaArrowLeft className={styles.icon} />
                        <span>Volver al Dashboard</span>
                    </div>
                </Link>
            </div>

            <hr className={styles.divider} />

            <div className={styles.navLinks}>
                <h5 className={styles.headerTitle}>Ajustes</h5>
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
