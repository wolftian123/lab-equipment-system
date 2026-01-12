# Copilot / AI Agent 指南 — lab-equipment-system

更新日期：2026年1月12日



摘要
- 小型 Vue 3（Vue CLI）单页应用，使用 Vuex + Vue Router + Element Plus。无后端：认证、账号与数据在前端模拟（使用 localStorage + 辅助函数）。

常用命令
- 启动开发服务器：npm run serve
- 打包生产环境：npm run build
- 代码风格检查：npm run lint

项目整体概览
- UI：所有视图与页面在 `src/views`，可复用组件在 `src/components`（单文件组件，SFC）。主布局与导航位于 `src/views/MainLayout.vue`。
- 状态管理：单一 Vuex store 在 `src/store/index.js`（单模块），用户与会话状态会持久化到 localStorage。
- 路由与鉴权：`src/router/index.js` 使用动态 import() 懒加载组件，路由 meta 字段（如 `title`、`roles`、`requiresAuth`、`approvalType`）决定权限与页面标题。路由守卫实现完整的认证与基于角色的访问控制。
- UI 与样式：基于 Element Plus（组件库）与 Element Plus 图标库（图标在 `src/main.js` 全局注册）。

重要约定（请把这些视为权威规范）
- 基于角色的权限控制：路由通过 `meta.roles` 声明允许的角色数组，路由守卫根据 `store.state.user.role` 执行检查并在权限不足时重定向。
  - 示例：仪表盘路由使用 `meta.roles: ['student','teacher','admin','director','external']`。
- 认证为前端模拟并持久化：关键 localStorage 键为 `user` 和 `token`。store 使用 `SET_USER` / `SET_TOKEN` 提交认证信息，辅助函数 `generateToken()` 用于生成模拟 token。
  - 测试账号在 `src/store/index.js` 的 `getTestAccount()` 中定义，并在 `src/views/Login.vue` 中为快速登录卡片复用（前端模拟登录）。
  - 已知测试凭证（可在登录页面直接点击登录）：
    - 学生: 2023123456 / student123
    - 教师: 10001 / teacher123
    - 管理员: admin001 / admin123
    - 校外人员: ext2024001 / external123
    - 负责人: director001 / director123
- 本地状态键：如 `sidebarCollapsed`、`preferences`、`visitLogs`、`pendingCounts` 等保存在 localStorage，清除 localStorage 会重置开发时状态。
- 懒加载与组件设计：所有路由组件使用动态 import() 切分 chunk，保持组件小而无副作用可避免加载失败或 chunk 问题。
- 图标使用：Element Plus 图标在 `src/main.js` 全局注册，模板中可直接使用图标组件（通常无需在每个文件中单独导入）。

项目中的易踩坑与具体说明
- Token 过期检测问题（路由守卫）：路由通过对 token 用 '_' 分割并 parseInt 最后一段来计算 tokenAge；但 `generateToken` 把 Date.now() 放在 token 的中段并在末尾追加随机串，导致解析时可能得到 0，从而触发误判的刷新/退出逻辑。请检查 `src/store/index.js`（生成 token）与 `src/router/index.js`（token 校验）。
- 路由标题：路由会根据 `meta.title`（优先子页面，再父页面）设置 document.title，新增嵌套路由时请确保设置合适的 `meta.title`。
- 模拟数据位置：需修改样例用户、待审批计数等模拟响应时，请优先修改 `src/store/index.js` 与 `src/views/Login.vue`（Login 页面也含有快速登录的重复数据）。
- 调试日志较多：路由守卫在开发环境会输出大量调试信息（便于交互式调试），可以使用浏览器控制台与 localStorage 快速检查当前状态。

常见改动 / 关注文件
- 添加新路由或角色：编辑 `src/router/index.js`（遵循现有的 `meta` 模式），并在 `src/views/MainLayout.vue` 中调整侧边栏菜单显示逻辑以反映新权限。
- 接入真实后端或修改认证：编辑 `src/store/index.js`（替换模拟登录/refreshToken 逻辑为真实 API；移除 localStorage-only 假设）。
- 增加新页面组件：按现有 SFC 规范编写并在路由中使用懒加载（dynamic import）。

测试与 CI 说明
- 当前仓库未包含测试用例：可按需要添加单元/端到端测试（构建流程基于 Vue CLI）。
- 代码风格检查：`npm run lint` 可用于静态检查。

需要我继续扩展吗？
- 我可以：加入简短的 PR 检查清单（3–6 条）、或添加一个简单的脚本/CI 检查以检测 token 解析问题。请告诉我你希望我接下来做哪一项，我可以继续实现。