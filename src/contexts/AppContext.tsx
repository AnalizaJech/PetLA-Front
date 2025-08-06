import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { compressImage, optimizeStorageSpace } from "@/lib/imageUtils";
import type { CompressedImage } from "@/lib/imageUtils";

// Types
interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  sexo?: string;
  fechaNacimiento: Date;
  peso?: string;
  microchip?: string;
  estado: string;
  clienteId: string;
  proximaCita?: Date | null;
  ultimaVacuna?: Date | null;
  foto?: string | null;
}

interface ComprobanteData {
  id: string;
  data: string; // base64
  originalName: string;
  size: number;
  type: string;
  timestamp: number;
}

interface Cita {
  id: string;
  mascota: string;
  mascotaId?: string; // ID de la mascota
  especie: string;
  clienteId?: string; // ID del cliente propietario
  clienteNombre?: string; // Nombre del cliente para referencia rápida
  fecha: Date;
  estado: string;
  veterinario: string;
  motivo: string;
  tipoConsulta: string;
  ubicacion: string;
  precio: number;
  notas?: string;
  comprobantePago?: string;
  comprobanteData?: ComprobanteData;
  notasAdmin?: string;
}

interface PreCita {
  id: string;
  nombreCliente: string;
  telefono: string;
  email: string;
  nombreMascota: string;
  tipoMascota: string;
  motivoConsulta: string;
  fechaPreferida: Date;
  horaPreferida: string;
  estado: "pendiente" | "aceptada" | "rechazada";
  fechaCreacion: Date;
  notasAdmin?: string;
  veterinarioAsignado?: string;
  fechaNueva?: Date;
  horaNueva?: string;
}

interface Usuario {
  id: string;
  nombre: string;
  apellidos?: string;
  username?: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: Date;
  genero?: string;
  rol: "admin" | "cliente" | "veterinario";
  password?: string;
  fechaRegistro?: Date;
  foto?: string | null;
  // Campos de documento
  documento?: string;
  tipoDocumento?: "dni" | "pasaporte" | "carnet_extranjeria" | "cedula";
  // Campos específicos para veterinarios
  especialidad?: string;
  experiencia?: string;
  colegiatura?: string;
}

interface HistorialClinico {
  id: string;
  mascotaId: string;
  mascotaNombre: string;
  fecha: Date;
  veterinario: string;
  tipoConsulta:
    | "consulta_general"
    | "vacunacion"
    | "emergencia"
    | "grooming"
    | "cirugia"
    | "diagnostico";
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  servicios?: Array<{
    nombre: string;
    descripcion?: string;
    precio?: number;
    duracion?: string;
    notas?: string;
  }>;
  medicamentos: Array<{
    nombre: string;
    dosis: string;
    frecuencia: string;
    duracion: string;
    indicaciones?: string;
  }>;
  examenes?: Array<{
    tipo: string;
    resultado: string;
    archivo?: string;
  }>;
  vacunas?: Array<{
    nombre: string;
    lote: string;
    proximaFecha: Date;
  }>;
  peso?: string;
  temperatura?: string;
  presionArterial?: string;
  frecuenciaCardiaca?: string;
  observaciones: string;
  proximaVisita?: Date;
  estado: "completada" | "pendiente_seguimiento" | "requiere_atencion";
  archivosAdjuntos?: Array<{
    nombre: string;
    tipo: string;
    url: string;
  }>;
}

interface SuscriptorNewsletter {
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

interface NewsletterEmail {
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

interface Notificacion {
  id: string;
  usuarioId: string;
  tipo:
    | "cita_aceptada"
    | "bienvenida_cliente"
    | "consulta_registrada"
    | "sistema";
  titulo: string;
  mensaje: string;
  fechaCreacion: Date;
  leida: boolean;
  datos?: {
    citaId?: string;
    mascotaNombre?: string;
    veterinario?: string;
    fechaCita?: Date;
    motivo?: string;
  };
}

interface AppContextType {
  // User state
  user: Usuario | null;
  setUser: (user: Usuario | null) => void;
  logout: () => void;
  isAuthenticated: boolean;

  // Receipt/Voucher management
  saveComprobante: (citaId: string, file: File) => Promise<boolean>;
  getComprobante: (citaId: string) => ComprobanteData | null;
  deleteComprobante: (citaId: string) => void;

  // User management (admin only)
  usuarios: Usuario[];
  addUsuario: (usuario: Omit<Usuario, "id" | "fechaRegistro">) => void;
  updateUsuario: (id: string, updates: Partial<Usuario>) => void;
  deleteUsuario: (id: string) => void;

  // Mascotas state
  mascotas: Mascota[];
  addMascota: (
    mascota: Omit<
      Mascota,
      "id" | "estado" | "clienteId" | "proximaCita" | "ultimaVacuna" | "foto"
    >,
  ) => void;
  updateMascota: (id: string, updates: Partial<Mascota>) => void;
  deleteMascota: (id: string) => void;
  fixOrphanedPets: () => void;
  repairDataIntegrity: () => {
    repairedPets: number;
    createdPets: number;
    errors: string[];
  };

  // Citas state
  citas: Cita[];
  addCita: (cita: Omit<Cita, "id">) => void;
  updateCita: (id: string, updates: Partial<Cita>) => void;
  deleteCita: (id: string) => void;

  // Pre-citas state
  preCitas: PreCita[];
  addPreCita: (
    preCita: Omit<PreCita, "id" | "estado" | "fechaCreacion">,
  ) => void;
  updatePreCita: (id: string, updates: Partial<PreCita>) => void;
  deletePreCita: (id: string) => void;

  // Historial Clinico state
  historialClinico: HistorialClinico[];
  addHistorialEntry: (entry: Omit<HistorialClinico, "id">) => void;
  updateHistorialEntry: (
    id: string,
    updates: Partial<HistorialClinico>,
  ) => void;
  deleteHistorialEntry: (id: string) => void;
  getHistorialByMascota: (mascotaId: string) => HistorialClinico[];

  // Newsletter state
  suscriptoresNewsletter: SuscriptorNewsletter[];
  addSuscriptorNewsletter: (email: string) => Promise<boolean>;
  updateSuscriptorNewsletter: (
    id: string,
    updates: Partial<SuscriptorNewsletter>,
  ) => void;
  deleteSuscriptorNewsletter: (id: string) => void;

  newsletterEmails: NewsletterEmail[];
  addNewsletterEmail: (email: Omit<NewsletterEmail, "id">) => void;
  updateNewsletterEmail: (
    id: string,
    updates: Partial<NewsletterEmail>,
  ) => void;
  deleteNewsletterEmail: (id: string) => void;

  // Notificaciones state
  notificaciones: Notificacion[];
  addNotificacion: (
    notificacion: Omit<Notificacion, "id" | "fechaCreacion">,
  ) => void;
  markNotificacionAsRead: (id: string) => void;
  markAllNotificacionesAsRead: (usuarioId: string) => void;
  getNotificacionesByUser: (usuarioId: string) => Notificacion[];
  deleteNotificacion: (id: string) => void;

  // Authentication helpers
  login: (email: string, password: string) => Promise<Usuario | null>;
  register: (
    userData: Omit<Usuario, "id" | "fechaRegistro"> & { password: string },
  ) => Promise<Usuario | null>;
  deleteAccount: (userId: string) => Promise<boolean>;

  // Data relationship helpers
  getMascotaWithOwner: (mascotaId: string) => {
    mascota: Mascota | null;
    propietario: Usuario | null;
  };
  getCitaWithRelations: (citaId: string) => {
    cita: Cita | null;
    mascota: Mascota | null;
    propietario: Usuario | null;
  };
  validateDataRelationships: () => {
    orphanedPets: Mascota[];
    incompleteCitas: Cita[];
    ghostPets: string[];
    totalIssues: number;
  };

  // Statistics
  getStats: () => {
    totalMascotas: number;
    citasPendientes: number;
    ultimaVisita: string;
    estadoGeneral: string;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Essential users only - admin and veterinarians for system functionality
const initialUsuarios: Usuario[] = [
  {
    id: "admin-1",
    nombre: "Administrador PetLA",
    email: "admin@petla.com",
    rol: "admin",
    telefono: "+52 55 1234 5678",
    password: "admin123",
    fechaRegistro: new Date("2023-01-01"),
  },
  {
    id: "vet-1",
    nombre: "Dr. Carlos Ruiz",
    email: "carlos.ruiz@petla.com",
    rol: "veterinario",
    telefono: "+52 55 1234 5679",
    password: "vet123",
    fechaRegistro: new Date("2023-02-15"),
  },
  {
    id: "vet-2",
    nombre: "Dra. Ana López",
    email: "ana.lopez@petla.com",
    rol: "veterinario",
    telefono: "+52 55 1234 5680",
    password: "vet456",
    fechaRegistro: new Date("2023-03-10"),
  },
  {
    id: "vet-3",
    nombre: "Dra. María Fernández",
    email: "maria.fernandez@petla.com",
    rol: "veterinario",
    telefono: "+52 55 1234 5681",
    password: "vet789",
    fechaRegistro: new Date("2023-04-20"),
  },
  {
    id: "vet-4",
    nombre: "Dr. Roberto Silva",
    email: "roberto.silva@petla.com",
    rol: "veterinario",
    telefono: "+52 55 1234 5682",
    password: "vet321",
    fechaRegistro: new Date("2023-05-15"),
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  // Clear any existing fictional data on first load - DISABLED to prevent data loss
  useEffect(() => {
    // This code was automatically clearing user data, so it's now disabled
    // const shouldClearData = localStorage.getItem("fictional_data_cleared");
    // if (!shouldClearData) {
    //   localStorage.removeItem("mascotas");
    //   localStorage.removeItem("citas");
    //   localStorage.removeItem("preCitas");
    //   localStorage.removeItem("historialClinico");
    //   localStorage.removeItem("suscriptoresNewsletter");
    //   localStorage.removeItem("newsletterEmails");
    //   localStorage.setItem("fictional_data_cleared", "true");
    // }

    // Set the flag to prevent future clearing
    if (!localStorage.getItem("fictional_data_cleared")) {
      localStorage.setItem("fictional_data_cleared", "true");
    }
  }, []);

  // Load initial state from localStorage or use defaults
  const [user, setUserState] = useState<Usuario | null>(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const parsedUser = JSON.parse(userStr);
        // Convert date strings back to Date objects
        if (parsedUser.fechaRegistro) {
          parsedUser.fechaRegistro = new Date(parsedUser.fechaRegistro);
        }
        return parsedUser;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    try {
      const usuariosStr = localStorage.getItem("usuarios");
      if (usuariosStr) {
        const parsedUsuarios = JSON.parse(usuariosStr);
        return parsedUsuarios.map((usuario: any) => ({
          ...usuario,
          fechaRegistro: usuario.fechaRegistro
            ? new Date(usuario.fechaRegistro)
            : new Date(),
        }));
      }
      return initialUsuarios;
    } catch {
      return initialUsuarios;
    }
  });

  const [mascotas, setMascotas] = useState<Mascota[]>(() => {
    try {
      const mascotasStr = localStorage.getItem("mascotas");
      if (mascotasStr) {
        const parsedMascotas = JSON.parse(mascotasStr);
        // Convert date strings back to Date objects
        return parsedMascotas.map((mascota: any) => ({
          ...mascota,
          fechaNacimiento: new Date(mascota.fechaNacimiento),
          proximaCita: mascota.proximaCita
            ? new Date(mascota.proximaCita)
            : null,
          ultimaVacuna: mascota.ultimaVacuna
            ? new Date(mascota.ultimaVacuna)
            : null,
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [citas, setCitas] = useState<Cita[]>(() => {
    try {
      const citasStr = localStorage.getItem("citas");
      if (citasStr) {
        const parsedCitas = JSON.parse(citasStr);
        // Convert date strings back to Date objects and load receipt data
        return parsedCitas.map((cita: any) => {
          const citaWithDate = {
            ...cita,
            fecha: new Date(cita.fecha),
            tipoConsulta: cita.tipoConsulta || "Consulta General",
            // Ensure new fields are present for backward compatibility
            mascotaId: cita.mascotaId || undefined,
            clienteId: cita.clienteId || undefined,
            clienteNombre: cita.clienteNombre || undefined,
          };

          // If cita has comprobantePago but no comprobanteData, try to load it
          if (cita.comprobantePago && !cita.comprobanteData) {
            try {
              const storageKey = `comprobante_${cita.id}`;
              const stored = localStorage.getItem(storageKey);
              if (stored) {
                citaWithDate.comprobanteData = JSON.parse(stored);
              }
            } catch (error) {
              console.warn(
                `No se pudo cargar comprobante para cita ${cita.id}:`,
                error,
              );
            }
          }

          return citaWithDate;
        });
      }
      return [];
    } catch {
      return [];
    }
  });

  const [preCitas, setPreCitas] = useState<PreCita[]>(() => {
    try {
      const preCitasStr = localStorage.getItem("preCitas");
      if (preCitasStr) {
        const parsedPreCitas = JSON.parse(preCitasStr);
        return parsedPreCitas.map((preCita: any) => ({
          ...preCita,
          fechaPreferida: createSafeDate(preCita.fechaPreferida),
          fechaCreacion: new Date(preCita.fechaCreacion),
          ...(preCita.fechaNueva && {
            fechaNueva: new Date(preCita.fechaNueva),
          }),
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [historialClinico, setHistorialClinico] = useState<HistorialClinico[]>(
    () => {
      try {
        const historialStr = localStorage.getItem("historialClinico");
        if (historialStr) {
          const parsedHistorial = JSON.parse(historialStr);
          return parsedHistorial.map((entry: any) => ({
            ...entry,
            fecha: new Date(entry.fecha),
            ...(entry.proximaVisita && {
              proximaVisita: new Date(entry.proximaVisita),
            }),
            ...(entry.vacunas && {
              vacunas: entry.vacunas.map((vacuna: any) => ({
                ...vacuna,
                proximaFecha: new Date(vacuna.proximaFecha),
              })),
            }),
          }));
        }
        return [];
      } catch {
        return [];
      }
    },
  );

  const [suscriptoresNewsletter, setSuscriptoresNewsletter] = useState<
    SuscriptorNewsletter[]
  >(() => {
    try {
      const suscriptoresStr = localStorage.getItem("suscriptoresNewsletter");
      if (suscriptoresStr) {
        const parsedSuscriptores = JSON.parse(suscriptoresStr);
        return parsedSuscriptores.map((suscriptor: any) => ({
          ...suscriptor,
          fechaSuscripcion: new Date(suscriptor.fechaSuscripcion),
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [newsletterEmails, setNewsletterEmails] = useState<NewsletterEmail[]>(
    () => {
      try {
        const emailsStr = localStorage.getItem("newsletterEmails");
        if (emailsStr) {
          const parsedEmails = JSON.parse(emailsStr);
          return parsedEmails.map((email: any) => ({
            ...email,
            fechaEnvio: new Date(email.fechaEnvio),
          }));
        }
        return [];
      } catch {
        return [];
      }
    },
  );

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() => {
    try {
      const notificacionesStr = localStorage.getItem("notificaciones");
      if (notificacionesStr) {
        const parsedNotificaciones = JSON.parse(notificacionesStr);
        return parsedNotificaciones.map((notif: any) => ({
          ...notif,
          fechaCreacion: new Date(notif.fechaCreacion),
          ...(notif.datos?.fechaCita && {
            datos: {
              ...notif.datos,
              fechaCita: new Date(notif.datos.fechaCita),
            },
          }),
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  // Función mejorada para verificar y optimizar localStorage
  const optimizeLocalStorage = () => {
    try {
      // Calcular uso actual de localStorage
      let total = 0;
      const storageInfo = {};

      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const size = localStorage[key].length;
          total += size;
          storageInfo[key] = size;
        }
      }

      const maxSize = 5 * 1024 * 1024; // 5MB límite aproximado
      const currentUsage = ((total / maxSize) * 100).toFixed(2);

      // Log del uso para debugging (solo en desarrollo)
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[STORAGE] LocalStorage: ${currentUsage}% usado (${(total / 1024).toFixed(1)}KB)`,
        );
      }

      // Si está cerca del límite (>80%), limpiar datos innecesarios
      if (total > maxSize * 0.8) {
        console.warn("🚨 localStorage cerca del límite, optimizando...");

        // Limpiar datos temporales o innecesarios
        const keysToClean = [
          "fictional_data_cleared",
          "temp_data",
          "cache_",
          "preview_",
          "draft_",
          "old_",
        ];

        let cleanedSpace = 0;
        keysToClean.forEach((keyPrefix) => {
          Object.keys(localStorage).forEach((key) => {
            if (key === keyPrefix || key.startsWith(keyPrefix)) {
              cleanedSpace += localStorage[key].length;
              localStorage.removeItem(key);
            }
          });
        });

        console.log(
          `[CLEANED] Liberado ${(cleanedSpace / 1024).toFixed(1)}KB de espacio`,
        );
      }
    } catch (error) {
      console.error("[ERROR] Error optimizando localStorage:", error);
    }
  };

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (user) {
      try {
        optimizeLocalStorage();
        localStorage.setItem("user", JSON.stringify(user));
      } catch (error) {
        console.error("Error guardando usuario:", error);
      }
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
    } catch (error) {
      console.error("Error guardando usuarios:", error);
    }
  }, [usuarios]);

  useEffect(() => {
    try {
      optimizeLocalStorage();
      localStorage.setItem("mascotas", JSON.stringify(mascotas));
    } catch (error) {
      console.error("Error guardando mascotas:", error);
      // En caso de error, intentar guardar sin las fotos para preservar datos básicos
      try {
        const mascotasSinFotos = mascotas.map((mascota) => ({
          ...mascota,
          foto: null,
        }));
        localStorage.setItem("mascotas", JSON.stringify(mascotasSinFotos));
        console.warn(
          "Mascotas guardadas sin fotos para preservar datos básicos",
        );
      } catch (fallbackError) {
        console.error("Error crítico guardando mascotas:", fallbackError);
      }
    }
  }, [mascotas]);

  useEffect(() => {
    try {
      localStorage.setItem("citas", JSON.stringify(citas));
      // También asegurar que los comprobantes se persistan por separado
      citas.forEach((cita) => {
        if (cita.comprobanteData) {
          const storageKey = `comprobante_${cita.id}`;
          try {
            localStorage.setItem(
              storageKey,
              JSON.stringify(cita.comprobanteData),
            );
          } catch (error) {
            console.warn(
              `No se pudo persistir comprobante para cita ${cita.id}:`,
              error,
            );
          }
        }
      });
    } catch (error) {
      console.error("Error guardando citas:", error);
    }
  }, [citas]);

  useEffect(() => {
    localStorage.setItem("preCitas", JSON.stringify(preCitas));
  }, [preCitas]);

  useEffect(() => {
    localStorage.setItem("historialClinico", JSON.stringify(historialClinico));
  }, [historialClinico]);

  useEffect(() => {
    localStorage.setItem(
      "suscriptoresNewsletter",
      JSON.stringify(suscriptoresNewsletter),
    );
  }, [suscriptoresNewsletter]);

  useEffect(() => {
    localStorage.setItem("newsletterEmails", JSON.stringify(newsletterEmails));
  }, [newsletterEmails]);

  useEffect(() => {
    localStorage.setItem("notificaciones", JSON.stringify(notificaciones));
  }, [notificaciones]);

  // Enhanced auto-repair for appointments and data relationships
  useEffect(() => {
    const hasRunAutoRepair = localStorage.getItem(
      "auto_repair_appointments_v2",
    );

    if (!hasRunAutoRepair && citas.length > 0 && usuarios.length > 0) {
      console.log("[REPAIR] Ejecutando reparación automática avanzada de datos...");

      let repairedCitas = 0;
      let createdMascotas = 0;
      let repairedMascotas = 0;
      const errors: string[] = [];

      // First, create missing pets from appointments
      const mascotasNombres = new Set(
        mascotas.map((m) => m.nombre.toLowerCase()),
      );
      const clientesDisponibles = usuarios.filter((u) => u.rol === "cliente");
      const newMascotas: Mascota[] = [];

      citas.forEach((cita) => {
        if (!mascotasNombres.has(cita.mascota.toLowerCase())) {
          // Find client for this appointment
          let clienteAsignado = clientesDisponibles[0]; // Default fallback

          if (cita.clienteId) {
            const clienteExistente = usuarios.find(
              (u) => u.id === cita.clienteId && u.rol === "cliente",
            );
            if (clienteExistente) {
              clienteAsignado = clienteExistente;
            }
          }

          if (clienteAsignado) {
            const nuevaMascota: Mascota = {
              id: `repair-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              nombre: cita.mascota,
              especie: cita.especie || "No especificado",
              raza: "Por determinar",
              sexo: "No especificado",
              fechaNacimiento: new Date(2020, 0, 1),
              peso: undefined,
              microchip: undefined,
              estado: "Activo",
              clienteId: clienteAsignado.id,
              proximaCita: cita.fecha > new Date() ? cita.fecha : null,
              ultimaVacuna: null,
              foto: null,
            };

            newMascotas.push(nuevaMascota);
            mascotasNombres.add(cita.mascota.toLowerCase());
            createdMascotas++;
            console.log(
              `[CREATE] Mascota creada: "${cita.mascota}" asignada a ${clienteAsignado.nombre}`,
            );
          } else {
            errors.push(
              `No se pudo crear mascota "${cita.mascota}" - no hay clientes disponibles`,
            );
          }
        }
      });

      // Update mascotas state with new pets
      if (newMascotas.length > 0) {
        setMascotas((prev) => [...prev, ...newMascotas]);
      }

      // Now repair appointments with complete data
      const allMascotas = [...mascotas, ...newMascotas];
      const repairedCitasData = citas.map((cita) => {
        if (!cita.clienteId || !cita.clienteNombre || !cita.mascotaId) {
          // Find the pet and its owner
          const mascotaEncontrada = allMascotas.find(
            (m) => m.nombre.toLowerCase() === cita.mascota.toLowerCase(),
          );

          if (mascotaEncontrada) {
            const propietario = usuarios.find(
              (u) =>
                u.id === mascotaEncontrada.clienteId && u.rol === "cliente",
            );

            if (propietario) {
              repairedCitas++;
              console.log(
                `[REPAIR] Cita reparada: "${cita.mascota}" -> ${propietario.nombre}`,
              );

              return {
                ...cita,
                mascotaId: mascotaEncontrada.id,
                clienteId: propietario.id,
                clienteNombre: propietario.nombre,
              };
            }
          }
        }

        return cita;
      });

      // Update appointments if any were repaired
      if (repairedCitas > 0) {
        setCitas(repairedCitasData);
      }

      // Repair pets without valid owners
      const mascotasSinPropietario = allMascotas.filter((m) => {
        const propietario = usuarios.find(
          (u) => u.id === m.clienteId && u.rol === "cliente",
        );
        return !propietario;
      });

      if (mascotasSinPropietario.length > 0 && clientesDisponibles.length > 0) {
        const mascotasReparadas = allMascotas.map((mascota) => {
          const propietario = usuarios.find(
            (u) => u.id === mascota.clienteId && u.rol === "cliente",
          );

          if (!propietario) {
            // Assign to first available client
            const clienteAsignado = clientesDisponibles[0];
            repairedMascotas++;
            console.log(
              `[ASSIGN] Mascota "${mascota.nombre}" asignada a ${clienteAsignado.nombre}`,
            );

            return {
              ...mascota,
              clienteId: clienteAsignado.id,
            };
          }

          return mascota;
        });

        if (repairedMascotas > 0) {
          setMascotas(mascotasReparadas);
        }
      }

      const totalRepairs = repairedCitas + createdMascotas + repairedMascotas;
      if (totalRepairs > 0) {
        console.log(
          `[COMPLETE] Reparación completada: ${repairedCitas} citas, ${createdMascotas} mascotas creadas, ${repairedMascotas} mascotas reparadas`,
        );
      }

      if (errors.length > 0) {
        console.warn("[WARNING] Errores durante la reparación:", errors);
      }

      // Mark as completed to avoid running again
      localStorage.setItem("auto_repair_appointments_v2", "completed");
    }
  }, [citas, mascotas, usuarios]);

  // Receipt/Voucher management functions
  const saveComprobante = async (
    citaId: string,
    file: File,
  ): Promise<boolean> => {
    try {
      // Optimizar espacio antes de guardar
      optimizeStorageSpace();

      // Comprimir imagen
      const compressedImage: CompressedImage = await compressImage(file);

      // Crear datos del comprobante
      const comprobanteData: ComprobanteData = {
        id: `comprobante_${citaId}_${Date.now()}`,
        data: compressedImage.data,
        originalName: compressedImage.originalName,
        size: compressedImage.size,
        type: compressedImage.type,
        timestamp: Date.now(),
      };

      // Guardar en localStorage
      const storageKey = `comprobante_${citaId}`;
      localStorage.setItem(storageKey, JSON.stringify(comprobanteData));

      // Actualizar la cita con la referencia del comprobante
      updateCita(citaId, {
        estado: "en_validacion",
        comprobantePago: comprobanteData.id,
        comprobanteData: comprobanteData,
        notasAdmin: "", // Clear previous rejection notes
      });

      console.log(
        `[SAVED] Comprobante guardado: ${(comprobanteData.size / 1024).toFixed(1)}KB`,
      );
      return true;
    } catch (error) {
      console.error("[ERROR] Error guardando comprobante:", error);
      return false;
    }
  };

  const getComprobante = (citaId: string): ComprobanteData | null => {
    try {
      // Primero buscar en los datos de la cita
      const cita = citas.find((c) => c.id === citaId);
      if (cita?.comprobanteData) {
        return cita.comprobanteData;
      }

      // Si no está en la cita, buscar en localStorage
      const storageKey = `comprobante_${citaId}`;
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        const comprobanteData = JSON.parse(stored) as ComprobanteData;

        // Si encontramos el comprobante en localStorage pero no en la cita,
        // actualizar la cita para incluir los datos
        if (cita && cita.comprobantePago && !cita.comprobanteData) {
          updateCita(citaId, { comprobanteData });
        }

        return comprobanteData;
      }

      return null;
    } catch (error) {
      console.error("[ERROR] Error recuperando comprobante:", error);
      return null;
    }
  };

  const deleteComprobante = (citaId: string): void => {
    try {
      const storageKey = `comprobante_${citaId}`;
      localStorage.removeItem(storageKey);

      // Actualizar la cita para remover el comprobante
      updateCita(citaId, {
        comprobantePago: undefined,
        comprobanteData: undefined,
      });

      console.log(`[DELETED] Comprobante eliminado para cita ${citaId}`);
    } catch (error) {
      console.error("[ERROR] Error eliminando comprobante:", error);
    }
  };

  // Authentication functions
  const setUser = (newUser: Usuario | null) => {
    setUserState(newUser);
  };

  const logout = () => {
    setUserState(null);
    // Clear user-specific data only
    setMascotas([]);
    // Force clear localStorage for user-specific data only
    localStorage.removeItem("user");
    localStorage.removeItem("mascotas");
    // Note: citas and preCitas are global system data and should not be cleared on logout
  };

  const login = async (
    identifier: string,
    password: string,
  ): Promise<Usuario | null> => {
    // Find user by email, username, or phone
    const existingUser = usuarios.find((u) =>
      u.email === identifier ||
      u.username === identifier ||
      u.telefono === identifier
    );

    if (existingUser) {
      // Check if user has a password set
      if (existingUser.password) {
        // Validate password
        if (existingUser.password === password) {
          setUserState(existingUser);
          return existingUser;
        } else {
          return null; // Wrong password
        }
      } else {
        // For users without password (old client accounts), accept any password
        // This is for backward compatibility with existing client accounts
        if (existingUser.rol === "cliente") {
          setUserState(existingUser);
          return existingUser;
        } else {
          // Veterinarians and admins must have passwords
          return null;
        }
      }
    }

    return null; // User not found
  };

  const register = async (
    userData: Omit<Usuario, "id" | "fechaRegistro"> & { password: string },
  ): Promise<Usuario | null> => {
    // Check if user already exists
    const existingUser = usuarios.find((u) => u.email === userData.email);
    if (existingUser) {
      return null; // User already exists
    }

    // Create new user with ALL the provided fields
    const newUser: Usuario = {
      id: Date.now().toString(),
      nombre: userData.nombre,
      apellidos: userData.apellidos, // Ahora se guarda
      username: userData.username, // Ahora se guarda
      email: userData.email,
      rol: userData.rol,
      telefono: userData.telefono,
      direccion: userData.direccion, // Ahora se guarda
      fechaNacimiento: userData.fechaNacimiento, // Ahora se guarda
      genero: userData.genero, // Ahora se guarda
      documento: userData.documento, // Ahora se guarda
      tipoDocumento: userData.tipoDocumento, // Ahora se guarda
      password: userData.password, // También guardar la contraseña
      fechaRegistro: new Date(),
      foto: userData.foto || null, // Incluir foto si existe
    };

    setUsuarios((prev) => [...prev, newUser]);
    setUserState(newUser);

    // Generar notificación de bienvenida para nuevos clientes
    if (newUser.rol === "cliente") {
      addNotificacion({
        usuarioId: newUser.id,
        tipo: "bienvenida_cliente",
        titulo: "¡Bienvenido a nuestra clínica veterinaria!",
        mensaje: `Hola ${newUser.nombre}, nos alegra tenerte en nuestra familia. Aquí podrás gestionar el cuidado de tus mascotas de manera fácil y segura.`,
        leida: false,
      });
    }

    return newUser;
  };

  const deleteAccount = async (userId: string): Promise<boolean> => {
    try {
      // Verificar que el usuario existe y es cliente
      const userToDelete = usuarios.find((u) => u.id === userId);
      if (!userToDelete || userToDelete.rol !== "cliente") {
        console.error("Usuario no encontrado o no es cliente");
        return false;
      }

      console.log(`[DELETE] Iniciando eliminación de cuenta para usuario: ${userToDelete.nombre}`);

      // 1. Eliminar todas las mascotas del usuario
      const mascotasDelUsuario = mascotas.filter((m) => m.clienteId === userId);
      console.log(`[PETS] Eliminando ${mascotasDelUsuario.length} mascotas del usuario`);

      setMascotas((prev) => prev.filter((m) => m.clienteId !== userId));

      // 2. Cancelar/eliminar todas las citas del usuario
      const citasDelUsuario = citas.filter((c) => c.clienteId === userId);
      console.log(`[APPOINTMENTS] Cancelando ${citasDelUsuario.length} citas del usuario`);

      setCitas((prev) => prev.filter((c) => c.clienteId !== userId));

      // 3. Eliminar historial clínico de las mascotas del usuario
      const mascotaIds = mascotasDelUsuario.map((m) => m.id);
      const historialEliminado = historialClinico.filter((h) =>
        mascotaIds.includes(h.mascotaId)
      );
      console.log(`[MEDICAL] Eliminando ${historialEliminado.length} entradas de historial clínico`);

      setHistorialClinico((prev) =>
        prev.filter((h) => !mascotaIds.includes(h.mascotaId))
      );

      // 4. Eliminar notificaciones del usuario
      const notificacionesDelUsuario = notificaciones.filter((n) => n.usuarioId === userId);
      console.log(`[NOTIFICATIONS] Eliminando ${notificacionesDelUsuario.length} notificaciones del usuario`);

      setNotificaciones((prev) => prev.filter((n) => n.usuarioId !== userId));

      // 5. Eliminar comprobantes de pago del usuario
      citasDelUsuario.forEach((cita) => {
        if (cita.comprobanteData || cita.comprobantePago) {
          const storageKey = `comprobante_${cita.id}`;
          localStorage.removeItem(storageKey);
        }
      });
      console.log(`[RECEIPTS] Comprobantes de pago eliminados`);

      // 6. Limpiar datos específicos del usuario en localStorage
      const keysToRemove = [
        `petla_user_bio`,
        `petla_user_direccion`,
        `petla_user_documento`,
        `petla_user_tipo_documento`,
        `petla_notifications`,
        `petla_theme`,
        `petla_security_2fa`,
        `petla_security_login_alerts`,
        `petla_security_session_timeout`,
      ];

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });
      console.log(`[CONFIG] Datos de configuración personal eliminados`);

      // 7. Finalmente, eliminar el usuario del sistema
      setUsuarios((prev) => prev.filter((u) => u.id !== userId));

      console.log(`[SUCCESS] Cuenta eliminada exitosamente para ${userToDelete.nombre}`);
      console.log(`[SUMMARY] Resumen de eliminación:`);
      console.log(`   - Usuario: ${userToDelete.nombre} (${userToDelete.email})`);
      console.log(`   - Mascotas eliminadas: ${mascotasDelUsuario.length}`);
      console.log(`   - Citas canceladas: ${citasDelUsuario.length}`);
      console.log(`   - Historial clínico eliminado: ${historialEliminado.length} entradas`);
      console.log(`   - Notificaciones eliminadas: ${notificacionesDelUsuario.length}`);

      return true;
    } catch (error) {
      console.error("[ERROR] Error eliminando cuenta:", error);
      return false;
    }
  };

  // User management functions (admin only)
  const addUsuario = (usuarioData: Omit<Usuario, "id" | "fechaRegistro">) => {
    const newUsuario: Usuario = {
      ...usuarioData,
      id: Date.now().toString(),
      fechaRegistro: new Date(),
    };
    setUsuarios((prev) => [...prev, newUsuario]);
  };

  const updateUsuario = (id: string, updates: Partial<Usuario>) => {
    const processedUpdates = {
      ...updates,
      ...(updates.fechaRegistro && {
        fechaRegistro: new Date(updates.fechaRegistro),
      }),
    };
    setUsuarios((prev) =>
      prev.map((usuario) =>
        usuario.id === id ? { ...usuario, ...processedUpdates } : usuario,
      ),
    );
  };

  const deleteUsuario = (id: string) => {
    setUsuarios((prev) => prev.filter((usuario) => usuario.id !== id));
  };

  // Fix orphaned pets (pets without proper clienteId)
  const fixOrphanedPets = () => {
    if (!user) return;

    setMascotas((prev) =>
      prev.map((mascota) => {
        // If pet has no clienteId or has a clienteId that doesn't exist in usuarios
        if (
          !mascota.clienteId ||
          !usuarios.find((u) => u.id === mascota.clienteId)
        ) {
          return { ...mascota, clienteId: user.id };
        }
        return mascota;
      }),
    );
  };

  // Enhanced comprehensive data integrity repair function
  const repairDataIntegrity = () => {
    let repairedPets = 0;
    let createdPets = 0;
    let repairedCitas = 0;
    const errors: string[] = [];

    try {
      console.log("[REPAIR] Iniciando reparación completa de integridad de datos...");

      const clientesDisponibles = usuarios.filter((u) => u.rol === "cliente");

      if (clientesDisponibles.length === 0) {
        errors.push("No hay clientes disponibles para asignar mascotas");
        return { repairedPets, createdPets, errors };
      }

      // Step 1: Create missing pets from appointments first
      const mascotasNombres = new Set(
        mascotas.map((m) => m.nombre.toLowerCase()),
      );
      const newMascotas: Mascota[] = [];

      citas.forEach((cita) => {
        if (!mascotasNombres.has(cita.mascota.toLowerCase())) {
          // Find the best client for this pet
          let clienteAsignado = clientesDisponibles[0];

          // Try to use the client from the appointment if valid
          if (cita.clienteId) {
            const clienteExistente = usuarios.find(
              (u) => u.id === cita.clienteId && u.rol === "cliente",
            );
            if (clienteExistente) {
              clienteAsignado = clienteExistente;
            }
          }

          // Create the missing pet
          const nuevaMascota: Mascota = {
            id: `repair-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            nombre: cita.mascota,
            especie: cita.especie || "No especificado",
            raza: "Por determinar",
            sexo: "No especificado",
            fechaNacimiento: new Date(2020, 0, 1),
            peso: undefined,
            microchip: undefined,
            estado: "Activo",
            clienteId: clienteAsignado.id,
            proximaCita: cita.fecha > new Date() ? cita.fecha : null,
            ultimaVacuna: null,
            foto: null,
          };

          newMascotas.push(nuevaMascota);
          mascotasNombres.add(cita.mascota.toLowerCase());
          createdPets++;
          console.log(
            `[CREATE] Mascota creada: "${cita.mascota}" -> ${clienteAsignado.nombre}`,
          );
        }
      });

      // Update mascotas state with new pets
      if (newMascotas.length > 0) {
        setMascotas((prev) => [...prev, ...newMascotas]);
      }

      // Step 2: Repair existing pets without valid owners
      const allMascotas = [...mascotas, ...newMascotas];
      const mascotasReparadas = allMascotas.map((mascota) => {
        const propietarioActual = usuarios.find(
          (u) => u.id === mascota.clienteId && u.rol === "cliente",
        );

        if (!propietarioActual) {
          // Find the best match based on existing pets of same species
          let mejorCliente = clientesDisponibles.find((cliente) => {
            return allMascotas.some(
              (m) =>
                m.clienteId === cliente.id &&
                m.especie === mascota.especie &&
                m.id !== mascota.id,
            );
          });

          // If no perfect match, assign to first available client
          if (!mejorCliente) {
            mejorCliente = clientesDisponibles[0];
          }

          repairedPets++;
          console.log(
            `[REASSIGN] Mascota "${mascota.nombre}" reasignada a ${mejorCliente.nombre}`,
          );

          return { ...mascota, clienteId: mejorCliente.id };
        }

        return mascota;
      });

      // Update pets if any were repaired
      if (repairedPets > 0) {
        setMascotas(mascotasReparadas);
      }

      // Step 3: Repair appointments without complete client information
      const citasReparadas = citas.map((cita) => {
        if (!cita.clienteId || !cita.clienteNombre || !cita.mascotaId) {
          // Find the pet and its owner
          const mascotaEncontrada = mascotasReparadas.find(
            (m) => m.nombre.toLowerCase() === cita.mascota.toLowerCase(),
          );

          if (mascotaEncontrada) {
            const propietario = usuarios.find(
              (u) =>
                u.id === mascotaEncontrada.clienteId && u.rol === "cliente",
            );

            if (propietario) {
              repairedCitas++;
              console.log(
                `[LINKED] Cita "${cita.mascota}" vinculada con ${propietario.nombre}`,
              );

              return {
                ...cita,
                mascotaId: mascotaEncontrada.id,
                clienteId: propietario.id,
                clienteNombre: propietario.nombre,
              };
            } else {
              errors.push(
                `Propietario no encontrado para mascota "${mascotaEncontrada.nombre}"`,
              );
            }
          } else {
            errors.push(
              `Mascota "${cita.mascota}" no encontrada después de la reparación`,
            );
          }
        }

        return cita;
      });

      // Update appointments if any were repaired
      if (repairedCitas > 0) {
        setCitas(citasReparadas);
      }

      const totalRepairs = repairedPets + createdPets + repairedCitas;
      console.log(
        `[COMPLETE] Reparación completada: ${repairedPets} mascotas reparadas, ${createdPets} mascotas creadas, ${repairedCitas} citas reparadas`,
      );

      if (errors.length > 0) {
        console.warn("[WARNING] Errores durante la reparación:", errors);
      }

      // Force a refresh of localStorage to persist changes
      setTimeout(() => {
        console.log("[REFRESH] Forzando persistencia de datos reparados...");
      }, 100);
    } catch (error) {
      console.error("[ERROR] Error durante la reparación de datos:", error);
      errors.push(
        `Error general: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    }

    return { repairedPets, createdPets, errors };
  };

  // Enhanced mascota functions with better relationship management
  const addMascota = (
    mascotaData: Omit<
      Mascota,
      "id" | "estado" | "clienteId" | "proximaCita" | "ultimaVacuna" | "foto"
    >,
  ) => {
    if (!user || user.rol !== "cliente") {
      console.error("Solo los clientes pueden agregar mascotas");
      return;
    }

    const newMascota: Mascota = {
      ...mascotaData,
      id: `mascota-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fechaNacimiento: new Date(mascotaData.fechaNacimiento),
      estado: "Activo",
      clienteId: user.id,
      proximaCita: null,
      ultimaVacuna: null,
      foto: null,
    };

    setMascotas((prev) => [...prev, newMascota]);
    console.log(
      `[ADDED] Nueva mascota agregada: ${newMascota.nombre} para ${user.nombre}`,
    );
  };

  const updateMascota = (id: string, updates: Partial<Mascota>) => {
    const processedUpdates = {
      ...updates,
      ...(updates.fechaNacimiento && {
        fechaNacimiento: new Date(updates.fechaNacimiento),
      }),
      ...(updates.proximaCita && {
        proximaCita: new Date(updates.proximaCita),
      }),
      ...(updates.ultimaVacuna && {
        ultimaVacuna: new Date(updates.ultimaVacuna),
      }),
    };
    setMascotas((prev) =>
      prev.map((mascota) =>
        mascota.id === id ? { ...mascota, ...processedUpdates } : mascota,
      ),
    );
  };

  const deleteMascota = (id: string) => {
    setMascotas((prev) => prev.filter((mascota) => mascota.id !== id));
    // Also remove citas for this mascota
    setCitas((prev) =>
      prev.filter((cita) => {
        const mascota = mascotas.find((m) => m.id === id);
        return mascota ? cita.mascota !== mascota.nombre : true;
      }),
    );
  };

  // Enhanced cita functions with better relationship management
  const addCita = (citaData: Omit<Cita, "id">) => {
    if (!user) {
      console.error("Usuario no autenticado");
      return;
    }

    // Find the pet to get proper relationship data
    const mascota = mascotas.find((m) => m.nombre === citaData.mascota);

    const newCita: Cita = {
      ...citaData,
      id: `cita-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fecha: new Date(citaData.fecha),
      // Ensure relationship data is properly set
      mascotaId: mascota?.id || undefined,
      clienteId:
        user.rol === "cliente" ? user.id : mascota?.clienteId || undefined,
      clienteNombre:
        user.rol === "cliente"
          ? user.nombre
          : usuarios.find((u) => u.id === mascota?.clienteId)?.nombre ||
            undefined,
    };

    setCitas((prev) => [...prev, newCita]);
    console.log(
      `[CREATED] Nueva cita creada: ${newCita.mascota} - ${newCita.veterinario}`,
    );

    // Update mascota's proximaCita if it's a future appointment
    if (new Date(citaData.fecha) > new Date() && mascota) {
      updateMascota(mascota.id, { proximaCita: new Date(citaData.fecha) });
    }
  };

  const updateCita = (id: string, updates: Partial<Cita>) => {
    const processedUpdates = {
      ...updates,
      ...(updates.fecha && { fecha: new Date(updates.fecha) }),
    };

    const citaAnterior = citas.find((c) => c.id === id);

    setCitas((prev) =>
      prev.map((cita) =>
        cita.id === id ? { ...cita, ...processedUpdates } : cita,
      ),
    );

    // Generar notificación cuando se acepta una cita
    if (
      citaAnterior &&
      updates.estado === "aceptada" &&
      citaAnterior.estado !== "aceptada"
    ) {
      const mascotaInfo = mascotas.find(
        (m) => m.nombre === citaAnterior.mascota,
      );
      if (mascotaInfo) {
        const fechaCita = updates.fecha
          ? new Date(updates.fecha)
          : new Date(citaAnterior.fecha);
        addNotificacion({
          usuarioId: mascotaInfo.clienteId,
          tipo: "cita_aceptada",
          titulo: "¡Cita confirmada!",
          mensaje: `Tu cita para ${citaAnterior.mascota} ha sido aceptada y confirmada.`,
          leida: false,
          datos: {
            citaId: id,
            mascotaNombre: citaAnterior.mascota,
            veterinario: citaAnterior.veterinario,
            fechaCita: fechaCita,
            motivo: citaAnterior.motivo,
          },
        });
      }
    }
  };

  const deleteCita = (id: string) => {
    const cita = citas.find((c) => c.id === id);
    setCitas((prev) => prev.filter((c) => c.id !== id));

    // Update mascota's proximaCita if needed
    if (cita) {
      const mascota = mascotas.find((m) => m.nombre === cita.mascota);
      if (mascota && mascota.proximaCita) {
        const remainingCitas = citas.filter(
          (c) =>
            c.id !== id &&
            c.mascota === cita.mascota &&
            new Date(c.fecha) > new Date(),
        );
        const nextCita = remainingCitas.sort(
          (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
        )[0];

        updateMascota(mascota.id, {
          proximaCita: nextCita ? new Date(nextCita.fecha) : null,
        });
      }
    }
  };

  // Helper function to create dates safely
  const createSafeDate = (dateInput: string | Date): Date => {
    if (dateInput instanceof Date) return dateInput;
    if (typeof dateInput === "string" && dateInput.includes("-")) {
      const [year, month, day] = dateInput.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateInput);
  };

  // Pre-cita functions
  const addPreCita = (
    preCitaData: Omit<PreCita, "id" | "estado" | "fechaCreacion">,
  ) => {
    const newPreCita: PreCita = {
      ...preCitaData,
      id: Date.now().toString(),
      estado: "pendiente",
      fechaCreacion: new Date(),
      fechaPreferida: createSafeDate(preCitaData.fechaPreferida),
    };
    setPreCitas((prev) => [...prev, newPreCita]);
  };

  const updatePreCita = (id: string, updates: Partial<PreCita>) => {
    const processedUpdates = {
      ...updates,
      ...(updates.fechaPreferida && {
        fechaPreferida: createSafeDate(updates.fechaPreferida),
      }),
      ...(updates.fechaNueva && { fechaNueva: new Date(updates.fechaNueva) }),
      ...(updates.fechaCreacion && {
        fechaCreacion: new Date(updates.fechaCreacion),
      }),
    };
    setPreCitas((prev) =>
      prev.map((preCita) =>
        preCita.id === id ? { ...preCita, ...processedUpdates } : preCita,
      ),
    );
  };

  const deletePreCita = (id: string) => {
    setPreCitas((prev) => prev.filter((preCita) => preCita.id !== id));
  };

  // Historial Clinico functions
  const addHistorialEntry = (entryData: Omit<HistorialClinico, "id">) => {
    const newEntry: HistorialClinico = {
      ...entryData,
      id: Date.now().toString(),
      fecha: new Date(entryData.fecha),
      ...(entryData.proximaVisita && {
        proximaVisita: new Date(entryData.proximaVisita),
      }),
      ...(entryData.vacunas && {
        vacunas: entryData.vacunas.map((vacuna) => ({
          ...vacuna,
          proximaFecha: new Date(vacuna.proximaFecha),
        })),
      }),
    };
    setHistorialClinico((prev) => [...prev, newEntry]);

    // Generar notificación para el cliente cuando se registra una consulta
    const mascotaInfo = mascotas.find((m) => m.id === entryData.mascotaId);
    if (mascotaInfo) {
      addNotificacion({
        usuarioId: mascotaInfo.clienteId,
        tipo: "consulta_registrada",
        titulo: "Consulta médica registrada",
        mensaje: `Se ha registrado la consulta médica de ${entryData.mascotaNombre}. Los detalles están disponibles en el historial clínico.`,
        leida: false,
        datos: {
          mascotaNombre: entryData.mascotaNombre,
          veterinario: entryData.veterinario,
          fechaCita: new Date(entryData.fecha),
          motivo: entryData.motivo,
        },
      });
    }
  };

  const updateHistorialEntry = (
    id: string,
    updates: Partial<HistorialClinico>,
  ) => {
    const processedUpdates = {
      ...updates,
      ...(updates.fecha && { fecha: new Date(updates.fecha) }),
      ...(updates.proximaVisita && {
        proximaVisita: new Date(updates.proximaVisita),
      }),
      ...(updates.vacunas && {
        vacunas: updates.vacunas.map((vacuna) => ({
          ...vacuna,
          proximaFecha: new Date(vacuna.proximaFecha),
        })),
      }),
    };
    setHistorialClinico((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, ...processedUpdates } : entry,
      ),
    );
  };

  const deleteHistorialEntry = (id: string) => {
    setHistorialClinico((prev) => prev.filter((entry) => entry.id !== id));
  };

  const getHistorialByMascota = (mascotaId: string): HistorialClinico[] => {
    return historialClinico
      .filter((entry) => entry.mascotaId === mascotaId)
      .sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      );
  };

  // Newsletter functions
  const addSuscriptorNewsletter = async (email: string): Promise<boolean> => {
    const emailLower = email.toLowerCase();

    // Check if email already exists (case insensitive)
    const existingSuscriptor = suscriptoresNewsletter.find(
      (s) => s.email.toLowerCase() === emailLower,
    );

    if (existingSuscriptor) {
      if (existingSuscriptor.activo) {
        return false; // Already subscribed and active
      } else {
        // Reactivate inactive subscription
        updateSuscriptorNewsletter(existingSuscriptor.id, {
          activo: true,
          fechaSuscripcion: new Date(), // Update subscription date
        });
        return true;
      }
    }

    // Create new subscription
    const newSuscriptor: SuscriptorNewsletter = {
      id: Date.now().toString(),
      email,
      fechaSuscripcion: new Date(),
      activo: true,
    };

    setSuscriptoresNewsletter((prev) => [...prev, newSuscriptor]);
    return true;
  };

  const updateSuscriptorNewsletter = (
    id: string,
    updates: Partial<SuscriptorNewsletter>,
  ) => {
    setSuscriptoresNewsletter((prev) =>
      prev.map((suscriptor) =>
        suscriptor.id === id ? { ...suscriptor, ...updates } : suscriptor,
      ),
    );
  };

  const deleteSuscriptorNewsletter = (id: string) => {
    setSuscriptoresNewsletter((prev) => prev.filter((s) => s.id !== id));
  };

  const addNewsletterEmail = (emailData: Omit<NewsletterEmail, "id">) => {
    const newEmail: NewsletterEmail = {
      ...emailData,
      id: Date.now().toString(),
      fechaEnvio: new Date(emailData.fechaEnvio),
    };
    setNewsletterEmails((prev) => [...prev, newEmail]);
  };

  const updateNewsletterEmail = (
    id: string,
    updates: Partial<NewsletterEmail>,
  ) => {
    const processedUpdates = {
      ...updates,
      ...(updates.fechaEnvio && { fechaEnvio: new Date(updates.fechaEnvio) }),
    };
    setNewsletterEmails((prev) =>
      prev.map((email) =>
        email.id === id ? { ...email, ...processedUpdates } : email,
      ),
    );
  };

  const deleteNewsletterEmail = (id: string) => {
    setNewsletterEmails((prev) => prev.filter((email) => email.id !== id));
  };

  // Funciones de notificaciones
  const addNotificacion = (
    notificacionData: Omit<Notificacion, "id" | "fechaCreacion">,
  ) => {
    const newNotificacion: Notificacion = {
      ...notificacionData,
      id: Date.now().toString(),
      fechaCreacion: new Date(),
    };
    setNotificaciones((prev) => [...prev, newNotificacion]);
  };

  const markNotificacionAsRead = (id: string) => {
    setNotificaciones((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, leida: true } : notif,
      ),
    );
  };

  const markAllNotificacionesAsRead = (usuarioId: string) => {
    setNotificaciones((prev) =>
      prev.map((notif) =>
        notif.usuarioId === usuarioId ? { ...notif, leida: true } : notif,
      ),
    );
  };

  const getNotificacionesByUser = (usuarioId: string): Notificacion[] => {
    return notificaciones
      .filter((notif) => notif.usuarioId === usuarioId)
      .sort(
        (a, b) =>
          new Date(b.fechaCreacion).getTime() -
          new Date(a.fechaCreacion).getTime(),
      );
  };

  const deleteNotificacion = (id: string) => {
    setNotificaciones((prev) => prev.filter((notif) => notif.id !== id));
  };

  // Data relationship helper functions
  const getMascotaWithOwner = (mascotaId: string) => {
    const mascota = mascotas.find((m) => m.id === mascotaId) || null;
    const propietario = mascota
      ? usuarios.find(
          (u) => u.id === mascota.clienteId && u.rol === "cliente",
        ) || null
      : null;

    return { mascota, propietario };
  };

  const getCitaWithRelations = (citaId: string) => {
    const cita = citas.find((c) => c.id === citaId) || null;
    let mascota: Mascota | null = null;
    let propietario: Usuario | null = null;

    if (cita) {
      // First try to find by mascotaId if available
      if (cita.mascotaId) {
        mascota = mascotas.find((m) => m.id === cita.mascotaId) || null;
      }

      // Fallback to find by name
      if (!mascota) {
        mascota =
          mascotas.find(
            (m) => m.nombre.toLowerCase() === cita.mascota.toLowerCase(),
          ) || null;
      }

      // Find owner from cita or from mascota
      if (cita.clienteId) {
        propietario =
          usuarios.find(
            (u) => u.id === cita.clienteId && u.rol === "cliente",
          ) || null;
      } else if (mascota) {
        propietario =
          usuarios.find(
            (u) => u.id === mascota.clienteId && u.rol === "cliente",
          ) || null;
      }
    }

    return { cita, mascota, propietario };
  };

  const validateDataRelationships = () => {
    // Find pets without valid owners
    const orphanedPets = mascotas.filter((mascota) => {
      const propietario = usuarios.find(
        (u) => u.id === mascota.clienteId && u.rol === "cliente",
      );
      return !propietario;
    });

    // Find appointments without complete information
    const incompleteCitas = citas.filter((cita) => {
      return !cita.clienteId || !cita.clienteNombre || !cita.mascotaId;
    });

    // Find "ghost" pets (mentioned in appointments but not registered)
    const mascotasRegistradas = new Set(
      mascotas.map((m) => m.nombre.toLowerCase()),
    );
    const ghostPets = Array.from(
      new Set(
        citas
          .map((c) => c.mascota)
          .filter((nombre) => !mascotasRegistradas.has(nombre.toLowerCase())),
      ),
    );

    const totalIssues =
      orphanedPets.length + incompleteCitas.length + ghostPets.length;

    return {
      orphanedPets,
      incompleteCitas,
      ghostPets,
      totalIssues,
    };
  };

  // Statistics function
  const getStats = () => {
    const totalMascotas = mascotas.length;
    const citasPendientes = citas.filter(
      (c) => c.estado === "aceptada" || c.estado === "en_validacion",
    ).length;

    const citasAtendidas = citas.filter((c) => c.estado === "atendida");
    const ultimaVisita =
      citasAtendidas.length > 0
        ? new Date(
            Math.max(...citasAtendidas.map((c) => new Date(c.fecha).getTime())),
          ).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
        : "N/A";

    const estadoGeneral = mascotas.length > 0 ? "Excelente" : "Sin mascotas";

    return {
      totalMascotas,
      citasPendientes,
      ultimaVisita,
      estadoGeneral,
    };
  };

  const contextValue: AppContextType = {
    user,
    setUser,
    logout,
    isAuthenticated: !!user,
    saveComprobante,
    getComprobante,
    deleteComprobante,
    usuarios,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    mascotas,
    addMascota,
    updateMascota,
    deleteMascota,
    fixOrphanedPets,
    repairDataIntegrity,
    citas,
    addCita,
    updateCita,
    deleteCita,
    preCitas,
    addPreCita,
    updatePreCita,
    deletePreCita,
    historialClinico,
    addHistorialEntry,
    updateHistorialEntry,
    deleteHistorialEntry,
    getHistorialByMascota,
    suscriptoresNewsletter,
    addSuscriptorNewsletter,
    updateSuscriptorNewsletter,
    deleteSuscriptorNewsletter,
    newsletterEmails,
    addNewsletterEmail,
    updateNewsletterEmail,
    deleteNewsletterEmail,
    notificaciones,
    addNotificacion,
    markNotificacionAsRead,
    markAllNotificacionesAsRead,
    getNotificacionesByUser,
    deleteNotificacion,
    login,
    register,
    deleteAccount,
    getMascotaWithOwner,
    getCitaWithRelations,
    validateDataRelationships,
    getStats,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
