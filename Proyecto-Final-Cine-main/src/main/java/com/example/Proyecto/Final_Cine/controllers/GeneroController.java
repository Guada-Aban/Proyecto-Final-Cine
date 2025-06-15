package com.example.Proyecto.Final_Cine.controllers;

import com.example.Proyecto.Final_Cine.entities.Genero;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/enums")
public class GeneroController  {

    @GetMapping("/genero")
    public Genero[] generos() {
        return Genero.values();
    }
}
