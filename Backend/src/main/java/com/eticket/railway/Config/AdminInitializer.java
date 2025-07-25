package com.eticket.railway.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.eticket.railway.Entity.Admin;
import com.eticket.railway.Repository.AdminRepository;
import com.eticket.railway.Repository.LoginCredentialsRepository;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private LoginCredentialsRepository loginRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${admin.default.id}")
    private String adminId;

    @Value("${admin.default.name}")
    private String adminName;

    @Value("${admin.default.email}")
    private String adminEmail;

    @Value("${admin.default.password}")
    private String adminRawPassword;



    @Override
    public void run(String... args) {
        // Create default admin
        if (!adminRepository.existsById(adminId)) {
            System.out.println("Creating default admin user...");
            
            // Create admin record
            Admin admin = new Admin();
            admin.setAdminId(adminId);
            admin.setAdminName(adminName);
            admin.setEmail(adminEmail);
            adminRepository.save(admin);

            // Create login credentials
            String hashedPassword = passwordEncoder.encode(adminRawPassword);
            String loginId = "L" + adminId; // Generate login ID
            
            loginRepository.save(loginId, null, adminId, null, "EMAIL", hashedPassword, "ADMIN");

            System.out.println("Default admin user created successfully:");
            System.out.println("Email: " + adminEmail);
            System.out.println("Password: " + adminRawPassword);
            System.out.println("Role: ADMIN");
        } else {
            System.out.println("Default admin user already exists, skipping creation.");
        }
    }
}
