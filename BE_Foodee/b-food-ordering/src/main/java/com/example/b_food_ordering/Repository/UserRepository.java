package com.example.b_food_ordering.Repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.b_food_ordering.Entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    User findByEmail(String email);
}
