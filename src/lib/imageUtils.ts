// Utility functions for image compression and optimization

export interface CompressedImage {
  data: string; // base64
  originalName: string;
  size: number;
  type: string;
  compressed: boolean;
}

/**
 * Comprime una imagen para optimizar el almacenamiento en localStorage
 * @param file - Archivo de imagen a comprimir
 * @param maxSize - Tamaño máximo en bytes (default: 500KB)
 * @param quality - Calidad de compresión 0-1 (default: 0.7)
 * @returns Promise con la imagen comprimida en base64
 */
export const compressImage = async (
  file: File,
  maxSize: number = 500 * 1024, // 500KB
  quality: number = 0.7,
): Promise<CompressedImage> => {
  return new Promise((resolve, reject) => {
    // Si no es una imagen, convertir a base64 directamente
    if (!file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve({
          data: result,
          originalName: file.name,
          size: result.length,
          type: file.type,
          compressed: false,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("No se pudo crear el contexto del canvas"));
      return;
    }

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      const maxWidth = 1200;
      const maxHeight = 1200;

      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Configurar canvas
      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Comprimir iterativamente hasta alcanzar el tamaño deseado
      let currentQuality = quality;
      let compressedData: string;

      const compress = () => {
        compressedData = canvas.toDataURL("image/jpeg", currentQuality);

        // Si es suficientemente pequeño o la calidad es muy baja, usar resultado
        if (compressedData.length <= maxSize || currentQuality <= 0.1) {
          resolve({
            data: compressedData,
            originalName: file.name,
            size: compressedData.length,
            type: "image/jpeg",
            compressed: true,
          });
          return;
        }

        // Reducir calidad y intentar de nuevo
        currentQuality -= 0.1;
        compress();
      };

      compress();
    };

    img.onerror = () => reject(new Error("Error al cargar la imagen"));

    // Cargar imagen
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Convierte una imagen comprimida de vuelta a un Blob
 */
export const base64ToBlob = (
  base64Data: string,
  contentType: string = "",
): Blob => {
  const byteCharacters = atob(base64Data.split(",")[1]);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

/**
 * Valida el tamaño total del localStorage y libera espacio si es necesario
 */
export const optimizeStorageSpace = (): void => {
  try {
    let totalSize = 0;
    const items: Array<[string, number]> = [];

    // Calcular uso actual
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = localStorage[key].length;
        totalSize += size;
        items.push([key, size]);
      }
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const usagePercent = (totalSize / maxSize) * 100;

    console.log(
      `[STORAGE] LocalStorage: ${usagePercent.toFixed(1)}% usado (${(totalSize / 1024).toFixed(1)}KB)`,
    );

    // Si supera el 80%, limpiar comprobantes antiguos
    if (totalSize > maxSize * 0.8) {
      console.warn(
        "[WARNING] LocalStorage cerca del límite, limpiando comprobantes antiguos...",
      );

      // Limpiar comprobantes más antiguos primero
      const comprobantesKeys = Object.keys(localStorage).filter(
        (key) => key.startsWith("comprobante_") || key.startsWith("receipt_"),
      );

      // Ordenar por timestamp (los más antiguos primero)
      comprobantesKeys.sort((a, b) => {
        const timestampA = extractTimestamp(a);
        const timestampB = extractTimestamp(b);
        return timestampA - timestampB;
      });

      // Eliminar hasta liberar al menos 1MB
      let freedSpace = 0;
      const targetFree = 1024 * 1024; // 1MB

      for (const key of comprobantesKeys) {
        if (freedSpace >= targetFree) break;

        freedSpace += localStorage[key].length;
        localStorage.removeItem(key);
      }

      console.log(`[FREED] Liberado ${(freedSpace / 1024).toFixed(1)}KB de espacio`);
    }
  } catch (error) {
    console.error("[ERROR] Error optimizando localStorage:", error);
  }
};

/**
 * Extrae el timestamp de una clave de localStorage
 */
const extractTimestamp = (key: string): number => {
  const match = key.match(/_(\d+)$/);
  return match ? parseInt(match[1]) : 0;
};

/**
 * Calcula el tamaño de un objeto en bytes cuando se serializa a JSON
 */
export const calculateObjectSize = (obj: any): number => {
  return new Blob([JSON.stringify(obj)]).size;
};
