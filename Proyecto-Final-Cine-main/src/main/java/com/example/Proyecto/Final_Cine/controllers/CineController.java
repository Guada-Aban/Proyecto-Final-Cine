package com.example.Proyecto.Final_Cine.controllers;

import com.example.Proyecto.Final_Cine.entities.Cine;
import com.example.Proyecto.Final_Cine.services.CineServiceImpl;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(path = "api/v1/cines")
public class CineController extends BaseControllerImpl<Cine, CineServiceImpl> {
    public CineController(CineServiceImpl servicio) {
        super(servicio);
    }
}
