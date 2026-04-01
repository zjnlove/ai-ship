'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CreditCard,
  Download,
  ImageIcon,
  Loader2,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Link, usePathname } from '@/core/i18n/navigation';
import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import {
  ImageUploader,
  ImageUploaderValue,
  LazyImage,
} from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
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
  getOptionLabel,
  getOptionsForType,
  MODEL_OPTIONS,
  PROVIDER_OPTIONS,
  type ModelOption,
  type OptionType,
} from './image-config';

interface ImageGeneratorProps {
  allowMultipleImages?: boolean;
  maxImages?: number;
  maxSizeMB?: number;
  srOnlyTitle?: string;
  className?: string;
}

interface GeneratedImage {
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

type ImageGeneratorTab = 'text-to-image' | 'image-to-image';

const POLL_INTERVAL = 5000;
const GENERATION_TIMEOUT = 180000;
const MAX_PROMPT_LENGTH = 2000;

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

function extractImageUrls(result: any): string[] {
  if (!result) {
    return [];
  }

  const output = result.output ?? result.images ?? result.data;

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
            item.url ?? item.uri ?? item.image ?? item.src ?? item.imageUrl;
          return typeof candidate === 'string' ? [candidate] : [];
        }
        return [];
      })
      .filter(Boolean);
  }

  if (typeof output === 'object') {
    const candidate =
      output.url ?? output.uri ?? output.image ?? output.src ?? output.imageUrl;
    if (typeof candidate === 'string') {
      return [candidate];
    }
  }

  return [];
}

export function ImageGenerator({
  allowMultipleImages = true,
  maxImages = 9,
  maxSizeMB = 5,
  srOnlyTitle,
  className,
}: ImageGeneratorProps) {
  const t = useTranslations('ai.image.generator');

  const [activeTab, setActiveTab] =
    useState<ImageGeneratorTab>('text-to-image');

  const [costCredits, setCostCredits] = useState<number>(2);
  const [provider, setProvider] = useState(PROVIDER_OPTIONS[0]?.value ?? '');
  const [model, setModel] = useState(
    MODEL_OPTIONS[0]?.sceneValues?.['text-to-image'] ?? ''
  );
  const [prompt, setPrompt] = useState('');
  const [referenceImageItems, setReferenceImageItems] = useState<
    ImageUploaderValue[]
  >([]);
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(
    null
  );
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);

  // 高级设置状态
  const [imageSize, setImageSize] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<string>('');
  const [quality, setQuality] = useState<string>('');
  const [resolution, setResolution] = useState<string>('');

  // 记录上一次的模型配置，用于检测模型是否实际变化
  const prevModelConfigRef = useRef<ModelOption | undefined>(undefined);

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();

  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 获取当前模型配置
  const currentModelConfig = useMemo(() => {
    return MODEL_OPTIONS.find(
      (option) => option.sceneValues?.[activeTab] === model
    );
  }, [model, activeTab]);

  // 监听模型变化，自动更新积分和高级选项默认值
  useEffect(() => {
    if (currentModelConfig?.credits?.[activeTab]) {
      setCostCredits(parseInt(currentModelConfig.credits[activeTab]));
    } else {
      if (activeTab === 'text-to-image') {
        setCostCredits(2);
      } else {
        setCostCredits(4);
      }
    }

    // 只在模型实际变化时才重置高级选项
    const prevModelConfig = prevModelConfigRef.current;
    const modelChanged = prevModelConfig?.label !== currentModelConfig?.label;

    if (modelChanged && currentModelConfig?.defaultOptions) {
      const defaults = currentModelConfig.defaultOptions;
      if (defaults.image_size) setImageSize(defaults.image_size);
      if (defaults.aspect_ratio) setImageSize(defaults.aspect_ratio);
      if (defaults.output_format) setOutputFormat(defaults.output_format);
      if (defaults.quality) setQuality(defaults.quality);
      if (defaults.resolution) setResolution(defaults.resolution);
    }

    // 更新 ref 记录当前模型配置
    prevModelConfigRef.current = currentModelConfig;
  }, [currentModelConfig, activeTab]);

  useEffect(() => {
    if (pathname.includes('image-to-image')) {
      setActiveTab('image-to-image');
    }

    // 检查是否是 image-models 路径，自动选择对应的模型
    const imageModelMatch = pathname.match(/\/image-models\/([^/]+)/);
    if (imageModelMatch) {
      const modelPath = imageModelMatch[1];
      const matchedModel = MODEL_OPTIONS.find(
        (option) => option.modelPath === modelPath
      );
      if (matchedModel) {
        setProvider(matchedModel.brand);
        // 根据当前活动标签页选择对应的模型值
        const modelValue = matchedModel.sceneValues?.[activeTab];
        if (modelValue) {
          setModel(modelValue);
        }
      }
    }
  }, [pathname, activeTab]);

  const promptLength = prompt.trim().length;
  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const isPromptTooLong = promptLength > MAX_PROMPT_LENGTH;
  const isTextToImageMode = activeTab === 'text-to-image';

  const handleTabChange = (value: string) => {
    const tab = value as ImageGeneratorTab;
    setActiveTab(tab);

    const availableModels = MODEL_OPTIONS.filter(
      (option) =>
        option.sceneValues[tab] !== undefined && option.brand === provider
    );

    if (availableModels.length > 0) {
      setModel(availableModels[0].sceneValues[tab] ?? '');
    } else {
      setModel('');
    }

    if (tab === 'text-to-image') {
      setCostCredits(2);
    } else {
      setCostCredits(4);
    }
  };

  const handleProviderChange = (value: string) => {
    setProvider(value);

    const availableModels = MODEL_OPTIONS.filter(
      (option) =>
        option.sceneValues[activeTab] !== undefined && option.brand === value
    );

    if (availableModels.length > 0) {
      setModel(availableModels[0].sceneValues[activeTab] ?? '');
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
        return 'Generating your image...';
      case AITaskStatus.SUCCESS:
        return 'Image generation completed';
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

  // 重置高级选项为当前模型默认值
  const resetAdvancedOptions = useCallback(() => {
    if (currentModelConfig?.defaultOptions) {
      const defaults = currentModelConfig.defaultOptions;
      if (defaults.image_size) setImageSize(defaults.image_size);
      if (defaults.aspect_ratio) setImageSize(defaults.aspect_ratio);
      if (defaults.output_format) setOutputFormat(defaults.output_format);
      if (defaults.quality) setQuality(defaults.quality);
      if (defaults.resolution) setResolution(defaults.resolution);
    }
  }, [currentModelConfig]);

  const pollTaskStatus = useCallback(
    async (id: string) => {
      try {
        if (
          generationStartTime &&
          Date.now() - generationStartTime > GENERATION_TIMEOUT
        ) {
          resetTaskState();
          toast.error('Image generation timed out. Please try again.');
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
        const imageUrls = extractImageUrls(parsedResult);

        if (currentStatus === AITaskStatus.PENDING) {
          setProgress((prev) => Math.max(prev, 20));
          return false;
        }

        if (currentStatus === AITaskStatus.PROCESSING) {
          if (imageUrls.length > 0) {
            setGeneratedImages(
              imageUrls.map((url, index) => ({
                id: `${task.id}-${index}`,
                url,
                provider: task.provider,
                model: task.model,
                prompt: task.prompt ?? undefined,
              }))
            );
            setProgress((prev) => Math.max(prev, 85));
          } else {
            setProgress((prev) => Math.min(prev + 10, 80));
          }
          return false;
        }

        if (currentStatus === AITaskStatus.SUCCESS) {
          if (imageUrls.length === 0) {
            toast.error('The provider returned no images. Please retry.');
          } else {
            setGeneratedImages(
              imageUrls.map((url, index) => ({
                id: `${task.id}-${index}`,
                url,
                provider: task.provider,
                model: task.model,
                prompt: task.prompt ?? undefined,
              }))
            );
            toast.success('Image generated successfully');
          }

          setProgress(100);
          resetTaskState();
          resetAdvancedOptions();
          return true;
        }

        if (currentStatus === AITaskStatus.FAILED) {
          const errorMessage =
            parsedResult?.errorMessage || 'Generate image failed';
          toast.error(errorMessage);
          resetTaskState();

          fetchUserCredits();

          return true;
        }

        setProgress((prev) => Math.min(prev + 5, 95));
        return false;
      } catch (error: any) {
        console.error('Error polling image task:', error);
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
    if (!trimmedPrompt) {
      toast.error('Please enter a prompt before generating.');
      return;
    }

    if (!provider || !model) {
      toast.error('Provider or model is not configured correctly.');
      return;
    }

    if (!isTextToImageMode && referenceImageUrls.length === 0) {
      toast.error('Please upload reference images before generating.');
      return;
    }

    setIsGenerating(true);
    setProgress(15);
    setTaskStatus(AITaskStatus.PENDING);
    setGeneratedImages([]);
    setGenerationStartTime(Date.now());

    try {
      // 根据当前选中的模型获取对应的配置
      const selectedModel = MODEL_OPTIONS.find(
        (option) => option.sceneValues[activeTab] === model
      );

      // 构建 options：先合并模型的默认参数
      const options: any = {
        ...selectedModel?.defaultOptions,
      };

      // 合并用户选择的高级选项
      if (selectedModel?.advancedOptions?.imageSizeField) {
        const imageSizeField = selectedModel.advancedOptions.imageSizeField;
        if (imageSize) {
          options[imageSizeField] = imageSize;
        }
      }
      if (outputFormat) {
        options.output_format = outputFormat;
      }
      if (quality) {
        options.quality = quality;
      }
      if (resolution) {
        options.resolution = resolution;
      }

      // 动态设置图片字段（根据模型配置的 imageField）
      if (!isTextToImageMode && referenceImageUrls.length > 0) {
        const imageField = selectedModel?.imageField || 'image_input';
        options[imageField] = referenceImageUrls;
      }

      // 获取积分消耗
      const modelCredits = selectedModel?.credits?.[activeTab]
        ? parseInt(selectedModel.credits[activeTab])
        : costCredits;

      // zjnlove 2024-10-16: currently we only use kie provider for image generation, so we directly call our backend api. In the future, if we support more providers for image generation, we may need to call different endpoints or add provider field in the request body.
      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaType: AIMediaType.IMAGE,
          scene: isTextToImageMode ? 'text-to-image' : 'image-to-image',
          provider: selectedModel?.provider ?? provider, // 使用模型的 provider
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
        throw new Error(message || 'Failed to create an image task');
      }

      const newTaskId = data?.id;
      if (!newTaskId) {
        throw new Error('Task id missing in response');
      }

      if (data.status === AITaskStatus.SUCCESS && data.taskInfo) {
        const parsedResult = parseTaskResult(data.taskInfo);
        const imageUrls = extractImageUrls(parsedResult);

        if (imageUrls.length > 0) {
          setGeneratedImages(
            imageUrls.map((url, index) => ({
              id: `${newTaskId}-${index}`,
              url,
              provider,
              model,
              prompt: trimmedPrompt,
            }))
          );
          toast.success('Image generated successfully');
          setProgress(100);
          resetTaskState();
          resetAdvancedOptions();
          await fetchUserCredits();
          return;
        }
      }

      setTaskId(newTaskId);
      setProgress(25);

      await fetchUserCredits();
    } catch (error: any) {
      console.error('Failed to generate image:', error);
      toast.error(`Failed to generate image: ${error.message}`);
      resetTaskState();
    }
  };

  const handleDownloadImage = async (image: GeneratedImage) => {
    if (!image.url) {
      return;
    }

    try {
      setDownloadingImageId(image.id);
      // fetch image via proxy
      const resp = await fetch(
        `/api/proxy/file?url=${encodeURIComponent(image.url)}`
      );
      if (!resp.ok) {
        throw new Error('Failed to fetch image');
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
      toast.success('Image downloaded');
    } catch (error) {
      console.error('Failed to download image:', error);
      toast.error('Failed to download image');
    } finally {
      setDownloadingImageId(null);
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
    // <section className={cn('py-16 md:py-24', className)}>
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
                    <TabsList className="bg-primary/10 grid w-full grid-cols-2">
                      <TabsTrigger value="text-to-image">
                        {t('tabs.text-to-image')}
                      </TabsTrigger>
                      <TabsTrigger value="image-to-image">
                        {t('tabs.image-to-image')}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="grid grid-cols-[1fr_2fr] gap-4">
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
                      <div className="flex gap-2">
                        <Select value={model} onValueChange={setModel}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('form.select_model')} />
                          </SelectTrigger>
                          <SelectContent>
                            {MODEL_OPTIONS.filter(
                              (option) =>
                                option.sceneValues[activeTab] !== undefined &&
                                option.brand === provider
                            ).map((option) => (
                              <SelectItem
                                key={option.label}
                                value={option.sceneValues[activeTab] ?? ''}
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

                        {(currentModelConfig?.advancedOptions?.supportedTypes
                          ?.length ?? 0) > 0 && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Advanced Settings</DialogTitle>
                              </DialogHeader>
                              <div className="mt-6 grid grid-cols-3 gap-4">
                                {currentModelConfig?.advancedOptions?.supportedTypes?.map(
                                  (optionType) => (
                                    <div key={optionType} className="space-y-2">
                                      <Label>
                                        {getOptionLabel(optionType)}
                                      </Label>
                                      <Select
                                        value={
                                          optionType === 'imageSize' ||
                                          optionType === 'aspectRatio'
                                            ? imageSize
                                            : optionType === 'outputFormat'
                                              ? outputFormat
                                              : optionType === 'quality'
                                                ? quality
                                                : resolution
                                        }
                                        onValueChange={(value) => {
                                          if (
                                            optionType === 'imageSize' ||
                                            optionType === 'aspectRatio'
                                          ) {
                                            setImageSize(value);
                                          } else if (
                                            optionType === 'outputFormat'
                                          ) {
                                            setOutputFormat(value);
                                          } else if (optionType === 'quality') {
                                            setQuality(value);
                                          } else if (
                                            optionType === 'resolution'
                                          ) {
                                            setResolution(value);
                                          }
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getOptionsForType(optionType).map(
                                            (opt) => (
                                              <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                              >
                                                {opt.label}
                                              </SelectItem>
                                            )
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isTextToImageMode && (
                    <div className="space-y-4">
                      <ImageUploader
                        title={t('form.reference_image')}
                        allowMultiple={allowMultipleImages}
                        maxImages={allowMultipleImages ? maxImages : 1}
                        maxSizeMB={maxSizeMB}
                        onChange={handleReferenceImagesChange}
                        emptyHint={t('form.reference_image_placeholder')}
                        onBeforeUpload={() => {
                          if (!user) {
                            setIsShowSignModal(true);
                            return false;
                          }
                          return true;
                        }}
                      />

                      {hasReferenceUploadError && (
                        <p className="text-destructive text-xs">
                          {t('form.some_images_failed_to_upload')}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="image-prompt">{t('form.prompt')}</Label>
                    <Textarea
                      id="image-prompt"
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
                        !prompt.trim() ||
                        isPromptTooLong ||
                        isReferenceUploading ||
                        hasReferenceUploadError
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
                    <ImageIcon className="h-5 w-5" />
                    {t('generated_images')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-8">
                  {generatedImages.length > 0 ? (
                    <div
                      className={
                        generatedImages.length === 1
                          ? 'grid grid-cols-1 gap-6'
                          : 'grid gap-6 sm:grid-cols-2'
                      }
                    >
                      {generatedImages.map((image) => (
                        <div key={image.id} className="space-y-3">
                          <div
                            className={
                              generatedImages.length === 1
                                ? 'relative overflow-hidden rounded-lg border'
                                : 'relative aspect-square overflow-hidden rounded-lg border'
                            }
                          >
                            <LazyImage
                              src={image.url}
                              alt={image.prompt || 'Generated image'}
                              className={
                                generatedImages.length === 1
                                  ? 'h-auto w-full'
                                  : 'h-full w-full object-cover'
                              }
                            />

                            <div className="absolute right-2 bottom-2 flex justify-end text-sm">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="ml-auto"
                                onClick={() => handleDownloadImage(image)}
                                disabled={downloadingImageId === image.id}
                              >
                                {downloadingImageId === image.id ? (
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
                        <ImageIcon className="text-muted-foreground h-10 w-10" />
                      </div>
                      <p className="text-muted-foreground">
                        {isGenerating
                          ? t('ready_to_generate')
                          : t('no_images_generated')}
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
