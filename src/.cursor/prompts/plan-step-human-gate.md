# Human Gate：Plan → Step 双 Gate 规范

本 prompt 定义 Plan → Step 必须过双 Human Gate 的执行铁律。遵循 CO-STAR 框架的 Mode B 格式。

---

## 1. Context（背景）

双 Gate 机制是 AI 工程化开发的质量保障体系。Plan → Step 必须经过 PM + PMO + Security 的双重审查，确保需求完整、方案可行、操作安全。

---

## 2. Objective（审核目标）

确保 Plan 和 Step 符合以下要求：

- 方案完整、原子步骤、验收标准、风险标注
- 关联 Spec 条目、明确输入输出、依赖关系
- 无危险操作、无敏感数据泄露

---

## 3. Checklist（审核清单）

### PM 制定 Plan + Step

- [ ] 完整方案
- [ ] 原子步骤
- [ ] 验收标准
- [ ] 风险标注
- [ ] 关联 Spec 条目
- [ ] 明确输入输出
- [ ] 明确依赖关系

### PMO 安全 + 质量 + 合规校验

- [ ] 无危险命令声明
- [ ] 无敏感文件操作
- [ ] 无路径穿越
- [ ] 无硬编码密钥

### Security 扫描

- [ ] 匹配安全规则
- [ ] 敏感数据已脱敏

---

## 4. Decision（决策格式）

| 决策 | 条件 |
|------|------|
| **PASS** | 检查通过，可继续执行 |
| **CONDITIONAL** | 非核心项未达标，需记录整改项 |
| **REJECT** | 核心项缺失或不明确，必须修复 |

---

## 5. Decision Record（决策记录）

```markdown
## Human Gate 决策

| 项目 | 内容 |
|------|------|
| Gate 类型 | Plan-Step 双 Gate |
| 提交时间 | YYYY-MM-DD HH:mm |
| 决策 | PASS / CONDITIONAL / REJECT |
| 整改要求（如有） | ... |
| 整改期限（如有） | ... |
| 审批人 | ___ |
```

---

## 6. Closure（闭环要求）

- REJECT 必须修复并重新通过 Gate 审查
- CONDITIONAL 需在指定期限内完成整改
- 所有决策必须记录到审计日志

---

## 7. Prohibitions（禁止事项）

- 无验收标准的 Plan 不得通过
- 无风险标注的 Step 不得执行
- 危险操作必须有人工确认
- 敏感数据泄露必须立即终止
