'use client'

import { startLogout }  from "@/store/auth";
import { useDispatch } from "react-redux";

export const SignOutButton = () => {

    const dispatch = useDispatch();

    const onLogout = () => {
        dispatch(startLogout() as any)
    }

    return (
        <>
        <button
        onClick={() => onLogout()}
        >
            Sign Out.
        </button>
        </>
    )
}