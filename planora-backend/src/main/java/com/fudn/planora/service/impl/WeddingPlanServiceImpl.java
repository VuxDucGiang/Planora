package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.OnboardingRequest;
import com.fudn.planora.dto.response.ActivePlanResponse;
import com.fudn.planora.dto.response.WeddingPlanResponse;
import com.fudn.planora.entity.*;
import com.fudn.planora.enums.*;
import com.fudn.planora.repository.*;
import com.fudn.planora.service.WeddingPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WeddingPlanServiceImpl implements WeddingPlanService {

    private final UserRepository userRepository;
    private final WeddingPlanRepository planRepository;
    private final WeddingStyleRepository styleRepository;
    private final ServiceCategorieRepository categoryRepository;
    private final BudgetCategoryRepository budgetCategoryRepository;
    private final ConceptSuggestionRepository conceptRepository;

    @Override
    @Transactional
    public WeddingPlanResponse createOnboardingPlan(String userEmail, OnboardingRequest request) {
        User user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // 1. Khởi tạo Kế hoạch cưới mới
        WeddingPlan plan = WeddingPlan.builder()
                .user(user)
                .title(request.getTitle())
                .weddingDate(request.getWeddingDate())
                .location(request.getLocation())
                .guestCount(request.getGuestCount())
                .budget(request.getBudget())
                .status(EWeddingPlanStatus.PLANNING)
                .build();

        // Ánh xạ Wedding Styles đã chọn
        if (request.getStyleIds() != null && !request.getStyleIds().isEmpty()) {
            List<WeddingStyle> styles = styleRepository.findAllById(request.getStyleIds());
            plan.setWeddingStyles(new HashSet<>(styles));
        }

        // Ánh xạ Priority Service Categories đã chọn
        if (request.getPriorityCategoryIds() != null && !request.getPriorityCategoryIds().isEmpty()) {
            List<ServiceCategorie> categories = categoryRepository.findAllById(request.getPriorityCategoryIds());
            plan.setPriorityCategories(new HashSet<>(categories));
        }

        // 2. Tự động phân bổ ngân sách mặc định (Ví dụ tỷ lệ phân bổ: Venue 50%, Decoration 15%...)
        plan.setBudgetItems(allocateDefaultBudget(plan, request.getBudget()));

        // 3. Tự động tạo checklist công việc dựa trên ngày cưới (Wedding Date)
        plan.setChecklistTasks(generateDefaultChecklist(plan, request.getWeddingDate()));

        // 4. Tự động tạo Timeline ngày cưới mẫu
        plan.setTimelineEvents(generateDefaultTimeline(plan, request.getWeddingDate()));

        // Lưu kế hoạch
        WeddingPlan savedPlan = planRepository.save(plan);

        // 5. Tự động tạo concept gợi ý dựa trên styles đã chọn
        generateDefaultConcepts(savedPlan);

        return WeddingPlanResponse.builder()
                .id(savedPlan.getId())
                .title(savedPlan.getTitle())
                .weddingDate(savedPlan.getWeddingDate())
                .guestCount(savedPlan.getGuestCount())
                .budget(savedPlan.getBudget())
                .location(savedPlan.getLocation())
                .status(savedPlan.getStatus().name())
                .build();
    }

    @Override
    public ActivePlanResponse getActivePlan(String userEmail) {
        User user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Lấy plan gần nhất đang trong trạng thái PLANNING
        WeddingPlan plan = planRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), EWeddingPlanStatus.PLANNING)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch cưới nào đang hoạt động. Hãy hoàn thành Onboarding trước!"));

        // Tính toán thống kê checklist
        long totalTasks = plan.getChecklistTasks().size();
        long completedTasks = plan.getChecklistTasks().stream()
                .filter(task -> task.getStatus() == EChecklistTaskStatus.DONE)
                .count();

        // Map Budget Items
        List<ActivePlanResponse.BudgetItemSummary> budgetSummary = plan.getBudgetItems().stream()
                .map(item -> ActivePlanResponse.BudgetItemSummary.builder()
                        .categoryName(item.getCategory().getName())
                        .estimatedCost(item.getEstimatedCost())
                        .actualCost(item.getActualCost())
                        .note(item.getNote())
                        .build())
                .collect(Collectors.toList());

        // Map Concept suggestions
        List<ActivePlanResponse.ConceptSummary> concepts = plan.getBudgetItems().stream().findFirst().map(b ->
                // Giả lập hoặc lấy từ DB (trong ví dụ này ta lấy từ database conceptRepository)
                conceptRepository.findAll().stream()
                        .filter(c -> c.getWeddingPlan().getId().equals(plan.getId()))
                        .map(c -> ActivePlanResponse.ConceptSummary.builder()
                                .conceptName(c.getConceptName())
                                .description(c.getDescription())
                                .estimatedBudget(c.getEstimatedBudget())
                                .build())
                        .collect(Collectors.toList())
        ).orElse(new ArrayList<>());

        return ActivePlanResponse.builder()
                .id(plan.getId())
                .title(plan.getTitle())
                .weddingDate(plan.getWeddingDate())
                .guestCount(plan.getGuestCount())
                .budget(plan.getBudget())
                .location(plan.getLocation())
                .status(plan.getStatus().name())
                .budgetItems(budgetSummary)
                .conceptSuggestions(concepts)
                .checklistStats(new ActivePlanResponse.ChecklistStats(totalTasks, completedTasks))
                .build();
    }

    // ==========================================
    // THUẬT TOÁN TỰ ĐỘNG PHÂN BỔ NGÂN SÁCH (USP)
    // ==========================================
    private List<BudgetItem> allocateDefaultBudget(WeddingPlan plan, BigDecimal totalBudget) {
        List<BudgetItem> items = new ArrayList<>();

        // Tỷ lệ phần trăm phân bổ mẫu:
        // Venue (Nhà hàng tiệc cưới) -> 50%
        // Food & Beverage -> 15%
        // Decoration (Trang trí) -> 10%
        // Photography (Quay phim, chụp ảnh) -> 10%
        // Makeup -> 5%
        // Wedding Dress -> 5%
        // Entertainment -> 5%
        Map<String, Double> allocationRules = new LinkedHashMap<>();
        allocationRules.put("Venue", 0.50);
        allocationRules.put("Food & Beverage", 0.15);
        allocationRules.put("Decoration", 0.10);
        allocationRules.put("Photography", 0.10);
        allocationRules.put("Makeup", 0.05);
        allocationRules.put("Wedding Dress", 0.05);
        allocationRules.put("Entertainment", 0.05);

        for (Map.Entry<String, Double> rule : allocationRules.entrySet()) {
            BudgetCategory category = budgetCategoryRepository.findByName(rule.getKey())
                    .orElseGet(() -> budgetCategoryRepository.save(BudgetCategory.builder().name(rule.getKey()).build()));

            BigDecimal estimatedCost = totalBudget.multiply(BigDecimal.valueOf(rule.getValue()))
                    .setScale(2, RoundingMode.HALF_UP);

            items.add(BudgetItem.builder()
                    .weddingPlan(plan)
                    .category(category)
                    .estimatedCost(estimatedCost)
                    .actualCost(BigDecimal.ZERO)
                    .note("Phân bổ tự động từ Planora")
                    .build());
        }
        return items;
    }

    // ==========================================
    // TỰ ĐỘNG TẠO CHECKLIST NHIỆM VỤ THEO NGÀY CƯỚI
    // ==========================================
    private List<ChecklistTask> generateDefaultChecklist(WeddingPlan plan, LocalDate weddingDate) {
        List<ChecklistTask> tasks = new ArrayList<>();

        tasks.add(ChecklistTask.builder()
                .weddingPlan(plan)
                .title("Xác định tổng ngân sách & Lập kế hoạch tài chính")
                .description("Lập kế hoạch phân bổ chi tiết ngân sách ban đầu.")
                .dueDate(weddingDate.minusMonths(9))
                .priority(EChecklistTaskPriority.HIGH)
                .status(EChecklistTaskStatus.TODO)
                .build());

        tasks.add(ChecklistTask.builder()
                .weddingPlan(plan)
                .title("Tìm kiếm & Đặt nhà hàng tiệc cưới (Venue)")
                .description("Tham quan và đặt cọc sảnh tiệc để giữ ngày.")
                .dueDate(weddingDate.minusMonths(6))
                .priority(EChecklistTaskPriority.HIGH)
                .status(EChecklistTaskStatus.TODO)
                .build());

        tasks.add(ChecklistTask.builder()
                .weddingPlan(plan)
                .title("Tìm kiếm Wedding Planner / Đơn vị trang trí hoa tươi")
                .description("Thảo luận ý tưởng trang trí đám cưới phù hợp với phong cách cưới.")
                .dueDate(weddingDate.minusMonths(5))
                .priority(EChecklistTaskPriority.MEDIUM)
                .status(EChecklistTaskStatus.TODO)
                .build());

        tasks.add(ChecklistTask.builder()
                .weddingPlan(plan)
                .title("Đặt lịch Studio chụp hình Pre-wedding & Makeup")
                .description("Chụp hình cưới ngoại cảnh hoặc tại studio.")
                .dueDate(weddingDate.minusMonths(3))
                .priority(EChecklistTaskPriority.HIGH)
                .status(EChecklistTaskStatus.TODO)
                .build());

        tasks.add(ChecklistTask.builder()
                .weddingPlan(plan)
                .title("Thuê váy cưới & Vest chú rể")
                .description("Thử váy, vest và hoàn tất thuê/may đo.")
                .dueDate(weddingDate.minusMonths(2))
                .priority(EChecklistTaskPriority.MEDIUM)
                .status(EChecklistTaskStatus.TODO)
                .build());

        tasks.add(ChecklistTask.builder()
                .weddingPlan(plan)
                .title("Gửi thiệp mời đám cưới & Chốt số lượng khách")
                .description("Gửi thiệp giấy và thiệp online cho khách mời.")
                .dueDate(weddingDate.minusMonths(1))
                .priority(EChecklistTaskPriority.HIGH)
                .status(EChecklistTaskStatus.TODO)
                .build());

        return tasks;
    }

    // ==========================================
    // TỰ ĐỘNG TẠO TIMELINE MẪU NGÀY CƯỚI
    // ==========================================
    private List<TimelineEvent> generateDefaultTimeline(WeddingPlan plan, LocalDate weddingDate) {
        List<TimelineEvent> events = new ArrayList<>();
        LocalDateTime baseTime = weddingDate.atStartOfDay();

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("Trang điểm cô dâu tại nhà")
                .description("Thời gian Makeup Artist làm tóc và trang điểm cô dâu đón lễ gia tiên.")
                .eventDate(baseTime.withHour(7).withMinute(0))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("Lễ Gia Tiên tại nhà gái")
                .description("Nhà trai sang thắp hương báo cáo tổ tiên và xin dâu.")
                .eventDate(baseTime.withHour(9).withMinute(0))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("Đón dâu về nhà trai")
                .description("Lễ thành hôn chính thức tại nhà trai.")
                .eventDate(baseTime.withHour(11).withMinute(0))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("Đón khách tại trung tâm tiệc cưới")
                .description("Chụp hình kỷ niệm tại backdrop và hướng dẫn khách mời vào sảnh tiệc.")
                .eventDate(baseTime.withHour(17).withMinute(30))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("Khai tiệc & Cử hành hôn lễ")
                .description("Cô dâu chú rể bước vào sảnh, cắt bánh, rót rượu và bắt đầu khai tiệc.")
                .eventDate(baseTime.withHour(18).withMinute(30))
                .build());

        return events;
    }

    // ==========================================
    // TẠO GỢI Ý CONCEPT DỰA TRÊN PHONG CÁCH ĐÃ CHỌN
    // ==========================================
    private void generateDefaultConcepts(WeddingPlan plan) {
        if (plan.getWeddingStyles() == null || plan.getWeddingStyles().isEmpty()) {
            return;
        }

        for (WeddingStyle style : plan.getWeddingStyles()) {
            String conceptName = "Concept " + style.getName() + " Dream";
            String description = "Một concept trọn gói được thiết kế tỉ mỉ theo trường phái "
                    + style.getName() + " nhằm đem lại không khí ấm áp, sang trọng phù hợp với ngân sách dự kiến.";

            BigDecimal estimatedBudget = plan.getBudget().multiply(BigDecimal.valueOf(0.40))
                    .setScale(2, RoundingMode.HALF_UP);

            conceptRepository.save(ConceptSuggestion.builder()
                    .weddingPlan(plan)
                    .conceptName(conceptName)
                    .description(description)
                    .estimatedBudget(estimatedBudget)
                    .generatedBy(EConceptSuggestionGeneratedBy.RULE_BASED)
                    .build());
        }
    }
}