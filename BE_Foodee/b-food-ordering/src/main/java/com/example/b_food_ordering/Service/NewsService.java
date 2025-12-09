package com.example.b_food_ordering.Service;

import com.example.b_food_ordering.Dto.NewsDTO;
import com.example.b_food_ordering.Entity.News;
import com.example.b_food_ordering.Repository.NewsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NewsService {

    private final NewsRepository newsRepository;

    @Autowired
    public NewsService(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    // Ánh xạ từ Entity -> DTO
    private NewsDTO toDTO(News news) {
        NewsDTO dto = new NewsDTO();
        dto.setId(news.getId());
        dto.setTitle(news.getTitle());
        dto.setTimestamp(news.getTimestamp());
        dto.setDescription(news.getDescription());
        dto.setImageUrl(news.getImageUrl());
        dto.setUrl(news.getUrl());               // TRUYỀN URL RA DTO
        return dto;
    }

    // Ánh xạ từ DTO -> Entity
    private News toEntity(NewsDTO dto) {
        News news = new News();
        news.setId(dto.getId());
        news.setTitle(dto.getTitle());
        news.setTimestamp(
                dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now()
        );
        news.setDescription(dto.getDescription());
        news.setImageUrl(dto.getImageUrl());
        news.setUrl(dto.getUrl());               // NHẬN URL TỪ DTO
        return news;
    }

    // Tạo tin tức mới
    public NewsDTO createNews(NewsDTO newsDTO) {
        if (newsDTO == null) {
            throw new IllegalArgumentException("NewsDTO không được null");
        }

        if (newsDTO.getTitle() == null || newsDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Tiêu đề tin tức không được để trống");
        }

        // Kiểm tra trùng tiêu đề
        boolean existsTitle = newsRepository
                .findByTitleContainingIgnoreCase(newsDTO.getTitle())
                .stream()
                .anyMatch(n -> n.getTitle().equalsIgnoreCase(newsDTO.getTitle()));
        if (existsTitle) {
            throw new IllegalArgumentException(
                    "Tin tức với tiêu đề '" + newsDTO.getTitle() + "' đã tồn tại"
            );
        }

        // Kiểm tra URL ảnh nếu có
        if (newsDTO.getImageUrl() != null && !newsDTO.getImageUrl().trim().isEmpty()) {
            try {
                new URL(newsDTO.getImageUrl()).toURI();
            } catch (Exception e) {
                throw new IllegalArgumentException("URL hình ảnh không hợp lệ");
            }
        }

        // ✅ Kiểm tra URL bài viết nếu có
        if (newsDTO.getUrl() != null && !newsDTO.getUrl().trim().isEmpty()) {
            try {
                new URL(newsDTO.getUrl()).toURI();
            } catch (Exception e) {
                throw new IllegalArgumentException("URL bài viết không hợp lệ");
            }
        }

        News news = toEntity(newsDTO);
        if (news.getTimestamp() == null) {
            news.setTimestamp(LocalDateTime.now());
        }

        News saved = newsRepository.save(news);
        return toDTO(saved);
    }

    // Lấy tất cả tin tức
    public List<NewsDTO> getAllNews() {
        return newsRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Tìm kiếm theo tiêu đề
    public List<NewsDTO> searchNewsByTitle(String title) {
        return newsRepository.findByTitleContainingIgnoreCase(title)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Lấy tin tức theo ID
    public NewsDTO getNewsById(Long id) {
        Optional<News> newsOpt = newsRepository.findById(id);
        if (newsOpt.isEmpty()) {
            throw new RuntimeException("Tin tức không tồn tại với ID: " + id);
        }
        return toDTO(newsOpt.get());
    }

    // Cập nhật tin tức
    public NewsDTO updateNews(Long id, NewsDTO newsDTO) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID tin tức không hợp lệ");
        }
        if (newsDTO == null) {
            throw new IllegalArgumentException("NewsDTO không được null");
        }

        // Kiểm tra URL ảnh nếu có
        if (newsDTO.getImageUrl() != null && !newsDTO.getImageUrl().trim().isEmpty()) {
            try {
                new URL(newsDTO.getImageUrl()).toURI();
            } catch (Exception e) {
                throw new IllegalArgumentException("URL hình ảnh không hợp lệ");
            }
        }

        // ✅ Kiểm tra URL bài viết nếu có
        if (newsDTO.getUrl() != null && !newsDTO.getUrl().trim().isEmpty()) {
            try {
                new URL(newsDTO.getUrl()).toURI();
            } catch (Exception e) {
                throw new IllegalArgumentException("URL bài viết không hợp lệ");
            }
        }

        Optional<News> existingNews = newsRepository.findById(id);
        if (existingNews.isPresent()) {
            News news = existingNews.get();

            // Kiểm tra trùng tiêu đề trừ bản hiện tại
            if (!news.getTitle().equals(newsDTO.getTitle()) &&
                    newsRepository.findByTitleContainingIgnoreCase(newsDTO.getTitle()).stream()
                            .anyMatch(n -> !n.getId().equals(id))) {
                throw new IllegalArgumentException(
                        "Tin tức với tiêu đề '" + newsDTO.getTitle() + "' đã tồn tại"
                );
            }

            news.setTitle(newsDTO.getTitle());
            news.setTimestamp(
                    newsDTO.getTimestamp() != null ? newsDTO.getTimestamp() : LocalDateTime.now()
            );
            news.setDescription(newsDTO.getDescription());
            news.setImageUrl(newsDTO.getImageUrl());
            news.setUrl(newsDTO.getUrl());       // ✅ CẬP NHẬT URL BÀI VIẾT

            News updatedNews = newsRepository.save(news);
            return toDTO(updatedNews);
        } else {
            throw new RuntimeException("Tin tức không tồn tại với ID: " + id);
        }
    }

    // Xóa tin tức
    public void deleteNews(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID tin tức không hợp lệ");
        }
        if (newsRepository.existsById(id)) {
            newsRepository.deleteById(id);
        } else {
            throw new RuntimeException("Tin tức không tồn tại với ID: " + id);
        }
    }
}
