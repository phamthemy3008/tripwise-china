import { TripDocument } from "../types/itinerary";

export const SAMPLE_TRIPS: TripDocument[] = [
  {
    id: "trip_zhangjiajie_chengdu_16d15n",
    trip_title: "Trương Gia Giới – Vũ Long – Trùng Khánh – Thành Đô – Núi Nga Mi",
    duration: "16 ngày 15 đêm (14/11 – 29/11/2026)",
    created_at: 1731542400000,
    budget_cap_rmb: 14000,
    exchange_rate_rmb_vnd: 3857.1,
    category_budget_caps: {
      hotel: 4500,
      food: 3000,
      transport: 3800,
      ticket: 2500,
      shopping: 800,
    },
    days: [
      {
        day_number: 1,
        date: "Thứ Bảy, 14/11/2026",
        city: "Trương Gia Giới (Zhangjiajie - 张家界)",
        title: "TP.HCM – Trương Gia Giới – Tòa nhà 72 Kỳ Lầu & Phố Cổ Đại Dung",
        hotel: {
          name_vn: "Atour Hotel (Chi nhánh Ga cáp treo Thiên Môn Sơn)",
          name_zh: "张家界永定区天门山索道站亚朵酒店",
          address: "Tòa Dianda Plaza, Quanliping, quận Vĩnh Định, Trương Gia Giới",
          phone: "+86-744-8123333 / +86-19374455188"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "02:25 - 10:20",
            activity_title: "Chuyến bay TP.HCM (SGN T2) – Quảng Châu (CAN T2) – Trương Gia Giới (DYG T2)",
            description: "02:25 cất cánh từ Tân Sơn Nhất (SGN T2) trên chuyến bay CZ6090, đến Bạch Vân Quảng Châu (CAN T2) lúc 06:20. Làm thủ tục hải quan nhập cảnh tại ga T2 Quảng Châu (quá cảnh 2h 15m). 08:35 nối chuyến bay CZ3381 đi Trương Gia Giới, 10:20 hạ cánh sân bay Hà Hoa Trương Gia Giới (DYG T2). Đi taxi/Didi khoảng 12 phút về trung tâm nhận phòng tại Atour Hotel. Nghỉ ngơi hồi sức và ăn trưa tại Tiệm Mì Bò Hùng Ký.",
            place_name: "Sân bay Hà Hoa Trương Gia Giới",
            place_zh: "张家界荷花国际机场",
            amap_query: "张家界荷花国际机场",
            transport_hint: "China Southern Airlines CZ6090 (02:25–06:20) & CZ3381 (08:35–10:20); Taxi 12 phút về Atour Hotel",
            ticket_hint: "PNR: PT1MQ4 | Đơn Trip.com: 1688902167631795 | Hoàng Thị Thương (HC: C7548251, Vé: 784-5239396090) & Phạm Thế Mỹ (HC: C7474611, Vé: 784-5239396091) | Vé lượt đi: 1,813 RMB (~6,345,500 VND)",
            duration_hint: "8 tiếng",
            tips: "Bay đêm, hành lý gửi thẳng đến Trương Gia Giới; nhập cảnh Trung Quốc tại CAN T2.",
            dishes: [
              {
                dish_name_vn: "Mì bắp bò cay Hồ Nam (Tiệm Mì Bò Hùng Ký)",
                dish_name_zh: "熊记牛肉面馆 牛肉面",
                google_img_keyword: "湖南牛肉面",
                baidu_img_keyword: "湖南特色牛肉面",
                restaurant: {
                  name_vn: "Tiệm Mì Bò Hùng Ký (Gần Atour Hotel / Ga cáp treo)",
                  name_zh: "熊记牛肉面馆",
                  address_hint: "Số 68 đường Tử Ngọ, quận Vĩnh Định, Trương Gia Giới",
                  amap_query: "熊记牛肉面馆 张家界",
                  price_range: "~20 - 35 ¥/bát",
                  rating: "4.7★ (Dianping)",
                  recommended_dish: "Mì bắp bò hầm hoa tiêu Hồ Nam & Trứng ngâm trà",
                  note: "Nước dùng xương hầm 12 tiếng cay nồng ấm bụng, ngay gần khách sạn Atour."
                }
              },
              {
                dish_name_vn: "Bún gạo xào chua cay",
                dish_name_zh: "酸辣炒米粉",
                google_img_keyword: "湖南酸辣炒米粉",
                baidu_img_keyword: "酸辣炒米粉"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "14:30 - 17:30",
            activity_title: "Chiêm ngưỡng Tòa nhà 72 Kỳ Lầu tráng lệ",
            description: "Tham quan Tòa nhà 72 Kỳ Lầu (七十二奇楼), công trình nhà sàn Thổ Gia điêu khắc bằng gỗ tráng lệ cao 109.9m. Chụp ảnh lúc hoàng hôn khi hệ thống đèn lồng bừng sáng lung linh.",
            place_name: "Tòa nhà 72 Kỳ Lầu",
            place_zh: "七十二奇楼",
            amap_query: "七十二奇楼",
            transport_hint: "Gọi taxi / Didi từ khách sạn Atour (~15 phút)",
            ticket_hint: "Vé tham quan đêm ~100 RMB",
            duration_hint: "3 tiếng",
            tips: "Khung giờ lên đèn đẹp nhất là từ 17:30 đến 19:00."
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 21:00",
            activity_title: "Dạo Phố cổ Đại Dung & Thưởng thức Lẩu Tam Hạ Oa",
            description: "Dạo bước quanh Phố cổ Đại Dung (大庸古城) dọc bờ sông Lishui. Ăn tối tại Hồ Sư Phụ Tam Hạ Oa (胡师傅三下锅): thưởng thức lẩu xào khô Tam Hạ Oa (lòng heo, dạ dày bò, thịt xông khói xào trong thố gang cay nồng) và đậu phụ sốt cay Thổ Gia.",
            place_name: "Phố cổ Đại Dung & Hồ Sư Phụ Tam Hạ Oa",
            place_zh: "大庸古城 / 胡师傅三下锅",
            amap_query: "胡师傅三下锅",
            transport_hint: "Đi bộ hoặc taxi ngắn 5 phút",
            tips: "Nên thử Tam Hạ Oa xào khô trong thố gang cay nồng.",
            dishes: [
              {
                dish_name_vn: "Lẩu xào khô Tam Hạ Oa (Hồ Sư Phụ)",
                dish_name_zh: "胡师傅三下锅",
                google_img_keyword: "张家界三下锅",
                baidu_img_keyword: "张家界胡师傅三下锅",
                restaurant: {
                  name_vn: "Hồ Sư Phụ Tam Hạ Oa (Chi nhánh Phố Cổ)",
                  name_zh: "胡师傅三下锅 (大庸桥店)",
                  address_hint: "Số 117 đường Tử Ngọ, quận Vĩnh Định, Trương Gia Giới",
                  amap_query: "胡师傅三下锅",
                  price_range: "~55 - 80 ¥/người",
                  rating: "4.8★ (Đệ nhất Tam Hạ Oa)",
                  recommended_dish: "Tam Hạ Oa xào khô (lòng heo, dạ dày bò, thịt xông khói)",
                  note: "Quán thương hiệu lâu năm đông khách nhất vùng, nên đi sớm trước 18h."
                }
              },
              {
                dish_name_vn: "Đậu phụ sốt cay Thổ Gia",
                dish_name_zh: "土家豆腐",
                google_img_keyword: "土家豆腐",
                baidu_img_keyword: "土家特色豆腐"
              }
            ]
          }
        ]
      },
      {
        day_number: 2,
        date: "Chủ Nhật, 15/11/2026",
        city: "Trương Gia Giới (Zhangjiajie - 张家界)",
        title: "Chinh phục Thiên Môn Sơn (Tianmen Mountain) & Cổng Trời Thiên Môn Động",
        hotel: {
          name_vn: "Atour Hotel (Chi nhánh Ga cáp treo Thiên Môn Sơn)",
          name_zh: "张家界永定区天门山索道站亚朵酒店",
          address: "Tòa Dianda Plaza, Quanliping, quận Vĩnh Định, Trương Gia Giới",
          phone: "+86-744-8123333"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "07:30 - 12:00",
            activity_title: "Cáp treo Thiên Môn Sơn – Tuyến Tây (West Line): Sạn Đạo Kính & Quỷ Cốc",
            description: "Đi bộ 5 phút từ khách sạn sang Ga cáp treo trung tâm. Đi tuyến cáp treo vượt núi dài 7.400m lên đỉnh Thiên Môn Sơn. Đi Tuyến Tây (West Line): Trải nghiệm vách kính Sạn Đạo Kính (玻璃栈道 - Glass Skywalk) cheo leo ở độ cao 1.400m và dạo bước trên Đường vách đá Quỷ Cốc (鬼谷栈道). Trưa ăn nhẹ tự túc gần Đền Thiên Môn Sơn (xúc xích ngô nướng, cơm tự sôi hoặc bánh ngọt mang theo).",
            place_name: "Thiên Môn Sơn - Sạn Đạo Kính (West Line)",
            place_zh: "天门山玻璃栈道 / 鬼谷栈道",
            amap_query: "天门山索道下站",
            transport_hint: "Cáp treo Tuyến A (Line A - Lên cáp treo, xuống thang cuốn xuyên núi và xe buýt)",
            ticket_hint: "Vé Tuyến A ~278 RMB (bắt buộc đặt trước 7-10 ngày để tối ưu thể lực)",
            duration_hint: "4.5 tiếng",
            tips: "Mang bao bọc giày (5 RMB) khi bước lên cầu kính Sạn Đạo Kính."
          },
          {
            time_slot: "Chiều",
            time_range: "12:30 - 16:30",
            activity_title: "Đền Thiên Môn Sơn – Thang cuốn xuyên núi – Cổng Trời 999 bậc & Đèo 99 khúc cua",
            description: "Viếng Đền Thiên Môn Sơn (天门山寺). Đi 7 tầng thang cuốn xuyên lòng núi xuống chân Cổng Trời – Thiên Môn Động (天门洞). Thử thách đi bộ xuống 999 bậc đá dốc đứng ra quảng trường lớn. Lên xe buýt sinh thái trải nghiệm cung đường đèo 99 khúc cua (Tongtian Avenue) ngoạn mục.",
            place_name: "Thiên Môn Động (Cổng Trời)",
            place_zh: "天门山寺 / 天门洞",
            amap_query: "天门山天门洞",
            transport_hint: "7 tầng thang cuốn xuyên núi & Xe buýt sinh thái đèo 99 khúc cua",
            duration_hint: "4 tiếng",
            tips: "Nếu mỏi chân có thể mua vé thang cuốn phụ đi xuống thay vì bước bộ 999 bậc."
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 20:30",
            activity_title: "Ăn tối đặc sản Tương Tây tại Ngân Mãn Đẩu Thổ Thái Quán",
            description: "Ăn tối tại Ngân Mãn Đẩu Thổ Thái Quán (银满斗土菜馆). Thưởng thức vịt hầm hạt dẻ rừng Tương Tây, cá suối om canh chua người Miêu và thịt hun khói xào măng trúc.",
            place_name: "Ngân Mãn Đẩu Thổ Thái Quán",
            place_zh: "银满斗土菜馆",
            amap_query: "银满斗土菜馆",
            tips: "Món vịt hầm hạt dẻ rừng, cá suối chua ngọt người Miêu và thịt hun khói xào măng trúc cực kỳ đưa cơm.",
            dishes: [
              {
                dish_name_vn: "Vịt hầm hạt dẻ rừng Tương Tây",
                dish_name_zh: "板栗炖鸭",
                google_img_keyword: "湘西板栗炖鸭",
                baidu_img_keyword: "板栗炖鸭 湘西",
                restaurant: {
                  name_vn: "Ngân Mãn Đẩu Thổ Thái Quán",
                  name_zh: "银满斗土菜馆",
                  address_hint: "Hẻm Thương Nghiệp, đường Thập Tự Nhai, quận Vĩnh Định",
                  amap_query: "银满斗土菜馆",
                  price_range: "~45 - 70 ¥/người",
                  rating: "4.7★ (Đặc sản Tương Tây)",
                  recommended_dish: "Vịt hầm hạt dẻ rừng, Cá suối om canh chua & Thịt hun khói xào măng trúc",
                  note: "Quán gia truyền phong cách nhà gỗ Thổ Gia ấm cúng, đậm đà vị núi rừng."
                }
              },
              {
                dish_name_vn: "Cá suối om canh chua người Miêu",
                dish_name_zh: "苗家酸汤鱼",
                google_img_keyword: "苗家酸汤鱼",
                baidu_img_keyword: "苗家酸汤鱼"
              },
              {
                dish_name_vn: "Thịt hun khói xào măng trúc",
                dish_name_zh: "腊肉炒冬笋",
                google_img_keyword: "湖南腊肉炒冬笋",
                baidu_img_keyword: "湘西腊肉炒冬笋"
              }
            ]
          }
        ]
      },
      {
        day_number: 3,
        date: "Thứ Hai, 16/11/2026",
        city: "Vũ Lăng Nguyên (Wulingyuan - 武陵源)",
        title: "Vũ Lăng Nguyên – Thang máy Bách Long – Viên Gia Giới (Núi Avatar)",
        hotel: {
          name_vn: "Veil Canyon Lodge (Thiên Sơn Nguyệt)",
          name_zh: "张家界芊山月度假酒店（国家森林公园武陵源标志门店）",
          address: "Số 255 đường Gaoyun, quận Vũ Lăng Nguyên, Trương Gia Giới",
          phone: "+86-18474499160"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "08:00 - 11:30",
            activity_title: "Di chuyển lên Vũ Lăng Nguyên & Vào Công viên Rừng Quốc gia",
            description: "Trả phòng Atour Hotel; gọi xe di chuyển lên khu thắng cảnh Vũ Lăng Nguyên (~45 phút). Gửi hành lý tại Veil Canyon Lodge (ngay sát Cổng Đông Biaozhi Gate). Quét hộ chiếu vào Công viên Rừng Quốc gia Trương Gia Giới. Trưa ăn nhanh tại khu dịch vụ gần trạm xe buýt Mê Hồn Đài (Mihun Platform).",
            place_name: "Cổng Đông Vũ Lăng Nguyên (Biaozhi Gate)",
            place_zh: "武陵源标志门",
            amap_query: "武陵源标志门门票站",
            transport_hint: "Xe Didi ~45 phút từ Atour Hotel lên Vũ Lăng Nguyên",
            ticket_hint: "Vé Công viên Rừng Quốc gia có giá trị 4 ngày liên tiếp",
            duration_hint: "3.5 tiếng"
          },
          {
            time_slot: "Chiều",
            time_range: "12:00 - 16:30",
            activity_title: "Thang máy Bách Long & Viên Gia Giới (Cột trụ Càn Khôn – Núi Avatar)",
            description: "Đi xe buýt nội khu đến trạm Thang máy Bách Long (百龙天梯), trải nghiệm thang máy kính ngoài trời cao 326m lên đỉnh Viên Gia Giới trong 88 giây. Khám phá Viên Gia Giới (袁家界): Ngắm Cột trụ Càn Khôn (乾坤柱) — nguyên mẫu ngọn núi bay Avatar Hallelujah Mountain, chiêm ngưỡng Mê Hồn Đài (迷魂台) và cầu đá tự nhiên Thiên Hạ Đệ Nhất Kiều.",
            place_name: "Thang máy Bách Long & Viên Gia Giới",
            place_zh: "百龙天梯 / 袁家界",
            amap_query: "百龙天梯下站",
            transport_hint: "Xe buýt sinh thái nội khu + Thang máy Bách Long",
            ticket_hint: "Vé thang máy Bách Long một chiều ~65 RMB",
            duration_hint: "4.5 tiếng",
            tips: "Đứng sát mép kính thang máy để có góc nhìn ngoạn mục nhất khi vút lên đỉnh."
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 21:00",
            activity_title: "Dạo Phố cổ Khê Bố & Ăn tối Tác Khê Sơn Trại",
            description: "Về khách sạn nhận phòng. Dạo chơi Phố cổ Khê Bố (溪布老街). Ăn tối tại Tác Khê Sơn Trại (索溪山寨·湘西民间菜): thưởng thức gà hầm mộc nhĩ vách đá, cá suối nướng ống tre, bánh giầy nếp nướng chấm mật đường và thịt ba chỉ gác bếp xào ớt chuông.",
            place_name: "Phố cổ Khê Bố & Tác Khê Sơn Trại",
            place_zh: "溪布老街 / 索溪山寨",
            amap_query: "索溪山寨武陵源店",
            transport_hint: "Đi bộ 10 phút từ khách sạn",
            dishes: [
              {
                dish_name_vn: "Gà hầm mộc nhĩ vách đá",
                dish_name_zh: "岩耳炖鸡",
                google_img_keyword: "岩耳炖鸡 张家界",
                baidu_img_keyword: "岩耳炖鸡"
              },
              {
                dish_name_vn: "Cá suối nướng ống tre",
                dish_name_zh: "竹筒溪水鱼",
                google_img_keyword: "竹筒溪水鱼",
                baidu_img_keyword: "竹筒鱼 湘西"
              },
              {
                dish_name_vn: "Bánh giầy nếp nướng chấm mật đường",
                dish_name_zh: "糍粑",
                google_img_keyword: "湘西红糖糍粑",
                baidu_img_keyword: "张家界烤糍粑"
              },
              {
                dish_name_vn: "Thịt ba chỉ gác bếp xào ớt chuông",
                dish_name_zh: "湘西腊肉",
                google_img_keyword: "湘西小炒腊肉",
                baidu_img_keyword: "湘西腊肉"
              }
            ]
          }
        ]
      },
      {
        day_number: 4,
        date: "Thứ Ba, 17/11/2026",
        city: "Vũ Lăng Nguyên (Wulingyuan - 武陵源)",
        title: "Thiên Tử Sơn Kỳ Vĩ & Thung Lũng Suối Roi Vàng",
        hotel: {
          name_vn: "Veil Canyon Lodge (Thiên Sơn Nguyệt)",
          name_zh: "张家界芊山月度假酒店（国家森林公园武陵源标志门店）",
          address: "Số 255 đường Gaoyun, quận Vũ Lăng Nguyên, Trương Gia Giới",
          phone: "+86-18474499160"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "08:30 - 12:00",
            activity_title: "Cáp treo Thiên Tử Sơn & Rừng sa thạch Ngự Bút Phong",
            description: "Đi cáp treo lên Thiên Tử Sơn (天子山). Ngắm rừng sa thạch tháp nhọn kỳ vĩ tại Ngự Bút Phong (御笔峰), Tiên Nữ Tán Hoa (仙女散花) và Công viên Hạ Long. Trưa thưởng thức khoai tây bi nướng giòn rắc ớt bột (炕土豆) và ngô nướng tại các lán nghỉ ven suối.",
            place_name: "Thiên Tử Sơn (Tianzi Mountain)",
            place_zh: "天子山 / 御笔峰",
            amap_query: "天子山索道下站",
            transport_hint: "Cáp treo Thiên Tử Sơn Tianzi Mountain Cableway",
            ticket_hint: "Vé cáp treo ~72 RMB",
            duration_hint: "3.5 tiếng",
            dishes: [
              {
                dish_name_vn: "Khoai tây bi nướng giòn rắc ớt bột",
                dish_name_zh: "炕土豆",
                google_img_keyword: "恩施张家界炕土豆",
                baidu_img_keyword: "张家界炕土豆"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "12:30 - 16:30",
            activity_title: "Thung lũng Suối Roi Vàng & Hẻm núi Thập Lý Họa Lang",
            description: "Xuống chân núi, tản bộ thong thả dọc dòng Suối Roi Vàng (金鞭溪 - Golden Whip Stream) trong vắt dưới tán rừng nguyên sinh. Ghé ngắm phong cảnh hẻm núi Thập Lý Họa Lang (十里画廊).",
            place_name: "Suối Roi Vàng (Golden Whip Stream)",
            place_zh: "金鞭溪 / 十里画廊",
            amap_query: "金鞭溪峡谷",
            transport_hint: "Đi bộ dọc đường mòn sinh thái & Tàu hỏa mini Thập Lý Họa Lang",
            duration_hint: "4 tiếng",
            tips: "Khỉ hoang dã ở Suối Roi Vàng rất dạn người, không cầm túi nilon trong suốt hoặc đồ ăn trên tay."
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 20:30",
            activity_title: "Ăn tối Đường Sư Phụ & Ngâm chân thảo dược",
            description: "Ăn tối tại Đường Sư Phụ Tương Tây Thổ Thái Quán (唐师傅湘西土菜馆): sườn lợn hầm nồi gang củi lửa, canh nấm rừng nguyên sinh và nhâm nhi trà dâu dại Trương Gia Giới (莓茶). Ngâm chân thảo dược hồi phục cơ bắp.",
            place_name: "Đường Sư Phụ Tương Tây Thổ Thái Quán",
            place_zh: "唐师傅湘西土菜馆",
            amap_query: "唐师傅湘西土菜馆",
            dishes: [
              {
                dish_name_vn: "Sườn lợn hầm nồi gang củi lửa",
                dish_name_zh: "柴火铁锅炖排骨",
                google_img_keyword: "柴火铁锅炖排骨",
                baidu_img_keyword: "铁锅炖排骨"
              },
              {
                dish_name_vn: "Canh nấm rừng nguyên sinh & Trà dâu dại",
                dish_name_zh: "野山菌汤 / 张家界莓茶",
                google_img_keyword: "张家界野山菌汤",
                baidu_img_keyword: "张家界莓茶"
              }
            ]
          }
        ]
      },
      {
        day_number: 5,
        date: "Thứ Tư, 18/11/2026",
        city: "Vũ Long (Wulong - 武隆)",
        title: "Trương Gia Giới – Vũ Long – Thiên Sinh Tam Kiều & Ấn Tượng Vũ Long",
        hotel: {
          name_vn: "Xianyu·Xu Resort Hotel (Tiên Dữ·Tự - Trung tâm du khách Tiên Nữ Sơn)",
          name_zh: "仙屿·序度假酒店（仙女山游客中心店）",
          address: "Tầng 1, Tòa 9, Số 30 đại lộ Ngân Hạnh, thị trấn Tiên Nữ Sơn, quận Vũ Long, Trùng Khánh",
          phone: "+86-23-82439777"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "07:30 - 11:30",
            activity_title: "Tàu cao tốc G2448 Trương Gia Giới Tây đi Ga Vũ Long Nam",
            description: "07:30 trả phòng, di chuyển ra ga Trương Gia Giới Tây (~35 phút). 09:01 đón tàu cao tốc G2448 đi ga Vũ Long Nam (đến nơi lúc 10:42). Bắt taxi/xe khách lên Thị trấn Tiên Nữ Sơn, nhận phòng tại Xianyu·Xu Resort Hotel. Ăn trưa tại Tiên Nữ Sơn Trấn Oản Oản Dương Nhục (仙女山镇碗碗羊肉): thịt dê hầm thố cay thơm thảo quả và tiết dê xào ớt xanh.",
            place_name: "Ga Trương Gia Giới Tây – Ga Vũ Long Nam",
            place_zh: "武隆南站 / 仙女山镇",
            amap_query: "武隆南站",
            transport_hint: "Tàu cao tốc Gaotie G2448 (09:01 – 10:42, 1h 41m); Taxi lên Tiên Nữ Sơn",
            transport_detail: {
              mode: "train",
              train_number: "G2448",
              train_departure_station_vn: "Ga Trương Gia Giới Tây",
              train_departure_station_zh: "张家界西站",
              train_arrival_station_vn: "Ga Vũ Long Nam",
              train_arrival_station_zh: "武隆南站",
              train_duration: "1h 41m",
              summary: "Tàu cao tốc G2448 (09:01 - 10:42) từ Trương Gia Giới Tây sang Vũ Long Nam",
            },
            duration_hint: "4 tiếng",
            dishes: [
              {
                dish_name_vn: "Thịt dê hầm thố cay thảo quả Vũ Long (Oản Oản Dương Nhục)",
                dish_name_zh: "仙女山镇碗碗羊肉",
                google_img_keyword: "武隆碗碗羊肉",
                baidu_img_keyword: "武隆特色碗碗羊肉"
              },
              {
                dish_name_vn: "Tiết dê xào ớt xanh",
                dish_name_zh: "碗碗羊血",
                google_img_keyword: "武隆碗碗羊血",
                baidu_img_keyword: "碗碗羊血"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 17:30",
            activity_title: "Đáy vực Thiên Sinh Tam Kiều & Dịch trạm Thiên Phúc",
            description: "Vào Trung tâm Du khách, đi xe buýt nội khu xuống đáy vực Thiên Sinh Tam Kiều (天生三桥). Đi thang máy kính tụt xuống đáy hố sụt khổng lồ Thiên Khanh. Chiêm ngưỡng 3 cây cầu vòm đá tự nhiên hùng vĩ và thăm Dịch trạm Thiên Phúc (天福官驿) cổ kính (bối cảnh phim Hoàng Kim Giáp và Transformers 4).",
            place_name: "Thiên Sinh Tam Kiều & Dịch trạm Thiên Phúc",
            place_zh: "天生三桥 / 天福官驿",
            amap_query: "天生三桥游客中心",
            transport_hint: "Xe buýt nội khu & Thang máy kính tụt xuống đáy vực",
            ticket_hint: "Vé tham quan Thiên Sinh Tam Kiều ~125 RMB (Đặt qua WeChat / Trip.com)",
            duration_hint: "4 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 21:30",
            activity_title: "Lẩu dê núi Lão Bản Nương & Show diễn Ấn Tượng Vũ Long",
            description: "Ăn tối tại Lẩu dê núi Lão Bản Nương (老板娘羊肉汤锅). 20:00 xem show diễn thực cảnh ngoài trời 'Ấn tượng Vũ Long (印象武隆)' của đạo diễn Trương Nghệ Mưu.",
            place_name: "Show diễn Ấn tượng Vũ Long",
            place_zh: "印象武隆 / 老板娘羊肉汤锅",
            amap_query: "印象武隆剧场",
            ticket_hint: "Vé xem show Ấn Tượng Vũ Long ~200 RMB (Đặt qua WeChat / Trip.com)",
            tips: "Show diễn ban đêm ngoài hẻm núi rất lạnh (dưới 8 độ C), cần áo ấm dày và khăn quàng cổ.",
            dishes: [
              {
                dish_name_vn: "Lẩu dê núi Lão Bản Nương Vũ Long",
                dish_name_zh: "老板娘羊肉汤锅",
                google_img_keyword: "武隆羊肉汤锅",
                baidu_img_keyword: "武隆老板娘羊肉汤锅"
              }
            ]
          }
        ]
      },
      {
        day_number: 6,
        date: "Thứ Năm, 19/11/2026",
        city: "Trùng Khánh (Chongqing - 重庆)",
        title: "Địa phùng Long Thủy Giáp – Tàu Cao Tốc về Trùng Khánh – Phố Bát Nhất",
        hotel: {
          name_vn: "SENSE SCENE Sanshi Senyin Hotel (Tam Thời Sâm Ấn - Giải Phóng Bối)",
          name_zh: "三时森印酒店（重庆解放碑步行街洪崖洞店）",
          address: "Tầng 12, Tòa A, Dushi Plaza, Giải Phóng Bối, quận Du Trung, Trùng Khánh",
          phone: "+86-23-68711888 / +86-17783090266"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "08:30 - 11:30",
            activity_title: "Khám phá khe nứt ngầm Địa phùng Long Thủy Giáp",
            description: "Khám phá khe nứt ngầm Địa phùng Long Thủy Giáp (龙水峡地缝), ngắm các dòng thác đổ từ vách đá dựng đứng vào lòng hẻm núi nguyên sinh. Trưa ăn nhanh bát mì thịt cừu cay (羊肉面) tại thị trấn Tiên Nữ Sơn, thu dọn hành lý ra ga Vũ Long.",
            place_name: "Địa phùng Long Thủy Giáp (Longshui Gorge)",
            place_zh: "龙水峡地缝",
            amap_query: "龙水峡地缝景区",
            transport_hint: "Xe buýt từ Trung tâm du khách Tiên Nữ Sơn",
            duration_hint: "3 tiếng",
            dishes: [
              {
                dish_name_vn: "Mì thịt cừu cay Tiên Nữ Sơn",
                dish_name_zh: "武隆羊肉面",
                google_img_keyword: "武隆羊肉面",
                baidu_img_keyword: "仙女山羊肉面"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "16:47 - 17:30",
            activity_title: "Tàu cao tốc G2436 về trung tâm Trùng Khánh",
            description: "Lên tàu cao tốc G2436 (16:47 – 17:30, chạy 43 phút) từ ga Vũ Long về trung tâm Trùng Khánh. Đi Metro về Giải Phóng Bối nhận phòng tại SENSE SCENE Hotel.",
            place_name: "Ga Trùng Khánh Bắc – Giải Phóng Bối",
            place_zh: "重庆北站",
            amap_query: "重庆北站南广场",
            transport_hint: "Tàu cao tốc G2436 (16:47 – 17:30, 43 phút); Metro về Giải Phóng Bối",
            transport_detail: {
              mode: "train",
              train_number: "G2436",
              train_departure_station_vn: "Ga Vũ Long (Wulong)",
              train_departure_station_zh: "武隆站",
              train_arrival_station_vn: "Ga Trùng Khánh Bắc (Chongqing North)",
              train_arrival_station_zh: "重庆北站",
              train_duration: "43 phút",
              summary: "Tàu cao tốc G2436 (16:47 - 17:30) từ ga Vũ Long về ga Trùng Khánh Bắc; đón Metro về Giải Phóng Bối",
            },
            duration_hint: "2 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:30 - 21:30",
            activity_title: "Dạo Đài Tưởng Niệm Giải Phóng & Food-tour Phố ẩm thực Bát Nhất",
            description: "Dạo bước quanh Đài Tưởng niệm Giải Phóng (解放碑). Khám phá thiên đường ăn vặt Phố ẩm thực Bát Nhất (八一路好吃街): miến chua cay Trùng Khánh tại Hảo Hữu Lai (好又来酸辣粉), chân gà rút xương sốt cay (降龙爪爪), não heo nướng cay (烤脑花), thạch đá băng phấn đường nâu (红糖冰粉).",
            place_name: "Phố ẩm thực Bát Nhất & Đài Giải Phóng",
            place_zh: "解放碑 / 八一路好吃街",
            amap_query: "八一路好吃街",
            transport_hint: "Đi bộ ngay dưới chân khách sạn SENSE SCENE",
            dishes: [
              {
                dish_name_vn: "Miến chua cay Trùng Khánh (Hảo Hữu Lai)",
                dish_name_zh: "好又来酸辣粉",
                google_img_keyword: "重庆好又来酸辣粉",
                baidu_img_keyword: "好又来酸辣粉",
                restaurant: {
                  name_vn: "Miến Tiêu Cay Hảo Hữu Lai (Phố Bát Nhất)",
                  name_zh: "好又来酸辣粉 (八一路店)",
                  address_hint: "Số 28 phố ẩm thực Bát Nhất, Giải Phóng Bối, quận Du Trung",
                  amap_query: "好又来酸辣粉 八一路",
                  price_range: "~15 - 25 ¥/bát",
                  rating: "4.8★ (Huyền thoại ăn vặt Trùng Khánh)",
                  recommended_dish: "Miến chua cay tương đậu thịt bằm & Bánh nếp giòn",
                  note: "Quán xếp hàng đông nhưng phục vụ siêu nhanh, sợi miến dẻo dai chua cay bùng nổ."
                }
              },
              {
                dish_name_vn: "Chân gà rút xương sốt cay (Giáng Long Trảo Trảo)",
                dish_name_zh: "降龙爪爪",
                google_img_keyword: "重庆降龙爪爪",
                baidu_img_keyword: "降龙爪爪 八一路"
              },
              {
                dish_name_vn: "Não heo nướng cay Trùng Khánh",
                dish_name_zh: "烤脑花",
                google_img_keyword: "重庆烤脑花",
                baidu_img_keyword: "八一路烤脑花"
              },
              {
                dish_name_vn: "Thạch đá băng phấn đường nâu",
                dish_name_zh: "红糖冰粉",
                google_img_keyword: "重庆红糖冰粉",
                baidu_img_keyword: "红糖冰粉 特色"
              }
            ]
          }
        ]
      },
      {
        day_number: 7,
        date: "Thứ Sáu, 20/11/2026",
        city: "Trùng Khánh (Chongqing - 重庆)",
        title: "Đô Thị 3D – Lý Tử Bá – Cáp Treo Dương Tử – Quán Âm Kiều – Hồng Nhai Động",
        hotel: {
          name_vn: "SENSE SCENE Sanshi Senyin Hotel (Tam Thời Sâm Ấn - Giải Phóng Bối)",
          name_zh: "三时森印酒店（重庆解放碑步行街洪崖洞店）",
          address: "Tầng 12, Tòa A, Dushi Plaza, Giải Phóng Bối, quận Du Trung, Trùng Khánh",
          phone: "+86-23-68711888"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "08:30 - 12:00",
            activity_title: "Phố cổ Từ Khí Khẩu & Mua quẩy vặn thừng mè Trần Ma Hoa",
            description: "Đi Metro Line 1 tham quan Phố cổ Từ Khí Khẩu (磁器口古镇), mua quẩy vặn thừng mè giòn rụm Trần Ma Hoa (陈麻花). Ăn trưa tại Mậu Trang Cổ Trấn Đệ Nhất Gia Mao Huyết Vượng (茂庄古镇第一家毛血旺): thưởng thức nồi canh cay thập cẩm Mao Huyết Vượng và cá nấu ớt cay nước đỏ (水煮鱼).",
            place_name: "Phố cổ Từ Khí Khẩu (Ciqikou)",
            place_zh: "磁器口古镇 / 陈麻花",
            amap_query: "磁器口古镇",
            transport_hint: "Metro Line 1 ga Ciqikou (磁器口站)",
            transport_detail: {
              mode: "metro",
              metro_line: "Line 1 (Tuyến số 1)",
              departure_station_vn: "Ga Tiểu Thập Tự (Xiaoshizi)",
              departure_station_zh: "小什字站",
              arrival_station_vn: "Ga Từ Khí Khẩu (Ciqikou)",
              arrival_station_zh: "磁器口站",
              station_count: "14 ga (~28 phút)",
              summary: "Đón Metro Line 1 từ ga Tiểu Thập Tự đến ga Ciqikou",
            },
            duration_hint: "3.5 tiếng",
            dishes: [
              {
                dish_name_vn: "Mao Huyết Vượng (Mậu Trang Cổ Trấn Đệ Nhất Gia)",
                dish_name_zh: "茂庄古镇第一家毛血旺",
                google_img_keyword: "重庆毛血旺",
                baidu_img_keyword: "磁器口毛血旺",
                restaurant: {
                  name_vn: "Mậu Trang Cổ Trấn Đệ Nhất Gia Mao Huyết Vượng",
                  name_zh: "茂庄古镇第一家毛血旺 (总店)",
                  address_hint: "Số 74 đường Chính Phố Cổ Từ Khí Khẩu, quận Sa Bình Bá",
                  amap_query: "茂庄古镇第一家毛血旺 磁器口",
                  price_range: "~45 - 75 ¥/người",
                  rating: "4.8★ (Đặc sản Từ Khí Khẩu)",
                  recommended_dish: "Nồi canh cay thập cẩm Mao Huyết Vượng (lòng bò, tiết vịt, giăm bông) & Cá nấu ớt cay nước đỏ (水煮鱼)",
                  note: "Món ăn cay tê đỏ rực chuẩn vị Trùng Khánh cổ điển, cực kỳ tốn cơm trắng."
                }
              },
              {
                dish_name_vn: "Cá nấu ớt cay nước đỏ (Thủy Chử Ngư) & Quẩy Trần Ma Hoa",
                dish_name_zh: "水煮鱼 / 陈麻花",
                google_img_keyword: "重庆水煮鱼 陈麻花",
                baidu_img_keyword: "磁器口陈麻花"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 19:30",
            activity_title: "Ga tàu xuyên chung cư Lý Tử Bá – Cáp treo Dương Tử – Phố đi bộ Quán Âm Kiều (观音桥)",
            description: "Đi Metro Line 2 ngắm tàu xuyên chung cư tại ga Lý Tử Bá (李子坝). Trải nghiệm Cáp treo vượt sông Dương Tử (长江索道) ngắm cảnh quan thành phố thẳng đứng. Ghé Phố đi bộ Quán Âm Kiều (观音桥步行街) check-in màn hình LED 3D ngoài trời khổng lồ và khám phá thiên đường ẩm thực ngầm sầm uất (观音桥好吃街).",
            place_name: "Ga Lý Tử Bá, Cáp treo Dương Tử & Phố đi bộ Quán Âm Kiều",
            place_zh: "李子坝单轨站 / 长江索道 / 观音桥步行街",
            amap_query: "观音桥步行街",
            transport_hint: "Metro Line 2 ga Liziba (李子坝站), Cáp treo sông Dương Tử & Metro Line 3 ga Guanyinqiao (观音桥站)",
            transport_detail: {
              mode: "metro",
              metro_line: "Line 2 & Line 3",
              departure_station_vn: "Ga Lý Tử Bá (Liziba)",
              departure_station_zh: "李子坝站",
              arrival_station_vn: "Ga Quán Âm Kiều (Guanyinqiao)",
              arrival_station_zh: "观音桥站",
              station_count: "4 ga (~10 phút)",
              summary: "Đi Metro Line 2 ngắm tàu xuyên chung cư Lý Tử Bá, đi Cáp treo Dương Tử rồi đón Metro Line 3 sang ga Quán Âm Kiều (观音桥站)",
            },
            ticket_hint: "Vé cáp treo sông Dương Tử ~20 RMB một chiều; Phố đi bộ Quán Âm Kiều & màn hình 3D miễn phí",
            duration_hint: "6 tiếng",
            dishes: [
              {
                dish_name_vn: "Bánh bao chiên súp giòn & Ăn vặt Phố ngầm Quán Âm Kiều",
                dish_name_zh: "观音桥好吃街 生煎包 / 手撕烤兔",
                google_img_keyword: "重庆 观音桥好吃街",
                baidu_img_keyword: "观音桥好吃街"
              }
            ]
          },
          {
            time_slot: "Tối",
            time_range: "19:30 - 22:00",
            activity_title: "Hồng Nhai Động lên đèn & Đại tiệc Lẩu cay Trùng Khánh",
            description: "Chiêm ngưỡng quần thể nhà sàn 11 tầng rực rỡ tại Hồng Nhai Động (洪崖洞) (bối cảnh tựa phim Spirited Away). Đại tiệc lẩu cay tại Lẩu Bội Tỷ (佩姐老火锅) hoặc Lẩu Chu Sư Huynh (周师兄重庆火锅): dạ sách bò tươi nhúng 9 giây (鲜毛肚), ruột vịt giòn (鲜鸭肠), thịt bò tẩm ớt bột (麻辣牛肉), bánh nếp đường nâu chiên giòn (红糖糍粑).",
            place_name: "Hồng Nhai Động (Hongyadong)",
            place_zh: "洪崖洞民俗风貌区",
            amap_query: "洪崖洞民俗风貌区",
            transport_hint: "Đi bộ 10 phút từ Giải Phóng Bối",
            tips: "Không nên chen chúc bên trong nhà hàng; góc ngắm Hồng Nhai Động đẹp nhất là từ giữa cầu Thiên Môn hoặc bờ đối diện.",
            dishes: [
              {
                dish_name_vn: "Lẩu cay mỡ bò Trùng Khánh (Lẩu Bội Tỷ / Chu Sư Huynh)",
                dish_name_zh: "佩姐老火锅 / 周师兄重庆火锅",
                google_img_keyword: "重庆老火锅 九宫格",
                baidu_img_keyword: "重庆佩姐老火锅",
                restaurant: {
                  name_vn: "Lẩu Bội Tỷ / Lẩu Chu Sư Huynh (Giải Phóng Bối / Hồng Nhai Động)",
                  name_zh: "佩姐老火锅 / 周师兄重庆老火锅",
                  address_hint: "Cạnh phố đi bộ Giải Phóng Bối & Hồng Nhai Động, quận Du Trung",
                  amap_query: "佩姐老火锅 解放碑",
                  price_range: "~85 - 120 ¥/người",
                  rating: "4.9★ (Di sản phi vật thể ẩm thực)",
                  recommended_dish: "Dạ sách bò tươi nhúng 9 giây (鲜毛肚), Ruột vịt giòn (鲜鸭肠), Thịt bò tẩm ớt bột (麻辣牛肉), Bánh nếp đường nâu (红糖糍粑)",
                  note: "Nước dùng mỡ bò nguyên chất nấu thảo dược, phục vụ trà hoa cúc giải cay mát gan."
                }
              },
              {
                dish_name_vn: "Lẩu Hang Động Trùng Khánh (Động Cực Lẩu - Động Đình Hỏa Oa)",
                dish_name_zh: "重庆洞穴火锅 (洞亭火锅 / 防空洞老火锅)",
                google_img_keyword: "重庆防空洞火锅 洞亭火锅",
                baidu_img_keyword: "重庆洞穴火锅 洞亭火锅",
                restaurant: {
                  name_vn: "Lẩu Hang Động Động Đình (Hầm Phòng Không Lưỡng Lộ Khẩu)",
                  name_zh: "洞亭火锅 (防空洞店)",
                  address_hint: "Số 149 đường Trung Sơn Tam Lộ, Lưỡng Lộ Khẩu, quận Du Trung",
                  amap_query: "洞亭火锅 防空洞",
                  price_range: "~75 - 105 ¥/người",
                  rating: "4.8★ (Đệ nhất Lẩu Hang Động Trùng Khánh)",
                  recommended_dish: "Nồi lẩu 9 ô cay tê trong hang đá sa thạch, lòng bò tươi giòn, ruột vịt",
                  note: "Nằm trọn trong hầm trú ẩn phòng không thời Thế chiến khoét sâu vào vách núi đá."
                }
              }
            ]
          }
        ]
      },
      {
        day_number: 8,
        date: "Thứ Bảy, 21/11/2026",
        city: "Trùng Khánh (Chongqing - 重庆)",
        title: "Bảo Tàng Tam Hiệp – Hội Quán Hồ Quảng – Hoàng Cát Cổ Đạo & Lão Quân Động – Bạch Tượng Cư – Triều Thiên Môn",
        hotel: {
          name_vn: "SENSE SCENE Sanshi Senyin Hotel (Tam Thời Sâm Ấn - Giải Phóng Bối)",
          name_zh: "三时森印酒店（重庆解放碑步行街洪崖洞店）",
          address: "Tầng 12, Tòa A, Dushi Plaza, Giải Phóng Bối, quận Du Trung, Trùng Khánh",
          phone: "+86-23-68711888"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "09:00 - 12:00",
            activity_title: "Bảo tàng Tam Hiệp & Đại Lễ Đường Nhân Dân",
            description: "Tham quan Bảo tàng Tam Hiệp (Three Gorges Museum) tìm hiểu lịch sử đập thủy điện và văn hóa Ba Thục, ngắm kiến trúc mái vòm Đại lễ đường Nhân dân Trùng Khánh đối diện. Ăn trưa tại Bàn Muội Diện Trang (胖妹面庄 - Michelin Bib Gourmand): mì Tiểu Diện Trùng Khánh tê cay hoa tiêu và mì bò kho gân mềm đậm đà.",
            place_name: "Bảo tàng Tam Hiệp",
            place_zh: "重庆中国三峡博物馆",
            amap_query: "重庆中国三峡博物馆",
            transport_hint: "Metro Line 2 ga Zengjiayan (曾家岩站)",
            transport_detail: {
              mode: "metro",
              metro_line: "Line 2 (Tuyến số 2)",
              departure_station_vn: "Ga Lâm Giang Môn (Linjiangmen)",
              departure_station_zh: "临江门站",
              arrival_station_vn: "Ga Tăng Gia Nham (Zengjiayan)",
              arrival_station_zh: "曾家岩站",
              station_count: "4 ga (~9 phút)",
              summary: "Đón Metro Line 2 từ ga Lâm Giang Môn đến ga Tăng Gia Nham (Cổng A có đường hầm thẳng sang Bảo tàng Tam Hiệp)",
            },
            duration_hint: "3 tiếng",
            dishes: [
              {
                dish_name_vn: "Mì Tiểu Diện Trùng Khánh & Mì Bò Kho Gân (Bàn Muội Diện Trang)",
                dish_name_zh: "胖妹面庄 重庆小面 / 牛肉面",
                google_img_keyword: "重庆小面 胖妹面庄",
                baidu_img_keyword: "胖妹面庄 重庆小面",
                restaurant: {
                  name_vn: "Bàn Muội Diện Trang (Michelin Bib Gourmand)",
                  name_zh: "胖妹面庄 (两路口总店)",
                  address_hint: "Số 139 đường Trung Sơn Tam Lộ, Lưỡng Lộ Khẩu, quận Du Trung",
                  amap_query: "胖妹面庄 两路口",
                  price_range: "~18 - 30 ¥/bát",
                  rating: "4.8★ (Michelin Guide gợi ý)",
                  recommended_dish: "Mì Tiểu Diện tê cay hoa tiêu (重庆小面) & Mì bò kho gân mềm đậm đà (牛肉面)",
                  note: "Quán mì nổi tiếng hàng chục năm, sợi mì ngập trong dầu ớt thơm cay đậm đà."
                }
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 17:30",
            activity_title: "Hội Quán Hồ Quảng – Đường cổ Hoàng Cát & Đạo quán Lão Quân Động – Bạch Tượng Cư & Triều Thiên Môn",
            description: "Khám phá Hội quán Hồ Quảng (Huguang Guild Hall - 重庆湖广会馆) với tường vàng cổ kính ven sông. Sang bờ Nam tản bộ trên Đường cổ Hoàng Cát (黄葛古道), ngắm thạch khắc tượng Phật cổ Cổ Phật Nham (古佛岩), và lên viếng Đạo quán Lão Quân Động (老君洞道观) ngắm hoàng hôn cùng toàn cảnh bán đảo Du Trung 3D tuyệt đẹp từ trên cao. Sau đó qua ngõ dốc chung cư 24 tầng không thang máy Bạch Tượng Cư (白象居) và Quảng trường Triều Thiên Môn (朝天门).",
            place_name: "Hội Quán Hồ Quảng, Lão Quân Động, Bạch Tượng Cư & Triều Thiên Môn",
            place_zh: "重庆湖广会馆 / 黄葛古道 / 老君洞道观 / 白象居 / 朝天门",
            amap_query: "重庆湖广会馆",
            transport_hint: "Metro Line 1 ga Xiaoshizi (小什字站) / Chaotianmen (朝天门站) & Metro Line 6 / Taxi sang Thượng Tân Nhai",
            transport_detail: {
              mode: "metro",
              metro_line: "Line 1 & Line 6",
              departure_station_vn: "Ga Tiểu Thập Tự (Xiaoshizi)",
              departure_station_zh: "小什字站",
              arrival_station_vn: "Ga Triều Thiên Môn (Chaotianmen)",
              arrival_station_zh: "朝天门站",
              station_count: "1 ga (~3 phút)",
              summary: "Từ ga Xiaoshizi tản bộ thăm Hội Quán Hồ Quảng, qua bờ Nam lên Hoàng Cát Cổ Đạo & Lão Quân Động, rồi về Bạch Tượng Cư và Quảng trường Triều Thiên Môn",
            },
            ticket_hint: "Vé Hội quán Hồ Quảng ~25 RMB; Đạo quán Lão Quân Động, Hoàng Cát Cổ Đạo & Bạch Tượng Cư miễn phí",
            duration_hint: "4 tiếng",
            tips: "Đạo quán Lão Quân Động trên đỉnh núi Nam Sơn là tọa độ ngắm toàn cảnh bán đảo Du Trung và ngã ba sông lúc hoàng hôn đẹp bậc nhất Trùng Khánh."
          },
          {
            time_slot: "Tối",
            time_range: "18:30 - 21:30",
            activity_title: "Ăn tối Dân Gian Lương Thương & Du thuyền đêm ngắm Cyberpunk",
            description: "Ăn tối tại Dân Gian Lương Thương Trùng Khánh Thái (民间粮仓·重庆菜): gà cay Trùng Khánh ngập trong ớt khô và tiêu (辣子鸡), sườn nướng mác mật. Sau đó đi du thuyền đêm sông Dương Tử ngắm đường chân trời cyberpunk rực rỡ.",
            place_name: "Dân Gian Lương Thương & Du thuyền Triều Thiên Môn",
            place_zh: "民间粮仓·重庆菜 / 朝天门两江游船",
            amap_query: "朝天门码头",
            ticket_hint: "Vé du thuyền đêm Lưỡng Giang ~150 RMB",
            dishes: [
              {
                dish_name_vn: "Gà cay Trùng Khánh (Là Tử Kê) & Sườn nướng mác mật",
                dish_name_zh: "民间粮仓 重庆辣子鸡",
                google_img_keyword: "重庆辣子鸡",
                baidu_img_keyword: "民间粮仓 重庆辣子鸡",
                restaurant: {
                  name_vn: "Dân Gian Lương Thương Trùng Khánh Thái (Giải Phóng Bối)",
                  name_zh: "民间粮仓·重庆菜 (解放碑店)",
                  address_hint: "Khu phố Giải Phóng Bối, quận Du Trung, Trùng Khánh",
                  amap_query: "民间粮仓 解放碑",
                  price_range: "~60 - 90 ¥/người",
                  rating: "4.8★ (Ẩm thực Giang Hồ Trùng Khánh)",
                  recommended_dish: "Gà cay Trùng Khánh ngập ớt khô hoa tiêu (辣子鸡) & Sườn nướng mác mật",
                  note: "Không gian kho lương thực dân gian mộc mạc, gà chiên giòn rụm thơm nồng hoa tiêu."
                }
              }
            ]
          }
        ]
      },
      {
        day_number: 9,
        date: "Chủ Nhật, 22/11/2026",
        city: "Trùng Khánh – Quận Bắc Bội (Beibei - 北碚)",
        title: "Núi Kim Vân & Cổ Trấn Kim Cương Bi (Quận Bắc Bội) – Lẩu Xiên Que Giải Phóng Bối",
        hotel: {
          name_vn: "SENSE SCENE Sanshi Senyin Hotel (Tam Thời Sâm Ấn - Giải Phóng Bối)",
          name_zh: "三时森印酒店（重庆解放碑步行街洪崖洞店）",
          address: "Tầng 12, Tòa A, Dushi Plaza, Giải Phóng Bối, quận Du Trung, Trùng Khánh",
          phone: "+86-23-68711888"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "08:30 - 12:00",
            activity_title: "Metro Line 6 đi Quận Bắc Bội – Cáp treo Núi Kim Vân (缙云山) & Chùa Kim Vân Tự",
            description: "Từ trạm Xiaoshizi (cạnh khách sạn SENSE SCENE Giải Phóng Bối), đi thẳng Metro Line 6 đến ga Bắc Bội (Beibei - 北碚站, khoảng 55 phút). Bắt taxi khoảng 10 phút đến Núi Kim Vân (缙云山). Đi cáp treo xuyên qua rừng trúc nguyên sinh bạt ngàn lên đỉnh ngắm toàn cảnh sông Gia Lăng uốn lượn qua hẻm núi Ôn Đường Hiệp mờ sương và viếng Chùa Kim Vân Tự cổ kính. Ăn trưa tại các nhà hàng ven suối: đậu phụ suối nóng Bắc Bội, cá sông Gia Lăng hấp và măng trúc rừng xào thịt hun khói.",
            place_name: "Núi Kim Vân (Mount Jinyun - Quận Bắc Bội)",
            place_zh: "缙云山国家级自然保护区 / 缙云山索道",
            amap_query: "重庆缙云山景区",
            transport_hint: "Đi thẳng Metro Line 6 từ ga Xiaoshizi đến ga Beibei (北碚站, ~55 phút), bắt taxi 10 phút vào Núi Kim Vân",
            transport_detail: {
              mode: "metro",
              metro_line: "Line 6 (Tuyến số 6)",
              departure_station_vn: "Ga Tiểu Thập Tự (Xiaoshizi)",
              departure_station_zh: "小什字站",
              arrival_station_vn: "Ga Bắc Bội (Beibei)",
              arrival_station_zh: "北碚站",
              station_count: "Tuyến thẳng Line 6 (~55 phút)",
              summary: "Đi thẳng Metro Line 6 từ ga Xiaoshizi đến ga Beibei (北碚站, ~55 phút), sau đó bắt taxi 10 phút lên trạm cáp treo Núi Kim Vân",
            },
            duration_hint: "3.5 tiếng",
            tips: "Cáp treo xuyên qua biển trúc nguyên sinh xanh mướt, trên đỉnh nhìn xuống khúc uốn sông Gia Lăng qua hẻm núi Ôn Đường Hiệp tuyệt đẹp.",
            dishes: [
              {
                dish_name_vn: "Đậu phụ suối nóng Bắc Bội & Cá sông Gia Lăng hấp",
                dish_name_zh: "北碚豆花 / 嘉陵江清蒸鱼",
                google_img_keyword: "重庆北碚豆花 嘉陵江鱼",
                baidu_img_keyword: "北碚豆花 嘉陵江清蒸鱼"
              },
              {
                dish_name_vn: "Măng trúc rừng xào thịt hun khói",
                dish_name_zh: "竹笋炒腊肉",
                google_img_keyword: "缙云山竹笋炒腊肉",
                baidu_img_keyword: "竹笋炒腊肉"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 17:30",
            activity_title: "Tản bộ Cổ trấn Kim Cương Bi (金刚碑古镇) & Thưởng trà nắp ấm ven sông Gia Lăng",
            description: "Xuống chân núi, di chuyển sang Cổ trấn Kim Cương Bi (金刚碑古镇) — ngôi làng cổ hơn 300 năm tuổi nằm ẩn mình trong khe núi rợp bóng cây đa cổ thụ sát bờ sông Gia Lăng. Tản bộ trên những con dốc lát đá rêu phong dọc dòng suối chảy róc rách, chọn một trà quán sân vườn gỗ ven suối hoặc ven sông Gia Lăng để ngồi ghế mây thưởng thức trà hoa nhài nắp đậy (盖碗茉莉花茶) trong không gian yên bình.",
            place_name: "Cổ trấn Kim Cương Bi (Jingangbei Ancient Town)",
            place_zh: "北碚金刚碑古镇",
            amap_query: "北碚金刚碑历史文化街区",
            transport_hint: "Taxi 10 phút từ chân núi Kim Vân sang Cổ trấn Kim Cương Bi",
            duration_hint: "4 tiếng",
            ticket_hint: "Vào cửa tự do, miễn phí vé tham quan",
            tips: "Đường đá trong Kim Cương Bi men theo suối và bóng cây đa cổ thụ hơi ẩm, nên mang giày đế bám tốt.",
            dishes: [
              {
                dish_name_vn: "Trà hoa nhài nắp đậy cái oản ven suối Kim Cương Bi",
                dish_name_zh: "盖碗茉莉花茶",
                google_img_keyword: "金刚碑古镇 盖碗茶",
                baidu_img_keyword: "北碚金刚碑古镇 茶馆"
              }
            ]
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 21:00",
            activity_title: "Metro Line 6 về Giải Phóng Bối – Lẩu xiên que Lý Xuyến Xuyến / Cương Quản Xưởng",
            description: "Đi Metro Line 6 về lại trung tâm Giải Phóng Bối. Thưởng thức bữa tối lẩu xiên que (串串香 - Chuan Chuan Xiang) tại Lý Xuyến Xuyến (李串串) hoặc Cương Quản Xưởng Tiểu Quận Can (钢管厂五区小郡肝串串香). Quay về khách sạn SENSE SCENE thu dọn hành lý, chuẩn bị cho chuyến tàu sang Thành Đô vào sáng hôm sau (23/11).",
            place_name: "Lẩu xiên que Giải Phóng Bối (Lý Xuyến Xuyến / Cương Quản Xưởng)",
            place_zh: "李串串老店 / 钢管厂五区小郡肝串串香",
            amap_query: "钢管厂五区小郡肝串串香",
            transport_hint: "Đón Metro Line 6 từ ga Beibei (北碚站) về thẳng ga Xiaoshizi (小什字站)",
            transport_detail: {
              mode: "metro",
              metro_line: "Line 6 (Tuyến số 6)",
              departure_station_vn: "Ga Bắc Bội (Beibei)",
              departure_station_zh: "北碚站",
              arrival_station_vn: "Ga Tiểu Thập Tự (Xiaoshizi)",
              arrival_station_zh: "小什字站",
              station_count: "Tuyến thẳng Line 6 (~55 phút)",
              summary: "Đón Metro Line 6 từ ga Bắc Bội (北碚站) chạy thẳng về ga Tiểu Thập Tự (小什字站) cạnh khách sạn SENSE SCENE",
            },
            duration_hint: "3 tiếng",
            dishes: [
              {
                dish_name_vn: "Lẩu xiên que Trùng Khánh (Lý Xuyến Xuyến / Cương Quản Xưởng Tiểu Quận Can)",
                dish_name_zh: "李串串 / 钢管厂五区小郡肝串串香",
                google_img_keyword: "重庆串串香 小郡肝",
                baidu_img_keyword: "重庆李串串 钢管厂五区小郡肝串串香",
                restaurant: {
                  name_vn: "Lý Xuyến Xuyến / Cương Quản Xưởng Tiểu Quận Can (Giải Phóng Bối)",
                  name_zh: "李串串 / 钢管厂五区小郡肝串串香",
                  address_hint: "Khu vực Giải Phóng Bối, quận Du Trung, Trùng Khánh",
                  amap_query: "李串串 解放碑",
                  price_range: "~60 - 85 ¥/người",
                  rating: "4.8★ (Huyền thoại lẩu xiên que Trùng Khánh)",
                  recommended_dish: "Bò cuộn rau mùi, mề gà giòn Tiểu Quận Can, lòng bò xiên que nhúng nồi dầu ớt sôi sục",
                  note: "Chấm cùng chén dầu mè tỏi băm thơm phức để giảm độ cay nóng."
                }
              }
            ]
          }
        ]
      },
      {
        day_number: 10,
        date: "Thứ Hai, 23/11/2026",
        city: "Thành Đô (Chengdu - 成都)",
        title: "Trùng Khánh – Thành Đô – Tu Viện Văn Thù – Phố Xuân Hy & Taikoo Li",
        hotel: {
          name_vn: "Mercure Chengdu Chunxi Road Tianfu Square",
          name_zh: "成都春熙路天府广场美居酒店",
          address: "Tầng 6-14, Số 61 đường Nhân Dân Đông, quận Cẩm Giang, Thành Đô",
          phone: "+86-28-86613888-0 / +86-19308069057"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "08:00 - 11:30",
            activity_title: "Tàu cao tốc G8608 Trùng Khánh sang Thành Đô Đông",
            description: "Trả phòng khách sạn, ra ga đón tàu cao tốc G8608 (09:13 – 10:17, 1h 04m) sang ga Thành Đô Đông. Đi Metro Line 2 về nhận phòng tại Mercure Chengdu Chunxi Road Tianfu Square. Ăn trưa mì truyền thống tại Động Tử Khẩu Trương Lão Nhị (洞子口张老二) đối diện Văn Thù Viện: mì sợi ngọt Điềm Thủy Diện và thạch đậu xanh tương cay Lương Phấn.",
            place_name: "Ga Thành Đô Đông – Quảng trường Thiên Phủ",
            place_zh: "成都东站",
            amap_query: "成都春熙路美居酒店",
            transport_hint: "Tàu cao tốc G8608 (09:13 – 10:17, 1h 04m); Metro Line 2 về Tianfu Square",
            transport_detail: {
              mode: "train",
              train_number: "G8608",
              train_departure_station_vn: "Ga Trùng Khánh Bắc (Chongqing North)",
              train_departure_station_zh: "重庆北站",
              train_arrival_station_vn: "Ga Thành Đô Đông (Chengdu East)",
              train_arrival_station_zh: "成都东站",
              train_duration: "1h 04m",
              summary: "Tàu cao tốc G8608 (09:13 - 10:17) từ ga Trùng Khánh Bắc sang ga Thành Đô Đông; chuyển sang Metro Line 2 (ga Thành Đô Đông Khách Trạm / 成都东客站) đi thẳng 7 ga về ga Quảng trường Thiên Phủ",
            },
            duration_hint: "3.5 tiếng",
            dishes: [
              {
                dish_name_vn: "Mì sợi ngọt Điềm Thủy Diện & Lương Phấn (Động Tử Khẩu Trương Lão Nhị)",
                dish_name_zh: "洞子口张老二 甜水面 / 黄凉粉",
                google_img_keyword: "成都甜水面 黄凉粉",
                baidu_img_keyword: "洞子口张老二甜水面"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "14:00 - 17:30",
            activity_title: "Tu viện Văn Thù & Thưởng trà vườn thiền",
            description: "Dạo Quảng trường Thiên Phủ. Viếng thăm Tu viện Văn Thù (文殊院) thanh tịnh, thưởng trà xanh trong vườn thiền.",
            place_name: "Tu viện Văn Thù (Wenshu Monastery)",
            place_zh: "成都文殊院",
            amap_query: "文殊院",
            transport_hint: "Metro Line 1 ga Wenshu Monastery (文殊院站)",
            transport_detail: {
              mode: "metro",
              metro_line: "Line 1 (Tuyến số 1)",
              departure_station_vn: "Ga Quảng trường Thiên Phủ (Tianfu Square)",
              departure_station_zh: "天府广场站",
              arrival_station_vn: "Ga Tu viện Văn Thù (Wenshu Monastery)",
              arrival_station_zh: "文殊院站",
              station_count: "2 ga (~6 phút)",
              summary: "Đón Metro Line 1 (hướng Weijianian / 韦家碾) từ ga Quảng trường Thiên Phủ ra ga Văn Thù Viện (Cổng K đi bộ 5 phút)",
            },
            ticket_hint: "Miễn phí vé vào cửa Tu viện Văn Thù (Quét mã WeChat tại cổng)",
            duration_hint: "3.5 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 21:30",
            activity_title: "Check-in Gấu Trúc IFS, Phố Xuân Hy, Taikoo Li & Ăn tối Mã Vượng Tử",
            description: "Dạo phố đi bộ Xuân Hy (Chunxi Road). Check-in tượng Gấu Trúc trèo tường IFS và khám phá tổ hợp mở Thái Cổ Lý (Taikoo Li). Ăn tối tại Mã Vượng Tử (马旺子·川小馆 - Michelin từ 1923): vịt quay da giòn Tứ Xuyên, tiết om cay đặc sản (马旺子毛血旺), bánh kẹp tôm chiên giòn.",
            place_name: "Gấu trúc trèo tường IFS, Phố Xuân Hy & Taikoo Li",
            place_zh: "春熙路 / 成都IFS / 太古里",
            amap_query: "成都IFS国际金融中心",
            transport_hint: "Metro Line 2 ga Chunxi Road (春熙路站)",
            transport_detail: {
              mode: "metro",
              metro_line: "Line 2 (Tuyến số 2)",
              departure_station_vn: "Ga Quảng trường Thiên Phủ (Tianfu Square)",
              departure_station_zh: "天府广场站",
              arrival_station_vn: "Ga Phố Xuân Hy (Chunxi Road)",
              arrival_station_zh: "春熙路站",
              station_count: "1 ga (~2 phút)",
              summary: "Đón Metro Line 2 từ ga Quảng trường Thiên Phủ đến ga Phố Xuân Hy (lối ra D đến thẳng IFS)",
            },
            dishes: [
              {
                dish_name_vn: "Vịt quay da giòn, Tiết om cay & Bánh kẹp tôm (Mã Vượng Tử Michelin)",
                dish_name_zh: "马旺子·川小馆 (马旺子毛血旺)",
                google_img_keyword: "成都马旺子",
                baidu_img_keyword: "成都马旺子川小馆"
              }
            ]
          }
        ]
      },
      {
        day_number: 11,
        date: "Thứ Ba, 24/11/2026",
        city: "Thành Đô (Chengdu - 成都)",
        title: "Cơ Sở Gấu Trúc Thành Đô – Bảo Tàng Thành Đô – Xuyên Kịch Biến Mặt",
        hotel: {
          name_vn: "Mercure Chengdu Chunxi Road Tianfu Square",
          name_zh: "成都春熙路天府广场美居酒店",
          address: "Tầng 6-14, Số 61 đường Nhân Dân Đông, quận Cẩm Giang, Thành Đô",
          phone: "+86-28-86613888-0"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "07:30 - 12:00",
            activity_title: "Thăm Cơ sở Nghiên cứu Gấu Trúc Khổng Lồ Thành Đô (Panda Base)",
            description: "Đến sớm tại Cơ sở Nghiên cứu Gấu Trúc Khổng Lồ Thành Đô (Panda Base) ngắm các bạn gấu trúc ăn tre và vận động buổi sáng. Ăn trưa tại Đào Đức Sa Nồi (陶德砂锅): bò sốt tiêu đen nấu thố đất xèo xèo (砂锅焗牛肉), cháo sườn non hòe hoa, móng giò kho rục thảo mộc mềm tan.",
            place_name: "Cơ sở Gấu Trúc Khổng Lồ Thành Đô (Panda Base)",
            place_zh: "成都大熊猫繁育研究基地",
            amap_query: "成都大熊猫繁育研究基地南门",
            transport_hint: "Metro Line 3 ga Panda Avenue (熊猫大道站) đổi xe buýt trung chuyển",
            transport_detail: {
              mode: "metro",
              metro_line: "Line 3 (Tuyến số 3)",
              departure_station_vn: "Ga Phố Xuân Hy (Chunxi Road)",
              departure_station_zh: "春熙路站",
              arrival_station_vn: "Ga Đại lộ Gấu Trúc (Panda Avenue)",
              arrival_station_zh: "熊猫大道站",
              station_count: "8 ga (~18 phút)",
              summary: "Đón Metro Line 3 từ ga Phố Xuân Hy đến ga Đại lộ Gấu Trúc (Cổng A đón xe buýt trung chuyển thẳng đến Cổng Nam Cơ sở Gấu Trúc)",
            },
            ticket_hint: "Vé tham quan ca sáng ~55 RMB (đặt trước 7-10 ngày qua WeChat)",
            duration_hint: "4.5 tiếng",
            tips: "Có mặt trước 08:00 sáng; sau 10:30 gấu trúc ăn no sẽ ngủ trong bụi rậm.",
            dishes: [
              {
                dish_name_vn: "Bò sốt tiêu đen thố đất, Cháo sườn hòe hoa & Móng giò kho (Đào Đức Sa Nồi)",
                dish_name_zh: "陶德砂锅 砂锅焗牛肉",
                google_img_keyword: "陶德砂锅",
                baidu_img_keyword: "成都陶德砂锅"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 17:00",
            activity_title: "Tham quan Bảo tàng Thành Đô tại Quảng trường Thiên Phủ",
            description: "Về trung tâm, tham quan Bảo tàng Thành Đô ngay tại Quảng trường Thiên Phủ, ngắm cổ vật Ba Thục và hiện vật múa rối bóng da.",
            place_name: "Bảo tàng Thành Đô",
            place_zh: "成都博物馆",
            amap_query: "成都博物馆",
            transport_hint: "Metro Line 1/2 ga Tianfu Square (天府广场站)",
            transport_detail: {
              mode: "metro",
              metro_line: "Line 2 (Tuyến số 2)",
              departure_station_vn: "Ga Phố Xuân Hy (Chunxi Road)",
              departure_station_zh: "春熙路站",
              arrival_station_vn: "Ga Quảng trường Thiên Phủ (Tianfu Square)",
              arrival_station_zh: "天府广场站",
              station_count: "1 ga (~3 phút)",
              summary: "Đón Metro Line 2 từ ga Xuân Hy về lại ga Quảng trường Thiên Phủ (Lối ra Tây đối diện Bảo tàng Thành Đô)",
            },
            duration_hint: "3.5 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "17:30 - 21:30",
            activity_title: "Trần Ma Bà Đậu Hũ (1862) & Show Xuyên Kịch Biến Mặt",
            description: "Ăn tối tại Trần Ma Bà Đậu Hũ (陈麻婆豆腐 - từ năm 1862): Đậu phụ Ma Bà chuẩn 8 vị (麻婆豆腐), Gà xào đậu phộng Cung Bảo (宫保鸡丁), thịt ba chỉ luộc cuộn dưa chuột sốt tỏi Lý Trang (李庄白肉). 19:30 xem show diễn Xuyên Kịch (Sichuan Opera) với màn Biến Mặt (Bian Lian) và phun lửa.",
            place_name: "Trần Ma Bà Đậu Hũ & Nhà hát Xuyên Kịch",
            place_zh: "陈麻婆豆腐 / 蜀风雅韵剧院",
            amap_query: "陈麻婆豆腐旗舰店",
            ticket_hint: "Vé show Xuyên Kịch Biến Mặt ~180 RMB (đặt trước 7-10 ngày)",
            dishes: [
              {
                dish_name_vn: "Đậu phụ Ma Bà chuẩn 8 vị (Trần Ma Bà từ 1862)",
                dish_name_zh: "陈麻婆豆腐",
                google_img_keyword: "陈麻婆豆腐",
                baidu_img_keyword: "正宗陈麻婆豆腐",
                restaurant: {
                  name_vn: "Trần Ma Bà Đậu Phụ (Cơ sở chính / Lâu năm từ 1862)",
                  name_zh: "陈麻婆豆腐 (旗舰店)",
                  address_hint: "Số 197 đường Thanh Hoa, quận Thanh Dương, Thành Đô",
                  amap_query: "陈麻婆豆腐旗舰店",
                  price_range: "~50 - 80 ¥/người",
                  rating: "4.8★ (Thủy tổ Đậu phụ Tứ Xuyên)",
                  recommended_dish: "Đậu phụ Ma Bà chuẩn 8 vị, Gà Cung Bảo & Thịt ba chỉ cuộn dưa chuột Lý Trang",
                  note: "Món đậu hũ mướt mịn cay tê từ tiêu Hán Nguyên và sốt tương Pixian trứ danh."
                }
              },
              {
                dish_name_vn: "Gà xào đậu phộng Cung Bảo & Thịt ba chỉ Lý Trang",
                dish_name_zh: "宫保鸡丁 / 李庄白肉",
                google_img_keyword: "川味宫保鸡丁 李庄白肉",
                baidu_img_keyword: "四川宫保鸡丁 李庄白肉"
              }
            ]
          }
        ]
      },
      {
        day_number: 12,
        date: "Thứ Tư, 25/11/2026",
        city: "Thành Đô (Chengdu - 成都)",
        title: "Đỗ Phủ Thảo Đường – Bảo Tàng Tứ Xuyên – Ngõ Rộng Ngõ Hẹp",
        hotel: {
          name_vn: "Mercure Chengdu Chunxi Road Tianfu Square",
          name_zh: "成都春熙路天府广场美居酒店",
          address: "Tầng 6-14, Số 61 đường Nhân Dân Đông, quận Cẩm Giang, Thành Đô",
          phone: "+86-28-86613888-0"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "08:30 - 12:00",
            activity_title: "Viếng Đỗ Phủ Thảo Đường & Bảo tàng Tứ Xuyên",
            description: "Viếng thăm Đỗ Phủ Thảo Đường (杜甫草堂) thanh bình rợp bóng tre. Tham quan Bảo tàng Tứ Xuyên kế bên. Ăn trưa tại Thảo Đường Gia Thường Thái (草堂家常菜): cá hấp ớt chua ngâm băm nhuyễn (剁椒鱼), canh gà thả vườn hầm ngân nhĩ ngọt dịu.",
            place_name: "Đỗ Phủ Thảo Đường & Bảo tàng Tứ Xuyên",
            place_zh: "成都杜甫草堂博物馆 / 四川博物院",
            amap_query: "杜甫草堂",
            transport_hint: "Metro Line 4 ga Caotang Road North (草堂北路站)",
            transport_detail: {
              mode: "metro",
              metro_line: "Line 4 (Tuyến số 4)",
              departure_station_vn: "Ga Quảng trường Thiên Phủ (Tianfu Square)",
              departure_station_zh: "天府广场站",
              arrival_station_vn: "Ga Đường Thảo Đường Bắc (Caotang Road North)",
              arrival_station_zh: "草堂北路站",
              station_count: "4 ga (~12 phút)",
              summary: "Đón Metro Line 2 từ Thiên Phủ chuyển Line 4 sang ga Caotang Road North (Cổng B đi bộ vào Đỗ Phủ Thảo Đường)",
            },
            duration_hint: "3.5 tiếng",
            dishes: [
              {
                dish_name_vn: "Cá hấp ớt chua ngâm & Canh gà hầm ngân nhĩ (Thảo Đường Gia Thường Thái)",
                dish_name_zh: "草堂家常菜 剁椒鱼",
                google_img_keyword: "剁椒鱼 成都",
                baidu_img_keyword: "草堂家常菜 剁椒鱼"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "14:00 - 18:00",
            activity_title: "Khám phá Ngõ Rộng Ngõ Hẹp (Kuanzhai Alley) kiến trúc Tứ hợp viện",
            description: "Khám phá Ngõ Rộng Ngõ Hẹp (宽窄巷子 - Kuanzhai Alley) với kiến trúc tứ hợp viện thời Thanh. Trải nghiệm lấy ráy tai trà đạo truyền thống, ngắm nghía các tiệm thủ công mỹ nghệ.",
            place_name: "Ngõ Rộng Ngõ Hẹp (Kuanzhai Alley)",
            place_zh: "宽窄巷子",
            amap_query: "宽窄巷子",
            transport_hint: "Metro Line 4 ga Kuanzhaixiangzi (宽窄巷子站)",
            transport_detail: {
              mode: "metro",
              metro_line: "Line 4 (Tuyến số 4)",
              departure_station_vn: "Ga Đường Thảo Đường Bắc (Caotang Road North)",
              departure_station_zh: "草堂北路站",
              arrival_station_vn: "Ga Ngõ Rộng Ngõ Hẹp (Kuanzhaixiangzi)",
              arrival_station_zh: "宽窄巷子站",
              station_count: "3 ga (~7 phút)",
              summary: "Đón Metro Line 4 từ ga Caotang Road North đến ga Kuanzhaixiangzi (Cổng B ra ngay cổng Ngõ Rộng)",
            },
            duration_hint: "4 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 21:00",
            activity_title: "Food-tour đường phố Ngõ Rộng Ngõ Hẹp",
            description: "Food-tour đường phố tại Ngõ Rộng Ngõ Hẹp: bánh đường ném 'Ba Tiếng Pháo' (三大炮), sủi cảo Chung Thủy Giảo ngập sốt ớt ngọt cay (钟水饺), mì gánh Dan Dan (担担面).",
            place_name: "Phố ẩm thực Ngõ Rộng Ngõ Hẹp",
            place_zh: "宽窄巷子美食街",
            amap_query: "宽窄巷子",
            dishes: [
              {
                dish_name_vn: "Bánh ném Ba Tiếng Pháo (San Da Pao)",
                dish_name_zh: "三大炮",
                google_img_keyword: "成都三大炮",
                baidu_img_keyword: "三大炮 成都小吃"
              },
              {
                dish_name_vn: "Sủi cảo Chung Thủy Giảo sốt cay ngọt",
                dish_name_zh: "钟水饺",
                google_img_keyword: "钟水饺 成都",
                baidu_img_keyword: "成都钟水饺"
              },
              {
                dish_name_vn: "Mì gánh Dan Dan Tứ Xuyên",
                dish_name_zh: "担担面",
                google_img_keyword: "成都担担面",
                baidu_img_keyword: "正宗成都担担面"
              }
            ]
          }
        ]
      },
      {
        day_number: 13,
        date: "Thứ Năm, 26/11/2026",
        city: "Đô Giang Yển & Núi Thanh Thành (Dujiangyan - 都江堰)",
        title: "Núi Thanh Thành & Công Trình Thủy Lợi Đô Giang Yển – Cầu Nam Kiều Blue Tear",
        hotel: {
          name_vn: "Mercure Chengdu Chunxi Road Tianfu Square",
          name_zh: "成都春熙路天府广场美居酒店",
          address: "Tầng 6-14, Số 61 đường Nhân Dân Đông, quận Cẩm Giang, Thành Đô",
          phone: "+86-28-86613888-0"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "08:00 - 12:30",
            activity_title: "Núi Thanh Thành – Đệ nhất danh sơn Đạo giáo",
            description: "Đi tàu liên đô thị C-train (08:15 – 08:45) từ ga Tây Phố (Xipu) đến chân Núi Thanh Thành (青城山). Đi cáp treo lên Thượng Thanh Cung dạo bước giữa rừng cây Đạo giáo. Trưa thưởng thức thịt lợn muối hun khói lá thông Thanh Thành Sơn và canh gà hầm quả ngân hạnh bạch quả cổ thụ tại quán nông gia chân núi.",
            place_name: "Núi Thanh Thành (Mount Qingcheng)",
            place_zh: "青城山前山景区",
            amap_query: "青城山前山景区",
            transport_hint: "Metro Line 2 ra ga Xipu đổi tàu C-train (08:15 – 08:45, ~30 phút) đến ga Thanh Thành Sơn (青城山站)",
            transport_detail: {
              mode: "train",
              train_number: "C-train (08:15 - 08:45)",
              train_departure_station_vn: "Ga Tây Phố (Xipu)",
              train_departure_station_zh: "犀浦站",
              train_arrival_station_vn: "Ga Núi Thanh Thành (Qingchengshan)",
              train_arrival_station_zh: "青城山站",
              train_duration: "30 phút",
              summary: "Đi Metro Line 2 ra ga Xipu đổi cùng sân ga lên tàu C-train (08:15 - 08:45) đến ga Núi Thanh Thành (青城山站)",
            },
            ticket_hint: "Vé Núi Thanh Thành ~80 RMB",
            duration_hint: "4.5 tiếng",
            dishes: [
              {
                dish_name_vn: "Thịt lợn muối hun khói lá thông Thanh Thành Sơn",
                dish_name_zh: "青城山老腊肉",
                google_img_keyword: "青城山老腊肉",
                baidu_img_keyword: "青城山特色老腊肉"
              },
              {
                dish_name_vn: "Canh gà hầm quả ngân hạnh bạch quả cổ thụ",
                dish_name_zh: "白果炖鸡",
                google_img_keyword: "青城山白果炖鸡",
                baidu_img_keyword: "青城山白果炖鸡"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 17:30",
            activity_title: "Công trình Thủy lợi Đô Giang Yển hơn 2.200 năm tuổi",
            description: "Bắt taxi sang Công trình Thủy Lợi Đô Giang Yển (都江堰) hơn 2.200 năm tuổi: ngắm đập phân dòng Mỏ Cá (Yuzui), Miệng Bình Bảo, Cầu treo An Lan.",
            place_name: "Công trình Thủy lợi Đô Giang Yển",
            place_zh: "都江堰景区",
            amap_query: "都江堰景区离堆公园门票站",
            transport_hint: "Taxi 20 phút từ Núi Thanh Thành sang Đô Giang Yển",
            ticket_hint: "Vé tham quan Đô Giang Yển ~80 RMB",
            duration_hint: "4 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 20:20",
            activity_title: "Ánh sáng xanh Blue Tear tại Cầu Nam Kiều & Tàu C-train về Thành Đô",
            description: "Chiêm ngưỡng hiện tượng ánh sáng xanh 'Blue Tear' tại Cầu Nam Kiều (南桥) từ 18:00 – 19:30. Ăn tối cá nướng thảo mộc cay trên khay than hồng bên bờ sông Mân Giang (南桥万州烤鱼). Đi bộ 10 phút sang ga Lidui Park bắt tàu C-train (19:45 – 20:20) về lại ga Tây Phố (Thành Đô).",
            place_name: "Cầu Nam Kiều (Nanqiao Bridge)",
            place_zh: "都江堰南桥",
            amap_query: "都江堰南桥",
            transport_hint: "Đi bộ từ Cầu Nam Kiều ra ga Công viên Ly Đôi đón tàu C-train (19:45 – 20:20) về ga Tây Phố",
            transport_detail: {
              mode: "train",
              train_number: "C-train (19:45 - 20:20)",
              train_departure_station_vn: "Ga Công viên Ly Đôi (Lidui Park)",
              train_departure_station_zh: "离堆公园站",
              train_arrival_station_vn: "Ga Tây Phố (Xipu)",
              train_arrival_station_zh: "犀浦站",
              train_duration: "35 phút",
              summary: "Đi bộ 10 phút từ Cầu Nam Kiều ra ga Công viên Ly Đôi (离堆公园站), đón tàu C-train (19:45 - 20:20) về ga Tây Phố rồi chuyển Metro Line 2 về khách sạn",
            },
            dishes: [
              {
                dish_name_vn: "Cá nướng thảo mộc cay bờ sông Mân Giang (Nam Kiều)",
                dish_name_zh: "南桥万州烤鱼",
                google_img_keyword: "都江堰烤鱼",
                baidu_img_keyword: "都江堰南桥烤鱼"
              }
            ]
          }
        ]
      },
      {
        day_number: 14,
        date: "Thứ Sáu, 27/11/2026",
        city: "Lạc Sơn & Nga Mi Sơn (Leshan & Mount Emei - 峨眉山)",
        title: "Thành Đô – Lạc Sơn Đại Phật 71m – Nghỉ Dưỡng Resort Thiên Cảnh Nga Mi Sơn",
        hotel: {
          name_vn: "Resort Nghỉ Dưỡng Thiên Cảnh Nga Mi Sơn (Tianjing Resort Hotel - ¥627/đêm)",
          name_zh: "峨眉山天境度假酒店",
          address: "Số 158 Tòa 6 Đường Đông Tú Hồ, cạnh bờ hồ Nga Tú (峨秀湖), Nga Mi Sơn, Lạc Sơn",
          phone: "+86-833-2620222"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "07:30 - 12:30",
            activity_title: "Tàu cao tốc đi Lạc Sơn & Du thuyền ngắm Lạc Sơn Đại Phật cao 71m",
            description: "Gửi vali lớn lại khách sạn Mercure Thành Đô, mang balo nhỏ ra ga đón tàu cao tốc (07:30 – 08:25, ~50–55 phút) đi ga Lạc Sơn. Đến bến thuyền Bát Tiên Động mua vé du thuyền ngắm trọn vẹn Lạc Sơn Đại Phật (乐山大佛) cao 71m tạc vào vách đá ngắm nhìn ba con sông hội tụ. Ăn trưa đặc sản tại Kỷ Lục Muội Điềm Bì Áp và Phương Phương Kiều Cước Ngưu Nhục: Vịt da ngọt Lạc Sơn, thịt bò thố nhúng Kiều Cước và gà xiên que lạnh Bát Bát Kê.",
            place_name: "Lạc Sơn Đại Phật (Leshan Giant Buddha)",
            place_zh: "乐山大佛景区",
            amap_query: "乐山大佛八仙洞游船码头",
            transport_hint: "Tàu cao tốc Thành Đô Đông – Ga Lạc Sơn (07:30 – 08:25, ~50–55 phút); Taxi ra bến thuyền",
            transport_detail: {
              mode: "train",
              train_number: "C-train / G-train (07:30 - 08:25)",
              train_departure_station_vn: "Ga Thành Đô Đông (Chengdu East)",
              train_departure_station_zh: "成都东站",
              train_arrival_station_vn: "Ga Lạc Sơn (Leshan)",
              train_arrival_station_zh: "乐山站",
              train_duration: "55 phút",
              summary: "Tàu cao tốc (07:30 - 08:25) từ ga Thành Đô Đông đến ga Lạc Sơn (乐山站); đón taxi ra bến thuyền Bát Tiên Động",
            },
            ticket_hint: "Vé du thuyền ngắm Lạc Sơn Đại Phật ~70 RMB (đặt trước 7-10 ngày)",
            duration_hint: "5 tiếng",
            dishes: [
              {
                dish_name_vn: "Vịt da ngọt Lạc Sơn (Kỷ Lục Muội Điềm Bì Áp)",
                dish_name_zh: "纪六妹甜皮鸭 / 乐山甜皮鸭",
                google_img_keyword: "乐山甜皮鸭",
                baidu_img_keyword: "乐山纪六妹甜皮鸭"
              },
              {
                dish_name_vn: "Thịt bò thố nhúng Kiều Cước (Phương Phương) & Gà xiên que Bát Bát Kê",
                dish_name_zh: "芳芳跷脚牛肉 / 钵钵鸡",
                google_img_keyword: "乐山跷脚牛肉 钵钵鸡",
                baidu_img_keyword: "乐山芳芳跷脚牛肉 钵钵鸡"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 17:30",
            activity_title: "Tàu cao tốc sang Nga Mi Sơn – Nhận phòng Resort Thiên Cảnh & Viếng Chùa Báo Quốc, Chùa Phục Hổ",
            description: "Đón tàu cao tốc 15 phút (13:30 – 13:45) từ ga Lạc Sơn sang ga Nga Mi Sơn. Nhận phòng tại Resort Nghỉ Dưỡng Thiên Cảnh Nga Mi Sơn (Tianjing Resort Hotel - ¥627/đêm ~ 2,418,402 VND) bên bờ hồ Nga Tú (峨秀湖). Dạo bước vãng cảnh Chùa Báo Quốc (报国寺) và Chùa Phục Hổ (伏虎寺) cổ kính giữa rừng đại ngàn.",
            place_name: "Chùa Báo Quốc, Chùa Phục Hổ & Hồ Nga Tú",
            place_zh: "峨眉山报国寺 / 伏虎寺",
            amap_query: "峨眉山报国寺",
            transport_hint: "Tàu cao tốc liên huyện Ga Lạc Sơn – Ga Nga Mi Sơn (13:30 – 13:45, ~15 phút)",
            transport_detail: {
              mode: "train",
              train_number: "Tàu cao tốc liên huyện (13:30 - 13:45)",
              train_departure_station_vn: "Ga Lạc Sơn (Leshan)",
              train_departure_station_zh: "乐山站",
              train_arrival_station_vn: "Ga Núi Nga Mi (Emeishan)",
              train_arrival_station_zh: "峨眉山站",
              train_duration: "15 phút",
              summary: "Tàu cao tốc (13:30 - 13:45, 15 phút) từ ga Lạc Sơn (乐山站) sang ga Núi Nga Mi (峨眉山站)",
            },
            duration_hint: "4 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 21:00",
            activity_title: "Ngâm khoáng nóng lộ thiên giữa rặng trúc & Dạo phố cổ Viện Tử",
            description: "Thư giãn ngâm mình trong bể khoáng nóng sân vườn lộ thiên giữa rặng trúc xanh mát. Dạo phố cổ Viện Tử, thưởng thức vịt kho nấm tuyết Konjac phơi sương (雪魔芋烧鸭), súp đậu hũ nẫu Nga Mi (峨眉豆腐脑), rau rừng trên mây xào mỡ lợn (高山野菜).",
            place_name: "Resort Nghỉ Dưỡng Thiên Cảnh Nga Mi Sơn",
            place_zh: "峨眉山天境度假酒店",
            amap_query: "峨眉山天境度假酒店",
            ticket_hint: "Giá phòng Resort Thiên Cảnh: ¥627/đêm (~2,418,402 VND)",
            dishes: [
              {
                dish_name_vn: "Vịt kho nấm tuyết Konjac phơi sương",
                dish_name_zh: "雪魔芋烧鸭",
                google_img_keyword: "峨眉山雪魔芋烧鸭",
                baidu_img_keyword: "雪魔芋烧鸭"
              },
              {
                dish_name_vn: "Súp đậu hũ nẫu Nga Mi & Rau rừng trên mây xào",
                dish_name_zh: "峨眉豆腐脑 / 高山野菜",
                google_img_keyword: "峨眉山豆腐脑",
                baidu_img_keyword: "峨眉豆腐脑 高山野菜"
              }
            ]
          }
        ]
      },
      {
        day_number: 15,
        date: "Thứ Bảy, 28/11/2026",
        city: "Nga Mi Sơn & Thành Đô (Mount Emei - 峨眉山)",
        title: "Chinh Phục Đỉnh Kim Đỉnh Nga Mi Sơn (3.077m) – Về lại Thành Đô",
        hotel: {
          name_vn: "Mercure Chengdu Chunxi Road Tianfu Square",
          name_zh: "成都春熙路天府广场美居酒店",
          address: "Tầng 6-14, Số 61 đường Nhân Dân Đông, quận Cẩm Giang, Thành Đô",
          phone: "+86-28-86613888-0"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "06:30 - 12:30",
            activity_title: "Chinh phục Đỉnh Kim Đỉnh cao 3.077m & Đại tượng Phổ Hiền Bồ Tát 48m",
            description: "06:30 đón xe buýt từ Bến xe Hoàng Loan lên trạm Lôi Động Bình (~1.5h). Đi bộ 30 phút lên Tiếp Dẫn Điện, đi cáp treo lên đỉnh Kim Đỉnh (cao 3.077m). Chiêm bái bức Đại tượng Phổ Hiền Bồ Tát bằng đồng mạ vàng 4 mặt cao 48m uy nghiêm giữa biển mây và cảnh sắc sương tuyết đầu đông. Trưa ăn ấm nóng nhanh tại các quầy phục vụ của khách sạn Kim Đỉnh (mì nóng, xúc xích nướng tiêu đen hoặc cơm tự sôi để chống rét âm độ).",
            place_name: "Kim Đỉnh Núi Nga Mi (Golden Summit)",
            place_zh: "峨眉山金顶",
            amap_query: "峨眉山金顶",
            transport_hint: "Xe buýt từ Bến Hoàng Loan lên Lôi Động Bình (~1.5h) + Đi bộ 30 phút lên Tiếp Dẫn Điện + Cáp treo Kim Đỉnh",
            ticket_hint: "Vé cáp treo Kim Đỉnh khứ hồi ~120 RMB",
            duration_hint: "6 tiếng",
            tips: "Đỉnh núi cao 3.077m cuối tháng 11 có băng tuyết (-5°C đến 2°C). Cần chuẩn bị miếng dán giữ nhiệt, găng tay, mũ len và bộ đinh gai chống trượt gắn giày."
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 18:00",
            activity_title: "Xuống núi & Tàu cao tốc (16:45 – 18:00) về lại khách sạn Mercure Thành Đô",
            description: "Đi cáp treo và xe buýt trở về chân núi. Lấy đồ tại khách sạn Tianjing Resort Hotel, ra ga Nga Mi Sơn đón tàu cao tốc liên đô thị (16:45 – 18:00, ~1h 15m) về lại ga Thành Đô Đông. Về nhận lại phòng và vali tại khách sạn Mercure.",
            place_name: "Ga Nga Mi Sơn – Ga Thành Đô Đông",
            place_zh: "峨眉山站",
            amap_query: "峨眉山站",
            transport_hint: "Tàu cao tốc liên đô thị Ga Nga Mi Sơn – Ga Thành Đô Đông (16:45 – 18:00, ~1h 15m)",
            transport_detail: {
              mode: "train",
              train_number: "Tàu cao tốc liên đô thị (16:45 - 18:00)",
              train_departure_station_vn: "Ga Núi Nga Mi (Emeishan)",
              train_departure_station_zh: "峨眉山站",
              train_arrival_station_vn: "Ga Thành Đô Đông (Chengdu East)",
              train_arrival_station_zh: "成都东站",
              train_duration: "1h 15m",
              summary: "Tàu cao tốc (16:45 - 18:00) từ ga Núi Nga Mi (峨眉山站) về ga Thành Đô Đông (成都东站), đón Metro Line 2 về khách sạn Mercure",
            },
            duration_hint: "4.5 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:30 - 21:30",
            activity_title: "Đại tiệc lẩu chia tay Tứ Xuyên tại Lẩu Đại Long Diễm hoặc Lẩu Thục Cửu Hương",
            description: "Đại tiệc lẩu chia tay Tứ Xuyên tại Lẩu Đại Long Diễm (大龙燚火锅) hoặc Lẩu Thục Cửu Hương (蜀九香): lẩu uyên ương nấm và mỡ bò cay tê, nhúng thịt bò lát ớt tuyết (麻辣牛肉), cuống họng heo (黄喉), tôm phết ngọc bích. Dạo phố đêm mua sắm nhẹ.",
            place_name: "Lẩu Đại Long Diễm / Lẩu Thục Cửu Hương",
            place_zh: "大龙燚火锅 / 蜀九香火锅",
            amap_query: "大龙燚火锅春熙路店",
            dishes: [
              {
                dish_name_vn: "Lẩu mỡ bò cay tê Tứ Xuyên (Đại Long Diễm / Thục Cửu Hương)",
                dish_name_zh: "大龙燚火锅 / 蜀九香",
                google_img_keyword: "大龙燚火锅 麻辣牛肉 黄喉",
                baidu_img_keyword: "成都大龙燚火锅 蜀九香"
              }
            ]
          }
        ]
      },
      {
        day_number: 16,
        date: "Chủ Nhật, 29/11/2026",
        city: "Thành Đô (Chengdu) – TP.HCM",
        title: "Công Viên Nhân Dân – Mua Sắm Taikoo Li – Bay Thẳng về TP.HCM",
        events: [
          {
            time_slot: "Sáng",
            time_range: "09:00 - 12:00",
            activity_title: "Công viên Nhân Dân & Hạc Minh Trà Quán hơn 100 năm tuổi",
            description: "Trả phòng khách sạn (gửi lại vali tại quầy lễ tân). Dạo bước tại Công viên Nhân Dân (People's Park) hòa mình vào nhịp sống chậm. Ngồi tại Hạc Minh Trà Quán (鹤鸣茶社) hơn 100 năm tuổi ven hồ: thưởng trà hoa nhài nắp đậy cái oản (盖碗茉莉花茶), hạt dưa ngũ vị, mì gánh Dan Dan và bánh rán mè ngọt bùi.",
            place_name: "Công viên Nhân Dân & Hạc Minh Trà Quán",
            place_zh: "人民公园鹤鸣茶社",
            amap_query: "人民公园鹤鸣茶社",
            transport_hint: "Metro Line 2 ga People's Park (人民公园站)",
            transport_detail: {
              mode: "metro",
              metro_line: "Line 2 (Tuyến số 2)",
              departure_station_vn: "Ga Quảng trường Thiên Phủ (Tianfu Square)",
              departure_station_zh: "天府广场站",
              arrival_station_vn: "Ga Công viên Nhân Dân (People's Park)",
              arrival_station_zh: "人民公园站",
              station_count: "1 ga (~2 phút)",
              summary: "Đón Metro Line 2 từ ga Quảng trường Thiên Phủ đến ga Công viên Nhân Dân (Cổng B vào thẳng công viên)",
            },
            duration_hint: "3 tiếng",
            dishes: [
              {
                dish_name_vn: "Trà hoa nhài nắp đậy cái oản (Gaiwan Tea)",
                dish_name_zh: "盖碗茉莉花茶",
                google_img_keyword: "鹤鸣茶社 盖碗茶",
                baidu_img_keyword: "鹤鸣茶社 盖碗茶"
              },
              {
                dish_name_vn: "Mì gánh Dan Dan & Bánh rán mè ngọt bùi",
                dish_name_zh: "担担面 / 糖油果子",
                google_img_keyword: "四川担担面 糖油果子",
                baidu_img_keyword: "成都担担面 糖油果子"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "12:30 - 17:30",
            activity_title: "Mua quà Taikoo Li, Hoành thánh Long Sao Thủ & Metro Line 18 ra Sân bay Thiên Phủ (TFU T1)",
            description: "Tự do mua quà: trà xanh Nga Mi, gói cốt lẩu cay Tứ Xuyên, đồ lưu niệm gấu trúc quanh khu Taikoo Li / Xuân Hy. Thưởng thức hoành thánh cay sốt dầu ớt tại tiệm Long Sao Thủ (龙抄手) tại Taikoo Li. 16:15 lấy hành lý, đi Metro Line 1 đổi sang Metro Line 18 (tàu nhanh Express) đi thẳng đến Sân bay Quốc tế Thiên Phủ (TFU T1). 17:30 có mặt tại Terminal 1 làm thủ tục gửi hành lý và xuất cảnh.",
            place_name: "Sân bay Quốc tế Thiên Phủ Thành Đô (TFU T1)",
            place_zh: "成都天府国际机场T1",
            amap_query: "成都天府国际机场T1",
            transport_hint: "Rời khách sạn muộn nhất 16:15, đi Metro Line 1 đổi Metro Line 18 (tàu nhanh Express) ra sân bay TFU T1 trước 17:45",
            transport_detail: {
              mode: "metro",
              metro_line: "Line 18 (Tàu nhanh Express)",
              departure_station_vn: "Ga Nam Thành Đô (Huoche Nanzhan)",
              departure_station_zh: "火车南站",
              arrival_station_vn: "Ga Sân bay Quốc tế Thiên Phủ T1/T2",
              arrival_station_zh: "天府机场1号2号航站楼站",
              station_count: "Tàu nhanh Express (~38 phút)",
              summary: "Đón Metro Line 1 từ ga Thiên Phủ xuống ga Nam Thành Đô (火车南站), chuyển Metro Line 18 tàu nhanh Express đi thẳng ra Ga Sân bay Thiên Phủ T1/T2 (天府机场1号2号航站楼站)",
            },
            duration_hint: "5 tiếng",
            tips: "Sân bay Thiên Phủ cách trung tâm hơn 55km. Cần rời khách sạn muộn nhất lúc 16:15 đi Metro Line 18 (chuyến Express) ra sân bay trước 17:45.",
            dishes: [
              {
                dish_name_vn: "Hoành thánh cay sốt dầu ớt (Long Sao Thủ Taikoo Li)",
                dish_name_zh: "龙抄手",
                google_img_keyword: "成都龙抄手",
                baidu_img_keyword: "成都老字号龙抄手"
              }
            ]
          },
          {
            time_slot: "Tối",
            time_range: "20:30 - 23:15",
            activity_title: "Chuyến bay thẳng Sichuan Airlines 3U3903 (TFU T1 – SGN T2) về TP.HCM",
            description: "20:30 cất cánh chuyến bay Sichuan Airlines 3U3903 về TP.HCM. 23:15 hạ cánh an toàn tại Tân Sơn Nhất (SGN T2). Hoàn tất chuyến đi 16 ngày trọn vẹn!",
            place_name: "Sân bay Quốc tế Tân Sơn Nhất (SGN T2)",
            place_zh: "胡志明市新山一国际机场",
            amap_query: "成都天府国际机场T1",
            transport_hint: "Sichuan Airlines 3U3903 (20:30 – 23:15) | Bay thẳng về Tân Sơn Nhất",
            ticket_hint: "Vé máy bay lượt về: 1,981 RMB (~6,933,500 VND) | Mã đặt chỗ PNR: PT1MQ4",
            duration_hint: "3.5 tiếng",
            tips: "Nhớ chỉnh lại múi giờ trên điện thoại (Việt Nam chậm hơn Trung Quốc 1 tiếng)."
          }
        ]
      }
    ]
  },
  {
    id: "sample_beijing_shanghai_6d5n",
    trip_title: "Bắc Kinh - Thượng Hải - Hàng Châu Khám Phá Cố Đô & Hiện Đại",
    duration: "6 ngày 5 đêm",
    created_at: 1712000000000,
    days: [
      {
        day_number: 1,
        date: "Ngày 1: Hà Nội / TP.HCM - Bắc Kinh",
        city: "Bắc Kinh (Beijing - 北京)",
        title: "Khám phá Trái tim Cố đô: Quảng trường Thiên An Môn & Tử Cấm Thành",
        hotel: {
          name_vn: "Khách sạn Vương Phủ Tỉnh Bắc Kinh",
          name_zh: "北京王府井希尔顿酒店",
          address: "北京市东城区王府井东街8号 (Số 8 Đường Đông Vương Phủ Tỉnh, Đông Thành, Bắc Kinh)",
          phone: "+86 10 5812 8888"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "08:30 - 11:30",
            activity_title: "Check-in Quảng trường Thiên An Môn & Cửa Ngọ Môn",
            description: "Dạo bước qua quảng trường lớn nhất thế giới, ngắm nhìn Lăng Mao Trạch Đông và cổng thành lịch sử chuẩn bị vào Cố Cung.",
            place_name: "Quảng trường Thiên An Môn",
            place_zh: "天安门广场",
            amap_query: "天安门广场",
            tips: "Bắt buộc đặt vé trước tối thiểu 7 ngày trên WeChat Mini Program. Nhớ mang theo Hộ chiếu gốc để qua cửa an ninh nghiêm ngặt.",
            dishes: [
              {
                dish_name_vn: "Bánh bao hấp Bắc Kinh (Baozi)",
                dish_name_zh: "北京包子",
                google_img_keyword: "北京包子 早餐",
                baidu_img_keyword: "北京老字号包子"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "13:00 - 17:00",
            activity_title: "Thăm quan Tử Cấm Thành (Cố Cung) & Công viên Cảnh Sơn",
            description: "Chiêm ngưỡng kiến trúc cung điện hoàng gia nguy nga thời Minh - Thanh, lên đỉnh đồi Cảnh Sơn ngắm toàn cảnh Tử Cấm Thành từ trên cao.",
            place_name: "Tử Cấm Thành (Bảo tàng Cố Cung)",
            place_zh: "故宫博物院",
            amap_query: "故宫博物院神武门",
            tips: "Nên thuê máy thuyết minh tự động tiếng Việt ở Ngọ Môn. Đi xuyên từ Nam ra Bắc (ra cổng Thần Vũ Môn).",
            dishes: [
              {
                dish_name_vn: "Vịt quay Bắc Kinh Toàn Tụ Đức",
                dish_name_zh: "全聚德烤鸭",
                google_img_keyword: "全聚德北京烤鸭",
                baidu_img_keyword: "北京烤鸭 全聚德"
              }
            ]
          }
        ]
      }
    ]
  }
];
