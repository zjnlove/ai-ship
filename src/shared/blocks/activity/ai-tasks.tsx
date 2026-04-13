'use client';

import { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Download,
  ImageIcon,
  Loader2,
  Music,
  RefreshCw,
  Video,
  XCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { AudioPlayer, LazyImage } from '@/shared/blocks/common';
import { cn } from '@/shared/lib/utils';

const AITaskStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

type AITask = any;

interface AITaskListClientProps {
  initialTasks: AITask[];
  page: number;
  type?: string;
}

export function AITaskListClient({
  initialTasks,
  page,
  type,
}: AITaskListClientProps) {
  const [tasks, setTasks] = useState<AITask[]>(initialTasks);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const t = useTranslations('activity.ai-tasks');

  const handleRefreshTask = async (taskId: string) => {
    if (refreshingId) return;

    setRefreshingId(taskId);

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? ({ ...task, _refreshing: true } as any) : task
      )
    );

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      const data = await res.json();
      console.log(data.data.status);
      console.log(data.data);
      if (data.data.status && data.data) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...data.data, _refreshing: false } : task
          )
        );
      }
      toast.info('Refresh task success');
    } catch (err) {
      console.warn('Refresh task failed', err);
      toast.error('Refresh task failed');
    } finally {
      setRefreshingId(null);
    }
  };

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'music':
        return <Music className="h-4 w-4 text-purple-500" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-blue-500" />;
      case 'video':
        return <Video className="h-4 w-4 text-green-500" />;
      default:
        return <Music className="h-4 w-4 text-gray-500" />;
    }
  };

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
                  className="h-20 w-140 rounded-lg shadow-sm"
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

  const TaskRefreshButton = ({
    task,
    refreshing,
    onRefresh,
    className,
  }: {
    task: AITask;
    refreshing: boolean;
    onRefresh: () => void;
    className?: string;
  }) => {
    if (
      task.status !== AITaskStatus.PENDING &&
      task.status !== AITaskStatus.PROCESSING
    ) {
      return null;
    }

    return (
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className={cn(
          'text-primary hover:text-primary/80 flex items-center gap-1 text-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      >
        {refreshing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
        {t('list.buttons.refresh')}
      </button>
    );
  };

  return (
    <>
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className="bg-card border-border/50 hover:border-primary/30 group hover:shadow-primary/5 rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex-1 space-y-3">
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

              <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="flex items-center gap-1">
                  {/* <span className="text-foreground/80 font-medium">
                    {task.provider}
                  </span>
                  <span>·</span> */}
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

            <div className="flex-shrink-0 md:w-64">
              {renderTaskResult(task)}
            </div>
          </div>

          <div className="border-border/30 mt-4 flex items-center justify-between border-t pt-4">
            <div className="flex gap-2">
              <TaskRefreshButton
                task={task}
                refreshing={refreshingId === task.id}
                onRefresh={() => handleRefreshTask(task.id)}
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
