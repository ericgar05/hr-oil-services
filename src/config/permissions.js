/**
 * Configuración Centralizada de Roles, Jerarquía y Módulos (RBAC)
 *
 * Jerarquía oficial (4 roles):
 * 1. admin (Programador / Superusuario): Acceso total. Único que crea Directivos.
 * 2. directivo: Creado por Admin. Crea Coordinadores con módulos dentro de su propio alcance.
 * 3. coordinador (Jefe de Departamento): Crea Administrativos con módulos dentro de su propio alcance.
 * 4. administrativo: Solo accede a los módulos otorgados. No crea usuarios.
 */

export const SYSTEM_MODULES = [
  {
    id: "resumen",
    label: "Resumen / Dashboard",
    description: "Panel general y métricas globales del proyecto",
    path: "/resumen",
  },
  {
    id: "solicitudes",
    label: "Solicitudes",
    description: "Bandeja de requerimientos y aprobaciones",
    path: "/solicitudes",
  },
  {
    id: "administracion",
    label: "Administración",
    description: "Gastos administrativos, nómina, compras e ingresos",
    path: "/administracion",
  },
  {
    id: "operaciones",
    label: "Operaciones",
    description: "Planificación, ejecución diaria y control de obra",
    path: "/operaciones",
  },
  {
    id: "contrato",
    label: "Contrato",
    description: "Presupuesto, partidas y valuaciones",
    path: "/contrato",
  },
  {
    id: "coordinaciones",
    label: "Coordinaciones",
    description: "Espacios operativos, actividades y documentos",
    path: "/coordinaciones",
  },
  {
    id: "permissions",
    label: "Gestión de Usuarios",
    description: "Crear usuarios y delegar accesos según jerarquía",
    path: "/permissions",
  },
];

export const ROLES = {
  admin: {
    label: "Admin (Programador)",
    shortLabel: "Admin",
    scope: "*",
    level: 100,
    tier: "admin",
    canCreate: ["directivo", "coordinador", "administrativo"],
  },
  directivo: {
    label: "Directivo",
    shortLabel: "Directivo",
    scope: "custom",
    level: 80,
    tier: "directivo",
    canCreate: ["coordinador"],
  },
  coordinador: {
    label: "Coordinador (Jefe de Dpto.)",
    shortLabel: "Coordinador",
    scope: "custom",
    level: 50,
    tier: "coordinador",
    canCreate: ["administrativo"],
  },
  administrativo: {
    label: "Administrativo",
    shortLabel: "Administrativo",
    scope: "custom",
    level: 10,
    tier: "administrativo",
    canCreate: [],
  },
};

export const MODULES = {
  RESUMEN: "resumen",
  SOLICITUDES: "solicitudes",
  ADMINISTRACION: "administracion",
  OPERACIONES: "operaciones",
  CONTRATO: "contrato",
  COORDINACIONES: "coordinaciones",
  PERMISSIONS: "permissions",
};

/**
 * Determina si el usuario es Super Admin (acceso irrestricto)
 */
export const isSuperAdmin = (user) => {
  return user?.role === "admin";
};

/**
 * Retorna la lista de módulos permitidos de un usuario.
 * Si es admin devuelve todos los módulos del sistema.
 */
export const getUserAllowedModules = (user) => {
  if (!user || !user.role) return [];

  if (isSuperAdmin(user)) {
    return SYSTEM_MODULES.map((m) => m.id);
  }

  let rawModules = user.allowed_modules;
  if (typeof rawModules === "string") {
    try {
      rawModules = JSON.parse(rawModules);
    } catch {
      rawModules = [];
    }
  }

  return Array.isArray(rawModules) ? rawModules : [];
};

/**
 * Retorna los roles que el usuario actual tiene permitido crear
 */
export const getAssignableRoles = (creatorRole) => {
  const roleConfig = ROLES[creatorRole];
  if (!roleConfig || !Array.isArray(roleConfig.canCreate)) return [];

  return roleConfig.canCreate
    .filter((roleKey) => ROLES[roleKey])
    .map((roleKey) => ({
      key: roleKey,
      ...ROLES[roleKey],
    }));
};

/**
 * Retorna los módulos que el usuario creador puede delegar a sus subordinados.
 * Admin puede delegar todos; Directivo y Coordinador solo los que poseen.
 */
export const getDelegableModules = (creatorUser) => {
  if (isSuperAdmin(creatorUser)) {
    return SYSTEM_MODULES;
  }
  const allowed = getUserAllowedModules(creatorUser);
  return SYSTEM_MODULES.filter((m) => allowed.includes(m.id));
};

/**
 * Obtiene el tier visual del rol para badges y estilos
 */
export const getRoleTier = (role) => {
  return ROLES[role]?.tier || "administrativo";
};
