package com.example.b_food_ordering.Service;

import com.example.b_food_ordering.Dto.ReviewRequestDTO;
import com.example.b_food_ordering.Entity.*;
import com.example.b_food_ordering.Repository.*;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

    public void createReview(String username, ReviewRequestDTO dto) {

        User user = userRepository.findByUsername(username);
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        // Check đơn thuộc người dùng
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Không có quyền đánh giá đơn này");
        }

        // Chỉ được đánh giá nếu đã giao
        if (order.getOrderStatus() != Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Chỉ được đánh giá khi đơn đã giao");
        }

        // Không cho đánh giá trùng
        if (reviewRepository.findByUserAndOrderAndProduct(user, order, product).isPresent()) {
            throw new RuntimeException("Bạn đã đánh giá món này rồi");
        }

        Review review = new Review();
        review.setUser(user);
        review.setOrder(order);
        review.setProduct(product);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());

        reviewRepository.save(review);
    }
}
