package com.example.b_food_ordering.Config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    /**
     * BỎ QUA JWT FILTER cho các API public (chưa đăng nhập vẫn gọi được)
     * Lưu ý: CHỈ ĐƯỢC TỒN TẠI 1 shouldNotFilter trong class này.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        if (path == null) return false;

        // Auth APIs: login/register/forgot/reset...
        if (path.startsWith("/api/auth/")) return true;

        // Public APIs khác (đúng theo SecurityConfig của bạn)
        if (path.equals("/api/chatbot")) return true;

        if (path.equals("/api/products") || path.equals("/api/products/search")) return true;
        if (path.startsWith("/api/product-types")) return true;
        if (path.startsWith("/api/categories")) return true;

        if (path.equals("/api/news") || path.equals("/api/news/search")) return true;

        if (path.startsWith("/api/payments/vnpay")) return true;

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Không có header Authorization -> cho qua (KHÔNG trả 401 ở đây)
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        // Token sai/ hết hạn -> cho qua, để Security xử lý 401 ở entry point
        if (!jwtUtil.validateToken(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        String username = jwtUtil.getUsernameFromToken(token);

        // Chưa có authentication trong context thì mới set
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // (Tuỳ chọn) đọc roles từ token nếu có
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            try {
                SecretKey secretKey = jwtUtil.getSecretKey();
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(secretKey)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                Object rolesObj = claims.get("roles");
                if (rolesObj instanceof List<?>) {
                    for (Object role : (List<?>) rolesObj) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toString()));
                    }
                }
            } catch (Exception ignored) { }

            // Dùng quyền từ DB (chuẩn)
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            // Nếu muốn dùng quyền từ token thì thay userDetails.getAuthorities() bằng authorities

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}
