package com.eticket.railway.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.DTO.ClassDTO;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Service.ClassService;
@RestController
@RequestMapping("/api")
public class ClassController {
    private final ClassService classService;
    public ClassController(ClassService classService) {
        this.classService = classService;
    }
    @GetMapping("/public/classes")
    public ResponseEntity<?> getClasses(){
        try {
            List<ClassDTO> classes = classService.getAllClasses();
            return ResponseEntity.ok(classes);
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No classes available");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }
}
