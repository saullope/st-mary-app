import { Metadata } from "next";
import getCurrentUser from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';
import prisma from "@/lib/db";
import { FaChartLine, FaShieldAlt } from "react-icons/fa";
import AdminReportsTable from "./AdminReportsTable";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Admin Analytics | LudiGame`,
    description: 'Panel avanzado de efectividad y analíticas.'
  };
}

export default async function AdminReportsPage() {
  const user = await getCurrentUser();
  
  if (!user || user.rol.nombre !== 'ADMIN') {
    return redirect('/dashboard');
  }

  // 1. DB Safety: ONLY use prisma.findMany.
  // 2. Fetch: Join LudiUser, Activity, Session and Submission (respuestas).
  const sessionsRaw = await prisma.lUDI_SESION.findMany({
    orderBy: { finalizada_en: 'desc' },
    include: {
      user: true,
      LUDI_ACTIVIDAD: {
        include: { 
            grado: true,
            activity: true
        }
      },
      LUDI_SESION_PARTICIPANTE: {
        include: {
            avatar: true,
            respuestas: {
                include: { pregunta: true }
            }
        }
      }
    }
  });

  // Process data for the expandable rows
  const processedSessions = sessionsRaw.map((session: any) => {
    let sumFun = 0;
    let funCount = 0;
    const questionMap: Record<string, { texto: string, correct: number, total: number }> = {};

    session.LUDI_SESION_PARTICIPANTE.forEach((p: any) => {
        if (p.studentEnjoyment) {
            sumFun += p.studentEnjoyment;
            funCount++;
        }
        
        p.respuestas.forEach((r: any) => {
            const qId = r.preguntaId.toString();
            if (!questionMap[qId]) {
                questionMap[qId] = { texto: r.pregunta?.enunciado || "Pregunta", correct: 0, total: 0 };
            }
            questionMap[qId].total++;
            if (r.esCorrecta) questionMap[qId].correct++;
        });
    });

    const questionStats = Object.values(questionMap).map(q => {
        const acierto = q.total > 0 ? Math.round((q.correct / q.total) * 100) : 0;
        const error = 100 - acierto;
        return { texto: q.texto, acierto, error };
    });

    return {
        ...session,
        avgStudentFun: funCount > 0 ? (sumFun / funCount) : null,
        questionStats
    };
  });

  return (
    <div className="container-fluid py-5 px-md-5" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 pb-4 border-bottom border-secondary border-opacity-25">
        <div>
          <h2 className="fw-bold mb-1 text-dark d-flex align-items-center">
            <FaChartLine className="me-3 text-primary" />
            Efectividad Global & Analíticas
          </h2>
          <p className="text-muted mb-0">Vista administrativa avanzada de actividades y métricas de desempeño.</p>
        </div>
        <div className="mt-3 mt-md-0">
          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-4 py-2 rounded-pill d-flex align-items-center shadow-sm">
            <FaShieldAlt className="me-2" /> Admin Access Only
          </span>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
            <AdminReportsTable sessions={processedSessions} />
        </div>
      </div>
    </div>
  );
}