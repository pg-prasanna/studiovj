package com.photography.portfolio.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Security configuration for StudioVJ.
 *
 * - The public viewer website and its read-only APIs (GET on events/albums/photos/categories/settings)
 *   remain fully open, no authentication required.
 * - Everything under /api/admin/** (except /api/admin/auth/login) requires a valid admin JWT.
 * - Every mutating request (POST/PUT/PATCH/DELETE) on the management resources (events, albums,
 *   photos, categories, settings) requires a valid admin JWT, since those are the actions only
 *   the Admin Dashboard should be able to perform.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final AdminUserDetailsService adminUserDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(adminUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {}) // CORS handled by CorsConfig (WebMvcConfigurer)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler))
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public auth endpoint
                        .requestMatchers("/api/admin/auth/login").permitAll()

                        // Public read-only viewer endpoints
                        .requestMatchers(HttpMethod.GET,
                                "/api/events", "/api/events/**",
                                "/api/albums", "/api/albums/**",
                                "/api/photos", "/api/photos/**",
                                "/api/categories", "/api/categories/**",
                                "/api/settings", "/api/settings/**"
                        ).permitAll()



                        // Public visitor-analytics capture: guests submit their email to unlock
                        // a gallery on the viewer site. Must stay open (no admin JWT available there).
                        .requestMatchers(HttpMethod.POST, "/api/events/*/visit").permitAll()

                        // Public download-gate verification: guests verify their e-mail + PIN
                        // before downloading a photo. No admin JWT available on the viewer site.
                        .requestMatchers(HttpMethod.POST, "/api/events/*/verify-download").permitAll()

                        // Public album ZIP download: guests verify the same e-mail + PIN
                        // (checked server-side again here) before the album ZIP is streamed.
                        .requestMatchers(HttpMethod.POST, "/api/albums/*/download").permitAll()

                        // Everything else under /api/admin/** requires authentication
                        .requestMatchers("/api/admin/**").authenticated()

                        // Any non-GET (create/update/delete/publish/upload) operation on
                        // management resources requires authentication
                        .requestMatchers(HttpMethod.POST, "/api/events", "/api/events/**", "/api/albums", "/api/albums/**",
                                "/api/photos", "/api/photos/**", "/api/categories", "/api/categories/**",
                                "/api/settings", "/api/settings/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/events", "/api/events/**", "/api/albums", "/api/albums/**",
                                "/api/photos", "/api/photos/**", "/api/categories", "/api/categories/**",
                                "/api/settings", "/api/settings/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/events", "/api/events/**", "/api/albums", "/api/albums/**",
                                "/api/photos", "/api/photos/**", "/api/categories", "/api/categories/**",
                                "/api/settings", "/api/settings/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/events", "/api/events/**", "/api/albums", "/api/albums/**",
                                "/api/photos", "/api/photos/**", "/api/categories", "/api/categories/**",
                                "/api/settings", "/api/settings/**").authenticated()

                        // Anything not explicitly matched is publicly readable (e.g. health checks)
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
