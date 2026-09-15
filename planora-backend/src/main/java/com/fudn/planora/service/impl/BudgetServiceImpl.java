package com.fudn.planora.service.impl;

import com.fudn.planora.dto.budget.BudgetDTO;
import com.fudn.planora.model.User;
import com.fudn.planora.model.WeddingPlan;
import com.fudn.planora.model.WeddingPlan.BudgetItem;
import com.fudn.planora.exceptions.PlanoraException;
import com.fudn.planora.exceptions.ResourceNotFoundException;
import com.fudn.planora.repository.BudgetItemRepository;
import com.fudn.planora.repository.UserRepository;
import com.fudn.planora.repository.WeddingPlanRepository;
import com.fudn.planora.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetItemRepository budgetItemRepository;
    private final WeddingPlanRepository weddingPlanRepository;
    private final UserRepository userRepository;

    @Override
    public BudgetDTO.Response getBudget(Long planId, String email) {
        WeddingPlan plan = validateWeddingPlanOwner(planId, email);

        List<BudgetItem> items = budgetItemRepository.findByWeddingPlanId(planId);

        BigDecimal totalBudget = plan.getBudget() != null ? plan.getBudget() : BigDecimal.ZERO;

        // Tính tổng ngân sách ước tính đã phân bổ
        BigDecimal totalEstimated = items.stream()
                .filter(Objects::nonNull)
                .map(item -> item.getEstimatedCost())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));

        // Tính tổng chi tiêu thực tế
        BigDecimal totalActualSpent = items.stream()
                .filter(Objects::nonNull)
                .map(item -> item.getActualCost())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));

        // Map danh sách các hạng mục chi tiêu sang DTO
        List<BudgetDTO.ItemResponse> categories = items.stream()
                .map(item -> BudgetDTO.ItemResponse.builder()
                        .itemId(item.getId())
                        .categoryId(item.getCategory().getId())
                        .categoryName(item.getCategory().getName())
                        .estimatedCost(item.getEstimatedCost())
                        .actualCost(item.getActualCost())
                        .note(item.getNote())
                        .build())
                .collect(Collectors.toList());

        return BudgetDTO.Response.builder()
                .totalBudget(totalBudget)
                .totalEstimated(totalEstimated)
                .totalActualSpent(totalActualSpent)
                .categories(categories)
                .build();
    }

    @Override
    @Transactional
    public BudgetDTO.ItemResponse updateBudgetItem(Long itemId, BudgetDTO.UpdateItemRequest request, String email) {
        BudgetItem item = budgetItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hạng mục ngân sách có ID: " + itemId));

        // Xác thực người sở hữu kế hoạch đám cưới
        validateWeddingPlanOwner(item.getWeddingPlan().getId(), email);

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

        return BudgetDTO.ItemResponse.builder()
                .itemId(updatedItem.getId())
                .categoryId(updatedItem.getCategory().getId())
                .categoryName(updatedItem.getCategory().getName())
                .estimatedCost(updatedItem.getEstimatedCost())
                .actualCost(updatedItem.getActualCost())
                .note(updatedItem.getNote())
                .build();
    }

    private WeddingPlan validateWeddingPlanOwner(Long planId, String email) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng có email: " + email));
        WeddingPlan plan = weddingPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Kế hoạch đám cưới với ID: " + planId));
        if (!plan.getUser().getId().equals(user.getId())) {
            throw new PlanoraException("Bạn không có quyền truy cập vào kế hoạch đám cưới này", HttpStatus.FORBIDDEN);
        }
        return plan;
    }
}
