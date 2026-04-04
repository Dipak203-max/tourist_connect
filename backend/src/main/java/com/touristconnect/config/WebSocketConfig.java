package com.touristconnect.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.lang.NonNull;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @org.springframework.beans.factory.annotation.Autowired
    private JwtUtil jwtUtil;

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue")
                .setHeartbeatValue(new long[] { 10000, 10000 })
                .setTaskScheduler(taskScheduler());
        config.setApplicationDestinationPrefixes("/app");
    }

    @Bean
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(10);
        scheduler.setThreadNamePrefix("ws-heartbeat-");
        scheduler.initialize();
        return scheduler;
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // Use specific origin to avoid issues with credentials + wildcards
        registry.addEndpoint("/ws-chat")
                .setAllowedOrigins("http://localhost:5173", "http://localhost:3000") // Add your frontend ports
                .withSockJS();
    }

    @Override
    public void configureWebSocketTransport(@NonNull WebSocketTransportRegistration registration) {
        registration.setSendTimeLimit(20000);
        registration.setSendBufferSizeLimit(1024 * 1024);
        registration.setMessageSizeLimit(512 * 1024);
    }

    @Override
    public void configureClientInboundChannel(
            @NonNull org.springframework.messaging.simp.config.ChannelRegistration registration) {
        registration.interceptors(new org.springframework.messaging.support.ChannelInterceptor() {
            @Override
            public org.springframework.messaging.Message<?> preSend(
                    @NonNull org.springframework.messaging.Message<?> message,
                    @NonNull org.springframework.messaging.MessageChannel channel) {
                try {
                    org.springframework.messaging.simp.stomp.StompHeaderAccessor accessor = org.springframework.messaging.support.MessageHeaderAccessor
                            .getAccessor(message, org.springframework.messaging.simp.stomp.StompHeaderAccessor.class);

                    if (accessor != null && org.springframework.messaging.simp.stomp.StompCommand.CONNECT
                            .equals(accessor.getCommand())) {
                        String authHeader = accessor.getFirstNativeHeader("Authorization");
                        if (authHeader != null && authHeader.startsWith("Bearer ")) {
                            String token = authHeader.substring(7);
                            String username = jwtUtil.extractUsername(token);

                            if (username != null) {
                                org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService
                                        .loadUserByUsername(username);

                                if (jwtUtil.validateToken(token, userDetails)) {
                                    org.springframework.security.authentication.UsernamePasswordAuthenticationToken authentication = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                            userDetails, null, userDetails.getAuthorities());
                                    accessor.setUser(authentication);
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    // Log error but don't crash the broker, though authentication will fail
                    System.err.println("WebSocket Authentication Failed: " + e.getMessage());
                }
                return message;
            }
        });
    }
}
