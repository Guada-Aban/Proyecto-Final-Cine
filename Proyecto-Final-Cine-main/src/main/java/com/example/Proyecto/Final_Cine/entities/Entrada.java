package com.example.Proyecto.Final_Cine.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;

@Entity
@Table(name = "entrada")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Audited
public class Entrada extends Base{

    @Column(name="precio")
    private int precio;

    @Column(name="asiento")
    private String asiento;

    @ManyToOne
    @JoinColumn(name = "funcion_id", nullable = false) // Obligatorio (1..N)
    private Funcion funcion;
}

