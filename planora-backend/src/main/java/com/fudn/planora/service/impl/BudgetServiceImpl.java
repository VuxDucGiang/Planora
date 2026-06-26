package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.UpdateBudgetItemRequest;
import com.fudn.planora.dto.response.BudgetItemResponse;
import com.fudn.planora.dto.response.BudgetResponse;
import com.fudn.planora.entity.BudgetItem;
import com.fudn.planora.entity.WeddingPlan;
import com.fudn.planora.repository.BudgetItemRepository;
import com.fudn.planora.repository.WeddingPlanRepository;
import com.fudn.planora.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetItemRepository budgetItemRepository;
    private final WeddingPlanRepository weddingPlanRepository;

    @Override
    public BudgetResponse getBudget(Long planId, Long currentUserId) {
        WeddingPlan plan = validateWeddingPlanOwner(planId, currentUserId);

        List<BudgetItem> items = budgetItemRepository.findByWeddingPlanId(planId);

        BigDecimal totalBudget = plan.getBudget() != null ? plan.getBudget() : BigDecimal.ZERO;

        // Tính tổng ngân sách ước tính đã phân bổ
        BigDecimal totalEstimated = items.stream()
                .map(BudgetItem::getEstimatedCost)
                .filter(cost -> cost != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tính tổng chi tiêu thực tế
        BigDecimal totalActualSpent = items.stream()
                .map(BudgetItem::getActualCost)
                .filter(cost -> cost != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Map danh sách các hạng mục chi tiêu sang DTO
        List<BudgetItemResponse> categories = items.stream()
                .map(item -> BudgetItemResponse.builder()
                        .itemId(item.getId())
                        .categoryId(item.getCategory().getId())
                        .categoryName(item.getCategory().getName())
                        .estimatedCost(item.getEstimatedCost())
                        .actualCost(item.getActualCost())
                        .note(item.getNote())
                        .build())
                .collect(Collectors.toList());

        return BudgetResponse.builder()
                .totalBudget(totalBudget)
                .totalEstimated(totalEstimated)
                .totalActualSpent(totalActualSpent)
                .categories(categories)
                .build();
    }

    @Override
    @Transactional
    public BudgetItemResponse updateBudgetItem(Long itemId, UpdateBudgetItemRequest request, Long currentUserId) {
        BudgetItem item = budgetItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hạng mục ngân sách có ID: " + itemId));

        // Xác thực người sở hữu kế hoạch đám cưới
        validateWeddingPlanOwner(item.getWeddingPlan().getId(), currentUserId);

        if (request.getEstimatedCost() != null) {
            item.setEstimatedCost(request.getEstimatedCost());
        }
        if (request.getActualCost() != null) {
            item.setActualCost(request.getActualCost());
        }
        if (request.getNote() != null) {
            item.setNote(request.getNote());
        }

        BudgetItem updatedItem = budgetItemRepository.save(item);

        return BudgetItemResponse.builder()
                .itemId(updatedItem.getId())
                .categoryId(updatedItem.getCategory().getId())
                .categoryName(updatedItem.getCategory().getName())
                .estimatedCost(updatedItem.getEstimatedCost())
                .actualCost(updatedItem.getActualCost())
                .note(updatedItem.getNote())
                .build();
    }

    private WeddingPlan validateWeddingPlanOwner(Long planId, Long userId) {
        WeddingPlan plan = weddingPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Kế hoạch đám cưới"));
        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền truy cập vào kế hoạch đám cưới này");
        }
        return plan;
    }
}