package com.example.Proyecto.Final_Cine.controllers;


import com.example.Proyecto.Final_Cine.entities.Funcion;
import com.example.Proyecto.Final_Cine.services.FuncionServiceImpl;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(path = "api/v1/funciones")
public class FuncionController extends BaseControllerImpl <Funcion, FuncionServiceImpl> {
    public FuncionController(FuncionServiceImpl servicio) {
        super(servicio);
    }
}
