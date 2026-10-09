import { TripDocument } from "../types/itinerary";

export const SAMPLE_TRIPS: TripDocument[] = [
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
              },
              {
                dish_name_vn: "Mì tương đen Bắc Kinh (Zhajianmian)",
                dish_name_zh: "老北京炸酱面",
                google_img_keyword: "老北京炸酱面",
                baidu_img_keyword: "老北京炸酱面 特色"
              }
            ]
          },
          {
            time_slot: "Tối",
            time_range: "18:30 - 21:30",
            activity_title: "Phố đi bộ Vương Phủ Tỉnh & Thưởng thức trà chiều cung đình",
            description: "Phố đi bộ mua sắm sôi động nhất Bắc Kinh với trung tâm thương mại APM và phố ẩm thực hẻm Hepingguo tái hiện Bắc Kinh thập niên 80.",
            place_name: "Phố đi bộ Vương Phủ Tỉnh",
            place_zh: "王府井步行街",
            amap_query: "王府井步行街",
            tips: "Dùng Alipay quét mã 'Beijing Metro' đi tàu điện ngầm tuyến 1 hoặc 8 tới ga Wangfujing rất tiện lợi.",
            dishes: [
              {
                dish_name_vn: "Kẹo hồ lô ngào đường",
                dish_name_zh: "冰糖葫芦",
                google_img_keyword: "北京冰糖葫芦",
                baidu_img_keyword: "老北京冰糖葫芦"
              }
            ]
          }
        ]
      },
      {
        day_number: 2,
        date: "Ngày 2: Bắc Kinh",
        city: "Bắc Kinh (Beijing - 北京)",
        title: "Kỳ quan Vạn Lý Trường Thành Bát Đạt Lĩnh & Di Hòa Viên Thơ Mộng",
        hotel: {
          name_vn: "Khách sạn Vương Phủ Tỉnh Bắc Kinh",
          name_zh: "北京王府井希尔顿酒店",
          address: "北京市东城区王府井东街8号",
          phone: "+86 10 5812 8888"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "07:30 - 12:00",
            activity_title: "Chinh phục Vạn Lý Trường Thành Bát Đạt Lĩnh",
            description: "Đi tàu cao tốc đường sắt ngoại ô S2 hoặc tuyến Thanh Hà - Bát Đạt Lĩnh (20 phút), đi cáp treo lên tháp Bắc 8 chụp ảnh vĩ đại.",
            place_name: "Vạn Lý Trường Thành Bát Đạt Lĩnh",
            place_zh: "八达岭长城",
            amap_query: "八达岭长城景区缆车",
            tips: "Nên mang giày thể thao bám dốc tốt, áo gió. Tải app 12306 mua vé tàu cao tốc ga Bắc Kinh Bắc đến Bát Đạt Lĩnh.",
            dishes: [
              {
                dish_name_vn: "Lẩu cừu nhúng nồi đồng (Đông Lai Thuận)",
                dish_name_zh: "东来顺涮羊肉",
                google_img_keyword: "东来顺 铜锅涮肉",
                baidu_img_keyword: "老北京铜锅涮羊肉"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "14:00 - 17:30",
            activity_title: "Dạo thuyền Hồ Côn Minh & Cung điện Mùa Hè Di Hòa Viên",
            description: "Thăm cung điện mùa hè của Từ Hy Thái Hậu, dạo Trường Lang dài nhất thế giới, chiêm ngưỡng thuyền đá Thanh Yến Phảng.",
            place_name: "Cung điện Di Hòa Viên",
            place_zh: "颐和园",
            amap_query: "颐和园东宫门",
            tips: "Vào từ Đông Cung Môn (East Gate), đi dọc hành lang dài và ra bằng cổng Bắc Cung Môn gần ga tàu điện ngầm.",
            dishes: [
              {
                dish_name_vn: "Bánh hoa quế hồ lô",
                dish_name_zh: "桂花糕",
                google_img_keyword: "北京桂花糕",
                baidu_img_keyword: "传统桂花糕"
              }
            ]
          },
          {
            time_slot: "Tối",
            time_range: "18:30 - 21:00",
            activity_title: "Check-in Sân vận động Tổ Chim & Thủy Lập Phương rực rỡ ánh đèn",
            description: "Quần thể công viên Olympic Bắc Kinh lung linh khi lên đèn, địa điểm chụp ảnh check-in kiến trúc hiện đại hàng đầu.",
            place_name: "Sân vận động Quốc gia Tổ Chim",
            place_zh: "国家体育场(鸟巢)",
            amap_query: "国家体育场鸟巢",
            tips: "Buổi tối lên đèn từ 19:00 - 22:00, gió khá mát, thích hợp đi dạo.",
            dishes: []
          }
        ]
      },
      {
        day_number: 3,
        date: "Ngày 3: Bắc Kinh -> Thượng Hải",
        city: "Thượng Hải (Shanghai - 上海)",
        title: "Tàu cao tốc Fuxing 350km/h & Check-in Bến Thượng Hải lung linh",
        hotel: {
          name_vn: "Khách sạn Radisson Blu Thượng Hải New World",
          name_zh: "上海新世界丽笙大酒店",
          address: "上海市黄浦区南京西路88号 (Số 88 Đường Tây Nam Kinh, Hoàng Phố, Thượng Hải)",
          phone: "+86 21 6359 9999"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "08:00 - 12:30",
            activity_title: "Trải nghiệm tàu viên đạn Phục Hưng Bắc Kinh Nam - Thượng Hải Hồng Kiều",
            description: "Chặng đường 1318 km chỉ mất 4 tiếng 18 phút trên con tàu cao tốc hiện đại bậc nhất thế giới.",
            place_name: "Ga tàu cao tốc Thượng Hải Hồng Kiều",
            place_zh: "上海虹桥站",
            amap_query: "上海虹桥火车站",
            tips: "Có thể mang đồ ăn lên tàu. Ổ cắm sạc điện thoại và wifi miễn phí sẵn sàng trên toàn bộ khoang tàu.",
            dishes: [
              {
                dish_name_vn: "Cơm hộp bento tàu cao tốc Trung Quốc",
                dish_name_zh: "高铁盒饭",
                google_img_keyword: "中国高铁盒饭",
                baidu_img_keyword: "高铁订餐盒饭"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "14:30 - 17:30",
            activity_title: "Khám phá Dự Viên (Yuyuan Garden) & Phố cổ Thành Hoàng Miếu",
            description: "Khu vườn cổ truyền thống Giang Nam xây dựng từ thời Minh với đình tạ cầu đá chạm khắc tinh xảo và các hàng quán thủ công mỹ nghệ.",
            place_name: "Vườn Cổ Dự Viên",
            place_zh: "豫园",
            amap_query: "豫园",
            tips: "Nếm thử món Bánh bao súp Nanxiang Xiaolong nổi tiếng ngay trước cổng Cầu Cửu Khúc.",
            dishes: [
              {
                dish_name_vn: "Bánh bao súp Thượng Hải Nam Tường (Xiaolongbao)",
                dish_name_zh: "南翔小笼包",
                google_img_keyword: "南翔小笼馒头",
                baidu_img_keyword: "上海南翔小笼包"
              },
              {
                dish_name_vn: "Bánh bao chiên Sinh Tiễn Bao (Shengjianbao)",
                dish_name_zh: "生煎包",
                google_img_keyword: "生煎包 上海",
                baidu_img_keyword: "上海生煎包 大壶春"
              }
            ]
          },
          {
            time_slot: "Tối",
            time_range: "18:30 - 22:00",
            activity_title: "Ngắm Tháp Thượng Hải & Du thuyền đêm Bến Thượng Hải (The Bund)",
            description: "Đi dạo đại lộ Trung Sơn Đông ngắm những tòa nhà kiến trúc Gothic, Tân cổ điển đối diện toàn cảnh tài chính Phố Đông Lục Gia Chủy sáng rực.",
            place_name: "Bến Thượng Hải (The Bund)",
            place_zh: "上海外滩",
            amap_query: "上海外滩观景平台",
            tips: "Đèn bờ sông Phố Đông sẽ tắt đúng 22:00. Nên chụp ảnh lúc hoàng hôn chuyển giao (18:30 - 19:30) để có ảnh đẹp nhất.",
            dishes: [
              {
                dish_name_vn: "Trà sữa Hỷ Trà (Heytea) hoặc Bá Vương Trà Cơ (Chagee)",
                dish_name_zh: "霸王茶姬 / 喜茶",
                google_img_keyword: "霸王茶姬 伯牙绝弦",
                baidu_img_keyword: "霸王茶姬奶茶"
              }
            ]
          }
        ]
      },
      {
        day_number: 4,
        date: "Ngày 4: Thượng Hải -> Hàng Châu",
        city: "Hàng Châu (Hangzhou - 杭州)",
        title: "Thiên đường hạ giới Tây Hồ & Đồn điền Trà Long Tỉnh",
        hotel: {
          name_vn: "Khách sạn Grand Hyatt Hàng Châu bên bờ Tây Hồ",
          name_zh: "杭州君悦酒店",
          address: "杭州市上城区湖滨路28号 (Số 28 Đường Hồ Tân, Thượng Thành, Hàng Châu)",
          phone: "+86 571 8779 1234"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "08:30 - 11:30",
            activity_title: "Tàu cao tốc đi Hàng Châu & Du thuyền gỗ trên Tây Hồ",
            description: "Từ ga Thượng Hải Nam tới Hàng Châu Đông (45 phút). Đi thuyền gỗ ngắm Tam Đàn Ấn Nguyệt, Đoạn Kiều Tàn Tuyết, Tháp Lôi Phong.",
            place_name: "Tây Hồ Hàng Châu",
            place_zh: "杭州西湖风景名胜区",
            amap_query: "西湖游船码头",
            tips: "Có thể thuê xe đạp công cộng qua Alipay để đạp dạo bờ đê Tô Đê rợp bóng liễu rủ.",
            dishes: [
              {
                dish_name_vn: "Thịt kho Đông Pha (Dongpo Pork)",
                dish_name_zh: "东坡肉",
                google_img_keyword: "杭州东坡肉",
                baidu_img_keyword: "楼外楼东坡肉"
              },
              {
                dish_name_vn: "Cá chép Tây Hồ sốt dấm",
                dish_name_zh: "西湖醋鱼",
                google_img_keyword: "西湖醋鱼",
                baidu_img_keyword: "西湖醋鱼名菜"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "13:30 - 16:30",
            activity_title: "Thăm Làng Trà Long Tỉnh & Chùa Linh Ẩn cổ kính",
            description: "Dạo bước giữa đồi trà bạt ngàn của thôn Mai Gia Ổ, thưởng thức trà Long Tỉnh Tây Hồ chính gốc và viếng chùa Linh Ẩn thiêng liêng.",
            place_name: "Chùa Linh Ẩn Hàng Châu",
            place_zh: "杭州灵隐寺",
            amap_query: "灵隐飞来峰景区",
            tips: "Vé vào Phi Lai Phong mua riêng, sau đó vào chùa Linh Ẩn thắp 3 nén nhang cầu bình an.",
            dishes: [
              {
                dish_name_vn: "Tôm xào búp trà Long Tỉnh",
                dish_name_zh: "龙井虾仁",
                google_img_keyword: "龙井虾仁",
                baidu_img_keyword: "龙井虾仁 杭州菜"
              }
            ]
          },
          {
            time_slot: "Tối",
            time_range: "18:30 - 21:00",
            activity_title: "Xem show biểu diễn thực cảnh Ấn Tượng Tây Hồ (Trương Nghệ Mưu)",
            description: "Vũ kịch nước ngoạn mục dưới sự dàn dựng của đạo diễn Trương Nghệ Mưu ngay trên mặt nước Tây Hồ.",
            place_name: "Ấn Tượng Tây Hồ (Enduring Memories of Hangzhou)",
            place_zh: "最忆是杭州(印象西湖)",
            amap_query: "印象西湖演出剧场",
            tips: "Nên đặt vé trước tối thiểu 3 ngày vào mùa cao điểm du lịch.",
            dishes: []
          }
        ]
      }
    ]
  },
  {
    id: "sample_chongqing_chengdu_5d4n",
    trip_title: "Trùng Khánh 8D Kỳ Ảo & Thành Đô Xứ Sở Gấu Trúc",
    duration: "5 ngày 4 đêm",
    created_at: 1712100000000,
    days: [
      {
        day_number: 1,
        date: "Ngày 1: Trùng Khánh",
        city: "Trùng Khánh (Chongqing - 重庆)",
        title: "Thành phố Cyberpunk 8D: Tàu điện xuyên chung cư & Phố Hồng Nhai Động",
        hotel: {
          name_vn: "Khách sạn Giải Phóng Bi Trùng Khánh",
          name_zh: "重庆解放碑威斯汀酒店",
          address: "重庆市渝中区新华路222号 (Số 222 Đường Tân Hoa, Du Trung, Trùng Khánh)",
          phone: "+86 23 6380 6666"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "09:00 - 11:30",
            activity_title: "Ngắm trạm tàu điện ngầm Liziba xuyên qua tòa nhà chung cư 19 tầng",
            description: "Hiện tượng kiến trúc giao thông độc nhất vô nhị trên thế giới của tuyến đường sắt đơn nhẹ monorail số 2.",
            place_name: "Ga tàu điện Liziba",
            place_zh: "李子坝轻轨站",
            amap_query: "李子坝观景平台",
            tips: "Điểm chụp ảnh tốt nhất nằm ở đài quan sát tầng trệt phía đối diện đường ngắm tàu chui vào tòa nhà.",
            dishes: [
              {
                dish_name_vn: "Mì tiểu miến Trùng Khánh cay nồng",
                dish_name_zh: "重庆小面",
                google_img_keyword: "重庆小面 正宗",
                baidu_img_keyword: "重庆小面 特色"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "14:00 - 17:00",
            activity_title: "Đi Cáp treo vượt sông Trường Giang & Phố cổ Từ Khí Khẩu",
            description: "Bay lơ lửng trên dòng sông Trường Giang bằng cáp treo lịch sử, sau đó tới phố cổ Ciqikou mua kẹo kéo và ớt khô.",
            place_name: "Cáp treo Trường Giang",
            place_zh: "长江索道",
            amap_query: "长江索道新华路站",
            tips: "Có thể quét mã Alipay đi cáp treo hoặc đặt trước vé trực tuyến để tránh xếp hàng dài.",
            dishes: [
              {
                dish_name_vn: "Lẩu cay Trùng Khánh 9 ngăn (Cửu Cung Cách)",
                dish_name_zh: "九宫格老火锅",
                google_img_keyword: "重庆九宫格火锅",
                baidu_img_keyword: "老重庆九宫格牛油火锅"
              }
            ]
          },
          {
            time_slot: "Tối",
            time_range: "18:30 - 21:30",
            activity_title: "Khám phá Hồng Nhai Động (Hongyadong) - Vùng đất linh hồn ngoài đời thực",
            description: "Khu nhà sàn treo Điếu Cước Lâu 11 tầng bám vào sườn núi dựng đứng rực sáng vàng như cung điện Yubaba trong phim hoạt hình Ghibli.",
            place_name: "Hồng Nhai Động",
            place_zh: "洪崖洞民俗风貌区",
            amap_query: "洪崖洞民俗风貌区",
            tips: "Đứng trên cầu Thiên Tư Môn (Qiansimen Bridge) là góc chụp toàn cảnh Hồng Nhai Động rực sáng nhất.",
            dishes: [
              {
                dish_name_vn: "Bánh trôi nước đá sương sáo",
                dish_name_zh: "冰汤圆",
                google_img_keyword: "重庆冰汤圆",
                baidu_img_keyword: "重庆特色冰汤圆"
              }
            ]
          }
        ]
      },
      {
        day_number: 2,
        date: "Ngày 2: Trùng Khánh -> Thành Đô",
        city: "Thành Đô (Chengdu - 成都)",
        title: "Thủ phủ Tứ Xuyên: Gấu trúc khổng lồ & Nghệ thuật biến mặt Xuyên Kịch",
        hotel: {
          name_vn: "Khách sạn Grand Hyatt Thành Đô Phố Xuân Hy",
          name_zh: "成都群光君悦酒店",
          address: "成都市锦江区春熙路南段8号 (Số 8 Nam Đoạn Xuân Hy Lộ, Cẩm Giang, Thành Đô)",
          phone: "+86 28 6666 1234"
        },
        events: [
          {
            time_slot: "Sáng",
            time_range: "07:30 - 11:30",
            activity_title: "Ngắm những chú Gấu trúc tại Cơ sở nhân giống Gấu trúc Thành Đô",
            description: "Tận mắt thấy những em bé gấu trúc nhai lá trúc, lăn lộn chơi đùa trên bãi cỏ trong giờ ăn sáng hoạt bát nhất.",
            place_name: "Cơ sở Nghiên cứu Nhân giống Gấu trúc Khổng lồ Thành Đô",
            place_zh: "成都大熊猫繁育研究基地",
            amap_query: "成都大熊猫繁育研究基地南门",
            tips: "Bắt buộc đi sớm trước 8h30 sáng vì sau 10h trưa gấu trúc sẽ đi ngủ trong nhà.",
            dishes: [
              {
                dish_name_vn: "Đậu phụ Tứ Xuyên Ma Bà (Mapo Tofu)",
                dish_name_zh: "陈麻婆豆腐",
                google_img_keyword: "陈麻婆豆腐 成都",
                baidu_img_keyword: "正宗陈麻婆豆腐"
              }
            ]
          },
          {
            time_slot: "Chiều",
            time_range: "14:00 - 17:30",
            activity_title: "Dạo ngõ Kuanzhai Xiangzi & Trải nghiệm ngoáy tai thư giãn kiểu Thành Đô",
            description: "Khu ngõ Rộng - ngõ Hẹp lát đá xanh với các quán trà sân vườn truyền thống, thưởng thức trà nắp Bát bảo và nghệ thuật lấy ráy tai dân gian.",
            place_name: "Ngõ Khoan Trại (Kuanzhai Alley)",
            place_zh: "宽窄巷子",
            amap_query: "宽窄巷子",
            tips: "Thử dịch vụ 'Thải Nhĩ' (lấy ráy tai) của các nghệ nhân truyền thống rất thư giãn.",
            dishes: [
              {
                dish_name_vn: "Mì Dan Dan cay nồng Tứ Xuyên",
                dish_name_zh: "担担面",
                google_img_keyword: "正宗四川担担面",
                baidu_img_keyword: "成都担担面"
              }
            ]
          },
          {
            time_slot: "Tối",
            time_range: "18:30 - 21:30",
            activity_title: "Thưởng thức Xuyên Kịch (Sichuan Opera) & Tuyệt kỹ Biến Mặt (Biàn Liǎn)",
            description: "Xem nghệ nhân đổi hàng chục mặt nạ chỉ trong cái chớp mắt kết hợp phun lửa và nhào lộn đặc sắc.",
            place_name: "Nhà hát Kịch Thục Phong Nhã Vận",
            place_zh: "蜀风雅韵剧院",
            amap_query: "蜀风雅韵剧院",
            tips: "Vừa uống trà vừa cắn hạt dưa và thưởng ngoạn kịch bản cổ truyền.",
            dishes: []
          }
        ]
      }
    ]
  }
];
