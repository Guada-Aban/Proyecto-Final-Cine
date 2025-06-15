package com.example.Proyecto.Final_Cine.services;

import com.example.Proyecto.Final_Cine.entities.Cine;
import com.example.Proyecto.Final_Cine.entities.Sala;
import com.example.Proyecto.Final_Cine.repositories.BaseRepository;
import com.example.Proyecto.Final_Cine.repositories.CineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;


@Service
public class SalaServiceImpl  extends BaseServiceImpl<Sala, Long> implements SalaService {
    @Autowired
    private CineRepository cineRepository;

    @Autowired
    public SalaServiceImpl(BaseRepository<Sala, Long> baseRepository, CineRepository cineRepository) {
        super(baseRepository);
        this.cineRepository = cineRepository;
    }

    @Override
    public Sala update(Long id, Sala entity) throws Exception {
        Optional<Sala> salaOptional = baseRepository.findById(id);
        if (salaOptional.isPresent()) {
            Sala salaFromDb = salaOptional.get();
            salaFromDb.setNumero(entity.getNumero());
            salaFromDb.setCapacidad(entity.getCapacidad());

            // Limpiar la relación anterior
            if (salaFromDb.getCine() != null) {
                salaFromDb.getCine().getSalas().remove(salaFromDb);
            }

            // Asignar el nuevo cine
            if (entity.getCine() != null && entity.getCine().getId() != null) {
                Cine nuevoCine = cineRepository.findById(entity.getCine().getId()).orElse(null);
                salaFromDb.setCine(nuevoCine);
                if (nuevoCine != null) {
                    if (nuevoCine.getSalas() == null) nuevoCine.setSalas(new ArrayList<>());
                    if (!nuevoCine.getSalas().contains(salaFromDb)) {
                        nuevoCine.getSalas().add(salaFromDb);
                    }
                }
            } else {
                salaFromDb.setCine(null);
            }

            return baseRepository.save(salaFromDb);
        } else {
            throw new Exception("No se encontró la sala para actualizar");
        }
    }
}
