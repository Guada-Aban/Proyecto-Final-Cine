package com.example.Proyecto.Final_Cine.services;

import com.example.Proyecto.Final_Cine.entities.Cine;
import com.example.Proyecto.Final_Cine.entities.Empleado;
import com.example.Proyecto.Final_Cine.repositories.BaseRepository;
import com.example.Proyecto.Final_Cine.repositories.CineRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmpleadoServiceImpl extends BaseServiceImpl <Empleado, Long> implements EmpleadoService {
    @Autowired
    private CineRepository cineRepository;

    @Autowired
    public EmpleadoServiceImpl(BaseRepository<Empleado, Long> baseRepository) {
        super(baseRepository);
    }

    @Override
    public Empleado save(Empleado entity) throws Exception {
        System.out.println("Cines recibidos: " + entity.getCines());
        if (entity.getCines() != null && !entity.getCines().isEmpty()) {
            List<Cine> cines = entity.getCines().stream()
                    .map(c -> cineRepository.findById(c.getId()).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            entity.setCines(cines);

            // ACTUALIZA EL LADO PROPIETARIO
            for (Cine cine : cines) {
                if (cine.getEmpleados() == null) cine.setEmpleados(new java.util.ArrayList<>());
                if (!cine.getEmpleados().contains(entity)) {
                    cine.getEmpleados().add(entity);
                }
            }
        }
        return super.save(entity);
    }

    @Override
    public Empleado update(Long id, Empleado entity) throws Exception {
        Optional<Empleado> empleadoOptional = baseRepository.findById(id);
        if (empleadoOptional.isPresent()) {
            Empleado empleadoFromDb = empleadoOptional.get();
            empleadoFromDb.setNombre(entity.getNombre());
            empleadoFromDb.setDni(entity.getDni());

            // Limpiar la relación anterior en ambos lados
            if (empleadoFromDb.getCines() != null) {
                for (Cine cine : empleadoFromDb.getCines()) {
                    cine.getEmpleados().remove(empleadoFromDb);
                }
            }

            // Asignar la nueva lista de cines
            List<Cine> nuevosCines = new java.util.ArrayList<>();
            if (entity.getCines() != null) {
                nuevosCines = entity.getCines().stream()
                        .map(c -> cineRepository.findById(c.getId()).orElse(null))
                        .filter(java.util.Objects::nonNull)
                        .collect(Collectors.toList());

                // Agregar el empleado a la lista de empleados de cada cine nuevo
                for (Cine cine : nuevosCines) {
                    if (cine.getEmpleados() == null) cine.setEmpleados(new java.util.ArrayList<>());
                    if (!cine.getEmpleados().contains(empleadoFromDb)) {
                        cine.getEmpleados().add(empleadoFromDb);
                    }
                }
            }

            empleadoFromDb.setCines(nuevosCines);

            return baseRepository.save(empleadoFromDb);
        } else {
            throw new Exception("No se encontró el empleado para actualizar");
        }
    }

    @Override
    @Transactional
    public boolean delete(Long id) throws Exception {
        try {
            Optional<Empleado> empleadoOptional = baseRepository.findById(id);
            if (empleadoOptional.isPresent()) {
                Empleado empleado = empleadoOptional.get();

                // Limpiar la relación en ambos lados
                if (empleado.getCines() != null && !empleado.getCines().isEmpty()) {
                    for (Cine cine : empleado.getCines()) {
                        cine.getEmpleados().remove(empleado); // Quita el empleado de cada cine
                    }
                    empleado.getCines().clear(); // Quita todos los cines del empleado
                    baseRepository.save(empleado); // Guarda el cambio en la tabla intermedia
                }

                baseRepository.deleteById(id); // Ahora sí elimina el empleado
                return true;
            } else {
                throw new Exception("No se encontró el empleado para eliminar");
            }
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }
}
