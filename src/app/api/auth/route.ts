import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from '@reduxjs/toolkit';
import {
    startLoginWithEmailPassword,
    startGoogleSignIn
} from "@/store/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

    try {
        const { emailAddress, password, userName, action } = await request.json();

        // if request is empty, return an error
        if (!emailAddress ||!password ||!action) {
            return NextResponse.json({ error: 'missing required fields saul lopez' }, { status: 400 });
        }

         console.log('email:', emailAddress, 'password:', password, 'action:', action);


        const dispatch = useDispatch();

        if (action === 'LOGIN_WITH_EMAIL_PASSWORD') {
            dispatch(startLoginWithEmailPassword(emailAddress, password) as any);
        } else if (action === 'LOGIN_WITH_GOOGLE_SIGN_IN') {
            dispatch(startGoogleSignIn() as any);
        }

        const { email, uid, displayName, status } = useSelector((state: any) => state.auth);

        // print in console for debugging purposes
        console.log(`User logged in: ${email}, ${uid}, ${displayName}, ${status}`);

        return NextResponse.json( { email, uid, displayName, status }, { status: 200 });
}catch (error) {
    return NextResponse.json({ error: error }, { status: 400 });
}
}