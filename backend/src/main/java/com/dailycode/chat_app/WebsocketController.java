package com.dailycode.chat_app;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

@Controller
public class WebsocketController {
    private final SimpMessagingTemplate messagingTemplate;
    private final WebSocketSessionManager sessions;

    public WebsocketController(SimpMessagingTemplate messagingTemplate, WebSocketSessionManager sessions) {
        this.messagingTemplate = messagingTemplate;
        this.sessions = sessions;
    }

    public record Registration(boolean accepted, String error) {}

    @MessageMapping("/connect")
    @SendToUser(value = "/queue/registration", broadcast = false)
    public Registration connectUser(String username, SimpMessageHeaderAccessor headers) {
        String normalized = username == null ? "" : username.trim();
        boolean accepted = sessions.register(headers.getSessionId(), normalized);
        return new Registration(accepted, accepted ? "" : "Nombre no válido o ya está en uso.");
    }

    @MessageMapping("/message")
    public void handleMessage(Message message, SimpMessageHeaderAccessor headers) {
        String user = sessions.usernameFor(headers.getSessionId());
        String body = message.getMessage();
        if (user != null && body != null && !body.isBlank() && body.length() <= 2000) {
            messagingTemplate.convertAndSend("/topic/messages", new Message(user, body.trim()));
        }
    }

    @MessageMapping("/disconnect")
    public void disconnectUser(SimpMessageHeaderAccessor headers) {
        sessions.disconnect(headers.getSessionId());
    }

    @MessageMapping("/request-users")
    public void requestUsers(SimpMessageHeaderAccessor headers) {
        if (sessions.usernameFor(headers.getSessionId()) != null) {
            sessions.broadcastActiveUsernames();
        }
    }
}
