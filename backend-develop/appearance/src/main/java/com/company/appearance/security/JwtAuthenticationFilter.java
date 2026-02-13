package com.company.appearance.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.company.appearance.service.JwtService;

import java.io.IOException;
import java.util.Collections;

/**
 * JWT Authentication Filter that intercepts HTTP requests to validate JWT tokens.
 * Part of the security layer - extracts and validates access tokens, sets up Spring Security context.
 * 
 * Architecture: This filter runs before Spring Security's authentication filter.
 * It handles JWT-specific authentication by:
 * 1. Skipping public endpoints (login, register, refresh, swagger, OPTIONS)
 * 2. Extracting JWT from Authorization header
 * 3. Validating access token (signature, expiration, type=access)
 * 4. Setting SecurityContext with user's authentication
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    /**
     * Constructor for dependency injection.
     *
     * @param jwtService Service for JWT token validation and extraction
     */
    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    /**
     * Filters incoming HTTP requests to validate JWT access tokens.
     * Skips authentication for public endpoints and OPTIONS requests.
     * Validates access token and sets up Spring Security authentication context.
     *
     * @param request HTTP servlet request
     * @param response HTTP servlet response
     * @param filterChain Filter chain to continue processing
     * @throws ServletException If a servlet error occurs
     * @throws IOException If an I/O error occurs
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Skip authentication for public endpoints
        if (isPublicEndpoint(path, method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract token from "Bearer <token>"
        String token = authHeader.substring(7);

        // Validate access token and set authentication context
        try {
            if (jwtService.validateToken(token)) {
                String username = jwtService.extractUsername(token);
                String role = jwtService.extractRole(token);
                String tokenType = jwtService.extractType(token);

                // Ensure it's an access token (not refresh token)
                if ("access".equals(tokenType) || tokenType == null) {
                    // Create authority with ROLE_ prefix (required by Spring Security)
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            Collections.singletonList(authority)
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            // Token validation failed - continue without authentication
            // SecurityContext remains empty, endpoint will return 401 if protected
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Checks if the request path and method correspond to a public endpoint.
     * Public endpoints don't require JWT authentication.
     *
     * @param path Request URI path
     * @param method HTTP method
     * @return true if endpoint is public, false otherwise
     */
    private boolean isPublicEndpoint(String path, String method) {
        // Allow OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        // Allow authentication endpoints
        if (path.equals("/api/auth/login") || 
            path.equals("/api/auth/refresh") || 
            path.equals("/api/auth/register")) {
            return true;
        }

        // Allow Swagger/OpenAPI endpoints
        if (path.startsWith("/swagger-ui/") || 
            path.startsWith("/v3/api-docs") || 
            path.equals("/swagger-ui.html") || 
            path.startsWith("/swagger-resources")) {
            return true;
        }

        return false;
    }
}
