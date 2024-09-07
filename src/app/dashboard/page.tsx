'use client'

import { WidgetItem } from "@/components";
import { startLogout } from "@/store/auth";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LOGIN_STATUS } from "@/types";
import { redirect } from "next/navigation";
import Image from 'next/image';
import profileImage from '../../../public/images/profile.jpg';


/*export const metadata: Metadata = {
  title: "LudiGame",
  description: ""
}*/

export default function Dahsboard(){

  const dispatch = useDispatch();

  const { uid, email, displayName, status, photoURL } = useSelector((state: any) => state.auth);

  if (status === LOGIN_STATUS.NOT_AUTHENTICATED) {
    redirect('/auth/login');
    return null;
  }

  const onLogout = () => {
    dispatch(startLogout() as any)
}

  
    return (
      <div className="grid gap-6 grid-cols-1 ">
        <WidgetItem title="Usuario conectado S-Side">
          <div className="flex flex-col">
            <span>Logeado con:</span>
            <span>{uid}</span>
            <span>{email}</span>
            <span>{displayName}</span>
            <Image
              src={photoURL == null ? profileImage : photoURL}
              width={50}
              height={50}
              alt={`profile image ${displayName}`}
            />
            <button onClick={onLogout}>Sign Out</button>
          </div>
        </WidgetItem>
      </div>
    );
}