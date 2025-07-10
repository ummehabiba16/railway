package com.eticket.railway.Controller;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

public abstract class BaseController {
    
    protected String getCurrentUserId() {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        return (String) request.getAttribute("userId");
    }
    
    protected String getCurrentUserEmail() {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        return (String) request.getAttribute("userEmail");
    }
    
    protected boolean isUserAuthenticated() {
        return getCurrentUserId() != null;
    }
}