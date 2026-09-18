package com.fudn.planora.service.impl;

import com.fudn.planora.dto.response.WeddingStyleResponse;
import com.fudn.planora.repository.WeddingStyleRepository;
import com.fudn.planora.service.WeddingStyleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WeddingStyleServiceImpl implements WeddingStyleService {

    private final WeddingStyleRepository styleRepository;

    @Override
    public List<WeddingStyleResponse> getAllStyles() {
        return styleRepository.findAll().stream()
                .map(style -> WeddingStyleResponse.builder()
                        .id(style.getId())
                        .name(style.getName())
                        .description(style.getDescription())
                        .build())
                .collect(Collectors.toList());
    }
}