"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './play.module.css';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

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
    const t = useTranslations('Play.lobby');
    const [gamePin, setGamePin] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                    token: data.token,
                    name: playerName,
                    avatarId: selectedAvatarId,
                    sesionId: data.sesionId
                }));

                // La página del juego muestra la sala de espera hasta que el docente inicie.
                router.push(`/play/student/${data.sesionId}`);
            } else {
                setError(data.error || t("joinFailed"));
            }
        } catch (err) {
            console.error("Join error:", err);
            setError(t("connectionError"));
        } finally {
            setLoading(false);
        }
    };

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
                        alt="LudiGame"
                        width={220}
                        height={80}
                        className={styles.logo}
                        style={{ width: '100%', height: 'auto' }}
                    />
                </div>

                <h1 className={styles.title}>{t("title")}</h1>

                <div className={styles.contentGrid}>
                    {/* Form Section */}
                    <form className={styles.formSection} onSubmit={handleJoin}>
                        <label htmlFor="gamePin">{t("pinLabel")}</label>
                        <input
                            type="text"
                            id="gamePin"
                            maxLength={6}
                            value={gamePin}
                            onChange={(e) => setGamePin(e.target.value.replace(/\D/g, ''))}
                            placeholder={t("pinPlaceholder")}
                            inputMode="numeric"
                            autoComplete="off"
                            required
                        />

                        <label htmlFor="playerName">{t("nameLabel")}</label>
                        <input
                            type="text"
                            id="playerName"
                            maxLength={12}
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder={t("namePlaceholder")}
                            required
                        />

                        {error && <span className={styles.errorMessage} role="alert">{error}</span>}

                        <button
                            type="submit"
                            className={styles.joinButton}
                            disabled={!isFormValid || loading}
                        >
                            {loading ? t("joining") : t("join")}
                        </button>
                    </form>

                    {/* Avatar Selection */}
                    <div className={styles.avatarSection}>
                        <p id="avatar-label">{t("avatarLabel")}</p>
                        <div className={styles.avatarsGrid} role="radiogroup" aria-labelledby="avatar-label">
                            {avatars.map((avatar) => (
                                <div
                                    key={avatar.id}
                                    className={`${styles.avatarWrapper} ${selectedAvatarId === avatar.id ? styles.avatarSelected : ''}`}
                                    role="radio"
                                    aria-checked={selectedAvatarId === avatar.id}
                                    aria-label={avatar.nombre}
                                    tabIndex={0}
                                    onClick={() => setSelectedAvatarId(avatar.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setSelectedAvatarId(avatar.id);
                                        }
                                    }}
                                >
                                    <img
                                        src={avatar.urlImagen}
                                        alt=""
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
