package com.example.b_food_ordering.Repository;

import com.example.b_food_ordering.Entity.Cart;
import com.example.b_food_ordering.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user); 
}