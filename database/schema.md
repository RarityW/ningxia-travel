# 云数据库 Schema 设计

## attractions (景点表)

```json
{
  "_id": "自动生成",
  "name": "沙坡头景区",
  "englishName": "Shapotou",
  "coverImage": "cloud://xxx/shapotou-cover.jpg",
  "images": [
    "cloud://xxx/shapotou-1.jpg",
    "cloud://xxx/shapotou-2.jpg"
  ],
  "grade": "5A", // 5A/4A/3A
  "category": "自然", // 自然/历史/文化/沙漠/草原
  "region": "中卫市",
  "address": "宁夏中卫市沙坡头区迎水桥镇",
  "description": "沙坡头景区位于宁夏中卫市城区以西20公里...",
  "features": ["沙漠", "黄河", "滑沙", "羊皮筏子"],
  "openTime": "08:00-18:00",
  "ticketPrice": 80,
  "phone": "0955-7689333",
  "latitude": 37.5167,
  "longitude": 105.0167,
  "views": 10000,
  "rating": 4.8,
  "recommend": true,
  "tags": ["沙漠", "黄河", "必打卡"],
  "createTime": "2024-01-01T00:00:00.000Z",
  "updateTime": "2024-01-01T00:00:00.000Z"
}
```

## food (美食表)

```json
{
  "_id": "自动生成",
  "name": "手抓羊肉",
  "coverImage": "cloud://xxx/sheep-meat.jpg",
  "images": [],
  "category": "特色菜", // 特色菜/小吃/主食
  "region": "银川市",
  "shops": [
    {
      "name": "老毛手抓",
      "address": "银川市兴庆区解放东街",
      "phone": "0951-xxxx"
    }
  ],
  "description": "宁夏手抓羊肉选用滩羊...",
  "price": 120,
  "recommend": true,
  "rating": 4.9,
  "views": 5000,
  "createTime": "2024-01-01T00:00:00.000Z",
  "updateTime": "2024-01-01T00:00:00.000Z"
}
```

## culture (文化/文创表)

```json
{
  "_id": "自动生成",
  "name": "贺兰石雕刻",
  "coverImage": "cloud://xxx/helan-stone.jpg",
  "images": [],
  "category": "非遗", // 非遗/文创/工艺品
  "region": "银川市",
  "description": "贺兰石雕刻是宁夏的传统工艺...",
  "price": 500,
  "recommend": true,
  "rating": 4.7,
  "views": 3000,
  "createTime": "2024-01-01T00:00:00.000Z",
  "updateTime": "2024-01-01T00:00:00.000Z"
}
```

## users (用户表)

```json
{
  "_id": "自动生成",
  "_openid": "用户openid",
  "nickName": "用户昵称",
  "avatarUrl": "头像URL",
  "gender": 1, // 0:未知, 1:男, 2:女
  "phone": "",
  "favorites": ["景点ID1", "景点ID2"],
  "createTime": "2024-01-01T00:00:00.000Z",
  "updateTime": "2024-01-01T00:00:00.000Z"
}
```
