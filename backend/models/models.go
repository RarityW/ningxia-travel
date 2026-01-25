package models

import (
	"time"

	"gorm.io/gorm"
)

// 用户模型
type User struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	OpenID    string         `gorm:"column:open_id;type:varchar(191);uniqueIndex" json:"openid"` //允许为空，兼容仅手机号注册
	Password  string         `gorm:"column:password" json:"-"`                                   // 新增密码字段
	NickName  string         `gorm:"column:nick_name" json:"nickname"`
	Avatar    string         `gorm:"column:avatar" json:"avatar"`
	Gender    int            `gorm:"column:gender" json:"gender"`
	Phone     string         `gorm:"column:phone" json:"phone"`
	IsActive  bool           `gorm:"column:is_active;default:true" json:"is_active"`
	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index" json:"deleted_at,omitempty"`
}

// 景点模型
type Attraction struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	Name        string         `gorm:"not null" json:"name"`
	EnglishName string         `json:"english_name"`
	CoverImage  string         `json:"cover_image"`
	Images      string         `gorm:"type:text" json:"images"` // JSON 数组
	Grade       string         `json:"grade"`                   // 5A/4A/3A
	Category    string         `json:"category"`                // 自然/历史/文化
	Region      string         `json:"region"`
	Address     string         `json:"address"`
	Description string         `gorm:"type:text" json:"description"`
	Features    string         `gorm:"type:text" json:"features"` // JSON 数组
	OpenTime    string         `json:"open_time"`
	TicketPrice float64        `json:"ticket_price"`
	Phone       string         `json:"phone"`
	Latitude    float64        `json:"latitude"`
	Longitude   float64        `json:"longitude"`
	Views       int            `json:"views"`
	Rating      float64        `json:"rating"`
	Recommend   bool           `gorm:"default:false" json:"recommend"`
	Tags        string         `gorm:"type:text" json:"tags"`   // JSON 数组
	Status      int            `gorm:"default:1" json:"status"` // 1:上线 0:下线
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// 美食模型
type Food struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	Name        string         `gorm:"not null" json:"name"`
	CoverImage  string         `json:"cover_image"`
	Images      string         `gorm:"type:text" json:"images"`
	Category    string         `json:"category"` // 特色菜/小吃/主食
	Region      string         `json:"region"`
	Description string         `gorm:"type:text" json:"description"`
	Price       float64        `json:"price"`
	Shops       string         `gorm:"type:text" json:"shops"` // JSON 数组
	Views       int            `json:"views"`
	Rating      float64        `json:"rating"`
	Recommend   bool           `gorm:"default:false" json:"recommend"`
	Tags        string         `gorm:"type:text" json:"tags"` // JSON 数组
	Status      int            `gorm:"default:1" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// 文化/非遗模型
type Culture struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	Name        string         `gorm:"not null" json:"name"`
	CoverImage  string         `json:"cover_image"`
	Images      string         `gorm:"type:text" json:"images"`
	Category    string         `json:"category"` // 非遗/文创/工艺品
	Region      string         `json:"region"`
	Description string         `gorm:"type:text" json:"description"`
	Price       float64        `json:"price"`
	Views       int            `json:"views"`
	Rating      float64        `json:"rating"`
	Recommend   bool           `gorm:"default:false" json:"recommend"`
	Tags        string         `gorm:"type:text" json:"tags"` // JSON 数组
	Status      int            `gorm:"default:1" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// 商家模型
type Merchant struct {
	ID           uint      `gorm:"primarykey" json:"id"`
	AdminID      uint      `json:"admin_id"`                     // 关联的管理员账号ID
	Name         string    `json:"name"`                         // 店铺名称
	Logo         string    `json:"logo"`                         // 店铺Logo
	CoverImage   string    `json:"cover_image"`                  // 店铺封面
	Description  string    `gorm:"type:text" json:"description"` // 店铺描述
	LicenseImage string    `json:"license_image"`
	Phone        string    `json:"phone"`
	Address      string    `json:"address"`
	Status       int       `json:"status"` // 0:待审核 1:正常 2:驳回
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// 商品模型
type Product struct {
	ID             uint           `gorm:"primarykey" json:"id"`
	MerchantID     uint           `gorm:"default:0;index" json:"merchant_id"` // 0表示平台自营，其他为商家ID
	Name           string         `gorm:"not null" json:"name"`
	CoverImage     string         `json:"cover_image"`
	Images         string         `gorm:"type:text" json:"images"`
	Category       string         `json:"category"` // 明星产品/特色食品/文创周边
	Price          float64        `json:"price"`
	OriginalPrice  float64        `json:"original_price"`
	Description    string         `gorm:"type:text" json:"description"`
	Sales          int            `gorm:"default:0" json:"sales"`
	Stock          int            `gorm:"default:0" json:"stock"`
	Specifications string         `gorm:"type:text" json:"specifications"` // JSON 数组
	Status         int            `gorm:"default:1" json:"status"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// 订单模型
type Order struct {
	ID         uint           `gorm:"primarykey" json:"id"`
	OrderNo    string         `gorm:"type:varchar(191);uniqueIndex;not null" json:"order_no"`
	UserID     uint           `json:"user_id"`
	User       *User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	TotalPrice float64        `json:"total_price"`
	Status     int            `gorm:"default:0" json:"status"` // 0:待支付 1:已支付 2:已发货 3:已完成 4:已取消
	PayTime    *time.Time     `json:"pay_time"`
	ShipTime   *time.Time     `json:"ship_time"`
	Address    string         `gorm:"type:text" json:"address"`
	Remark     string         `json:"remark"`
	Items      []OrderItem    `gorm:"foreignKey:OrderID" json:"items"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// 订单明细模型
type OrderItem struct {
	ID        uint     `gorm:"primarykey" json:"id"`
	OrderID   uint     `json:"order_id"`
	Order     *Order   `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	ProductID uint     `json:"product_id"`
	Product   *Product `gorm:"foreignKey:ProductID" json:"product"`
	Quantity  int      `json:"quantity"`
	Price     float64  `json:"price"`
}

// 购物车模型
type Cart struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	UserID    uint      `json:"user_id"`
	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ProductID uint      `json:"product_id"`
	Quantity  int       `json:"quantity"`
	SpecID    uint      `json:"spec_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// 优惠券模型
type Coupon struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Type      int            `json:"type"`       // 1:满减 2:折扣
	MinAmount float64        `json:"min_amount"` // 满减门槛
	Discount  float64        `json:"discount"`   // 减免金额或折扣比例
	Total     int            `json:"total"`      // 发放总数
	Used      int            `json:"used"`       // 已使用数
	StartTime time.Time      `json:"start_time"`
	EndTime   time.Time      `json:"end_time"`
	Status    int            `gorm:"default:1" json:"status"` // 1:有效 0:失效
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// 管理员模型
type Admin struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	Username  string    `gorm:"type:varchar(191);uniqueIndex;not null" json:"username"`
	Password  string    `gorm:"not null" json:"-"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      int       `json:"role"` // 1:超级管理员 2:普通管理员
	Status    int       `gorm:"default:1" json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
