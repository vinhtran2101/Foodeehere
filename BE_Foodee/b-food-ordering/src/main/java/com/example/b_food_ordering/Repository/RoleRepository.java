package com.example.b_food_ordering.Repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.b_food_ordering.Entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Role findByName(String name);
}