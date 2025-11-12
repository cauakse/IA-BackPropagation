package org.example.backend.Service;

import org.example.backend.Handlers.TrainingHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class Treinamento {
    @Autowired
    ConfigurateInitial configurateInitial;

    @Autowired
    @Lazy
    TrainingHandler trainingHandler;

    public boolean initializeTraining() throws IOException {
        if (configurateInitial.isConfigured()){
            trainingHandler.sendProgress("Training started");
        } else {
            return false;
        }
        return true;
    }
}
