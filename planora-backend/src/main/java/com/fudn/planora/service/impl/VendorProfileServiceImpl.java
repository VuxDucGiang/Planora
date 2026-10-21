package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.CreatePortfolioRequest;
import com.fudn.planora.dto.request.VendorProfileRequest;
import com.fudn.planora.dto.response.PortfolioResponse;
import com.fudn.planora.dto.response.VendorProfileResponse;
import com.fudn.planora.entity.User;
import com.fudn.planora.entity.Vendor;
import com.fudn.planora.entity.VendorPortfolio;
import com.fudn.planora.entity.WeddingStyle;
import com.fudn.planora.repository.UserRepository;
import com.fudn.planora.repository.VendorPortfolioRepository;
import com.fudn.planora.repository.VendorRepository;
import com.fudn.planora.repository.WeddingStyleRepository;
import com.fudn.planora.service.VendorProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VendorProfileServiceImpl implements VendorProfileService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final VendorPortfolioRepository portfolioRepository;
    private final WeddingStyleRepository weddingStyleRepository;

    private Vendor getOrCreateVendorForUser(String email) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng có email: " + email));

        return vendorRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    log.info("Tạo mới bản ghi Vendor cho người dùng: {}", email);
                    Vendor newVendor = Vendor.builder()
                            .user(user)
                            .businessName(user.getFullname() != null ? user.getFullname() : "Thương hiệu cưới")
                            .description("")
                            .experienceYears(0)
                            .verified(false)
                            .ratingAverage(0.0)
                            .totalReviews(0)
                            .build();
                    return vendorRepository.save(newVendor);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public VendorProfileResponse getMyProfile(String email) {
        Vendor vendor = getOrCreateVendorForUser(email);
        return mapToProfileResponse(vendor);
    }

    @Override
    @Transactional
    public VendorProfileResponse updateMyProfile(String email, VendorProfileRequest request) {
        Vendor vendor = getOrCreateVendorForUser(email);
        User user = vendor.getUser();

        // Update basic business information
        vendor.setBusinessName(request.getBusinessName().trim());
        if (request.getDescription() != null) {
            vendor.setDescription(request.getDescription().trim());
        }
        if (request.getExperienceYears() != null) {
            vendor.setExperienceYears(request.getExperienceYears());
        }
        if (request.getCity() != null) {
            vendor.setCity(request.getCity().trim());
        }
        if (request.getDistrict() != null) {
            vendor.setDistrict(request.getDistrict().trim());
        }

        // Update styles if provided
        if (request.getStyleIds() != null) {
            List<WeddingStyle> styles = weddingStyleRepository.findAllById(request.getStyleIds());
            vendor.setWeddingStyles(new HashSet<>(styles));
        }

        // Update user contact & avatar
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        userRepository.save(user);

        Vendor updated = vendorRepository.save(vendor);
        return mapToProfileResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PortfolioResponse> getMyPortfolios(String email) {
        Vendor vendor = getOrCreateVendorForUser(email);
        List<VendorPortfolio> portfolios = portfolioRepository.findByVendorIdOrderByCreatedAtDesc(vendor.getId());
        return portfolios.stream()
                .map(p -> PortfolioResponse.builder()
                        .id(p.getId())
                        .imageUrl(p.getImageUrl())
                        .title(p.getTitle())
                        .description(p.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PortfolioResponse addPortfolioItem(String email, CreatePortfolioRequest request) {
        Vendor vendor = getOrCreateVendorForUser(email);

        VendorPortfolio portfolio = VendorPortfolio.builder()
                .vendor(vendor)
                .imageUrl(request.getImageUrl().trim())
                .title(request.getTitle() != null ? request.getTitle().trim() : null)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .build();

        VendorPortfolio saved = portfolioRepository.save(portfolio);
        return PortfolioResponse.builder()
                .id(saved.getId())
                .imageUrl(saved.getImageUrl())
                .title(saved.getTitle())
                .description(saved.getDescription())
                .build();
    }

    @Override
    @Transactional
    public void deletePortfolioItem(String email, Long portfolioId) {
        Vendor vendor = getOrCreateVendorForUser(email);

        VendorPortfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tác phẩm trong bộ sưu tập có ID: " + portfolioId));

        if (!portfolio.getVendor().getId().equals(vendor.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa tác phẩm này!");
        }

        portfolioRepository.delete(portfolio);
    }

    private VendorProfileResponse mapToProfileResponse(Vendor vendor) {
        User user = vendor.getUser();
        Set<WeddingStyle> styles = vendor.getWeddingStyles() != null ? vendor.getWeddingStyles() : Collections.emptySet();
        List<PortfolioResponse> portfolios = vendor.getPortfolios() != null
                ? vendor.getPortfolios().stream()
                .map(p -> PortfolioResponse.builder()
                        .id(p.getId())
                        .imageUrl(p.getImageUrl())
                        .title(p.getTitle())
                        .description(p.getDescription())
                        .build())
                .collect(Collectors.toList())
                : Collections.emptyList();

        return VendorProfileResponse.builder()
                .id(vendor.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .businessName(vendor.getBusinessName())
                .description(vendor.getDescription())
                .experienceYears(vendor.getExperienceYears())
                .city(vendor.getCity())
                .district(vendor.getDistrict())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .verified(vendor.getVerified())
                .ratingAverage(vendor.getRatingAverage())
                .totalReviews(vendor.getTotalReviews())
                .styleIds(styles.stream().map(WeddingStyle::getId).collect(Collectors.toSet()))
                .styles(styles.stream().map(WeddingStyle::getName).collect(Collectors.toSet()))
                .portfolios(portfolios)
                .build();
    }
}
