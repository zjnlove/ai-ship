'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { max } from 'drizzle-orm';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronUp,
  CreditCard,
  Download,
  Loader2,
  Plus,
  Settings,
  Share2,
  Sparkles,
  User,
  Video,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { vi } from 'zod/v4/locales';

import { Link, usePathname } from '@/core/i18n/navigation';
import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import {
  ImageUploader,
  ImageUploaderValue,
} from '@/shared/blocks/common/image-uploader';
import {
  VideoUploader,
  VideoUploaderValue,
} from '@/shared/blocks/common/video-uploader';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAppContext } from '@/shared/contexts/app';
import { cn } from '@/shared/lib/utils';

import {
  calculateDiscountedCredits,
  getDiscountLabel,
  getOptionsForModel,
  getVideoOptionLabel,
  getVideoOptionsForType,
  MODEL_OPTIONS,
  PROVIDER_OPTIONS,
  VideoOptionType,
} from './video-config/index';

interface VideoGeneratorProps {
  video_maxSizeMB?: number;
  image_maxSizeMB?: number;
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
const GENERATION_TIMEOUT = 600000;
const MAX_PROMPT_LENGTH = 2000;

const textToVideoCredits = 6;
const imageToVideoCredits = 8;
const videoToVideoCredits = 10;

function parseTaskResult(taskResult: string | null): any {
  if (!taskResult) return null;
  try {
    return JSON.parse(taskResult);
  } catch (error) {
    console.warn('Failed to parse taskResult:', error);
    return null;
  }
}

function extractVideoUrls(result: any): string[] {
  if (!result) return [];

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

  const output = result.output ?? result.video ?? result.data;
  if (!output) return [];

  if (typeof output === 'string') return [output];

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
    if (typeof candidate === 'string') return [candidate];
  }

  return [];
}

export function VideoGenerator({
  video_maxSizeMB = 50,
  image_maxSizeMB = 10,
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
  // 按模式独立存储上传内容
  const [modeImages, setModeImages] = useState<
    Record<string, ImageUploaderValue[]>
  >({
    'text-to-video': [],
    'image-to-video': [],
    'video-to-video': [],
  });

  const [modeVideos, setModeVideos] = useState<
    Record<string, VideoUploaderValue[]>
  >({
    'text-to-video': [],
    'image-to-video': [],
    'video-to-video': [],
  });

  // 当前模式的上传内容
  const referenceImageItems = modeImages[activeTab] || [];
  const referenceVideoItems = modeVideos[activeTab] || [];

  // 计算当前模式的图片URL和视频URL
  const referenceImageUrls = referenceImageItems
    .filter((item) => item.status === 'uploaded' && item.url)
    .map((item) => item.url as string);

  const referenceVideoUrl =
    referenceVideoItems.find((item) => item.status === 'uploaded' && item.url)
      ?.url || '';
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
  const [showPreview, setShowPreview] = useState(false);
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [advancedPopoverOpen, setAdvancedPopoverOpen] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState<{
    duration: number;
    size: number;
    format: string;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const pathname = usePathname();
  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const selectedModel = MODEL_OPTIONS.find(
      (option) => option.sceneValues?.[activeTab] === model
    );
    const baseCredits = selectedModel?.baseCredits as
      | Record<string, number>
      | undefined;
    if (baseCredits?.[activeTab]) {
      setCostCredits(baseCredits[activeTab]);
    } else {
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
    let tab: VideoGeneratorTab = 'text-to-video';

    if (pathname.includes('video-to-video')) {
      tab = 'video-to-video';
    } else if (pathname.includes('image-to-video')) {
      tab = 'image-to-video';
    }

    // 检查是否是 image-models 路径，自动选择对应的模型
    const imageModelMatch = pathname.match(/\/video-models\/([^/]+)/);
    console.log(
      'Checking for image model match in pathname:',
      pathname,
      imageModelMatch
    );
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

    if (tab !== activeTab) {
      setActiveTab(tab);

      // 过滤出当前模式下有可用模型的提供商
      const availableProviders = PROVIDER_OPTIONS.filter((p) => {
        return MODEL_OPTIONS.some(
          (m) => m.sceneValues?.[tab] !== undefined && m.brand === p.value
        );
      });

      if (availableProviders.length > 0) {
        // 选中第一个可用提供商
        const firstProvider = availableProviders[0].value;
        setProvider(firstProvider);

        // 选中该提供商下的第一个模型
        const availableModels = MODEL_OPTIONS.filter(
          (option) =>
            option.sceneValues?.[tab] !== undefined &&
            option.brand === firstProvider
        );

        if (availableModels.length > 0) {
          setModel(availableModels[0].sceneValues?.[tab] ?? '');
        } else {
          setModel('');
        }
      } else {
        // 没有可用提供商
        setProvider('');
        setModel('');
      }

      // 设置对应积分消耗
      if (tab === 'text-to-video') {
        setCostCredits(textToVideoCredits);
      } else if (tab === 'image-to-video') {
        setCostCredits(imageToVideoCredits);
      } else {
        setCostCredits(videoToVideoCredits);
      }
    }
  }, [pathname]);

  const promptLength = prompt.trim().length;
  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const isCreditsLoaded = user?.credits !== undefined;
  const isPromptTooLong = promptLength > MAX_PROMPT_LENGTH;
  const isTextToVideoMode = activeTab === 'text-to-video';
  const isImageToVideoMode = activeTab === 'image-to-video';
  const isVideoToVideoMode = activeTab === 'video-to-video';

  const selectedModelConfig = MODEL_OPTIONS.find(
    (option) => option.sceneValues?.[activeTab] === model
  );

  // ✅ 动态获取模型配置的文件大小限制，没有配置则使用默认值
  const imageMaxSize =
    selectedModelConfig?.inputValidation?.image?.maxFileSize ?? image_maxSizeMB;
  const videoMaxSize =
    selectedModelConfig?.inputValidation?.video?.maxFileSize ?? video_maxSizeMB;

  // 计算 maxImages 值（基于 refFrameMode 和模型配置）
  const maxImages = useMemo(() => {
    // 优先使用 advancedOptions 中的值
    const refFrameModeValue =
      advancedOptions.refFrameMode ??
      selectedModelConfig?.defaultOptions?.generationType;

    if (refFrameModeValue === 'FIRST_AND_LAST_FRAMES_2_VIDEO') return 2;
    // if (refFrameModeValue === 'REFERENCE_2_VIDEO') return 3;
    return selectedModelConfig?.maxImages ?? 1;
  }, [advancedOptions.refFrameMode, selectedModelConfig]);

  // 计算当前积分（合并默认选项和用户选择）
  const calculateCurrentCredits = useCallback(() => {
    if (!selectedModelConfig)
      return { original: 0, discounted: 0, discountRate: 1 };

    const selectedOptions: Record<string, string | boolean> = {};

    // 先添加模型的默认选项
    if (selectedModelConfig.defaultOptions) {
      Object.entries(selectedModelConfig.defaultOptions).forEach(
        ([key, value]) => {
          if (value !== undefined && value !== null) {
            selectedOptions[key] = value;
          }
        }
      );
    }

    // 再用用户选择的选项覆盖
    Object.entries(advancedOptions).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        selectedOptions[key] = value;
      }
    });

    return calculateDiscountedCredits(
      selectedModelConfig,
      activeTab,
      selectedOptions
    );
  }, [selectedModelConfig, activeTab, advancedOptions]);

  // 实时计算积分（基于高级选项）
  useEffect(() => {
    if (!selectedModelConfig) return;

    const { discounted } = calculateCurrentCredits();
    console.log('Calculated discounted credits:', discounted);
    setCostCredits(discounted);
  }, [calculateCurrentCredits, selectedModelConfig, advancedOptions]);

  // ✅ 模型切换时重新校验已上传的图片和视频
  useEffect(() => {
    if (!selectedModelConfig) return;

    const validateUploadedFiles = () => {
      // 校验已上传的图片
      if (referenceImageItems.length > 0) {
        const validImages: ImageUploaderValue[] = [];
        let hasInvalid = false;

        for (const item of referenceImageItems) {
          if (item.status === 'uploaded') {
            // ✅ 方案2：不需要File对象，直接校验已有的size和url信息
            let isValid = true;

            if (selectedModelConfig?.inputValidation?.image) {
              const { maxFileSize, supportedFormats } =
                selectedModelConfig.inputValidation.image;

              // 校验文件大小
              if (maxFileSize && item.size) {
                const size = Math.round(item.size / 1024 / 1024);
                if (size > maxFileSize) {
                  isValid = false;
                }
              }

              // 校验文件格式
              if (supportedFormats && supportedFormats.length > 0 && item.url) {
                const format = item.url.split('.').pop()?.toLowerCase() || '';
                if (!supportedFormats.includes(format)) {
                  isValid = false;
                }
              }
            }

            if (isValid) {
              validImages.push(item);
            } else {
              hasInvalid = true;
            }
          } else {
            validImages.push(item);
          }
        }

        if (hasInvalid) {
          setModeImages((prev) => ({
            ...prev,
            [activeTab]: validImages,
          }));
          toast.info(t('validation.some_files_removed'));
        }
      }

      // 校验已上传的视频
      if (referenceVideoItems.length > 0) {
        const validVideos: VideoUploaderValue[] = [];
        let hasInvalid = false;

        for (const item of referenceVideoItems) {
          if (item.status === 'uploaded') {
            // ✅ 方案2：不需要File对象，直接校验已有的size和url信息
            let isValid = true;

            if (selectedModelConfig?.inputValidation?.video) {
              const { maxFileSize, supportedFormats } =
                selectedModelConfig.inputValidation.video;

              // 校验文件大小
              if (maxFileSize && item.size) {
                const size = Math.round(item.size / 1024 / 1024);
                if (size > maxFileSize) {
                  isValid = false;
                }
              }

              // 校验文件格式
              if (supportedFormats && supportedFormats.length > 0 && item.url) {
                const format = item.url.split('.').pop()?.toLowerCase() || '';
                if (!supportedFormats.includes(format)) {
                  isValid = false;
                }
              }
            }

            if (isValid) {
              validVideos.push(item);
            } else {
              hasInvalid = true;
            }
          } else {
            validVideos.push(item);
          }
        }

        if (hasInvalid) {
          setModeVideos((prev) => ({
            ...prev,
            [activeTab]: validVideos,
          }));
          toast.info(t('validation.some_files_removed'));
        }
      }
    };

    validateUploadedFiles();
  }, [selectedModelConfig, activeTab]);

  const advancedTypes =
    selectedModelConfig?.advancedOptions?.supportedTypes ?? [];

  const handleTabChange = (value: string) => {
    const tab = value as VideoGeneratorTab;
    setActiveTab(tab);

    // ✅ 先检查当前选中的模型是否支持新的模式，如果支持就不切换模型
    const currentModel = MODEL_OPTIONS.find(
      (option) => option.sceneValues?.[activeTab] === model
    );

    if (currentModel && currentModel.sceneValues?.[tab] !== undefined) {
      // 当前模型支持新模式，保持当前provider不变，只更新model为新模式对应的值
      setModel(currentModel.sceneValues[tab]);
      // 直接更新对应积分消耗
      const baseCredits = currentModel.baseCredits as
        | Record<string, number>
        | undefined;
      if (baseCredits?.[tab]) {
        setCostCredits(baseCredits[tab]);
      } else {
        if (tab === 'text-to-video') {
          setCostCredits(textToVideoCredits);
        } else if (tab === 'image-to-video') {
          setCostCredits(imageToVideoCredits);
        } else {
          setCostCredits(videoToVideoCredits);
        }
      }
      return;
    }

    // ❌ 当前模型不支持新模式，才走原来的逻辑重置为第一个可用模型
    // 过滤出当前模式下有可用模型的提供商
    const availableProviders = PROVIDER_OPTIONS.filter((p) => {
      return MODEL_OPTIONS.some(
        (m) => m.sceneValues?.[tab] !== undefined && m.brand === p.value
      );
    });

    if (availableProviders.length > 0) {
      // 选中第一个可用提供商
      const firstProvider = availableProviders[0].value;
      setProvider(firstProvider);

      // 选中该提供商下的第一个模型
      const availableModels = MODEL_OPTIONS.filter(
        (option) =>
          option.sceneValues?.[tab] !== undefined &&
          option.brand === firstProvider
      );

      if (availableModels.length > 0) {
        setModel(availableModels[0].sceneValues?.[tab] ?? '');
      } else {
        setModel('');
      }
    } else {
      // 没有可用提供商
      setProvider('');
      setModel('');
    }

    if (tab === 'text-to-video') {
      setCostCredits(textToVideoCredits);
    } else if (tab === 'image-to-video') {
      setCostCredits(imageToVideoCredits);
    } else {
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
    if (!taskStatus) return '';
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
      setModeImages((prev) => ({
        ...prev,
        [activeTab]: items,
      }));
    },
    [activeTab]
  );

  const isReferenceUploading = useMemo(
    () => referenceImageItems.some((item) => item.status === 'uploading'),
    [referenceImageItems]
  );

  const hasReferenceUploadError = useMemo(
    () =>
      referenceImageItems.some((item) => item.status === 'error') ||
      referenceVideoItems.some((item) => item.status === 'error'),
    [referenceImageItems, referenceVideoItems]
  );

  // ✅ 视频上传前置校验 - 在上传前执行，不通过不上传
  const handleReferenceVideoValidateFile = useCallback(
    (file: File): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);

          const duration = Math.ceil(video.duration);
          const size = Math.round(file.size / 1024 / 1024);
          const format = file.name.split('.').pop()?.toLowerCase() || '';

          // 执行所有校验规则
          if (selectedModelConfig?.inputValidation?.video) {
            const { maxDuration, maxFileSize, supportedFormats } =
              selectedModelConfig.inputValidation.video;

            if (maxDuration && duration > maxDuration) {
              const error = t('validation.video_too_long', {
                max: maxDuration,
                actual: duration,
              });
              toast.error(error);
              setValidationError(error);
              resolve(false);
              return;
            }

            if (maxFileSize && size > maxFileSize) {
              const error = t('validation.video_too_large', {
                max: maxFileSize,
                actual: size,
              });
              toast.error(error);
              setValidationError(error);
              resolve(false);
              return;
            }

            if (
              supportedFormats &&
              supportedFormats.length > 0 &&
              !supportedFormats.includes(format)
            ) {
              const error = t('validation.video_unsupported_format', {
                supported: supportedFormats.join(', ').toUpperCase(),
                actual: format.toUpperCase(),
              });
              toast.error(error);
              setValidationError(error);
              resolve(false);
              return;
            }
          }

          // 校验通过
          setValidationError(null);
          resolve(true);
        };

        video.onerror = () => {
          window.URL.revokeObjectURL(video.src);
          toast.error('Failed to read video metadata');
          resolve(false);
        };

        video.src = URL.createObjectURL(file);
      });
    },
    [selectedModelConfig]
  );

  // ✅ 图片上传前置校验 - 在上传前执行，不通过不上传
  const handleReferenceImageValidateFile = useCallback(
    (file: File): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        const img = new Image();

        img.onload = () => {
          window.URL.revokeObjectURL(img.src);

          const size = Math.round(file.size / 1024 / 1024);
          const format = file.name.split('.').pop()?.toLowerCase() || '';

          // 执行所有校验规则
          if (selectedModelConfig?.inputValidation?.image) {
            const { maxFileSize, supportedFormats } =
              selectedModelConfig.inputValidation.image;

            if (maxFileSize && size > maxFileSize) {
              const error = t('validation.image_too_large', {
                max: maxFileSize,
                actual: size,
              });
              toast.error(error);
              setValidationError(error);
              resolve(false);
              return;
            }

            if (
              supportedFormats &&
              supportedFormats.length > 0 &&
              !supportedFormats.includes(format)
            ) {
              const error = t('validation.image_unsupported_format', {
                supported: supportedFormats.join(', ').toUpperCase(),
                actual: format.toUpperCase(),
              });
              toast.error(error);
              setValidationError(error);
              resolve(false);
              return;
            }
          }

          // 校验通过
          setValidationError(null);
          resolve(true);
        };

        img.onerror = () => {
          window.URL.revokeObjectURL(img.src);
          toast.error('Failed to read image metadata');
          resolve(false);
        };

        img.src = URL.createObjectURL(file);
      });
    },
    [selectedModelConfig]
  );

  const handleReferenceVideoChange = useCallback(
    (items: VideoUploaderValue[]) => {
      setModeVideos((prev) => ({
        ...prev,
        [activeTab]: items,
      }));

      // 上传成功后读取视频元数据
      if (items.length > 0 && items[0].file) {
        const file = items[0].file;
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);

          const duration = Math.ceil(video.duration);
          const size = Math.round(file.size / 1024 / 1024);
          const format = file.name.split('.').pop()?.toLowerCase() || '';

          console.log('✅ 视频元数据读取成功: ', {
            duration,
            size,
            format,
            selectedModel: selectedModelConfig?.label,
          });

          setVideoMetadata({
            duration,
            size,
            format,
          });

          if (selectedModelConfig?.defaultOptions) {
            selectedModelConfig.defaultOptions.duration = duration.toString();
          }
        };

        video.onerror = () => {
          window.URL.revokeObjectURL(video.src);
          setVideoMetadata(null);
        };

        video.src = URL.createObjectURL(file);
      } else if (items.length === 0) {
        // ✅ 视频被删除时重置所有相关状态
        setVideoMetadata(null);
        if (selectedModelConfig?.defaultOptions) {
          selectedModelConfig.defaultOptions.duration =
            videoMetadata?.duration.toString() || '0';
        }
      }
    },
    [activeTab, selectedModelConfig]
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
    if (selectedModelConfig?.defaultOptions) {
      const defaults = selectedModelConfig.defaultOptions;
      const newAdvancedOptions: Record<string, any> = {};

      // 根据模型支持的高级选项类型，设置默认值
      selectedModelConfig.advancedOptions?.supportedTypes?.forEach((type) => {
        const fieldMap: Record<string, string> = {
          aspectRatio: 'aspect_ratio',
          resolution: 'resolution',
          mode: 'mode',
          duration: 'duration',
          fps: 'fps',
          motionStrength: 'motion_strength',
          refFrameMode: 'generationType',
        };
        const fieldName = fieldMap[type] || type;
        if (defaults[fieldName] !== undefined) {
          newAdvancedOptions[type] = defaults[fieldName];
        }
      });

      setAdvancedOptions(newAdvancedOptions);
    }
  }, [selectedModelConfig]);

  // 模型切换时自动重置高级选项为默认值
  useEffect(() => {
    resetAdvancedOptions();
  }, [model, resetAdvancedOptions]);

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
          headers: { 'Content-Type': 'application/json' },
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
          resetAdvancedOptions();
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
        return false;
      }
    },
    [generationStartTime, resetTaskState]
  );

  useEffect(() => {
    if (!taskId || !isGenerating) return;

    let cancelled = false;

    const tick = async () => {
      if (!taskId) return;
      const completed = await pollTaskStatus(taskId);
      if (completed) cancelled = true;
    };

    tick();

    const interval = setInterval(async () => {
      if (cancelled || !taskId) {
        clearInterval(interval);
        return;
      }
      const completed = await pollTaskStatus(taskId);
      if (completed) clearInterval(interval);
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
    setShowPreview(true);
    setProgress(15);
    setTaskStatus(AITaskStatus.PENDING);
    setGeneratedVideos([]);
    setGenerationStartTime(Date.now());

    try {
      // 构建 options：先合并模型的默认参数
      const options: any = {
        ...selectedModelConfig?.defaultOptions,
      };

      // 合并用户选择的高级选项
      if (selectedModelConfig?.advancedOptions?.supportedTypes) {
        selectedModelConfig.advancedOptions.supportedTypes.forEach((type) => {
          const value =
            advancedOptions[type] ??
            selectedModelConfig.defaultOptions?.[
              type === 'aspectRatio'
                ? 'aspect_ratio'
                : type === 'motionStrength'
                  ? 'motion_strength'
                  : type == 'refFrameMode'
                    ? 'generationType'
                    : type
            ];

          if (value) {
            const fieldMap: Record<string, string> = {
              aspectRatio: 'aspect_ratio',
              resolution: 'resolution',
              mode: 'mode',
              duration: 'duration',
              fps: 'fps',
              motionStrength: 'motion_strength',
              refFrameMode: 'generationType',
            };
            options[fieldMap[type] || type] = value;
          }
        });
      }

      // 动态处理自定义字段
      if (selectedModelConfig?.customFields) {
        selectedModelConfig.customFields.forEach((field) => {
          switch (field.type) {
            case 'image':
              if (referenceImageUrls.length > 0) {
                options[field.fieldName] = field.isArray
                  ? referenceImageUrls
                  : referenceImageUrls[0];
              }
              break;

            case 'video':
              if (isVideoToVideoMode && referenceVideoUrl) {
                options[field.fieldName] = field.isArray
                  ? [referenceVideoUrl]
                  : referenceVideoUrl;
              }
              break;

            case 'audio':
              // 从组件选择的开关取值
              const userSelectedAudio = advancedOptions.audio;
              options[field.fieldName] =
                userSelectedAudio !== undefined
                  ? userSelectedAudio
                  : field.defaultValue;
              break;

            case 'boolean':
              options[field.fieldName] =
                advancedOptions[field.fieldName] ?? field.defaultValue;
              break;

            case 'string':
            case 'number':
              if (advancedOptions[field.fieldName] !== undefined) {
                options[field.fieldName] = advancedOptions[field.fieldName];
              } else if (field.defaultValue !== undefined) {
                options[field.fieldName] = field.defaultValue;
              }
              break;
          }
        });
      }

      // // 兼容旧版 imageField
      // if (isImageToVideoMode && referenceImageUrls.length > 0) {
      //   const imageField = selectedModelConfig?.imageField;
      //   if (imageField && !selectedModelConfig.customFields) {
      //     if (imageField.isArray) {
      //       options[imageField.fieldName] = referenceImageUrls;
      //     } else {
      //       options[imageField.fieldName] = referenceImageUrls[0];
      //     }
      //   }
      // }

      // 兼容旧版默认视频字段
      // if (
      //   isVideoToVideoMode &&
      //   referenceVideoUrl &&
      //   !selectedModelConfig?.customFields
      // ) {
      //   options.video_input = [referenceVideoUrl];
      // }

      // 剔除原 audio 字段，只保留自定义字段
      delete options.audio;

      // 强制加入自动检测的视频时长（不受supportedTypes过滤限制）
      if (advancedOptions.duration) {
        options.duration = advancedOptions.duration;
      }

      const baseCredits = selectedModelConfig?.baseCredits as
        | Record<string, number>
        | undefined;
      const modelCredits = baseCredits?.[activeTab] ?? costCredits;

      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaType: AIMediaType.VIDEO,
          scene: activeTab,
          provider: selectedModelConfig?.provider ?? provider, // 使用模型的 provider
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
    if (!video.url) return;

    try {
      setDownloadingVideoId(video.id);
      const resp = await fetch(
        `/api/proxy/file?url=${encodeURIComponent(video.url)}`
      );
      if (!resp.ok) throw new Error('Failed to fetch video');

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

  const handleShareVideo = async (video: GeneratedVideo) => {
    if (!video.url) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Generated Video',
          url: video.url,
        });
      } else {
        await navigator.clipboard.writeText(video.url);
        toast.success('Video link copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to share video:', error);
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

      const getPrimaryColor = () => {
        const primary = getComputedStyle(document.documentElement)
          .getPropertyValue('--primary')
          .trim();
        const match = primary.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
        if (match) {
          const l = parseFloat(match[1]);
          const c = parseFloat(match[2]);
          const h = parseFloat(match[3]);
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
        return { r: 255, g: 180, b: 50 };
      };

      const primaryColor = getPrimaryColor();

      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      const particles: Array<{
        x: number;
        y: number;
        radius: number;
        vx: number;
        vy: number;
        opacity: number;
      }> = [];

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

      let animationId: number;
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${particle.opacity})`;
          ctx.fill();
        });

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

  // 进度条组件
  function ProgressBar({ progress }: { progress: number }) {
    return (
      <div className="bg-muted/50 relative h-3 w-full overflow-hidden rounded-full backdrop-blur-sm">
        <motion.div
          className="from-primary to-primary/80 h-full rounded-full bg-gradient-to-r"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: [-80, 400] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <section className={cn('relative pb-10', className)}>
      <ScrollAnimation>
        <ParticleBackground />

        <div className="relative z-10 container">
          <div className="mx-auto max-w-5xl">
            {/* 主容器 - 渐变背景 + 磨砂玻璃 */}
            <motion.div
              layout
              className="from-primary/5 via-background to-primary/10 border-primary/10 shadow-primary/5 relative overflow-hidden rounded-3xl border bg-gradient-to-br shadow-xl backdrop-blur-xl"
            >
              <div className="p-6 md:p-8">
                {srOnlyTitle && <h2 className="sr-only">{srOnlyTitle}</h2>}
                {/* 输入区域 */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]">
                  {/* 上传区域 - 固定高度 */}
                  <div className="flex min-h-[160px] items-start justify-center">
                    {isImageToVideoMode ? (
                      <div>
                        <ImageUploader
                          key={`image-${activeTab}`}
                          defaultPreviews={referenceImageUrls}
                          title={t('form.reference_image')}
                          allowMultiple={true}
                          maxImages={maxImages}
                          maxSizeMB={imageMaxSize}
                          onChange={handleReferenceImagesChange}
                          onBeforeUpload={() => {
                            if (!user) {
                              setIsShowSignModal(true);
                              return false;
                            }
                            return true;
                          }}
                          onValidateFile={handleReferenceImageValidateFile}
                          imageWidth="w-16"
                          imageHeight="h-20"
                        />
                      </div>
                    ) : isVideoToVideoMode ? (
                      <div className="flex flex-col gap-4 md:flex-row">
                        <div>
                          <ImageUploader
                            key={`image-${activeTab}`}
                            defaultPreviews={referenceImageUrls}
                            title={t('form.reference_image')}
                            allowMultiple={true}
                            maxImages={maxImages}
                            maxSizeMB={imageMaxSize}
                            onChange={handleReferenceImagesChange}
                            onBeforeUpload={() => {
                              if (!user) {
                                setIsShowSignModal(true);
                                return false;
                              }
                              return true;
                            }}
                            onValidateFile={handleReferenceImageValidateFile}
                            imageWidth="w-16"
                            imageHeight="h-20"
                          />
                        </div>
                        <div>
                          <VideoUploader
                            key={`video-${activeTab}`}
                            defaultPreviews={
                              referenceVideoUrl ? [referenceVideoUrl] : []
                            }
                            title={t('form.reference_video')}
                            allowMultiple={false}
                            maxVideos={1}
                            maxSizeMB={videoMaxSize}
                            onChange={handleReferenceVideoChange}
                            onBeforeUpload={() => {
                              if (!user) {
                                setIsShowSignModal(true);
                                return false;
                              }
                              return true;
                            }}
                            onValidateFile={handleReferenceVideoValidateFile}
                            videoWidth="w-16"
                            videoHeight="h-20"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* 提示词输入区 */}
                  <div className="space-y-2">
                    <Textarea
                      id="video-prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={t('form.prompt_placeholder')}
                      className="placeholder:text-muted-foreground/60 min-h-32 border-0 transition-all duration-300 focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      style={{ backgroundColor: 'transparent' }}
                    />
                    {isPromptTooLong && (
                      <div className="text-destructive text-xs">
                        {t('form.prompt_too_long')}
                      </div>
                    )}
                  </div>
                </div>

                {/* 底部功能栏 */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {/* 生成方式下拉 */}
                  <Select value={activeTab} onValueChange={handleTabChange}>
                    <SelectTrigger className="bg-background/60 border-primary/20 hover:bg-background/80 hover:border-primary/40 w-auto min-w-[140px] border backdrop-blur-sm transition-all duration-200 hover:shadow-md">
                      <SelectValue placeholder={t('select_generation_mode')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-to-video">
                        📝 Text to Video
                      </SelectItem>
                      <SelectItem value="image-to-video">
                        🖼️ Image to Video
                      </SelectItem>
                      <SelectItem value="video-to-video">
                        🎬 Video to Video
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 模型选择弹出框 */}
                  <Popover
                    open={modelPopoverOpen}
                    onOpenChange={setModelPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-background/60 border-primary/20 hover:bg-background/80 hover:border-primary/40 border backdrop-blur-sm transition-all duration-200 hover:shadow-md"
                      >
                        <span className="flex items-center gap-2">
                          {selectedModelConfig?.label || 'Select Model'}
                          {selectedModelConfig &&
                            getDiscountLabel(selectedModelConfig) && (
                              <span className="rounded bg-pink-100 px-1 text-[10px] text-pink-600">
                                {getDiscountLabel(selectedModelConfig)}
                              </span>
                            )}
                        </span>
                        <ChevronUp className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-105" side="top" align="start">
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        {/* 左侧：提供商列表 */}
                        <div className="border-border space-y-1 border-r pr-2">
                          <p className="text-muted-foreground mb-2 px-2 text-xs">
                            Providers
                          </p>
                          {PROVIDER_OPTIONS.filter((p) => {
                            // 检查当前激活模式下该提供商是否有可用模型
                            return MODEL_OPTIONS.some(
                              (m) =>
                                m.sceneValues?.[activeTab] !== undefined &&
                                m.brand === p.value
                            );
                          }).map((p) => (
                            <button
                              key={p.value}
                              onClick={() => handleProviderChange(p.value)}
                              className={cn(
                                'flex w-full items-center gap-2 rounded-lg p-2 text-sm',
                                'hover:bg-accent hover:text-accent-foreground transition-colors',
                                provider === p.value &&
                                  'bg-primary/20 text-primary font-medium'
                              )}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                        {/* 右侧：模型列表 */}
                        <div className="max-h-60 space-y-1 overflow-y-auto">
                          <p className="text-muted-foreground mb-2 px-2 text-xs">
                            Models
                          </p>
                          {MODEL_OPTIONS.filter(
                            (m) =>
                              m.sceneValues?.[activeTab] !== undefined &&
                              m.brand === provider
                          ).map((m) => {
                            const discountLabel = getDiscountLabel(m);
                            return (
                              <button
                                key={m.label}
                                onClick={() => {
                                  setModel(m.sceneValues?.[activeTab] ?? '');
                                  setModelPopoverOpen(false);
                                  // 重置高级选项为新模型的默认值
                                  resetAdvancedOptions();
                                }}
                                className={cn(
                                  'flex w-full items-center justify-between rounded-lg p-2 text-sm',
                                  'hover:bg-accent hover:text-accent-foreground transition-colors',
                                  model === m.sceneValues?.[activeTab] &&
                                    'bg-primary/20 text-primary font-medium'
                                )}
                              >
                                <span className="flex items-center gap-1">
                                  {m.label}
                                  {discountLabel && (
                                    <span className="rounded bg-pink-100 px-1 text-[10px] text-pink-600">
                                      {discountLabel}
                                    </span>
                                  )}
                                </span>
                                {(m.baseCredits as Record<string, number>)?.[
                                  activeTab
                                ] && (
                                  <span className="text-muted-foreground text-xs">
                                    {
                                      (m.baseCredits as Record<string, number>)[
                                        activeTab
                                      ]
                                    }{' '}
                                    {t('credits')}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* 高级参数弹出框 */}
                  {advancedTypes.length > 0 && (
                    <Popover
                      open={advancedPopoverOpen}
                      onOpenChange={setAdvancedPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-background/60 border-primary/20 hover:bg-background/80 hover:border-primary/40 gap-1 border backdrop-blur-sm transition-all duration-200 hover:shadow-md"
                        >
                          {(() => {
                            const visibleTypes = advancedTypes.filter(
                              (type) =>
                                type === 'duration' ||
                                type === 'aspectRatio' ||
                                type === 'resolution' ||
                                type === 'mode' ||
                                type === 'refFrameMode' ||
                                type === 'audio'
                            );
                            return visibleTypes
                              .slice(0, 3)
                              .map((type, index) => (
                                <span
                                  key={type}
                                  className="flex items-center gap-1"
                                >
                                  {index > 0 && (
                                    <span className="text-muted-foreground">
                                      |
                                    </span>
                                  )}
                                  {type === 'duration' && (
                                    <span className="bg-primary/10 rounded-full px-2 py-0.5 text-xs">
                                      {advancedOptions.duration ??
                                        selectedModelConfig?.defaultOptions
                                          ?.duration ??
                                        '10'}
                                      s
                                    </span>
                                  )}
                                  {type === 'aspectRatio' && (
                                    <span className="bg-primary/10 rounded-full px-2 py-0.5 text-xs">
                                      {advancedOptions.aspectRatio ??
                                        selectedModelConfig?.defaultOptions
                                          ?.aspect_ratio ??
                                        '16:9'}
                                    </span>
                                  )}
                                  {type === 'resolution' && (
                                    <span className="bg-primary/10 rounded-full px-2 py-0.5 text-xs">
                                      {advancedOptions.resolution ??
                                        selectedModelConfig?.defaultOptions
                                          ?.resolution ??
                                        '720p'}
                                    </span>
                                  )}
                                  {type === 'mode' && (
                                    <span className="bg-primary/10 rounded-full px-2 py-0.5 text-xs">
                                      {advancedOptions.mode ??
                                        selectedModelConfig?.defaultOptions
                                          ?.mode ??
                                        'std'}
                                    </span>
                                  )}
                                  {type === 'refFrameMode' && (
                                    <span className="bg-primary/10 rounded-full px-2 py-0.5 text-xs">
                                      {(advancedOptions.refFrameMode ??
                                        selectedModelConfig?.defaultOptions
                                          ?.generationType) ===
                                      'FIRST_AND_LAST_FRAMES_2_VIDEO'
                                        ? t(
                                            'advanced_options.ref_frame_mode_options.first_and_last'
                                          )
                                        : t(
                                            'advanced_options.ref_frame_mode_options.reference'
                                          )}
                                    </span>
                                  )}
                                </span>
                              ));
                          })()}
                          <Settings className="ml-1 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" side="top" align="start">
                        <div className="space-y-5">
                          {advancedTypes.map((type: VideoOptionType) => {
                            // audio 类型使用 Switch 开关
                            if (type === 'audio') {
                              const currentValue =
                                advancedOptions.audio ??
                                selectedModelConfig?.defaultOptions?.audio ??
                                false;

                              return (
                                <div key={type} className="space-y-2">
                                  <Label className="text-muted-foreground text-xs font-medium">
                                    {t('advanced_options.audio')}
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={currentValue as boolean}
                                      onCheckedChange={(checked) =>
                                        setAdvancedOptions((prev) => ({
                                          ...prev,
                                          audio: checked,
                                        }))
                                      }
                                    />
                                    <span className="text-muted-foreground text-xs">
                                      {currentValue
                                        ? t(
                                            'advanced_options.audio_options.audio_on'
                                          )
                                        : t(
                                            'advanced_options.audio_options.audio_off'
                                          )}
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            const options = selectedModelConfig
                              ? getOptionsForModel(selectedModelConfig, type)
                              : getVideoOptionsForType(type);
                            const label = getVideoOptionLabel(type);
                            const currentValue =
                              advancedOptions[type] ??
                              selectedModelConfig?.defaultOptions?.[
                                type === 'aspectRatio'
                                  ? 'aspect_ratio'
                                  : type === 'motionStrength'
                                    ? 'motion_strength'
                                    : type == 'refFrameMode'
                                      ? 'generationType'
                                      : type
                              ] ??
                              options[0]?.value;

                            // 检查是否是范围类型
                            const isRangeType =
                              selectedModelConfig?.customOptions?.[type] &&
                              'type' in
                                selectedModelConfig.customOptions[type] &&
                              selectedModelConfig.customOptions[type].type ===
                                'range';

                            // 范围类型渲染滑块控件
                            if (isRangeType) {
                              const rangeConfig = selectedModelConfig
                                .customOptions[type] as any;
                              const currentNum =
                                Number(currentValue) || rangeConfig.min;

                              return (
                                <div key={type} className="space-y-3">
                                  <Label className="text-muted-foreground text-xs font-medium">
                                    {t(label)}
                                  </Label>
                                  <div className="flex items-center gap-4">
                                    <input
                                      type="range"
                                      min={rangeConfig.min}
                                      max={rangeConfig.max}
                                      step={rangeConfig.step}
                                      value={currentNum}
                                      onChange={(e) =>
                                        setAdvancedOptions((prev) => ({
                                          ...prev,
                                          [type]: e.target.value,
                                        }))
                                      }
                                      className="bg-muted accent-primary h-2 flex-1 cursor-pointer appearance-none rounded-lg"
                                    />
                                    <span className="bg-primary/10 min-w-[60px] rounded-full px-3 py-1 text-center text-sm font-medium">
                                      {currentNum}
                                      {rangeConfig.unit || 's'}
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            // 普通类型渲染按钮网格
                            return (
                              <div key={type} className="space-y-2">
                                <Label className="text-muted-foreground text-xs font-medium">
                                  {t(label)}
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                  {options.map((option) => (
                                    <motion.button
                                      key={option.value}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() =>
                                        setAdvancedOptions((prev) => ({
                                          ...prev,
                                          [type]: option.value,
                                        }))
                                      }
                                      className={cn(
                                        'flex flex-col items-center justify-center gap-0.5 rounded-md border p-1.5 text-[10px] font-medium transition-all duration-200',
                                        currentValue === option.value
                                          ? 'bg-primary/20 border-primary text-primary shadow-primary/20 shadow-sm'
                                          : 'bg-background/60 border-primary/20 hover:border-primary/50 hover:shadow-sm'
                                      )}
                                    >
                                      <span>{t(option.label)}</span>
                                    </motion.button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}

                  {/* 积分信息 制作积分小于100的实际显示余额和充值按钮*/}
                  <div className="ml-auto flex items-center gap-2 text-sm">
                    {isMounted &&
                    isCreditsLoaded &&
                    user &&
                    remainingCredits <= 100 ? (
                      <>
                        <span>
                          {t('credits_remaining', {
                            credits: remainingCredits,
                          })}
                        </span>
                        <Link href="/pricing">
                          <Button
                            variant="link"
                            size="sm"
                            className="text-primary h-auto p-0"
                          >
                            {t('buy_credits')}
                          </Button>
                        </Link>
                      </>
                    ) : null}
                  </div>

                  {/* 生成按钮 */}
                  {!isMounted ? (
                    <Button
                      className="border-border bg-foreground/10 hover:bg-foreground/15 text-foreground rounded-full border px-6 text-sm font-medium transition-all duration-300"
                      disabled
                    >
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('loading')}
                    </Button>
                  ) : isCheckSign ? (
                    <Button
                      className="border-border bg-foreground/10 hover:bg-foreground/15 text-foreground rounded-full border px-6 text-sm font-medium transition-all duration-300"
                      disabled
                    >
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('checking_account')}
                    </Button>
                  ) : user ? (
                    <Button
                      className="border-border bg-foreground/10 hover:bg-foreground/15 text-foreground rounded-full border px-6 text-sm font-medium transition-all duration-300 hover:shadow-lg"
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
                          {(() => {
                            if (!selectedModelConfig) {
                              return (
                                <span className="ml-2 text-xs opacity-80">
                                  {costCredits} {t('credits')}
                                </span>
                              );
                            }
                            const { original, discounted, discountRate } =
                              calculateCurrentCredits();
                            return (
                              <span className="ml-2 flex items-center gap-1 text-xs opacity-80">
                                {discountRate < 1 && (
                                  <span className="text-muted-foreground line-through">
                                    {original}
                                  </span>
                                )}
                                <span>{discounted}</span>
                                {t('credits')}
                              </span>
                            );
                          })()}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="border-border bg-foreground/10 hover:bg-foreground/15 text-foreground rounded-full border px-6 text-sm font-medium transition-all duration-300 hover:shadow-lg"
                      onClick={() => setIsShowSignModal(true)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {t('sign_in_to_generate')}
                    </Button>
                  )}
                </div>

                {/* 视频预览区域 - 渐进式显示 */}
                <AnimatePresence>
                  {showPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: 20 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: 20 }}
                      transition={{
                        duration: 0.6,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      className="overflow-hidden"
                    >
                      <div className="border-primary/10 mt-6 border-t pt-6">
                        <AnimatePresence mode="wait">
                          {isGenerating ? (
                            <motion.div
                              key="progress"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-4"
                            >
                              <div className="text-center">
                                <p className="mb-2 text-lg font-medium">
                                  ⏳ {t('generating')}
                                </p>
                                <ProgressBar progress={progress} />
                                <p className="text-muted-foreground mt-3 text-sm">
                                  {taskStatusLabel}
                                </p>
                                <p className="text-primary mt-2 text-2xl font-bold">
                                  {progress}%
                                </p>
                              </div>
                            </motion.div>
                          ) : generatedVideos.length > 0 ? (
                            <motion.div
                              key="result"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4 }}
                              className="space-y-4"
                            >
                              {generatedVideos.map((video) => (
                                <div key={video.id} className="space-y-3">
                                  <div className="border-primary/20 relative overflow-hidden rounded-2xl border bg-black/5">
                                    <video
                                      src={video.url}
                                      controls
                                      className="h-auto max-h-[300px] w-full"
                                      preload="metadata"
                                    />
                                  </div>
                                  <div className="flex items-center justify-center gap-3">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleShareVideo(video)}
                                      className="bg-background/60 border-primary/20 hover:bg-background/80 hover:border-primary/40 border backdrop-blur-sm transition-all duration-200"
                                    >
                                      <Share2 className="mr-2 h-4 w-4" />
                                      {t('share')}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownloadVideo(video)}
                                      disabled={downloadingVideoId === video.id}
                                      className="bg-background/60 border-primary/20 hover:bg-background/80 hover:border-primary/40 border backdrop-blur-sm transition-all duration-200"
                                    >
                                      {downloadingVideoId === video.id ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      ) : (
                                        <Download className="mr-2 h-4 w-4" />
                                      )}
                                      {t('download')}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setShowPreview(false);
                                        setGeneratedVideos([]);
                                      }}
                                      className="bg-background/60 border-primary/20 hover:bg-background/80 hover:border-primary/40 border backdrop-blur-sm transition-all duration-200"
                                    >
                                      🔄 {t('regenerate')}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </ScrollAnimation>
    </section>
  );
}
