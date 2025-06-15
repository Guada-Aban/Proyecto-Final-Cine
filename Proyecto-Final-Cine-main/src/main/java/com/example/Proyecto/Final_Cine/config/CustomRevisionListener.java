package com.example.Proyecto.Final_Cine.config;

import com.example.Proyecto.Final_Cine.entities.audit.Revision;
import org.hibernate.envers.RevisionListener;

public class CustomRevisionListener implements RevisionListener {
    public void newRevision(Object revisionEntity) {final Revision revision = (Revision) revisionEntity;}
}
