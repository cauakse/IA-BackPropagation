package org.example.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class Treinamento {
    @Autowired
    ConfigurateInitial configurateInitial;

    public boolean initializeTraining(){
        if (configurateInitial.isConfigured()){
            //iniciar o treinamento
        }
        return true;
    }
}
