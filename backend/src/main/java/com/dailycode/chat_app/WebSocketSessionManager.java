package com.dailycode.chat_app;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/** Mantiene la presencia asociada a la sesión real del transporte. */
@Service
public class WebSocketSessionManager {
    private final Map<String, String> usersBySession = new HashMap<>();
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketSessionManager(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public synchronized boolean register(String sessionId, String username) {
        if (sessionId == null || username == null || username.isBlank() || username.length() > 16) {
            return false;
        }
        String previous = usersBySession.get(sessionId);
        if (previous != null) {
            return previous.equals(username);
        }
        if (usersBySession.values().stream().anyMatch(user -> user.equalsIgnoreCase(username))) {
            return false;
        }
        usersBySession.put(sessionId, username);
        broadcastActiveUsernames();
        return true;
    }

    public synchronized String usernameFor(String sessionId) {
        return usersBySession.get(sessionId);
    }

    public synchronized void disconnect(String sessionId) {
        String username = usersBySession.remove(sessionId);
        if (username != null) {
            messagingTemplate.convertAndSend("/topic/disconnected-users", Map.of("username", username));
            broadcastActiveUsernames();
        }
    }

    public synchronized void broadcastActiveUsernames() {
        messagingTemplate.convertAndSend("/topic/users", List.copyOf(usersBySession.values()));
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        disconnect(event.getSessionId());
    }
}
