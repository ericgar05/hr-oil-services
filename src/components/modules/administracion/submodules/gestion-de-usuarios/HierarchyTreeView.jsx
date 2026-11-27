import {
  ROLES,
  getUserAllowedModules,
  getRoleTier,
  isSuperAdmin,
} from "../../../../../config/permissions";

const HierarchyTreeView = ({ usuarios, currentUser, onEditUser }) => {
  const userMap = new Map();
  usuarios.forEach((u) => userMap.set(u.id, u));
  if (currentUser && !userMap.has(currentUser.id)) {
    userMap.set(currentUser.id, currentUser);
  }

  const getSupervisorName = (usuario) => {
    if (!usuario.created_by) return isSuperAdmin(usuario) ? "Raíz del Sistema" : "Admin";
    const sup = userMap.get(usuario.created_by);
    return sup ? sup.username : "Superior";
  };

  const tiers = [
    {
      key: "admin",
      title: "Nivel 1 • Super Administrador",
      desc: "Control absoluto del sistema y creación de Directivos",
    },
    {
      key: "directivo",
      title: "Nivel 2 • Directivos",
      desc: "Supervisan áreas estratégicas y crean Coordinadores",
    },
    {
      key: "coordinador",
      title: "Nivel 3 • Coordinadores (Jefes de Dpto.)",
      desc: "Gestionan departamentos y crean personal Administrativo",
    },
    {
      key: "administrativo",
      title: "Nivel 4 • Administrativos / Operadores",
      desc: "Operan en las rutas asignadas por su Coordinador",
    },
  ];

  return (
    <div className="um-subview-wrap">
      <div className="um-subview-header">
        <div>
          <h3>Jerarquía de Equipo y Cadena de Mando</h3>
          <p>
            Estructura organizativa de usuarios visibles y quién delegó sus accesos.
          </p>
        </div>
      </div>

      <div className="um-hierarchy-stack">
        {tiers.map((tierObj) => {
          const members = usuarios.filter(
            (u) => getRoleTier(u.role) === tierObj.key
          );
          if (members.length === 0) return null;

          return (
            <div key={tierObj.key} className="um-tier-section">
              <div className="um-tier-header">
                <div>
                  <h4>{tierObj.title}</h4>
                  <span>{tierObj.desc}</span>
                </div>
                <span className="um-tier-count">{members.length}</span>
              </div>

              <div className="um-tier-cards">
                {members.map((member) => {
                  const allowed = getUserAllowedModules(member);
                  const isSelf = member.id === currentUser?.id;
                  const isActive = member.status !== "Inactivo";

                  return (
                    <div key={member.id} className="um-hierarchy-card">
                      <div className="um-hierarchy-card-top">
                        <div>
                          <span className="um-username">
                            {member.username}
                            {isSelf && <span className="um-self-tag">Tú</span>}
                          </span>
                          <span className="um-supervisor-ref">
                            Supervisado por: <strong>{getSupervisorName(member)}</strong>
                          </span>
                        </div>
                        <span
                          className={`um-status-badge ${
                            isActive ? "active" : "inactive"
                          }`}
                        >
                          <span className="um-status-dot" />
                          {isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <div className="um-hierarchy-card-footer">
                        <span className="um-routes-count">
                          {isSuperAdmin(member)
                            ? "Acceso Total (*)"
                            : `${allowed.length} ruta(s) habilitada(s)`}
                        </span>
                        {!isSelf && (
                          <button
                            type="button"
                            className="um-action-btn edit"
                            onClick={() => onEditUser(member)}
                          >
                            Gestionar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HierarchyTreeView;
