package com.example.b_food_ordering.Repository;

import com.example.b_food_ordering.Entity.Review;
import com.example.b_food_ordering.Entity.User;
import com.example.b_food_ordering.Entity.Product;
import com.example.b_food_ordering.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByUserAndOrderAndProduct(User user, Order order, Product product);

    List<Review> findByOrder(Order order);

    List<Review> findByProduct(Product product);


}
