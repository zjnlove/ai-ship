'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CreditCard,
  Download,
  Loader2,
  Sparkles,
  User,
  Video,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Link, usePathname } from '@/core/i18n/navigation';
import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import { ImageUploader, ImageUploaderValue } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAppContext } from '@/shared/contexts/app';
import { cn } from '@/shared/lib/utils';

import {
  getVideoOptionLabel,
  getVideoOptionsForType,
  MODEL_OPTIONS,
  PROVIDER_OPTIONS,
  VideoOptionType,
} from './video-config';

interface VideoGeneratorProps {
  maxSizeMB?: number;
  srOnlyTitle?: string;
  className?: string;
}

interface GeneratedVideo {
  id: string;
  url: string;
  provider?: string;
  model?: string;
  prompt?: string;
}

interface BackendTask {
  id: string;
  status: string;
  provider: string;
  model: string;
  prompt: string | null;
  taskInfo: string | null;
  taskResult: string | null;
}

type VideoGeneratorTab = 'text-to-video' | 'image-to-video' | 'video-to-video';

const POLL_INTERVAL = 15000;
const GENERATION_TIMEOUT = 600000; // 10 minutes for video
const MAX_PROMPT_LENGTH = 2000;

const textToVideoCredits = 6;
const imageToVideoCredits = 8;
const videoToVideoCredits = 10;

function parseTaskResult(taskResult: string | null): any {
  if (!taskResult) {
    return null;
  }

  try {
    return JSON.parse(taskResult);
  } catch (error) {
    console.warn('Failed to parse taskResult:', error);
    return null;
  }
}

function extractVideoUrls(result: any): string[] {
  if (!result) {
    return [];
  }

  // check videos array first
  const videos = result.videos;
  if (videos && Array.isArray(videos)) {
    return videos
      .map((item: any) => {
        if (!item) return null;
        if (typeof item === 'string') return item;
        if (typeof item === 'object') {
          return (
            item.url ?? item.uri ?? item.video ?? item.src ?? item.videoUrl
          );
        }
        return null;
      })
      .filter(Boolean);
  }

  // check output
  const output = result.output ?? result.video ?? result.data;

  if (!output) {
    return [];
  }

  if (typeof output === 'string') {
    return [output];
  }

  if (Array.isArray(output)) {
    return output
      .flatMap((item) => {
        if (!item) return [];
        if (typeof item === 'string') return [item];
        if (typeof item === 'object') {
          const candidate =
            item.url ?? item.uri ?? item.video ?? item.src ?? item.videoUrl;
          return typeof candidate === 'string' ? [candidate] : [];
        }
        return [];
      })
      .filter(Boolean);
  }

  if (typeof output === 'object') {
    const candidate =
      output.url ?? output.uri ?? output.video ?? output.src ?? output.videoUrl;
    if (typeof candidate === 'string') {
      return [candidate];
    }
  }

  return [];
}

export function VideoGenerator({
  maxSizeMB = 50,
  srOnlyTitle,
  className,
}: VideoGeneratorProps) {
  const t = useTranslations('ai.video.generator');

  const [activeTab, setActiveTab] =
    useState<VideoGeneratorTab>('text-to-video');

  const [costCredits, setCostCredits] = useState<number>(textToVideoCredits);
  const [provider, setProvider] = useState(PROVIDER_OPTIONS[0]?.value ?? '');
  const [model, setModel] = useState(
    MODEL_OPTIONS[0]?.sceneValues?.['text-to-video'] ?? ''
  );
  const [prompt, setPrompt] = useState('');
  const [referenceImageItems, setReferenceImageItems] = useState<
    ImageUploaderValue[]
  >([]);
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [referenceVideoUrl, setReferenceVideoUrl] = useState<string>('');
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(
    null
  );
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [downloadingVideoId, setDownloadingVideoId] = useState<string | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState<Record<string, any>>(
    {}
  );
  const [imageToVideoMode, setImageToVideoMode] =
    useState<string>('REFERENCE_2_VIDEO');

  const pathname = usePathname();

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 监听模型变化，自动更新积分
  useEffect(() => {
    const selectedModel = MODEL_OPTIONS.find(
      (option) => option.sceneValues?.[activeTab] === model
    );

    if (selectedModel?.credits?.[activeTab]) {
      setCostCredits(parseInt(selectedModel.credits[activeTab]));
    } else {
      // 如果模型没有配置积分，使用默认值
      if (activeTab === 'text-to-video') {
        setCostCredits(textToVideoCredits);
      } else if (activeTab === 'image-to-video') {
        setCostCredits(imageToVideoCredits);
      } else {
        setCostCredits(videoToVideoCredits);
      }
    }
  }, [model, activeTab]);

  useEffect(() => {
    if (pathname.includes('video-to-video')) {
      setActiveTab('video-to-video');
    } else if (pathname.includes('image-to-video')) {
      setActiveTab('image-to-video');
    }
  }, [pathname]);

  const promptLength = prompt.trim().length;
  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const isPromptTooLong = promptLength > MAX_PROMPT_LENGTH;
  const isTextToVideoMode = activeTab === 'text-to-video';
  const isImageToVideoMode = activeTab === 'image-to-video';
  const isVideoToVideoMode = activeTab === 'video-to-video';

  const handleTabChange = (value: string) => {
    const tab = value as VideoGeneratorTab;
    setActiveTab(tab);

    const availableModels = MODEL_OPTIONS.filter(
      (option) =>
        option.sceneValues?.[tab] !== undefined && option.brand === provider
    );

    if (availableModels.length > 0) {
      setModel(availableModels[0].sceneValues?.[tab] ?? '');
    } else {
      setModel('');
    }

    if (tab === 'text-to-video') {
      setCostCredits(textToVideoCredits);
    } else if (tab === 'image-to-video') {
      setCostCredits(imageToVideoCredits);
    } else if (tab === 'video-to-video') {
      setCostCredits(videoToVideoCredits);
    }
  };

  const handleProviderChange = (value: string) => {
    setProvider(value);

    const availableModels = MODEL_OPTIONS.filter(
      (option) =>
        option.sceneValues?.[activeTab] !== undefined && option.brand === value
    );

    if (availableModels.length > 0) {
      setModel(availableModels[0].sceneValues?.[activeTab] ?? '');
    } else {
      setModel('');
    }
  };

  const taskStatusLabel = useMemo(() => {
    if (!taskStatus) {
      return '';
    }

    switch (taskStatus) {
      case AITaskStatus.PENDING:
        return 'Waiting for the model to start';
      case AITaskStatus.PROCESSING:
        return 'Generating your video...';
      case AITaskStatus.SUCCESS:
        return 'Video generation completed';
      case AITaskStatus.FAILED:
        return 'Generation failed';
      default:
        return '';
    }
  }, [taskStatus]);

  const handleReferenceImagesChange = useCallback(
    (items: ImageUploaderValue[]) => {
      setReferenceImageItems(items);
      const uploadedUrls = items
        .filter((item) => item.status === 'uploaded' && item.url)
        .map((item) => item.url as string);
      setReferenceImageUrls(uploadedUrls);
    },
    []
  );

  const isReferenceUploading = useMemo(
    () => referenceImageItems.some((item) => item.status === 'uploading'),
    [referenceImageItems]
  );

  const hasReferenceUploadError = useMemo(
    () => referenceImageItems.some((item) => item.status === 'error'),
    [referenceImageItems]
  );

  const resetTaskState = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setTaskId(null);
    setGenerationStartTime(null);
    setTaskStatus(null);
  }, []);

  const pollTaskStatus = useCallback(
    async (id: string) => {
      try {
        if (
          generationStartTime &&
          Date.now() - generationStartTime > GENERATION_TIMEOUT
        ) {
          resetTaskState();
          toast.error('Video generation timed out. Please try again.');
          return true;
        }

        const resp = await fetch('/api/ai/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskId: id }),
        });

        if (!resp.ok) {
          throw new Error(`request failed with status: ${resp.status}`);
        }

        const { code, message, data } = await resp.json();
        if (code !== 0) {
          throw new Error(message || 'Query task failed');
        }

        const task = data as BackendTask;
        const currentStatus = task.status as AITaskStatus;
        setTaskStatus(currentStatus);

        const parsedResult = parseTaskResult(task.taskInfo);
        const videoUrls = extractVideoUrls(parsedResult);

        if (currentStatus === AITaskStatus.PENDING) {
          setProgress((prev) => Math.max(prev, 20));
          return false;
        }

        if (currentStatus === AITaskStatus.PROCESSING) {
          if (videoUrls.length > 0) {
            setGeneratedVideos(
              videoUrls.map((url, index) => ({
                id: `${task.id}-${index}`,
                url,
                provider: task.provider,
                model: task.model,
                prompt: task.prompt ?? undefined,
              }))
            );
            setProgress((prev) => Math.max(prev, 85));
          } else {
            setProgress((prev) => Math.min(prev + 5, 80));
          }
          return false;
        }

        if (currentStatus === AITaskStatus.SUCCESS) {
          if (videoUrls.length === 0) {
            toast.error('The provider returned no videos. Please retry.');
          } else {
            setGeneratedVideos(
              videoUrls.map((url, index) => ({
                id: `${task.id}-${index}`,
                url,
                provider: task.provider,
                model: task.model,
                prompt: task.prompt ?? undefined,
              }))
            );
            toast.success('Video generated successfully');
          }

          setProgress(100);
          resetTaskState();
          return true;
        }

        if (currentStatus === AITaskStatus.FAILED) {
          const errorMessage =
            parsedResult?.errorMessage || 'Generate video failed';
          toast.error(errorMessage);
          resetTaskState();

          fetchUserCredits();

          return true;
        }

        setProgress((prev) => Math.min(prev + 3, 95));
        return false;
      } catch (error: any) {
        console.error('Error polling video task:', error);
        toast.error(`Query task failed: ${error.message}`);
        resetTaskState();

        fetchUserCredits();

        return true;
      }
    },
    [generationStartTime, resetTaskState]
  );

  useEffect(() => {
    if (!taskId || !isGenerating) {
      return;
    }

    let cancelled = false;

    const tick = async () => {
      if (!taskId) {
        return;
      }
      const completed = await pollTaskStatus(taskId);
      if (completed) {
        cancelled = true;
      }
    };

    tick();

    const interval = setInterval(async () => {
      if (cancelled || !taskId) {
        clearInterval(interval);
        return;
      }
      const completed = await pollTaskStatus(taskId);
      if (completed) {
        clearInterval(interval);
      }
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [taskId, isGenerating, pollTaskStatus]);

  const handleGenerate = async () => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    if (remainingCredits < costCredits) {
      toast.error('Insufficient credits. Please top up to keep creating.');
      return;
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt && isTextToVideoMode) {
      toast.error('Please enter a prompt before generating.');
      return;
    }

    if (!provider || !model) {
      toast.error('Provider or model is not configured correctly.');
      return;
    }

    if (isImageToVideoMode && referenceImageUrls.length === 0) {
      toast.error('Please upload a reference image before generating.');
      return;
    }

    if (isVideoToVideoMode && !referenceVideoUrl) {
      toast.error('Please provide a reference video URL before generating.');
      return;
    }

    setIsGenerating(true);
    setProgress(15);
    setTaskStatus(AITaskStatus.PENDING);
    setGeneratedVideos([]);
    setGenerationStartTime(Date.now());

    try {
      const options: any = {};

      if (isImageToVideoMode) {
        options.image_input = referenceImageUrls;
      }

      if (isVideoToVideoMode) {
        options.video_input = [referenceVideoUrl];
      }

      // 添加高级参数到 options
      const selectedModel = MODEL_OPTIONS.find(
        (option) => option.sceneValues?.[activeTab] === model
      );

      if (selectedModel?.advancedOptions?.supportedTypes) {
        selectedModel.advancedOptions.supportedTypes.forEach((type) => {
          const value =
            advancedOptions[type] ??
            selectedModel.defaultOptions?.[
              type === 'aspectRatio'
                ? 'aspect_ratio'
                : type === 'motionStrength'
                  ? 'motion_strength'
                  : type
            ];

          if (value) {
            // 映射字段名到 API 参数名
            const fieldMap: Record<string, string> = {
              aspectRatio: 'aspect_ratio',
              resolution: 'resolution',
              duration: 'duration',
              fps: 'fps',
              motionStrength: 'motion_strength',
              imageToVideoMode: 'generationType',
            };
            options[fieldMap[type] || type] = value;
          }
        });
      }

      // 对于 Veo 3.1 图生视频模式，直接使用 imageToVideoMode 状态
      if (isImageToVideoMode && selectedModel?.modelPath === 'veo-3-1') {
        options.generationType = imageToVideoMode;
      }

      // 根据当前选中的模型获取对应的积分消耗
      const modelCredits = selectedModel?.credits?.[activeTab]
        ? parseInt(selectedModel.credits[activeTab])
        : costCredits;

      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaType: AIMediaType.VIDEO,
          scene: activeTab,
          provider,
          model,
          prompt: trimmedPrompt,
          options,
          credits: modelCredits,
        }),
      });

      if (!resp.ok) {
        throw new Error(`request failed with status: ${resp.status}`);
      }

      const { code, message, data } = await resp.json();
      if (code !== 0) {
        throw new Error(message || 'Failed to create a video task');
      }

      const newTaskId = data?.id;
      if (!newTaskId) {
        throw new Error('Task id missing in response');
      }

      if (data.status === AITaskStatus.SUCCESS && data.taskInfo) {
        const parsedResult = parseTaskResult(data.taskInfo);
        const videoUrls = extractVideoUrls(parsedResult);

        if (videoUrls.length > 0) {
          setGeneratedVideos(
            videoUrls.map((url, index) => ({
              id: `${newTaskId}-${index}`,
              url,
              provider,
              model,
              prompt: trimmedPrompt,
            }))
          );
          toast.success('Video generated successfully');
          setProgress(100);
          resetTaskState();
          await fetchUserCredits();
          return;
        }
      }

      setTaskId(newTaskId);
      setProgress(25);

      await fetchUserCredits();
    } catch (error: any) {
      console.error('Failed to generate video:', error);
      toast.error(`Failed to generate video: ${error.message}`);
      resetTaskState();
    }
  };

  const handleDownloadVideo = async (video: GeneratedVideo) => {
    if (!video.url) {
      return;
    }

    try {
      setDownloadingVideoId(video.id);
      // fetch video via proxy
      const resp = await fetch(
        `/api/proxy/file?url=${encodeURIComponent(video.url)}`
      );
      if (!resp.ok) {
        throw new Error('Failed to fetch video');
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${video.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
      toast.success('Video downloaded');
    } catch (error) {
      console.error('Failed to download video:', error);
      toast.error('Failed to download video');
    } finally {
      setDownloadingVideoId(null);
    }
  };

  // 粒子背景组件
  function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 获取主题色
      const getPrimaryColor = () => {
        const primary = getComputedStyle(document.documentElement)
          .getPropertyValue('--primary')
          .trim();
        // oklch 格式: oklch(0.65 0.18 45)
        // 转换为 rgb
        const match = primary.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
        if (match) {
          const l = parseFloat(match[1]);
          const c = parseFloat(match[2]);
          const h = parseFloat(match[3]);
          // oklch 转 rgb 的简化计算
          const a = c * Math.cos((h * Math.PI) / 180);
          const b = c * Math.sin((h * Math.PI) / 180);
          const r = Math.round(
            Math.max(0, Math.min(255, (l + 0.3963 * a + 0.2158 * b) * 255))
          );
          const g = Math.round(
            Math.max(0, Math.min(255, (l - 0.1055 * a - 0.0638 * b) * 255))
          );
          const blue = Math.round(
            Math.max(0, Math.min(255, (l - 0.0894 * a - 1.2914 * b) * 255))
          );
          return { r, g, b: blue };
        }
        // 默认橙金色
        return { r: 255, g: 180, b: 50 };
      };

      const primaryColor = getPrimaryColor();

      // 设置画布大小
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // 粒子数组
      const particles: Array<{
        x: number;
        y: number;
        radius: number;
        vx: number;
        vy: number;
        opacity: number;
      }> = [];

      // 创建粒子
      const createParticles = () => {
        const particleCount = Math.floor(
          (canvas.width * canvas.height) / 15000
        );
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2,
          });
        }
      };
      createParticles();

      // 动画循环
      let animationId: number;
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制粒子
        particles.forEach((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          // 边界检测
          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

          // 绘制粒子
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${particle.opacity})`;
          ctx.fill();
        });

        // 绘制连线
        particles.forEach((p1, i) => {
          particles.slice(i + 1).forEach((p2) => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${0.1 * (1 - distance / 150)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        });

        animationId = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationId);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0"
        style={{ opacity: 0.6 }}
      />
    );
  }

  return (
    // <section className="py-16 md:py-24">
    <section className={cn('pb-10', className)}>
      {/* 粒子背景 */}
      <ParticleBackground />
      <ScrollAnimation>
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Card>
                <CardHeader>
                  {srOnlyTitle && <h2 className="sr-only">{srOnlyTitle}</h2>}
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    {t('title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                  <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="bg-primary/10 grid w-full grid-cols-3">
                      <TabsTrigger value="text-to-video">
                        {t('tabs.text-to-video')}
                      </TabsTrigger>
                      <TabsTrigger value="image-to-video">
                        {t('tabs.image-to-video')}
                      </TabsTrigger>
                      <TabsTrigger value="video-to-video">
                        {t('tabs.video-to-video')}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('form.provider')}</Label>
                      <Select
                        value={provider}
                        onValueChange={handleProviderChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t('form.select_provider')}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVIDER_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('form.model')}</Label>
                      <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('form.select_model')} />
                        </SelectTrigger>
                        <SelectContent>
                          {MODEL_OPTIONS.filter(
                            (option) =>
                              option.sceneValues?.[activeTab] !== undefined &&
                              option.brand === provider
                          ).map((option) => (
                            <SelectItem
                              key={option.label}
                              value={option.sceneValues?.[activeTab] ?? ''}
                            >
                              <span className="flex items-center gap-1">
                                <span>{option.label}</span>
                                {option.credits?.[activeTab] && (
                                  <span className="text-primary">
                                    ({option.credits[activeTab]} credits)
                                  </span>
                                )}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isImageToVideoMode && (
                    <div className="space-y-4">
                      {/* Veo 3.1 图生视频模式选择 */}
                      {(() => {
                        const selectedModel = MODEL_OPTIONS.find(
                          (option) => option.sceneValues?.[activeTab] === model
                        );
                        // 检查是否是 Veo 3.1 模型（通过 modelPath 判断）
                        const isVeo31 = selectedModel?.modelPath === 'veo-3-1';

                        if (!isVeo31) {
                          return null;
                        }

                        return (
                          <div className="space-y-2">
                            <Label className="text-xs">
                              Image to Video Mode
                            </Label>
                            <Select
                              value={imageToVideoMode}
                              onValueChange={setImageToVideoMode}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="REFERENCE_2_VIDEO">
                                  参考图模式 (1-3张图)
                                </SelectItem>
                                <SelectItem value="FIRST_AND_LAST_FRAMES_2_VIDEO">
                                  首尾帧模式 (2张图)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      })()}

                      <ImageUploader
                        title={t('form.reference_image')}
                        allowMultiple={true}
                        maxImages={
                          imageToVideoMode === 'FIRST_AND_LAST_FRAMES_2_VIDEO'
                            ? 2
                            : 3
                        }
                        maxSizeMB={maxSizeMB}
                        onChange={handleReferenceImagesChange}
                        emptyHint={
                          imageToVideoMode === 'FIRST_AND_LAST_FRAMES_2_VIDEO'
                            ? '请上传首帧和尾帧图片（共2张）'
                            : t('form.reference_image_placeholder')
                        }
                      />

                      {/* 图片数量提示 */}
                      {imageToVideoMode === 'FIRST_AND_LAST_FRAMES_2_VIDEO' && (
                        <p className="text-muted-foreground text-xs">
                          首尾帧模式：请上传2张图片，第一张为首帧，第二张为尾帧
                        </p>
                      )}
                      {imageToVideoMode === 'REFERENCE_2_VIDEO' && (
                        <p className="text-muted-foreground text-xs">
                          参考图模式：请上传1-3张参考图片
                        </p>
                      )}

                      {hasReferenceUploadError && (
                        <p className="text-destructive text-xs">
                          {t('form.some_images_failed_to_upload')}
                        </p>
                      )}
                    </div>
                  )}

                  {isVideoToVideoMode && (
                    <div className="space-y-2">
                      <Label htmlFor="video-url">
                        {t('form.reference_video')}
                      </Label>
                      <Textarea
                        id="video-url"
                        value={referenceVideoUrl}
                        onChange={(e) => setReferenceVideoUrl(e.target.value)}
                        placeholder={t('form.reference_video_placeholder')}
                        className="min-h-20"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="video-prompt">{t('form.prompt')}</Label>
                    <Textarea
                      id="video-prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={t('form.prompt_placeholder')}
                      className="min-h-32"
                    />
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>
                        {promptLength} / {MAX_PROMPT_LENGTH}
                      </span>
                      {isPromptTooLong && (
                        <span className="text-destructive">
                          {t('form.prompt_too_long')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 高级参数设置 */}
                  {(() => {
                    const selectedModel = MODEL_OPTIONS.find(
                      (option) => option.sceneValues?.[activeTab] === model
                    );
                    const advancedTypes =
                      selectedModel?.advancedOptions?.supportedTypes ?? [];

                    if (advancedTypes.length === 0) {
                      return null;
                    }

                    return (
                      <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">
                            Advanced Settings
                          </Label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {advancedTypes.map((type: VideoOptionType) => {
                            const options = getVideoOptionsForType(type);
                            const label = getVideoOptionLabel(type);
                            const currentValue =
                              advancedOptions[type] ??
                              selectedModel?.defaultOptions?.[
                                type === 'aspectRatio'
                                  ? 'aspect_ratio'
                                  : type === 'motionStrength'
                                    ? 'motion_strength'
                                    : type
                              ] ??
                              options[0]?.value;

                            return (
                              <div key={type} className="space-y-2">
                                <Label className="text-xs">{label}</Label>
                                <Select
                                  value={currentValue}
                                  onValueChange={(value) =>
                                    setAdvancedOptions((prev) => ({
                                      ...prev,
                                      [type]: value,
                                    }))
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue
                                      placeholder={`Select ${label.toLowerCase()}`}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {options.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {!isMounted ? (
                    <Button className="w-full" disabled size="lg">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('loading')}
                    </Button>
                  ) : isCheckSign ? (
                    <Button className="w-full" disabled size="lg">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('checking_account')}
                    </Button>
                  ) : user ? (
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleGenerate}
                      disabled={
                        isGenerating ||
                        (isTextToVideoMode && !prompt.trim()) ||
                        isPromptTooLong ||
                        isReferenceUploading ||
                        hasReferenceUploadError ||
                        (isImageToVideoMode &&
                          referenceImageUrls.length === 0) ||
                        (isVideoToVideoMode && !referenceVideoUrl)
                      }
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('generating')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          {t('generate')}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => setIsShowSignModal(true)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {t('sign_in_to_generate')}
                    </Button>
                  )}

                  {!isMounted ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary">
                        {t('credits_cost', { credits: costCredits })}
                      </span>
                      <span>{t('credits_remaining', { credits: 0 })}</span>
                    </div>
                  ) : user && remainingCredits > 0 ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary">
                        {t('credits_cost', { credits: costCredits })}
                      </span>
                      <span>
                        {t('credits_remaining', { credits: remainingCredits })}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-primary">
                          {t('credits_cost', { credits: costCredits })}
                        </span>
                        <span>
                          {t('credits_remaining', {
                            credits: remainingCredits,
                          })}
                        </span>
                      </div>
                      <Link href="/pricing">
                        <Button variant="outline" className="w-full" size="lg">
                          <CreditCard className="mr-2 h-4 w-4" />
                          {t('buy_credits')}
                        </Button>
                      </Link>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="space-y-2 rounded-lg border p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>{t('progress')}</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} />
                      {taskStatusLabel && (
                        <p className="text-muted-foreground text-center text-xs">
                          {taskStatusLabel}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <Video className="h-5 w-5" />
                    {t('generated_videos')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-8">
                  {generatedVideos.length > 0 ? (
                    <div className="space-y-6">
                      {generatedVideos.map((video) => (
                        <div key={video.id} className="space-y-3">
                          <div className="relative overflow-hidden rounded-lg border">
                            <video
                              src={video.url}
                              controls
                              className="h-auto w-full"
                              preload="metadata"
                            />

                            <div className="absolute right-2 bottom-2 flex justify-end text-sm">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="ml-auto"
                                onClick={() => handleDownloadVideo(video)}
                                disabled={downloadingVideoId === video.id}
                              >
                                {downloadingVideoId === video.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-4 w-4" />
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                        <Video className="text-muted-foreground h-10 w-10" />
                      </div>
                      <p className="text-muted-foreground">
                        {isGenerating
                          ? t('ready_to_generate')
                          : t('no_videos_generated')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollAnimation>
    </section>
  );
}
