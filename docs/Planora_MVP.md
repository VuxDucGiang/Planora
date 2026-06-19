Các màn hình Figma cho MVP Planora
Dưới đây là mô tả chi tiết các màn hình cần thiết cho MVP của ứng dụng Planora, bao gồm nội dung và thành phần UI theo luồng người dùng. Mỗi màn hình được thiết kế hỗ trợ cặp đôi xây dựng kế hoạch cưới hoàn hảo, với các thành phần rõ ràng, dễ dùng, đúng với giá trị cốt lõi (USP) của Planora.

1. Landing Page
Hero Section: Hình ảnh nền gợi cảm xúc (chẳng hạn cặp đôi hạnh phúc, đám cưới đang diễn ra) kèm tiêu đề mạnh mẽ như “Lập kế hoạch đám cưới hoàn hảo dễ dàng” – đây là USP nêu rõ lợi ích chính của Planora. Đặt một CTA lớn như “Bắt đầu lập kế hoạch” hoặc “Bắt đầu ngay” ở vị trí nổi bật.
Giới thiệu lợi ích (Benefits): Các điểm nổi bật của ứng dụng (ví dụ: “Tự động tạo timeline & checklist”, “Tìm nhà cung cấp theo phong cách và ngân sách của bạn”, “Quản lý ngân sách thông minh”). Mỗi lợi ích kèm icon hoặc hình minh họa nhỏ. Theo nguyên tắc landing page hiệu quả, phần lợi ích nên kết hợp cả tính năng và lợi ích thực tiễn (features & benefits).
Cách hoạt động (How it works): Các bước chính để Planora làm việc: Ví dụ “1. Nhập thông tin cưới, 2. AI đề xuất kế hoạch & vendor, 3. Trao đổi & cập nhật tiến độ”. Dùng icon minh hoạ từng bước giúp người dùng hình dung dễ dàng.
Nhà cung cấp nổi bật (Featured Vendors): Hiển thị một số card/ảnh đại diện vendor tiêu biểu hoặc logo đối tác nổi bật (nếu có) nhằm tạo lòng tin và cảm giác tin cậy. Kèm caption ngắn khẳng định “Hàng trăm vendor uy tín trong hệ thống”.
Đăng nhập/Đăng ký: Nút/link “Đăng nhập” và “Đăng ký” ở góc phải màn hình hoặc ở header. Giúp người dùng dễ dàng tiếp cận chức năng auth ngay từ landing page.
Chứng thực xã hội (Social Proof, nếu cần): Có thể thêm trích dẫn cảm nhận khách hàng (testimonial) hoặc số cặp đôi đã sử dụng để tăng độ tin cậy (nếu có).
Các thành phần trên tuân theo cấu trúc landing page chuẩn: hình ảnh hero minh họa ngữ cảnh sử dụng sản phẩm, tiêu đề USP, CTA rõ ràng, phần lợi ích/chứng thực.

2. Login Page (Đăng nhập)
Form Đăng nhập: Bao gồm các trường nhập “Email” và “Mật khẩu”, kèm button “Đăng nhập” rõ ràng. Gắn label đầy đủ cho mỗi trường để đảm bảo dễ dùng và hỗ trợ truy cập (WCAG).
Social Login: Cung cấp thêm lựa chọn đăng nhập bằng Google (hoặc Facebook) với button “Tiếp tục với Google” (theo tiêu chuẩn OAuth). Các nghiên cứu UX khuyến khích đa dạng tùy chọn đăng nhập (email/password hoặc “Continue with Google”) để giảm gánh nặng ghi nhớ mật khẩu và tăng tốc độ đăng nhập. Đảm bảo theo đúng nhãn hiệu và cam kết bảo mật (ví dụ: “Chúng tôi sẽ không đăng bài thay bạn” bên dưới nút Google).
Link Quên mật khẩu: Bên dưới form, có đường link “Quên mật khẩu?” để người dùng khôi phục khi cần. Đặt gần trường mật khẩu để dễ nhìn thấy.
Chuyển hướng: Dưới form có dòng text “Chưa có tài khoản? Đăng ký ngay” kèm link tới trang đăng ký. Chú ý phân biệt rõ ràng giao diện Đăng nhập và Đăng ký để tránh nhầm lẫn.
Theo nguyên tắc, form nên ngắn gọn, label rõ ràng, button gọi hành động (“Đăng nhập”) nổi bật và dễ hiểu. Chú ý hiển thị dữ liệu đầu vào ở dạng “type=email” và hỗ trợ trình quản lý mật khẩu.

3. Register Page (Đăng ký)
Form Đăng ký: Các trường cơ bản: “Họ và tên”, “Email”, “Mật khẩu”, “Xác nhận mật khẩu”. Không yêu cầu quá nhiều thông tin ban đầu để giảm ma sát. Có thể sắp xếp form sang hai cột (name, email) hoặc thứ tự dòng.
Microcopy và mô tả: Thêm dòng mô tả ngắn như “Tạo tài khoản để bắt đầu lập kế hoạch cưới của bạn” giúp người dùng hiểu ngay ý nghĩa của hành động. Mỗi trường input nên có placeholder rõ ràng (ví dụ: “Nhập email của bạn”) và label (ví dụ: “Email *” nếu bắt buộc).
Nút Đăng ký: Nút màu nổi bật, text rõ ràng “Đăng ký” hoặc “Tạo tài khoản”. Theo khuyến cáo, CTA cần ngôn từ cụ thể, tránh “SUBMIT” chung chung.
Tùy chọn bổ sung: Có thể cung cấp tùy chọn “Đăng ký với Google” tương tự trang Đăng nhập. Link chuyển sang trang Đăng nhập nếu đã có tài khoản.
Bảo mật & Chính sách: Ở dưới form, thêm text nhỏ hoặc link “Bằng việc đăng ký, bạn đồng ý với Điều khoản & Chính sách của chúng tôi.” để tăng tính chuyên nghiệp và tin cậy.
Theo tài liệu, form đăng ký nên ngắn gọn (yêu cầu tối thiểu thông tin), với CTA rõ ràng và microcopy hỗ trợ. Nên hiển thị tiến trình nếu form dài, nhưng ở đây độ dài vừa phải nên không nhất thiết phải chia nhiều bước.

4. Wedding Onboarding (Mẫu đơn nhiều bước)
Màn hình này rất quan trọng, giúp thu thập thông tin đám cưới của cặp đôi qua 4 bước. Nên thiết kế dạng wizard/multi-step form với chỉ báo tiến độ (ví dụ: “Bước 1/4”) để người dùng biết còn bao nhiêu bước. Có thể hiện thanh tiến trình (progress bar) hoặc header với số bước.

Bước 1 – Thông tin đám cưới:

Ngày cưới: Chọn ngày (người dùng dùng datepicker hoặc calendar picker).
Địa điểm: Trường nhập văn bản/địa chỉ hoặc chọn thành phố/địa điểm có sẵn.
Số khách: Ô nhập số (numeric input) hoặc thanh trượt số lượng khách.
Bước 2 – Ngân sách:

Tổng ngân sách: Nhập số tiền hoặc dùng slider chọn khoảng ngân sách (ví dụ $10M, $20M, $30M…).
Hiển thị ngay dự đoán chi phí/hạng mục khi chọn ngân sách (ví dụ: "Với ngân sách X triệu, bạn có thể phân bổ như sau…").
Bước 3 – Phong cách đám cưới:

Hiển thị các tùy chọn phong cách dưới dạng buttons hoặc cards có hình minh họa. Ví dụ: “Truyền thống”, “Hiện đại”, “Sang trọng”, “Tối giản”, “Ngoài trời”… Những category phong cách này có thể tham khảo từ các chủ đề cưới phổ biến như Rustic, Boho, Modern, Vintage…. Mỗi style đi kèm mô tả ngắn hoặc hình icon tương ứng.
Người dùng chọn 1-2 phong cách chính để ứng dụng đề xuất theme, vendor phù hợp.
Bước 4 – Dịch vụ ưu tiên:

Danh sách các loại dịch vụ chính kèm checkboxes hoặc toggle: “Makeup & Làm tóc”, “Ảnh/Phim trường”, “Trang trí (hoa, sân khấu)”, “Wedding Planner”, “Váy cưới & Trang phục”… Dựa trên danh sách vendor phổ biến (như danh sách của TungstenRings bao gồm Photographer, Makeup Artist, Floral Designer, etc.).
Người dùng đánh dấu những dịch vụ quan trọng nhất để Planora tập trung gợi ý.
Ở mỗi bước, nút “Tiếp tục”/“Quay lại” rõ ràng. Thiết kế gọn gàng, dùng khoảng trắng hợp lý. Theo nghiên cứu UX, chia form dài thành nhiều bước ngắn giúp giảm mỏi mắt và tỉ lệ bỏ ngang thấp hơn. Luôn thể hiện tiến độ (ví dụ “Bước 2 trên 4”) để người dùng nắm được quá trình.

5. Plan Generation Loading (Đang tạo kế hoạch)
Chỉ báo tiến trình: Màn hình tạm khi AI đang xử lý kế hoạch cưới. Hiển thị animation (ví dụ spinner hoặc progress bar) cùng microcopy như “Đang tạo kế hoạch của bạn…” hoặc “Hang tight, AI đang làm việc!”.
Mẹo UX: Nghiên cứu khuyến nghị cung cấp chỉ báo tiến độ (progress indicator) nếu thời gian chờ >1 giây để người dùng biết tiến trình. Có thể thêm tin nhắn thân thiện (“Gần xong rồi! Đang đưa ý tưởng từ trí tuệ nhân tạo vào kế hoạch của bạn”).
Mục tiêu là giảm cảm giác chờ đợi. Nếu có thể, hiện skeleton screen sơ lược (placeholders) của kết quả sắp tới để user yên tâm rằng ứng dụng đang hoạt động.

6. Wedding Plan Result (Kết quả kế hoạch cưới)
Trang này thể hiện kết quả chính – giá trị cốt lõi của Planora (USP). Cần rõ ràng, gọn gàng:

Khái niệm đám cưới (Wedding Concept): Một đoạn mô tả ngắn về ý tưởng/tổng quan kế hoạch (ví dụ: “Phong cách Modern Rustic với tông màu pastel, đám cưới ngoài trời tại Đà Lạt”). Kết hợp sơ đồ/viz nhỏ nếu có.
Ngân sách dự kiến: Hiển thị tổng ngân sách và phân bổ ước tính cho các hạng mục chính. Có thể dùng biểu đồ tròn (pie chart) cho trực quan: “Budget: X triệu” và breakdown Makeup, Venue, Photo… Tương tự các app quản lý tài chính, biểu đồ giúp người dùng nhanh nắm được chi tiêu.
Timeline tóm tắt: Một timeline ngắn (có thể theo dạng vertical hoặc stepper) hiển thị các mốc quan trọng: “12 tháng trước: Định hình ý tưởng, chọn venue; 6 tháng: Chốt vendor; 1 tháng: In thiệp, finalize; Ngày cưới: …”.
Vendor gợi ý (Recommended Vendors): Danh sách vài nhà cung cấp phù hợp với thông tin vừa nhập (theo style, ngân sách, vị trí). Ví dụ: card Vendor Photo, Studio chọn lọc. Theo ý tưởng “AI gợi ý nhà cung cấp đúng thời điểm theo style, ngân sách, vị trí” như Pearl Planner.
Khen thưởng (nếu có): Có thể nhắc về chương trình khách hàng thân thiết (như Pearl Planner có Diamond points) hoặc xác nhận đã lưu tiến độ.
Trang này sẽ khiến người dùng ấn tượng vì thể hiện sự “thông minh” của Planora. Việc gợi ý vendor dựa trên style/địa điểm/nhu cầu là tính năng nổi bật. Đồng thời tổng hợp timeline, checklist, vendor vào một nơi (“All-in-One Dashboard”) cũng tăng tính tiện dụng.

7. Dashboard Người dùng
Sau khi hoàn tất onboarding, người dùng vào trang Dashboard tổng quan:

Tóm tắt đám cưới: Hiển thị ngắn gọn thông tin chính: ngày cưới, địa điểm, phong cách, ngân sách tổng. Có thể làm dạng card nhỏ.
Tiến độ Checklist & Timeline: Hai widget mini (ví dụ thanh tiến độ) thể hiện % hoàn thành checklist và timeline. Ví dụ “Checklist: 5/20 tasks đã xong”, “Timeline: [progress bar]”.
Ngân sách & Chi tiêu: Biểu đồ hoặc indicator cho biết tổng ngân sách, đã dùng và còn lại. Ví dụ thanh số hay biểu đồ tròn như ở trang Kết quả.
Danh sách vendor đã lưu (Shortlist): Hiển thị tóm tắt các vendor cặp đôi đã shortlist (avatar, tên, rating). Giúp dễ tiếp cận và quản lý.
Trạng thái liên hệ (Inquiry Status): Bảng hoặc danh sách hiển thị tình trạng các yêu cầu đã gửi đến vendor (ví dụ “Đã gửi hỏi giá: 3, Vendor phản hồi: 1, Chưa trả lời: 2”).
Mục khác: Có thể thêm khu vực “Lời nhắc nhiệm vụ” (Reminder), “Gợi ý cho bạn” (deals / offer), tùy theo nhu cầu.
Dashboard tổng hợp mọi yếu tố: timeline, checklist, vendor (vision) – “tất cả trong một” như Pearl Planner đề cập. Giao diện rõ ràng, biểu đồ/trực quan giúp người dùng dễ theo dõi tiến độ và chi phí.

8. Vendor Marketplace (Chợ Vendor)
Trang hiển thị danh sách nhà cung cấp (tương tự marketplace):

Dạng lưới/luồng hiển thị Vendor Cards: Mỗi card bao gồm hình ảnh đại diện, tên vendor/công ty, loại dịch vụ (category), khoảng giá (nếu có), rating sao (theo reviews). Thông tin này giúp user so sánh nhanh. Ví dụ: card Khoảnh khắc Cưới – “Nhiếp ảnh”, giá 10-20 triệu, ★★★★★.
Xem thêm/Phân trang: Nếu nhiều vendor, nên phân trang hoặc load thêm (infinite scroll).
Tính năng Lưu/Và liên hệ: Trên mỗi card có icon/tùy chọn nhanh “Lưu vào danh sách” (Shortlist) hoặc nút “Liên hệ ngay”.
Nên theo nguyên tắc UI listing: bố cục card rõ ràng, thông tin chính nổi bật. Có thể tham khảo cách thiết kế card marketplace chung (hình ảnh trên cùng, dưới là tên+điểm đánh giá).

9. Vendor Search & Filter (Tìm kiếm và Lọc Vendor)
Thanh tìm kiếm: Ở trên cùng, ô tìm kiếm theo từ khóa (tên vendor hoặc dịch vụ cụ thể).
Thanh lọc (sidebar): Các bộ lọc quan trọng như Loại dịch vụ (Category), Ngân sách (Budget), Khu vực (Location), Phong cách (Style). Ví dụ: checkbox chọn “Makeup”, “Catering”, hoặc thanh giá từ thấp đến cao. Theo quy tắc filter UX, nên cho phép chọn nhiều tuỳ chọn trong 1 nhóm (checkbox, không dùng radio bắt buộc) để linh hoạt .
Hiển thị số kết quả: Khi chọn bộ lọc, cập nhật số vendor phù hợp ngay (ví dụ “Hiển thị 15 kết quả”). Theo khuyến nghị, hiển thị số lượng kết quả cạnh tuỳ chọn lọc giúp user có niềm tin (ví dụ “Makeup (5)”).
Áp dụng & Xóa bộ lọc: Có nút “Áp dụng bộ lọc” (trên mobile) và/hoặc hiển thị chip filter đã chọn để dễ xóa. Cho phép “Clear all” để reset nhanh bộ lọc.
Thiết kế: trên desktop có thể cố định sidebar trái. Trên mobile, dùng popup full-screen filter. Luôn giữ filter rõ ràng để người dùng điều chỉnh mọi lúc.

10. Vendor Detail Page (Chi tiết Vendor)
Trang giới thiệu chi tiết một nhà cung cấp cụ thể:

Header: Ảnh cover hoặc logo của vendor, cùng tên công ty. Bên cạnh có nút “★ Thêm vào danh sách yêu thích” và nút “Gửi yêu cầu” (Send Inquiry).
Portfolio: Phần lớn phía trên là gallery ảnh/video minh họa dự án đã thực hiện (Portfolio). Người dùng có thể xem các ví dụ thực tế của vendor.
Thông tin mô tả: Đoạn văn ngắn giới thiệu công ty/dịch vụ (Who they are, style, kinh nghiệm). Có thể thêm thông tin như địa điểm hoạt động.
Dịch vụ & Giá: Liệt kê các gói dịch vụ hoặc khoảng giá (ví dụ: Gói cơ bản 20tr, Gói cao cấp 50tr). Nêu rõ hạng mục họ cung cấp.
Đánh giá (Reviews): Hiển thị rating trung bình và trích dẫn vài đánh giá thực tế của khách trước (nếu có). Đánh giá giúp tăng độ tin cậy. Theo Eleken, profile vendors nên tập trung vào “reviews, portfolio” để tăng trust.
CTA: Nút “Liên hệ” hoặc “Yêu cầu báo giá” ở gần đầu trang và cuối trang. Sau trang này, user có thể “Add to Shortlist” hoặc “Send Inquiry”.
Theo nguyên tắc thiết kế profile dịch vụ, tất cả thông tin quan trọng (portfolio, đánh giá, giá) đều hiển thị rõ ràng để người dùng dễ so sánh. Các nút hành động được đặt dễ nhìn, ví dụ bar cố định khi cuộn.

11. Compare Vendors (So sánh Vendor)
Màn hình này cho phép so sánh chi tiết giữa 2-3 nhà cung cấp đã chọn:

Bảng so sánh (Comparison Table): Dạng bảng, mỗi cột là một vendor, mỗi hàng là tiêu chí so sánh (Tên, Giá, Phong cách, Đánh giá, Điểm nổi bật, Dịch vụ bao gồm, ...). Ví dụ: cột Vendor A, Vendor B; hàng Giá (20tr vs 25tr), Phong cách (Classic vs Modern), Rating (4.5 vs 4.7).
Thiết kế: Bảng phải rõ ràng, định dạng nhất quán. Theo Nielsen Norman, so sánh nên dùng layout đơn giản, giúp user dễ quét từng hàng để so sánh. Việc đưa các thông tin đều định dạng giống nhau giúp người dùng đưa ra quyết định mua/báo giá.
Điều hướng: Nút “Quay lại Marketplace” hoặc tiếp tục shortlist.
Comparison table hỗ trợ quyết định của người dùng khi phải cân nhắc nhiều tiêu chí.

12. Shortlist Page (Vendor đã lưu)
Trang này liệt kê các vendor user đã đánh dấu yêu thích:

Danh sách vendors lưu: Mỗi item giống một phiên bản đơn giản của card vendor (ảnh, tên, hạng mục, rating).
Tác vụ: Cho phép user xoá khỏi shortlist, chuyển qua so sánh, hoặc nhắn tin/liên hệ. Ví dụ các nút “So sánh” (check box), “Gửi thư” hoặc icon thùng rác.
Giao diện: Hiển thị rõ từng mục lưu, có thể sắp xếp/bộ lọc theo tên/danh mục nếu nhiều.
Chú ý UX: Theo nghiên cứu, cần tránh gọi nó là “wishlist” (dễ gây hiểu nhầm) mà đặt tên thân thiện như “Yêu thích” hoặc “Saved”. Tính năng này nên dễ tìm thấy (nút luôn hiện trên header hoặc menu) và không yêu cầu đăng nhập mới sử dụng.
Mục tiêu: cho phép người dùng quản lý danh sách vendor ưa thích, dễ loại bỏ hoặc chuyển sang bước tiếp theo (so sánh, liên hệ) nhanh chóng.

13. Inquiry Form (Form Gửi Yêu cầu)
Khi người dùng muốn liên hệ vendor:

Tiêu đề: “Gửi yêu cầu đến [Tên Vendor]”.
Nội dung form: Có sẵn các thông tin cần thiết để vendor biết yêu cầu:
Ngày cưới: (mặc định lấy từ thông tin onboarding) – user có thể chỉnh.
Ngân sách: (mặc định hoặc người dùng nhập thêm chi tiết tổng ngân sách).
Tin nhắn: Ô text lớn để user nhập yêu cầu cụ thể (ví dụ: “Xin chào, tôi muốn hỏi gói chụp ảnh trọn gói…”).
Nút gửi: “Gửi yêu cầu” hoặc “Gửi tin nhắn”. Sau khi gửi, hiển thị thông báo thành công và chuyển đến màn hình Lịch sử Inquiry.
Form này tập trung vào nội dung “brief” cho vendor, nên giữ ngắn gọn, rõ ràng.

14. Inquiry History (Lịch sử Yêu cầu)
Trang tổng hợp các yêu cầu (inquiry) đã gửi:

Danh sách yêu cầu: Mỗi hàng/bảng tương ứng một vendor đã liên hệ, có cột: Tên Vendor, Ngày gửi, Trạng thái (Pending – chờ phản hồi, Replied – đã trả lời, Closed – đã hoàn tất).
Tính năng: Cho phép click vào để xem lại nội dung yêu cầu và phản hồi. Nút “Hủy” hoặc “Mở lại” nếu cần.
Giao diện: Có thể dùng màu sắc hoặc icon để phân biệt trạng thái (ví dụ Pending màu cam, Replied màu xanh).
Giúp người dùng quản lý liên lạc với vendor dễ dàng, biết vendor nào đã phản hồi.

15. Budget Management (Quản lý Ngân sách)
Trang chi tiết theo dõi ngân sách cưới:

Tổng ngân sách: Con số rõ ràng (ví dụ 100 triệu).
Đã dùng/Còn lại: Hiển thị số tiền đã chi (do user cập nhật khi đặt cọc) và còn lại (tổng trừ đã chi).
Hạng mục chi tiêu: Danh sách các hạng mục (ví dụ: Trang điểm, Studio, Trang trí, Váy…) cùng số tiền dự kiến và thực tế. Có thể dùng biểu đồ tròn hoặc thanh để trực quan hoá phân bổ (ví dụ: Pie chart chia theo % ngân sách các mục).
Sửa/Xóa: Cho phép user chỉnh số liệu (thêm chi cho hạng mục khi có giao dịch thực tế).
Gợi ý: Nếu ngân sách vượt, ứng dụng có thể đưa cảnh báo hoặc gợi ý điều chỉnh.
Tương tự các app quản lý tài chính, biểu đồ đơn giản (pie/bar) hỗ trợ trực quan theo dõi.

16. Checklist Management (Quản lý Checklist)
Trang quản lý task (to-do) cho đám cưới:

Danh sách nhiệm vụ: Các item cốt yếu (ví dụ: “Đặt địa điểm”, “Chọn photographer”, “Gửi thiệp”, “Mua trang phục”). Mỗi item kèm checkbox.
Trạng thái hoàn thành: User tick vào ô khi đã xong. Màn hình tự động cập nhật tiến độ (số item đã hoàn thành).
Thêm/Sửa/Xóa: Cho phép người dùng thêm nhiệm vụ mới hoặc chỉnh lại. Ví dụ kéo thả để sắp xếp độ ưu tiên.
Giao diện: Đơn giản, dạng danh sách với các checkbox lớn dễ tương tác. Theo UX, việc tick checklist mang lại cảm giác đã hoàn thành công việc và giúp giảm căng thẳng.
Checklist nên bắt đầu sẵn vài item cơ bản theo lộ trình tổng thể, và user có thể tùy chỉnh thêm. Đây là một tính năng nội bộ rất thông dụng trong các app cưới, tương tự WedMeGood cung cấp checklist theo tháng (từ -12 đến -1) để user đánh dấu.

17. Timeline Page (Timeline)
Trang Timeline hiển thị mốc thời gian cụ thể của kế hoạch:

Dạng Timeline kéo (vertical hoặc horizontal): Các cột thời gian như “12 tháng trước”, “6 tháng trước”, “3 tháng trước”, “Ngày cưới”,…
Các mốc/công việc chính: Dưới mỗi khoảng thời gian, liệt kê những việc quan trọng (ví dụ: 6 tháng trước: “Chốt danh sách khách, đặt tiệc”; 3 tháng trước: “Chốt menu, thử trang phục”; Ngày cưới: “Tham dự lễ, tiệc”).
Điểm nhấn: Có thể đánh dấu sự kiện quan trọng bằng icon (ví dụ hình đồng hồ, hoa, váy).
Tính năng: User có thể nhấn vào mỗi mốc để xem chi tiết (task liên quan), hoặc tùy chỉnh (thêm/mở rộng timeline riêng).
Timeline giúp trực quan hoá tiến độ theo mốc thời gian. Mục đích là tạo cảm giác “Đã lên kế hoạch rõ ràng từng giai đoạn”, tương tự như kế hoạch từ các app chuyên nghiệp.

18. Profile Page (Hồ sơ người dùng)
Trang hồ sơ cá nhân của user (couple):

Thông tin cá nhân: Email, Họ tên (từ đăng ký), có thể avatar.
Thông tin đám cưới: Ngày cưới, địa điểm, phong cách chính (theo bước onboarding). Cho phép chỉnh sửa nếu cần (ví dụ thay đổi ngày).
Bảo mật: Thêm phần “Đổi mật khẩu” với các trường Mật khẩu cũ, mới, xác nhận, cùng nút xác nhận.
Các tab/nút khác: Có thể có “Đăng xuất” hoặc liên kết tới các cài đặt khác.
Theo nguyên tắc, profile page cần hiển thị các thông tin cơ bản đã thu thập, dễ chỉnh sửa. Email, tên là tối thiểu. Nếu có thể, cho tải ảnh đại diện để cá nhân hoá.

19. Vendor Dashboard
Dành cho vendor (người cung cấp dịch vụ) sau khi đăng nhập:

Thống kê nhanh: Các chỉ số như tổng số inquiries nhận được, số portfolio đã đăng (số ảnh/album), số hợp đồng đã hoàn thành, đánh giá trung bình. Hiển thị bằng các cards hoặc biểu đồ nhỏ.
Danh sách mới: Hiển thị các inquiries mới hoặc sắp tới cần trả lời.
Nhắc nhở: Các tin nhắn/chú ý quan trọng (ví dụ: có review mới).
Mục tiêu: giúp vendor nhanh nắm tình hình kinh doanh trên Planora. Đây chỉ là MVP, nên chỉ cần vài widget cơ bản (Inquiry count, Portfolio count,...).

20. Vendor Profile (Vendor Side)
Trang cho vendor quản lý hồ sơ công ty của họ:

Tên công ty & Logo: Trên đầu, kèm mô tả ngắn về dịch vụ (Ví dụ: “Chuyên Wedding Photographer khu vực XYZ”).
Thông tin chi tiết: Địa chỉ, khu vực phục vụ, kinh nghiệm, các dịch vụ cung cấp.
Liên kết: Nút để edit các trường trên.
Ảnh bìa/ảnh đại diện: Cho phép upload.
Tương tự trang detail công khai, nhưng vendor có thể chỉnh sửa. Đảm bảo layout gọn, dễ dùng.

21. Portfolio Management (Quản lý Portfolio)
Cho vendor thêm/sửa bộ sưu tập ảnh:

Hiển thị gallery hiện tại: Thumbnail các ảnh đã đăng.
Nút thêm ảnh mới: Cho phép upload hình ảnh hoặc album.
Sửa/Xóa: Icon để xóa ảnh cũ hoặc thay đổi thứ tự (drag & drop) nếu muốn ưu tiên.
Portfolio giúp vendor chứng minh năng lực. Thiết kế trực quan (như Pinterest gallery) giúp dễ tương tác.

22. Inquiry Management (Vendor)
Trang vendor xem và trả lời yêu cầu:

Danh sách inquiries: Mỗi mục hiển thị ngắn ngày, tên khách, nội dung yêu cầu, trạng thái (đã xem/chưa xem).
Mở chi tiết: Nhấp vào yêu cầu để đọc tin nhắn gốc từ khách, cùng nút phản hồi (gửi email hoặc chat nội bộ).
Lọc: Có thể lọc inquiries theo trạng thái (mới, đang xử lý, đã đóng).
Giúp vendor xử lý liên lạc với khách. Tương tự CRM cơ bản: hiển thị luồng hội thoại.

23. Admin Dashboard
Trang tổng quan cho quản trị viên hệ thống:

Thống kê chung: Số lượng user, số vendor, tổng inquiry, cấp bậc sử dụng (ví dụ gói free/premium nếu có).
Báo cáo: Biểu đồ đơn giản về tăng trưởng người dùng, vendor, inquiry theo tháng.
Cảnh báo: Báo cáo khi có user hay vendor mới đăng ký cần xét duyệt (nếu quy trình yêu cầu).
Chỉ cần hiển thị các số liệu quan trọng để ban quản trị giám sát hệ sinh thái.

24. Admin – Quản lý User/Vendor
Trang quản lý danh sách user và vendor:

Danh sách user: Bảng gồm tên, email, ngày đăng ký, vai trò (user hay vendor), nút hành động (khóa tài khoản, xóa, gửi email).
Danh sách vendor: Bảng tương tự, có thêm trường xác nhận (approved/blocked), nút duyệt hoặc loại bỏ.
Tìm kiếm/Lọc: Tìm theo tên hoặc lọc theo trạng thái.
Hỗ trợ admin kiểm soát và phê duyệt tài khoản. Giao diện đơn giản: bảng danh sách kèm chức năng cơ bản.

Tóm lại, mỗi màn hình sẽ kết hợp các thành phần UI như trên để hỗ trợ người dùng lập kế hoạch đám cưới hoàn hảo. Ví dụ, landing page nhấn mạnh CTA và lợi ích sản phẩm; quy trình đăng ký/đăng nhập ngắn gọn, rõ ràng; onboarding phân bước có tiến độ rõ ràng; trang kết quả và dashboard tổng hợp thông tin đầy đủ; marketplace cho phép tìm kiếm và lọc theo ngân sách/phong cách; profile vendor và user đều có portfolio và đánh giá để tăng độ tin cậy.

Những chi tiết này đảm bảo giao diện Figma đầy đủ yếu tố chức năng cho MVP, vừa dễ dùng, vừa thể hiện đầy đủ quy trình lập kế hoạch cưới.

Nguồn tham khảo: Tổng hợp từ hướng dẫn thiết kế landing page, bài viết UX/UI về onboarding & login, các ví dụ ứng dụng cưới (WedMeGood, Pearl Planner), và nguyên tắc thiết kế UI (filter UX, so sánh sản phẩm, profile dịch vụ, v.v.).