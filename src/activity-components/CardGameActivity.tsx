'use client'

import style from "../../public/css/activity-component.module.css";
import Image from "next/image";
import { TbPencilStar } from "react-icons/tb";
import Link from "next/link";

interface CardGameActivityProps {
    imageAct: string;
    title: string;
    page_to: string;
    subtitle: string;
    description: string;
    buttonText: string;
}

export const CardGameActivity  = ({imageAct, title, page_to, subtitle, description, buttonText}: CardGameActivityProps) => {

    return (
        <>
                    <div className="col-md-3">
                        <div
                            className={`card h-100 ${style['card-style']}`}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-10px)";
                                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.2)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
                            }}
                        >
                            <div
                                style={{ padding: "20px" }}
                                className="text-center"
                            >
                                <Image src={imageAct} alt="LudiQuiz" width={50} height={50} />
                            </div>
                            <div className={`card-body text-center ${style['card-body-ludi']}`}>
                                <h5 className={`card-title ${style['title-activity']}`}>{title}</h5>
                                <p className={`card-text ${style['description-activity']}`} >{`${subtitle}`}</p>
                                <p className={`card-text ${style['description-activity']}`} >{`${description}`}</p>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Link 
                                        href={`/create/${page_to}`}
                                        type="button"
                                        className={style['btn-primary-activity-ludi']}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        >
                                            <TbPencilStar />
                                            {buttonText}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
        </>
    );
}