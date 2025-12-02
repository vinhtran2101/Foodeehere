package com.example.b_food_ordering.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderStatusSummaryDTO {
    private String status;  // PENDING, CONFIRMED, ...
    private long count;     // số đơn
}
