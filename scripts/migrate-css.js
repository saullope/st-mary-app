#!/usr/bin/env node

/**
 * Script para migrar archivos CSS existentes a la nueva estructura
 * 
 * Uso: node scripts/migrate-css.js
 */

const fs = require('fs');
const path = require('path');

// Mapeo de archivos CSS antiguos a nuevos
const cssMigrations = {
  'public/css/true-or-false.module.css': 'src/components/editor/LoadImagesComponent.module.css',
  'public/css/landing.module.css': 'src/styles/pages/Landing.module.css',
  'public/css/create-activity.module.css': 'src/styles/pages/Dashboard.module.css',
  'public/css/editor-activity.module.css': 'src/components/editor/EditorActivity.module.css',
  'public/css/ludiquiz.module.css': 'src/components/editor/LudiQuiz.module.css',
  'public/css/activity-component.module.css': 'src/components/activity/ActivityComponent.module.css',
  'public/css/dashboard.module.css': 'src/styles/pages/Dashboard.module.css',
  'public/css/sidebar.module.css': 'src/components/dashboard/Sidebar.module.css',
  'public/css/navbar.style.css': 'src/components/ui/Navbar.module.css',
  'public/css/bienvenida.module.css': 'src/styles/pages/Welcome.module.css',
  'public/css/new-home.module.css': 'src/styles/pages/Home.module.css',
  'public/css/editor.module.css': 'src/components/editor/Editor.module.css'
};

// Mapeo de imports en componentes
const importMigrations = {
  '../../../public/css/true-or-false.module.css': './LoadImagesComponent.module.css',
  '../../../public/css/landing.module.css': '../../styles/pages/Landing.module.css',
  '../../../public/css/create-activity.module.css': '../../styles/pages/Dashboard.module.css',
  '../../../public/css/editor-activity.module.css': './EditorActivity.module.css',
  '../../../public/css/ludiquiz.module.css': './LudiQuiz.module.css',
  '../../../public/css/activity-component.module.css': './ActivityComponent.module.css',
  '../../../public/css/dashboard.module.css': '../../styles/pages/Dashboard.module.css',
  '../../../public/css/sidebar.module.css': './Sidebar.module.css',
  '../../../public/css/navbar.style.css': '../ui/Navbar.module.css',
  '../../../public/css/bienvenida.module.css': '../../styles/pages/Welcome.module.css',
  '../../../../public/css/new-home.module.css': '../../styles/pages/Home.module.css',
  '../../../../public/css/editor.module.css': './Editor.module.css'
};

function log(message) {
  console.log(`[MIGRATE] ${message}`);
}

function migrateCSSFiles() {
  log('Iniciando migración de archivos CSS...');
  
  Object.entries(cssMigrations).forEach(([oldPath, newPath]) => {
    const fullOldPath = path.join(process.cwd(), oldPath);
    const fullNewPath = path.join(process.cwd(), newPath);
    
    if (fs.existsSync(fullOldPath)) {
      log(`Migrando ${oldPath} -> ${newPath}`);
      
      // Crear directorio de destino si no existe
      const newDir = path.dirname(fullNewPath);
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }
      
      // Leer archivo antiguo
      const content = fs.readFileSync(fullOldPath, 'utf8');
      
      // Aplicar transformaciones básicas
      let newContent = content
        .replace(/\.([a-z-]+)/g, (match, className) => {
          // Convertir kebab-case a camelCase
          return '.' + className.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        })
        .replace(/#([a-z-]+)/g, (match, id) => {
          // Convertir IDs también
          return '#' + id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        });
      
      // Agregar import de variables si no existe
      if (!newContent.includes('@import') && !newContent.includes('variables.css')) {
        newContent = `@import '../../../styles/variables.css';\n\n${newContent}`;
      }
      
      // Escribir archivo nuevo
      fs.writeFileSync(fullNewPath, newContent);
      log(`✓ Migrado exitosamente`);
    } else {
      log(`⚠ Archivo no encontrado: ${oldPath}`);
    }
  });
}

function migrateImports() {
  log('Iniciando migración de imports...');
  
  // Buscar archivos TypeScript/JavaScript
  const srcDir = path.join(process.cwd(), 'src');
  
  function processFile(filePath) {
    if (fs.statSync(filePath).isDirectory()) {
      const files = fs.readdirSync(filePath);
      files.forEach(file => {
        processFile(path.join(filePath, file));
      });
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      Object.entries(importMigrations).forEach(([oldImport, newImport]) => {
        if (content.includes(oldImport)) {
          content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        log(`✓ Actualizado imports en ${path.relative(process.cwd(), filePath)}`);
      }
    }
  }
  
  processFile(srcDir);
}

function generateMigrationReport() {
  log('Generando reporte de migración...');
  
  const report = {
    timestamp: new Date().toISOString(),
    migratedFiles: Object.keys(cssMigrations).length,
    migratedImports: Object.keys(importMigrations).length,
    recommendations: [
      'Revisar manualmente los archivos migrados',
      'Actualizar nombres de clases en componentes',
      'Probar la funcionalidad después de la migración',
      'Eliminar archivos CSS antiguos una vez confirmado que todo funciona',
      'Actualizar documentación si es necesario'
    ]
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), 'migration-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  log('✓ Reporte generado en migration-report.json');
}

// Ejecutar migración
function main() {
  try {
    migrateCSSFiles();
    migrateImports();
    generateMigrationReport();
    log('🎉 Migración completada exitosamente!');
  } catch (error) {
    log(`❌ Error durante la migración: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  migrateCSSFiles,
  migrateImports,
  generateMigrationReport
};
