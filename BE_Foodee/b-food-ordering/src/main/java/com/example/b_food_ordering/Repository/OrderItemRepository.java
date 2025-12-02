package com.example.b_food_ordering.Repository;

import com.example.b_food_ordering.Dto.TopFoodDTO;
import com.example.b_food_ordering.Entity.Order;
import com.example.b_food_ordering.Entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT new com.example.b_food_ordering.Dto.TopFoodDTO(" +
            "   oi.product.id, " +
            "   oi.product.name, " +
            "   COUNT(oi.id), " +
            "   0.0 " +                 // tạm chưa có rating thật
            ") " +
            "FROM OrderItem oi " +
            "WHERE oi.order.paymentStatus = :paymentStatus " +
            "  AND oi.order.orderStatus = :orderStatus " +
            "GROUP BY oi.product.id, oi.product.name " +
            "ORDER BY COUNT(oi.id) DESC")
    List<TopFoodDTO> findTopFoods(
            @Param("paymentStatus") Order.PaymentStatus paymentStatus,
            @Param("orderStatus") Order.OrderStatus orderStatus
    );
}
