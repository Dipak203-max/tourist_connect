package com.touristconnect.listener;

import com.touristconnect.service.GuideProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class WebSocketEventListener {

    @Autowired
    private GuideProfileService guideProfileService;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        
        if (headerAccessor.getUser() != null) {
            String email = headerAccessor.getUser().getName();
            log.info("User Disconnected: " + email);
            
            guideProfileService.updateAvailability(email, false);
        }
    }
}
