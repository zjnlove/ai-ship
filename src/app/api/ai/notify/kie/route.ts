'use server';

import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { r } from 'node_modules/fumadocs-core/dist/remark-structure-DkCXCzpD';

import { respData, respErr } from '@/shared/lib/resp';

// 环境变量密钥（从 .env.local 读取）
const WEBHOOK_HMAC_KEY =
  process.env.KIE_WEBHOOK_HMAC_KEY ||
  'cb1d380cdd24bf1a46c441efe3f8aeb6948aa13b52b2aa99bdd66356e3da39d9';

/**
 * KIE Webhook POST 接口
 * 完整实现官方签名校验规范
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[KIE] Received callback notification');

    // 1. 获取请求头与原始请求体（必须用原始文本校验签名）
    const headers = req.headers;
    const rawBody = await req.text();
    const timestamp = headers.get('x-webhook-timestamp');
    const signature = headers.get('x-webhook-signature');

    console.log('[KIE] Received headers:', { timestamp, signature });
    console.log('[KIE] Received raw body:', rawBody);

    // 2. 核心：校验 Webhook 签名
    const isSignatureValid = await verifyWebhookSignature(headers, rawBody);
    if (!isSignatureValid) {
      console.error('[KIE] Webhook signature verification failed');
      return respErr('Invalid signature');
    }

    // 3. 签名校验通过，处理业务逻辑（此处可解析 body 处理数据）
    const body = JSON.parse(rawBody);
    console.log('[KIE] Webhook data processing:', body);

    // 4. 返回成功响应
    return respData({ success: true, message: 'Webhook processed' });
  } catch (e: any) {
    console.error('[KIE] Callback processing failed:', e);
    return respErr('Server error');
  }
}

/**
 * 校验 KIE Webhook 签名（完整官方规范）
 */
async function verifyWebhookSignature(
  headers: Headers,
  rawBody: string
): Promise<boolean> {
  // 1. 校验必要请求头
  const timestamp = headers.get('x-webhook-timestamp');
  const receivedSignature = headers.get('x-webhook-signature');
  console.log(
    '[KIE] Verifying signature with timestamp:',
    timestamp,
    receivedSignature,
    WEBHOOK_HMAC_KEY
  );
  if (!timestamp || !receivedSignature || !WEBHOOK_HMAC_KEY) {
    console.error('[KIE] Missing signature headers or secret key');
    return false;
  }

  // 2. 解析请求体（必须用原始 body 解析）
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (err) {
    console.error('[KIE] Invalid JSON body');
    return false;
  }

  // 3. 校验 task_id 必传字段
  const taskId = body.data?.taskId;
  if (!taskId) {
    console.error('[KIE] Missing task_id in request body');
    return false;
  }

  // 4. 执行签名校验
  return verifySignature(
    taskId,
    timestamp,
    receivedSignature,
    WEBHOOK_HMAC_KEY
  );
}

/**
 * 签名比对（安全比较，防时序攻击）
 */
function verifySignature(
  taskId: string,
  timestampSeconds: string,
  receivedSignature: string,
  secret: string
): boolean {
  try {
    // 生成预期签名
    const expectedSignature = generateSignature(
      taskId,
      timestampSeconds,
      secret
    );

    // 安全比对（固定时间比较，防止破解）
    return timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    );
  } catch (err) {
    console.error('[KIE] Signature comparison failed');
    return false;
  }
}

/**
 * 生成 HMAC-SHA256 签名（KIE 官方算法）
 */
function generateSignature(
  taskId: string,
  timestampSeconds: string,
  secret: string
): string {
  // 官方拼接规则：taskId.timestamp
  const dataToSign = `${taskId}.${timestampSeconds}`;

  // HMAC-SHA256 + Base64 编码
  return createHmac('sha256', secret).update(dataToSign).digest('base64');
}
