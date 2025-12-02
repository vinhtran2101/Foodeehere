package com.example.b_food_ordering.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopFoodDTO {
    private Long productId;
    private String name;    // tên món
    private Long orders;    // số lượt đặt
    private Double rating;  // tạm thời 0.0 nếu chưa có hệ thống đánh giá
}
