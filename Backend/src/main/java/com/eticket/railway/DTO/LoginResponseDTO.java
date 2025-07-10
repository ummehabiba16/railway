package com.eticket.railway.DTO;

public class LoginResponseDTO {
    private String userId;
    private String email;
    private String firstName;
    private String lastName;
    private String message;
    private boolean success;
    private String token; // JWT token
    private long expiresIn; // Token expiration time
    
    // Constructors
    public LoginResponseDTO() {}
    
    public LoginResponseDTO(String userId, String email, String firstName, String lastName, 
                           String message, boolean success, String token, long expiresIn) {
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.message = message;
        this.success = success;
        this.token = token;
        this.expiresIn = expiresIn;
    }
    
    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }
}