"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface CreatorCardProps {
  name: string;
  email: string | null;
  pictureUrl?: string;
  role?: string;
  isAdmin?: boolean;
}

export default function CreatorCard({ name, email, pictureUrl, role = "Educador", isAdmin = false }: CreatorCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fallback image if pictureUrl is missing
  const avatarSrc = pictureUrl || "/images/profile.png";

  const handleMouseEnter = () => {
    if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
        
        setPosition({
            // Position above the trigger (rect.top)
            // We'll use 'bottom' styling in the portal div to position it relative to this top point
            top: rect.top + scrollTop, 
            left: rect.left + scrollLeft + (rect.width / 2) // Center horizontally
        });
        setIsHovered(true);
    }
  };

  return (
    <>
        <div
        ref={triggerRef}
        className="position-relative d-inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        >
        {/* Trigger: What is shown in the table */}
        <div className="d-flex align-items-center" style={{ cursor: "pointer" }}>
            <div className="position-relative me-2" style={{ width: "32px", height: "32px" }}>
                <Image
                    src={avatarSrc}
                    alt={name}
                    fill
                    className="rounded-circle border border-1 border-secondary"
                    style={{ objectFit: "cover" }}
                />
            </div>
            <div>
            <span className="d-block lh-1 fw-medium text-dark">{name}</span>
            <small className="text-muted" style={{ fontSize: "0.75rem" }}>{role}</small>
            </div>
        </div>
        </div>

        {/* Hover Card (Portal) */}
        {mounted && isHovered && createPortal(
            <div
            className="card shadow-lg border-0"
            style={{
                position: "absolute",
                // Calculate position: Top is the trigger's top. We translate -100% Y to move it up.
                top: position.top - 10, 
                left: position.left,
                transform: "translateX(-15%) translateY(-100%)", // Shift up and center
                width: "280px",
                zIndex: 9999, // High z-index to overlay everything
                animation: "fadeIn 0.2s ease-in-out",
                borderRadius: "12px",
                background: "white",
                pointerEvents: "none" // Prevent flickering when moving mouse over the card itself vs trigger
            }}
            >
            {/* Decorative Header Background */}
            <div 
                style={{ 
                    height: "60px", 
                    background: "linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)",
                    borderRadius: "12px 12px 0 0"
                }} 
            />
            
            <div className="card-body text-center pt-0 position-relative">
                {/* Profile Picture (Floating up) */}
                <div 
                    className="position-absolute start-50 translate-middle-x" 
                    style={{ top: "-30px" }}
                >
                    <div className="p-1 bg-white rounded-circle shadow-sm">
                        <Image
                            src={avatarSrc}
                            alt={name}
                            width={64}
                            height={64}
                            className="rounded-circle"
                            style={{ objectFit: "cover" }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: "40px" }}>
                    <h5 className="card-title mb-0 fw-bold text-primary">{name}</h5>
                    <p className="text-muted small mb-2">{role}</p>
                    
                <div className="d-flex align-items-center justify-content-center gap-2 text-secondary bg-light p-2 rounded">
                    <span style={{ fontSize: "0.85rem" }}>📧 {email || "No email"}</span>
                </div>

                {/* Botón Ver Perfil (Solo Admin) */}
                <div className="mt-3">
                  <button 
                    className={`btn btn-sm w-100 rounded-pill ${isAdmin ? 'btn-outline-primary' : 'btn-secondary'}`}
                    disabled={!isAdmin}
                    style={{ 
                      fontSize: '0.8rem', 
                      opacity: isAdmin ? 1 : 0.6,
                      cursor: isAdmin ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Ver Perfil
                  </button>
                </div>
            </div>
          </div>

            
            {/* Triangle Pointer */}
            <div 
                className="position-absolute"
                style={{
                    bottom: "-8px",
                    left: "15%", // Match the translateX(-15%) alignment roughly
                    marginLeft: "-8px",
                    width: "0",
                    height: "0",
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "8px solid white",
                    filter: "drop-shadow(0 2px 1px rgba(0,0,0,0.05))"
                }}
            />
            
            <style jsx>{`
                @keyframes fadeIn {
                from { opacity: 0; transform: translateX(-15%) translateY(-90%); }
                to { opacity: 1; transform: translateX(-15%) translateY(-100%); }
                }
            `}</style>
            </div>,
            document.body
        )}
    </>
  );
}
