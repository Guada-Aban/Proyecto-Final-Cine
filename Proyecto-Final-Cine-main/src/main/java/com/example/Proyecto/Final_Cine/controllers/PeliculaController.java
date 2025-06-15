package com.example.Proyecto.Final_Cine.controllers;

import com.example.Proyecto.Final_Cine.entities.Pelicula;
import com.example.Proyecto.Final_Cine.services.PeliculaServiceImpl;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(path = "api/v1/peliculass")
public class PeliculaController extends BaseControllerImpl<Pelicula, PeliculaServiceImpl> {
    public PeliculaController(PeliculaServiceImpl servicio) {
        super(servicio);
    }
}
