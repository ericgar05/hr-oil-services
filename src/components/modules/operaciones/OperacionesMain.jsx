import React from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../../contexts/ProjectContext";
import ModuleDescription from "../_core/ModuleDescription/ModuleDescription";
import "./OperacionesMain.css";
import {
  CalendarIcon,
  CartShoppingIcon,
  ClipBoardIcon,
  ConstructionIcon,
  InventoryIcon,
} from "../../../assets/icons/Icons";

const OperacionesMain = ({ projectId }) => {
  const navigate = useNavigate();
  const { selectedProject } = useProjects();

  const mainCards = [
    {
      id: "planificacion",
      title: "PLANIFICACIÓN",
      description: "Planificación diaria y semanal del contrato",
      icon: <CalendarIcon />,
      path: "planificacion",
    },
    {
      id: "ejecucion",
      title: "EJECUCIÓN",
      description: "Seguimiento de actividades ejecutadas",
      icon: <ConstructionIcon />,
      path: "ejecucion",
    },
    {
      id: "requerimientos",
      title: "REQUERIMIENTOS",
      description: "Gestión de materiales y suministros",
      icon: <ClipBoardIcon />,
      path: "requerimientos",
    },
    {
      id: "compras",
      title: "COMPRAS",
      description: "Control de adquisiciones y compras operativas",
      icon: <CartShoppingIcon />,
      path: "compras",
    },
    {
      id: "inventario",
      title: "INVENTARIO",
      description: "Registro de equipos, materiales y suministros",
      icon: <InventoryIcon />,
      path: "inventario",
    },
  ];

  const handleCardClick = (path) => {
    console.log("Navegando desde proyecto:", projectId, "a:", path);
    navigate(path);
  };

  return (
    <div className="operaciones-main">
      <ModuleDescription
        title="Módulo de Operaciones"
        description={`Gestión y control integral de las operaciones del proyecto ${
          selectedProject?.name || ""
        }`}
      />

      <div className="operaciones-main-grid">
        {mainCards.map((card) => (
          <div
            key={card.id}
            className="operaciones-main-card"
            onClick={() => handleCardClick(card.path)}
          >
            <div className="operaciones-card-icon">{card.icon}</div>
            <div className="operaciones-card-content">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <small>Proyecto: {selectedProject?.name || ""}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OperacionesMain;
