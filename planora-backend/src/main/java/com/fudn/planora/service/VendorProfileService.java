package com.fudn.planora.service;

import com.fudn.planora.dto.request.AddCollectionImageRequest;
import com.fudn.planora.dto.request.CreateCollectionRequest;
import com.fudn.planora.dto.request.CreatePortfolioRequest;
import com.fudn.planora.dto.request.UpdateCollectionRequest;
import com.fudn.planora.dto.request.VendorProfileRequest;
import com.fudn.planora.dto.response.CollectionImageResponse;
import com.fudn.planora.dto.response.CollectionResponse;
import com.fudn.planora.dto.response.PortfolioResponse;
import com.fudn.planora.dto.response.VendorProfileResponse;

import java.util.List;

public interface VendorProfileService {

    VendorProfileResponse getMyProfile(String email);

    VendorProfileResponse updateMyProfile(String email, VendorProfileRequest request);

    VendorProfileResponse updateAvatar(String email, String avatarUrl);

    List<PortfolioResponse> getMyPortfolios(String email);

    PortfolioResponse addPortfolioItem(String email, CreatePortfolioRequest request);

    void deletePortfolioItem(String email, Long portfolioId);

    // Multi-album Collection methods
    List<CollectionResponse> getMyCollections(String email);

    CollectionResponse getMyCollectionDetail(String email, Long collectionId);

    CollectionResponse createCollection(String email, CreateCollectionRequest request);

    CollectionResponse updateCollection(String email, Long collectionId, UpdateCollectionRequest request);

    void deleteCollection(String email, Long collectionId);

    CollectionImageResponse addImageToCollection(String email, Long collectionId, AddCollectionImageRequest request);

    void deleteImageFromCollection(String email, Long collectionId, Long imageId);
}
