import React from 'react';
import Image from 'next/image';
import styles from '../../public/css/create-activity.module.css';
import "bootstrap/dist/css/bootstrap.min.css";

interface Props {
    cardTitle : string,
    cardAlt: string,
    srcImageGrade:any
}

export const CardGrade = ({cardTitle, cardAlt, srcImageGrade }: Props) => {
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
                        <div className={`${styles['card-body-activity']} p-3`}>
                            <h5 className="card-title text-center">{cardTitle}</h5>
                        </div>
                </div>
            </div>
        </div>
    )
}
