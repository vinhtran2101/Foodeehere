package com.example.b_food_ordering.Controller;

import com.example.b_food_ordering.Config.JwtUtil;
import com.example.b_food_ordering.Dto.LoginDTO;
import com.example.b_food_ordering.Dto.RegisterDTO;
import com.example.b_food_ordering.Entity.User;
import com.example.b_food_ordering.Service.PasswordResetService;
import com.example.b_food_ordering.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetService passwordResetService;

    public AuthController(UserService userService,
                          JwtUtil jwtUtil,
                          UserDetailsService userDetailsService,
                          AuthenticationManager authenticationManager,
                          PasswordResetService passwordResetService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.authenticationManager = authenticationManager;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO registerDTO) {
        User user = userService.registerUser(
                registerDTO.getUsername(),
                registerDTO.getPassword(),
                registerDTO.getEmail(),
                registerDTO.getFullname(),
                registerDTO.getAddress(),
                registerDTO.getPhoneNumber(),
                "USER"
        );
        return ResponseEntity.ok("Đăng ký người dùng thành công");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDTO.getUsername(), loginDTO.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            Set<String> roles = userDetails.getAuthorities().stream()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .collect(Collectors.toSet());

            String token = jwtUtil.generateToken(userDetails.getUsername(), roles);
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(401).body("Thông tin đăng nhập không hợp lệ");
        }
    }

    // =========================
    //  Endpoint chẩn đoán bcrypt
    // Ví dụ gọi:
    // GET http://localhost:8080/api/auth/_diag/matches?username=admin&raw=123456
    // =========================
    @GetMapping("/_diag/matches")
    public Map<String, Object> diag(@RequestParam String username,
                                    @RequestParam String raw,
                                    org.springframework.security.crypto.password.PasswordEncoder encoder,
                                    org.springframework.security.core.userdetails.UserDetailsService uds) {
        UserDetails ud = uds.loadUserByUsername(username);
        boolean ok = encoder.matches(raw, ud.getPassword());
        Map<String, Object> r = new HashMap<>();
        r.put("username", username);
        r.put("raw", raw);
        r.put("hash", ud.getPassword());
        r.put("len", ud.getPassword() == null ? 0 : ud.getPassword().length());
        r.put("matches", ok);
        return r;
    }

    // ========== QUÊN MẬT KHẨU ==========
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email không được để trống");
        }

        passwordResetService.createPasswordResetToken(email);
        // Luôn trả về thành công, không cho biết email có tồn tại hay không
        return ResponseEntity.ok("Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu.");
    }

    // ========== ĐẶT LẠI MẬT KHẨU ==========
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> req) {
        String token = req.get("token");
        String newPassword = req.get("newPassword");

        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body("Thiếu token hoặc mật khẩu mới");
        }

        boolean ok = passwordResetService.resetPassword(token, newPassword);
        if (ok) {
            return ResponseEntity.ok("Đặt lại mật khẩu thành công");
        } else {
            return ResponseEntity.badRequest().body("Token không hợp lệ hoặc đã hết hạn");
        }
    }

}
