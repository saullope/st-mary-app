'use client'

import Image from "next/image";
import { Dropdown } from 'react-bootstrap';
import defaultProfilePic from '../../../public/images/profile.png';
import { signOut } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { auth } from "@/firebase/firebase";
import { BsGlobe } from 'react-icons/bs';
import { LanguageSelector } from "@/components";

interface FirebaseSession {
    s: string;
    name: string;
    picture?: string; // La URL de la foto de perfil es opcional
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

    const handleLogout = async () => {
    try {
        // Cerrar sesión en Firebase PRIMERO
        await signOut(auth);
        localStorage.clear();
        sessionStorage.clear();

        // Llamar al endpoint para eliminar la cookie de sesión
        const response = await fetch("/api/auth/signout", {
            method: "POST",
        });

        if (response.ok) {
            router.push('/auth/login');
        } else {
            const errorData = await response.json();
            alert(`Error al cerrar sesión: ${errorData.error || "Error desconocido."}`);
        }
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert(`Error al cerrar sesión: ${error}`);
    }
};


    return (
        <>
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
                                                src={ sessionData.picture ||  defaultProfilePic.src}
                                                alt="User Profile"
                                                width={40}
                                                height={40}
                                                priority={false}
                                                style={{ borderRadius: '50%', marginRight: '10px' }}
                                            />                                        
                                        {sessionData.name || sessionData.email}
                                    </span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Header>{sessionData.name || sessionData.email}</Dropdown.Header>
                                    <Dropdown.Divider />
                                    <Dropdown.Item href="#/action-1">Cuenta</Dropdown.Item>
                                    <Dropdown.Item href="#/action-1">Configuración</Dropdown.Item>
                                    <Dropdown.Item onClick={handleLogout} className="text-danger">Cerrar sesión</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}