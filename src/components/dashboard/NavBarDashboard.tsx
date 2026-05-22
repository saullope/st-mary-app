'use client'

import React, { useState } from 'react';
import { Dropdown, Spinner } from 'react-bootstrap';
import { signOut } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { auth } from "@/firebase/firebase";
import { BsGlobe } from 'react-icons/bs';
import { FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { LanguageSelector } from "@/components";
import { AUTH_API_ROUTES } from "@/lib/auth/constants";
import designStyles from '@/styles/pages/LudiDesign.module.css';

interface FirebaseSession {
    s: string;
    name: string;
    picture?: string;
    aud: string;
    auth_time: number;
    user_id: string;
    sub: string;
    iat: number;
    exp: number;
    email: string;
    email_verified: boolean;
    firebase: {
        identities: {
            email: string[];
            "google.com"?: string[];
        };
        sign_in_provider: string;
    };
    uid: string;
}

interface NavbarDashboardProps {
    sessionData: FirebaseSession;
}

// Custom Toggle to fix React 19 ref warning
const CustomToggle = React.forwardRef<HTMLDivElement, any>(
  ({ children, onClick }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  )
);
CustomToggle.displayName = 'CustomToggle';

export const NavbarDashboard: React.FC<NavbarDashboardProps> = ({ sessionData }) => {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        
        try {
            await signOut(auth);
            localStorage.clear();
            sessionStorage.clear();

            const response = await fetch(AUTH_API_ROUTES.LOGOUT, {
                method: "POST",
            });

            if (response.ok) {
                router.push('/auth/login');
            } else {
                setIsLoggingOut(false);
                const errorData = await response.json();
                alert(`Error al cerrar sesion: ${errorData.error || "Error desconocido."}`);
            }
        } catch (error) {
            setIsLoggingOut(false);
            console.error("Error al cerrar sesion:", error);
            alert(`Error al cerrar sesion: ${error}`);
        }
    };


    return (
        <>
            {/* Logout Loading Overlay */}
            {isLoggingOut && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    <div
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)',
                            borderRadius: '20px',
                            padding: '40px 60px',
                            textAlign: 'center',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                        }}
                    >
                        <Spinner
                            animation="border"
                            variant="primary"
                            style={{
                                width: '60px',
                                height: '60px',
                                borderWidth: '4px',
                            }}
                        />
                        <p
                            style={{
                                marginTop: '20px',
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                color: '#495057',
                                fontFamily: 'Comic Sans MS, cursive',
                            }}
                        >
                            Cerrando sesion...
                        </p>
                    </div>
                </div>
            )}

            <nav className={`fixed navbar navbar-expand-lg bg-body-tertiary ${designStyles.darkNavbar}`}>
                <div className="container-fluid">
                    <div className="collapse navbar-collapse" id="navbarNav">
                    <div
                        style={{ width: '150px', height: '55.19px', margin: '0px 30px' }}
                        className="-inline-block align-top"
                    ></div>
                    </div>
                    <div className="d-grid gap-2 d-md-flex justify-content-center justify-content-md-end align-items-center">
                        <div className={`d-flex align-items-center gap-2 ${designStyles.darkNavbarText}`}>
                        <BsGlobe />
                        <LanguageSelector />
                        </div>
                        <div className="dropdown">
                            <Dropdown>
                                <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                                    <span className={`d-flex align-items-center justify-content-center ${designStyles.darkNavbarText}`}>
                                        <img
                                            src={sessionData.picture || '/images/profile.png'}
                                            alt="User Profile"
                                            className="rounded-circle shadow-sm"
                                            style={{ 
                                                width: '40px',
                                                height: '40px',
                                                objectFit: 'cover',
                                                marginRight: '12px',
                                                border: '2px solid rgba(255,255,255,0.2)'
                                            }}
                                            onError={(e) => {
                                                e.currentTarget.src = '/images/profile.png';
                                            }}
                                        />                                        
                                        <span className="fw-bold">{sessionData.name || sessionData.email}</span>
                                    </span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="shadow border-0 rounded-3 mt-2" style={{ minWidth: '220px', zIndex: 1000 }}>
                                    <div className="px-3 py-2 text-center border-bottom mb-2 d-flex flex-column align-items-center">
                                        <img
                                            src={sessionData.picture || '/images/profile.png'}
                                            alt="User Profile"
                                            className="rounded-circle shadow-sm mb-3"
                                            style={{ 
                                                width: '65px', 
                                                height: '65px', 
                                                objectFit: 'cover',
                                                border: '3px solid #e9ecef' 
                                            }}
                                            onError={(e) => {
                                                e.currentTarget.src = '/images/profile.png';
                                            }}
                                        />
                                        <p className="mb-0 fw-bold text-dark">{sessionData.name || 'Usuario'}</p>
                                        <p className="mb-0 text-muted small">{sessionData.email}</p>
                                    </div>
                                    
                                    <Dropdown.Item 
                                        as="button" 
                                        onClick={() => router.push(`/view/profile/${sessionData.uid}`)}
                                        className="py-2 px-3 fw-medium d-flex align-items-center"
                                    >
                                        <FaUserCircle className="me-2 text-primary" /> Mi Perfil
                                    </Dropdown.Item>

                                    <Dropdown.Item 
                                        as="button" 
                                        onClick={() => router.push('/settings')}
                                        className="py-2 px-3 fw-medium d-flex align-items-center"
                                    >
                                        <FaCog className="me-2 text-secondary" /> Configuración
                                    </Dropdown.Item>
                                    
                                    <Dropdown.Divider />
                                    
                                    <Dropdown.Item 
                                        onClick={handleLogout} 
                                        className="py-2 px-3 fw-medium text-danger d-flex align-items-center"
                                        disabled={isLoggingOut}
                                    >
                                        {isLoggingOut ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Cerrando...
                                            </>
                                        ) : (
                                            <>
                                                <FaSignOutAlt className="me-2" /> Cerrar sesión
                                            </>
                                        )}
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}