package org.example.backend.Config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.HttpSession;
import java.util.Map;

@Component
public class HttpHandshakeInterceptor implements HandshakeInterceptor {

    private String getScopedBeanName(String beanName) {
        return "scopedTarget." + beanName;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {

        System.out.println("HTTP_INTERCEPTOR: Iniciando handshake...");

        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            HttpSession session = servletRequest.getServletRequest().getSession(false);

            if (session != null) {
                System.out.println("HTTP_INTERCEPTOR: Sessão HTTP encontrada: " + session.getId());

                Object realTreinamento = session.getAttribute(getScopedBeanName("treinamento"));
                if (realTreinamento != null) {
                    attributes.put("treinamento", realTreinamento);
                    System.out.println("HTTP_INTERCEPTOR: SUCESSO - Bean 'treinamento' copiado.");
                } else {
                    System.err.println("HTTP_INTERCEPTOR: FALHA - Bean 'treinamento' NÃO encontrado na sessão HTTP.");
                }

                Object realConfig = session.getAttribute(getScopedBeanName("configurateInitial"));
                if (realConfig != null) {
                    attributes.put("configurateInitial", realConfig);
                    System.out.println("HTTP_INTERCEPTOR: SUCESSO - Bean 'configurateInitial' copiado.");
                } else {
                    System.err.println("HTTP_INTERCEPTOR: FALHA - Bean 'configurateInitial' NÃO encontrado na sessão HTTP.");
                }

                Object realFileHolder = session.getAttribute(getScopedBeanName("fileHolder"));
                if (realFileHolder != null) {
                    attributes.put("fileHolder", realFileHolder);
                    System.out.println("HTTP_INTERCEPTOR: SUCESSO - Bean 'fileHolder' copiado.");
                } else {
                    System.err.println("HTTP_INTERCEPTOR: FALHA - Bean 'fileHolder' NÃO encontrado na sessão HTTP.");
                }

                Object realRede = session.getAttribute(getScopedBeanName("rede"));
                if (realRede != null) {
                    attributes.put("rede", realRede);
                    System.out.println("HTTP_INTERCEPTOR: SUCESSO - Bean 'rede' copiado.");
                } else {
                    System.out.println("HTTP_INTERCEPTOR: INFO - Bean 'rede' não é de sessão (esperado).");
                }

            } else {
                System.err.println("HTTP_INTERCEPTOR: ERRO! Sessão HTTP nula durante o handshake.");
            }
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
    }
}