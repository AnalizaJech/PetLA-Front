{/* Modales reutilizables */}
          <CitaDetailModal
            isOpen={isDetailModalOpen}
            onClose={closeDetailModal}
            selectedCita={selectedCita}
            onAttendCita={handleAttendCita}
          />

          <CitaAttendModal
            isOpen={isAttendModalOpen}
            onClose={() => setIsAttendModalOpen(false)}
            selectedCita={selectedCita}
            onSave={() => {
              // Los datos se actualizan automáticamente por el contexto
            }}
          />

        </div>
      </div>
    </Layout>
  );
}