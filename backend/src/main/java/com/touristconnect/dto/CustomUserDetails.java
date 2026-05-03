package com.touristconnect.dto;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class CustomUserDetails extends User {
    private final Integer tokenVersion;

    public CustomUserDetails(String username, String password, boolean enabled, boolean accountNonExpired, 
                             boolean credentialsNonExpired, boolean accountNonLocked, 
                             Collection<? extends GrantedAuthority> authorities, Integer tokenVersion) {
        super(username, password, enabled, accountNonExpired, credentialsNonExpired, accountNonLocked, authorities);
        this.tokenVersion = tokenVersion;
    }

    public Integer getTokenVersion() {
        return tokenVersion;
    }
}
