package com.example.Proyecto.Final_Cine.entities;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.util.List;

@Entity
@Table(name = "Empleado")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Audited
public class Empleado extends Base{
    @Column(name="nombre")
    private String nombre;
    @Column(name="dni")
    private int dni;

    @ManyToMany(mappedBy = "empleados")
    private List<Cine> cines;
}
