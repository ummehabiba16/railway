// package com.eticket.railway.Service;

// public package com.eticket.railway.Service;

// import java.util.Optional;

// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.core.userdetails.UsernameNotFoundException;
// import org.springframework.stereotype.Service;

// import com.eticket.railway.DTO.UserRegisterDTO;
// import com.eticket.railway.Repository.USER_INFO_REPOSITORY;

// @Service
// public class UserService implements UserDetailsService {

//     private final USER_INFO_REPOSITORY userInfoRepository;

//     public UserService(USER_INFO_REPOSITORY userInfoRepository) {
//         this.userInfoRepository = userInfoRepository;
//     }

//     public void registerUser(UserRegisterDTO userDTO) {
//         System.out.println("Inside registerUser, userDTO: " + userDTO.getEmail());
//         userInfoRepository.create(userDTO);
//     }

//     @Override
//     public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//         System.out.println("Inside loadUserByUsername, username: " + username);
//         Optional<UserRegisterDTO> userOpt = userInfoRepository.findById(username);
//         if (userOpt.isPresent()) {
//             UserRegisterDTO user = userOpt.get();
//             System.out.println("User found: " + user.getEmail());
//             return org.springframework.security.core.userdetails.User
//                     .builder()
//                     .username(user.getEmail()) // or getUserId() if that's your login field
//                     .password(user.getPassword()) // already hashed
//                     .roles("USER") // or get from DB if role stored
//                     .build();
//         } else {
//             throw new UsernameNotFoundException("User not found with username: " + username);
//         }
//     }

// }
//  {
    
// }
