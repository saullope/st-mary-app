import React from 'react';
import Image from 'next/image';
import styles from '../../public/css/create-activity.module.css';
import Link from 'next/link';
import "bootstrap/dist/css/bootstrap.min.css";

interface Props {
    cardTitle : string,
    cardAlt: string,
    srcImageGrade:any,
    typeButton: string
}
export const CardActivity = ({cardTitle, cardAlt, srcImageGrade, typeButton }: Props) => {
  return (
    <div className="row row-cols-1 row-cols-md-3 g-4 py-1">
    <div className="col">
        <div className={styles['card-activity']} style={{width: '23rem'}}>
            <Image 
                src={srcImageGrade} 
                className="card-img-top" 
                width={368}
                height={216.38}
                alt={cardAlt} >
            </Image>
                <div className={`${styles['card-body-activity']} p-2`}>
                    <button className={` ${styles[`btn-${typeButton}-activity`]}`}>{cardTitle}</button>
                </div>
        </div>
    </div>
</div>
  )
}
