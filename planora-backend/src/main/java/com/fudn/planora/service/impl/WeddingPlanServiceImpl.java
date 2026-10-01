package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.OnboardingRequest;
import com.fudn.planora.dto.response.ActivePlanResponse;
import com.fudn.planora.dto.response.EventResponse;
import com.fudn.planora.dto.response.TaskResponse;
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
import java.time.temporal.ChronoUnit;
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
        List<ServiceCategorie> categories = new ArrayList<>();
        if (request.getPriorityCategoryIds() != null && !request.getPriorityCategoryIds().isEmpty()) {
            categories = categoryRepository.findAllById(request.getPriorityCategoryIds());
            plan.setPriorityCategories(new HashSet<>(categories));
        }

        // 2. Tự động phân bổ ngân sách thông minh (10 hạng mục tiêu chuẩn Việt Nam, hỗ trợ Priority Boost & Quy mô khách)
        plan.setBudgetItems(allocateDefaultBudget(plan, request.getBudget(), categories, request.getGuestCount()));

        // 3. Tự động tạo checklist công việc thích ứng theo khoảng thời gian đến ngày cưới
        plan.setChecklistTasks(generateDefaultChecklist(plan, request.getWeddingDate()));

        // 4. Tự động tạo Timeline ngày cưới toàn diện (Sáng: Lễ Gia Tiên & Rước Dâu; Tối: Tiệc Cưới Trung Tâm)
        plan.setTimelineEvents(generateDefaultTimeline(plan, request.getWeddingDate()));

        // Lưu kế hoạch
        WeddingPlan savedPlan = planRepository.save(plan);

        // 5. Tự động tạo concept gợi ý phong phú dựa trên styles đã chọn
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

        WeddingPlan plan = planRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), EWeddingPlanStatus.PLANNING)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch cưới nào đang hoạt động. Hãy hoàn thành Onboarding trước!"));

        long totalTasks = plan.getChecklistTasks().size();
        long completedTasks = plan.getChecklistTasks().stream()
                .filter(task -> task.getStatus() == EChecklistTaskStatus.DONE)
                .count();

        // Tính toán các chỉ số phân tích ngân sách
        BigDecimal totalBudget = plan.getBudget() != null ? plan.getBudget() : BigDecimal.ZERO;
        int guests = plan.getGuestCount() != null && plan.getGuestCount() > 0 ? plan.getGuestCount() : 100;
        int estimatedTables = (int) Math.ceil((double) guests / 10.0) + 1;
        BigDecimal costPerGuest = totalBudget.divide(BigDecimal.valueOf(guests), 0, RoundingMode.HALF_UP);

        BigDecimal venueEstimated = BigDecimal.ZERO;
        BigDecimal contingencyEstimated = BigDecimal.ZERO;
        BigDecimal totalAllocated = BigDecimal.ZERO;

        List<ActivePlanResponse.BudgetItemSummary> budgetSummary = new ArrayList<>();
        if (plan.getBudgetItems() != null) {
            for (BudgetItem item : plan.getBudgetItems()) {
                BigDecimal est = item.getEstimatedCost() != null ? item.getEstimatedCost() : BigDecimal.ZERO;
                totalAllocated = totalAllocated.add(est);

                String catName = item.getCategory() != null ? item.getCategory().getName() : "Khác";
                if (catName.contains("Venue") || catName.contains("Tiệc") || catName.contains("Nhà hàng")) {
                    venueEstimated = est;
                }
                if (catName.contains("Dự phòng") || catName.contains("Contingency")) {
                    contingencyEstimated = est;
                }

                Double percentage = totalBudget.compareTo(BigDecimal.ZERO) > 0
                        ? est.divide(totalBudget, 4, RoundingMode.HALF_UP).doubleValue() * 100
                        : 0.0;

                boolean isPriority = item.getNote() != null && item.getNote().contains("ưu tiên");

                budgetSummary.add(ActivePlanResponse.BudgetItemSummary.builder()
                        .categoryName(catName)
                        .estimatedCost(est)
                        .actualCost(item.getActualCost())
                        .percentage(Math.round(percentage * 10.0) / 10.0)
                        .isPriority(isPriority)
                        .note(item.getNote())
                        .build());
            }
        }

        BigDecimal tableCostEstimated = estimatedTables > 0 && venueEstimated.compareTo(BigDecimal.ZERO) > 0
                ? venueEstimated.divide(BigDecimal.valueOf(estimatedTables), 0, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        ActivePlanResponse.BudgetAnalytics budgetAnalytics = ActivePlanResponse.BudgetAnalytics.builder()
                .costPerGuest(costPerGuest)
                .estimatedTables(estimatedTables)
                .tableCostEstimated(tableCostEstimated)
                .contingencyBuffer(contingencyEstimated)
                .totalAllocated(totalAllocated)
                .build();

        // Map Concepts
        List<ActivePlanResponse.ConceptSummary> concepts = conceptRepository.findAll().stream()
                .filter(c -> c.getWeddingPlan().getId().equals(plan.getId()))
                .map(c -> {
                    List<String> palette = resolveColorPalette(c.getConceptName());
                    return ActivePlanResponse.ConceptSummary.builder()
                            .conceptName(c.getConceptName())
                            .description(c.getDescription())
                            .estimatedBudget(c.getEstimatedBudget())
                            .colorPalette(palette)
                            .floralTheme("Hoa hồng Ohara, Hoa cẩm tú cầu & Lá bạc khuynh diệp")
                            .vibe("Tinh tế, lãng mạn và ngập tràn ánh sáng ấm áp")
                            .decorNote("Tập trung vào Cổng hoa vòm lối vào, Bàn Gallery nến thơm và Khung Photobooth kỷ niệm.")
                            .build();
                })
                .collect(Collectors.toList());

        // Map Checklist Tasks
        List<TaskResponse> taskResponses = plan.getChecklistTasks().stream()
                .sorted(Comparator.comparing(ChecklistTask::getDueDate))
                .map(t -> TaskResponse.builder()
                        .id(t.getId())
                        .weddingPlanId(plan.getId())
                        .title(t.getTitle())
                        .description(t.getDescription())
                        .dueDate(t.getDueDate())
                        .status(t.getStatus())
                        .priority(t.getPriority())
                        .createdAt(t.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        // Map Timeline Events
        List<EventResponse> eventResponses = plan.getTimelineEvents().stream()
                .sorted(Comparator.comparing(TimelineEvent::getEventDate))
                .map(e -> EventResponse.builder()
                        .id(e.getId())
                        .weddingPlanId(plan.getId())
                        .title(e.getTitle())
                        .description(e.getDescription())
                        .eventDate(e.getEventDate())
                        .createdAt(e.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

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
                .checklistTasks(taskResponses)
                .timelineEvents(eventResponses)
                .budgetAnalytics(budgetAnalytics)
                .build();
    }

    @Override
    @Transactional
    public void deleteActivePlan(String userEmail) {
        User user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        WeddingPlan plan = planRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), EWeddingPlanStatus.PLANNING)
                .or(() -> planRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId()))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch cưới nào để xóa"));

        planRepository.delete(plan);
    }

    // =========================================================================
    // THUẬT TOÁN PHÂN BỔ NGÂN SÁCH ĐỘNG (SMART ADAPTIVE ALLOCATION ALGORITHM)
    // =========================================================================
    private List<BudgetItem> allocateDefaultBudget(
            WeddingPlan plan, 
            BigDecimal totalBudget, 
            List<ServiceCategorie> priorityCategories,
            Integer guestCount
    ) {
        List<BudgetItem> items = new ArrayList<>();
        int guests = guestCount != null && guestCount > 0 ? guestCount : 100;
        int estimatedTables = (int) Math.ceil((double) guests / 10.0) + 1;

        // Trích xuất từ khóa ưu tiên
        Set<String> priorityKeywords = priorityCategories != null
                ? priorityCategories.stream().map(c -> c.getName().toLowerCase()).collect(Collectors.toSet())
                : Collections.emptySet();

        // Baseline Distribution (Chuẩn Đám Cưới Việt Nam):
        // 1. Venue & Catering (Bàn tiệc & Sảnh cưới) -> 45%
        // 2. Decoration & Floral (Trang trí tiệc cưới) -> 12%
        // 3. Photography & Videography (Quay chụp phóng sự & Pre-wedding) -> 10%
        // 4. Wedding Attire (Váy cưới, Áo dài, Vest cưới) -> 8%
        // 5. Traditional Ceremony (Nghi lễ Gia tiên, Tráp ăn hỏi & Xe hoa) -> 6%
        // 6. Wedding Bands & Jewelry (Nhẫn cưới & Trang sức) -> 5%
        // 7. Makeup Artist (Trang điểm cô dâu & gia đình) -> 4%
        // 8. Entertainment & Sound/Light (MC, Âm thanh & Ban nhạc) -> 4%
        // 9. Invitations & Favors (Thiệp mời & Quà cảm ơn) -> 2%
        // 10. Contingency Reserve (Quỹ dự phòng an toàn) -> 4%
        Map<String, Double> weights = new LinkedHashMap<>();
        weights.put("Venue & Catering", 0.45);
        weights.put("Decoration & Floral", 0.12);
        weights.put("Photography & Videography", 0.10);
        weights.put("Wedding Attire", 0.08);
        weights.put("Traditional Ceremony", 0.06);
        weights.put("Wedding Bands & Jewelry", 0.05);
        weights.put("Makeup Artist", 0.04);
        weights.put("Entertainment & MC", 0.04);
        weights.put("Invitations & Favors", 0.02);
        weights.put("Contingency Reserve", 0.04);

        // Priority Boost: Tăng tỷ trọng cho các mục người dùng ưu tiên
        Map<String, Boolean> isBoosted = new HashMap<>();
        for (String key : weights.keySet()) {
            boolean matchesPriority = false;
            for (String kw : priorityKeywords) {
                if (key.toLowerCase().contains(kw) || kw.contains(key.toLowerCase().split(" ")[0])) {
                    matchesPriority = true;
                    break;
                }
            }
            isBoosted.put(key, matchesPriority);
        }

        // Tăng +2% đến +3% cho các mục được ưu tiên, giảm tương ứng ở các mục linh hoạt
        long boostedCount = isBoosted.values().stream().filter(Boolean::booleanValue).count();
        if (boostedCount > 0) {
            double boostEach = 0.025;
            double totalBoost = boostedCount * boostEach;
            double deductionPerFlexible = totalBoost / 3.0;

            for (String key : weights.keySet()) {
                if (isBoosted.get(key)) {
                    weights.put(key, weights.get(key) + boostEach);
                } else if (key.equals("Entertainment & MC") || key.equals("Wedding Attire") || key.equals("Invitations & Favors")) {
                    weights.put(key, Math.max(0.015, weights.get(key) - deductionPerFlexible));
                }
            }
        }

        // Chuẩn hóa tổng trọng số thành chính xác 1.0 (100%)
        double sumWeights = weights.values().stream().mapToDouble(Double::doubleValue).sum();
        for (Map.Entry<String, Double> entry : weights.entrySet()) {
            weights.put(entry.getKey(), entry.getValue() / sumWeights);
        }

        for (Map.Entry<String, Double> entry : weights.entrySet()) {
            String catName = entry.getKey();
            Double weight = entry.getValue();

            BudgetCategory category = budgetCategoryRepository.findByName(catName)
                    .orElseGet(() -> budgetCategoryRepository.save(BudgetCategory.builder().name(catName).build()));

            BigDecimal estimatedCost = totalBudget.multiply(BigDecimal.valueOf(weight))
                    .setScale(0, RoundingMode.HALF_UP);

            String note;
            if (catName.contains("Venue")) {
                BigDecimal tableCost = estimatedCost.divide(BigDecimal.valueOf(estimatedTables), 0, RoundingMode.HALF_UP);
                note = String.format("Dự kiến ~%,d ₫/bàn (cho %d bàn tiệc bao gồm 1 bàn dự phòng)", tableCost.longValue(), estimatedTables);
            } else if (Boolean.TRUE.equals(isBoosted.get(catName))) {
                note = "Hạng mục ưu tiên của bạn (+25% định mức chất lượng cao)";
            } else if (catName.contains("Contingency")) {
                note = "Quỹ dự phòng an toàn phòng ngừa phát sinh bàn tiệc hoặc chi phí khẩn cấp";
            } else {
                note = String.format("Chiếm %.1f%% tổng ngân sách theo định mức khuyến nghị", weight * 100);
            }

            items.add(BudgetItem.builder()
                    .weddingPlan(plan)
                    .category(category)
                    .estimatedCost(estimatedCost)
                    .actualCost(BigDecimal.ZERO)
                    .note(note)
                    .build());
        }

        return items;
    }

    // =========================================================================
    // TỰ ĐỘNG TẠO CHECKLIST THÍCH ỨNG THEO 6 GIAI ĐOẠN (TIMEFRAME-ADAPTIVE CHECKLIST)
    // =========================================================================
    private List<ChecklistTask> generateDefaultChecklist(WeddingPlan plan, LocalDate weddingDate) {
        List<ChecklistTask> tasks = new ArrayList<>();
        LocalDate today = LocalDate.now();
        long totalDays = ChronoUnit.DAYS.between(today, weddingDate);
        if (totalDays < 30) {
            totalDays = 30; // Đảm bảo khoảng cách thời gian tối thiểu
        }

        // Phase 1: Nền Tảng & Giữ Chỗ Trọng Yếu (0% - 20% Timeline)
        tasks.add(createTask(plan, "Thống nhất tổng ngân sách & Lập danh sách khách sơ bộ",
                "Họp gia đình hai bên thống nhất chi phí và số lượng khách mời dự kiến.",
                calculateDueDate(today, totalDays, 0.05), EChecklistTaskPriority.HIGH));

        tasks.add(createTask(plan, "Khảo sát và đặt cọc Trung tâm tiệc cưới (Venue)",
                "Tham quan sảnh tiệc, chốt ngày giờ và ký hợp đồng giữ sảnh trước khi hết chỗ.",
                calculateDueDate(today, totalDays, 0.12), EChecklistTaskPriority.HIGH));

        tasks.add(createTask(plan, "Thống nhất ngày giờ hoàng đạo cho Lễ Dạm Ngõ & Ăn Hỏi",
                "Tham khảo ngày lành tháng tốt cùng gia đình để chuẩn bị các nghi lễ truyền thống.",
                calculateDueDate(today, totalDays, 0.18), EChecklistTaskPriority.MEDIUM));

        // Phase 2: Ekip Trọng Yếu & Phong Cách Cưới (20% - 45% Timeline)
        tasks.add(createTask(plan, "Chọn Studio và hoàn thành chụp ảnh cưới Pre-wedding",
                "Chụp album ảnh cưới để kịp hoàn thiện ảnh cổng và video phóng sự chiếu tiệc.",
                calculateDueDate(today, totalDays, 0.25), EChecklistTaskPriority.HIGH));

        tasks.add(createTask(plan, "Đặt lịch Chuyên gia trang điểm (Makeup Artist) cho Cô Dâu & Mẹ",
                "Thử phong cách makeup cô dâu và giữ lịch trang điểm cho ngày lễ gia tiên và tiệc tối.",
                calculateDueDate(today, totalDays, 0.30), EChecklistTaskPriority.HIGH));

        tasks.add(createTask(plan, "Chọn đơn vị thiết kế Concept trang trí tiệc cưới (Decor & Floral)",
                "Thống nhất phong cách hoa tươi, bàn gallery, cổng hoa và sân khấu làm lễ.",
                calculateDueDate(today, totalDays, 0.38), EChecklistTaskPriority.MEDIUM));

        tasks.add(createTask(plan, "Thử và đặt may/thuê Váy cưới chính, Áo dài truyền thống & Vest",
                "Chọn trang phục cưới tôn dáng và phù hợp với concept hôn lễ đã định.",
                calculateDueDate(today, totalDays, 0.44), EChecklistTaskPriority.MEDIUM));

        // Phase 3: Nghi Lễ Truyền Thống & Khách Mời (45% - 70% Timeline)
        tasks.add(createTask(plan, "Đặt Tráp ăn hỏi (Mâm quả 5-7-9 tráp) & Đội bê tráp nam nữ",
                "Chuẩn bị lễ vật chu đáo theo phong tục truyền thống và đồng phục bưng quả.",
                calculateDueDate(today, totalDays, 0.50), EChecklistTaskPriority.HIGH));

        tasks.add(createTask(plan, "Chọn và mua Nhẫn cưới & Bộ trang sức hồi môn",
                "Chọn cặp nhẫn cưới trao tay và hoàn tất trang sức vàng cưới trao trong lễ gia tiên.",
                calculateDueDate(today, totalDays, 0.56), EChecklistTaskPriority.HIGH));

        tasks.add(createTask(plan, "Chốt danh sách khách mời chi tiết và phân loại sơ đồ bàn tiệc",
                "Phân loại khách họ hàng, bạn bè cô dâu, chú rể và đối tác để sắp xếp vị trí ngồi thuận tiện.",
                calculateDueDate(today, totalDays, 0.62), EChecklistTaskPriority.MEDIUM));

        tasks.add(createTask(plan, "Thiết kế, in ấn Thiệp cưới giấy và chuẩn bị Thiệp cưới Online",
                "In thiệp chỉn chu và kích hoạt trang web thiệp cưới số gửi bạn bè phương xa.",
                calculateDueDate(today, totalDays, 0.68), EChecklistTaskPriority.MEDIUM));

        // Phase 4: Chốt Dịch Vụ & Nước Rút (70% - 85% Timeline)
        tasks.add(createTask(plan, "Gửi thiệp mời tới quan khách và khảo sát xác nhận tham dự (RSVP)",
                "Gửi thiệp trước ít nhất 3-4 tuần để khách sắp xếp lịch và chốt số lượng bàn chính xác.",
                calculateDueDate(today, totalDays, 0.74), EChecklistTaskPriority.HIGH));

        tasks.add(createTask(plan, "Thử món và chốt thực đơn tiệc cưới chính thức với nhà hàng",
                "Nếm thử thực đơn, điều chỉnh gia vị và chọn gói đồ uống bia rượu trọn gói.",
                calculateDueDate(today, totalDays, 0.78), EChecklistTaskPriority.HIGH));

        tasks.add(createTask(plan, "Đặt xe hoa đón dâu và xe đưa đón họ hàng hai bên",
                "Xác nhận tuyến đường di chuyển, thời gian đón dâu và tài xế đưa rước đoàn gia đình.",
                calculateDueDate(today, totalDays, 0.82), EChecklistTaskPriority.MEDIUM));

        tasks.add(createTask(plan, "Thống nhất kịch bản MC, âm thanh ánh sáng & bài hát nghi lễ",
                "Duyệt kịch bản tuyên bố lý do, video phóng sự, cắt bánh, rót rượu và bài hát First Dance.",
                calculateDueDate(today, totalDays, 0.85), EChecklistTaskPriority.MEDIUM));

        // Phase 5: Tuần Lễ Đám Cưới & Tổng Duyệt (85% - 98% Timeline)
        tasks.add(createTask(plan, "Thử váy cưới & vest lần cuối sau khi chỉnh sửa số đo",
                "Đảm bảo trang phục vừa vặn hoàn hảo, không bị chật hoặc rộng trong ngày cưới.",
                calculateDueDate(today, totalDays, 0.90), EChecklistTaskPriority.HIGH));

        tasks.add(createTask(plan, "Chuẩn bị phong bao lì xì trao duyên cho đội bê tráp & tiền tip ekip",
                "Đổi tiền mới cho phong bao lì xì và phân công người nhà giữ quỹ chi tiêu nhanh trong ngày.",
                calculateDueDate(today, totalDays, 0.94), EChecklistTaskPriority.MEDIUM));

        tasks.add(createTask(plan, "Họp điều phối người nhà quản lý tiệc, thùng tiền mừng & đón khách",
                "Phân rõ trách nhiệm người đón khách, người giữ thùng mừng cưới và người kiểm đếm số bàn.",
                calculateDueDate(today, totalDays, 0.97), EChecklistTaskPriority.HIGH));

        // Phase 6: Ngày Cưới (D-Day) & Hậu Kỳ
        tasks.add(createTask(plan, "Kiểm tra hoa tươi cầm tay, hoa cài áo và sính lễ xuất phát",
                "Nhận hoa tươi sáng sớm và kiểm tra đầy đủ nhẫn cưới, lễ vật trước giờ khởi hành.",
                weddingDate, EChecklistTaskPriority.HIGH));

        tasks.add(createTask(plan, "Thanh toán các khoản chi phí còn lại và gửi thư cảm ơn quan khách",
                "Quyết toán hợp đồng nhà hàng, cảm ơn đội ngũ hỗ trợ và đăng lời tri ân sau tiệc.",
                weddingDate.plusDays(2), EChecklistTaskPriority.MEDIUM));

        return tasks;
    }

    private ChecklistTask createTask(WeddingPlan plan, String title, String desc, LocalDate dueDate, EChecklistTaskPriority priority) {
        return ChecklistTask.builder()
                .weddingPlan(plan)
                .title(title)
                .description(desc)
                .dueDate(dueDate)
                .priority(priority)
                .status(EChecklistTaskStatus.TODO)
                .build();
    }

    private LocalDate calculateDueDate(LocalDate today, long totalDays, double ratio) {
        long daysToAdd = Math.max(1, (long) (totalDays * ratio));
        return today.plusDays(daysToAdd);
    }

    // =========================================================================
    // TỰ ĐỘNG TẠO TIMELINE TOÀN DIỆN NGÀY CƯỚI (MASTER WEDDING DAY TIMELINE)
    // =========================================================================
    private List<TimelineEvent> generateDefaultTimeline(WeddingPlan plan, LocalDate weddingDate) {
        List<TimelineEvent> events = new ArrayList<>();
        LocalDateTime baseTime = weddingDate.atStartOfDay();

        // ── Buổi Sáng: Lễ Gia Tiên & Rước Dâu Truyền Thống ──
        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("06:30 - Trang điểm & Làm tóc cô dâu tại tư gia")
                .description("Ekip Makeup Artist có mặt tại nhà gái để trang điểm, làm tóc cô dâu và 2 mẹ.")
                .eventDate(baseTime.withHour(6).withMinute(30))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("08:30 - Nhà trai xuất phát sang nhà gái")
                .description("Đoàn nhà trai gồm trưởng đoàn, chú rể, ba mẹ và đội bê tráp mang sính lễ lên xe hoa xuất phát.")
                .eventDate(baseTime.withHour(8).withMinute(30))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("09:00 - Lễ Trao tráp & Trao duyên đội bê tráp")
                .description("Đội bê tráp nam nữ làm thủ tục trao mâm quả và lì xì trao duyên trước cửa nhà gái.")
                .eventDate(baseTime.withHour(9).withMinute(0))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("09:30 - Lễ Gia Tiên & Lời dặn dò phụ mẫu tại nhà gái")
                .description("Thắp hương báo cáo tổ tiên, ba mẹ trao của hồi môn và dặn dò hai con trước khi xuất giá.")
                .eventDate(baseTime.withHour(9).withMinute(30))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("11:00 - Lễ Thành Hôn & Bữa cơm thân mật tại nhà trai")
                .description("Rước dâu về nhà chồng, làm lễ gia tiên nhà trai và dùng bữa cơm ấm cúng cùng họ hàng nội tộc.")
                .eventDate(baseTime.withHour(11).withMinute(0))
                .build());

        // ── Buổi Tối: Tiệc Cưới Tại Trung Tâm Tiệc Cưới ──
        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("16:30 - Cô dâu chú rể có mặt tại sảnh tiệc & Tổng duyệt")
                .description("Dặm lại makeup, thay váy cưới chính, chụp ảnh kỷ niệm tại sảnh trước khi đón khách và thử mic MC.")
                .eventDate(baseTime.withHour(16).withMinute(30))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("17:30 - Đón khách & Chụp ảnh tại Backdrop Photobooth")
                .description("Đón tiếp quan khách, chụp ảnh kỷ niệm tại photobooth và phục vụ tiệc trà Canape nhẹ.")
                .eventDate(baseTime.withHour(17).withMinute(30))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("19:00 - Khai tiệc & Cử hành Hôn Lễ chính thức")
                .description("Chiếu phóng sự cưới, cô dâu chú rể bước vào lễ đường, cắt bánh, rót rượu giao bôi và khai tiệc ăn mừng.")
                .eventDate(baseTime.withHour(19).withMinute(0))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("19:45 - Cô dâu chú rể chúc rượu từng bàn tiệc")
                .description("Hai bên gia đình và đôi uyên ương đến từng bàn tiệc gửi lời cảm ơn và nâng ly cùng khách mời.")
                .eventDate(baseTime.withHour(19).withMinute(45))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("20:45 - Tiết mục giao lưu văn nghệ, Tung hoa & Tiễn khách")
                .description("Tiết mục tung hoa cưới, nhảy First Dance, chụp hình lưu niệm tiễn khách và thanh toán bàn tiệc.")
                .eventDate(baseTime.withHour(20).withMinute(45))
                .build());

        return events;
    }

    // =========================================================================
    // TẠO GỢI Ý CONCEPT ĐỘC ĐÁO KÈM BẢNG MÀU PHONG CÁCH
    // =========================================================================
    private void generateDefaultConcepts(WeddingPlan plan) {
        if (plan.getWeddingStyles() == null || plan.getWeddingStyles().isEmpty()) {
            return;
        }

        for (WeddingStyle style : plan.getWeddingStyles()) {
            String conceptName = "Concept " + style.getName() + " Elegance";
            String description = "Concept thiết kế trọn gói theo trường phái " + style.getName()
                    + " với sự kết hợp hài hoà giữa hoa tươi cao cấp, ánh sáng lung linh và bố cục tinh tế.";

            BigDecimal estimatedBudget = plan.getBudget().multiply(BigDecimal.valueOf(0.15))
                    .setScale(0, RoundingMode.HALF_UP);

            conceptRepository.save(ConceptSuggestion.builder()
                    .weddingPlan(plan)
                    .conceptName(conceptName)
                    .description(description)
                    .estimatedBudget(estimatedBudget)
                    .generatedBy(EConceptSuggestionGeneratedBy.RULE_BASED)
                    .build());
        }
    }

    private List<String> resolveColorPalette(String conceptName) {
        String lower = conceptName.toLowerCase();
        if (lower.contains("rustic") || lower.contains("garden")) {
            return Arrays.asList("#5B7065", "#A4B494", "#E8ECE9", "#D8B168");
        } else if (lower.contains("luxury") || lower.contains("royal")) {
            return Arrays.asList("#5D0F12", "#D4AF37", "#FFFBF5", "#1C1C1C");
        } else if (lower.contains("minimalist")) {
            return Arrays.asList("#2C3E50", "#BDC3C7", "#F8F9F9", "#E5E7E9");
        } else {
            return Arrays.asList("#8E1C20", "#DFB76C", "#FFFBF5", "#4A0C0E");
        }
    }
}