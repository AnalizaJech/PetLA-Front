// Script para limpiar completamente localStorage de datos ficticios
// Ejecutar en la consola del navegador: fetch('/clear-storage.js').then(r=>r.text()).then(eval)

console.log("🧹 Limpiando datos ficticios...");

// Limpiar datos específicos de la aplicación
localStorage.removeItem("mascotas");
localStorage.removeItem("citas");
localStorage.removeItem("preCitas");
localStorage.removeItem("historialClinico");
localStorage.removeItem("usuarios");

// Marcar que se limpiaron los datos ficticios
localStorage.setItem("fictional_data_cleared", "true");

console.log("✅ Datos ficticios eliminados exitosamente");
console.log("🔄 Recarga la página para ver los cambios");

// Opcional: recargar automáticamente
if (confirm("¿Quieres recargar la página para aplicar los cambios?")) {
  window.location.reload();
}
