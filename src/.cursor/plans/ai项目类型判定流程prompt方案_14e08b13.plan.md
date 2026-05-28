---
name: AI项目类型判定流程Prompt方案
overview: 设计一个自动化 Prompt 方案，实现用户上传4个文档后，AI自动判定项目类型并输出项目主线与落地配置
todos:
  - id: design-template
    content: 设计 AI开发模式配置模板（项目类型模板库）
    status: pending
  - id: design-prompt
    content: 设计项目类型分析 Prompt（project-type-analysis-prompt.md）
    status: pending
  - id: design-extract-prompt
    content: 设计上下文提取 Prompt（extract-project-context-prompt.md）
    status: pending
  - id: create-output-template
    content: 创建示例输出模板（项目类型确定-给出分析结果.md）
    status: pending
isProject: false
---

## Prompt 生成方案设计

### 核心目标

用户上传4个文档 → AI 自动分析 → 输出"项目类型判定" + "项目主线与落地配置"

### 输入文档

1. `v1_v2_analysis.md` - v1→v2 复用分析
2. `v2_init_plan.md` - v2 初始化计划
3. `v2_product_roadmap.md` - v2 产品路线图
4. `v1_v2_upgrade_requirements.md` - 升级需求

### AI开发模式配置模板体系（需先定义）

建议创建 `AI开发模式配置模板.md`，包含：


| 模板类型   | 适用场景        | 核心特征                   |
| ------ | ----------- | ---------------------- |
| T1     | 探索验证型       | 业务/技术均不确定，快速原型         |
| T2     | 从0到1稳定型     | 业务确定，技术需探索             |
| T3     | 已有系统增强      | 小幅功能迭代                 |
| **T4** | **核心系统大升级** | **架构重构、技术换代、100%兼容要求** |
| T5     | 常规功能迭代      | 小步快跑                   |
| T7     | 技术债务清理      | 代码重构，不改功能              |


### Prompt 流程设计

#### 阶段1：文档解析与信息提取

```
你是一个项目分析助手。用户将提供4个文档，请依次读取并提取以下信息：
1. 项目的业务背景和目标
2. v1系统与v2系统的关系
3. 技术栈变更情况
4. 兼容性要求
5. 核心痛点和升级动机
```

#### 阶段2：项目类型匹配

```
根据提取的信息，匹配"AI开发模式配置模板"：
- 分析项目是否涉及核心系统升级
- 判断是否需要100%兼容旧系统
- 评估技术换代规模
- 确定Human Gate等级要求
```

#### 阶段3：输出项目主线与配置

```
输出结构化结论：
1. 项目类型判定 + 匹配理由
2. 项目主线（一句话概括核心方向）
3. 核心配置要点（开发模式、Human Gate等级、风险控制）
```

### 建议创建的文件

1. `**docs/reference/AI开发模式配置模板.md**` - 项目类型模板库
2. `**docs/reference/prompts/project-type-analysis-prompt.md**` - 分析用Prompt模板
3. `**docs/reference/prompts/extract-project-context-prompt.md**` - 上下文提取Prompt

### 关键设计原则

1. **模板化**：预定义T1-T7模板，AI只需匹配
2. **结构化输出**：固定输出格式，便于后续流程使用
3. **零细节聚焦主线**：第一轮只输出主线，不展开细节
4. **Human-in-the-loop**：最终结论需用户确认后才进入下一阶段

