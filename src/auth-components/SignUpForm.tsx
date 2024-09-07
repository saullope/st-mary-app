'use client'

import Link from 'next/link';
import { useTranslations } from "next-intl";
import { useState, useMemo, FormEvent } from 'react';
import { startCreatingUserWithEmailAndPassword } from '@/store/auth/thunks';
import { LOGIN_STATUS } from '@/types';
import { useDispatch, useSelector } from 'react-redux';
import { redirect } from 'next/navigation';

export const SignUpForm = () => {

    const t = useTranslations("SignUpForm");

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [ error, setError] = useState('');
    const [ message, setMessage] = useState('');

    const dispatch = useDispatch();
    const { status, errorMessage } = useSelector((state: any) => state.auth);
    const isAuthenticated = useMemo(() => status === LOGIN_STATUS.CHECKING, [status]);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();

        try {

        dispatch(startCreatingUserWithEmailAndPassword(email, password, `${name} ${lastName}`) as any);

        //cuando el usuario se crea correctamente
        if (status === LOGIN_STATUS.AUTHENTICATED) {
            redirect('/dashboard');
        }

        // clear los inputs
        setEmail('');
        setPassword('');
        setName('');
        setLastName('');
        setError('');
        setMessage('');
    } catch(error) {
        if (error instanceof Error){
            setError(error.message);
        } else {
            setError("No hay error");
        }
    }
    };


    return (
        <>
            <div className="card mt-5" style={{ width: "35rem" }}>
                <div className="d-flex justify-content-center card-title pt-5 pb-4">
                    <h1>{t("titleForm")}</h1>
                </div>
                <div className="card-body ps4">
                    <div className="">
                        <form onSubmit={onSubmit} className='row g-3'>
                            <div className="col-md-4">
                                <input 
                                type="text" 
                                className="form-control" 
                                placeholder='First Name' 
                                onChange={(e) => setName(e.target.value)}
                                required />
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control" placeholder='Last Name' onChange={(e) => setLastName(e.target.value)} />
                            </div>
                            <div className="mb-2">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder='yourEmail@example.com'
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-2">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder='Password'
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-2">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder='Confirm Password'
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="d-flex form-text">
                                <div>{t('haveAccount')}</div>
                                <div><Link href={'/auth/login'}>{t('signIn')}</Link></div>
                            </div>
                            <div className="mb-3">
                                {!!errorMessage && (
                                    <p className="text-danger">
                                        {errorMessage}
                                    </p>
                                )}
                            </div>
                            <div className="mb-3">
                                {!!error && (
                                    <p className="text-danger">
                                        {error}
                                    </p>
                                )}
                            </div>
                            <div className="d-grid gap-2 mt-2" >
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!email || !password}
                                >
                                    {t("signUpButton")}
                                </button>
                            </div>
                        </form>
                        <div className="d-grid gap-2 mt-3">
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
