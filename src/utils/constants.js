 // utils/constants.js
export const APP_CONFIG = {
  name: "Gestión de Proyectos – H&R Oil Services C.A.",
  version: "1.0.0"
};

// ✅ LOS 4 ROLES DE USUARIO
export const USER_ROLES = {
  ADMIN: 'admin',              // Acceso total a todo
  ADMINISTRATIVO: 'administrativo', // Solo módulo administrativo + lectura
  OPERATIVO: 'operativo',      // Módulo operativo + submodulos administrativos
  VISOR: 'visor'               // Solo lectura de resúmenes y tablas
};

// ✅ USUARIOS DE PRUEBA PARA DESARROLLO
export const DEMO_USERS = {
  admin: {
    id: 1,
    email: 'admin@hroil.com',
    password: 'admin123',
    name: 'Administrador Principal',
    role: USER_ROLES.ADMIN
  },
  administrativo: {
    id: 2,
    email: 'adminstrativo@hroil.com',
    password: 'admin123',
    name: 'Carlos Rodríguez',
    role: USER_ROLES.ADMINISTRATIVO
  },
  operativo: {
    id: 3,
    email: 'operativo@hroil.com', 
    password: 'admin123',
    name: 'María González',
    role: USER_ROLES.OPERATIVO
  },
  visor: {
    id: 4,
    email: 'visor@hroil.com',
    password: 'admin123', 
    name: 'Ana López',
    role: USER_ROLES.VISOR
  }
};
