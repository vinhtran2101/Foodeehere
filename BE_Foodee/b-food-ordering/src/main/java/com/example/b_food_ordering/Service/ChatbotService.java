package com.example.b_food_ordering.Service;

import com.example.b_food_ordering.Dto.ProductDTO;
import com.example.b_food_ordering.Dto.ProductTypeDTO;
import com.example.b_food_ordering.Dto.CategoryDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.text.DecimalFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    private static final Logger logger = LoggerFactory.getLogger(ChatbotService.class);
    private static final DecimalFormat DECIMAL_FORMAT = new DecimalFormat("#,##0");

    private final ProductService productService;
    private final ProductTypeService productTypeService;
    private final CategoryService categoryService;
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Autowired
    public ChatbotService(ProductService productService,
                          ProductTypeService productTypeService,
                          CategoryService categoryService,
                          OkHttpClient httpClient,
                          ObjectMapper objectMapper) {
        this.productService = productService;
        this.productTypeService = productTypeService;
        this.categoryService = categoryService;
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> processChatQuery(String userQuery) {
        Map<String, Object> response = new HashMap<>();

        if (userQuery == null || userQuery.trim().isEmpty()) {
            response.put("message", "Câu hỏi không được để trống.");
            response.put("reply", "");
            response.put("products", new ArrayList<>());
            return response;
        }

        try {
            // 1. RAG - truy xuất món từ DB
            List<ProductDTO> products = fetchRelevantProducts(userQuery);

            // 2. Tóm tắt món ăn thành text cho AI đọc
            String productSummary = generateProductSummary(products);

            // 3. Build PROMPT rõ ràng cho Groq
            String prompt = String.format(
                    """
                    Bạn là chatbot tư vấn món ăn cho hệ thống Foodee.

                    NGUYÊN TẮC QUAN TRỌNG:
                    - Chỉ được sử dụng thông tin TRONG DANH SÁCH SẢN PHẨM bên dưới.
                    - Nếu danh sách sản phẩm trống hoặc không phù hợp với câu hỏi,
                      hãy trả lời: "Hiện tại Foodee chưa có món phù hợp với yêu cầu này. 
                      Bạn có thể thử yêu cầu khác hoặc xem thêm trong menu."
                    - Không được tự bịa thêm món không có trong danh sách.
                    - Nếu có nhiều món phù hợp, hãy gợi ý 1–3 món tiêu biểu, kèm lý do ngắn gọn.

                    THÔNG TIN ĐẦU VÀO:
                    - Câu hỏi người dùng: %s

                    - Danh sách sản phẩm (mã, tên, loại, danh mục, giá, trạng thái giảm giá):
                    %s

                    Hãy trả lời thân thiện, súc tích bằng tiếng Việt.
                    """,
                    userQuery,
                    productSummary.isBlank() ? "(Không có sản phẩm nào được tìm thấy)" : productSummary
            );

            // 4. Gọi Groq sinh câu trả lời
            String botReply = callGroqApi(prompt);

            response.put("message", products.isEmpty()
                    ? "Không tìm thấy sản phẩm phù hợp."
                    : "Tư vấn thành công.");
            response.put("reply", botReply);
            response.put("products", products);
        } catch (Exception e) {
            logger.error("Lỗi khi xử lý câu hỏi chatbot", e);
            response.put("message", "Đã xảy ra lỗi khi xử lý câu hỏi: " + e.getMessage());
            response.put("reply", "");
            response.put("products", new ArrayList<>());
        }

        return response;
    }

    // RAG: Bước 1 - Truy xuất món ăn phù hợp từ database
    private List<ProductDTO> fetchRelevantProducts(String userQuery) {
        // 1. Lấy toàn bộ sản phẩm đang bán
        List<ProductDTO> allAvailable = productService.getAllProducts().stream()
                .filter(p -> "AVAILABLE".equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.toList());

        // Query rỗng -> random vài món gợi ý
        if (userQuery == null || userQuery.trim().isEmpty()) {
            Collections.shuffle(allAvailable);
            return allAvailable.stream().limit(5).collect(Collectors.toList());
        }

        // 2. Chuẩn hóa câu hỏi
        String lower = userQuery.toLowerCase(Locale.ROOT).trim();
        String normalized = lower
                .replaceAll("[?!.]", " ")
                .replaceAll("\\s+", " ")
                .trim();

        // 3. Xóa bớt stop-word tiếng Việt phổ biến
        String cleaned = normalized.replaceAll(
                "\\b(tìm|món|ăn|gì|gợi|gợi ý|giúp|tư vấn|về|đề xuất|" +
                        "có|không|các|những|nào|cho|em|anh|chị|mình|tôi|ta|bạn|quán|nhà hàng)\\b",
                ""
        ).replaceAll("\\s+", " ").trim();

        // 4. Cắt thành list keyword
        List<String> keywords = Arrays.stream(cleaned.split("\\s+"))
                .filter(w -> w != null && !w.isBlank() && w.length() > 1)
                .collect(Collectors.toList());

        // Nếu rỗng: lấy từ cuối câu làm keyword (thường là "cơm", "gà", "trà sữa"...)
        if (keywords.isEmpty()) {
            String[] tokens = normalized.split("\\s+");
            if (tokens.length > 0) {
                String last = tokens[tokens.length - 1];
                if (last.length() > 1) {
                    keywords = Collections.singletonList(last);
                }
            }
        }

        // Nếu vẫn rỗng -> random
        if (keywords.isEmpty()) {
            Collections.shuffle(allAvailable);
            return allAvailable.stream().limit(5).collect(Collectors.toList());
        }

        logger.info("Chatbot keywords: {}", keywords);

        // 5. Dùng map để loại trùng món
        Map<Long, ProductDTO> dedupById = new LinkedHashMap<>();

        for (String kw : keywords) {
            String kwTrim = kw.trim();
            if (kwTrim.isEmpty()) continue;

            // 5.1 Tìm theo TÊN món
            try {
                List<ProductDTO> byName = productService.searchProductsByName(kwTrim).stream()
                        .filter(p -> "AVAILABLE".equalsIgnoreCase(p.getStatus()))
                        .collect(Collectors.toList());
                byName.forEach(p -> dedupById.putIfAbsent(p.getId(), p));
                logger.info("Found %d products by NAME for '%s'".formatted(byName.size(), kwTrim));
            } catch (IllegalArgumentException e) {
                logger.warn("Error search by name '{}': {}", kwTrim, e.getMessage());
            }

            // 5.2 Tìm theo LOẠI món (product type)
            try {
                productTypeService.getAllProductTypes().stream()
                        .filter(pt -> pt.getName() != null &&
                                pt.getName().toLowerCase(Locale.ROOT).contains(kwTrim))
                        .findFirst()
                        .ifPresent(pt -> {
                            List<ProductDTO> byType = productService.getProductsByProductTypeId(pt.getId()).stream()
                                    .filter(p -> "AVAILABLE".equalsIgnoreCase(p.getStatus()))
                                    .collect(Collectors.toList());
                            byType.forEach(p -> dedupById.putIfAbsent(p.getId(), p));
                            logger.info("Found {} products by TYPE '{}' (kw '{}')",
                                    byType.size(), pt.getName(), kwTrim);
                        });
            } catch (Exception e) {
                logger.warn("Error search by type '{}': {}", kwTrim, e.getMessage());
            }

            // 5.3 Tìm theo DANH MỤC món (category)
            try {
                categoryService.getAllCategories().stream()
                        .filter(c -> c.getName() != null &&
                                c.getName().toLowerCase(Locale.ROOT).contains(kwTrim))
                        .findFirst()
                        .ifPresent(cat -> {
                            List<ProductDTO> byCat = productService.getProductsByCategoryId(cat.getId()).stream()
                                    .filter(p -> "AVAILABLE".equalsIgnoreCase(p.getStatus()))
                                    .collect(Collectors.toList());
                            byCat.forEach(p -> dedupById.putIfAbsent(p.getId(), p));
                            logger.info("Found {} products by CATEGORY '{}' (kw '{}')",
                                    byCat.size(), cat.getName(), kwTrim);
                        });
            } catch (Exception e) {
                logger.warn("Error search by category '{}': {}", kwTrim, e.getMessage());
            }
        }

        List<ProductDTO> collected = new ArrayList<>(dedupById.values());

        // 6. Nếu không tìm được gì, fallback random
        if (collected.isEmpty()) {
            logger.info("No product found for query '{}', fallback random", userQuery);
            Collections.shuffle(allAvailable);
            return allAvailable.stream().limit(5).collect(Collectors.toList());
        }

        // 7. Xáo trộn nhẹ và giới hạn 5 món
        Collections.shuffle(collected);
        return collected.stream().limit(5).collect(Collectors.toList());
    }

    // Tóm tắt danh sách món cho Groq đọc – dùng đúng field của ProductDTO
    private String generateProductSummary(List<ProductDTO> products) {
        if (products == null || products.isEmpty()) {
            return "Không có sản phẩm nào đang có sẵn.";
        }

        return products.stream()
                .limit(5) // Giới hạn tối đa 5 sản phẩm
                .map(p -> {
                    String name = p.getName() != null ? p.getName() : "Không xác định";
                    String productTypeName = p.getProductTypeName() != null ? p.getProductTypeName() : "Không xác định";
                    String categoryName = p.getCategoryName() != null ? p.getCategoryName() : "Không có";
                    String status = p.getStatus() != null ? p.getStatus() : "Không xác định";

                    double original = p.getOriginalPrice();
                    double discounted = p.getDiscountedPrice();
                    double discountPercent = p.getDiscount(); // %

                    String originalPrice = DECIMAL_FORMAT.format(original);
                    String discountedPrice;
                    String discountInfo;

                    // Có giảm giá khi discounted > 0 và < giá gốc
                    if (discounted > 0 && discounted < original) {
                        discountedPrice = DECIMAL_FORMAT.format(discounted) + " VND";
                        if (discountPercent > 0) {
                            discountInfo = DECIMAL_FORMAT.format(discountPercent) + " %";
                        } else {
                            discountInfo = "Không rõ %";
                        }
                    } else {
                        discountedPrice = "Không áp dụng";
                        discountInfo = "0 %";
                    }

                    return String.format(
                            "Tên: %s, Loại: %s, Danh mục: %s, Giá gốc: %s VND, Giá sau giảm: %s, Giảm: %s, Trạng thái: %s",
                            name,
                            productTypeName,
                            categoryName,
                            originalPrice,
                            discountedPrice,
                            discountInfo,
                            status
                    );
                })
                .collect(Collectors.joining("\n"));
    }

    private String callGroqApi(String prompt) throws IOException {
        logger.info("Gửi yêu cầu tới Groq API với prompt: {}", prompt);

        // Tạo JSON body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "llama-3.1-8b-instant");
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", prompt);
        requestBody.put("messages", Arrays.asList(userMsg));
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 200);

        String jsonBody;
        try {
            jsonBody = objectMapper.writeValueAsString(requestBody);
        } catch (Exception e) {
            logger.error("Lỗi khi tạo JSON body: {}", e.getMessage());
            throw new IOException("Lỗi khi tạo JSON body: " + e.getMessage());
        }

        RequestBody body = RequestBody.create(
                jsonBody,
                MediaType.get("application/json; charset=utf-8")
        );

        Request groqRequest = new Request.Builder()
                .url("https://api.groq.com/openai/v1/chat/completions")
                .addHeader("Authorization", "Bearer " + groqApiKey)
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();

        try (Response response = httpClient.newCall(groqRequest).execute()) {
            if (!response.isSuccessful()) {
                String errorMsg = response.body() != null ? response.body().string() : response.message();
                logger.error("Lỗi từ Groq API: {} - {}", response.code(), errorMsg);
                if (response.code() == 401) {
                    throw new IOException("API key không hợp lệ hoặc không có quyền truy cập");
                } else if (response.code() == 429) {
                    throw new IOException("Vượt quá giới hạn yêu cầu API");
                } else {
                    throw new IOException("Lỗi từ Groq API: " + errorMsg);
                }
            }

            String responseBody = response.body().string();
            JsonNode root;
            try {
                root = objectMapper.readTree(responseBody);
            } catch (Exception e) {
                logger.error("Lỗi khi phân tích JSON phản hồi: {}", e.getMessage());
                throw new IOException("Phản hồi từ Groq API không hợp lệ: " + e.getMessage());
            }

            if (root == null || !root.has("choices") || !root.get("choices").isArray() || root.get("choices").size() == 0) {
                logger.warn("Phản hồi từ Groq API không hợp lệ hoặc rỗng");
                throw new IOException("Phản hồi từ Groq API không hợp lệ hoặc rỗng");
            }

            JsonNode message = root.get("choices").get(0).get("message");
            if (message == null || !message.has("content")) {
                logger.warn("Không tìm thấy nội dung trong phản hồi từ Groq API");
                return "Xin lỗi, hiện chưa có gợi ý phù hợp.";
            }

            String reply = message.get("content").asText();
            logger.info("Phản hồi từ Groq API: {}", reply);
            return reply;
        }
    }
}
