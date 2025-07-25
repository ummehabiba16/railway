package com.eticket.railway.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.DTO.LoginDTO;
import com.eticket.railway.DTO.LoginResponseDTO;
import com.eticket.railway.DTO.StationMasterProfileDTO;
import com.eticket.railway.DTO.UserRegisterDTO;
import com.eticket.railway.Entity.Admin;
import com.eticket.railway.Security.JwtUtil;
import com.eticket.railway.Service.UserService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginDTO loginDTO) {
        try {
            System.out.println("Login attempt for email: " + loginDTO.getEmail());
            // Authenticate user
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword())
            );
            
            // Get login credentials to determine user type
            var credentials = userService.findCredentialsByEmail(loginDTO.getEmail());
            
            if (credentials != null) {
                String role = credentials.getRole();
                String token;
                LoginResponseDTO response;
                
                if ("ADMIN".equals(role)) {
                    // Handle admin login
                    var admin = userService.findAdminByEmail(loginDTO.getEmail());
                    if (admin != null) {
                        token = jwtUtil.generateToken(admin.getAdminId(), admin.getEmail(), "ADMIN");
                        System.out.println("Generated JWT token for admin: " + token);
                        response = new LoginResponseDTO(
                            admin.getAdminId(),
                            admin.getEmail(),
                            admin.getAdminName(),
                            "", // Admin doesn't have lastName
                            "Admin login successful",
                            true,
                            token,
                            86400000L // 24 hours in milliseconds
                        );
                        return ResponseEntity.ok(response);
                    }
                } else if ("STATION_MASTER".equals(role)) {
                    // Handle station master login
                    var stationMaster = userService.findStationMasterByEmail(loginDTO.getEmail());
                    if (stationMaster != null) {
                        token = jwtUtil.generateToken(stationMaster.getMasterId(), credentials.getEmail(), "STATION_MASTER");
                        System.out.println("Generated JWT token for station master: " + token);
                        response = new LoginResponseDTO(
                            stationMaster.getMasterId(),
                            credentials.getEmail(),
                            stationMaster.getName(),
                            "", // Station Master doesn't have lastName
                            "Station Master login successful",
                            true,
                            token,
                            86400000L // 24 hours in milliseconds
                        );
                        return ResponseEntity.ok(response);
                    }
                } else {
                    // Handle regular user login
                    UserRegisterDTO user = userService.findByEmail(loginDTO.getEmail());
                    if (user != null) {
                        token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), "USER");
                        System.out.println("Generated JWT token for user: " + token);
                        response = new LoginResponseDTO(
                            user.getUserId(),
                            user.getEmail(),
                            user.getFirstName(),
                            user.getLastName(),
                            "Login successful",
                            true,
                            token,
                            86400000L // 24 hours in milliseconds
                        );
                        return ResponseEntity.ok(response);
                    }
                }
                
                // If we reach here, user/admin not found
                LoginResponseDTO errorResponse = new LoginResponseDTO(
                    null, null, null, null, "User not found", false, null, 0L
                );
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            } else {
                LoginResponseDTO errorResponse = new LoginResponseDTO(
                    null, null, null, null, "Invalid credentials", false, null, 0L
                );
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
            
        } catch (AuthenticationException e) {
            LoginResponseDTO response = new LoginResponseDTO(
                null, null, null, null, "Invalid email or password", false, null, 0L
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            LoginResponseDTO response = new LoginResponseDTO(
                null, null, null, null, "Login failed: " + e.getMessage(), false, null, 0L
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Logout successful");
    }
    
    // Helper method to get current user ID from request
    @GetMapping("/me")
    public ResponseEntity<UserRegisterDTO> getCurrentUser(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId != null) {
            UserRegisterDTO user = userService.findById(userId);
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    // Get profile based on role
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No token provided");
        }

        try {
            String role = jwtUtil.getRoleFromToken(token);
            String userId = jwtUtil.getUserIdFromToken(token);

            switch (role) {
                case "USER":
                    UserRegisterDTO user = userService.findById(userId);
                    return ResponseEntity.ok(user);
                case "ADMIN":
                    Admin admin = userService.findAdminById(userId);
                    return ResponseEntity.ok(admin);
                case "STATION_MASTER":
                    StationMasterProfileDTO stationMasterProfile = userService.getStationMasterProfile(userId);
                    return ResponseEntity.ok(stationMasterProfile);
                default:
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid role");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}