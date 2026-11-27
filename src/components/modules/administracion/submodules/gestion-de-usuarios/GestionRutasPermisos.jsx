import { useEffect, useState, useMemo } from "react";
import bcrypt from "bcryptjs";
import supabase from "../../../../../api/supaBase";
import { useAuth } from "../../../../../contexts/AuthContext";
import {
  ROLES,
  SYSTEM_MODULES,
  isSuperAdmin,
  getAssignableRoles,
  getUserAllowedModules,
  getRoleTier,
} from "../../../../../config/permissions";
import { EditIcon, DelateIcon } from "../../../../../assets/icons/Icons";
import ModuleDescription from "../../../_core/ModuleDescription/ModuleDescription";
import FeedbackModal from "../../../../common/FeedbackModal/FeedbackModal";
import UserFormView from "./UserFormView";
import AccessMatrixView from "./AccessMatrixView";
import HierarchyTreeView from "./HierarchyTreeView";
import ChangePasswordModal from "./ChangePasswordModal";
import "./GestionRutasPermisos.css";

const MODULE_LABELS = SYSTEM_MODULES.reduce((acc, mod) => {
  acc[mod.id] = mod.label.split(" / ")[0];
  return acc;
}, {});

const AVATAR_COLORS = [
  "#1e40af",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#4f46e5",
  "#db2777",
];

const getAvatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name = "") => {
  if (!name) return "?";
  const clean = name.includes("@") ? name.split("@")[0] : name;
  return clean
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

// Iconos SVG Outline para Barra de Navegación y KPIs (Estilo Valuaciones)
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IconUserPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

const IconGrid = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const IconGitBranch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="3" x2="6" y2="15"></line>
    <circle cx="18" cy="6" r="3"></circle>
    <circle cx="6" cy="18" r="3"></circle>
    <path d="M18 9a9 9 0 0 1-9 9"></path>
  </svg>
);

const IconShieldCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <polyline points="9 12 11 14 15 10"></polyline>
  </svg>
);

const IconBriefcase = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const IconUserCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <polyline points="17 11 19 13 23 9"></polyline>
  </svg>
);

const IconEditTab = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const IconWarning = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export default function GestionRutasPermisos() {
  const { userData: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");

  // Pestañas: "list" | "create" | "matrix" | "hierarchy" | "edit"
  const [activeTab, setActiveTab] = useState("list");
  const [editingUser, setEditingUser] = useState(null);

  // Modales puntuales
  const [passwordUser, setPasswordUser] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [confirmMatrixChange, setConfirmMatrixChange] = useState(null);
  const [feedback, setFeedback] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const adminMode = isSuperAdmin(currentUser);
  const assignableRoles = getAssignableRoles(currentUser?.role);
  const canCreateUsers = assignableRoles.length > 0;

  const showFeedback = (type, title, message) => {
    setFeedback({ isOpen: true, type, title, message });
  };

  const fetchUsuarios = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);

    try {
      const { data: allUsers, error: usersErr } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersErr) throw usersErr;

      if (adminMode) {
        setUsuarios(allUsers || []);
        return;
      }

      const { data: assignments, error: assignErr } = await supabase
        .from("user_assignments")
        .select("supervisor_id, employee_id");

      if (assignErr) throw assignErr;

      const directIds = new Set();
      (allUsers || []).forEach((u) => {
        if (u.created_by === currentUser.id) directIds.add(u.id);
      });
      (assignments || []).forEach((a) => {
        if (a.supervisor_id === currentUser.id) directIds.add(a.employee_id);
      });

      const level2Ids = new Set(directIds);
      (allUsers || []).forEach((u) => {
        if (directIds.has(u.created_by)) level2Ids.add(u.id);
      });
      (assignments || []).forEach((a) => {
        if (directIds.has(a.supervisor_id)) level2Ids.add(a.employee_id);
      });

      const visible = (allUsers || []).filter(
        (u) => level2Ids.has(u.id) && u.id !== currentUser.id && !isSuperAdmin(u)
      );
      setUsuarios(visible);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [currentUser]);

  const handleStartCreate = () => {
    setEditingUser(null);
    setActiveTab("create");
  };

  const handleStartEdit = (usuario) => {
    setEditingUser(usuario);
    setActiveTab("edit");
  };

  const handleBackToList = () => {
    setEditingUser(null);
    setActiveTab("list");
  };

  const handleSaveUser = async (payload) => {
    if (payload.id) {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          username: payload.username,
          role: payload.role,
          allowed_modules: payload.allowed_modules,
        })
        .eq("id", payload.id);

      if (updateError) {
        throw new Error(updateError.message || "Error al actualizar usuario.");
      }

      showFeedback(
        "success",
        "Usuario Actualizado",
        `Los datos y rutas de "${payload.username}" han sido actualizados.`
      );
      await fetchUsuarios();
      handleBackToList();
    } else {
      const passwordHashed = await bcrypt.hash(payload.password, 12);
      const insertData = {
        username: payload.username,
        password: passwordHashed,
        role: payload.role,
        allowed_modules: payload.allowed_modules,
        created_by: currentUser?.id || null,
        status: "Activo",
      };

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error(`El nombre de usuario "${payload.username}" ya existe.`);
        }
        throw new Error(insertError.message || "Error al crear usuario.");
      }

      if (currentUser?.id && newUser?.id) {
        await supabase.from("user_assignments").insert({
          supervisor_id: currentUser.id,
          employee_id: newUser.id,
        });
      }

      showFeedback(
        "success",
        "Usuario Creado",
        `El usuario "${payload.username}" fue creado con acceso a ${payload.allowed_modules.length} ruta(s).`
      );
      await fetchUsuarios();
      handleBackToList();
    }
  };

  const handleToggleModuleMatrix = (usuario, moduleId, shouldGrant) => {
    setConfirmMatrixChange({
      usuario,
      moduleId,
      moduleLabel: MODULE_LABELS[moduleId] || moduleId,
      shouldGrant,
    });
  };

  const executeMatrixChange = async () => {
    if (!confirmMatrixChange) return;
    const { usuario, moduleId, shouldGrant } = confirmMatrixChange;
    setConfirmMatrixChange(null);

    const currentAllowed = getUserAllowedModules(usuario);
    const updatedModules = shouldGrant
      ? Array.from(new Set([...currentAllowed, moduleId]))
      : currentAllowed.filter((id) => id !== moduleId);

    const prevUsers = [...usuarios];
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === usuario.id ? { ...u, allowed_modules: updatedModules } : u
      )
    );

    const { error: updateErr } = await supabase
      .from("users")
      .update({ allowed_modules: updatedModules })
      .eq("id", usuario.id);

    if (updateErr) {
      setUsuarios(prevUsers);
      showFeedback("error", "Error", "No se pudo actualizar el permiso en la matriz.");
    }
  };

  const handleUpdatePassword = async (userId, newPassword) => {
    const passwordHashed = await bcrypt.hash(newPassword, 12);
    const { error: pwError } = await supabase
      .from("users")
      .update({ password: passwordHashed })
      .eq("id", userId);

    if (pwError) {
      throw new Error(pwError.message || "No se pudo actualizar la contraseña.");
    }

    showFeedback(
      "success",
      "Contraseña Actualizada",
      "La nueva contraseña ha sido guardada correctamente."
    );
  };

  const handleToggleStatus = async (usuario) => {
    const nextStatus = usuario.status === "Inactivo" ? "Activo" : "Inactivo";
    const { error: statusError } = await supabase
      .from("users")
      .update({ status: nextStatus })
      .eq("id", usuario.id);

    if (statusError) {
      showFeedback("error", "Error", "No se pudo cambiar el estado del usuario.");
      return;
    }

    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuario.id ? { ...u, status: nextStatus } : u))
    );
  };

  const executeDeleteUser = async () => {
    if (!confirmDeleteUser) return;
    const usuario = confirmDeleteUser;
    setConfirmDeleteUser(null);

    try {
      await supabase
        .from("user_assignments")
        .delete()
        .or(`employee_id.eq.${usuario.id},supervisor_id.eq.${usuario.id}`);

      const { error: delError } = await supabase
        .from("users")
        .delete()
        .eq("id", usuario.id);

      if (delError) throw delError;

      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
      showFeedback(
        "success",
        "Usuario Eliminado",
        `El usuario "${usuario.username}" ha sido eliminado.`
      );
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      showFeedback("error", "Error", "No se pudo eliminar el usuario.");
    }
  };

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      const matchesSearch = u.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const tier = getRoleTier(u.role);
      const matchesTier = tierFilter === "all" || tier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [usuarios, searchTerm, tierFilter]);

  const stats = useMemo(() => {
    const total = usuarios.length;
    const active = usuarios.filter((u) => u.status !== "Inactivo").length;
    const jefaturas = usuarios.filter((u) => {
      const t = getRoleTier(u.role);
      return t === "directivo" || t === "coordinador";
    }).length;
    const administrativos = usuarios.filter(
      (u) => getRoleTier(u.role) === "administrativo"
    ).length;
    return { total, active, jefaturas, administrativos };
  }, [usuarios]);

  const currentRoleConfig = ROLES[currentUser?.role];
  const myAllowedCount = getUserAllowedModules(currentUser).length;

  return (
    <div className="usuarios-main">
      <ModuleDescription
        title="Gestión de Usuarios y Accesos"
        description="Administración jerárquica de cuentas, roles y delegación de rutas del sistema"
      />

      {/* Tarjeta de Identidad del Operador (Estilo Valuaciones) */}
      <div className="user-identity-card">
        <div className="identity-content">
          <div className="identity-header-tags">
            <span className="tag-badge primary">CONTROL DE ACCESOS</span>
            <span className="tag-badge role">
              Nivel: <strong>{currentRoleConfig?.shortLabel || currentUser?.role}</strong>
            </span>
            <span className="tag-badge status status-success">Activo</span>
          </div>
          <h3 className="identity-number">{currentUser?.username}</h3>
          <p className="identity-name">
            {adminMode
              ? "Super Administrador • Control total sobre todas las rutas y creación de Directivos"
              : `Delegación activa • Tienes alcance sobre ${myAllowedCount} ruta(s) del sistema`}
          </p>
        </div>

        <div className="identity-users-pill">
          <span className="users-pill-label">Usuarios en tu Gestión</span>
          <span className="users-pill-value">{stats.total}</span>
        </div>
      </div>

      {/* Barra de Navegación (Desktop Pills / Mobile Fixed Bottom Bar) */}
      <div className="usuarios-tabs-bar">
        <button
          type="button"
          className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
          onClick={handleBackToList}
        >
          <div className="tab-icon-wrap">
            <IconUsers />
            {stats.total > 0 && (
              <span className="tab-count-badge">{stats.total}</span>
            )}
          </div>
          <span className="tab-label">
            <span className="tab-label-desktop">Directorio de Usuarios</span>
            <span className="tab-label-mobile">Usuarios</span>
          </span>
        </button>

        {canCreateUsers && (
          <button
            type="button"
            className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
            onClick={handleStartCreate}
          >
            <div className="tab-icon-wrap">
              <IconUserPlus />
            </div>
            <span className="tab-label">
              <span className="tab-label-desktop">Nuevo Usuario</span>
              <span className="tab-label-mobile">Nuevo</span>
            </span>
          </button>
        )}

        <button
          type="button"
          className={`tab-btn ${activeTab === "matrix" ? "active" : ""}`}
          onClick={() => setActiveTab("matrix")}
        >
          <div className="tab-icon-wrap">
            <IconGrid />
          </div>
          <span className="tab-label">
            <span className="tab-label-desktop">Matriz de Accesos</span>
            <span className="tab-label-mobile">Accesos</span>
          </span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === "hierarchy" ? "active" : ""}`}
          onClick={() => setActiveTab("hierarchy")}
        >
          <div className="tab-icon-wrap">
            <IconGitBranch />
          </div>
          <span className="tab-label">
            <span className="tab-label-desktop">Jerarquía de Equipo</span>
            <span className="tab-label-mobile">Equipo</span>
          </span>
        </button>

        {editingUser && activeTab === "edit" && (
          <button
            type="button"
            className="tab-btn active"
            onClick={() => setActiveTab("edit")}
          >
            <div className="tab-icon-wrap">
              <IconEditTab />
            </div>
            <span className="tab-label">
              <span className="tab-label-desktop">Editar Usuario</span>
              <span className="tab-label-mobile">Editar</span>
            </span>
          </button>
        )}
      </div>

      {/* Contenedor Principal de Pestañas */}
      <div className="usuarios-tab-content">
        {activeTab === "list" && (
          <div className="usuarios-list-wrap">
            {/* Indicadores KPI estilo Valuaciones */}
            <div className="resumen-general">
              <div className="resumen-cards">
                <div className="resumen-card">
                  <div className="resumen-icon primary">
                    <IconUsers />
                  </div>
                  <div className="resumen-content">
                    <div className="resumen-value">{stats.total}</div>
                    <div className="resumen-label">Total Gestionados</div>
                  </div>
                </div>

                <div className="resumen-card">
                  <div className="resumen-icon success">
                    <IconShieldCheck />
                  </div>
                  <div className="resumen-content">
                    <div className="resumen-value">{stats.active}</div>
                    <div className="resumen-label">Cuentas Activas</div>
                  </div>
                </div>

                <div className="resumen-card">
                  <div className="resumen-icon info">
                    <IconBriefcase />
                  </div>
                  <div className="resumen-content">
                    <div className="resumen-value">{stats.jefaturas}</div>
                    <div className="resumen-label">Directivos / Coord.</div>
                  </div>
                </div>

                <div className="resumen-card">
                  <div className="resumen-icon slate">
                    <IconUserCheck />
                  </div>
                  <div className="resumen-content">
                    <div className="resumen-value">{stats.administrativos}</div>
                    <div className="resumen-label">Administrativos</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buscador y Filtros */}
            <div className="um-toolbar-inline">
              <div className="um-search-box">
                <input
                  type="text"
                  placeholder="Buscar usuario por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="um-search-input"
                />
              </div>

              <div className="um-filter-pills">
                <button
                  className={`um-pill-btn ${tierFilter === "all" ? "active" : ""}`}
                  onClick={() => setTierFilter("all")}
                >
                  Todos
                </button>
                {adminMode && (
                  <button
                    className={`um-pill-btn ${tierFilter === "directivo" ? "active" : ""}`}
                    onClick={() => setTierFilter("directivo")}
                  >
                    Directivos
                  </button>
                )}
                <button
                  className={`um-pill-btn ${tierFilter === "coordinador" ? "active" : ""}`}
                  onClick={() => setTierFilter("coordinador")}
                >
                  Coordinadores
                </button>
                <button
                  className={`um-pill-btn ${tierFilter === "administrativo" ? "active" : ""}`}
                  onClick={() => setTierFilter("administrativo")}
                >
                  Administrativos
                </button>
              </div>
            </div>

            {/* Listado */}
            {loading ? (
              <div className="um-empty-inline">Cargando usuarios...</div>
            ) : error ? (
              <div className="um-empty-inline um-error-text">{error}</div>
            ) : filteredUsuarios.length === 0 ? (
              <div className="um-empty-inline">
                <p>No se encontraron usuarios con los filtros actuales.</p>
                {canCreateUsers && usuarios.length === 0 && (
                  <button className="um-btn-primary" onClick={handleStartCreate}>
                    + Crear primer usuario
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Tabla Desktop */}
                <div className="um-table-wrap um-desktop-only">
                  <table className="um-table">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Rol / Jerarquía</th>
                        <th>Módulos / Rutas Permitidas</th>
                        <th>Estado</th>
                        <th>Última Conexión</th>
                        <th style={{ textAlign: "right" }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsuarios.map((usuario) => {
                        const tier = getRoleTier(usuario.role);
                        const allowed = getUserAllowedModules(usuario);
                        const isSelf = usuario.id === currentUser?.id;
                        const isActive = usuario.status !== "Inactivo";

                        return (
                          <tr key={usuario.id}>
                            <td>
                              <div className="um-user-cell">
                                <div
                                  className="um-avatar"
                                  style={{ backgroundColor: getAvatarColor(usuario.username) }}
                                >
                                  {getInitials(usuario.username)}
                                </div>
                                <div className="um-user-meta">
                                  <span className="um-username">
                                    {usuario.username}
                                    {isSelf && <span className="um-self-tag">Tú</span>}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`um-role-badge tier-${tier}`}>
                                {ROLES[usuario.role]?.shortLabel || usuario.role}
                              </span>
                            </td>
                            <td>
                              <div className="um-modules-pills">
                                {isSuperAdmin(usuario) ? (
                                  <span className="um-module-pill all">Acceso Total (*)</span>
                                ) : allowed.length === 0 ? (
                                  <span className="um-module-pill none">Sin rutas asignadas</span>
                                ) : (
                                  allowed.map((modId) => (
                                    <span key={modId} className="um-module-pill">
                                      {MODULE_LABELS[modId] || modId}
                                    </span>
                                  ))
                                )}
                              </div>
                            </td>
                            <td>
                              <span className={`um-status-badge ${isActive ? "active" : "inactive"}`}>
                                <span className="um-status-dot" />
                                {isActive ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td className="um-date-cell">
                              {usuario.last_login
                                ? new Date(usuario.last_login).toLocaleDateString("es-VE", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Nunca"}
                            </td>
                            <td>
                              {!isSelf ? (
                                <div className="um-actions-row">
                                  <button
                                    className="um-action-btn edit"
                                    onClick={() => handleStartEdit(usuario)}
                                    title="Editar Rol y Módulos"
                                  >
                                    <EditIcon width={15} height={15} />
                                    <span>Editar</span>
                                  </button>
                                  <button
                                    className="um-action-btn key"
                                    onClick={() => setPasswordUser(usuario)}
                                    title="Cambiar Contraseña"
                                  >
                                    Clave
                                  </button>
                                  <button
                                    className={`um-action-btn ${isActive ? "deactivate" : "activate"}`}
                                    onClick={() => handleToggleStatus(usuario)}
                                  >
                                    {isActive ? "Pausar" : "Activar"}
                                  </button>
                                  <button
                                    className="um-action-btn delete"
                                    onClick={() => setConfirmDeleteUser(usuario)}
                                    title="Eliminar Usuario"
                                  >
                                    <DelateIcon width={15} height={15} />
                                  </button>
                                </div>
                              ) : (
                                <span className="um-self-note">Sesión actual</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Tarjetas Móvil */}
                <div className="um-mobile-list um-mobile-only">
                  {filteredUsuarios.map((usuario) => {
                    const tier = getRoleTier(usuario.role);
                    const allowed = getUserAllowedModules(usuario);
                    const isSelf = usuario.id === currentUser?.id;
                    const isActive = usuario.status !== "Inactivo";

                    return (
                      <article key={usuario.id} className="um-mobile-card">
                        <div className="um-mobile-card-top">
                          <div className="um-user-cell">
                            <div
                              className="um-avatar"
                              style={{ backgroundColor: getAvatarColor(usuario.username) }}
                            >
                              {getInitials(usuario.username)}
                            </div>
                            <div className="um-user-meta">
                              <span className="um-username">
                                {usuario.username}
                                {isSelf && <span className="um-self-tag">Tú</span>}
                              </span>
                              <span className={`um-role-badge tier-${tier}`}>
                                {ROLES[usuario.role]?.shortLabel || usuario.role}
                              </span>
                            </div>
                          </div>

                          <span className={`um-status-badge ${isActive ? "active" : "inactive"}`}>
                            <span className="um-status-dot" />
                            {isActive ? "Activo" : "Inactivo"}
                          </span>
                        </div>

                        <div className="um-mobile-section">
                          <span className="um-mobile-label">Módulos / Rutas Permitidas:</span>
                          <div className="um-modules-pills">
                            {isSuperAdmin(usuario) ? (
                              <span className="um-module-pill all">Acceso Total (*)</span>
                            ) : allowed.length === 0 ? (
                              <span className="um-module-pill none">Sin rutas asignadas</span>
                            ) : (
                              allowed.map((modId) => (
                                <span key={modId} className="um-module-pill">
                                  {MODULE_LABELS[modId] || modId}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="um-mobile-meta">
                          Última conexión:{" "}
                          {usuario.last_login
                            ? new Date(usuario.last_login).toLocaleString("es-VE")
                            : "Nunca"}
                        </div>

                        {!isSelf && (
                          <div className="um-mobile-actions">
                            <button
                              className="um-action-btn edit"
                              onClick={() => handleStartEdit(usuario)}
                            >
                              Editar
                            </button>
                            <button
                              className="um-action-btn key"
                              onClick={() => setPasswordUser(usuario)}
                            >
                              Clave
                            </button>
                            <button
                              className={`um-action-btn ${isActive ? "deactivate" : "activate"}`}
                              onClick={() => handleToggleStatus(usuario)}
                            >
                              {isActive ? "Pausar" : "Activar"}
                            </button>
                            <button
                              className="um-action-btn delete"
                              onClick={() => setConfirmDeleteUser(usuario)}
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "create" && (
          <UserFormView
            onSave={handleSaveUser}
            onCancel={handleBackToList}
            currentUser={currentUser}
            editingUser={null}
          />
        )}

        {activeTab === "edit" && editingUser && (
          <UserFormView
            onSave={handleSaveUser}
            onCancel={handleBackToList}
            currentUser={currentUser}
            editingUser={editingUser}
          />
        )}

        {activeTab === "matrix" && (
          <AccessMatrixView
            usuarios={usuarios}
            currentUser={currentUser}
            onToggleModule={handleToggleModuleMatrix}
          />
        )}

        {activeTab === "hierarchy" && (
          <HierarchyTreeView
            usuarios={usuarios}
            currentUser={currentUser}
            onEditUser={handleStartEdit}
          />
        )}
      </div>

      {/* Modal Cambiar Contraseña */}
      <ChangePasswordModal
        isOpen={Boolean(passwordUser)}
        onClose={() => setPasswordUser(null)}
        user={passwordUser}
        onConfirm={handleUpdatePassword}
      />

      {/* Modal Corporativo de Confirmación de Eliminación (Estilo Valuaciones) */}
      {confirmDeleteUser && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-card">
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon-badge danger">
                <IconWarning />
              </div>
              <div>
                <h4 className="confirm-modal-title">Eliminar Usuario</h4>
                <p className="confirm-modal-desc">
                  Esta acción eliminará permanentemente la cuenta y sus asignaciones de jerarquía.
                </p>
              </div>
            </div>

            <div className="confirm-modal-item-preview">
              <div className="item-preview-code">{confirmDeleteUser.username}</div>
              <div className="item-preview-desc">
                Rol: {ROLES[confirmDeleteUser.role]?.label || confirmDeleteUser.role}
              </div>
            </div>

            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setConfirmDeleteUser(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-modal-danger"
                onClick={executeDeleteUser}
              >
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Corporativo de Confirmación de Cambio de Acceso en Matriz */}
      {confirmMatrixChange && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-card">
            <div className="confirm-modal-header">
              <div
                className={`confirm-modal-icon-badge ${
                  confirmMatrixChange.shouldGrant ? "primary" : "danger"
                }`}
              >
                {confirmMatrixChange.shouldGrant ? (
                  <IconShieldCheck />
                ) : (
                  <IconWarning />
                )}
              </div>
              <div>
                <h4 className="confirm-modal-title">
                  {confirmMatrixChange.shouldGrant
                    ? "Otorgar Acceso a Ruta"
                    : "Quitar Acceso a Ruta"}
                </h4>
                <p className="confirm-modal-desc">
                  {confirmMatrixChange.shouldGrant
                    ? `¿Confirmas que deseas habilitar el acceso al módulo "${confirmMatrixChange.moduleLabel}" para este usuario?`
                    : `¿Confirmas que deseas revocar el acceso al módulo "${confirmMatrixChange.moduleLabel}" para este usuario?`}
                </p>
              </div>
            </div>

            <div className="confirm-modal-item-preview">
              <div className="item-preview-code">
                {confirmMatrixChange.usuario.username}
              </div>
              <div className="item-preview-desc">
                Rol:{" "}
                {ROLES[confirmMatrixChange.usuario.role]?.label ||
                  confirmMatrixChange.usuario.role}
              </div>
              <div
                className={`item-preview-action ${
                  confirmMatrixChange.shouldGrant ? "grant" : "revoke"
                }`}
              >
                {confirmMatrixChange.shouldGrant
                  ? `+ Agregar ruta: ${confirmMatrixChange.moduleLabel}`
                  : `− Quitar ruta: ${confirmMatrixChange.moduleLabel}`}
              </div>
            </div>

            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setConfirmMatrixChange(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={
                  confirmMatrixChange.shouldGrant
                    ? "btn-modal-primary"
                    : "btn-modal-danger"
                }
                onClick={executeMatrixChange}
              >
                {confirmMatrixChange.shouldGrant
                  ? "Sí, Otorgar Acceso"
                  : "Sí, Quitar Acceso"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Feedback */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        onClose={() => setFeedback((prev) => ({ ...prev, isOpen: false }))}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
      />
    </div>
  );
}
