package com.example.Proyecto.Final_Cine.services;

import com.example.Proyecto.Final_Cine.entities.Entrada;
import com.example.Proyecto.Final_Cine.repositories.BaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EntradaServiceImpl extends BaseServiceImpl<Entrada, Long> implements EntradaService {
    @Autowired
    public EntradaServiceImpl(BaseRepository<Entrada, Long> baseRepository) {
        super(baseRepository);
    }
    
    @Override
    public Entrada update(Long id, Entrada entrada) throws Exception {
        Entrada existente = baseRepository.findById(id)
                .orElseThrow(() -> new Exception("Entrada no encontrada con id: " + id));
        // Actualiza solo los campos necesarios
        existente.setPrecio(entrada.getPrecio());
        existente.setAsiento(entrada.getAsiento());
        existente.setFuncion(entrada.getFuncion());
        // ...otros campos si los hay...
        return baseRepository.save(existente);
    }
}
