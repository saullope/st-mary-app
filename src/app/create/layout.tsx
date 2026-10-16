// path: src/app/create/layout.tsx

import getSession from '@/lib/auth/getSession';
import { redirect } from 'next/navigation';
import { DecodedIdToken } from 'firebase-admin/auth';
import { Metadata } from 'next';
import { ActivityEditorProvider } from "@/context/ActivityEditorContext";
import { CreateNavbar } from "@/components/editor";
import { AchievementCatalogLoader } from "@/features/gamification/AchievementCatalogLoader";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";
import styles from "./editorShell.module.css";
import FirstActivityTour from "@/features/tours/firstActivity/FirstActivityTour";

// add metadata to the page
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.editor");
  return pageMetadata({ title: t("ludiquiz"), description: t("description") });
}

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
      <AchievementCatalogLoader>
      <ActivityEditorProvider>
        <div className={`d-flex flex-column vh-100 ${styles.shell}`}>
          {/* Barra de navegación fija en la parte superior */}
          <CreateNavbar />
    
          {/* Contenedor principal */}
          <div className="d-flex flex-grow-1" style={{ marginTop: '80px' }}>
            {/* Área dinámica para editar preguntas o configuraciones */}
            <main className={`flex-grow-1 p-4 ${styles.ground}`}>
              {children} {/* Aquí se renderizará el contenido dinámico */}
            </main>
          </div>
        </div>
        <FirstActivityTour />
      </ActivityEditorProvider>
      </AchievementCatalogLoader>
    );
  }
