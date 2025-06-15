package com.example.Proyecto.Final_Cine.controllers;

import com.example.Proyecto.Final_Cine.entities.Sala;
import com.example.Proyecto.Final_Cine.services.SalaServiceImpl;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(path = "api/v1/salas")
public class SalaController extends BaseControllerImpl<Sala, SalaServiceImpl> {
    public SalaController(SalaServiceImpl servicio) {
        super(servicio);
    }
}
