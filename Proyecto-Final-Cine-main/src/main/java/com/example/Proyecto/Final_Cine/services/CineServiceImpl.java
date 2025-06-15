package com.example.Proyecto.Final_Cine.services;

import com.example.Proyecto.Final_Cine.entities.Cine;
import com.example.Proyecto.Final_Cine.repositories.BaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CineServiceImpl extends BaseServiceImpl <Cine, Long> implements CineService {
    @Autowired
    public CineServiceImpl(BaseRepository<Cine, Long> baseRepository) {
        super(baseRepository);
    }

    @Override
    public Cine update(Long id, Cine entity) throws Exception {
        try {
            Optional<Cine> cineOptional = baseRepository.findById(id);
            if (cineOptional.isPresent()) {
                Cine cineFromDb = cineOptional.get();
                cineFromDb.setNombre(entity.getNombre());
                cineFromDb.setDireccion(entity.getDireccion());
                // No toques empleados, salas ni películas aquí
                return baseRepository.save(cineFromDb);
            } else {
                throw new Exception("No se encontró el cine para actualizar");
            }
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }
}
