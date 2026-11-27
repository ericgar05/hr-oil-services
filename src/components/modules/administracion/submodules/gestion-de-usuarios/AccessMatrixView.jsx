import {
  ROLES,
  getDelegableModules,
  getUserAllowedModules,
  getRoleTier,
  isSuperAdmin,
} from "../../../../../config/permissions";

const AccessMatrixView = ({ usuarios, currentUser, onToggleModule }) => {
  const delegableModules = getDelegableModules(currentUser);

  return (
    <div className="um-subview-wrap">
      <div className="um-subview-header">
        <div>
          <h3>Matriz de Accesos por Ruta</h3>
          <p>
            Visualiza y activa/desactiva en un clic las rutas permitidas para cada usuario de tu equipo.
          </p>
        </div>
      </div>

      {usuarios.length === 0 ? (
        <div className="um-empty-inline">
          No hay usuarios disponibles para mostrar en la matriz.
        </div>
      ) : (
        <>
          {/* Desktop Matrix Table */}
          <div className="um-matrix-scroll um-desktop-only">
            <table className="um-matrix-table">
              <thead>
                <tr>
                  <th className="um-matrix-sticky-col">Usuario</th>
                  {delegableModules.map((mod) => (
                    <th key={mod.id} className="um-matrix-mod-th">
                      {mod.label.split(" / ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => {
                  const allowed = getUserAllowedModules(usuario);
                  const isSelf = usuario.id === currentUser?.id;
                  const targetIsAdmin = isSuperAdmin(usuario);
                  const tier = getRoleTier(usuario.role);

                  return (
                    <tr key={usuario.id}>
                      <td className="um-matrix-sticky-col">
                        <div className="um-matrix-user">
                          <span className="um-username">{usuario.username}</span>
                          <span className={`um-role-badge tier-${tier}`}>
                            {ROLES[usuario.role]?.shortLabel || usuario.role}
                          </span>
                        </div>
                      </td>
                      {delegableModules.map((mod) => {
                        const hasAccess = targetIsAdmin || allowed.includes(mod.id);
                        const locked =
                          isSelf ||
                          targetIsAdmin ||
                          (usuario.role === "administrativo" &&
                            mod.id === "permissions");

                        return (
                          <td key={mod.id} className="um-matrix-cell">
                            <button
                              type="button"
                              disabled={locked}
                              className={`um-matrix-toggle ${
                                hasAccess ? "granted" : "denied"
                              } ${locked ? "locked" : ""}`}
                              onClick={() =>
                                !locked &&
                                onToggleModule(usuario, mod.id, !hasAccess)
                              }
                              title={
                                locked
                                  ? "No modificable"
                                  : hasAccess
                                  ? `Quitar acceso a ${mod.label}`
                                  : `Dar acceso a ${mod.label}`
                              }
                            >
                              {hasAccess ? "✓" : "—"}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Matrix Cards */}
          <div className="um-mobile-only um-mobile-matrix-list">
            {usuarios.map((usuario) => {
              const allowed = getUserAllowedModules(usuario);
              const isSelf = usuario.id === currentUser?.id;
              const targetIsAdmin = isSuperAdmin(usuario);
              const tier = getRoleTier(usuario.role);

              return (
                <div key={usuario.id} className="um-mobile-card">
                  <div className="um-mobile-card-top">
                    <div className="um-user-meta">
                      <span className="um-username">{usuario.username}</span>
                      <span className={`um-role-badge tier-${tier}`}>
                        {ROLES[usuario.role]?.shortLabel || usuario.role}
                      </span>
                    </div>
                  </div>
                  <div className="um-mobile-matrix-chips">
                    {delegableModules.map((mod) => {
                      const hasAccess = targetIsAdmin || allowed.includes(mod.id);
                      const locked =
                        isSelf ||
                        targetIsAdmin ||
                        (usuario.role === "administrativo" &&
                          mod.id === "permissions");

                      return (
                        <button
                          key={mod.id}
                          type="button"
                          disabled={locked}
                          className={`um-matrix-chip ${
                            hasAccess ? "granted" : "denied"
                          } ${locked ? "locked" : ""}`}
                          onClick={() =>
                            !locked &&
                            onToggleModule(usuario, mod.id, !hasAccess)
                          }
                        >
                          <span>{hasAccess ? "✓" : "+"}</span>
                          {mod.label.split(" / ")[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AccessMatrixView;
