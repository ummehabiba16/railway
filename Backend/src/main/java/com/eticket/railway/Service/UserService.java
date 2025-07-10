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

import com.eticket.railway.DTO.UserRegisterDTO;
import com.eticket.railway.Repository.USER_INFO_REPOSITORY;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private USER_INFO_REPOSITORY userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserRegisterDTO user = findByEmail(email);
        
        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }

        return User.builder()
                .username(user.getEmail())
                .password(user.getPassword()) // This should be the hashed password
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
                .build();
    }

    public UserRegisterDTO findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserRegisterDTO findById(String userId) {
        Optional<UserRegisterDTO> user = userRepository.findById(userId);
        return user.orElse(null);
    }

    public void createUser(UserRegisterDTO user) {
        userRepository.create(user);
    }

    //     public void registerUser(UserRegisterDTO userDTO) {
//         System.out.println("Inside registerUser, userDTO: " + userDTO.getEmail());
//         userInfoRepository.create(userDTO);
//     }
}