// package com.eticket.railway.Security;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.authentication.AuthenticationProvider;
// import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.web.SecurityFilterChain;

// import com.eticket.railway.Service.UserService;


// @Configuration
// @EnableWebSecurity
// public class SecurityConfig {
//     @Autowired
//     private final UserService userService;
//     public SecurityConfig(UserService userService) {
//         this.userService = userService;
//     }

//     @Bean
//     public UserDetailsService userDetailsService() {
//         return userService;
//     }

//     @Bean
//     public AuthenticationProvider authenticationProvider(){
//         DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
//         provider.setUserDetailsService(userService);
//         return provider;
//     }
//     @Bean
//     public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception{

//         return httpSecurity
//             .cors() 
//             .and()
//             .formLogin(httpForm ->{

//             httpForm.loginPage("/login").permitAll();

//         })
//         .authorizeHttpRequests(registry -> {
//             registry.requestMatchers("/signup","/api/register").permitAll();
//             registry.anyRequest().authenticated();
//         })
//         .csrf(csrf -> csrf.disable())
//         .build();
//     }
    
// }
