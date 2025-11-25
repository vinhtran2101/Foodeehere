package com.example.b_food_ordering.Dto;

public class DashboardOverviewDTO {

    // Tổng số món ăn (sản phẩm)
    private long totalProducts;

    // Tổng số người dùng
    private long totalUsers;

    // Tổng số đơn hàng
    private long totalOrders;

    // Tổng số lượt đặt bàn
    private long totalBookings;

    // Tổng doanh thu
    private double totalRevenue;

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
}
