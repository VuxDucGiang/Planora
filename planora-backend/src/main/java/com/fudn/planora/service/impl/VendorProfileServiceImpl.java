package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.AddCollectionImageRequest;
import com.fudn.planora.dto.request.CreateCollectionRequest;
import com.fudn.planora.dto.request.CreatePortfolioRequest;
import com.fudn.planora.dto.request.UpdateCollectionRequest;
import com.fudn.planora.dto.request.VendorProfileRequest;
import com.fudn.planora.dto.response.CollectionImageResponse;
import com.fudn.planora.dto.response.CollectionResponse;
import com.fudn.planora.dto.response.PortfolioResponse;
import com.fudn.planora.dto.response.VendorProfileResponse;
import com.fudn.planora.entity.User;
import com.fudn.planora.entity.Vendor;
import com.fudn.planora.entity.VendorCollection;
import com.fudn.planora.entity.VendorCollectionImage;
import com.fudn.planora.entity.VendorPortfolio;
import com.fudn.planora.entity.WeddingStyle;
import com.fudn.planora.repository.UserRepository;
import com.fudn.planora.repository.VendorCollectionImageRepository;
import com.fudn.planora.repository.VendorCollectionRepository;
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
    private final VendorCollectionRepository collectionRepository;
    private final VendorCollectionImageRepository collectionImageRepository;
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
    @Transactional
    public VendorProfileResponse updateAvatar(String email, String avatarUrl) {
        Vendor vendor = getOrCreateVendorForUser(email);
        User user = vendor.getUser();
        user.setAvatarUrl(avatarUrl != null && !avatarUrl.isBlank() ? avatarUrl.trim() : null);
        userRepository.save(user);
        return mapToProfileResponse(vendor);
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

    // ==========================================
    // MULTI-ALBUM COLLECTION MANAGEMENT
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<CollectionResponse> getMyCollections(String email) {
        Vendor vendor = getOrCreateVendorForUser(email);
        List<VendorCollection> collections = collectionRepository.findByVendorIdOrderByCreatedAtDesc(vendor.getId());
        return collections.stream().map(this::mapToCollectionResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CollectionResponse getMyCollectionDetail(String email, Long collectionId) {
        Vendor vendor = getOrCreateVendorForUser(email);
        VendorCollection collection = collectionRepository.findByIdAndVendorId(collectionId, vendor.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bộ sưu tập có ID: " + collectionId));
        return mapToCollectionResponse(collection);
    }

    @Override
    @Transactional
    public CollectionResponse createCollection(String email, CreateCollectionRequest request) {
        Vendor vendor = getOrCreateVendorForUser(email);

        String coverImage = request.getCoverImageUrl() != null && !request.getCoverImageUrl().isBlank()
                ? request.getCoverImageUrl().trim()
                : null;

        if (coverImage == null && request.getInitialImages() != null && !request.getInitialImages().isEmpty()) {
            coverImage = request.getInitialImages().get(0).getImageUrl().trim();
        }

        VendorCollection collection = VendorCollection.builder()
                .vendor(vendor)
                .title(request.getTitle().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .coverImageUrl(coverImage)
                .build();

        VendorCollection saved = collectionRepository.save(collection);

        // Add initial images if provided
        if (request.getInitialImages() != null && !request.getInitialImages().isEmpty()) {
            List<VendorCollectionImage> images = new ArrayList<>();
            for (AddCollectionImageRequest imgReq : request.getInitialImages()) {
                if (imgReq.getImageUrl() != null && !imgReq.getImageUrl().isBlank()) {
                    VendorCollectionImage img = VendorCollectionImage.builder()
                            .collection(saved)
                            .imageUrl(imgReq.getImageUrl().trim())
                            .title(imgReq.getTitle() != null ? imgReq.getTitle().trim() : null)
                            .build();
                    images.add(img);
                }
            }
            if (!images.isEmpty()) {
                collectionImageRepository.saveAll(images);
                saved.setImages(images);
            }
        }

        return mapToCollectionResponse(saved);
    }

    @Override
    @Transactional
    public CollectionResponse updateCollection(String email, Long collectionId, UpdateCollectionRequest request) {
        Vendor vendor = getOrCreateVendorForUser(email);
        VendorCollection collection = collectionRepository.findByIdAndVendorId(collectionId, vendor.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bộ sưu tập có ID: " + collectionId));

        collection.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) {
            collection.setDescription(request.getDescription().trim());
        }
        if (request.getCoverImageUrl() != null && !request.getCoverImageUrl().isBlank()) {
            collection.setCoverImageUrl(request.getCoverImageUrl().trim());
        }

        VendorCollection updated = collectionRepository.save(collection);
        return mapToCollectionResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCollection(String email, Long collectionId) {
        Vendor vendor = getOrCreateVendorForUser(email);
        VendorCollection collection = collectionRepository.findByIdAndVendorId(collectionId, vendor.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bộ sưu tập có ID: " + collectionId));

        // Cascade delete will delete all VendorCollectionImages automatically
        collectionRepository.delete(collection);
    }

    @Override
    @Transactional
    public CollectionImageResponse addImageToCollection(String email, Long collectionId, AddCollectionImageRequest request) {
        Vendor vendor = getOrCreateVendorForUser(email);
        VendorCollection collection = collectionRepository.findByIdAndVendorId(collectionId, vendor.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bộ sưu tập có ID: " + collectionId));

        VendorCollectionImage img = VendorCollectionImage.builder()
                .collection(collection)
                .imageUrl(request.getImageUrl().trim())
                .title(request.getTitle() != null ? request.getTitle().trim() : null)
                .build();

        VendorCollectionImage saved = collectionImageRepository.save(img);

        // If collection has no cover image yet, set this new image as the cover
        if (collection.getCoverImageUrl() == null || collection.getCoverImageUrl().isBlank()) {
            collection.setCoverImageUrl(saved.getImageUrl());
            collectionRepository.save(collection);
        }

        return mapToImageResponse(saved);
    }

    @Override
    @Transactional
    public void deleteImageFromCollection(String email, Long collectionId, Long imageId) {
        Vendor vendor = getOrCreateVendorForUser(email);
        VendorCollection collection = collectionRepository.findByIdAndVendorId(collectionId, vendor.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bộ sưu tập có ID: " + collectionId));

        VendorCollectionImage image = collectionImageRepository.findByIdAndCollectionId(imageId, collection.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh có ID: " + imageId + " trong bộ sưu tập này!"));

        String deletedImageUrl = image.getImageUrl();
        collectionImageRepository.delete(image);

        // If the deleted image was the cover image, update cover image to another image if available
        if (deletedImageUrl != null && deletedImageUrl.equals(collection.getCoverImageUrl())) {
            List<VendorCollectionImage> remaining = collectionImageRepository.findByCollectionIdOrderByCreatedAtDesc(collection.getId());
            if (!remaining.isEmpty()) {
                collection.setCoverImageUrl(remaining.get(0).getImageUrl());
            } else {
                collection.setCoverImageUrl(null);
            }
            collectionRepository.save(collection);
        }
    }

    private CollectionResponse mapToCollectionResponse(VendorCollection collection) {
        List<VendorCollectionImage> imageEntities = collection.getImages() != null
                ? collection.getImages()
                : collectionImageRepository.findByCollectionIdOrderByCreatedAtDesc(collection.getId());

        List<CollectionImageResponse> imageResponses = imageEntities.stream()
                .map(this::mapToImageResponse)
                .collect(Collectors.toList());

        String cover = collection.getCoverImageUrl();
        if ((cover == null || cover.isBlank()) && !imageResponses.isEmpty()) {
            cover = imageResponses.get(0).getImageUrl();
        }

        return CollectionResponse.builder()
                .id(collection.getId())
                .vendorId(collection.getVendor().getId())
                .title(collection.getTitle())
                .description(collection.getDescription())
                .coverImageUrl(cover)
                .imagesCount(imageResponses.size())
                .images(imageResponses)
                .createdAt(collection.getCreatedAt())
                .updatedAt(collection.getUpdatedAt())
                .build();
    }

    private CollectionImageResponse mapToImageResponse(VendorCollectionImage img) {
        return CollectionImageResponse.builder()
                .id(img.getId())
                .collectionId(img.getCollection() != null ? img.getCollection().getId() : null)
                .imageUrl(img.getImageUrl())
                .title(img.getTitle())
                .createdAt(img.getCreatedAt())
                .build();
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

        List<VendorCollection> collectionList = collectionRepository.findByVendorIdOrderByCreatedAtDesc(vendor.getId());
        List<CollectionResponse> collections = collectionList.stream()
                .map(this::mapToCollectionResponse)
                .collect(Collectors.toList());

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
                .collections(collections)
                .build();
    }
}
