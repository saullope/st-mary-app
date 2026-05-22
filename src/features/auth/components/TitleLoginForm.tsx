import styles from '@/styles/pages/landing.module.css';

interface TitleLoginFormProps {
    icon?: string; 
    title?: string;
}

export const TitleLoginForm = ({ icon, title }: TitleLoginFormProps) => {
    return (
        <div className={styles['title-group']}>
        <div className={styles['icon-lock']}>{icon}</div>
        <h2 className={styles['title-effect']}>{title}</h2>
      </div>
    );
};
