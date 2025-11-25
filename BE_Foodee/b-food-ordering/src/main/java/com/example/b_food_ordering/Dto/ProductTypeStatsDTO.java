package com.example.b_food_ordering.Dto;

public class ProductTypeStatsDTO {

    private String name;
    private Long totalProducts;

    public ProductTypeStatsDTO(String name, Long totalProducts) {
        this.name = name;
        this.totalProducts = totalProducts;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }
}
