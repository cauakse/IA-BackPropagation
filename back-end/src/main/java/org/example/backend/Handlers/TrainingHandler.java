package org.example.backend.Handlers;

import org.example.backend.Service.Treinamento;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class TrainingHandler extends TextWebSocketHandler {

    @Autowired
    Treinamento treinamento;

    private List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session){
        sessions.add(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();
        switch (payload){
            case "start":
                treinamento.initializeTraining();
                break;
            default:
                session.sendMessage(new TextMessage("Unknown command: " + payload));
        }
    }

    public void sendProgress(String data) throws IOException{
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(data));
            }
        }
    }
}
