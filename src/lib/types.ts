// User roles in the system
export type UserRole = "cliente" | "veterinario" | "admin";

// User entity
export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: UserRole;
  emailVerificado: boolean;
  fechaCreacion: Date;
}

// Pet entity
export interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  fechaNacimiento: Date;
  imagen?: Blob;
  clienteId: string;
  fechaCreacion: Date;
}

// Pre-appointment states
export type EstadoPreCita = "pendiente" | "rechazada";

// Pre-appointment entity (public form submissions)
export interface PreCita {
  id: string;
  nombreCliente: string;
  telefono: string;
  email: string;
  fechaSolicitada: Date;
  estado: EstadoPreCita;
  motivoConsulta?: string;
  fechaCreacion: Date;
}

// Appointment states
export type EstadoCita =
  | "pendiente_pago"
  | "en_validacion"
  | "aceptada"
  | "atendida"
  | "cancelada"
  | "expirada"
  | "rechazada"
  | "no_asistio";

// Appointment entity
export interface Cita {
  id: string;
  mascotaId: string;
  veterinarioId: string;
  clienteId: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoCita;
  motivoConsulta: string;
  comprobantePago?: Blob;
  observaciones?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// Medical history entry
export interface HistorialClinico {
  id: string;
  citaId: string;
  diagnostico: string;
  tratamiento: string;
  observaciones?: string;
  fechaCreacion: Date;
  veterinarioId: string;
}

// Dashboard stats for admin
export interface EstadisticasDashboard {
  totalCitas: number;
  citasPendientes: number;
  citasHoy: number;
  clientesActivos: number;
  mascotasRegistradas: number;
  veterinariosActivos: number;
}

// Notification types
export type TipoNotificacion =
  | "cita_creada"
  | "cita_aceptada"
  | "cita_rechazada"
  | "cita_expirada"
  | "pago_validado"
  | "recordatorio_cita";

export interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: Date;
}

// Form data types
export interface PreCitaFormData {
  nombreMascota: string;
  tipoMascota: string;
  nombreDueno: string;
  telefono: string;
  email: string;
  motivoConsulta: string;
  fechaPreferida: string;
  horaPreferida: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegistroClienteFormData {
  nombre: string;
  email: string;
  telefono: string;
  password: string;
  confirmPassword: string;
}

export interface RegistroMascotaFormData {
  nombre: string;
  especie: string;
  raza: string;
  fechaNacimiento: string;
  imagen?: File;
}

// Newsletter subscription types
export interface SuscriptorNewsletter {
  id: string;
  email: string;
  fechaSuscripcion: Date;
  activo: boolean;
}

interface ArchivoGuardado {
  name: string;
  data: string; // base64
  size: number;
  type: string;
}

export interface NewsletterEmail {
  id: string;
  asunto: string;
  contenido: string;
  fechaEnvio: Date;
  destinatarios: string[];
  estado: "enviado" | "programado" | "borrador";
  colorTema?: string;
  plantilla?: string;
  imagenes?: ArchivoGuardado[];
  archivos?: ArchivoGuardado[];
}
