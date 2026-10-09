import { TripDocument } from "../types/itinerary";

export const SAMPLE_TRIPS: TripDocument[] = [
  {
    id: "trip_zhangjiajie_chengdu_16d15n",
    trip_title: "Trương Gia Giới – Vũ Long – Trùng Khánh – Thành Đô – Núi Nga Mi",
    duration: "16 ngày 15 đêm (14/11 – 29/11/2026)",
    created_at: 1731542400000,
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
            activity_title: "Chuyến bay TP.HCM - Quảng Châu - Trương Gia Giới",
            description: "Bay CZ6090 từ Tân Sơn Nhất sang Quảng Châu (02:25 - 06:20), nhập cảnh hải quan T2 Quảng Châu. Nối chuyến CZ3381 lúc 08:35 đến sân bay Hà Hoa Trương Gia Giới (10:20). Đi taxi 12 phút về nhận phòng Atour Hotel.",
            place_name: "Sân bay Hà Hoa Trương Gia Giới",
            place_zh: "张家界荷花国际机场",
            amap_query: "张家界荷花国际机场",
            transport_hint: "Chuyến bay China Southern Airlines CZ6090 & CZ3381; Taxi 12 phút về Atour Hotel",
            ticket_hint: "Vé máy bay khứ hồi China Southern Airlines",
            duration_hint: "8 tiếng",
            tips: "Hành lý gửi thẳng đến Trương Gia Giới. Nhớ mang áo ấm khi xuống sân bay.",
            dishes: [
              {
                dish_name_vn: "Mì bắp bò cay Hồ Nam (Tiệm Mì Bò Hùng Ký)",
                dish_name_zh: "熊记牛肉面馆 牛肉面",
                google_img_keyword: "湖南牛肉面",
                baidu_img_keyword: "湖南特色牛肉面",
                restaurant: {
                  name_vn: "Tiệm Mì Bò Hùng Ký (Gần Atour Hotel)",
                  name_zh: "熊记牛肉面馆",
                  address_hint: "Số 68 đường Tử Ngọ, quận Vĩnh Định, Trương Gia Giới",
                  amap_query: "熊记牛肉面馆 张家界",
                  price_range: "~20 - 35 ¥/bát",
                  rating: "4.7★ (Dianping)",
                  recommended_dish: "Mì bắp bò hầm hoa tiêu Hồ Nam & Trứng ngâm trà",
                  note: "Nước dùng xương hầm 12 tiếng cay nồng ấm bụng, mở từ sáng sớm."
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
            description: "Tham quan kiệt tác kiến trúc nhà sàn Thổ Gia điêu khắc bằng gỗ tráng lệ cao 109.9m. Chụp ảnh lúc hoàng hôn khi hệ thống đèn lồng bừng sáng lung linh.",
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
            description: "Dạo bước ven sông Lishui ngắm Phố cổ Đại Dung. Ăn tối tại quán Hồ Sư Phụ Tam Hạ Oa trứ danh.",
            place_name: "Phố cổ Đại Dung & Hồ Sư Phụ Tam Hạ Oa",
            place_zh: "大庸古城",
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
                  address_hint: "Số 117 đường Tử Ngọ, quận Vũ Lăng Nguyên / Vĩnh Định",
                  amap_query: "胡师傅三下锅",
                  price_range: "~55 - 80 ¥/người",
                  rating: "4.8★ (Đệ nhất Tam Hạ Oa)",
                  recommended_dish: "Tam Hạ Oa xào khô (ruột heo giòn, ba chỉ hun khói, nấm rừng)",
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
        title: "Chinh phục Đỉnh Thiên Môn Sơn & Cổng Trời Thiên Môn Động",
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
            activity_title: "Cáp treo Thiên Môn Sơn & Sạn Đạo Kính vách kính",
            description: "Đi bộ 5 phút từ khách sạn sang ga cáp treo trung tâm. Đi cáp treo vượt núi dài 7.400m lên đỉnh. Trải nghiệm vách kính Sạn Đạo Kính ở độ cao 1.400m và Đường vách đá Quỷ Cốc.",
            place_name: "Thiên Môn Sơn - Sạn Đạo Kính",
            place_zh: "天门山玻璃栈道",
            amap_query: "天门山索道下站",
            transport_hint: "Cáp treo Tuyến A từ trung tâm lên đỉnh",
            ticket_hint: "Vé Tuyến A ~278 RMB (cần đặt trước tối thiểu 7 ngày)",
            duration_hint: "4.5 tiếng",
            tips: "Mang bao bọc giày (5 RMB) khi bước lên cầu kính Sạn Đạo Kính."
          },
          {
            time_slot: "Chiều",
            time_range: "12:30 - 16:30",
            activity_title: "Thang cuốn xuyên núi & Cổng Trời 999 bậc thang",
            description: "Viếng Đền Thiên Môn Sơn. Đi 7 tầng thang cuốn xuyên lòng núi xuống chân Cổng Trời - Thiên Môn Động. Thử thách bước xuống 999 bậc đá dốc đứng và lên xe buýt vượt 99 khúc cua ngoạn mục.",
            place_name: "Thiên Môn Động (Cổng Trời)",
            place_zh: "天门洞",
            amap_query: "天门山天门洞",
            transport_hint: "Thang cuốn xuyên núi Transmountain Escalator & Xe buýt sinh thái",
            duration_hint: "4 tiếng",
            tips: "Nếu mỏi chân có thể mua vé thang cuốn phụ đi xuống thay vì bước bộ 999 bậc."
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 20:30",
            activity_title: "Ăn tối đặc sản Tương Tây tại Ngân Mãn Đẩu",
            description: "Thưởng thức ẩm thực dân gian Tương Tây trứ danh tại quán Ngân Mãn Đẩu Thổ Thái Quán.",
            place_name: "Ngân Mãn Đẩu Thổ Thái Quán",
            place_zh: "银满斗土菜馆",
            amap_query: "银满斗土菜馆",
            tips: "Món vịt hầm hạt dẻ rừng và cá suối chua ngọt người Miêu cực kỳ đưa cơm.",
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
                  recommended_dish: "Vịt hầm hạt dẻ rừng bùi béo & Cá suối sốt chua ngọt",
                  note: "Quán gia truyền phong cách nhà gỗ Thổ Gia ấm cúng, đậm đà vị núi rừng."
                }
              },
              {
                dish_name_vn: "Cá suối om canh chua người Miêu",
                dish_name_zh: "苗家酸汤鱼",
                google_img_keyword: "苗家酸汤鱼",
                baidu_img_keyword: "苗家酸汤鱼"
              }
            ]
          }
        ]
      },
      {
        day_number: 3,
        date: "Thứ Hai, 16/11/2026",
        city: "Vũ Lăng Nguyên (Wulingyuan - 武陵源)",
        title: "Vũ Lăng Nguyên – Thang máy Bách Long – Núi Avatar Viên Gia Giới",
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
            activity_title: "Di chuyển lên Vũ Lăng Nguyên & Nhận phòng khách sạn",
            description: "Trả phòng Atour Hotel, gọi xe Didi di chuyển 45 phút lên khu thắng cảnh Vũ Lăng Nguyên. Gửi hành lý tại Veil Canyon Lodge ngay sát Cổng Đông Biaozhi Gate. Quét hộ chiếu vào Công viên Rừng Quốc gia Trương Gia Giới.",
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
            activity_title: "Thang máy Bách Long & Núi Avatar Hallelujah (Cột Càn Khôn)",
            description: "Đi thang máy kính ngoài trời Bách Long cao 326m lên đỉnh Viên Gia Giới trong 88 giây. Chiêm ngưỡng ngọn núi bay Avatar Cột trụ Càn Khôn, Mê Hồn Đài và cầu đá Thiên Hạ Đệ Nhất Kiều.",
            place_name: "Thang máy Bách Long & Viên Gia Giới",
            place_zh: "百龙天梯",
            amap_query: "百龙天梯下站",
            transport_hint: "Xe buýt sinh thái nội khu + Thang máy Bách Long",
            ticket_hint: "Vé thang máy Bách Long một chiều ~65 RMB",
            duration_hint: "4 tiếng",
            tips: "Đứng sát mép kính thang máy để có góc nhìn ngoạn mục nhất khi vút lên đỉnh."
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 21:00",
            activity_title: "Dạo Phố cổ Khê Bố & Ăn tối Tác Khê Sơn Trại",
            description: "Dạo chơi Phố cổ Khê Bố. Ăn tối tại nhà hàng Tác Khê Sơn Trại thưởng thức gà hầm mộc nhĩ vách đá, cá nướng ống tre và bánh giầy nếp nướng.",
            place_name: "Phố cổ Khê Bố & Tác Khê Sơn Trại",
            place_zh: "溪布老街",
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
              }
            ]
          }
        ]
      },
      {
        day_number: 4,
        date: "Thứ Ba, 17/11/2026",
        city: "Vũ Lăng Nguyên (Wulingyuan - 武陵源)",
        title: "Thiên Tử Sơn Kỳ Vĩ & Tản Bộ Thung Lũng Suối Roi Vàng",
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
            description: "Đi cáp treo lên đỉnh Thiên Tử Sơn. Ngắm rừng sa thạch tháp nhọn kỳ vĩ tại Ngự Bút Phong, Tiên Nữ Tán Hoa và Công viên Hạ Long.",
            place_name: "Thiên Tử Sơn (Tianzi Mountain)",
            place_zh: "天子山",
            amap_query: "天子山索道下站",
            transport_hint: "Cáp treo Thiên Tử Sơn Tianzi Mountain Cableway",
            ticket_hint: "Vé cáp treo ~72 RMB",
            duration_hint: "3.5 tiếng"
          },
          {
            time_slot: "Chiều",
            time_range: "12:30 - 16:30",
            activity_title: "Thung lũng Suối Roi Vàng & Hẻm núi Thập Lý Họa Lang",
            description: "Tản bộ thong thả dọc dòng Suối Roi Vàng (Golden Whip Stream) trong vắt dưới tán rừng nguyên sinh. Ghé ngắm phong cảnh hẻm núi Thập Lý Họa Lang.",
            place_name: "Suối Roi Vàng (Golden Whip Stream)",
            place_zh: "金鞭溪",
            amap_query: "金鞭溪峡谷",
            transport_hint: "Đi bộ dọc đường mòn sinh thái & Tàu hỏa mini Thập Lý Họa Lang",
            duration_hint: "4 tiếng",
            tips: "Cẩn thận với khỉ hoang dã, không xách túi nilon hoặc cầm đồ ăn lộ liễu trên tay."
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 20:30",
            activity_title: "Ăn tối Đường Sư Phụ & Ngâm chân thảo dược",
            description: "Thưởng thức sườn lợn hầm nồi gang củi lửa, canh nấm rừng nguyên sinh tại Đường Sư Phụ Thổ Thái Quán. Ngâm chân thảo dược hồi phục cơ bắp.",
            place_name: "Đường Sư Phụ Thổ Thái Quán",
            place_zh: "唐师傅湘西土菜馆",
            amap_query: "唐师傅湘西土菜馆",
            dishes: [
              {
                dish_name_vn: "Sườn lợn hầm nồi gang củi lửa",
                dish_name_zh: "柴火铁锅炖排骨",
                google_img_keyword: "柴火铁锅炖排骨",
                baidu_img_keyword: "铁锅炖排骨"
              }
            ]
          }
        ]
      },
      {
        day_number: 5,
        date: "Thứ Tư, 18/11/2026",
        city: "Vũ Long (Wulong - 武隆)",
        title: "Trương Gia Giới – Vũ Long – Hố sụt Thiên Sinh Tam Kiều & Dịch trạm Thiên Phúc",
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
            description: "Trả phòng sớm, ra ga Trương Gia Giới Tây đón tàu cao tốc G2448 (09:01 - 10:42) đi Vũ Long Nam. Bắt xe lên Thị trấn Tiên Nữ Sơn nhận phòng khách sạn.",
            place_name: "Ga Trương Gia Giới Tây – Ga Vũ Long Nam",
            place_zh: "武隆南站",
            amap_query: "武隆南站",
            transport_hint: "Tàu cao tốc Gaotie G2448 (1h 41m); Taxi lên Tiên Nữ Sơn",
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
            duration_hint: "4 tiếng"
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 17:30",
            activity_title: "Đáy vực Thiên Sinh Tam Kiều & Dịch trạm Thiên Phúc",
            description: "Vào Trung tâm Du khách, đi xe buýt xuống đáy hố sụt Thiên Khanh khổng lồ. Chiêm ngưỡng 3 cây cầu vòm đá tự nhiên hùng vĩ và thăm Dịch trạm Thiên Phúc cổ kính (phim Hoàng Kim Giáp, Transformers 4).",
            place_name: "Thiên Sinh Tam Kiều & Dịch trạm Thiên Phúc",
            place_zh: "天生三桥",
            amap_query: "天生三桥游客中心",
            transport_hint: "Xe buýt nội khu & Thang máy kính tụt xuống đáy vực",
            ticket_hint: "Vé tham quan Thiên Sinh Tam Kiều ~125 RMB (Đặt qua WeChat / Trip.com)",
            duration_hint: "4 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 21:30",
            activity_title: "Lẩu dê thố Vũ Long & Show diễn Ấn Tượng Vũ Long",
            description: "Ăn tối lẩu dê thố đặc sản Vũ Long tại quán Lão Bản Nương. 20:00 thưởng thức show diễn thực cảnh ngoài trời hoành tráng 'Ấn tượng Vũ Long' của đạo diễn Trương Nghệ Mưu.",
            place_name: "Show diễn Ấn tượng Vũ Long",
            place_zh: "印象武隆",
            amap_query: "印象武隆剧场",
            ticket_hint: "Vé xem show Ấn Tượng Vũ Long ~200 RMB (Đặt qua WeChat / Trip.com)",
            tips: "Show diễn ban đêm ngoài hẻm núi rất lạnh (dưới 8 độ C), nhớ mặc áo khoác dày ấm.",
            dishes: [
              {
                dish_name_vn: "Thịt dê hầm thố cay thảo quả Vũ Long",
                dish_name_zh: "碗碗羊肉",
                google_img_keyword: "武隆碗碗羊肉",
                baidu_img_keyword: "武隆特色碗碗羊肉"
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
            description: "Khám phá khe nứt địa chất ngầm Long Thủy Giáp, ngắm các dòng thác đổ từ vách đá dựng đứng vào lòng hẻm núi nguyên sinh kỳ bí.",
            place_name: "Địa phùng Long Thủy Giáp (Longshui Gorge)",
            place_zh: "龙水峡地缝",
            amap_query: "龙水峡地缝景区",
            transport_hint: "Xe buýt từ Trung tâm du khách Tiên Nữ Sơn",
            duration_hint: "3 tiếng"
          },
          {
            time_slot: "Chiều",
            time_range: "16:47 - 17:30",
            activity_title: "Tàu cao tốc G2436 về trung tâm Trùng Khánh",
            description: "Lên tàu cao tốc G2436 tại ga Vũ Long về thẳng trung tâm ga Trùng Khánh (chỉ 43 phút). Đi Metro Line 2 về Giải Phóng Bối nhận phòng tại SENSE SCENE Hotel.",
            place_name: "Ga Trùng Khánh – Giải Phóng Bối",
            place_zh: "重庆站",
            amap_query: "重庆解放碑步行街",
            transport_hint: "Tàu cao tốc G2436 (43 phút); Metro về Giải Phóng Bối",
            duration_hint: "2 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:30 - 21:30",
            activity_title: "Food-tour Phố ăn vặt Bát Nhất & Đài Giải Phóng",
            description: "Dạo bước quanh Đài Tưởng niệm Giải Phóng Bối rực rỡ ánh đèn. Thưởng thức miến chua cay Hảo Hữu Lai, chân gà rút xương, não heo nướng và thạch băng phấn.",
            place_name: "Phố ẩm thực Bát Nhất & Đài Giải Phóng",
            place_zh: "八一路好吃街",
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
                  address_hint: "Số 28 phố ẩm thực Bát Nhất, Giải Phóng Bi, quận Du Trung",
                  amap_query: "好又来酸辣粉 八一路",
                  price_range: "~15 - 25 ¥/bát",
                  rating: "4.8★ (Huyền thoại ăn vặt Trùng Khánh)",
                  recommended_dish: "Miến chua cay tương đậu thịt bằm & Bánh nếp giòn",
                  note: "Quán xếp hàng đông nhưng phục vụ siêu nhanh, sợi miến dẻo dai chua cay bùng nổ."
                }
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
        title: "Đô Thị 3D – Tàu Xuyên Chung Cư Lý Tử Bá – Cáp Treo Dương Tử – Hồng Nhai Động",
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
            description: "Đi Metro Line 1 tham quan Phố cổ Từ Khí Khẩu nghìn năm tuổi ven sông Gia Lăng, ngắm kiến trúc cổ và thưởng thức canh cay Mao Huyết Vượng.",
            place_name: "Phố cổ Từ Khí Khẩu (Ciqikou)",
            place_zh: "磁器口古镇",
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
                dish_name_vn: "Mao Huyết Vượng (Mậu Trang Cổ Trấn)",
                dish_name_zh: "茂庄古镇第一家毛血旺",
                google_img_keyword: "重庆毛血旺",
                baidu_img_keyword: "磁器口毛血旺",
                restaurant: {
                  name_vn: "Mậu Trang Cổ Trấn Đệ Nhất Quán (Từ Khí Khẩu)",
                  name_zh: "茂庄古镇第一家毛血旺 (总店)",
                  address_hint: "Số 74 đường Chính Phố Cổ Từ Khí Khẩu, quận Sa Bình Bá",
                  amap_query: "茂庄古镇第一家毛血旺 磁器口",
                  price_range: "~45 - 75 ¥/người",
                  rating: "4.8★ (Đặc sản Từ Khí Khẩu)",
                  recommended_dish: "Thố lớn Mao Huyết Vượng (tiết vịt, lòng non, giăm bông, lươn)",
                  note: "Món ăn cay tê đỏ rực chuẩn vị Trùng Khánh cổ điển, cực kỳ tốn cơm trắng."
                }
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 17:30",
            activity_title: "Ga tàu xuyên tòa nhà Lý Tử Bá & Cáp treo Sông Dương Tử",
            description: "Đi Metro Line 2 ngắm khoảnh khắc đoàn tàu lao xuyên qua lòng tòa nhà chung cư tại ga Lý Tử Bá. Trải nghiệm Cáp treo vượt sông Dương Tử ngắm toàn cảnh thành phố thẳng đứng.",
            place_name: "Ga Lý Tử Bá & Cáp treo Dương Tử",
            place_zh: "李子坝单轨站",
            amap_query: "李子坝观景平台",
            transport_hint: "Metro Line 2 & Cáp treo vượt sông Yangtze River Cableway",
            ticket_hint: "Vé cáp treo sông Dương Tử ~20 RMB một chiều",
            duration_hint: "4 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 21:30",
            activity_title: "Hồng Nhai Động lên đèn & Đại tiệc Lẩu cay Trùng Khánh",
            description: "Chiêm ngưỡng quần thể nhà sàn 11 tầng lộng lẫy tại Hồng Nhai Động tựa phim Spirited Away. Thưởng thức đại tiệc lẩu cay chuẩn vị tại Lẩu Bội Tỷ hoặc Lẩu Chu Sư Huynh.",
            place_name: "Hồng Nhai Động (Hongyadong)",
            place_zh: "洪崖洞民俗风貌区",
            amap_query: "洪崖洞民俗风貌区",
            transport_hint: "Đi bộ 10 phút từ Giải Phóng Bối",
            tips: "Góc ngắm Hồng Nhai Động trọn vẹn nhất là đứng từ trên cầu Thiên Môn hoặc bờ đối diện.",
            dishes: [
              {
                dish_name_vn: "Lẩu cay mỡ bò Trùng Khánh (Lẩu Bội Tỷ / Chu Sư Huynh)",
                dish_name_zh: "佩姐老火锅 / 周师兄老火锅",
                google_img_keyword: "重庆老火锅 九宫格",
                baidu_img_keyword: "重庆佩姐老火锅",
                restaurant: {
                  name_vn: "Lẩu Chu Sư Huynh Cửu Cung Cách (Gần Hồng Nhai Động)",
                  name_zh: "周师兄重庆老火锅 (解放碑/洪崖洞店)",
                  address_hint: "Tầng 3, Minzu Road Plaza, cạnh phố đi bộ Giải Phóng Bi",
                  amap_query: "周师兄火锅 解放碑",
                  price_range: "~85 - 120 ¥/người",
                  rating: "4.9★ (Di sản phi vật thể ẩm thực)",
                  recommended_dish: "Nồi lẩu 9 ô (ngưu bách diệp giòn, thăn bò ớt tươi, tôm nghiền nấm)",
                  note: "Nước dùng mỡ bò nguyên chất nấu thảo dược, phục vụ trà hoa cúc giải cay mát gan."
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
        title: "Bảo Tàng Tam Hiệp – Bạch Tượng Cư – Du Thuyền Đêm Triều Thiên Môn",
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
            description: "Tham quan Bảo tàng Tam Hiệp tìm hiểu lịch sử đập thủy điện và văn hóa Ba Thục, ngắm kiến trúc mái vòm Đại lễ đường Nhân dân đối diện.",
            place_name: "Bảo tàng Tam Hiệp",
            place_zh: "重庆中国三峡博物馆",
            amap_query: "重庆中国三峡博物馆",
            transport_hint: "Metro Line 2 ga Zengjiayan",
            duration_hint: "3 tiếng",
            dishes: [
              {
                dish_name_vn: "Mì Tiểu Diện Trùng Khánh (Bàn Muội Diện Trang - Michelin Bib)",
                dish_name_zh: "胖妹面庄 重庆小面",
                google_img_keyword: "重庆小面 胖妹面庄",
                baidu_img_keyword: "胖妹面庄 重庆小面",
                restaurant: {
                  name_vn: "Bàn Muội Diện Trang (Michelin Bib Gourmand)",
                  name_zh: "胖妹面庄 (两路口总店)",
                  address_hint: "Số 139 đường Trung Sơn Tam Lộ, Lưỡng Lộ Khẩu, quận Du Trung",
                  amap_query: "胖妹面庄 两路口",
                  price_range: "~18 - 30 ¥/bát",
                  rating: "4.8★ (Michelin Guide gợi ý)",
                  recommended_dish: "Mì thịt bò hầm tương & Mì lòng non cay tê béo ngậy",
                  note: "Quán mì nổi tiếng hàng chục năm, sợi mì ngập trong dầu ớt thơm cay đậm đà."
                }
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 17:30",
            activity_title: "Bạch Tượng Cư 24 tầng & Quảng trường Triều Thiên Môn",
            description: "Dạo ngõ dốc chung cư 24 tầng không thang máy Bạch Tượng Cư ngắm cáp treo lướt ngang qua đầu. Đến Quảng trường Triều Thiên Môn ngắm ngã ba sông Dương Tử và Gia Lăng bên tổ hợp Raffles City.",
            place_name: "Bạch Tượng Cư & Triều Thiên Môn",
            place_zh: "白象居",
            amap_query: "白象居",
            transport_hint: "Đi bộ dạo ngõ dốc hoặc Metro Line 1 ga Chaotianmen",
            duration_hint: "4 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:30 - 21:30",
            activity_title: "Thưởng thức Gà Cay Trùng Khánh & Du thuyền ngắm Cyberpunk",
            description: "Ăn tối gà cay ngập trong ớt khô và hạt hoa tiêu tại Dân Gian Lương Thương. Lên du thuyền đêm sông Dương Tử chiêm ngưỡng đường chân trời cyberpunk rực rỡ.",
            place_name: "Du thuyền Triều Thiên Môn",
            place_zh: "朝天门两江游船",
            amap_query: "朝天门码头",
            ticket_hint: "Vé du thuyền đêm Lưỡng Giang ~150 RMB",
            dishes: [
              {
                dish_name_vn: "Gà cay Trùng Khánh (Là Tử Kê)",
                dish_name_zh: "重庆辣子鸡",
                google_img_keyword: "重庆辣子鸡",
                baidu_img_keyword: "重庆传统辣子鸡"
              }
            ]
          }
        ]
      },
      {
        day_number: 9,
        date: "Chủ Nhật, 22/11/2026",
        city: "Trùng Khánh & Đại Túc (Dazu - 大足)",
        title: "Day-trip Di Sản Thế Giới Đại Túc Thạch Khắc (Bảo Đỉnh Sơn & Bắc Sơn)",
        hotel: {
          name_vn: "SENSE SCENE Sanshi Senyin Hotel (Tam Thời Sâm Ấn - Giải Phóng Bối)",
          name_zh: "三时森印酒店（重庆解放碑步行街洪崖洞店）",
          address: "Tầng 12, Tòa A, Dushi Plaza, Giải Phóng Bối, quận Du Trung, Trùng Khánh",
          phone: "+86-23-68711888"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "08:00 - 12:00",
            activity_title: "Chiêm ngưỡng Đại Túc Thạch Khắc – Tượng Phật Nằm 31m",
            description: "Di chuyển bằng xe buýt du lịch trực tiếp hoặc tàu cao tốc đến huyện Đại Túc. Chiêm ngưỡng Di sản Thế giới Đại Túc Thạch Khắc tại Bảo Đỉnh Sơn: Tượng Phật Thích Ca Nhập Niết Bàn dài 31m và tượng Phật Bà Quan Âm Nghìn Mắt Nghìn Tay mạ vàng tinh xảo.",
            place_name: "Đại Túc Thạch Khắc (Bảo Đỉnh Sơn)",
            place_zh: "大足石刻宝顶山景区",
            amap_query: "大足石刻宝顶山景区",
            transport_hint: "Xe du lịch trực tiếp đón tại Giải Phóng Bối hoặc tàu Gaotie đến Ga Đại Túc Nam",
            ticket_hint: "Vé trọn gói Bảo Đỉnh Sơn & Bắc Sơn ~140 RMB",
            duration_hint: "4 tiếng",
            dishes: [
              {
                dish_name_vn: "Cá diếc Bưu Đình om tương cay ngọt Đại Túc",
                dish_name_zh: "大足邮亭鲫鱼",
                google_img_keyword: "邮亭鲫鱼",
                baidu_img_keyword: "大足邮亭鲫鱼"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 16:30",
            activity_title: "Bảo tàng Thạch khắc & Cụm chạm khắc vách đá Bắc Sơn",
            description: "Tham quan Bảo tàng Thạch khắc Đại Túc và cụm vách đá Bắc Sơn với hàng nghìn tượng Phật chạm khắc tinh xảo từ thời Đường - Tống.",
            place_name: "Đại Túc Thạch Khắc (Bắc Sơn)",
            place_zh: "大足北山石刻",
            amap_query: "大足北山石刻",
            duration_hint: "3 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 21:00",
            activity_title: "Lẩu xiên que Trùng Khánh & Chuẩn bị sang Thành Đô",
            description: "Quay về trung tâm Trùng Khánh. Thưởng thức lẩu xiên que tại tiệm Cương Quản Xưởng hoặc Lý Xuyến Xuyến. Đóng gói hành lý chuẩn bị sang Tứ Xuyên sáng mai.",
            place_name: "Lẩu xiên que Giải Phóng Bối",
            place_zh: "重庆串串香",
            amap_query: "钢管厂五区小郡肝串串香",
            dishes: [
              {
                dish_name_vn: "Lẩu xiên que Trùng Khánh (Xuyến Xuyến Hương)",
                dish_name_zh: "重庆串串香",
                google_img_keyword: "重庆串串香",
                baidu_img_keyword: "小郡肝串串香"
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
            description: "Trả phòng khách sạn, đón tàu cao tốc G8608 (09:13 - 10:17) sang ga Thành Đô Đông. Đi Metro Line 2 về nhận phòng tại Mercure Chengdu Chunxi Road Tianfu Square.",
            place_name: "Ga Thành Đô Đông – Quảng trường Thiên Phủ",
            place_zh: "成都东站",
            amap_query: "成都春熙路美居酒店",
            transport_hint: "Tàu cao tốc G8608 (1h 04m); Metro Line 2 về Tianfu Square",
            transport_detail: {
              mode: "train",
              train_number: "G8608",
              train_departure_station_vn: "Ga Trùng Khánh Bắc",
              train_departure_station_zh: "重庆北站",
              train_arrival_station_vn: "Ga Thành Đô Đông",
              train_arrival_station_zh: "成都东站",
              train_duration: "1h 04m",
              summary: "Tàu cao tốc G8608 (09:13 - 10:17) từ Trùng Khánh Bắc sang Thành Đô Đông",
            },
            duration_hint: "3.5 tiếng",
            dishes: [
              {
                dish_name_vn: "Mì ngọt Điềm Thủy Diện (Động Tử Khẩu Trương Lão Nhị)",
                dish_name_zh: "洞子口张老二 甜水面",
                google_img_keyword: "成都甜水面",
                baidu_img_keyword: "洞子口张老二甜水面"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "14:00 - 17:30",
            activity_title: "Tu viện Văn Thù & Thưởng trà vườn thiền",
            description: "Dạo Quảng trường Thiên Phủ. Viếng thăm Tu viện Văn Thù thanh tịnh nghìn năm tuổi, thưởng trà xanh nhài dưới bóng cây cổ thụ trong vườn thiền.",
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
              summary: "Đón Metro Line 1 hướng Viêm Bắc ra ga Wenshu Monastery",
            },
            ticket_hint: "Miễn phí vé vào cửa Tu viện Văn Thù (Quét mã WeChat tại cổng)",
            duration_hint: "3.5 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 21:30",
            activity_title: "Check-in Gấu Trúc IFS, Phố Xuân Hy & Ăn tối Mã Vượng Tử",
            description: "Dạo phố đi bộ Xuân Hy, check-in chú gấu trúc trèo tường khổng lồ trên nóc tòa nhà IFS. Khám phá tổ hợp Thái Cổ Lý. Ăn tối tại nhà hàng Michelin Mã Vượng Tử (từ 1923).",
            place_name: "Gấu trúc trèo tường IFS & Phố Xuân Hy",
            place_zh: "春熙路 / 成都IFS",
            amap_query: "成都IFS国际金融中心",
            transport_hint: "Metro Line 2/3 ga Chunxi Road",
            dishes: [
              {
                dish_name_vn: "Vịt quay da giòn & Tiết om cay (Mã Vượng Tử Michelin)",
                dish_name_zh: "马旺子·川小馆",
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
        title: "Cơ Sở Gấu Trúc Khổng Lồ – Bảo Tàng Thành Đô – Show Xuyên Kịch Biến Mặt",
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
            activity_title: "Thăm các bạn Gấu Trúc Khổng Lồ tại Panda Base",
            description: "Đến sớm tại Cơ sở Nghiên cứu Gấu Trúc Khổng Lồ Thành Đô để ngắm các bạn gấu trúc ăn tre và vận động buổi sáng trước khi đi ngủ trưa.",
            place_name: "Cơ sở Gấu Trúc Khổng Lồ Thành Đô (Panda Base)",
            place_zh: "成都大熊猫繁育研究基地",
            amap_query: "成都大熊猫繁育研究基地南门",
            transport_hint: "Metro Line 3 ga Panda Avenue đổi xe buýt trung chuyển",
            ticket_hint: "Vé tham quan ~55 RMB (đặt trước qua WeChat)",
            duration_hint: "4.5 tiếng",
            tips: "Nên có mặt trước 08:00 sáng để thấy gấu trúc hoạt động nhiều nhất.",
            dishes: [
              {
                dish_name_vn: "Bò hầm thố đất tiêu đen (Đào Đức Sa Nồi)",
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
            description: "Khám phá Bảo tàng Thành Đô hiện đại, ngắm cổ vật Ba Thục, đồ gốm sứ và bộ sưu tập múa rối bóng da truyền thống Tứ Xuyên.",
            place_name: "Bảo tàng Thành Đô",
            place_zh: "成都博物馆",
            amap_query: "成都博物馆",
            transport_hint: "Metro Line 1/2 ga Tianfu Square",
            duration_hint: "3.5 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "17:30 - 21:30",
            activity_title: "Đậu phụ Trần Ma Bà & Thưởng thức Show Xuyên Kịch Biến Mặt",
            description: "Ăn tối tại quán gốc Trần Ma Bà Đậu Hũ (từ năm 1862). 19:30 xem show diễn Xuyên Kịch (Sichuan Opera) huyền thoại với màn Biến Mặt và phun lửa đỉnh cao.",
            place_name: "Trần Ma Bà Đậu Hũ & Nhà hát Xuyên Kịch",
            place_zh: "陈麻婆豆腐 / 蜀风雅韵剧院",
            amap_query: "陈麻婆豆腐旗舰店",
            ticket_hint: "Vé show Xuyên Kịch Biến Mặt ~180 RMB",
            dishes: [
              {
                dish_name_vn: "Đậu phụ Ma Bà chuẩn vị gốc (Trần Ma Bà)",
                dish_name_zh: "陈麻婆豆腐",
                google_img_keyword: "陈麻婆豆腐",
                baidu_img_keyword: "正宗陈麻婆豆腐",
                restaurant: {
                  name_vn: "Trần Ma Bà Đậu Phụ (Cơ sở旗舰店 / Lâu năm từ 1862)",
                  name_zh: "陈麻婆豆腐 (旗舰店)",
                  address_hint: "Số 197 đường Thanh Hoa, quận Thanh Dương, Thành Đô",
                  amap_query: "陈麻婆豆腐旗舰店",
                  price_range: "~50 - 80 ¥/người",
                  rating: "4.8★ (Thủy tổ Đậu phụ Tứ Xuyên)",
                  recommended_dish: "Đậu phụ Ma Bà tê cay nồng & Thịt bò lát mỏng luộc cay (Thủy Chử Ngưu Nhục)",
                  note: "Món đậu hũ mướt mịn cay tê từ tiêu Hán Nguyên và sốt tương Pixian trứ danh."
                }
              },
              {
                dish_name_vn: "Gà xào hạt đậu phộng Cung Bảo",
                dish_name_zh: "宫保鸡丁",
                google_img_keyword: "川味宫保鸡丁",
                baidu_img_keyword: "四川宫保鸡丁"
              }
            ]
          }
        ]
      },
      {
        day_number: 12,
        date: "Thứ Tư, 25/11/2026",
        city: "Thành Đô (Chengdu - 成都)",
        title: "Đỗ Phủ Thảo Đường – Bảo Tàng Tứ Xuyên – Khám Phá Ngõ Rộng Ngõ Hẹp",
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
            activity_title: "Thăm Đỗ Phủ Thảo Đường & Bảo tàng Tứ Xuyên",
            description: "Dạo bước giữa rừng trúc xanh và mái nhà tranh thanh bình của thi thánh Đỗ Phủ. Ghé tham quan Bảo tàng tỉnh Tứ Xuyên kế bên.",
            place_name: "Đỗ Phủ Thảo Đường",
            place_zh: "成都杜甫草堂博物馆",
            amap_query: "杜甫草堂",
            transport_hint: "Metro Line 4 ga Caotang Road North",
            duration_hint: "3.5 tiếng"
          },
          {
            time_slot: "Chiều",
            time_range: "14:00 - 18:00",
            activity_title: "Ngõ Rộng Ngõ Hẹp (Kuanzhai Alley) kiến trúc Tứ hợp viện",
            description: "Khám phá quần thể ngõ cổ Kuanzhai Alley thời nhà Thanh. Trải nghiệm lấy ráy tai trà đạo truyền thống, ngắm nghía các tiệm thủ công mỹ nghệ.",
            place_name: "Ngõ Rộng Ngõ Hẹp (Kuanzhai Alley)",
            place_zh: "宽窄巷子",
            amap_query: "宽窄巷子",
            transport_hint: "Metro Line 4 ga Kuanzhaixiangzi",
            duration_hint: "4 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 21:00",
            activity_title: "Food-tour món ăn vặt đường phố Thành Đô",
            description: "Thưởng thức bánh đường ném Ba Tiếng Pháo (San Da Pao), sủi cảo Chung Thủy Giảo ngập sốt cay ngọt và mì gánh Dan Dan trứ danh.",
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
              }
            ]
          }
        ]
      },
      {
        day_number: 13,
        date: "Thứ Năm, 26/11/2026",
        city: "Đô Giang Yển & Núi Thanh Thành (Dujiangyan - 都江堰)",
        title: "Núi Thanh Thành Đạo Giáo & Thủy Lợi Đô Giang Yển – Cầu Nam Kiều Blue Tear",
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
            description: "Đi tàu C-train từ ga Xipu đến chân Núi Thanh Thành. Đi cáp treo lên Thượng Thanh Cung dạo bước giữa rừng cây xanh mát u tịch.",
            place_name: "Núi Thanh Thành (Mount Qingcheng)",
            place_zh: "青城山前山景区",
            amap_query: "青城山前山景区",
            transport_hint: "Metro Line 2 ra ga Xipu đổi tàu C-train (~30 phút) đến ga Qingchengtrail",
            ticket_hint: "Vé Núi Thanh Thành ~80 RMB",
            duration_hint: "4.5 tiếng",
            dishes: [
              {
                dish_name_vn: "Thịt lợn muối hun khói lá thông Thanh Thành Sơn",
                dish_name_zh: "青城山老腊肉",
                google_img_keyword: "青城山老腊肉",
                baidu_img_keyword: "青城山特色老腊肉"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 17:30",
            activity_title: "Công trình Thủy lợi Đô Giang Yển hơn 2.200 năm tuổi",
            description: "Bắt taxi sang Công trình Thủy Lợi Đô Giang Yển do Lý Băng xây dựng từ năm 256 TCN: ngắm đập phân dòng Mỏ Cá (Yuzui), Miệng Bình Bảo và Cầu treo An Lan.",
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
            activity_title: "Ánh sáng xanh Blue Tear tại Cầu Nam Kiều & Về lại Thành Đô",
            description: "Chiêm ngưỡng hiện tượng ánh sáng xanh Blue Tear huyền ảo dưới chân Cầu Nam Kiều từ 18:00 - 19:30. Ăn cá nướng thảo mộc bên bờ sông rồi ra ga Lidui Park đón tàu C-train về lại Thành Đô.",
            place_name: "Cầu Nam Kiều (Nanqiao Bridge)",
            place_zh: "都江堰南桥",
            amap_query: "都江堰南桥",
            transport_hint: "Đi bộ 10 phút từ Cầu Nam Kiều ra ga Lidui Park đón tàu C-train về ga Xipu",
            dishes: [
              {
                dish_name_vn: "Cá nướng thảo mộc cay Nam Kiều Mân Giang",
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
        title: "Du Thuyền Ngắm Lạc Sơn Đại Phật 71m – Suối Khoáng Nóng Nga Mi Sơn",
        hotel: {
          name_vn: "Emei Mountain and Courtyard. Jingzhu Shiguang Hot Spring Hotel",
          name_zh: "峨眉山院子·静竹时光温泉酒店",
          address: "Số 1, Viện 1, Khu văn hóa Nga Mi Sơn Viện Tử, Nam đoạn đường Danh Sơn, Nga Mi Sơn",
          phone: "+86-833-5591999"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "07:30 - 12:30",
            activity_title: "Du thuyền ngắm Đại Tượng Lạc Sơn Đại Phật cao 71m",
            description: "Gửi vali lớn tại Mercure Thành Đô, mang balo nhỏ ra ga đón tàu cao tốc đi ga Lạc Sơn (~50 phút). Đến bến thuyền Bát Tiên Động mua vé du thuyền ngắm trọn vẹn Lạc Sơn Đại Phật tạc vào vách đá ngắm nhìn ba con sông hội tụ.",
            place_name: "Lạc Sơn Đại Phật (Leshan Giant Buddha)",
            place_zh: "乐山大佛景区",
            amap_query: "乐山大佛八仙洞游船码头",
            transport_hint: "Tàu cao tốc Thành Đô Đông - Lạc Sơn (50 phút); Taxi ra bến thuyền",
            ticket_hint: "Vé du thuyền ngắm Phật ~70 RMB",
            duration_hint: "5 tiếng",
            dishes: [
              {
                dish_name_vn: "Vịt da ngọt Lạc Sơn (Kỷ Lục Muội)",
                dish_name_zh: "纪六妹甜皮鸭",
                google_img_keyword: "乐山甜皮鸭",
                baidu_img_keyword: "乐山纪六妹甜皮鸭"
              },
              {
                dish_name_vn: "Thịt bò thố nhúng Kiều Cước thanh ngọt",
                dish_name_zh: "跷脚牛肉",
                google_img_keyword: "乐山跷脚牛肉",
                baidu_img_keyword: "乐山跷脚牛肉"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 17:30",
            activity_title: "Sang Ga Nga Mi Sơn, Nhận phòng Suối nước nóng & Viếng Chùa Báo Quốc",
            description: "Đón tàu cao tốc 15 phút từ Lạc Sơn sang ga Nga Mi Sơn. Nhận phòng resort suối khoáng nóng Jingzhu Shiguang. Tản bộ vãng cảnh Chùa Báo Quốc và Chùa Phục Hổ cổ kính giữa rừng đại ngàn.",
            place_name: "Chùa Báo Quốc & Nga Mi Sơn Viện Tử",
            place_zh: "峨眉山报国寺",
            amap_query: "峨眉山报国寺",
            transport_hint: "Tàu cao tốc 15 phút từ ga Leshan sang ga Emeishan; Taxi 5 phút về khách sạn",
            duration_hint: "4 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:00 - 21:00",
            activity_title: "Ngâm suối khoáng nóng sân vườn & Ẩm thực Nga Mi",
            description: "Thư giãn ngâm mình trong bể khoáng nóng sân vườn lộ thiên giữa rặng trúc xanh mát. Thưởng thức vịt kho nấm tuyết phơi sương, súp đậu hũ nẫu Nga Mi.",
            place_name: "Resort Suối khoáng nóng Tĩnh Trúc Thời Quang",
            place_zh: "峨眉山院子·静竹时光温泉酒店",
            amap_query: "峨眉山院子·静竹时光温泉酒店",
            dishes: [
              {
                dish_name_vn: "Vịt kho nấm tuyết Konjac phơi sương",
                dish_name_zh: "雪魔芋烧鸭",
                google_img_keyword: "峨眉山雪魔芋烧鸭",
                baidu_img_keyword: "雪魔芋烧鸭"
              }
            ]
          }
        ]
      },
      {
        day_number: 15,
        date: "Thứ Bảy, 28/11/2026",
        city: "Nga Mi Sơn & Thành Đô (Mount Emei - 峨眉山)",
        title: "Chinh Phục Đỉnh Tuyết Kim Đỉnh 3.077m – Tượng Phổ Hiền 48m – Về Thành Đô",
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
            activity_title: "Chinh phục Đỉnh Kim Đỉnh cao 3.077m & Chiêm bái Tượng Phổ Hiền 4 mặt 48m",
            description: "06:30 đón xe buýt từ Bến xe Hoàng Loan lên trạm Lôi Động Bình (1.5h). Đi bộ lên Tiếp Dẫn Điện, đi cáp treo lên đỉnh Kim Đỉnh. Chiêm bái bức Đại tượng Phổ Hiền Bồ Tát bằng đồng mạ vàng 4 mặt cao 48m uy nghiêm giữa biển mây và cảnh sắc sương tuyết đầu đông.",
            place_name: "Kim Đỉnh Núi Nga Mi (Golden Summit)",
            place_zh: "峨眉山金顶",
            amap_query: "峨眉山金顶",
            transport_hint: "Xe buýt sinh thái lên Leidongping + Cáp treo Kim Đỉnh Cableway",
            ticket_hint: "Vé cáp treo Kim Đỉnh khứ hồi ~120 RMB",
            duration_hint: "6 tiếng",
            tips: "Đỉnh núi cao 3.077m cuối tháng 11 có tuyết âm độ C, nhớ mang áo ấm dày, mũ len và găng tay."
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 18:00",
            activity_title: "Xuống núi & Tàu cao tốc về lại khách sạn Mercure Thành Đô",
            description: "Đi cáp treo và xe buýt trở về chân núi. Lấy đồ tại khách sạn, ra ga Nga Mi Sơn đón tàu cao tốc về lại ga Thành Đô Đông (~1h 15m). Về nhận lại phòng và vali tại khách sạn Mercure.",
            place_name: "Ga Nga Mi Sơn – Ga Thành Đô Đông",
            place_zh: "峨眉山站",
            amap_query: "峨眉山站",
            transport_hint: "Tàu cao tốc liên đô thị Nga Mi Sơn - Thành Đô Đông (1h 15m)",
            duration_hint: "4 tiếng"
          },
          {
            time_slot: "Tối",
            time_range: "18:30 - 21:30",
            activity_title: "Đại tiệc lẩu chia tay Tứ Xuyên tại Lẩu Đại Long Diễm",
            description: "Đại tiệc lẩu chia tay Tứ Xuyên tại Lẩu Đại Long Diễm: lẩu uyên ương nấm và mỡ bò cay tê, nhúng thịt bò lát ớt tuyết, cuống họng heo và tôm phết ngọc bích.",
            place_name: "Lẩu Đại Long Diễm (Chunxi Road)",
            place_zh: "大龙燚火锅",
            amap_query: "大龙燚火锅春熙路店",
            dishes: [
              {
                dish_name_vn: "Lẩu mỡ bò cay tê Tứ Xuyên (Đại Long Diễm)",
                dish_name_zh: "大龙燚老火锅",
                google_img_keyword: "大龙燚火锅",
                baidu_img_keyword: "大龙燚火锅 成都"
              }
            ]
          }
        ]
      },
      {
        day_number: 16,
        date: "Chủ Nhật, 29/11/2026",
        city: "Thành Đô (Chengdu) – TP.HCM",
        title: "Công Viên Nhân Dân Trà Đạo – Mua Sắm Taikoo Li – Bay Thẳng về Tân Sơn Nhất",
        events: [
          {
            time_slot: "Sáng",
            time_range: "09:00 - 12:00",
            activity_title: "Thưởng trà hoa nhài tại Hạc Minh Trà Quán 100 năm tuổi",
            description: "Dạo bước tại Công viên Nhân Dân hòa mình vào nhịp sống chậm của người Thành Đô. Ngồi tại Hạc Minh Trà Quán hơn 100 năm tuổi ven hồ thưởng trà hoa nhài nắp đậy cái oản, cắn hạt dưa ngũ vị và mì gánh Dan Dan.",
            place_name: "Công viên Nhân Dân & Hạc Minh Trà Quán",
            place_zh: "人民公园鹤鸣茶社",
            amap_query: "人民公园鹤鸣茶社",
            transport_hint: "Metro Line 2 ga People's Park",
            duration_hint: "3 tiếng",
            dishes: [
              {
                dish_name_vn: "Trà hoa nhài nắp đậy cái oản (Gaiwan Tea)",
                dish_name_zh: "盖碗茉莉花茶",
                google_img_keyword: "鹤鸣茶社 盖碗茶",
                baidu_img_keyword: "鹤鸣茶社 盖碗茶"
              },
              {
                dish_name_vn: "Mì gánh Dan Dan Tứ Xuyên",
                dish_name_zh: "担担面",
                google_img_keyword: "四川担担面",
                baidu_img_keyword: "正宗四川担担面"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "12:30 - 17:30",
            activity_title: "Mua quà đặc sản Taikoo Li & Metro Line 18 ra Sân bay Thiên Phủ (TFU)",
            description: "Mua trà xanh Nga Mi, gói cốt lẩu cay, quà lưu niệm gấu trúc. Ăn trưa hoành thánh cay Long Sao Thủ tại Taikoo Li. 16:15 lấy hành lý tại Mercure, đi Metro Line 1 đổi sang Metro Line 18 (chuyến Express) đi thẳng ra Sân bay Quốc tế Thiên Phủ (TFU T1). 17:30 có mặt làm thủ tục xuất cảnh.",
            place_name: "Sân bay Quốc tế Thiên Phủ Thành Đô (TFU)",
            place_zh: "成都天府国际机场",
            amap_query: "成都天府国际机场T1",
            transport_hint: "Metro Line 18 tàu nhanh Express (khoảng 38-45 phút) từ ga Nam Thành Đô ra TFU",
            duration_hint: "5 tiếng",
            dishes: [
              {
                dish_name_vn: "Hoành thánh cay sốt dầu ớt (Long Sao Thủ)",
                dish_name_zh: "龙抄手",
                google_img_keyword: "成都龙抄手",
                baidu_img_keyword: "成都老字号龙抄手"
              }
            ]
          },
          {
            time_slot: "Tối",
            time_range: "20:30 - 23:15",
            activity_title: "Chuyến bay Sichuan Airlines 3U3903 về lại TP.HCM",
            description: "20:30 cất cánh chuyến bay Sichuan Airlines 3U3903 từ Thiên Phủ T1 về TP.HCM. 23:15 hạ cánh an toàn tại Tân Sơn Nhất (SGN T2). Kết thúc trọn vẹn hành trình 16 ngày 15 đêm tuyệt đẹp!",
            place_name: "Sân bay Quốc tế Tân Sơn Nhất (TP.HCM)",
            place_zh: "胡志明市新山一国际机场",
            amap_query: "成都天府国际机场T1",
            transport_hint: "Chuyến bay thẳng Sichuan Airlines 3U3903 (20:30 - 23:15)",
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
