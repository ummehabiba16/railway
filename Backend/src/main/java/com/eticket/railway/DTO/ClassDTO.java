package com.eticket.railway.DTO;

public class ClassDTO {
    /*CREATE TABLE CLASS (
    ClassId VARCHAR2(6) PRIMARY KEY,
    ClassName VARCHAR2(50) NOT NULL,
    ClassDetails VARCHAR2(200)
    );
    */
    private String ClassId;
    private String ClassName;

    public ClassDTO(String classId, String className) {
        ClassId = classId;
        ClassName = className;
    }
    public String getClassId() {
        return ClassId;
    }
    public void setClassId(String classId) {
        ClassId = classId;
    }
    public String getClassName() {
        return ClassName;
    }
    public void setClassName(String className) {
        ClassName = className;
    }
    
}
