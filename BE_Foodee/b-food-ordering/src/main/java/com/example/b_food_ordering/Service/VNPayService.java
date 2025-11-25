package com.example.b_food_ordering.Service;

import com.example.b_food_ordering.Config.VnPayConfig;
import com.example.b_food_ordering.Entity.Order;
import com.example.b_food_ordering.Payment.VnPayUtil;
import com.example.b_food_ordering.Repository.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VNPayService implements IVNPayService {

    private final VnPayConfig vnPayConfig;
    private final OrderRepository orderRepository;

    @Override
    public String createPaymentUrl(Long orderId, HttpServletRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));

        // VNPay yêu cầu *100 và là số nguyên
        double totalAmount = order.getTotalAmount();
        long amount = Math.round(totalAmount * 100);

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", String.valueOf(order.getId()));
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang #" + order.getId());
        vnpParams.put("vnp_OrderType", "billpayment");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", VnPayUtil.getIpAddress(request));

        // TIMEZONE Việt Nam
        TimeZone tz = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");
        Calendar cal = Calendar.getInstance(tz);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        sdf.setTimeZone(tz);

        String createDate = sdf.format(cal.getTime());
        vnpParams.put("vnp_CreateDate", createDate);

        cal.add(Calendar.MINUTE, 15);
        String expireDate = sdf.format(cal.getTime());
        vnpParams.put("vnp_ExpireDate", expireDate);

        // Sort key
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String fieldValue = vnpParams.get(fieldName);

            if (fieldValue != null && !fieldValue.isEmpty()) {
                // Encode giống nhau cho hashData & query
                String encodedName = URLEncoder.encode(fieldName, StandardCharsets.UTF_8);
                String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8);

                hashData.append(encodedName).append('=').append(encodedValue);
                query.append(encodedName).append('=').append(encodedValue);

                if (i < fieldNames.size() - 1) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }

        // Kiểu chữ ký
        query.append("&vnp_SecureHashType=HMACSHA512");

        String hashSecret = vnPayConfig.getHashSecret() == null
                ? ""
                : vnPayConfig.getHashSecret().trim();

        String secureHash = VnPayUtil.hmacSHA512(hashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        String finalUrl = vnPayConfig.getPayUrl() + "?" + query;
        System.out.println("VNPay hashData  = " + hashData);
        System.out.println("VNPay URL       = " + finalUrl);

        return finalUrl;
    }

    // Dùng cho /vnpay/confirm để cập nhật trạng thái đơn
    public boolean handleVnPayIpn(HttpServletRequest request) {

        String orderIdStr = request.getParameter("vnp_TxnRef");
        String responseCode = request.getParameter("vnp_ResponseCode");
        String transactionStatus = request.getParameter("vnp_TransactionStatus");

        if (orderIdStr == null) return false;

        Long orderId;
        try {
            orderId = Long.valueOf(orderIdStr);
        } catch (NumberFormatException e) {
            return false;
        }

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return false;

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setOrderStatus(Order.OrderStatus.CONFIRMED);
        } else {
            order.setPaymentStatus(Order.PaymentStatus.FAILED);
        }

        orderRepository.save(order);
        return true;
    }
}
