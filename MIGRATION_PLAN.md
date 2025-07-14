# Next.js 迁移计划 (Pinterest 图片应用)

本文档旨在为您提供一个清晰、可执行的计划，将现有的 React + Python 图片应用迁移到一个现代化的、统一的全栈 Next.js 应用中。

## 1. 最终目标

- **统一技术栈:** 将前后端代码整合到一个 Next.js 项目中，使用 JavaScript/TypeScript 进行全栈开发。
- **优化性能:** 利用 Next.js 的服务端渲染 (SSR) 和静态站点生成 (SSG) 特性，提升页面加载速度和 SEO。
- **现代化部署:** 适配 Serverless 架构，无缝部署到 Vercel 平台。
- **可扩展的图片存储:** 建立一个能够支持大量图片、与 Serverless 环境兼容的存储方案。

---

## 2. 核心技术选型

| 类别 | 技术 | 理由 |
| :--- | :--- | :--- |
| **核心框架** | **Next.js (App Router)** | 官方推荐的最新路由模式，提供更灵活的布局和组件嵌套能力。 |
| **开发语言** | **TypeScript** | 提供类型安全，减少运行时错误，使大型项目更易于维护。 |
| **图片存储** | **Vercel Blob** | **关键决策点。** Vercel 官方提供的对象存储服务，与 Vercel 部署无缝集成，配置简单，按需付费。它完美解决了 Serverless 环境下无���持久化保存本地文件的问题。 |
| **数据库** | **Vercel Postgres** | 强烈推荐。用于存储图片的元数据（如 Blob URL、上传者、标签、尺寸等）。同样与 Vercel 无缝集成，提供了一个可靠的数据持久化层。 |
| **图像处理** | **Sharp (Node.js 库)** | 高性能的 Node.js 图像处理库，用于替代 Python 中的 `Pillow` 或 `OpenCV`，可以在图片上传时进行压缩、格式转换、尺寸调整等操作。 |

---

## 3. 迁移实施步骤

### Phase 1: 项目初始化与环境设置

1.  **创建 Next.js 项目:**
    ```bash
    npx create-next-app@latest pinterest-next-app --typescript --tailwind --eslint
    ```
    *(使用 TypeScript, Tailwind CSS 和 ESLint 初始化项目)*

2.  **关联 Vercel 并设置存储:**
    - 在 Vercel 官网上创建一个新的项目，但暂时不要关联 Git 仓库。
    - 进入项目仪表盘，选择 "Storage" 标签页。
    - 创建一个新的 **Vercel Blob** 存储，并获取其 `BLOB_READ_WRITE_TOKEN`。
    - 创建一个新的 **Vercel Postgres** 数据库，并获取其连接字符串。

3.  **配置环境变量:**
    - 在 Next.js 项目根目录下创建 `.env.local` 文件。
    - 将从 Vercel 获取的密钥和连接字符串添加进去：
      ```
      BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
      POSTGRES_URL="postgres://..."
      ```

### Phase 2: 前端组件与页面迁移

1.  **迁移组件:**
    - 将 `react_image_app/src/components/` 目录下的所有 `.js` 和 `.css` 文件复制到新项目 `pinterest-next-app/src/app/components/` 中。
    - 将 `.js` 文件重命名为 `.tsx`。

2.  **创建页面路由:**
    - **首页 (图片瀑布流):** 创建 `src/app/page.tsx`。这个页面将负责展示所有图片。
    - **我的图片页:** 创建 `src/app/my-images/page.tsx`。
    - **上传页 (可选):** 可以创建一个专门的上传页面 `src/app/upload/page.tsx`，或者将上传功能做成一个模态框组件。

3.  **调整和改造组件:**
    - **Navbar:** 改造 `Navbar.js`，使用 Next.js 的 `<Link>` 组件进行页面跳转。
    - **ImageWaterfall:** 这个组件将从服务器组件 (`page.tsx`) 获取初始图片数据，以实现快速加载。
    - **ImageUpload:**
        - 必须声明为客户端组件 (`"use client"`)。
        - 其表单提交逻辑需要调用我们将在 Phase 3 中创建的 `/api/upload` 接口。
    - **样式迁移:** 在主布局文件 `src/app/layout.tsx` 中导入全局 CSS。

### Phase 3: 后端 API 重写 (核心工作)

这是将原 `python_api` 功能用 Next.js API Routes 重写的关键阶段。

1.  **创建数据库���结构:**
    - 编写一个脚本或在 Vercel Postgres 的管理界面执行 SQL，创建 `images` 表。
      ```sql
      CREATE TABLE images (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL, -- Vercel Blob 返回的 URL
        pathname TEXT NOT NULL, -- Vercel Blob 返回的路径名，用于删除
        uploader_id VARCHAR(255), -- 将来用于关联用户
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ```

2.  **实现图片上传 API:**
    - 创建 `src/app/api/upload/route.ts`。
    - **功能:**
        - 接收来自前端的 `FormData`。
        - **(推荐) 使用 `sharp` 库对图片进行预处理** (如压缩、统一格式为 webp)。
        - 使用 `@vercel/blob` 包的 `put` 方法将处理后的图片上传到 Vercel Blob。
        - 将 Vercel Blob 返回的 `url` 和 `pathname` 存入 Vercel Postgres 数据库。
        - 返回成功或失败的响应。

3.  **实现图片获取 API:**
    - 创建 `src/app/api/images/route.ts`。
    - **功能:**
        - 从 Vercel Postgres 数据库中查询图片列表 (可以实现分页逻辑)。
        - 以 JSON 格式返回图片数据列表。

4.  **实现图片删除 API (可选):**
    - 创建 `src/app/api/images/[id]/route.ts`。
    - **功能:**
        - 从数据库中根据 `id` 找到��片的 `pathname`。
        - 使用 `@vercel/blob` 包的 `del` 方法从 Vercel Blob 中删除图片文件。
        - 从数据库中删除该条记录。

### Phase 4: 现有数据迁移

您现有的图片 (`nice_imgs/`, `reddit_imgs/` 等) 需要被上传到新的存储系统中。

1.  **编写一次性迁移脚本:**
    - 在项目根目录下创建一个独立的脚本 `scripts/migrate-images.mjs`。
    - **脚本逻辑:**
        - 读取本地图片文件夹 (`/python_api/nice_imgs` 等)。
        - 遍历每一张图片。
        - 调用 `@vercel/blob` 的 `put` 方法将其上传。
        - 将返回的 `url` 和 `pathname` 存入 Vercel Postgres 数据库。
    - **执行:** 在本地运行 `node scripts/migrate-images.mjs` 来完成数据迁移。

### Phase 5: 部署与发布

1.  **推送到 GitHub:**
    - 初始化 Git，将 `pinterest-next-app` 项目推送到一个新的 GitHub 仓库。

2.  **连接 Vercel:**
    - 回到您在 Phase 1 创建的 Vercel 项目。
    - 将其与新的 GitHub 仓库关联。

3.  **配置环境变量:**
    - 在 Vercel 项目的 "Settings" -> "Environment Variables" 中，添加您在 `.env.local` 中使用的所有变量。

4.  **部署:**
    - Vercel 会在您每次推送到主分支时自动拉取代码、构建并部署应用。
    - 监控部���日志，确保一切正常。

---

## 4. 总结

通过以上步骤，您可以系统地将现有应用迁移到一个功能更强大、性能更优、技术栈更统一的 Next.js 全栈应用。

**最大的挑战**在于 **Phase 3 (后端 API 重写)** 和 **Phase 4 (数据迁移)**，因为这涉及到新的服务 (Vercel Blob, Vercel Postgres) 和新的开发模式。建议您在开始编码前，先花少量时间熟悉 `Vercel Blob` 和 `Vercel Postgres` 的官方文档。
