package com.example.b_food_ordering.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@foodee.com}")
    private String fromAddress;

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setFrom(fromAddress);
        message.setSubject("[Foodee] Đặt lại mật khẩu tài khoản của bạn");

        String content = """
                Xin chào,

                Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Foodee của mình.

                Vui lòng nhấn vào liên kết bên dưới để đặt lại mật khẩu (link có hiệu lực trong 30 phút):

                %s

                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.

                Trân trọng,
                Đội ngũ Foodee
                """.formatted(resetLink);

        message.setText(content);

        mailSender.send(message);
    }
}
