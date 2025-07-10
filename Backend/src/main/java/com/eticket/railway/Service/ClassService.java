package com.eticket.railway.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.eticket.railway.DTO.ClassDTO;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Repository.ClassRepository;

@Service
public class ClassService {
    private final ClassRepository classRepository;
    public ClassService(ClassRepository classRepository) {
        this.classRepository = classRepository;
    }

    public List<ClassDTO> getAllClasses() {
        List<ClassDTO> classes = classRepository.findAllClasses();
        if (classes == null || classes.isEmpty()) {
            throw new NoDataFoundException("No classes found");
        }
        return classes;
    }
    
}
