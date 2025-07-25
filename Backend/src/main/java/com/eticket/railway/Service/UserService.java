package com.eticket.railway.Service;

import java.util.Collections;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.eticket.railway.DTO.StationMasterProfileDTO;
import com.eticket.railway.DTO.UserRegisterDTO;
import com.eticket.railway.Entity.Admin;
import com.eticket.railway.Entity.StationMaster;
import com.eticket.railway.Repository.AdminRepository;
import com.eticket.railway.Repository.LoginCredentialsRepository;
import com.eticket.railway.Repository.StationMasterRepository;
import com.eticket.railway.Repository.USER_INFO_REPOSITORY;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private USER_INFO_REPOSITORY userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private StationMasterRepository stationMasterRepository;

    @Autowired
    private LoginCredentialsRepository loginCredentialsRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Try to find login credentials (could be user, admin, or station master)
        LoginCredentialsRepository.LoginCredential credential = loginCredentialsRepository.findByEmail(email);
        
        if (credential == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }

        String role = "ROLE_" + credential.getRole(); // ROLE_USER, ROLE_ADMIN, or ROLE_STATION_MASTER
        
        return User.builder()
                .username(email)
                .password(credential.getPasswordHash()) // This should be the hashed password
                .authorities(Collections.singletonList(new SimpleGrantedAuthority(role)))
                .build();
    }

    public UserRegisterDTO findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Admin findAdminByEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    public StationMaster findStationMasterByEmail(String email) {
        return stationMasterRepository.findByEmail(email);
    }

    public UserRegisterDTO findById(String userId) {
        Optional<UserRegisterDTO> user = userRepository.findById(userId);
        return user.orElse(null);
    }

    public Admin findAdminById(String adminId) {
        return adminRepository.findById(adminId);
    }

    public StationMaster findStationMasterById(String stationMasterId) {
        return stationMasterRepository.findById(stationMasterId);
    }

    public void createUser(UserRegisterDTO user) {
        userRepository.create(user);
    }

    public LoginCredentialsRepository.LoginCredential findCredentialsByEmail(String email) {
        return loginCredentialsRepository.findByEmail(email);
    }

    public StationMasterProfileDTO getStationMasterProfile(String masterId) {
        return stationMasterRepository.getProfile(masterId);
    }

    //     public void registerUser(UserRegisterDTO userDTO) {
//         System.out.println("Inside registerUser, userDTO: " + userDTO.getEmail());
//         userInfoRepository.create(userDTO);
//     }
}