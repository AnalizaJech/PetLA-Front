// Seed de datos para la BD "petla"
// Ejecutable con mongosh. Idempotente mediante upserts.

/* eslint-disable */
(function () {
  const dbName = "petla";
  const dbp = db.getSiblingDB(dbName);

  // IDs fijos para relaciones
  const ownerId = ObjectId("66b4c0d0a1a1a1a1a1a1a1a1");
  const vetId = ObjectId("66b4c0d0b2b2b2b2b2b2b2b2");
  const adminId = ObjectId("66b4c0d0c3c3c3c3c3c3c3c3");
  const petId1 = ObjectId("66b4c0d0d4d4d4d4d4d4d4d4");
  const apptId1 = ObjectId("66b4c0d0e5e5e5e5e5e5e5e5");

  // Índices mínimos
  dbp.users.createIndex({ email: 1 }, { unique: true });
  dbp.users.createIndex({ username: 1 }, { unique: true, sparse: true });
  dbp.appointments.createIndex({ fecha: 1 });
  dbp.pets.createIndex({ clienteId: 1 });
  dbp.pets.createIndex({ nombre: 1 });
  dbp.appointments.createIndex({ estado: 1 });
  dbp.appointments.createIndex({ veterinarioId: 1 });

  // Usuarios (usando campos en español para compatibilidad con frontend)
  dbp.users.updateOne(
    { _id: ownerId },
    {
      $set: {
        _id: ownerId,
        nombre: "Laura Gómez",
        apellidos: "Propietaria",
        email: "laura@example.com",
        username: "laura_gomez",
        telefono: "+34 666 123 456",
        rol: "cliente",
        fechaRegistro: new Date(),
        genero: "femenino",
        password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi" // password123
      },
    },
    { upsert: true }
  );

  dbp.users.updateOne(
    { _id: vetId },
    {
      $set: {
        _id: vetId,
        nombre: "Carlos",
        apellidos: "Pérez Rodríguez",
        email: "carlos.vet@example.com",
        username: "dr_carlos",
        telefono: "+34 666 789 012",
        rol: "veterinario",
        especialidad: "Medicina general",
        experiencia: "5 años",
        colegiatura: "CV-12345",
        fechaRegistro: new Date(),
        genero: "masculino",
        password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi" // password123
      },
    },
    { upsert: true }
  );

  dbp.users.updateOne(
    { _id: adminId },
    {
      $set: {
        _id: adminId,
        nombre: "Admin",
        apellidos: "Sistema",
        email: "admin@example.com",
        username: "admin",
        telefono: "+34 666 000 000",
        rol: "admin",
        fechaRegistro: new Date(),
        genero: "otro",
        password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi" // password123
      },
    },
    { upsert: true }
  );

  // Mascotas (usando campos en español para compatibilidad con frontend)
  dbp.pets.updateOne(
    { _id: petId1 },
    {
      $set: {
        _id: petId1,
        clienteId: ownerId.toString(),
        nombre: "Max",
        especie: "Perro",
        raza: "Labrador",
        fechaNacimiento: new Date("2021-05-12"),
        peso: 25.5,
        genero: "macho",
        color: "dorado",
        notas: "Vacunado y desparasitado. Muy activo y juguetón.",
        foto: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/...", // placeholder
        fechaRegistro: new Date(),
        estado: "activo"
      },
    },
    { upsert: true }
  );

  // Citas (usando campos en español para compatibilidad con frontend)
  dbp.appointments.updateOne(
    { _id: apptId1 },
    {
      $set: {
        _id: apptId1,
        mascotaId: petId1.toString(),
        clienteId: ownerId.toString(),
        veterinarioId: vetId.toString(),
        fecha: new Date(Date.now() + 24 * 3600 * 1000), // mañana
        hora: "10:00",
        estado: "programada",
        motivo: "Chequeo general",
        notas: "Primera visita. Revisar historial de vacunas.",
        precio: 45.00,
        tipoCita: "consulta",
        fechaCreacion: new Date(),
        duracionEstimada: 30
      },
    },
    { upsert: true }
  );

  printjson({
    seeded: true,
    collections: {
      users: dbp.users.countDocuments(),
      pets: dbp.pets.countDocuments(),
      appointments: dbp.appointments.countDocuments(),
    },
  });
})();
