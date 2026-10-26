package com.sistemadesubastas.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuración del broker STOMP sobre WebSocket.
 *
 * Canales:
 *  - /topic/subastas/{id}/pujas   → broadcast de nuevas pujas (público por subasta)
 *  - /topic/subastas/{id}/estado  → cambio de estado de la subasta (broadcast)
 *  - /queue/notificaciones        → notificaciones personales (por usuario)
 *
 * El frontend se conecta a: ws://localhost:8080/ws
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                // Origenes permitidos (React dev servers)
                .setAllowedOriginPatterns("http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:*")
                // SockJS como fallback para navegadores que no soportan WebSocket nativo
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefijo para mensajes que el servidor envía a los clientes
        registry.enableSimpleBroker("/topic", "/queue");

        // Prefijo para mensajes que el cliente envía al servidor (si usa @MessageMapping)
        registry.setApplicationDestinationPrefixes("/app");

        // Prefijo para mensajes dirigidos a un usuario específico (/queue/notificaciones)
        registry.setUserDestinationPrefix("/user");
    }
}
