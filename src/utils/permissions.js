 // utils/permissions.js
import { USER_ROLES } from './constants';

// ✅ PERMISOS POR MÓDULO PARA CADA ROL
export const MODULE_PERMISSIONS = {
  resumen: [USER_ROLES.ADMIN, USER_ROLES.ADMINISTRATIVO, USER_ROLES.OPERATIVO, USER_ROLES.VISOR],
  administracion: [USER_ROLES.ADMIN, USER_ROLES.ADMINISTRATIVO, USER_ROLES.OPERATIVO], // operativo solo submodulos
  operaciones: [USER_ROLES.ADMIN, USER_ROLES.OPERATIVO],
  contrato: [USER_ROLES.ADMIN, USER_ROLES.ADMINISTRATIVO, USER_ROLES.VISOR],
  coordinaciones: [USER_ROLES.ADMIN, USER_ROLES.ADMINISTRATIVO, USER_ROLES.OPERATIVO]
};

// ✅ PERMISOS DE ESCRITURA/LECTURA
export const WRITE_PERMISSIONS = {
  // Quiénes pueden editar/crear/eliminar
  admin: true,           // Admin: escritura total
  administrativo: true,  // Administrativo: escritura en su módulo
  operativo: true,      // Operativo: escritura en su módulo
  visor: false          // Visor: SOLO LECTURA
};

// ✅ FUNCIÓN PARA VERIFICAR ACCESO A MÓDULO
export const canAccessModule = (userRole, module) => {
  return MODULE_PERMISSIONS[module]?.includes(userRole) || false;
};

// ✅ FUNCIÓN PARA VERIFICAR PERMISOS DE ESCRITURA
export const canWrite = (userRole) => {
  return WRITE_PERMISSIONS[userRole] || false;
};
