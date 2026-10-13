'use client';

import { useState, useCallback } from 'react';
import { FaImage, FaTimes, FaTrash } from 'react-icons/fa';
import styles from '@/styles/pages/ludiquiz.module.css';
import { ModalMultimedia } from './ModalMultimedia';
import { AnswerImageSearch, type ImageSearchSource } from './AnswerImageSearch';
import { notify } from '@/components/ui';
import { useFirebaseStorage } from '@/hooks/useFirebaseStorage';
import { ANSWER_FILE_PREFIX, uploadsPath } from '@/lib/mediaSources';
import { useTranslations } from "next-intl";

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
    const [searchSource, setSearchSource] = useState<ImageSearchSource | null>(null);
    const [activeAnswerId, setActiveAnswerId] = useState<number | null>(null);
    const [uploadingAnswerId, setUploadingAnswerId] = useState<number | null>(null);
    const { uploadFile } = useFirebaseStorage();
    const t = useTranslations("Editor.answers");

    const handleOpenSearch = useCallback((answerId: number, source: ImageSearchSource) => {
        setActiveAnswerId(answerId);
        setSearchSource(source);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSearchSource(null);
        setActiveAnswerId(null);
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

    // Se sube a Storage: una URL blob: solo existiría en este navegador y no se podría guardar.
    const handleFileChange = async (answerId: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file || !onUpdateAnswerImage) return;
        setUploadingAnswerId(answerId);
        const url = await uploadFile(file, uploadsPath(ANSWER_FILE_PREFIX, file.name));
        setUploadingAnswerId(null);
        if (!url) {
            notify.error(t("uploadFailed"), t("checkConnection"));
            return;
        }
        onUpdateAnswerImage(answerId, url);
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
                                    placeholder={t("answerPlaceholder", { number: index + 1 })}
                                    aria-label={t("answerPlaceholder", { number: index + 1 })}
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
                                    title={t("markCorrect")}
                                    aria-label={t("markCorrectFor", { number: index + 1 })}
                                    aria-pressed={answer.isCorrect}
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
                                    title={t("uploadImage")}
                                    aria-label={t("uploadImageFor", { number: index + 1 })}
                                    disabled={uploadingAnswerId === answer.id}
                                >
                                    {uploadingAnswerId === answer.id
                                        ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} aria-hidden="true" />
                                        : <FaImage aria-hidden="true" />}
                                </button>

                                <AnswerImageSearch
                                    answerNumber={index + 1}
                                    onPick={(source) => handleOpenSearch(answer.id, source)}
                                />
                            </div>

                            {/* Image preview below - centered */}
                            {answer.imageUrl && (
                                <div className={styles['answer-image-wrapper']}>
                                    <div className={styles['answer-image-container']}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={answer.imageUrl}
                                            alt={t("imageOf", { number: index + 1 })}
                                            width={120}
                                            height={90}
                                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                        <button
                                            className={styles['remove-answer-image']}
                                            onClick={() => handleRemoveImage(answer.id)}
                                            type="button"
                                            title={t("removeImage")}
                                            aria-label={t("removeImage")}
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
                                    title={t("deleteAnswer")}
                                    aria-label={t("deleteAnswerFor", { number: index + 1 })}
                                >
                                    <FaTrash aria-hidden="true" />
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

            {searchSource && (
                <ModalMultimedia
                    show
                    handleClose={handleCloseModal}
                    origin={searchSource}
                    onSelectMedia={handleSelectMedia}
                />
            )}
        </>
    );
};
