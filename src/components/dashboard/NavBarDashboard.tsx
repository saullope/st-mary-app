'use client'

import { useState } from 'react';
import Image from "next/image";
import { Dropdown, Spinner } from 'react-bootstrap';
import { signOut } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { auth } from "@/firebase/firebase";
import { BsGlobe } from 'react-icons/bs';
import { LanguageSelector } from "@/components";
import { AUTH_API_ROUTES } from "@/lib/auth/constants";

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

            <nav className={`fixed navbar navbar-expand-lg bg-body-tertiary`}>
                <div className="container-fluid">
                    <div className="collapse navbar-collapse" id="navbarNav">
                    <div
                        style={{ width: '150px', height: '55.19px', margin: '0px 30px' }}
                        className="-inline-block align-top"
                    ></div>
                    </div>
                    <div className="d-grid gap-2 d-md-flex justify-content-center justify-content-md-end align-items-center">
                        <div className="d-flex align-items-center gap-2">
                        <BsGlobe />
                        <LanguageSelector />
                        </div>
                        <div className="dropdown">
                            <Dropdown>
                                <Dropdown.Toggle as="div" id="dropdown-custom-components" style={{ cursor: 'pointer' }}>
                                    <span>
                                            <Image
                                                src={ sessionData.picture || '/images/profile.png'}
                                                alt="User Profile"
                                                width={40}
                                                height={40}
                                                priority={false}
                                                unoptimized={true}
                                                style={{ borderRadius: '50%', marginRight: '10px' }}
                                            />                                        
                                        {sessionData.name || sessionData.email}
                                    </span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Header>{sessionData.name || sessionData.email}</Dropdown.Header>
                                    <Dropdown.Divider />
                                    <Dropdown.Item href="#/action-1">Cuenta</Dropdown.Item>
                                    <Dropdown.Item href="#/action-1">Configuracion</Dropdown.Item>
                                    <Dropdown.Item 
                                        onClick={handleLogout} 
                                        className="text-danger"
                                        disabled={isLoggingOut}
                                    >
                                        {isLoggingOut ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Cerrando...
                                            </>
                                        ) : (
                                            'Cerrar sesion'
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