package com.example.b_food_ordering.Service;

import com.example.b_food_ordering.Dto.OrderDTO;
import com.example.b_food_ordering.Dto.OrderItemDTO;
import com.example.b_food_ordering.Dto.DashboardOverviewDTO;
import com.example.b_food_ordering.Dto.TopFoodDTO;
import com.example.b_food_ordering.Entity.*;
import com.example.b_food_ordering.Repository.*;
import com.example.b_food_ordering.Repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    private static final Logger logger = LoggerFactory.getLogger(StatisticsService.class);

    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ProductTypeRepository productTypeRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;



    @Autowired
    public StatisticsService(CategoryRepository categoryRepository,
                             OrderRepository orderRepository,
                             BookingRepository bookingRepository,
                             UserRepository userRepository,
                             ProductTypeRepository productTypeRepository,
                             ProductRepository productRepository, OrderItemRepository orderItemRepository){

        this.categoryRepository = categoryRepository;
        this.orderRepository = orderRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.productTypeRepository = productTypeRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<ProductType> getAllProductTypes() {
        return productTypeRepository.findAll();
    }

    @Transactional
    public List<OrderItemDTO> getTopPopularDishes(int limit) {
        List<Order> orders = orderRepository.findAll();
        Map<Long, Integer> productQuantityMap = new HashMap<>();
        Map<Long, OrderItemDTO> productDetailsMap = new HashMap<>();

        for (Order order : orders) {
            for (OrderItem item : order.getOrderItems()) {
                if (item.getProduct() == null) {
                    logger.warn("OrderItem ID {} has null product", item.getId());
                    continue;
                }

                Long productId = item.getProduct().getId();
                productQuantityMap.merge(productId, item.getQuantity(), Integer::sum);

                if (!productDetailsMap.containsKey(productId)) {
                    OrderItemDTO itemDTO = new OrderItemDTO();
                    itemDTO.setId(item.getId());
                    itemDTO.setProductId(productId);
                    itemDTO.setProductName(item.getProduct().getName());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setProductImage(item.getProduct().getImg());
                    itemDTO.setUnitPrice(item.getUnitPrice());
                    itemDTO.setSubtotal(item.getSubtotal());
                    
                    productDetailsMap.put(productId, itemDTO);
                }
            }
        }

        return productQuantityMap.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .limit(Math.max(1, limit))
                .map(entry -> {
                    OrderItemDTO dto = productDetailsMap.get(entry.getKey());
                    if (dto != null) {
                        dto.setTotalOrdered(entry.getValue()); // ← GÁN lượt đặt
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public List<String> getRecentActivities(int limit) {
        List<String> activities = new ArrayList<>();

        List<Order> recentOrders = orderRepository.findAll().stream()
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate()))
                .limit(limit)
                .collect(Collectors.toList());

        List<Booking> recentBookings = bookingRepository.findAll().stream()
                .sorted((b1, b2) -> b2.getCreatedAt().compareTo(b1.getCreatedAt()))
                .limit(limit)
                .collect(Collectors.toList());

        for (Order order : recentOrders) {
            String items = order.getOrderItems().stream()
                    .filter(item -> item.getProduct() != null)
                    .map(item -> item.getProduct().getName() + " (x" + item.getQuantity() + ")"
                            + (item.getProduct().getProductType() != null
                            ? " [" + item.getProduct().getProductType().getName() + "]" : ""))
                    .collect(Collectors.joining(", "));
            activities.add("User " + order.getUser().getUsername() + " đặt đơn hàng: " + items + " vào " + order.getOrderDate());
        }

        for (Booking booking : recentBookings) {
            activities.add("User " + booking.getUser().getUsername() + " đặt bàn cho " + booking.getNumberOfGuests() +
                    " người vào " + booking.getBookingDate() + " " + booking.getBookingTime());
        }

        return activities.stream()
                .sorted(Comparator.reverseOrder())
                .limit(Math.max(1, limit))
                .collect(Collectors.toList());
    }

    @Transactional
    public List<Map<String, Object>> getTopUsers(int limit) {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> topUsers = new ArrayList<>();

        for (User user : users) {
            Map<String, Object> userStats = new HashMap<>();
            userStats.put("username", user.getUsername());

            List<Order> userOrders = orderRepository.findByUser(user);
            double totalSpending = userOrders.stream()
                    .mapToDouble(Order::getTotalAmount)
                    .sum();

            String orderItems = userOrders.stream()
                    .flatMap(order -> order.getOrderItems().stream())
                    .filter(item -> item.getProduct() != null)
                    .map(item -> item.getProduct().getName() + " (x" + item.getQuantity() + ")"
                            + (item.getProduct().getProductType() != null
                            ? " [" + item.getProduct().getProductType().getName() + "]" : ""))
                    .collect(Collectors.joining(", "));
            userStats.put("orders", orderItems.isEmpty() ? "Không có đơn hàng" : orderItems);

            List<Booking> userBookings = bookingRepository.findByUserUsername(user.getUsername());
            String bookings = userBookings.stream()
                    .map(b -> "Đặt bàn cho " + b.getNumberOfGuests() + " người vào " + b.getBookingDate())
                    .collect(Collectors.joining(", "));
            userStats.put("bookings", bookings.isEmpty() ? "Không có đặt bàn" : bookings);
            userStats.put("totalSpending", totalSpending);
            topUsers.add(userStats);
        }

        return topUsers.stream()
                .sorted(Comparator.comparingDouble(u -> -(Double) u.get("totalSpending")))
                .limit(Math.max(1, limit))
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> getQuickSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalDishes", orderRepository.findAll().stream()
                .flatMap(o -> o.getOrderItems().stream())
                .map(OrderItem::getProduct)
                .filter(Objects::nonNull)
                .distinct()
                .count());
        summary.put("totalUsers", userRepository.count());
        summary.put("totalBookings", bookingRepository.count());
        summary.put("totalOrders", orderRepository.count());
        summary.put("totalRevenue", orderRepository.findAll().stream()
                .mapToDouble(Order::getTotalAmount)
                .sum());
        summary.put("totalProductTypes", productTypeRepository.count());
        return summary;
    }

    private OrderDTO convertToOrderDTO(Order order) {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setId(order.getId());
        orderDTO.setFullname(order.getFullname());
        orderDTO.setEmail(order.getEmail());
        orderDTO.setPhoneNumber(order.getPhoneNumber());
        orderDTO.setDeliveryAddress(order.getDeliveryAddress());
        orderDTO.setOrderDate(order.getOrderDate());
        orderDTO.setDeliveryDate(order.getDeliveryDate());
        orderDTO.setPaymentStatus(order.getPaymentStatus().name());
        orderDTO.setOrderStatus(order.getOrderStatus().name());
        orderDTO.setTotalAmount(order.getTotalAmount());

        orderDTO.setOrderItems(order.getOrderItems().stream()
                .filter(item -> item.getProduct() != null)
                .map(item -> {
                    OrderItemDTO itemDTO = new OrderItemDTO();
                    itemDTO.setId(item.getId());
                    itemDTO.setProductId(item.getProduct().getId());
                    itemDTO.setProductName(item.getProduct().getName());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setProductImage(item.getProduct().getImg());
                    itemDTO.setUnitPrice(item.getUnitPrice());
                    itemDTO.setSubtotal(item.getSubtotal());
                   
                    return itemDTO;
                }).collect(Collectors.toList()));
        return orderDTO;
    }

    // ================== DASHBOARD APIs MỚI ==================

    /**
     * Thống kê tổng quan cho Dashboard:
     * - tổng món ăn (dựa trên các món từng xuất hiện trong đơn hàng)
     * - tổng user
     * - tổng đơn hàng
     * - tổng lượt đặt bàn
     * - tổng doanh thu
     */
    @Transactional
    public DashboardOverviewDTO getDashboardOverview() {
        DashboardOverviewDTO dto = new DashboardOverviewDTO();

        long totalProducts = productRepository.countByStatus("AVAILABLE");

        long totalUsers = userRepository.count();
        long totalBookings = bookingRepository.count();
        long totalOrders = orderRepository.count();
        double totalRevenue = orderRepository.findAll().stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();

        dto.setTotalProducts(totalProducts);   // 👈 dùng tổng món đang bán
        dto.setTotalUsers(totalUsers);
        dto.setTotalOrders(totalOrders);
        dto.setTotalBookings(totalBookings);
        dto.setTotalRevenue(totalRevenue);

        return dto;
    }

    /**
     * Doanh thu theo tháng cho 1 năm (mặc định: năm hiện tại)
     * Trả về list map: [{month: 1, revenue: ...}, ...]
     */
    @Transactional
    public List<Map<String, Object>> getRevenueByMonth(Integer year) {
        if (year == null) {
            year = Calendar.getInstance().get(Calendar.YEAR);
        }

        Map<Integer, Double> revenueByMonth = new HashMap<>();

        for (Order order : orderRepository.findAll()) {
            if (order.getOrderDate() == null) continue;

            int orderYear = order.getOrderDate().getYear();
            if (orderYear != year) continue;

            int month = order.getOrderDate().getMonthValue();
            revenueByMonth.merge(month, order.getTotalAmount(), Double::sum);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        // chỉ trả những tháng có doanh thu > 0
        for (Map.Entry<Integer, Double> entry : revenueByMonth.entrySet()) {
            Map<String, Object> map = new HashMap<>();
            map.put("month", entry.getKey());
            map.put("revenue", entry.getValue());
            result.add(map);
        }

        // sắp xếp theo tháng tăng dần
        result.sort(Comparator.comparingInt(m -> (Integer) m.get("month")));

        return result;
    }

    /**
     * Top món ăn cho dashboard.
     * Tái sử dụng getTopPopularDishes để tránh viết lại logic.
     */
    @Transactional
    public List<Map<String, Object>> getDashboardTopFoods(int limit) {
        List<OrderItemDTO> topItems = getTopPopularDishes(limit);
        List<Map<String, Object>> result = new ArrayList<>();

        for (OrderItemDTO item : topItems) {
            if (item == null) continue;
            Map<String, Object> map = new HashMap<>();
            map.put("productId", item.getProductId());
            map.put("productName", item.getProductName());
            map.put("productImage", item.getProductImage());
            map.put("totalOrdered", item.getTotalOrdered());
            map.put("unitPrice", item.getUnitPrice());
            result.add(map);
        }

        return result;
    }

    /**
     * Top user cho dashboard.
     * Ở đây đơn giản dùng lại getTopUsers để đảm bảo đồng nhất.
     */
    @Transactional
    public List<Map<String, Object>> getDashboardTopUsers(int limit) {
        return getTopUsers(limit);
    }

    public List<TopFoodDTO> getTopFoods(int limit) {
        List<TopFoodDTO> list = orderItemRepository.findTopFoods(
                Order.PaymentStatus.PAID,
                Order.OrderStatus.DELIVERED
        );

        // Giới hạn số lượng trả về
        if (limit > 0 && list.size() > limit) {
            return list.subList(0, limit);
        }

        return list;
    }


}
