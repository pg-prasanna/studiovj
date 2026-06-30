package com.photography.portfolio.controller;

import com.photography.portfolio.dto.request.ChangePasswordRequest;
import com.photography.portfolio.dto.request.LoginRequest;
import com.photography.portfolio.dto.response.ApiResponse;
import com.photography.portfolio.dto.response.LoginResponse;
import com.photography.portfolio.security.AdminPrincipal;
import com.photography.portfolio.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Admin login. Public endpoint - issues a JWT on success.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    /**
     * Logout. JWTs are stateless, so logout is handled client-side by discarding the
     * stored token. This endpoint exists so the frontend has a clear, auditable call
     * to make, and to allow future server-side token blacklisting if needed.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success(null, "Logout successful"));
    }

    /**
     * Returns the currently authenticated admin's basic info. Used by the admin
     * frontend on app load to validate a stored token and restore session state.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, String>>> me(@AuthenticationPrincipal AdminPrincipal principal) {
        Map<String, String> data = new HashMap<>();
        data.put("email", principal.getUsername());
        data.put("fullName", principal.getAdminUser().getFullName());
        return ResponseEntity.ok(ApiResponse.success(data, "Authenticated admin retrieved"));
    }

    /**
     * Allows the logged-in admin to change their password.
     */
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal AdminPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(principal.getUsername(), request);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(null, "Password changed successfully"));
    }
}
