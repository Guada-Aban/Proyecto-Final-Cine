package com.example.Proyecto.Final_Cine.controllers;

import com.example.Proyecto.Final_Cine.entities.Entrada;
import com.example.Proyecto.Final_Cine.services.EntradaServiceImpl;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(path = "api/v1/entradas")
public class EntradaController extends BaseControllerImpl<Entrada, EntradaServiceImpl> {
    public EntradaController(EntradaServiceImpl servicio) {
        super(servicio);
    }
}
