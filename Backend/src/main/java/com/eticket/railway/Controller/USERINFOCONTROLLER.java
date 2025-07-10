package com.eticket.railway.Controller;


import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.Repository.USER_INFO_REPOSITORY;

@RestController
@RequestMapping("/api")
public class USERINFOCONTROLLER {

    private final USER_INFO_REPOSITORY userInfoRepository;

    public USERINFOCONTROLLER(USER_INFO_REPOSITORY userInfoRepository) {
        this.userInfoRepository = userInfoRepository;
    }
    // @GetMapping("/user/all")
    // Iterable<USER_INFO> getAllUsers() {
    //     return userInfoRepository.findAll();
    // }
    
}
