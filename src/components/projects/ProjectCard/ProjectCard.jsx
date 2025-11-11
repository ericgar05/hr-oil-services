import React, { useState } from "react";
import Button from "../../common/Button/Button";
import { DelateIcon } from "../../../assets/icons/Icons";
import { EditIcon } from "../../../assets/icons/Icons";
import { UserIcon } from "../../../assets/icons/Icons";
import { BudgetIcon } from "../../../assets/icons/Icons";
import { CalendarIcon } from "../../../assets/icons/Icons";
import { BullseyeIcon } from "../../../assets/icons/Icons";
import "./ProjectCard.css";

const ProjectCard = ({ project, onEdit, onDelete, onSelect }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(project.id);
    setShowDeleteConfirm(false);
  };

  const formatCurrency = (amount, currency) => {
    const symbols = {
      USD: "$",
      BS: "Bs",
      EUR: "€",
    };

    return `${symbols[currency] || ""} ${amount?.toLocaleString() || "0"}`;
  };

  return (
    <section className="project-card">
      <header className="project-card-header">
        <h3 className="project-name">{project.name}</h3>
        <span className={`project-status project-status-${project.status}`}>
          {project.status === "active" ? "Activo" : "Inactivo"}
        </span>
      </header>

      <div className="project-card-body">
        <div className="project-info">
          <div className="info-item">
            <h3>
              <UserIcon className="icon-item" />
              <strong>
                Cliente: <span>{project.client}</span>
              </strong>
            </h3>

            <h3>
              <BudgetIcon className="icon-item" />
              <strong>Presupuesto:</strong>
              <span>{formatCurrency(project.budget, project.currency)}</span>
            </h3>

            <h3>
              <CalendarIcon className="icon-item" />
              <strong>Fecha Inicio:</strong>
              <span>
                {new Date(
                  project.startDate.replace(/-/g, "/")
                ).toLocaleDateString()}
              </span>
            </h3>
            <h3>
              {" "}
              <BullseyeIcon className="icon-item" />
              <strong>Fecha Fin:</strong>
              <span>
                {new Date(
                  project.endDate.replace(/-/g, "/")
                ).toLocaleDateString()}
              </span>
            </h3>
          </div>
        </div>
      </div>

      <div className="project-card-actions">
        <Button onClick={() => onSelect(project)} className="btn-primary">
          Acceder
        </Button>
        <Button onClick={() => onEdit(project)} className="btn-edit">
          <EditIcon className="icon" />
        </Button>

        <Button
          onClick={() => setShowDeleteConfirm(true)}
          className="btn-danger"
        >
          <DelateIcon className="icon" />
        </Button>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h4>Confirmar Eliminación</h4>
            <p>
              ¿Estás seguro de que deseas eliminar el proyecto "{project.name}"?
              Esta acción no se puede deshacer.
            </p>
            <div className="confirm-actions">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-outline"
              >
                Cancelar
              </Button>
              <Button onClick={handleDelete} className="btn-danger">
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProjectCard;
