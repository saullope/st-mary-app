// path: src/app/create/layout.tsx

import getSession from '@/lib/auth/getSession';
import { redirect } from 'next/navigation';
import { DecodedIdToken } from 'firebase-admin/auth';
import "bootstrap/dist/css/bootstrap.min.css";
import { Metadata } from 'next';

// add metadata to the page
export const metadata: Metadata = {
  title: 'LudiGame | Crear actividad',
  description: 'Create a new activity',
};

import { ActivityEditorProvider } from "@/context/ActivityEditorContext";
import { CreateNavbar } from "@/components/editor";

export default async function CreateActivityLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const token: DecodedIdToken | null = await getSession();
  
    // Si no hay un usuario autenticado, redirigir a la página de login
    if (!token) {
      redirect('/auth/login');
    }
  
    return (
      <ActivityEditorProvider>
        <div className="d-flex flex-column vh-100">
          {/* Barra de navegación fija en la parte superior */}
          <CreateNavbar />
    
          {/* Contenedor principal */}
          <div className="d-flex flex-grow-1" style={{ marginTop: '80px' }}>
            {/* Área dinámica para editar preguntas o configuraciones */}
            <main className="flex-grow-1 p-4 bg-light">
              {children} {/* Aquí se renderizará el contenido dinámico */}
            </main>
          </div>
        </div>
      </ActivityEditorProvider>
    );
  }
