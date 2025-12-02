package com.example.b_food_ordering.Repository;

import com.example.b_food_ordering.Entity.Order;
import com.example.b_food_ordering.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);

    // Đếm số đơn theo trạng thái trong khoảng [startDate, endDate)
    @Query("SELECT o.orderStatus, COUNT(o.id) " +
            "FROM Order o " +
            "WHERE o.orderDate >= :startDate AND o.orderDate < :endDate " +
            "GROUP BY o.orderStatus")
    List<Object[]> countOrdersByStatusInRange(@Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);
}
