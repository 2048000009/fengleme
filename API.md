# 疯了么 - 后端API对接文档

## 基础信息

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **响应格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

---

## 用户相关API

### 1. 用户注册

**接口**: `POST /api/user/register`

**请求参数**:
```json
{
  "username": "string",  // 用户名，必填
  "password": "string",  // 密码，必填
  "phone": "string"     // 手机号，必填
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "testuser",
    "avatar": "",
    "phone": "13800138000",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. 用户登录

**接口**: `POST /api/user/login`

**请求参数**:
```json
{
  "username": "string",  // 用户名，必填
  "password": "string"   // 密码，必填
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "testuser",
    "avatar": "",
    "phone": "13800138000",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. 获取用户信息

**接口**: `GET /api/user/info`

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "疯友001",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "13800138000",
    "crazyPoints": 1500,
    "continuousDays": 15,
    "totalDays": 30,
    "joinDate": "2024-01-01"
  }
}
```

---

### 4. 更新用户信息

**接口**: `PUT /api/user/info`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "nickname": "string",  // 昵称，可选
  "avatar": "string",    // 头像URL，可选
  "phone": "string"      // 手机号，可选
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "疯友001",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "13800138000"
  }
}
```

---

## 签到相关API

### 5. 每日签到

**接口**: `POST /api/checkin/daily`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "hour": 10  // 签到小时数，可选
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "签到成功",
  "data": {
    "points": 15,
    "continuousDays": 15,
    "totalDays": 30,
    "message": "上午签到，疯度充沛！表现不错 👍"
  }
}
```

---

### 6. 获取签到历史

**接口**: `GET /api/checkin/history`

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
- `page`: 页码，默认1
- `limit`: 每页数量，默认10

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "date": "2024-01-15",
        "hour": 10,
        "points": 15
      }
    ],
    "total": 30,
    "page": 1,
    "limit": 10
  }
}
```

---

## 疯情测试API

### 7. 提交疯情测试

**接口**: `POST /api/mood/test`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "answers": [1, 2, 3, 4, 2, 1, 3, 4]  // 8道题的答案，每题1-4分
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "测试完成",
  "data": {
    "score": 75,
    "label": "重度发疯",
    "desc": "你需要来这里发泄一下",
    "points": 10
  }
}
```

---

### 8. 获取疯情测试历史

**接口**: `GET /api/mood/history`

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
- `page`: 页码，默认1
- `limit`: 每页数量，默认10

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "date": "2024-01-15",
        "score": 75,
        "label": "重度发疯",
        "scene": "疯情测试"
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 10
  }
}
```

---

## 疯险自检API

### 9. 提交疯险自检

**接口**: `POST /api/risk/check`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "answers": [10, 5, 15, 0, 20, 10, 5, 15]  // 8道题的答案，每题0-30分
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "自检完成",
  "data": {
    "score": 80,
    "level": "高危",
    "points": 15
  }
}
```

---

### 10. 获取疯险自检历史

**接口**: `GET /api/risk/history`

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
- `page`: 页码，默认1
- `limit`: 每页数量，默认10

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "date": "2024-01-15",
        "score": 80,
        "level": "高危"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

---

## 摆烂指数API

### 11. 计算摆烂指数

**接口**: `POST /api/life/calculate`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "birthDate": "1990-01-01"  // 出生日期，格式 YYYY-MM-DD
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "计算完成",
  "data": {
    "totalDays": 12500,
    "workDays": 8000,
    "restDays": 4500,
    "score": 36,
    "points": 10
  }
}
```

---

### 12. 获取摆烂指数历史

**接口**: `GET /api/life/history`

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
- `page`: 页码，默认1
- `limit`: 每页数量，默认10

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "date": "2024-01-15",
        "score": 36,
        "totalDays": 12500,
        "workDays": 8000,
        "restDays": 4500
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 10
  }
}
```

---

## 排行榜API

### 13. 获取疯度排行榜

**接口**: `GET /api/ranking/crazy`

**查询参数**:
- `page`: 页码，默认1
- `limit`: 每页数量，默认50

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "rank": 1,
        "userId": 1,
        "username": "疯友001",
        "avatar": "https://example.com/avatar.jpg",
        "score": 10000
      }
    ],
    "total": 1000,
    "page": 1,
    "limit": 50
  }
}
```

---

### 14. 获取疯情测试排行榜

**接口**: `GET /api/ranking/mood`

**查询参数**:
- `page`: 页码，默认1
- `limit`: 每页数量，默认50

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "rank": 1,
        "userId": 1,
        "username": "疯友001",
        "avatar": "https://example.com/avatar.jpg",
        "score": 95
      }
    ],
    "total": 500,
    "page": 1,
    "limit": 50
  }
}
```

---

### 15. 获取疯险自检排行榜

**接口**: `GET /api/ranking/risk`

**查询参数**:
- `page`: 页码，默认1
- `limit`: 每页数量，默认50

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "rank": 1,
        "userId": 1,
        "username": "疯友001",
        "avatar": "https://example.com/avatar.jpg",
        "score": 90
      }
    ],
    "total": 300,
    "page": 1,
    "limit": 50
  }
}
```

---

### 16. 获取摆烂指数排行榜

**接口**: `GET /api/ranking/lying`

**查询参数**:
- `page`: 页码，默认1
- `limit`: 每页数量，默认50

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "rank": 1,
        "userId": 1,
        "username": "疯友001",
        "avatar": "https://example.com/avatar.jpg",
        "score": 85
      }
    ],
    "total": 200,
    "page": 1,
    "limit": 50
  }
}
```

---

## 紧急联系人API

### 17. 获取紧急联系人列表

**接口**: `GET /api/emergency/contacts`

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "张三",
      "relationship": "朋友",
      "phone": "13800138000"
    }
  ]
}
```

---

### 18. 添加紧急联系人

**接口**: `POST /api/emergency/contact`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "name": "string",       // 姓名，必填
  "relationship": "string", // 关系，必填
  "phone": "string"        // 手机号，必填
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": 1,
    "name": "张三",
    "relationship": "朋友",
    "phone": "13800138000"
  }
}
```

---

### 19. 删除紧急联系人

**接口**: `DELETE /api/emergency/contact/:id`

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

## SOS求救API

### 20. 发送SOS求救

**接口**: `POST /api/sos/send`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "location": {
    "latitude": 39.9042,
    "longitude": 116.4074
  },
  "message": "string"  // 求救信息，可选
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "求救信号已发送",
  "data": {
    "id": 1,
    "sentAt": "2024-01-15T10:00:00.000Z",
    "contactsNotified": 2
  }
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token无效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 前端对接说明

### 1. Token管理

登录成功后，将token存储到本地：
```typescript
const token = res.data.data.token
storage.set('fengleme_token', token)
```

每次请求时携带token：
```typescript
const token = storage.get('fengleme_token')
uni.request({
  url: 'http://localhost:3000/api/user/info',
  method: 'GET',
  header: {
    'Authorization': `Bearer ${token}`
  }
})
```

### 2. 请求拦截器

建议在 `utils/request.ts` 中添加拦截器，自动处理token：
```typescript
const request = (options: UniApp.RequestOptions) => {
  const token = storage.get('fengleme_token')
  
  return uni.request({
    ...options,
    header: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.header
    }
  })
}
```

### 3. 错误处理

统一处理错误响应：
```typescript
if (res.statusCode === 200 && res.data.code === 200) {
  // 成功
} else {
  uni.showToast({
    title: res.data.message || '请求失败',
    icon: 'none'
  })
}
```

---

## 数据库表结构建议

### users 表
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50),
  avatar VARCHAR(255),
  phone VARCHAR(20),
  crazy_points INT DEFAULT 0,
  continuous_days INT DEFAULT 0,
  total_days INT DEFAULT 0,
  join_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### checkin_records 表
```sql
CREATE TABLE checkin_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  hour INT NOT NULL,
  points INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### mood_tests 表
```sql
CREATE TABLE mood_tests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  score INT NOT NULL,
  label VARCHAR(50),
  scene VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### risk_checks 表
```sql
CREATE TABLE risk_checks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  score INT NOT NULL,
  level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### life_calculations 表
```sql
CREATE TABLE life_calculations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  birth_date DATE NOT NULL,
  total_days INT NOT NULL,
  work_days INT NOT NULL,
  rest_days INT NOT NULL,
  score INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### emergency_contacts 表
```sql
CREATE TABLE emergency_contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  relationship VARCHAR(50),
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### sos_records 表
```sql
CREATE TABLE sos_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  message TEXT,
  contacts_notified INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```
