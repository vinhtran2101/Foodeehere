package com.example.b_food_ordering.Repository;

import com.example.b_food_ordering.Entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Hàm cũ - đang được StatisticsService sử dụng
    List<Booking> findByUserUsername(String username);

    // Hàm mới: lịch sử đặt bàn của 1 user, mới nhất -> cũ nhất
    List<Booking> findByUserUsernameOrderByCreatedAtDesc(String username);

    // Hàm mới: admin lấy tất cả đơn, mới nhất -> cũ nhất
    List<Booking> findAllByOrderByCreatedAtDesc();
}
