---
name: Add external AI model support
overview: 在现有 Ollama 本地模型基础上，增加 MiniMax-M2.7 外网模型支持。用户可在 UI 上切换模型。
todos:
  - id: update-env
    content: Update .env with MiniMax Vite variables
    status: completed
  - id: create-model-config
    content: Create aiModels.ts config
    status: completed
  - id: create-ai-service
    content: Create aiService.ts unified service
    status: completed
  - id: create-model-selector
    content: Create ModelSelector.vue component
    status: completed
  - id: modify-dashboard
    content: Modify LifecycleDashboard.vue to use model selector
    status: completed
isProject: false
---

## 1. 更新 `.env` 文件

添加 MiniMax 模型的 Vite 环境变量：

```
VITE_OPENAI_BASE_URL=https://api.minimaxi.com/v1
VITE_OPENAI_API_KEY=<已有密钥>
```

## 2. 创建 `src/config/aiModels.ts` 模型配置

定义支持的模型列表（本地 Ollama + 外部 API）：

```typescript
export type ModelProvider = 'ollama' | 'openai'

export interface AIModel {
  id: string           // 模型标识符
  name: string         // 显示名称
  provider: ModelProvider
  baseUrl?: string    // 仅外部模型需要
  apiKey?: string     // 仅外部模型需要
  default?: boolean
}

export const AI_MODELS: AIModel[] = [
  { id: 'deepseek-r1', name: 'DeepSeek-R1 (本地)', provider: 'ollama', default: true },
  { id: 'MiniMax-M2.7', name: 'MiniMax-M2.7', provider: 'openai', baseUrl: '...', apiKey: '...' }
]
```

## 3. 创建 `src/services/aiService.ts` 统一服务

统一封装 Ollama 和 OpenAI 兼容 API 的调用：

- `generateContent(model, prompt, options)`
- 根据 provider 类型调用不同的 HTTP 端点

## 4. 创建模型选择器组件 `src/components/ModelSelector.vue`

- 下拉选择可用模型
- 显示当前连接状态
- 保存用户偏好到 localStorage

## 5. 修改 `LifecycleDashboard.vue`

- 导入并使用 ModelSelector 组件
- 修改 `generateContentByStage` 调用，传入选择的模型

## 6. 修改调用位置

- [LifecycleDashboard.vue:657](v2/apps/workflow-dashboard/src/views/LifecycleDashboard.vue) - 移除硬编码 model
- [LifecycleDashboard.vue:1227](v2/apps/workflow-dashboard/src/views/LifecycleDashboard.vue) - architecture 生成
- [LifecycleDashboard.vue:1336](v2/apps/workflow-dashboard/src/views/LifecycleDashboard.vue) - requirement_analysis 生成

