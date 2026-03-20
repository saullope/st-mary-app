const fs = require('fs');
const file = 'src/app/views/activity/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<Link href="/dashboard/my-activities" className={styles.backButton}>
          <FaArrowLeft /> Volver a mis actividades
        </Link>`;

const replacement = `<div className="d-flex justify-content-between align-items-center mb-4">
          <Link href="/dashboard/my-activities" className={\`\${styles.backButton} mb-0\`}>
            <FaArrowLeft /> Volver a mis actividades
          </Link>
          <div className="d-flex gap-2">
            {isOwner && (
              <Link 
                href={editRoute} 
                className="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm"
                style={{ borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold' }}
              >
                <FaEdit /> Editar
              </Link>
            )}
            {isTemplate && user && (
              <UseTemplateButton 
                templateActivityId={activity.activityId} 
                tipoActividadId={activity.tipoActividadId} 
                userId={user.id} 
              />
            )}
          </div>
        </div>`;

if(content.includes(target)) {
  fs.writeFileSync(file, content.replace(target, replacement));
  console.log("Success");
} else {
  console.log("Target not found");
}
