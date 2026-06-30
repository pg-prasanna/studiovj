package com.photography.portfolio.service;

import com.photography.portfolio.dto.request.ChangePasswordRequest;
import com.photography.portfolio.dto.request.LoginRequest;
import com.photography.portfolio.dto.response.LoginResponse;
import com.photography.portfolio.entity.AdminUser;
import com.photography.portfolio.exception.BadRequestException;
import com.photography.portfolio.repository.AdminUserRepository;
import com.photography.portfolio.security.AdminPrincipal;
import com.photography.portfolio.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AdminUserRepository adminUserRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            log.warn("Failed admin login attempt for email: {}", request.getEmail());
            throw new BadRequestException("Invalid email or password", "INVALID_CREDENTIALS");
        }

        AdminUser adminUser = adminUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password", "INVALID_CREDENTIALS"));

        String token = jwtService.generateToken(new AdminPrincipal(adminUser));

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .email(adminUser.getEmail())
                .fullName(adminUser.getFullName())
                .expiresIn(jwtService.getExpirationMs())
                .build();
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        AdminUser adminUser = adminUserRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Admin account not found", "NOT_FOUND"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), adminUser.getPassword())) {
            throw new BadRequestException("Current password is incorrect", "INVALID_CREDENTIALS");
        }

        adminUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        adminUserRepository.save(adminUser);
    }
}
