package com.example.b_food_ordering.Repository;

import com.example.b_food_ordering.Entity.Category;
import com.example.b_food_ordering.Entity.Product;
import com.example.b_food_ordering.Entity.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import com.example.b_food_ordering.Dto.ProductTypeStatsDTO;



import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT new com.example.b_food_ordering.Dto.ProductTypeStatsDTO(pt.name, COUNT(p)) " +
            "FROM Product p JOIN p.productType pt " +
            "GROUP BY pt.name")
    List<ProductTypeStatsDTO> countProductsByType();


    // Tìm sản phẩm theo danh mục (Category entity)
    List<Product> findByCategory(Category category);

    // Tìm sản phẩm theo ID danh mục
    List<Product> findByCategoryId(Long categoryId);

    // Tìm sản phẩm theo loại sản phẩm (ProductType entity)
    List<Product> findByProductType(ProductType productType);

    // Tìm sản phẩm theo ID loại sản phẩm
    List<Product> findByProductTypeId(Long productTypeId);

    // Tìm sản phẩm theo tên (gần đúng, không phân biệt hoa thường)
    List<Product> findByNameContainingIgnoreCase(String name);

    // Kiểm tra sự tồn tại của sản phẩm theo tên
    boolean existsByName(String name);

    // Kiểm tra sự tồn tại của sản phẩm theo ID loại sản phẩm
    boolean existsByProductTypeId(Long productTypeId);

    // Kiểm tra sự tồn tại của sản phẩm theo ID danh mục
    boolean existsByCategoryId(Long categoryId);

    // 🔹 Đếm số sản phẩm theo trạng thái (AVAILABLE / OUT_OF_STOCK / DISCONTINUED)
    long countByStatus(String status);
}