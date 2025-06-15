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
@Table(name = "funcion")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Audited
public class Funcion extends Base{


    private String horario;

    @ManyToOne
    @JoinColumn(name = "sala_id", nullable = false) // Obligatorio (1..N)
    private Sala sala;

    @OneToMany(mappedBy = "funcion", cascade = CascadeType.PERSIST) // Sin orphanRemoval (rombo blanco)
    @JsonIgnore
    private List<Entrada> entradas;

    @ManyToOne
    @JoinColumn(name = "pelicula_id", nullable = false) // Obligatorio (1..N a 1)
    private Pelicula pelicula;

}
