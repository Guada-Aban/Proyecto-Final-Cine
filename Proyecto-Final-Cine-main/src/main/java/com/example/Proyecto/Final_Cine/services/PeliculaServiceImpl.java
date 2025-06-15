package com.example.Proyecto.Final_Cine.services;

import com.example.Proyecto.Final_Cine.entities.Pelicula;
import com.example.Proyecto.Final_Cine.repositories.BaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PeliculaServiceImpl extends BaseServiceImpl<Pelicula, Long> implements PeliculaService {
    @Autowired
    public PeliculaServiceImpl(BaseRepository<Pelicula, Long> baseRepository) {
        super(baseRepository);
    }
}
