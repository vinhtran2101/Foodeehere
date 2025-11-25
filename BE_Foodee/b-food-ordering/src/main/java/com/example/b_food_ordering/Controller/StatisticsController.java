package com.example.b_food_ordering.Controller;

import com.example.b_food_ordering.Dto.DashboardOverviewDTO;
import com.example.b_food_ordering.Dto.OrderItemDTO;
import com.example.b_food_ordering.Entity.Category;
import com.example.b_food_ordering.Entity.ProductType;
import com.example.b_food_ordering.Service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@PreAuthorize("hasRole('ADMIN')")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    //---------------------------
    // 1. API CŨ (GIỮ NGUYÊN)
    //---------------------------

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(statisticsService.getAllCategories());
    }

    @GetMapping("/product-types")
    public ResponseEntity<List<ProductType>> getAllProductTypes() {
        return ResponseEntity.ok(statisticsService.getAllProductTypes());
    }

    @GetMapping("/top-dishes")
    public ResponseEntity<List<OrderItemDTO>> getTopPopularDishes(
            @RequestParam(defaultValue = "4") int limit) {
        return ResponseEntity.ok(statisticsService.getTopPopularDishes(limit));
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<List<String>> getRecentActivities(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getRecentActivities(limit));
    }

    @GetMapping("/top-users")
    public ResponseEntity<List<Map<String, Object>>> getTopUsers(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(statisticsService.getTopUsers(limit));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getQuickSummary() {
        return ResponseEntity.ok(statisticsService.getQuickSummary());
    }


    //---------------------------
    // 2. API MỚI CHO DASHBOARD
    //---------------------------

    /**
     * 📌 API: Thống kê tổng quan dashboard
     * Trả về:
     * - Tổng món ăn
     * - Tổng người dùng
     * - Tổng đơn hàng
     * - Rating trung bình
     * - Tổng doanh thu
     */
    @GetMapping("/dashboard/overview")
    public ResponseEntity<DashboardOverviewDTO> getDashboardOverview() {
        return ResponseEntity.ok(statisticsService.getDashboardOverview());
    }


    /**
     * 📌 API: Doanh thu theo tháng (cho biểu đồ)
     * FE gọi: /dashboard/revenue?year=2025
     */
    @GetMapping("/dashboard/revenue")
    public ResponseEntity<List<Map<String, Object>>> getRevenueByMonth(
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(statisticsService.getRevenueByMonth(year));
    }


    /**
     * 📌 API: Top món ăn cho Dashboard
     */
    @GetMapping("/dashboard/top-foods")
    public ResponseEntity<List<Map<String, Object>>> getDashboardTopFoods(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(statisticsService.getDashboardTopFoods(limit));
    }


    /**
     * 📌 API: Top người dùng nổi bật (advanced)
     */
    @GetMapping("/dashboard/top-users-advanced")
    public ResponseEntity<List<Map<String, Object>>> getDashboardTopUsers(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(statisticsService.getDashboardTopUsers(limit));
    }
}
