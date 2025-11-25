package com.example.b_food_ordering.Controller;

import com.example.b_food_ordering.Service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/vnpay")
@RequiredArgsConstructor
public class VnPayController {

    private final VNPayService vnPayService;

    // Tạo URL thanh toán
    @PostMapping("/create/{orderId}")
    public ResponseEntity<Map<String, Object>> createPayment(
            @PathVariable Long orderId,
            HttpServletRequest request
    ) {
        String paymentUrl = vnPayService.createPaymentUrl(orderId, request);

        Map<String, Object> body = new HashMap<>();
        body.put("orderId", orderId);
        body.put("paymentUrl", paymentUrl);

        return ResponseEntity.ok(body);
    }

    // Xác nhận kết quả thanh toán (FE gọi ở /payment/result)
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmVnPayPayment(HttpServletRequest request) {

        boolean ok = vnPayService.handleVnPayIpn(request); // <- GỌI QUA bean, KHÔNG static

        if (ok) {
            return ResponseEntity.ok("SUCCESS");
        } else {
            return ResponseEntity.badRequest().body("INVALID");
        }
    }
}
