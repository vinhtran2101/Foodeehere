package com.example.b_food_ordering.Service;

import jakarta.servlet.http.HttpServletRequest;

public interface IVNPayService {
    String createPaymentUrl(Long orderId, HttpServletRequest request);
}
