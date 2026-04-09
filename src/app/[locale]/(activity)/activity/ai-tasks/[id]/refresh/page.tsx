import { getTranslations } from 'next-intl/server';

import { redirect } from '@/core/i18n/navigation';
import { AITaskStatus } from '@/extensions/ai';
import { Empty } from '@/shared/blocks/common';
import { findAITaskById, updateAITaskById } from '@/shared/models/ai_task';
import { getAIService } from '@/shared/services/ai';

export default async function RefreshAITaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ page?: number; type?: string }>;
}) {
  const { locale, id } = await params;
  const { page, type } = await searchParams;
  const t = await getTranslations('activity.ai-tasks');

  const task = await findAITaskById(id);
  if (!task || !task.taskId || !task.provider || !task.status) {
    return <Empty message="Task not found" />;
  }

  // query task
  if (
    [AITaskStatus.PENDING, AITaskStatus.PROCESSING].includes(
      task.status as AITaskStatus
    )
  ) {
    const aiService = await getAIService();
    const aiProvider = aiService.getProvider(task.provider);
    if (!aiProvider) {
      return <Empty message="Invalid AI provider" />;
    }

    const result = await aiProvider?.query?.({
      taskId: task.taskId,
      aiTaskId: task.id,
      mediaType: task.mediaType,
      model: task.model,
    });

    if (result && result.taskStatus && result.taskInfo) {
      await updateAITaskById(task.id, {
        status: result.taskStatus,
        taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
        taskResult: result.taskResult
          ? JSON.stringify(result.taskResult)
          : null,
      });
    }
  }

  let redirectUrl = `/activity/ai-tasks`;
  if (page) {
    redirectUrl += `?page=${page}`;
    if (type && type !== 'all') {
      redirectUrl += `&type=${type}`;
    }
  } else if (type && type !== 'all') {
    redirectUrl += `?type=${type}`;
  }

  redirect({ href: redirectUrl, locale });
}
