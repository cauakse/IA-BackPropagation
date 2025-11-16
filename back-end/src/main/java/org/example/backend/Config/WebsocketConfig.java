package org.example.backend.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker // Habilita o broker de mensagens
public class WebsocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private HttpHandshakeInterceptor handshakeInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Define prefixos para mensagens que voltam para o cliente (ex: dados de progresso)
        config.enableSimpleBroker("/topic");
        // Define o prefixo para mensagens que vêm do cliente (ex: "start")
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Este é o endpoint que o SockJS irá se conectar.
        // É o mesmo que você tinha antes (/training)
        registry.addEndpoint("/training")
                .setAllowedOrigins("http://localhost:3000") // Sua origem do Next.js
                .withSockJS()
                .setInterceptors(handshakeInterceptor); // <-- ISSO É MÁGICA. Habilita o SockJS.
    }
}
