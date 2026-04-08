import Link from 'next/link';
import {
  CheckCircle,
  Clock,
  Download,
  Image as ImageIcon,
  Loader2,
  Music,
  RefreshCw,
  Video,
  XCircle,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { AIMediaType, AITaskStatus } from '@/extensions/ai';
import { AudioPlayer, Empty, LazyImage } from '@/shared/blocks/common';
import { cn } from '@/shared/lib/utils';
import { AITask, getAITasks, getAITasksCount } from '@/shared/models/ai_task';
import { getUserInfo } from '@/shared/models/user';
import { Button, Tab } from '@/shared/types/blocks/common';

export default async function AiTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: number; pageSize?: number; type?: string }>;
}) {
  const { page: pageNum, pageSize, type } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 10;

  const user = await getUserInfo();
  if (!user) {
    return <Empty message="no auth" />;
  }

  const t = await getTranslations('activity.ai-tasks');

  const aiTasks = await getAITasks({
    userId: user.id,
    mediaType: type,
    page,
    limit,
  });

  const total = await getAITasksCount({
    userId: user.id,
    mediaType: type,
  });

  const tabs: Tab[] = [
    {
      name: 'all',
      title: t('list.tabs.all'),
      url: '/activity/ai-tasks',
      is_active: !type || type === 'all',
    },
    {
      name: 'music',
      title: t('list.tabs.music'),
      url: '/activity/ai-tasks?type=music',
      is_active: type === 'music',
    },
    {
      name: 'image',
      title: t('list.tabs.image'),
      url: '/activity/ai-tasks?type=image',
      is_active: type === 'image',
    },
    {
      name: 'video',
      title: t('list.tabs.video'),
      url: '/activity/ai-tasks?type=video',
      is_active: type === 'video',
    },
    {
      name: 'audio',
      title: t('list.tabs.audio'),
      url: '/activity/ai-tasks?type=audio',
      is_active: type === 'audio',
    },
    {
      name: 'text',
      title: t('list.tabs.text'),
      url: '/activity/ai-tasks?type=text',
      is_active: type === 'text',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case AITaskStatus.SUCCESS:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case AITaskStatus.PENDING:
      case AITaskStatus.PROCESSING:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case AITaskStatus.FAILED:
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case AIMediaType.MUSIC:
        return <Music className="h-4 w-4 text-purple-500" />;
      case AIMediaType.IMAGE:
        return <ImageIcon className="h-4 w-4 text-blue-500" />;
      case AIMediaType.VIDEO:
        return <Video className="h-4 w-4 text-green-500" />;
      default:
        return <Music className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case AITaskStatus.SUCCESS:
        return t('status.success');
      case AITaskStatus.PENDING:
        return t('status.pending');
      case AITaskStatus.PROCESSING:
        return t('status.processing');
      case AITaskStatus.FAILED:
        return t('status.failed');
      default:
        return status;
    }
  };

  const renderTaskResult = (item: AITask) => {
    if (item.taskInfo) {
      try {
        const taskInfo = JSON.parse(item.taskInfo);
        if (taskInfo.errorMessage) {
          return (
            <div
              className="max-w-full cursor-help truncate text-sm text-red-500"
              title={taskInfo.errorMessage}
            >
              ❌ 失败: {taskInfo.errorMessage}
            </div>
          );
        } else if (taskInfo.songs && taskInfo.songs.length > 0) {
          const songs: any[] = taskInfo.songs.filter(
            (song: any) => song.audioUrl
          );
          if (songs.length > 0) {
            return (
              <div className="w-full space-y-2">
                {songs.slice(0, 2).map((song: any) => (
                  <AudioPlayer
                    key={song.id}
                    src={song.audioUrl}
                    title={song.title}
                    className="w-full"
                  />
                ))}
              </div>
            );
          }
        } else if (taskInfo.images && taskInfo.images.length > 0) {
          return (
            <div className="flex flex-wrap gap-2">
              {taskInfo.images.slice(0, 3).map((image: any, index: number) => (
                <div key={index} className="group relative">
                  <LazyImage
                    src={image.imageUrl}
                    alt="Generated image"
                    className="h-16 w-28 rounded-lg object-cover shadow-sm"
                  />
                  <a
                    href={image.imageUrl}
                    download
                    className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Download className="h-4 w-4 text-white" />
                  </a>
                </div>
              ))}
            </div>
          );
        } else if (taskInfo.videos && taskInfo.videos.length > 0) {
          return (
            <div className="flex gap-2">
              {taskInfo.videos.slice(0, 2).map((video: any, index: number) => (
                <video
                  key={index}
                  src={video.url ?? video.videoUrl ?? video}
                  controls
                  className="h-20 w-auto rounded-lg shadow-sm"
                  preload="metadata"
                />
              ))}
            </div>
          );
        }
      } catch (e) {
        //
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {tabs.map((tab) => (
          <div key={tab.name}>
            <Link
              href={tab.url as any}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95',
                tab.is_active
                  ? 'from-primary to-primary/90 text-primary-foreground shadow-primary/20 bg-gradient-to-r shadow-lg'
                  : 'bg-muted/50 hover:bg-muted/80 text-muted-foreground hover:shadow-md'
              )}
            >
              {tab.title}
            </Link>
          </div>
        ))}
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {aiTasks.length === 0 ? (
          <Empty message={t('list.empty_message')} />
        ) : (
          aiTasks.map((task, index) => (
            <div
              key={task.id}
              className="bg-card border-border/50 hover:border-primary/30 group hover:shadow-primary/5 rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                {/* Left: Icon + Info */}
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted/50 rounded-lg p-2">
                        {getMediaTypeIcon(task.mediaType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="line-clamp-2 cursor-help font-medium"
                          title={task.prompt || ''}
                        >
                          {task.prompt || t('list.empty_prompt')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span
                        className={cn(
                          'rounded-full px-2 py-1 text-xs font-medium',
                          task.status === AITaskStatus.SUCCESS &&
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                          task.status === AITaskStatus.FAILED &&
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                          (task.status === AITaskStatus.PENDING ||
                            task.status === AITaskStatus.PROCESSING) &&
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        )}
                      >
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <span className="flex items-center gap-1">
                      <span className="text-foreground/80 font-medium">
                        {task.provider}
                      </span>
                      <span>·</span>
                      <span>{task.model}</span>
                    </span>
                    {task.costCredits && (
                      <span>
                        {t('fields.cost_credits')}:{task.costCredits}
                      </span>
                    )}
                    <span className="ml-auto">
                      {new Date(task.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>

                {/* Right: Result Preview */}
                <div className="flex-shrink-0 md:w-64">
                  {renderTaskResult(task)}
                </div>
              </div>

              {/* Actions */}
              <div className="border-border/30 mt-4 flex items-center justify-between border-t pt-4">
                <div className="flex gap-2">
                  {(task.status === AITaskStatus.PENDING ||
                    task.status === AITaskStatus.PROCESSING) && (
                    <Link
                      href={`/activity/ai-tasks/${task.id}/refresh`}
                      className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      {t('list.buttons.refresh')}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > limit &&
        (() => {
          const totalPages = Math.ceil(total / limit);
          const pageNumbers: number[] = [];

          // 生成页码逻辑：最多显示7个页码，当前页居中
          if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
              pageNumbers.push(i);
            }
          } else {
            if (page <= 4) {
              for (let i = 1; i <= 5; i++) {
                pageNumbers.push(i);
              }
              pageNumbers.push(-1);
              pageNumbers.push(totalPages);
            } else if (page >= totalPages - 3) {
              pageNumbers.push(1);
              pageNumbers.push(-1);
              for (let i = totalPages - 4; i <= totalPages; i++) {
                pageNumbers.push(i);
              }
            } else {
              pageNumbers.push(1);
              pageNumbers.push(-1);
              for (let i = page - 1; i <= page + 1; i++) {
                pageNumbers.push(i);
              }
              pageNumbers.push(-1);
              pageNumbers.push(totalPages);
            }
          }

          const getPageUrl = (p: number) => {
            let url = `/activity/ai-tasks?page=${p}`;
            if (type && type !== 'all') {
              url += `&type=${type}`;
            }
            return url;
          };

          return (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
              {page > 1 && (
                <Link
                  href={getPageUrl(page - 1) as any}
                  className="bg-muted hover:bg-muted/80 rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                >
                  {t('pagination.prev')}
                </Link>
              )}

              {pageNumbers.map((num, index) =>
                num === -1 ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="text-muted-foreground px-2"
                  >
                    ...
                  </span>
                ) : (
                  <Link
                    key={num}
                    href={getPageUrl(num) as any}
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95',
                      num === Number(page)
                        ? 'bg-primary text-primary-foreground shadow-primary/20 shadow-lg'
                        : 'bg-muted hover:bg-muted/80 hover:shadow-md'
                    )}
                  >
                    {num}
                  </Link>
                )
              )}

              {page < totalPages && (
                <Link
                  href={getPageUrl(page + 1) as any}
                  className="bg-muted hover:bg-muted/80 rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                >
                  {t('pagination.next')}
                </Link>
              )}

              <span className="text-muted-foreground ml-4 text-xs">
                {t('pagination.total', { total })}
              </span>
            </div>
          );
        })()}
    </div>
  );
}
