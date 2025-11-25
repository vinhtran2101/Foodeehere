# ==========================================
#  Foodee Backend - Dev Runner (PowerShell)
# ==========================================

Write-Host " Starting Foodee Backend (Spring Boot)..." -ForegroundColor Cyan

# --- CONFIG DATABASE ---
$env:SPRING_DATASOURCE_URL = "jdbc:mysql://localhost:3306/foodee?useSSL=false&serverTimezone=UTC"
$env:SPRING_DATASOURCE_USERNAME = "root"
$env:SPRING_DATASOURCE_PASSWORD = "vinh"   

# --- CONFIG JWT ---
$env:JWT_SECRET = "U7k2nVZQPHQ9F3tWzRzJQ3ZQFqA8rC2nL5m9X0pB6tR1yD8kS4vM1xN6cG7hJ2q"
$env:JWT_EXPIRATION = "86400000"  # 1 ngày (ms)

# --- CONFIG GROQ (Chatbot API) ---
$env:GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE"

# --- RUN SPRING BOOT ---
mvn spring-boot:run

Write-Host "✅ Backend stopped. Goodbye!" -ForegroundColor Green
