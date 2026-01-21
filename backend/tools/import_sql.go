package main

import (
	"log"

	"ningxia-wenlv-backend/config"
	"ningxia-wenlv-backend/db"
)

func main() {
	config.LoadConfig()

	if err := db.Connect(); err != nil {
		log.Fatal("数据库连接失败:", err)
	}

	log.Println("开始导入数据...")

	// 导入美食数据
	foods := []string{
		`INSERT INTO foods (name, cover_image, images, category, region, shops, description, price, recommend, rating, views, status, created_at, updated_at) VALUES ('手抓羊肉', '/images/food-1.jpg', '[]', '特色菜', '银川市', '["老毛手抓(解放东街店)","国强手抓(新华东街店)","德隆楼手抓(鼓楼店)"]', '宁夏手抓羊肉选用滩羊，肉质鲜嫩，肥而不腻，香而不膻。', 120, true, 4.9, 8000, 1, NOW(), NOW())`,
		`INSERT INTO foods (name, cover_image, images, category, region, shops, description, price, recommend, rating, views, status, created_at, updated_at) VALUES ('羊杂碎', '/images/food-2.jpg', '[]', '小吃', '吴忠市', '["杨记羊杂碎(胜利街店)","老字号羊杂碎(东塔市场)"]', '宁夏羊杂碎是用羊的头、蹄、心、肝、肺、肚等内脏熬制而成，汤色红亮，味道鲜美。', 35, true, 4.7, 6000, 1, NOW(), NOW())`,
		`INSERT INTO foods (name, cover_image, images, category, region, shops, description, price, recommend, rating, views, status, created_at, updated_at) VALUES ('沙湖大鱼头', '/images/food-3.jpg', '[]', '特色菜', '石嘴山市', '["沙湖景区餐厅","银川大鱼头(湖滨街店)"]', '沙湖大鱼头是宁夏沙湖的特色美食，选用沙湖鳙鱼，头大肉嫩，汤色乳白。', 168, true, 4.8, 5000, 1, NOW(), NOW())`,
		`INSERT INTO foods (name, cover_image, images, category, region, shops, description, price, recommend, rating, views, status, created_at, updated_at) VALUES ('八宝茶', '/images/food-4.jpg', '[]', '饮品', '银川市', '["吴忠八宝茶(步行街店)","宁夏八宝茶总店"]', '宁夏八宝茶由茶叶、红枣、桂圆、枸杞等八种原料冲泡而成，香甜可口。', 15, true, 4.6, 5500, 1, NOW(), NOW())`,
	}

	for _, sql := range foods {
		if err := db.DB.Exec(sql).Error; err != nil {
			log.Printf("美食导入失败: %v", err)
		}
	}
	log.Println("美食数据导入完成")

	// 导入文化数据
	cultures := []string{
		`INSERT INTO cultures (name, cover_image, images, category, region, description, price, recommend, rating, views, status, created_at, updated_at) VALUES ('贺兰石雕刻', '/images/culture-1.jpg', '[]', '工艺品', '银川市', '贺兰石雕刻是宁夏的传统工艺，贺兰石质地细腻，色泽柔和，是制作砚台和工艺品的好材料。', 500, true, 4.7, 3000, 1, NOW(), NOW())`,
		`INSERT INTO cultures (name, cover_image, images, category, region, description, price, recommend, rating, views, status, created_at, updated_at) VALUES ('宁夏刺绣', '/images/culture-2.jpg', '[]', '非遗', '银川市', '宁夏刺绣是回族妇女的传统手工艺，绣工精细，图案精美，具有浓郁的回族特色。', 300, true, 4.6, 2500, 1, NOW(), NOW())`,
		`INSERT INTO cultures (name, cover_image, images, category, region, description, price, recommend, rating, views, status, created_at, updated_at) VALUES ('花儿', '/images/culture-3.jpg', '[]', '非遗', '固原市', '花儿是西北地区的一种山歌形式，宁夏的花儿以高亢嘹亮、情感真挚著称。', 0, true, 4.8, 2000, 1, NOW(), NOW())`,
		`INSERT INTO cultures (name, cover_image, images, category, region, description, price, recommend, rating, views, status, created_at, updated_at) VALUES ('宁夏皮影戏', '/images/culture-4.jpg', '[]', '非遗', '中卫市', '宁夏皮影戏历史悠久，造型夸张生动，唱腔独特，是宁夏重要的民间艺术形式。', 0, true, 4.5, 1500, 1, NOW(), NOW())`,
	}

	for _, sql := range cultures {
		if err := db.DB.Exec(sql).Error; err != nil {
			log.Printf("文化导入失败: %v", err)
		}
	}
	log.Println("文化数据导入完成")

	// 导入商品数据
	products := []string{
		`INSERT INTO products (name, cover_image, images, category, price, original_price, description, sales, stock, specifications, status, created_at, updated_at) VALUES ('宁夏枸杞', '/images/product-1.jpg', '[]', '明星产品', 98, 128, '宁夏枸杞，颗粒饱满，色泽红艳，营养丰富，是宁夏的招牌特产。', 5000, 999, '["250g装","500g装","1000g装"]', 1, NOW(), NOW())`,
		`INSERT INTO products (name, cover_image, images, category, price, original_price, description, sales, stock, specifications, status, created_at, updated_at) VALUES ('贺兰山葡萄酒', '/images/product-2.jpg', '[]', '明星产品', 268, 328, '贺兰山东麓葡萄酒，世界级产区，口感醇厚，回味悠长。', 3000, 500, '["750ml单支","双支礼盒","六支装"]', 1, NOW(), NOW())`,
		`INSERT INTO products (name, cover_image, images, category, price, original_price, description, sales, stock, specifications, status, created_at, updated_at) VALUES ('滩羊肉礼盒', '/images/product-3.jpg', '[]', '特色食品', 388, 458, '宁夏滩羊肉，肉质细嫩，肥瘦适中，无膻味，是送礼佳品。', 2000, 200, '["2kg装","3kg装","5kg装"]', 1, NOW(), NOW())`,
		`INSERT INTO products (name, cover_image, images, category, price, original_price, description, sales, stock, specifications, status, created_at, updated_at) VALUES ('贺兰石砚台', '/images/product-4.jpg', '[]', '文创周边', 580, 680, '贺兰石砚台，天然石材，手工雕刻，是书法爱好者的珍品。', 500, 50, '["小号","中号","大号"]', 1, NOW(), NOW())`,
	}

	for _, sql := range products {
		if err := db.DB.Exec(sql).Error; err != nil {
			log.Printf("商品导入失败: %v", err)
		}
	}
	log.Println("商品数据导入完成")

	// 创建测试用户
	userSQL := `INSERT INTO users (open_id, nickname, avatar, gender, status, created_at, updated_at) VALUES ('test_user_simple', '测试用户', '/images/avatar.jpg', 1, 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE nickname='测试用户'`
	if err := db.DB.Exec(userSQL).Error; err != nil {
		log.Printf("用户创建失败: %v", err)
	} else {
		log.Println("测试用户创建完成")
	}

	log.Println("所有数据导入完成!")
}
