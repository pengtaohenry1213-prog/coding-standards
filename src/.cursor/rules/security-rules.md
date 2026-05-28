---
description: This rule should be used when handling security-sensitive operations like file writes, command execution, API interactions, or any code involving authentication, authorization, encryption, or data handling.
version: 2.0.0
---

# Security Rules（AI 工程化版）

详细规范见：`docs/AI工程化开发手册/安全工程规范（AI 工程化版）.md`

## 绝对禁止（零妥协）

| 类别 | 禁止项 |
|------|--------|
| 密码 | 明文存储、不使用 bcrypt |
| 密钥 | 硬编码、不使用环境变量 |
| SQL | 字符串拼接 |
| 命令 | exec(input) 无校验 |
| 前端 | localStorage 存 token |
| XSS | innerHTML、v-html |
| 文件 | 上传无校验、无限制 |

## 认证授权

### JWT 安全

```ts
// ✅ 正确
const token = jwt.sign(
  { sub: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

// ❌ 禁止
const token = jwt.sign(
  { sub: user.id, password: user.password },
  'hardcoded-secret'
);
```

### Token 存储

```ts
// ✅ 正确
// 使用 httpOnly cookie
document.cookie = 'token=xxx; httpOnly; secure; sameSite=strict';

// ❌ 禁止
localStorage.setItem('token', token);
sessionStorage.setItem('token', token);
```

### 密码存储

```ts
// ✅ 正确
const hash = await bcrypt.hash(password, 12);

// ❌ 禁止
const hash = crypto.createHash('sha256').update(password).digest('hex');
```

## 输入验证

### 后端必须验证

```ts
// ✅ 正确 - 所有输入必须验证
class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password: string;
}

// ❌ 禁止 - 信任前端
async createUser(@Body() body: any) {
  await this.userService.create(body.email, body.password);
}
```

### 文件上传

```ts
// ✅ 正确
@Post('upload')
async upload(
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
        new FileTypeValidator({ fileType: /^(image\/(jpeg|png|gif)|application\/pdf)$/ }),
      ],
    }),
  )
  file: Express.Multer.File,
) {}
```

## SQL 注入防护

```ts
// ✅ 正确
const user = await this.userRepository.findOne({
  where: { email },
});

// ❌ 禁止 - SQL 拼接
await this.dataSource.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

## XSS 防护

```vue
<!-- ❌ 危险 -->
<div v-html="userInput" />

<!-- ✅ 安全 -->
<div>{{ userInput }}</div>
<!-- 或 -->
<div v-html="sanitize(userInput)" />
```

```ts
// React
// ✅ 正确 - React 自动转义
<div>{userInput}</div>

// ❌ 危险
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

## API 安全

### 限流

```ts
// ✅ 正确
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
}
```

### CORS

```ts
// ✅ 正确
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
});

// ❌ 禁止
app.enableCors({
  origin: '*',
});
```

## 密钥管理

```ts
// ❌ 禁止
const SECRET = 'my-api-key-123';

// ✅ 正确
const SECRET = process.env.API_SECRET;
```

### .env 文件

```text
# .env.example (进 Git)
API_SECRET=
JWT_SECRET=
DB_PASSWORD=

# .env (不进 Git)
API_SECRET=xxx
JWT_SECRET=xxx
DB_PASSWORD=xxx
```

## 日志安全

```ts
// ✅ 正确 - 脱敏
function maskSensitiveData(data: any): any {
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
  const masked = { ...data };
  for (const field of sensitiveFields) {
    if (masked[field]) {
      masked[field] = '***';
    }
  }
  return masked;
}

// ❌ 禁止 - 敏感信息日志
console.log('password:', password);
```

## 安全 Headers

```ts
// ✅ 正确
app.use(helmet({
  contentSecurityPolicy: true,
  hsts: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
}));
```

## AI 生成代码安全检查

### 必须检查项

- [ ] 无 SQL 拼接
- [ ] 无 any 类型
- [ ] 输入有验证
- [ ] 敏感数据加密
- [ ] 无硬编码密钥
- [ ] 无 XSS 风险
- [ ] 有权限校验
- [ ] 有错误处理
- [ ] 有日志脱敏

### 禁止模式

```txt
❌ 禁止: eval(userInput)
❌ 禁止: Function(userInput)
❌ 禁止: innerHTML = userInput
❌ 禁止: document.write(userInput)
❌ 禁止: ${userInput} in SQL
❌ 禁止: localStorage.setItem('token', token)
❌ 禁止: crypto.createHash('sha256')
```

## AI 安全 Prompt 模板

```txt
【安全审查任务】
审查以下代码的安全问题

【代码】
[粘贴代码]

【重点检查】
1. 注入漏洞（SQL/XSS/命令）
2. 认证授权漏洞
3. 敏感数据泄露
4. 加密/密钥问题
5. 输入验证

【输出】
1. 风险列表
2. 风险等级（高/中/低）
3. 修复建议
```

## 漏洞等级

| 等级 | 漏洞类型 | 处理 |
|------|---------|------|
| 高危 | SQL注入、命令注入、认证绕过、垂直越权 | 立即修复 |
| 中危 | XSS存储型、CSRF、弱密码、无登录限流 | 尽快修复 |
| 低危 | 信息泄露（版本号）、弱加密、缺少安全Headers | 计划修复 |

## 文件操作安全

### 路径校验

```ts
// ✅ 正确
const normalizedPath = path.replace(/\\/g, '/').replace(/\/+/g, '/');
const isPathTraversal = /\.\./.test(normalizedPath);
const isSystemPath = /^\/(etc|root|sys|proc)\//.test(normalizedPath);

if (isPathTraversal || isSystemPath) {
  throw new BadRequestException('无效路径');
}
```

### 禁止操作

```bash
# ❌ 禁止
rm -rf /
dd if=/dev/zero of=/dev/sda
chmod 777
sudo su
```

## Security Checklist

- [ ] 所有用户输入验证
- [ ] 无硬编码密钥
- [ ] 密码 bcrypt 加密
- [ ] JWT 使用环境变量 secret
- [ ] Token 存储安全（httpOnly cookie）
- [ ] SQL 使用参数化查询
- [ ] 无 innerHTML/v-html 动态赋值
- [ ] CORS 配置正确
- [ ] 安全 Headers 配置
- [ ] 敏感数据日志脱敏
- [ ] 文件上传有类型/大小限制
- [ ] 错误信息不泄露敏感信息
