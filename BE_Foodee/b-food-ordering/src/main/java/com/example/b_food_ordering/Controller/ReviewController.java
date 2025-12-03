package com.example.b_food_ordering.Controller;

import com.example.b_food_ordering.Dto.ReviewRequestDTO;
import com.example.b_food_ordering.Service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewRequestDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            Map<String, Object> body = new HashMap<>();
            body.put("error", "Chưa đăng nhập hoặc token không hợp lệ");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
        }

        String username = authentication.getName();
        reviewService.createReview(username, dto);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "Đánh giá thành công");
        return ResponseEntity.ok(body);
    }
}
