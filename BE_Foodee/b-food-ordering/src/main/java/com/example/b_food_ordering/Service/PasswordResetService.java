package com.example.b_food_ordering.Service;

import com.example.b_food_ordering.Entity.PasswordResetToken;
import com.example.b_food_ordering.Entity.User;
import com.example.b_food_ordering.Repository.PasswordResetTokenRepository;
import com.example.b_food_ordering.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // Tạo token reset cho email (nếu tồn tại)
    public void createPasswordResetToken(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            // Không báo lỗi để tránh lộ thông tin user tồn tại hay không
            return;
        }

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        resetToken.setUsed(false);

        tokenRepository.save(resetToken);

        String resetLink = "http://localhost:5173/reset-password?token=" + token;

        // ✅ Gửi mail thật
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);

        // (Có thể giữ lại để debug)
        System.out.println("RESET PASSWORD LINK: " + resetLink);
    }

    // Đặt lại mật khẩu
    public boolean resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElse(null);

        if (resetToken == null
                || resetToken.isUsed()
                || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        return true;
    }
}
