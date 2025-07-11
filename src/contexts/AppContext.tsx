import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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

interface Cita {
  id: string;
  mascota: string;
  especie: string;
  fecha: Date;
  estado: string;
  veterinario: string;
  motivo: string;
  ubicacion: string;
  precio: number;
  notas?: string;
  comprobantePago?: string;
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
  email: string;
  rol: "admin" | "cliente" | "veterinario";
  telefono?: string;
  password?: string;
  fechaRegistro?: Date;
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
    | "control"
    | "cirugia"
    | "diagnostico";
  motivo: string;
  diagnostico: string;
  tratamiento: string;
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

interface AppContextType {
  // User state
  user: Usuario | null;
  setUser: (user: Usuario | null) => void;
  logout: () => void;
  isAuthenticated: boolean;

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

  // Authentication helpers
  login: (email: string, password: string) => Promise<Usuario | null>;
  register: (
    userData: Omit<Usuario, "id" | "fechaRegistro"> & { password: string },
  ) => Promise<Usuario | null>;

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
  // Clear any existing fictional data on first load
  useEffect(() => {
    const shouldClearData = localStorage.getItem("fictional_data_cleared");
    if (!shouldClearData) {
      localStorage.removeItem("mascotas");
      localStorage.removeItem("citas");
      localStorage.removeItem("preCitas");
      localStorage.removeItem("historialClinico");
      localStorage.removeItem("suscriptoresNewsletter");
      localStorage.removeItem("newsletterEmails");
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
        // Convert date strings back to Date objects
        return parsedCitas.map((cita: any) => ({
          ...cita,
          fecha: new Date(cita.fecha),
        }));
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
          fechaPreferida: new Date(preCita.fechaPreferida),
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

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    localStorage.setItem("mascotas", JSON.stringify(mascotas));
  }, [mascotas]);

  useEffect(() => {
    localStorage.setItem("citas", JSON.stringify(citas));
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
    email: string,
    password: string,
  ): Promise<Usuario | null> => {
    // Find user by email
    const existingUser = usuarios.find((u) => u.email === email);

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

    // Create new user
    const newUser: Usuario = {
      id: Date.now().toString(),
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol,
      telefono: userData.telefono,
      fechaRegistro: new Date(),
    };

    setUsuarios((prev) => [...prev, newUser]);
    setUserState(newUser);
    return newUser;
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

  // Mascota functions
  const addMascota = (
    mascotaData: Omit<
      Mascota,
      "id" | "estado" | "clienteId" | "proximaCita" | "ultimaVacuna" | "foto"
    >,
  ) => {
    const newMascota: Mascota = {
      ...mascotaData,
      id: Date.now().toString(),
      fechaNacimiento: new Date(mascotaData.fechaNacimiento), // Ensure fecha is a Date object
      estado: "Activo",
      clienteId: user?.id || "", // Associate with current user
      proximaCita: null,
      ultimaVacuna: null,
      foto: null,
    };
    setMascotas((prev) => [...prev, newMascota]);
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

  // Cita functions
  const addCita = (citaData: Omit<Cita, "id">) => {
    const newCita: Cita = {
      ...citaData,
      id: Date.now().toString(),
      fecha: new Date(citaData.fecha), // Ensure fecha is a Date object
    };
    setCitas((prev) => [...prev, newCita]);

    // Update mascota's proximaCita if it's a future appointment
    if (new Date(citaData.fecha) > new Date()) {
      const mascota = mascotas.find((m) => m.nombre === citaData.mascota);
      if (mascota) {
        updateMascota(mascota.id, { proximaCita: new Date(citaData.fecha) });
      }
    }
  };

  const updateCita = (id: string, updates: Partial<Cita>) => {
    const processedUpdates = {
      ...updates,
      ...(updates.fecha && { fecha: new Date(updates.fecha) }),
    };
    setCitas((prev) =>
      prev.map((cita) =>
        cita.id === id ? { ...cita, ...processedUpdates } : cita,
      ),
    );
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

  // Pre-cita functions
  const addPreCita = (
    preCitaData: Omit<PreCita, "id" | "estado" | "fechaCreacion">,
  ) => {
    const newPreCita: PreCita = {
      ...preCitaData,
      id: Date.now().toString(),
      estado: "pendiente",
      fechaCreacion: new Date(),
      fechaPreferida: new Date(preCitaData.fechaPreferida),
    };
    setPreCitas((prev) => [...prev, newPreCita]);
  };

  const updatePreCita = (id: string, updates: Partial<PreCita>) => {
    const processedUpdates = {
      ...updates,
      ...(updates.fechaPreferida && {
        fechaPreferida: new Date(updates.fechaPreferida),
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
    usuarios,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    mascotas,
    addMascota,
    updateMascota,
    deleteMascota,
    fixOrphanedPets,
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
    login,
    register,
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
