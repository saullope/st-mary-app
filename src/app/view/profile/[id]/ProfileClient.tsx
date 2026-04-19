'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, Badge, Container, Row, Col } from 'react-bootstrap';
import { FaUserGraduate, FaCalendarAlt, FaEnvelope } from 'react-icons/fa';
import ActivityCard from '@/components/dashboard/ActivityCard';
import PaginationControls from '@/components/dashboard/PaginationControls';
import ActivityFilter from '@/components/dashboard/ActivityFilter';
import styles from '@/styles/pages/my-activities.module.css';

interface ProfileClientProps {
  targetUser: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    createdAt: string;
  };
  profilePicture: string;
  isOwnProfile: boolean;
  activities: any[];
  totalActivities: number;
  types: any[];
  searchParams: {
    typeId?: number;
    searchQuery?: string;
    page: number;
    limit: number;
  };
  isAdmin: boolean;
}

export default function ProfileClient({
  targetUser,
  profilePicture,
  isOwnProfile,
  activities,
  totalActivities,
  types,
  searchParams,
  isAdmin
}: ProfileClientProps) {

  const totalPages = Math.ceil(totalActivities / searchParams.limit);

  const getGradeLabel = (gradeName?: string) => {
    if (!gradeName) return "N/A";
    const lower = gradeName.toLowerCase();
    if (lower.includes("first") || lower.includes("1")) return "Primero";
    if (lower.includes("second") || lower.includes("2")) return "Segundo";
    if (lower.includes("third") || lower.includes("3")) return "Tercero";
    return gradeName;
  };

  const getTypeBadgeClass = (id: number) => {
    switch (id) {
      case 1: return styles.quizBadge;
      case 2: return styles.trueFalseBadge;
      case 3: return styles.memoryBadge;
      default: return styles.quizBadge;
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Tarjeta de Perfil Superior */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div style={{ height: '120px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></div>
        <Card.Body className="position-relative px-4 pb-4 pt-0">
          <Row>
            <Col xs={12} md={3} className="text-center text-md-start">
              <div 
                style={{ 
                  marginTop: '-60px',
                  display: 'inline-block',
                  padding: '5px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                <Image
                  src={profilePicture}
                  alt={targetUser.nombre}
                  width={120}
                  height={120}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                  priority
                  unoptimized
                />
              </div>
            </Col>
            <Col xs={12} md={9} className="pt-3 pt-md-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start">
                <div>
                  <h2 className="fw-bold mb-1" style={{ color: '#2c3e50', fontFamily: 'Comic Sans MS, cursive' }}>
                    {targetUser.nombre}
                  </h2>
                  <div className="d-flex flex-wrap gap-3 mt-2 text-muted">
                    <span className="d-flex align-items-center">
                      <FaUserGraduate className="me-2 text-primary" />
                      {targetUser.rol}
                    </span>
                    <span className="d-flex align-items-center">
                      <FaCalendarAlt className="me-2 text-success" />
                      Miembro desde {new Date(targetUser.createdAt).toLocaleDateString()}
                    </span>
                    {isOwnProfile && (
                      <span className="d-flex align-items-center">
                        <FaEnvelope className="me-2 text-warning" />
                        {targetUser.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 mt-md-0">
                  <Badge bg="primary" className="px-3 py-2 rounded-pill fs-6 shadow-sm">
                    {totalActivities} Actividades
                  </Badge>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Título de Sección */}
      <div className="mb-4">
        <h4 className="fw-bold" style={{ color: '#34495e' }}>
          {isOwnProfile ? 'Mis Actividades' : `Actividades de ${targetUser.nombre}`}
        </h4>
        <p className="text-muted">
          {isOwnProfile 
            ? 'Explora, edita y comparte las experiencias de aprendizaje que has creado.'
            : 'Explora las actividades públicas creadas por este educador.'}
        </p>
      </div>

      {/* Filtros */}
      <div className={styles.filterCard}>
        <ActivityFilter types={types} />
      </div>

      {/* Grid de Actividades */}
      {activities.length > 0 ? (
        <div className={styles.activitiesGrid}>
          {activities.map((act: any) => (
            <ActivityCard 
              key={act.activityId}
              activity={act}
              gradeLabel={getGradeLabel(act.grado?.grade_type_name)}
              typeBadgeClass={getTypeBadgeClass(act.tipoActividadId)}
              sessionPicture={profilePicture}
              isAdmin={isAdmin || isOwnProfile} 
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyStateIcon}>🌱</div>
          <h3>Aún no hay actividades aquí</h3>
          <p>
            {isOwnProfile 
              ? 'Crea tu primera actividad desde el dashboard para empezar a llenar este espacio.'
              : 'Este usuario aún no ha publicado actividades en la plataforma.'}
          </p>
        </div>
      )}
      
      {/* Paginación */}
      {activities.length > 0 && totalPages > 1 && (
        <div className={styles.paginationCard}>
          <PaginationControls 
            currentPage={searchParams.page} 
            totalCount={totalActivities}
            pageSize={searchParams.limit}
          />
        </div>
      )}
    </Container>
  );
}