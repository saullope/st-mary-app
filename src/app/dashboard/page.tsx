import { WidgetItem } from "@/components";
import { Metadata } from "next";
import getSession from '@/lib/auth/getSession'; // Suponiendo que esta función verifica la sesión
import { redirect } from "next/navigation"; // Para manejar redirecciones
import { ReactNode } from "react";
import Image from 'next/image';

export const metadata: Metadata = {
  title: "LudiGame",
  description: ""
}

export default async function Dashboard() {
  const user = await getSession();

  // Si no hay un usuario autenticado, redirigir a la página de login
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div>
      <h1>Bienvenido, {user.email}</h1>
      <h1>{user.name}</h1>
      <p>UID: {user.uid}</p>
      <p>{ JSON.stringify(user) }</p>
    </div>
  );
}
