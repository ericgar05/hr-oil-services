// import React from "react";
// import { useAuth } from "../../../contexts/AuthContext";
// import { useProjects } from "../../../contexts/ProjectContext";
// import { useLocation } from "react-router-dom";
// import "./AppHeader.css";

// const AppHeader = () => {
//   const { user: currentUser } = useAuth();
//   const { selectedProject } = useProjects();
//   const location = useLocation();

//   // Obtener el nombre del módulo actual basado en la ruta
//   const getCurrentModuleName = () => {
//     const path = location.pathname.split("/").pop();
//     const moduleNames = {
//       resumen: "Resumen / Dashboard",
//       administracion: "Administración",
//       operaciones: "Operaciones",
//       contrato: "Contrato",
//       coordinaciones: "Coordinaciones",
//     };
//     return moduleNames[path] || "Proyecto";
//   };

//   const hasProject = !!selectedProject;
//   const currentModule = getCurrentModuleName();

//   return (
//     <header
//       className={`app-header ${hasProject ? "has-project" : "no-project"}`}
//     >
//       <div className="header-right">
//         {/* Información del módulo actual - solo visible en móvil */}
//         <div className="current-module">
//           <span className="module-name">{currentModule}</span>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default AppHeader;
