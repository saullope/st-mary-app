const fs = require('fs');
const file = 'src/app/views/activity/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Modificar orden
code = code.replace(
  '  // Require login ONLY if it is a private non-template activity and the user is not the owner\n  if (!isTemplate && !isPublic && !isOwner) {\n    if (!user) redirect("/auth/login");\n    return (\n      <div className="container p-5 text-center">\n        <h1>Acceso denegado</h1>\n        <p>No tienes permiso para ver esta actividad privada.</p>\n        <Link href="/dashboard/my-activities" className="btn btn-primary mt-3">Volver a mis actividades</Link>\n      </div>\n    );\n  }\n  if (!activity) {\n    return (\n      <div className="container p-5 text-center">\n        <h1>Actividad no encontrada</h1>\n        <Link href="/dashboard/my-activities" className="btn btn-primary mt-3">Volver</Link>\n      </div>\n    );\n  }',
  '  if (!activity) {\n    return (\n      <div className="container p-5 text-center">\n        <h1>Actividad no encontrada</h1>\n        <Link href={user ? "/dashboard/my-activities" : "/"} className="btn btn-primary mt-3">Volver</Link>\n      </div>\n    );\n  }\n\n  // Require login ONLY if it is a private non-template activity and the user is not the owner\n  if (!isTemplate && !isPublic && !isOwner) {\n    if (!user) redirect("/auth/login");\n    return (\n      <div className="container p-5 text-center">\n        <h1>Acceso denegado</h1>\n        <p>No tienes permiso para ver esta actividad privada.</p>\n        <Link href="/dashboard/my-activities" className="btn btn-primary mt-3">Volver a mis actividades</Link>\n      </div>\n    );\n  }'
);

fs.writeFileSync(file, code);
console.log("Patched again!");
