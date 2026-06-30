package com.photography.portfolio.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.photography.portfolio.dto.response.ErrorResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException, ServletException {

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .success(false)
                .message("Authentication required. Please log in as admin.")
                .errorCode("UNAUTHORIZED")
                .timestamp(System.currentTimeMillis())
                .path(request.getRequestURI())
                .statusCode(HttpStatus.UNAUTHORIZED.value())
                .build();

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
