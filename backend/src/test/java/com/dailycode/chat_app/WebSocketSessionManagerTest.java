package com.dailycode.chat_app;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

class WebSocketSessionManagerTest {
    private final WebSocketSessionManager sessions =
        new WebSocketSessionManager(mock(SimpMessagingTemplate.class));

    @Test
    void noPermiteDuplicadosNiCambioDeIdentidadEnLaMismaSesion() {
        assertTrue(sessions.register("s1", "Ana"));
        assertFalse(sessions.register("s2", "ana"));
        assertFalse(sessions.register("s1", "Pedro"));
        assertEquals("Ana", sessions.usernameFor("s1"));
    }

    @Test
    void liberaElNombreAlPerderLaConexion() {
        assertTrue(sessions.register("s1", "Ana"));
        SessionDisconnectEvent event = mock(SessionDisconnectEvent.class);
        when(event.getSessionId()).thenReturn("s1");
        sessions.onDisconnect(event);
        assertNull(sessions.usernameFor("s1"));
        assertTrue(sessions.register("s2", "Ana"));
    }
}
