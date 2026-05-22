"use client";

import { useEffect, useState } from "react";
import { FaPlay, FaForward, FaFlagCheckered, FaUsers, FaArrowLeft } from "react-icons/fa6";
import { PostGameFeedbackModal } from "@/components/activity/PostGameFeedbackModal";
import Link from "next/link";

interface Participant {
  id: string;
  nombre: string;
  puntaje_total: number;
  completado: boolean;
  avatar?: {
    nombre: string;
    urlImagen: string;
  };
}

interface SessionState {
  id: string;
  codigo: string;
  estado: string;
  preguntaActualIndex: number;
  participantes: Participant[];
  // isTemplate field check can be based on something we add to the API, but for now we'll guess based on a heuristic or just pass true/false.
  // Actually, the API doesn't return `isTemplate`. We'll fetch it or default to false.
}

export default function LiveDashboardClient({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/live/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    // Poll every 2.5 seconds
    const interval = setInterval(fetchSession, 2500); 
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleAction = async (action: 'start' | 'next' | 'end') => {
    if (action === 'end' && session?.estado !== 'FINALIZADA' && session?.estado !== 'FINALIZADO') {
      setShowFeedbackModal(true);
      return;
    }

    try {
      await fetch(`/api/live/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      fetchSession(); // Refresh state immediately
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
    }
  };

  const handleEndGameConfirmed = async () => {
    try {
      await fetch(`/api/live/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'end' }),
      });
      fetchSession(); // Refresh state immediately
    } catch (error) {
      console.error(`Error performing action end:`, error);
    }
  };

  const handleFeedbackSubmit = async (data: any) => {
    setShowFeedbackModal(false);
    // Enviar feedback al API (utilizamos el que ya existe /api/play/teacher-feedback)
    try {
        await fetch('/api/play/teacher-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sesionId: sessionId,
                rating: data.utilityRating,
                difficultyRating: data.difficultyRating,
                objectiveMet: data.objectiveMet
            })
        });
    } catch (e) {
        console.error(e);
    }
    // Finalmente terminar juego
    handleEndGameConfirmed();
  };

  const handleFeedbackSkip = () => {
    setShowFeedbackModal(false);
    handleEndGameConfirmed();
  };

  if (loading && !session) return <div className="p-5 text-center fs-4">⏳ Cargando panel en vivo...</div>;
  if (!session) return <div className="p-5 text-center text-danger fs-4">❌ Error al cargar la sesión.</div>;

  return (
    <div className="container py-4">
      {/* Breadcrumb Navigation */}
      <div className="mb-4">
        <Link href="/dashboard/my-activities" className="text-decoration-none d-inline-flex align-items-center fw-bold" style={{ color: '#E8E5F7', transition: 'opacity 0.2s ease', opacity: 0.8 }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'} onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}>
          <FaArrowLeft className="me-2" /> 
          Mis Actividades <span className="mx-2" style={{ opacity: 0.5 }}>/</span> <span style={{ color: '#fff' }}>Panel en Vivo</span>
        </Link>
      </div>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-2 border-primary">
        <div>
          <h2 className="mb-0 fw-bold" style={{ color: '#E8E5F7' }}>Panel de Control en Vivo</h2>
          <span className="badge bg-primary fs-6 mt-2 shadow-sm text-uppercase" style={{ background: 'linear-gradient(135deg, #094750, #063138)', border: '1px solid rgba(255,255,255,0.2)' }}>
            ESTADO: {session.estado === 'lobby' ? 'SALA DE ESPERA' : session.estado === 'activa' ? 'EN CURSO' : 'FINALIZADA'}
          </span>
        </div>
        <div className="text-end border border-2 rounded p-3 shadow-sm d-flex flex-column align-items-end" style={{ background: '#E8E5F7', borderColor: '#1D153A' }}>
          <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{ color: '#4a4266' }}>PIN PARA ALUMNOS</small>
          <div className="d-flex align-items-center gap-3">
            <div className="display-4 fw-bold" style={{ letterSpacing: '6px', fontFamily: 'monospace', color: '#1D153A' }}>
              {session.codigo}
            </div>
            <button 
              className="btn d-flex align-items-center justify-content-center shadow-sm"
              style={{
                  width: '45px', height: '45px', borderRadius: '50%',
                  backgroundColor: '#198754', color: 'white', border: 'none',
                  transition: 'all 0.2s ease'
              }}
              title="Copiar PIN"
              onClick={() => {
                navigator.clipboard.writeText(session.codigo);
                const btn = document.getElementById('copyPinBtn');
                if (btn) {
                    btn.innerHTML = '<i class="bi bi-clipboard-check fs-4"></i>';
                    setTimeout(() => { btn.innerHTML = '<i class="bi bi-clipboard fs-4"></i>'; }, 2000);
                }
              }}
              id="copyPinBtn"
            >
              <i className="bi bi-clipboard fs-4"></i>
            </button>
          </div>
        </div>
      </div>

      {/* State 1: LOBBY */}
      {session.estado === "lobby" || session.estado === "ESPERANDO" ? (
        <div className="row">
          <div className="col-12 text-center mb-5">
            <button 
              className="btn btn-lg px-5 py-3 shadow rounded-pill fw-bold fs-4"
              onClick={() => handleAction('start')}
              disabled={session.participantes.length === 0}
              style={{ 
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg, #198754, #146c43)',
                  color: 'white',
                  border: 'none',
                  opacity: session.participantes.length === 0 ? 0.6 : 1
              }}
            >
              <FaPlay className="me-2" /> ¡COMENZAR JUEGO!
            </button>
            {session.participantes.length === 0 && (
              <h5 className="mt-4" style={{ color: 'rgba(255,255,255,0.8)' }}>Esperando a que los estudiantes ingresen el PIN <span className="fw-bold" style={{ color: '#E8E5F7' }}>{session.codigo}</span>...</h5>
            )}
          </div>
          
          <div className="col-12">
            <div className="d-flex align-items-center mb-4 justify-content-center">
              <FaUsers className="me-2" size={32} style={{ color: '#E8E5F7' }} />
              <h3 className="mb-0 fw-bold" style={{ color: '#E8E5F7' }}>Estudiantes Conectados ({session.participantes.length})</h3>
            </div>
            
            <div className="row g-4 justify-content-center">
              {session.participantes.map(p => (
                <div key={p.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                  <div className="card shadow-sm h-100 text-center p-3" style={{ borderRadius: '1.5rem', border: '1px solid rgba(29, 21, 58, 0.05)', background: '#E8E5F7' }}>
                    {p.avatar ? (
                      <div className="mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                         <img src={p.avatar.urlImagen} alt={p.avatar.nombre} className="img-fluid rounded-circle border border-3 border-white shadow-sm" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      </div>
                    ) : (
                      <div className="bg-secondary rounded-circle text-white d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm" style={{ width: '80px', height: '80px', fontSize: '32px' }}>
                        {p.nombre.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h5 className="mb-0 text-truncate fw-bold" style={{ color: '#1D153A' }}>{p.nombre}</h5>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : session.estado === "activa" || session.estado === "EN_CURSO" ? (
        /* State 2: PLAYING */
        <div className="row">
          <div className="col-md-8">
            <div className="card shadow-lg mb-4" style={{ borderRadius: '1.5rem', border: '1px solid rgba(29, 21, 58, 0.05)', background: '#E8E5F7' }}>
              <div className="card-header border-bottom-0 pt-4 pb-0 text-center" style={{ background: 'transparent' }}>
                <h3 className="mb-0 fw-bold" style={{ color: '#1D153A' }}>🏆 Posiciones en Vivo</h3>
              </div>
              <div className="card-body p-4">
                {session.participantes.length === 0 ? (
                  <p className="text-center fs-5" style={{ color: '#4a4266' }}>No hay participantes conectados.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {session.participantes.map((p, index) => (
                      <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 rounded mb-2 shadow-sm" style={{ background: index === 0 ? '#fbbf24' : index === 1 ? '#e2e8f0' : index === 2 ? '#fca5a5' : '#ffffff' }}>
                        <div className="d-flex align-items-center">
                          <span className={`badge ${index === 0 ? 'bg-white text-dark' : index === 1 ? 'bg-secondary' : index === 2 ? 'bg-danger' : 'bg-light text-muted'} rounded-circle p-2 me-3 shadow-sm fs-5`} style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {index + 1}
                          </span>
                          {p.avatar && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={p.avatar.urlImagen} alt="avatar" className="rounded-circle me-3 shadow-sm" width="50" height="50" style={{ objectFit: 'cover', border: '2px solid white' }} />
                          )}
                          <div>
                            <span className="fw-bold d-block fs-5" style={{ color: '#1D153A' }}>{p.nombre}</span>
                            {p.completado && <span className="badge mt-1 shadow-sm" style={{ background: '#198754' }}><FaFlagCheckered className="me-1"/>¡Terminó!</span>}
                          </div>
                        </div>
                        <span className="fs-4 fw-bold" style={{ color: '#1D153A' }}>{p.puntaje_total} pts</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-lg mb-4" style={{ borderRadius: '1.5rem', border: '1px solid rgba(29, 21, 58, 0.05)', background: '#E8E5F7' }}>
              <div className="card-body p-4 text-center">
                <h4 className="mb-4 fw-bold" style={{ color: '#1D153A' }}>Panel de Control</h4>
                {/* Avanzar pregunta oculto hasta que implementemos el modo DOCENTE completo */}
                {/* <button className="btn btn-warning btn-lg w-100 mb-3 fw-bold shadow-sm rounded-pill" onClick={() => handleAction('next')}>
                  <FaForward className="me-2" /> Avanzar Pregunta
                </button> */}
                <button className="btn btn-danger btn-lg w-100 fw-bold shadow-sm rounded-pill" onClick={() => handleAction('end')}>
                  <FaFlagCheckered className="me-2" /> Terminar Juego Ahora
                </button>
              </div>
            </div>
            
            <div className="card shadow-sm border-0" style={{ borderRadius: '1.5rem', background: '#E8E5F7' }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold text-uppercase" style={{ color: '#4a4266' }}>Progreso de la Clase</span>
                  <span className="fw-bold fs-5" style={{ color: '#1D153A' }}>{session.participantes.filter(p => p.completado).length} / {session.participantes.length}</span>
                </div>
                <div className="progress shadow-sm" style={{ height: '15px', borderRadius: '10px', backgroundColor: 'rgba(29, 21, 58, 0.1)' }}>
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated" 
                    role="progressbar" 
                    style={{ width: `${session.participantes.length ? (session.participantes.filter(p => p.completado).length / session.participantes.length) * 100 : 0}%`, backgroundColor: '#198754' }}
                  ></div>
                </div>
                <p className="text-center small mt-3 mb-0" style={{ color: '#4a4266' }}>Alumnos que han finalizado todas las preguntas.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* State 3: FINISHED */
        <div className="text-center py-5">
          <FaFlagCheckered className="mb-3" size={80} style={{ color: '#198754', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
          <h1 className="mb-5 fw-bold" style={{ color: '#E8E5F7', fontSize: '3.5rem' }}>¡Juego Finalizado!</h1>
          
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8">
              <div className="card shadow-lg border-0" style={{ borderRadius: '1.5rem', overflow: 'hidden', background: '#E8E5F7' }}>
                <div className="card-header border-0 py-4 text-white" style={{ background: 'linear-gradient(135deg, #1D153A 0%, #251B4F 100%)' }}>
                    <h3 className="mb-0 fw-bold">🏆 Podio de Campeones 🏆</h3>
                </div>
                <div className="card-body p-5">
                  <div className="row justify-content-center align-items-end mb-5 px-3" style={{ minHeight: '250px' }}>
                    
                    {/* 2nd Place */}
                    <div className="col-4 text-center px-2 position-relative" style={{ zIndex: 2 }}>
                        {session.participantes[1] ? (
                            <>
                                <div className="mb-3">
                                    {session.participantes[1].avatar && (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={session.participantes[1].avatar.urlImagen} alt="avatar" className="rounded-circle shadow-lg mb-2" width="70" height="70" style={{ border: '3px solid #e2e8f0', objectFit: 'cover' }} />
                                    )}
                                    <h5 className="text-truncate fw-bold mb-0" style={{ color: '#1D153A' }}>{session.participantes[1].nombre}</h5>
                                    <div className="badge bg-secondary rounded-pill my-1 fs-6">2º LUGAR</div>
                                    <div className="fw-bold fs-5" style={{ color: '#4a4266' }}>{session.participantes[1].puntaje_total} pts</div>
                                </div>
                                <div className="border rounded-top shadow-sm" style={{ height: '100px', background: 'linear-gradient(to top, #cbd5e1, #f8fafc)', borderBottom: 'none' }}>
                                    <span className="d-block mt-3 fs-3 fw-bold" style={{ color: '#64748b' }}>2</span>
                                </div>
                            </>
                        ) : <div style={{ height: '100px' }}></div>}
                    </div>
                    
                    {/* 1st Place */}
                    <div className="col-4 text-center px-2 position-relative" style={{ zIndex: 3 }}>
                        {session.participantes[0] ? (
                            <>
                                <div className="mb-3">
                                    <span className="fs-1 d-block mb-2">👑</span>
                                    {session.participantes[0].avatar && (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={session.participantes[0].avatar.urlImagen} alt="avatar" className="rounded-circle shadow-lg mb-2" width="90" height="90" style={{ border: '4px solid #fbbf24', objectFit: 'cover' }} />
                                    )}
                                    <h4 className="text-truncate fw-bold mb-0" style={{ color: '#1D153A' }}>{session.participantes[0].nombre}</h4>
                                    <div className="badge bg-warning text-dark rounded-pill my-1 fs-5 shadow-sm">1º LUGAR</div>
                                    <div className="fw-bold fs-4" style={{ color: '#198754' }}>{session.participantes[0].puntaje_total} pts</div>
                                </div>
                                <div className="border rounded-top shadow" style={{ height: '150px', background: 'linear-gradient(to top, #fbbf24, #fef3c7)', borderBottom: 'none' }}>
                                    <span className="d-block mt-4 fs-1 fw-bold text-dark">1</span>
                                </div>
                            </>
                        ) : <div style={{ height: '150px' }}></div>}
                    </div>
                    
                    {/* 3rd Place */}
                    <div className="col-4 text-center px-2 position-relative" style={{ zIndex: 1 }}>
                        {session.participantes[2] ? (
                            <>
                                <div className="mb-3">
                                    {session.participantes[2].avatar && (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={session.participantes[2].avatar.urlImagen} alt="avatar" className="rounded-circle shadow-lg mb-2" width="60" height="60" style={{ border: '3px solid #fca5a5', objectFit: 'cover' }} />
                                    )}
                                    <h6 className="text-truncate fw-bold mb-0" style={{ color: '#1D153A' }}>{session.participantes[2].nombre}</h6>
                                    <div className="badge rounded-pill my-1" style={{ backgroundColor: '#cd7f32' }}>3º LUGAR</div>
                                    <div className="fw-bold fs-6" style={{ color: '#4a4266' }}>{session.participantes[2].puntaje_total} pts</div>
                                </div>
                                <div className="border rounded-top shadow-sm" style={{ height: '70px', background: 'linear-gradient(to top, #fed7aa, #fff7ed)', borderBottom: 'none' }}>
                                    <span className="d-block mt-2 fs-4 fw-bold" style={{ color: '#c2410c' }}>3</span>
                                </div>
                            </>
                        ) : <div style={{ height: '70px' }}></div>}
                    </div>
                  </div>
                  
                  <hr className="my-5" style={{ borderColor: 'rgba(29, 21, 58, 0.1)' }} />
                  
                  <div className="text-start">
                    <h4 className="mb-4 fw-bold" style={{ color: '#1D153A' }}>Resultados del Salón</h4>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle" style={{ backgroundColor: 'transparent' }}>
                            <thead style={{ borderBottom: '2px solid rgba(29, 21, 58, 0.1)' }}>
                                <tr>
                                    <th scope="col" style={{ color: '#4a4266', background: 'transparent', borderBottom: 'none' }}>Posición</th>
                                    <th scope="col" style={{ color: '#4a4266', background: 'transparent', borderBottom: 'none' }}>Estudiante</th>
                                    <th scope="col" className="text-end" style={{ color: '#4a4266', background: 'transparent', borderBottom: 'none' }}>Puntaje Final</th>
                                </tr>
                            </thead>
                            <tbody>
                                {session.participantes.map((p, i) => (
                                    <tr key={p.id} className={i < 3 ? 'fw-bold' : ''} style={{ borderBottom: '1px solid rgba(29, 21, 58, 0.05)' }}>
                                        <td style={{ width: '80px', background: 'transparent' }}>
                                            <span className={`badge ${i === 0 ? 'bg-warning text-dark' : i === 1 ? 'bg-secondary' : i === 2 ? 'bg-danger' : 'text-muted'} rounded-pill`} style={{ fontSize: '0.9rem', width: '30px', background: i > 2 ? 'rgba(29, 21, 58, 0.1)' : undefined }}>
                                                {i + 1}
                                            </span>
                                        </td>
                                        <td style={{ background: 'transparent', color: '#1D153A' }}>
                                            {p.avatar && (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={p.avatar.urlImagen} alt="avatar" className="rounded-circle me-2 shadow-sm" width="30" height="30" style={{ objectFit: 'cover' }} />
                                            )}
                                            {p.nombre}
                                        </td>
                                        <td className="text-end" style={{ background: 'transparent', color: '#1D153A', fontWeight: 'bold' }}>{p.puntaje_total} pts</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFeedbackModal && (
        <PostGameFeedbackModal 
          isOpen={showFeedbackModal} 
          onClose={handleFeedbackSkip} 
          onSubmit={handleFeedbackSubmit} 
          isTemplate={false} 
        />
      )}
    </div>
  );
}
