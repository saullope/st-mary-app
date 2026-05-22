import styles from '@/styles/pages/landing.module.css';

interface DescriptionFormProps {
    text: string;
}

export const DescriptionForm = ({ text }: DescriptionFormProps) => {
 
    return (
        <p className={styles['text-effect']}>
            {text}
        </p>
    );
}        