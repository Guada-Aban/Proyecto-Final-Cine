package com.example.Proyecto.Final_Cine.services;

import com.example.Proyecto.Final_Cine.entities.Funcion;
import com.example.Proyecto.Final_Cine.repositories.BaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FuncionServiceImpl extends BaseServiceImpl<Funcion, Long> implements FuncionService {
    @Autowired
    public FuncionServiceImpl(BaseRepository<Funcion, Long> baseRepository) {
        super(baseRepository);
    }
}
