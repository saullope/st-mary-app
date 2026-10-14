'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, Badge, Container, Row, Col } from 'react-bootstrap';
import { FaUserGraduate, FaCalendarAlt, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import ActivityCard from '@/components/dashboard/ActivityCard';
import ActivityCollection from '@/components/dashboard/collection/ActivityCollection';
import PaginationControls from '@/components/dashboard/PaginationControls';
import ActivityFilter from '@/components/dashboard/ActivityFilter';
import styles from '@/styles/pages/my-activities.module.css';
import { useFormatter, useTranslations } from "next-intl";

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

  const t = useTranslations("Profile");
  const tRoles = useTranslations("AdminUsers.roles");
  const format = useFormatter();
  const totalPages = Math.ceil(totalActivities / searchParams.limit);

  return (
    <Container fluid className="py-4" style={{ maxWidth: '1200px' }}>
      {/* Breadcrumb Navigation */}
      <div className="mb-4">
        <Link href="/dashboard" className="text-decoration-none d-inline-flex align-items-center fw-bold" style={{ color: '#E8E5F7', transition: 'opacity 0.2s ease', opacity: 0.8 }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'} onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}>
          <FaArrowLeft className="me-2" /> 
          {t("dashboard")} <span className="mx-2" style={{ opacity: 0.5 }}>/</span> <span style={{ color: '#fff' }}>{t("profile")}</span>
        </Link>
      </div>

      {/* Tarjeta de Perfil Superior */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ background: '#E8E5F7' }}>
        <div style={{ height: '120px', background: 'linear-gradient(135deg, #6a4bff 0%, #2a1a6e 100%)' }} aria-hidden="true"></div>
        <Card.Body className="position-relative px-4 pb-4 pt-0">
          <Row>
            <Col xs={12} md={3} className="text-center text-md-start">
              <div 
                style={{ 
                  marginTop: '-60px',
                  display: 'inline-block',
                  padding: '5px',
                  backgroundColor: '#E8E5F7',
                  borderRadius: '50%',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                <Image
                  src={profilePicture}
                  alt=""
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
                  <h2 className="fw-bold mb-1" style={{ color: '#1D153A' }}>
                    {targetUser.nombre}
                  </h2>
                  <div className="d-flex flex-wrap gap-3 mt-2 text-muted">
                    <span className="d-flex align-items-center">
                      <FaUserGraduate className="me-2 text-primary" aria-hidden="true" />
                      {tRoles.has(targetUser.rol) ? tRoles(targetUser.rol) : targetUser.rol}
                    </span>
                    <span className="d-flex align-items-center">
                      <FaCalendarAlt className="me-2 text-success" aria-hidden="true" />
                      {t("memberSince", { date: format.dateTime(new Date(targetUser.createdAt), { dateStyle: "medium" }) })}
                    </span>
                    {isOwnProfile && (
                      <span className="d-flex align-items-center">
                        <FaEnvelope className="me-2 text-warning" aria-hidden="true" />
                        {targetUser.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 mt-md-0">
                  <Badge className="px-3 py-2 rounded-pill fs-6 shadow-sm" style={{ background: '#6a4bff' }} bg="">
                    {t("activityCount", { count: totalActivities })}
                  </Badge>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Título de Sección */}
      <div className="mb-4">
        <h2 className="h4 fw-bold" style={{ color: '#E8E5F7' }}>
          {isOwnProfile ? t("myActivities") : t("activitiesOf", { name: targetUser.nombre })}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          {isOwnProfile ? t("ownHint") : t("otherHint")}
        </p>
      </div>

      <ActivityCollection
        storageKey="ludi.view.profile"
        filters={<ActivityFilter types={types} />}
        footer={totalPages > 1 ? (
          <PaginationControls
            currentPage={searchParams.page}
            totalCount={totalActivities}
            pageSize={searchParams.limit}
          />
        ) : undefined}
        emptyState={
          <div className={styles.emptyStateCard}>
            <div className={styles.emptyStateIcon} aria-hidden="true">🌱</div>
            <h3>{t("emptyTitle")}</h3>
            <p>
              {isOwnProfile ? t("emptyOwn") : t("emptyOther")}
            </p>
          </div>
        }
      >
        {activities.map((act: any) => (
          <ActivityCard key={act.activityId} activity={act} />
        ))}
      </ActivityCollection>
    </Container>
  );
}