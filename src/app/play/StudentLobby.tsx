"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './play.module.css';
import { useRouter } from 'next/navigation';

interface Avatar {
    id: number;
    nombre: string;
    urlImagen: string;
}

interface StudentLobbyProps {
    avatars: Avatar[];
}

export const StudentLobby = ({ avatars }: StudentLobbyProps) => {
    const router = useRouter();
    const [gamePin, setGamePin] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [joinedSessionId, setJoinedSessionId] = useState<string | null>(null);

    const isFormValid = gamePin.length === 6 && playerName.trim().length > 0 && selectedAvatarId !== null;

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/play/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pin: gamePin,
                    nombre: playerName,
                    avatarId: selectedAvatarId
                })
            });

            const data = await response.json();

            if (data.success) {
                // Store participant info in sessionStorage to isolate it per tab
                // and tie it to the specific session ID
                sessionStorage.setItem(`ludi_participant_${data.sesionId}`, JSON.stringify({
                    id: data.participanteId,
                    name: playerName,
                    avatarId: selectedAvatarId,
                    sesionId: data.sesionId
                }));
                
                setJoinedSessionId(data.sesionId);
                setIsReady(true);
            } else {
                setError(data.error || "Error al unirse al juego.");
            }
        } catch (err) {
            console.error("Join error:", err);
            setError("Error de conexión. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleStart = () => {
        if (joinedSessionId) {
            router.push(`/play/student/${joinedSessionId}`);
        }
    };

    if (isReady) {
        return (
            <div className={styles.readyScreen}>
                <Image 
                    src="/images/play/confeti.png" 
                    alt="Confeti" 
                    width={140} 
                    height={140} 
                    className={styles.confettiImage}
                />
                <p className={styles.readyText}>¡Listo, el juego está por comenzar!</p>
                <button className={styles.startBtn} onClick={handleStart}>
                    Iniciar
                </button>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            {/* Animated Stars Background */}
            <div className={styles.background}>
                <div className={`${styles.estrella} ${styles.estrella1}`}></div>
                <div className={`${styles.estrella} ${styles.estrella2}`}></div>
                <div className={`${styles.estrella} ${styles.estrella3}`}></div>
            </div>

            <div className={styles.container}>
                <div className={styles.titleContainer}>
                    <Image 
                        src="/images/play/logo-ludigame.png" 
                        alt="LudiGame Logo" 
                        width={220} 
                        height={80} 
                        className={styles.logo}
                        style={{ width: '100%', height: 'auto' }}
                    />
                </div>

                <h2 className={styles.title}>¡Únete al Juego!</h2>

                <div className={styles.contentGrid}>
                    {/* Form Section */}
                    <form className={styles.formSection} onSubmit={handleJoin}>
                        <label htmlFor="gamePin">PIN del Juego (6 dígitos)</label>
                        <input
                            type="text"
                            id="gamePin"
                            maxLength={6}
                            value={gamePin}
                            onChange={(e) => setGamePin(e.target.value.replace(/\D/g, ''))}
                            placeholder="Ejemplo: 123456"
                            required
                        />
                        
                        <label htmlFor="playerName">Tu Nombre</label>
                        <input
                            type="text"
                            id="playerName"
                            maxLength={12}
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Ejemplo: Ana"
                            required
                        />
                        
                        {error && <span className={styles.errorMessage}>{error}</span>}

                        <button 
                            type="submit" 
                            className={styles.joinButton} 
                            disabled={!isFormValid || loading}
                        >
                            {loading ? "Entrando..." : "Unirse"}
                        </button>
                    </form>

                    {/* Avatar Selection */}
                    <div className={styles.avatarSection}>
                        <p>Selecciona tu avatar:</p>
                        <div className={styles.avatarsGrid}>
                            {avatars.map((avatar) => (
                                <div 
                                    key={avatar.id} 
                                    className={`${styles.avatarWrapper} ${selectedAvatarId === avatar.id ? styles.avatarSelected : ''}`}
                                    onClick={() => setSelectedAvatarId(avatar.id)}
                                >
                                    <img 
                                        src={avatar.urlImagen} 
                                        alt={avatar.nombre} 
                                        className={styles.avatarImage} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
