import type {
  Cita,
  Mascota,
  Usuario,
  HistorialClinico,
} from "@/contexts/AppContext";

export interface EnhancedCita extends Cita {
  mascotaData?: Mascota;
  propietarioData?: Usuario;
  urgencyLevel?: "alta" | "media" | "baja";
  hasHistorial?: boolean;
  ultimaConsulta?: Date;
}

export interface CitaRelationData {
  cita: Cita;
  mascota: Mascota | null;
  propietario: Usuario | null;
  urgencyLevel: "alta" | "media" | "baja";
  hasHistorial: boolean;
  ultimaConsulta: Date | null;
}

/**
 * Detecta el nivel de urgencia basado en el motivo de la consulta
 */
export function getUrgencyLevel(
  motivo: string,
  fecha: Date = new Date(),
): "alta" | "media" | "baja" {
  const motivoLower = motivo.toLowerCase();

  // Palabras clave para urgencia alta
  const urgentKeywords = [
    "emergencia",
    "urgente",
    "dolor",
    "sangre",
    "sangrado",
    "herida",
    "corte",
    "vómito",
    "vomita",
    "diarrea",
    "fractura",
    "accidente",
    "intoxicación",
    "veneno",
    "golpe",
    "caída",
    "dificultad respirar",
    "convulsión",
    "convulsiones",
    "coma",
    "inconsciente",
    "fiebre alta",
    "paralizado",
    "parálisis",
    "no come",
    "no bebe",
    "letárgico",
    "shock",
    "quemadura",
    "electrocución",
  ];

  // Palabras clave para urgencia media
  const moderateKeywords = [
    "malestar",
    "decaído",
    "triste",
    "poco apetito",
    "come poco",
    "picazón",
    "rasca",
    "inflamación",
    "hinchazón",
    "cojea",
    "cojeando",
    "tos",
    "estornuda",
    "ojos rojos",
    "legañas",
    "otitis",
    "oído",
    "diente",
    "dental",
    "uña",
    "garras",
  ];

  // Verificar urgencia alta
  if (urgentKeywords.some((keyword) => motivoLower.includes(keyword))) {
    return "alta";
  }

  // Verificar urgencia media
  if (moderateKeywords.some((keyword) => motivoLower.includes(keyword))) {
    return "media";
  }

  // Verificar si es cita próxima (menos de 24 horas)
  const hoursUntil =
    (fecha.getTime() - new Date().getTime()) / (1000 * 60 * 60);
  if (hoursUntil < 24 && hoursUntil > 0) {
    return "media";
  }

  return "baja";
}

/**
 * Busca una mascota por nombre (más tolerante a variaciones)
 */
export function findMascotaByName(
  nombre: string,
  mascotas: Mascota[],
): Mascota | null {
  if (!nombre || !mascotas.length) return null;

  // Búsqueda exacta primero
  let mascota = mascotas.find((m) => m.nombre === nombre);
  if (mascota) return mascota;

  // Búsqueda case-insensitive
  mascota = mascotas.find(
    (m) => m.nombre.toLowerCase() === nombre.toLowerCase(),
  );
  if (mascota) return mascota;

  // Búsqueda parcial (contiene)
  mascota = mascotas.find(
    (m) =>
      m.nombre.toLowerCase().includes(nombre.toLowerCase()) ||
      nombre.toLowerCase().includes(m.nombre.toLowerCase()),
  );

  return mascota || null;
}

/**
 * Obtiene información completa de una cita con todos los datos relacionados
 */
export function enhanceCita(
  cita: Cita,
  mascotas: Mascota[],
  usuarios: Usuario[],
  historialClinico: HistorialClinico[] = [],
): CitaRelationData {
  // Buscar mascota
  const mascota = findMascotaByName(cita.mascota, mascotas);

  // Buscar propietario
  const propietario = mascota
    ? usuarios.find((u) => u.id === mascota.clienteId) || null
    : null;

  // Calcular urgencia
  const urgencyLevel = getUrgencyLevel(cita.motivo, cita.fecha);

  // Verificar si tiene historial
  const hasHistorial = mascota
    ? historialClinico.some((h) => h.mascotaId === mascota.id)
    : false;

  // Obtener última consulta
  const ultimaConsulta = mascota
    ? historialClinico
        .filter((h) => h.mascotaId === mascota.id)
        .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())[0]?.fecha || null
    : null;

  return {
    cita,
    mascota,
    propietario,
    urgencyLevel,
    hasHistorial,
    ultimaConsulta,
  };
}

/**
 * Mejora múltiples citas con información relacionada
 */
export function enhanceMultipleCitas(
  citas: Cita[],
  mascotas: Mascota[],
  usuarios: Usuario[],
  historialClinico: HistorialClinico[] = [],
): CitaRelationData[] {
  return citas.map((cita) =>
    enhanceCita(cita, mascotas, usuarios, historialClinico),
  );
}

/**
 * Filtra citas por múltiples criterios mejorados
 */
export interface CitaFilter {
  propietarioId?: string;
  especie?: string;
  urgencia?: "alta" | "media" | "baja";
  estado?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  veterinario?: string;
  searchTerm?: string;
}

export function filterCitas(
  citasData: CitaRelationData[],
  filter: CitaFilter,
): CitaRelationData[] {
  return citasData.filter(({ cita, mascota, propietario, urgencyLevel }) => {
    // Filtro por propietario
    if (filter.propietarioId && filter.propietarioId !== "todos") {
      if (!propietario || propietario.id !== filter.propietarioId) {
        return false;
      }
    }

    // Filtro por especie
    if (filter.especie && filter.especie !== "todos") {
      if (!mascota || mascota.especie !== filter.especie) {
        return false;
      }
    }

    // Filtro por urgencia
    if (filter.urgencia && filter.urgencia !== "todos") {
      if (urgencyLevel !== filter.urgencia) {
        return false;
      }
    }

    // Filtro por estado
    if (filter.estado && filter.estado !== "todos") {
      if (cita.estado !== filter.estado) {
        return false;
      }
    }

    // Filtro por veterinario
    if (filter.veterinario && filter.veterinario !== "todos") {
      if (cita.veterinario !== filter.veterinario) {
        return false;
      }
    }

    // Filtro por rango de fechas
    if (filter.fechaDesde) {
      if (cita.fecha < filter.fechaDesde) {
        return false;
      }
    }

    if (filter.fechaHasta) {
      if (cita.fecha > filter.fechaHasta) {
        return false;
      }
    }

    // Filtro por término de búsqueda
    if (filter.searchTerm && filter.searchTerm.trim()) {
      const searchLower = filter.searchTerm.toLowerCase();
      const matchesCita =
        cita.mascota.toLowerCase().includes(searchLower) ||
        cita.motivo.toLowerCase().includes(searchLower);
      const matchesMascota =
        mascota &&
        (mascota.nombre.toLowerCase().includes(searchLower) ||
          mascota.especie.toLowerCase().includes(searchLower) ||
          (mascota.raza && mascota.raza.toLowerCase().includes(searchLower)));
      const matchesPropietario =
        propietario &&
        (propietario.nombre.toLowerCase().includes(searchLower) ||
          (propietario.telefono &&
            propietario.telefono.includes(filter.searchTerm)) ||
          (propietario.email &&
            propietario.email.toLowerCase().includes(searchLower)));

      if (!matchesCita && !matchesMascota && !matchesPropietario) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Ordena citas por diferentes criterios
 */
export type SortBy =
  | "fecha_desc"
  | "fecha_asc"
  | "urgencia"
  | "mascota"
  | "propietario";

export function sortCitas(
  citasData: CitaRelationData[],
  sortBy: SortBy,
): CitaRelationData[] {
  const sorted = [...citasData];

  switch (sortBy) {
    case "fecha_asc":
      return sorted.sort(
        (a, b) => a.cita.fecha.getTime() - b.cita.fecha.getTime(),
      );

    case "fecha_desc":
      return sorted.sort(
        (a, b) => b.cita.fecha.getTime() - a.cita.fecha.getTime(),
      );

    case "urgencia":
      const urgencyOrder = { alta: 3, media: 2, baja: 1 };
      return sorted.sort(
        (a, b) => urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel],
      );

    case "mascota":
      return sorted.sort((a, b) =>
        a.cita.mascota.localeCompare(b.cita.mascota),
      );

    case "propietario":
      return sorted.sort((a, b) => {
        const nameA = a.propietario?.nombre || "Z";
        const nameB = b.propietario?.nombre || "Z";
        return nameA.localeCompare(nameB);
      });

    default:
      return sorted;
  }
}

/**
 * Obtiene estadísticas mejoradas de citas
 */
export function getCitasStats(citasData: CitaRelationData[]) {
  const now = new Date();
  const today = now.toDateString();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const stats = {
    total: citasData.length,
    hoy: citasData.filter(({ cita }) => cita.fecha.toDateString() === today)
      .length,
    proximas: citasData.filter(
      ({ cita }) =>
        cita.fecha > now &&
        (cita.estado === "aceptada" || cita.estado === "en_validacion"),
    ).length,
    pendientes: citasData.filter(
      ({ cita }) =>
        cita.estado === "en_validacion" || cita.estado === "pendiente_pago",
    ).length,
    completadas: citasData.filter(({ cita }) => cita.estado === "atendida")
      .length,
    urgentes: citasData.filter(({ urgencyLevel }) => urgencyLevel === "alta")
      .length,
    proximaSemana: citasData.filter(
      ({ cita }) => cita.fecha > now && cita.fecha <= nextWeek,
    ).length,
    sinPropietario: citasData.filter(({ propietario }) => !propietario).length,
    especies: {} as Record<string, number>,
    propietariosUnicos: new Set(
      citasData.map(({ propietario }) => propietario?.id).filter(Boolean),
    ).size,
  };

  // Contar por especies
  citasData.forEach(({ mascota }) => {
    if (mascota?.especie) {
      stats.especies[mascota.especie] =
        (stats.especies[mascota.especie] || 0) + 1;
    }
  });

  return stats;
}

/**
 * Valida la integridad de los datos de citas
 */
export function validateCitaData(
  citas: Cita[],
  mascotas: Mascota[],
  usuarios: Usuario[],
): {
  valid: CitaRelationData[];
  invalid: Array<{ cita: Cita; issues: string[] }>;
} {
  const valid: CitaRelationData[] = [];
  const invalid: Array<{ cita: Cita; issues: string[] }> = [];

  citas.forEach((cita) => {
    const issues: string[] = [];
    const enhanced = enhanceCita(cita, mascotas, usuarios);

    if (!enhanced.mascota) {
      issues.push(`Mascota "${cita.mascota}" no encontrada`);
    }

    if (!enhanced.propietario) {
      issues.push(
        `Propietario no encontrado para la mascota "${cita.mascota}"`,
      );
    }

    if (enhanced.mascota && enhanced.propietario) {
      // Verificar que la mascota pertenezca al propietario correcto
      if (enhanced.mascota.clienteId !== enhanced.propietario.id) {
        issues.push(
          `Inconsistencia: mascota no pertenece al propietario indicado`,
        );
      }
    }

    if (issues.length > 0) {
      invalid.push({ cita, issues });
    } else {
      valid.push(enhanced);
    }
  });

  return { valid, invalid };
}
