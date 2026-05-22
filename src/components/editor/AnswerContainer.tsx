'use client';

import { useState, useCallback } from 'react';
import { FaImage, FaSearch, FaTimes, FaTrash } from 'react-icons/fa';
import Image from 'next/image';
import styles from '@/styles/pages/ludiquiz.module.css';
import { ModalMultimedia } from './ModalMultimedia';

interface Answer {
    id: number;
    text: string;
    isCorrect: boolean;
    imageUrl?: string | null;
}

interface AnswersContainerProps {
    answers: Answer[];
    onAddAnswer: () => void;
    onUpdateAnswerText: (id: number, text: string) => void;
    onToggleCorrectAnswer: (id: number) => void;
    onUpdateAnswerImage?: (id: number, imageUrl: string | null) => void;
    onDeleteAnswer?: (id: number) => void;
    onAnswerKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
}

const symbols = ['🔺', '🔷', '🟢', '🟪'];
const colors = ['#D1B7C6', '#9CB3DF', '#9ACED1', '#9ECE9C'];

export const AnswerContainer: React.FC<AnswersContainerProps> = ({
    answers,
    onAddAnswer,
    onUpdateAnswerText,
    onToggleCorrectAnswer,
    onUpdateAnswerImage,
    onDeleteAnswer,
    onAnswerKeyDown,
}) => {
    const [showModal, setShowModal] = useState(false);
    const [activeAnswerId, setActiveAnswerId] = useState<number | null>(null);

    const handleOpenUnsplash = useCallback((answerId: number) => {
        setActiveAnswerId(answerId);
        setShowModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setTimeout(() => setActiveAnswerId(null), 100);
    }, []);

    const handleSelectMedia = useCallback((type: string, url: string) => {
        if (activeAnswerId !== null && onUpdateAnswerImage) {
            onUpdateAnswerImage(activeAnswerId, url);
        }
        handleCloseModal();
    }, [activeAnswerId, onUpdateAnswerImage, handleCloseModal]);

    const handleFileSelect = (answerId: number) => {
        const input = document.getElementById(`file-input-${answerId}`) as HTMLInputElement;
        if (input) {
            input.click();
        }
    };

    const handleFileChange = (answerId: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && onUpdateAnswerImage) {
            const fileURL = URL.createObjectURL(file);
            onUpdateAnswerImage(answerId, fileURL);
        }
        event.target.value = '';
    };

    const handleRemoveImage = (answerId: number) => {
        if (onUpdateAnswerImage) {
            onUpdateAnswerImage(answerId, null);
        }
    };

    const handleDeleteAnswer = (answerId: number) => {
        if (onDeleteAnswer && answers.length > 2) {
            onDeleteAnswer(answerId);
        }
    };

    return (
        <>
            <div className={styles['quiz-container']}>
                <div id="answers-container" className={`${styles['answers-container']} answers-container-grid`} data-tour="answers-section">
                    {answers.map((answer, index) => (
                        <div
                            key={answer.id}
                            className={`${styles.answer} ${answer.isCorrect ? styles.correct : ''}`}
                            style={{ background: colors[index % colors.length] }}
                        >
                            {/* Left side: symbol + input */}
                            <div className={styles['answer-left']}>
                                <span className={styles['answer-symbol']}>{symbols[index % symbols.length]}</span>
                                <input
                                    type="text"
                                    placeholder={`Respuesta ${index + 1}`}
                                    value={answer.text}
                                    onChange={(e) => onUpdateAnswerText(answer.id, e.target.value)}
                                    className={`${styles.actinput} answer-input-field`}
                                    onKeyDown={(e) => onAnswerKeyDown && onAnswerKeyDown(e, index)}
                                />
                            </div>

                            {/* Right side: action buttons */}
                            <div className={styles['answer-actions']}>
                                {/* Check circle for correct answer */}
                                <button
                                    className={`${styles['answer-action-btn']} ${styles['check-btn']} ${answer.isCorrect ? styles.active : ''}`}
                                    onClick={() => onToggleCorrectAnswer(answer.id)}
                                    type="button"
                                    title="Marcar como correcta"
                                />

                                {/* Hidden file input */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    id={`file-input-${answer.id}`}
                                    onChange={(e) => handleFileChange(answer.id, e)}
                                    style={{ display: 'none' }}
                                />

                                {/* Upload image button */}
                                <button
                                    className={styles['answer-action-btn']}
                                    onClick={() => handleFileSelect(answer.id)}
                                    type="button"
                                    title="Subir imagen"
                                >
                                    <FaImage />
                                </button>

                                {/* Search Unsplash button */}
                                <button
                                    className={styles['answer-action-btn']}
                                    onClick={() => handleOpenUnsplash(answer.id)}
                                    type="button"
                                    title="Buscar en Unsplash"
                                >
                                    <FaSearch />
                                </button>
                            </div>

                            {/* Image preview below - centered */}
                            {answer.imageUrl && (
                                <div className={styles['answer-image-wrapper']}>
                                    <div className={styles['answer-image-container']}>
                                        {/* Use img for blob URLs, Image for external URLs */}
                                        {answer.imageUrl.startsWith('blob:') ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={answer.imageUrl}
                                                alt={`Respuesta ${index + 1}`}
                                                width={120}
                                                height={90}
                                                style={{ objectFit: 'cover', borderRadius: '8px' }}
                                            />
                                        ) : (
                                            <Image
                                                src={answer.imageUrl}
                                                alt={`Respuesta ${index + 1}`}
                                                width={120}
                                                height={90}
                                                style={{ objectFit: 'cover', borderRadius: '8px' }}
                                                unoptimized
                                            />
                                        )}
                                        <button
                                            className={styles['remove-answer-image']}
                                            onClick={() => handleRemoveImage(answer.id)}
                                            type="button"
                                            title="Eliminar imagen"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Delete answer button - only show if more than 2 answers */}
                            {answers.length > 2 && onDeleteAnswer && (
                                <button
                                    className={styles['delete-answer-btn']}
                                    onClick={() => handleDeleteAnswer(answer.id)}
                                    type="button"
                                    title="Eliminar respuesta"
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    className={styles['add-answer']}
                    onClick={onAddAnswer}
                >
                    + Agregar respuesta
                </button>
            </div>

            {/* Modal for Unsplash search */}
            {showModal && (
                <ModalMultimedia
                    show={showModal}
                    handleClose={handleCloseModal}
                    origin="unsplash"
                    onSelectMedia={handleSelectMedia}
                />
            )}
        </>
    );
};
