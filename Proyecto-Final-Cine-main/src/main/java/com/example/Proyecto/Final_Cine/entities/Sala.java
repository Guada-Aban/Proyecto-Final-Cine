package com.example.Proyecto.Final_Cine.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIncludeProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.util.List;

@Entity
@Table(name = "Sala")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Audited
@JsonIgnoreProperties("funciones")
public class Sala extends Base{
    @Column(name="numero")
    private int numero;

    @Column(name="capacidad")
    private int capacidad;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cine_id", nullable = false)
    private Cine cine;

    @OneToMany(mappedBy = "sala", cascade = CascadeType.PERSIST) // Sin orphanRemoval
    private List<Funcion> funciones;
}
