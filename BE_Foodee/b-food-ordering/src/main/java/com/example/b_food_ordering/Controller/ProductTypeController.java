package com.example.b_food_ordering.Controller;

import com.example.b_food_ordering.Dto.ProductTypeDTO;
import com.example.b_food_ordering.Dto.ProductTypeStatsDTO;
import com.example.b_food_ordering.Service.ProductTypeService;
import com.example.b_food_ordering.Service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-types")
public class ProductTypeController {

    @Autowired
    private ProductTypeService productTypeService;

    @Autowired
    private ProductService productService;  // ⭐ thêm đúng chỗ đúng style

    // Tạo loại sản phẩm mới
    @PostMapping
    public ResponseEntity<ProductTypeDTO> createProductType(@RequestBody ProductTypeDTO productTypeDTO) {
        ProductTypeDTO createdProductType = productTypeService.createProductType(productTypeDTO);
        return ResponseEntity.ok(createdProductType);
    }

    // Lấy tất cả loại sản phẩm
    @GetMapping
    public ResponseEntity<List<ProductTypeDTO>> getAllProductTypes() {
        List<ProductTypeDTO> productTypes = productTypeService.getAllProductTypes();
        return ResponseEntity.ok(productTypes);
    }

    // ⭐⭐ API thống kê số lượng sản phẩm theo loại
    @GetMapping("/stats")
    public ResponseEntity<List<ProductTypeStatsDTO>> getProductTypeStats() {
        List<ProductTypeStatsDTO> stats = productService.getProductTypeStats();
        return ResponseEntity.ok(stats);
    }

    // Lấy loại sản phẩm theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductTypeDTO> getProductTypeById(@PathVariable Long id) {
        ProductTypeDTO productType = productTypeService.getProductTypeById(id);
        return ResponseEntity.ok(productType);
    }

    // Cập nhật loại sản phẩm
    @PutMapping("/{id}")
    public ResponseEntity<ProductTypeDTO> updateProductType(@PathVariable Long id, @RequestBody ProductTypeDTO productTypeDTO) {
        ProductTypeDTO updatedProductType = productTypeService.updateProductType(id, productTypeDTO);
        return ResponseEntity.ok(updatedProductType);
    }

    // Xóa loại sản phẩm
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductType(@PathVariable Long id) {
        productTypeService.deleteProductType(id);
        return ResponseEntity.noContent().build();
    }
}
