import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Application } from 'express';
import 'dotenv/config'

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0', // Chuẩn OpenAPI version 3
    info: {
      title: 'API Document - Express Supabase',
      version: '1.0.0',
      description: 'Tài liệu API cho dự án Node.js + Express + Supabase',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}/api`,
        description: 'Development Server (backend direct)',
      },
      {
        url: `http://localhost:${process.env.GATEWAY_PORT || 8080}/api`,
        description: 'API Gateway',
      },
    ],
    // Cấu hình Nút "Authorize" (ổ khóa) để test API có bảo mật bằng JWT
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Nơi Swagger sẽ quét để tìm các comment tài liệu (đọc file route)
  apis: ['./src/routes/*.ts'], 
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Application) => {
  // Đường dẫn truy cập UI: /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📄 Swagger UI đang chạy tại http://localhost:${process.env.PORT}/api-docs`);
};