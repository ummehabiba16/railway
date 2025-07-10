package com.eticket.railway.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.DTO.LoginDTO;
import com.eticket.railway.DTO.LoginResponseDTO;
import com.eticket.railway.DTO.UserRegisterDTO;
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
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword())
            );
            
            // Get user details
            UserRegisterDTO user = userService.findByEmail(loginDTO.getEmail());
            
            if (user != null) {
                // Generate JWT token
                System.out.println("User found: " + user.getEmail());
                String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), "USER"); // added role???
                System.out.println("Generated JWT token: " + token);
                LoginResponseDTO response = new LoginResponseDTO(
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
            } else {
                LoginResponseDTO response = new LoginResponseDTO(
                    null, null, null, null, "User not found", false, null, 0L
                );
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
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
}