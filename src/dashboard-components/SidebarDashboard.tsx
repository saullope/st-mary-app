// src/components/SidebarDashboard.tsx
'use client'

import Link from 'next/link';
import partialLogo from '../../public/images/PartialLogo.png';
import Image from 'next/image';
import styles from '../../public/css/sidebar.module.css';
import { FaHome, FaPlus, FaListOl, FaFileAlt } from 'react-icons/fa'
import { useContext, useState } from 'react';
import { SessionContext } from "@/contexts/SessionContext";
import { useTranslations } from "next-intl";


export const SidebarDashboard = () => {

    const { selectedGrade } = useContext(SessionContext);
    const t = useTranslations("SidebarTranslation");

    const [activeLink, setActiveLink] = useState(`/dashboard?grade=${selectedGrade}`);

    const handleLinkClick = (href:any) => {
        setActiveLink(href);
    };

    const links = [
        { href: `/dashboard?grade=${selectedGrade}`, icon: FaHome, text: t('home') },
        { href: '/dashboard/create-activity', icon: FaPlus, text: t('createActivity') },
        { href: '/dashboard/my-activities', icon: FaListOl, text: t('myActivities') },
        { href: '/dashboard/reports', icon: FaFileAlt, text: t('reports') },
    ];

    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>
                <Image
                    src={partialLogo}
                    className={styles.image}
                    alt="logo"
                >
                </Image>
            </div>
            <br/>
            <nav className="nav flex-column">
                {
                    links.map((link) => (
                        <Link 
                        key={link.href} 
                        href={link.href} 
                        className={`${styles['nav-link']} ${activeLink === link.href ? styles.active : ''}`}
                        onClick={() => handleLinkClick(link.href)}>
                            <link.icon className={styles.icon}/>
                            <span className={styles['nav-text']}> {link.text} </span>
                        </Link>
                    ))
                }
            </nav>
        </div>
    );
};