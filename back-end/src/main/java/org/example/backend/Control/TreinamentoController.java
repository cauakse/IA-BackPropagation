package org.example.backend.Control;

// package org.example.backend.Control;

import org.example.backend.Service.Treinamento;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class TreinamentoController {

    private Treinamento getTreinamentoFromSession(SimpMessageHeaderAccessor headerAccessor) {
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        return (Treinamento) sessionAttributes.get("treinamento");
    }

    @MessageMapping("/start")
    public void startTraining(SimpMessageHeaderAccessor headerAccessor) throws Exception {
        Treinamento treinamento = getTreinamentoFromSession(headerAccessor);

        if (treinamento != null) {
            System.out.println("Starting training from STOMP...");
            treinamento.initializeTraining(headerAccessor);
        } else {
            System.err.println("ERRO: Treinamento não encontrado na sessão WebSocket!");
        }
    }

    @MessageMapping("/continue")
    public void continueTraining(SimpMessageHeaderAccessor headerAccessor) throws Exception {
        Treinamento treinamento = getTreinamentoFromSession(headerAccessor);
        if (treinamento != null) {
            treinamento.continueTraining(headerAccessor);
        }
    }

    @MessageMapping("/startTest")
    public void startTest(SimpMessageHeaderAccessor headerAccessor) throws Exception {
        Treinamento treinamento = getTreinamentoFromSession(headerAccessor);
        if (treinamento != null) {
            treinamento.startTesting(headerAccessor);
        }
    }

    @MessageMapping("/continue with learningRate reduce")
    public void continueTrainingWithLearningRateReduce(SimpMessageHeaderAccessor headerAccessor) throws Exception {
        Treinamento treinamento = getTreinamentoFromSession(headerAccessor);
        if (treinamento != null) {
            treinamento.continueTrainingWithLearningRateReduce(headerAccessor);
        }
    }
}
