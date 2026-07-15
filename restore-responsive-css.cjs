const fs = require('fs');

const missingCss = `
/* =====================================================================
   ESTILOS ADAPTACIÓN NATIVA (DESKTOP / MOBILE ONLY)
   ===================================================================== */

/* Clases de visibilidad responsiva */
.mobile-only {
  display: none !important;
}
.desktop-only {
  display: block !important;
}

@media (max-width: 820px) {
  .mobile-only {
    display: block !important;
  }
  .desktop-only {
    display: none !important;
  }
  
  /* Mantener grid de 2 columnas de widgets en móviles estilo iOS */
  .admin-stats-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px !important;
  }
  
  .stat-card {
    padding: 14px !important;
  }
  
  .stat-card strong {
    font-size: 1.4rem !important;
    margin-top: 8px !important;
  }
}

/* Lista de tarjetas móviles en paneles */
.mobile-list-container {
  margin-top: 15px;
}

.mobile-list-card {
  display: block;
  background: #ffffff !important;
  border: 1px solid var(--border) !important;
  border-radius: 16px !important;
  padding: 16px !important;
  margin-bottom: 12px !important;
  text-decoration: none !important;
  color: inherit !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03) !important;
}

.mobile-list-card:hover {
  background: #fbfbfd !important;
  border-color: var(--blue) !important;
  transform: translateY(-1px) !important;
}

.mobile-list-card-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 6px !important;
}

.mobile-list-card-header strong {
  color: var(--navy) !important;
  font-size: 0.95rem !important;
}

.mobile-list-card-body p {
  margin: 3px 0 !important;
  font-size: 0.85rem !important;
}

.mobile-list-card-body .device-info {
  color: var(--text) !important;
  font-weight: 600 !important;
}

.mobile-list-card-body .customer-info {
  color: var(--muted) !important;
}
`;

let currentCss = fs.readFileSync('app/globals.css', 'utf8');

if (!currentCss.includes('.desktop-only')) {
    const insertIndex = currentCss.indexOf('.app-container {');
    if (insertIndex !== -1) {
        const newCss = currentCss.substring(0, insertIndex) + missingCss + "\n\n" + currentCss.substring(insertIndex);
        fs.writeFileSync('app/globals.css', newCss, 'utf8');
        console.log("Missing responsive CSS restored successfully!");
    } else {
        console.log("Could not find .app-container in current CSS");
    }
} else {
    console.log("Responsive CSS already exists!");
}
