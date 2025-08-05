import type {
  Cita,
  Mascota,
  Usuario,
  HistorialClinico,
} from "@/contexts/AppContext";

// Import types for compatibility
import type { ComprobanteData } from "@/lib/types";

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

  // Limpiar y normalizar el nombre
  const nombreNormalizado = nombre.trim();

  // Búsqueda exacta primero
  let mascota = mascotas.find((m) => m.nombre === nombreNormalizado);
  if (mascota) return mascota;

  // Búsqueda case-insensitive
  mascota = mascotas.find(
    (m) => m.nombre.toLowerCase() === nombreNormalizado.toLowerCase(),
  );
  if (mascota) return mascota;

  // Búsqueda parcial (contiene)
  mascota = mascotas.find(
    (m) =>
      m.nombre.toLowerCase().includes(nombreNormalizado.toLowerCase()) ||
      nombreNormalizado.toLowerCase().includes(m.nombre.toLowerCase()),
  );

  return mascota || null;
}

/**
 * Busca un propietario para una mascota dada
 */
export function findPropietarioForMascota(
  mascota: Mascota | null,
  usuarios: Usuario[],
): Usuario | null {
  if (!mascota) return null;

  // Buscar por clienteId exacto
  let propietario = usuarios.find((u) => u.id === mascota.clienteId);
  if (propietario) return propietario;

  // Si no tiene clienteId válido, intentar encontrar por otros medios
  if (!mascota.clienteId || !usuarios.find(u => u.id === mascota.clienteId)) {
    // Por ahora retornamos null, pero se podría implementar lógica adicional
    console.warn(`Mascota "${mascota.nombre}" no tiene propietario válido asignado`);
    return null;
  }

  return null;
}

/**
 * Repara datos de mascotas sin propietario asignado
 */
export function repairOrphanedPets(
  mascotas: Mascota[],
  usuarios: Usuario[],
  citas: Cita[],
): {
  repairedPets: Mascota[];
  unrepairedPets: Mascota[];
  suggestedMatches: Array<{ mascota: Mascota; posiblesPropietarios: Usuario[] }>;
} {
  const repairedPets: Mascota[] = [];
  const unrepairedPets: Mascota[] = [];
  const suggestedMatches: Array<{ mascota: Mascota; posiblesPropietarios: Usuario[] }> = [];

  mascotas.forEach(mascota => {
    // Verificar si la mascota tiene un propietario válido
    const propietarioActual = usuarios.find(u => u.id === mascota.clienteId);

    if (!propietarioActual) {
      // Buscar citas de esta mascota para inferir el propietario
      const citasDeMascota = citas.filter(c =>
        c.mascota === mascota.nombre ||
        c.mascota.toLowerCase() === mascota.nombre.toLowerCase()
      );

      if (citasDeMascota.length > 0) {
        // Intentar encontrar un patrón en las citas para determinar el propietario
        const clientesEnCitas = usuarios.filter(u => u.rol === 'cliente');

        // Buscar clientes que podrían ser propietarios de esta mascota
        const posiblesPropietarios = clientesEnCitas.filter(cliente => {
          // Verificar si tienen otras mascotas de la misma especie
          const mascotasDelCliente = mascotas.filter(m => m.clienteId === cliente.id);
          return mascotasDelCliente.some(m => m.especie === mascota.especie);
        });

        if (posiblesPropietarios.length === 1) {
          // Si hay exactamente un candidato, asignarlo automáticamente
          const nuevaMascota = { ...mascota, clienteId: posiblesPropietarios[0].id };
          repairedPets.push(nuevaMascota);
        } else if (posiblesPropietarios.length > 1) {
          // Si hay múltiples candidatos, sugerir opciones
          suggestedMatches.push({ mascota, posiblesPropietarios });
          unrepairedPets.push(mascota);
        } else {
          unrepairedPets.push(mascota);
        }
      } else {
        unrepairedPets.push(mascota);
      }
    }
  });

  return { repairedPets, unrepairedPets, suggestedMatches };
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

  // Buscar propietario con lógica mejorada
  const propietario = findPropietarioForMascota(mascota, usuarios);

  // Si no encontramos propietario, intentar búsqueda alternativa
  let propietarioFinal = propietario;
  if (!propietarioFinal && mascota) {
    // Buscar cualquier cliente que tenga mascotas (fallback)
    const clientesConMascotas = usuarios.filter(u =>
      u.rol === 'cliente' &&
      mascotas.some(m => m.clienteId === u.id && m.especie === mascota.especie)
    );

    if (clientesConMascotas.length > 0) {
      // Tomar el primer cliente encontrado como fallback temporal
      propietarioFinal = clientesConMascotas[0];
      console.warn(`Asignando propietario temporal a mascota ${mascota.nombre}: ${propietarioFinal.nombre}`);
    }
  }

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
    propietario: propietarioFinal,
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
    sinMascota: citasData.filter(({ mascota }) => !mascota).length,
    problemasData: citasData.filter(({ mascota, propietario }) => !mascota || !propietario).length,
    especies: {} as Record<string, number>,
    propietariosUnicos: new Set(
      citasData.map(({ propietario }) => propietario?.id).filter(Boolean),
    ).size,
    mascotasUnicas: new Set(
      citasData.map(({ mascota }) => mascota?.id).filter(Boolean),
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
 * Valida la integridad de los datos de citas con lógica mejorada
 */
export function validateCitaData(
  citas: Cita[],
  mascotas: Mascota[],
  usuarios: Usuario[],
): {
  valid: CitaRelationData[];
  invalid: Array<{ cita: Cita; issues: string[] }>;
  fixable: Array<{ cita: Cita; issues: string[]; suggestedFix: string }>;
} {
  const valid: CitaRelationData[] = [];
  const invalid: Array<{ cita: Cita; issues: string[] }> = [];
  const fixable: Array<{ cita: Cita; issues: string[]; suggestedFix: string }> = [];

  citas.forEach((cita) => {
    const issues: string[] = [];
    const enhanced = enhanceCita(cita, mascotas, usuarios);

    if (!enhanced.mascota) {
      issues.push(`Mascota "${cita.mascota}" no encontrada en el sistema`);
      // Sugerir crear la mascota
      fixable.push({
        cita,
        issues: [...issues],
        suggestedFix: `Crear mascota "${cita.mascota}" de especie "${cita.especie}"`
      });
    } else if (!enhanced.propietario) {
      issues.push(
        `Propietario no encontrado para la mascota "${cita.mascota}"`,
      );
      // Sugerir asignar propietario
      const clientesDisponibles = usuarios.filter(u => u.rol === 'cliente');
      if (clientesDisponibles.length > 0) {
        fixable.push({
          cita,
          issues: [...issues],
          suggestedFix: `Asignar propietario a la mascota (${clientesDisponibles.length} clientes disponibles)`
        });
      }
    } else {
      // Verificar que la mascota pertenezca al propietario correcto
      if (enhanced.mascota.clienteId !== enhanced.propietario.id) {
        issues.push(
          `Inconsistencia: mascota no pertenece al propietario indicado`,
        );
        fixable.push({
          cita,
          issues: [...issues],
          suggestedFix: `Actualizar clienteId de la mascota a "${enhanced.propietario.id}"`
        });
      } else {
        // Todo está correcto
        valid.push(enhanced);
      }
    }

    if (issues.length > 0 && !fixable.some(f => f.cita.id === cita.id)) {
      invalid.push({ cita, issues });
    }
  });

  return { valid, invalid, fixable };
}

/**
 * Aplica correcciones automáticas a los datos
 */
export function autoFixCitaData(
  citas: Cita[],
  mascotas: Mascota[],
  usuarios: Usuario[],
): {
  fixedCitas: Cita[];
  fixedMascotas: Mascota[];
  newMascotas: Mascota[];
  errors: string[];
} {
  const fixedCitas: Cita[] = [];
  const fixedMascotas: Mascota[] = [...mascotas];
  const newMascotas: Mascota[] = [];
  const errors: string[] = [];

  const clientesDisponibles = usuarios.filter(u => u.rol === 'cliente');

  citas.forEach(cita => {
    let mascota = findMascotaByName(cita.mascota, fixedMascotas);

    // Si no existe la mascota, crearla
    if (!mascota) {
      if (clientesDisponibles.length > 0) {
        // Asignar al primer cliente disponible (en producción sería más sofisticado)
        const clienteAsignado = clientesDisponibles[0];

        const nuevaMascota: Mascota = {
          id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          nombre: cita.mascota,
          especie: cita.especie || 'No especificado',
          raza: 'Por determinar',
          sexo: 'No especificado',
          fechaNacimiento: new Date(2020, 0, 1), // Fecha por defecto
          peso: undefined,
          microchip: undefined,
          estado: 'Activo',
          clienteId: clienteAsignado.id,
          proximaCita: cita.fecha,
          ultimaVacuna: null,
          foto: null
        };

        newMascotas.push(nuevaMascota);
        fixedMascotas.push(nuevaMascota);
        mascota = nuevaMascota;

        console.log(`✅ Mascota creada automáticamente: ${nuevaMascota.nombre} asignada a ${clienteAsignado.nombre}`);
      } else {
        errors.push(`No se pudo crear mascota "${cita.mascota}" - no hay clientes disponibles`);
      }
    }

    // Verificar y corregir propietario de la mascota
    if (mascota) {
      const propietario = usuarios.find(u => u.id === mascota.clienteId);
      if (!propietario) {
        if (clientesDisponibles.length > 0) {
          // Asignar al primer cliente disponible
          const clienteAsignado = clientesDisponibles[0];
          const mascotaIndex = fixedMascotas.findIndex(m => m.id === mascota!.id);
          if (mascotaIndex !== -1) {
            fixedMascotas[mascotaIndex] = {
              ...fixedMascotas[mascotaIndex],
              clienteId: clienteAsignado.id
            };
            console.log(`✅ Propietario asignado a ${mascota.nombre}: ${clienteAsignado.nombre}`);
          }
        } else {
          errors.push(`No se pudo asignar propietario a mascota "${mascota.nombre}" - no hay clientes disponibles`);
        }
      }
    }

    fixedCitas.push(cita);
  });

  return {
    fixedCitas,
    fixedMascotas,
    newMascotas,
    errors
  };
}
