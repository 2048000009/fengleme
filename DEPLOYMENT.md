# 疯了么新功能部署说明

## 一、功能概述

本次更新新增以下功能：

1. **忘记密码功能** - 通过手机验证码重置密码
2. **手机验证码登录** - 无需密码，验证码直接登录/注册
3. **微信第三方登录** - 支持H5微信网页授权和小程序登录

---

## 二、文件清单

### 后端新增文件

| 文件路径 | 说明 |
|---------|------|
| `admin/flm/SmsService.php` | 短信验证码服务类 |
| `admin/flm/WechatService.php` | 微信登录服务类 |
| `admin/flm/Controller/AuthController.php` | 认证控制器（新功能接口） |
| `admin/flm/migration_auth_features.sql` | 数据库迁移脚本 |

### 后端修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `admin/flm/config.php` | 添加短信和微信配置项 |

### 前端新增文件

| 文件路径 | 说明 |
|---------|------|
| `pages/auth/forgot-password.vue` | 忘记密码页面 |
| `pages/auth/wechat-callback.vue` | 微信登录回调页面 |

### 前端修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `pages/auth/login.vue` | 添加验证码登录和微信登录 |
| `api/user.ts` | 添加新接口函数 |
| `pages.json` | 添加新页面路由 |

---

## 三、部署步骤

### 步骤1: 备份现有代码

```bash
# 在服务器上执行
cd /www/wwwroot/your-domain
tar -czvf backup_$(date +%Y%m%d_%H%M%S).tar.gz admin/flm/
```

### 步骤2: 上传新文件

使用宝塔面板文件管理器或FTP上传以下文件：

**后端文件：**
- `admin/flm/SmsService.php`
- `admin/flm/WechatService.php`
- `admin/flm/Controller/AuthController.php`
- `admin/flm/migration_auth_features.sql`

**前端文件：**
- `pages/auth/forgot-password.vue`
- `pages/auth/wechat-callback.vue`

### 步骤3: 执行数据库迁移

1. 登录宝塔面板
2. 进入【数据库】-> 选择对应数据库 -> 点击【管理】
3. 在phpMyAdmin中执行以下SQL：

```sql
-- 短信验证码表
CREATE TABLE IF NOT EXISTS `flm_sms_code` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) NOT NULL DEFAULT '' COMMENT '手机号',
  `code` varchar(10) NOT NULL DEFAULT '' COMMENT '验证码',
  `type` varchar(20) NOT NULL DEFAULT 'login' COMMENT '类型',
  `expire_time` int(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '过期时间戳',
  `used` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已使用',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_phone_type` (`phone`, `type`),
  KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='短信验证码表';

-- 第三方登录绑定表
CREATE TABLE IF NOT EXISTS `flm_user_oauth` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户ID',
  `oauth_type` varchar(20) NOT NULL DEFAULT '' COMMENT '平台类型',
  `oauth_id` varchar(100) NOT NULL DEFAULT '' COMMENT '平台用户ID',
  `unionid` varchar(100) DEFAULT '' COMMENT '平台UnionID',
  `nickname` varchar(100) DEFAULT '' COMMENT '平台昵称',
  `avatar` varchar(500) DEFAULT '' COMMENT '平台头像',
  `create_time` datetime DEFAULT NULL COMMENT '绑定时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_oauth` (`oauth_type`, `oauth_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_unionid` (`unionid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='第三方登录绑定表';

-- OAuth状态表
CREATE TABLE IF NOT EXISTS `flm_oauth_state` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `state` varchar(64) NOT NULL DEFAULT '' COMMENT '状态码',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `expire_time` int(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '过期时间戳',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_state` (`state`),
  KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='OAuth状态表';
```

### 步骤4: 配置参数

编辑 `admin/flm/config.php`，配置以下参数：

```php
// 短信配置（如需真实发送短信）
'sms' => [
    'provider' => 'aliyun',  // 可选: log(开发测试), aliyun, tencent, huawei
    'access_key' => '您的AccessKey',
    'access_secret' => '您的AccessSecret',
    'sign_name' => '您的短信签名',
    'template_code' => '您的模板CODE'
],

// 微信配置
'wechat' => [
    'app_id' => '您的微信公众号AppID',
    'app_secret' => '您的微信公众号AppSecret',
    'mini_app_id' => '您的小程序AppID（如有）',
    'mini_app_secret' => '您的小程序AppSecret（如有）'
]
```

### 步骤5: 更新前端代码

1. 在本地开发环境运行：
```bash
npm run build:h5
```

2. 将 `dist/build/h5` 目录下的文件上传到服务器

或使用HBuilderX：
1. 打开项目
2. 点击【发行】->【网站-H5手机版】
3. 上传生成的文件到服务器

### 步骤6: 配置微信公众号（如使用微信登录）

1. 登录微信公众平台
2. 进入【设置与开发】->【公众号设置】->【功能设置】
3. 配置【网页授权域名】为您的域名（如：flm.lvafan.cn）
4. 确保服务器IP在白名单中

---

## 四、API接口说明

### 1. 发送短信验证码

**接口地址：** `POST /api/auth/sendSmsCode`

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| phone | string | 是 | 手机号 |
| type | string | 是 | 类型：login/register/reset/bind |

**返回示例：**
```json
{
  "code": 200,
  "message": "验证码发送成功",
  "data": {
    "expire_time": 300
  }
}
```

### 2. 验证码登录

**接口地址：** `POST /api/auth/loginBySms`

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| phone | string | 是 | 手机号 |
| code | string | 是 | 验证码 |

### 3. 重置密码

**接口地址：** `POST /api/auth/resetPassword`

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| phone | string | 是 | 手机号 |
| code | string | 是 | 验证码 |
| newPassword | string | 是 | 新密码 |
| confirmPassword | string | 是 | 确认密码 |

### 4. 获取微信授权链接

**接口地址：** `POST /api/auth/getWechatOAuthUrl`

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| redirect_uri | string | 否 | 回调地址 |

### 5. 微信登录

**接口地址：** `POST /api/auth/wechatLogin`

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| code | string | 是 | 微信授权码 |
| state | string | 否 | 状态码 |

### 6. 微信小程序登录

**接口地址：** `POST /api/auth/wechatMiniLogin`

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| code | string | 是 | wx.login获取的code |

---

## 五、测试验证

### 功能测试清单

- [ ] 密码登录正常
- [ ] 验证码登录正常
- [ ] 验证码发送频率限制（60秒）
- [ ] 验证码过期（5分钟）
- [ ] 忘记密码流程完整
- [ ] 微信H5登录正常
- [ ] 微信小程序登录正常
- [ ] 新用户自动注册
- [ ] 老用户正常登录

### 兼容性测试

- [ ] Chrome浏览器
- [ ] Safari浏览器
- [ ] 微信内置浏览器
- [ ] 微信小程序

---

## 六、常见问题

### Q1: 验证码发送失败？

检查以下配置：
1. 短信服务商配置是否正确
2. AccessKey和Secret是否有效
3. 短信签名和模板是否已审核通过

**开发测试模式：** 设置 `provider => 'log'`，验证码会记录在服务器日志中

### Q2: 微信登录失败？

检查以下配置：
1. 公众号AppID和AppSecret是否正确
2. 网页授权域名是否已配置
3. 服务器IP是否在白名单中
4. 是否使用已备案的域名

### Q3: 小程序登录失败？

检查以下配置：
1. 小程序AppID和AppSecret是否正确
2. 服务器域名是否在小程序后台配置

---

## 七、安全建议

1. **生产环境关闭调试模式**
   ```php
   'app' => [
       'debug' => false,
       ...
   ]
   ```

2. **更换JWT密钥**
   ```php
   'jwt' => [
       'secret' => '您的随机密钥',
       ...
   ]
   ```

3. **数据库密码使用环境变量**
   建议将敏感配置移至环境变量或独立配置文件

4. **启用HTTPS**
   确保所有接口使用HTTPS协议

---

## 八、联系方式

如有问题，请联系开发团队。
