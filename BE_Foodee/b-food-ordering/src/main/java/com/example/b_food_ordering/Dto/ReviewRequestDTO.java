package com.example.b_food_ordering.Dto;

import lombok.Data;

@Data
public class ReviewRequestDTO {
    private Long orderId;
    private Long productId;
    private int rating;
    private String comment;
}
