package com.eticket.railway.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.DTO.UserRegisterDTO;
import com.eticket.railway.Service.UserService;
@RestController
@RequestMapping("/api")
public class RegistrationController {
    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegisterDTO userDTO) {
        try{
            userDTO.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            System.out.println("Encrypted password: " + userDTO.getPassword());
            userService.createUser(userDTO);

            System.out.println("Inside controller: User registered: " + userDTO.getEmail());
            return ResponseEntity.ok("User registered successfully");
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed: " + e.getMessage());
        }
    }

}
