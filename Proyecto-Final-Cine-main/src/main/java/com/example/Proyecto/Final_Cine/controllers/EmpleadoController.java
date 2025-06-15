package com.example.Proyecto.Final_Cine.controllers;

import com.example.Proyecto.Final_Cine.entities.Empleado;
import com.example.Proyecto.Final_Cine.services.EmpleadoServiceImpl;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@CrossOrigin(origins = "*")
@RequestMapping(path = "api/v1/Empleados")
public class EmpleadoController extends BaseControllerImpl<Empleado, EmpleadoServiceImpl> {
    public EmpleadoController(EmpleadoServiceImpl servicio) {
        super(servicio);
    }
}
