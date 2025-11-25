package com.example.b_food_ordering.Repository;

import com.example.b_food_ordering.Entity.Order;
import com.example.b_food_ordering.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
}