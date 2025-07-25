package com.eticket.railway.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.eticket.railway.DTO.UserTypeDTO;
import com.eticket.railway.Repository.USER_INFO_REPOSITORY;

@Service
public class UserInfoService {

    @Autowired
    private USER_INFO_REPOSITORY userInfoRepository;

    public UserTypeDTO getUserTypeInfo(String userId) {
        return userInfoRepository.getUserTypeInfo(userId);
    }

    public String getBanStatus(String userId) {
        return userInfoRepository.getBanStatus(userId);
    }
}
