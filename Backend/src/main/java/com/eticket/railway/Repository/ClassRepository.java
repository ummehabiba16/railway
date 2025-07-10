package com.eticket.railway.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.eticket.railway.DTO.ClassDTO;

@Repository
public class ClassRepository {
    private final JdbcTemplate jdbcTemplate;
    public ClassRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ClassDTO> findAllClasses() {
        String sql = "SELECT ClassId, ClassName FROM CLASS";
        try{
        return jdbcTemplate.query(sql, new RowMapper<ClassDTO>() {
            @Override
            public ClassDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
                return new ClassDTO(rs.getString("ClassId"), rs.getString("ClassName"));
            }
        });
        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching stations", e);
    
        }
    }
}
