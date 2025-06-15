package com.example.Proyecto.Final_Cine.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.util.List;

@Entity
@Table(name = "Cine")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Audited
public class Cine extends Base {
    @Column(name="nombre")
    private String nombre;
    @Column(name="direccion")
    private String direccion;

    @ManyToMany
    @JoinTable(
            name = "empleado_cine", // Nombre de la tabla de unión
            joinColumns = @JoinColumn(name = "cine_id"), // FK de Cine
            inverseJoinColumns = @JoinColumn(name = "empleado_id") // FK de Empleado
    )
    @JsonIgnore
    private List<Empleado> empleados;

    @OneToMany(mappedBy = "cine", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Sala> salas;

    @OneToMany(mappedBy = "cine", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Pelicula> peliculas;

}
