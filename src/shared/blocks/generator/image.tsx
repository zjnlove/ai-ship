'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronUp,
  Download,
  ImageIcon,
  Loader2,
  Settings,
  Share2,
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
import { Input } from '@/shared/components/ui/input';
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
  DEFAULT_CREDITS,
  getAdvancedOptionValue,
  getAvailableModels,
  getAvailableProviders,
  getDefaultAdvancedOptions,
  getDiscountLabel,
  getModelCredits,
  getModelCustomFields,
  getModelImageFieldName,
  getModelOptionFieldName,
  getModelSceneConfig,
  getModelSceneId,
  getOptionLabel,
  getOptionsForModel,
  MODEL_OPTIONS,
  PROVIDER_OPTIONS,
  type ImageAdvancedOptionValues,
  type ImageBrand,
  type ImageScene,
  type ModelOption,
  type OptionType,
} from './image-config/index';

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

type ImageGeneratorTab = ImageScene;

const POLL_INTERVAL = 5000;
const GENERATION_TIMEOUT = 180000;
const MAX_PROMPT_LENGTH = 2000;
const optionKeyMap: Record<string, OptionType> = {
  aspect_ratio: 'aspectRatio',
  output_format: 'outputFormat',
  quality: 'quality',
  resolution: 'resolution',
  seed: 'seed',
  enable_sequential: 'enable_sequential',
  outputs: 'outputs',
};

function normalizeOptionKey(key: string): string {
  return optionKeyMap[key] ?? key;
}

const reverseOptionKeyMap: Record<string, string> = Object.fromEntries(
  Object.entries(optionKeyMap).map(([k, v]) => [v, k])
);

function denormalizeOptionKey(key: string): string {
  return reverseOptionKeyMap[key] ?? key;
}

function parseTaskResult(taskResult: string | null): any {
  if (!taskResult) return null;

  try {
    return JSON.parse(taskResult);
  } catch (error) {
    console.warn('Failed to parse taskResult:', error);
    return null;
  }
}

function extractImageUrls(result: any): string[] {
  if (!result) return [];

  const images = result.images;
  if (Array.isArray(images)) {
    return images
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

  const output = result.output ?? result.image ?? result.data;
  if (!output) return [];

  if (typeof output === 'string') return [output];

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
    if (typeof candidate === 'string') return [candidate];
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
  const pathname = usePathname();
  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();

  const [activeTab, setActiveTab] =
    useState<ImageGeneratorTab>('text-to-image');
  const [provider, setProvider] = useState<ImageBrand>(
    PROVIDER_OPTIONS[0]?.value ?? 'qwen'
  );
  const [model, setModel] = useState(() =>
    getModelSceneId(MODEL_OPTIONS[0], 'text-to-image')
  );
  const [prompt, setPrompt] = useState('');
  const [modeImages, setModeImages] = useState<
    Record<ImageGeneratorTab, ImageUploaderValue[]>
  >({
    'text-to-image': [],
    'image-to-image': [],
  });
  const [advancedOptions, setAdvancedOptions] =
    useState<ImageAdvancedOptionValues>({});
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
  const [showPreview, setShowPreview] = useState(false);
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [advancedPopoverOpen, setAdvancedPopoverOpen] = useState(false);

  const previousModelRef = useRef<string | null>(null);
  const hasInitializedFromPathRef = useRef(false);

  const referenceImageItems = modeImages[activeTab] ?? [];
  const referenceImageUrls = useMemo(
    () =>
      referenceImageItems
        .filter((item) => item.status === 'uploaded' && item.url)
        .map((item) => item.url as string),
    [referenceImageItems]
  );

  const selectedModelConfig = useMemo(
    () =>
      MODEL_OPTIONS.find(
        (option) => getModelSceneId(option, activeTab) === model
      ),
    [activeTab, model]
  );
  const sceneConfig = useMemo(() => {
    const baseConfig = {
      id: getModelSceneId(selectedModelConfig, activeTab),
      credits: selectedModelConfig?.credits?.[activeTab],
      maxImages: selectedModelConfig?.maxImages,
      defaultOptions: selectedModelConfig?.defaultOptions,
      advancedOptions: selectedModelConfig?.advancedOptions,
      customOptions: selectedModelConfig?.customOptions,
      customFields: selectedModelConfig?.customFields,
      discount: selectedModelConfig?.discount,
      creditRules: selectedModelConfig?.creditRules,
      dependencyRules: selectedModelConfig?.dependencyRules,
      inputValidation: selectedModelConfig?.inputValidation,
    };

    const sceneValue = getModelSceneConfig(selectedModelConfig, activeTab);
    if (!sceneValue) {
      return baseConfig;
    }

    return {
      ...baseConfig,
      id: sceneValue.id,
      credits: sceneValue.credits ?? baseConfig.credits,
      maxImages: sceneValue.maxImages ?? baseConfig.maxImages,
      defaultOptions: sceneValue.defaultOptions ?? baseConfig.defaultOptions,
      advancedOptions: sceneValue.advancedOptions ?? baseConfig.advancedOptions,
      customOptions: sceneValue.customOptions ?? baseConfig.customOptions,
      customFields: sceneValue.customFields ?? baseConfig.customFields,
      discount: sceneValue.discount ?? baseConfig.discount,
      creditRules: sceneValue.creditRules ?? baseConfig.creditRules,
      dependencyRules: sceneValue.dependencyRules ?? baseConfig.dependencyRules,
      inputValidation: sceneValue.inputValidation ?? baseConfig.inputValidation,
    };
  }, [activeTab, selectedModelConfig]);
  const availableProviders = useMemo(
    () => getAvailableProviders(activeTab),
    [activeTab]
  );
  const availableModels = useMemo(
    () => getAvailableModels(activeTab, provider),
    [activeTab, provider]
  );
  const advancedTypes = sceneConfig.advancedOptions?.supportedTypes ?? [];

  const costCredits = useMemo(() => {
    return getModelCredits(selectedModelConfig, activeTab, DEFAULT_CREDITS);
  }, [activeTab, selectedModelConfig]);

  const promptLength = prompt.trim().length;
  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const isCreditsLoaded = user?.credits !== undefined;
  const isPromptTooLong = promptLength > MAX_PROMPT_LENGTH;
  const isTextToImageMode = activeTab === 'text-to-image';
  const sceneMaxImages = useMemo(() => {
    if (!allowMultipleImages) return 1;
    return sceneConfig.maxImages ?? maxImages;
  }, [allowMultipleImages, maxImages, sceneConfig.maxImages]);
  const canUploadMultipleImages = allowMultipleImages && sceneMaxImages > 1;
  const sceneMaxSizeMB =
    sceneConfig.inputValidation?.image?.maxFileSize ?? maxSizeMB;

  const isReferenceUploading = useMemo(
    () => referenceImageItems.some((item) => item.status === 'uploading'),
    [referenceImageItems]
  );
  const hasReferenceUploadError = useMemo(
    () => referenceImageItems.some((item) => item.status === 'error'),
    [referenceImageItems]
  );
  const taskStatusLabel = useMemo(() => {
    if (!taskStatus) return '';

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

  const calculateCurrentCredits = useCallback(() => {
    if (!selectedModelConfig) {
      return { original: 0, discounted: 0, discountRate: 1 };
    }

    const selectedOptions: Record<string, string | boolean | number> = {};

    Object.entries(sceneConfig.defaultOptions ?? {}).forEach(([key, value]) => {
      if (value !== undefined && typeof value !== 'boolean') {
        selectedOptions[normalizeOptionKey(key)] = value;
      }
    });

    Object.entries(advancedOptions).forEach(([key, value]) => {
      if (value !== undefined) {
        selectedOptions[key] = value;
      }
    });

    return calculateDiscountedCredits(
      selectedModelConfig,
      activeTab,
      selectedOptions
    );
  }, [
    activeTab,
    advancedOptions,
    sceneConfig.defaultOptions,
    selectedModelConfig,
  ]);
  const currentCreditInfo = useMemo(
    () => calculateCurrentCredits(),
    [calculateCurrentCredits]
  );

  const disabledOptions = useMemo(() => {
    const disabled = new Set<string>();

    sceneConfig.dependencyRules?.forEach((rule) => {
      const isMatch = Object.entries(rule.when).every(
        ([key, value]) =>
          advancedOptions[normalizeOptionKey(key) as OptionType] === value
      );

      if (isMatch) {
        rule.then.disabled?.forEach((item) => disabled.add(item));
      }
    });

    return disabled;
  }, [advancedOptions, sceneConfig.dependencyRules]);

  const resetTaskState = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setTaskId(null);
    setGenerationStartTime(null);
    setTaskStatus(null);
  }, []);

  const resetAdvancedOptions = useCallback(
    (nextModelConfig?: ModelOption | null) => {
      setAdvancedOptions(
        getDefaultAdvancedOptions(
          nextModelConfig ?? selectedModelConfig,
          activeTab
        )
      );
    },
    [activeTab, selectedModelConfig]
  );

  useEffect(() => {
    if (!sceneConfig.dependencyRules?.length) return;

    let hasUpdates = false;
    const nextOptions: ImageAdvancedOptionValues = {};
    let messageToShow: string | null = null;

    sceneConfig.dependencyRules.forEach((rule) => {
      const isMatch = Object.entries(rule.when).every(
        ([key, value]) =>
          advancedOptions[normalizeOptionKey(key) as OptionType] === value
      );

      if (!isMatch || !rule.then.autoSelect) return;

      Object.entries(rule.then.autoSelect).forEach(([key, value]) => {
        const normalizedKey = normalizeOptionKey(key) as OptionType;
        if (advancedOptions[normalizedKey] !== value) {
          nextOptions[normalizedKey] = value;
          hasUpdates = true;
        }
      });

      if (rule.then.message) {
        messageToShow = rule.then.message;
      }
    });

    if (hasUpdates) {
      setAdvancedOptions((prev) => ({
        ...prev,
        ...nextOptions,
      }));

      if (messageToShow) {
        toast.info(messageToShow);
      }
    }
  }, [advancedOptions, sceneConfig.dependencyRules]);

  const effectiveCustomOptions = useMemo(() => {
    const options = { ...(sceneConfig.customOptions ?? {}) };

    sceneConfig.dependencyRules?.forEach((rule) => {
      const isMatch = Object.entries(rule.when).every(
        ([key, value]) =>
          advancedOptions[normalizeOptionKey(key) as OptionType] === value
      );

      if (isMatch && rule.then.updateOptions) {
        Object.entries(rule.then.updateOptions).forEach(([key, value]) => {
          if (options[key]) {
            options[key] = {
              ...(options[key] as any),
              ...(value as any),
            };
          } else {
            options[key] = value as any;
          }
        });
      }
    });

    return options;
  }, [advancedOptions, sceneConfig.customOptions, sceneConfig.dependencyRules]);

  const handleReferenceImagesChange = useCallback(
    (items: ImageUploaderValue[]) => {
      setModeImages((prev) => ({
        ...prev,
        [activeTab]: items,
      }));
    },
    [activeTab]
  );

  const handleReferenceImageValidateFile = useCallback(
    (file: File) => {
      const validation = sceneConfig.inputValidation?.image;
      if (!validation) return true;

      const size = Math.round(file.size / 1024 / 1024);
      const format = file.name.split('.').pop()?.toLowerCase() || '';

      if (validation.maxFileSize && size > validation.maxFileSize) {
        toast.error(
          t('validation.image_too_large', {
            max: validation.maxFileSize,
            actual: size,
          })
        );
        return false;
      }

      if (
        validation.supportedFormats?.length &&
        !validation.supportedFormats.includes(format)
      ) {
        toast.error(
          t('validation.image_unsupported_format', {
            supported: validation.supportedFormats.join(', ').toUpperCase(),
            actual: format.toUpperCase(),
          })
        );
        return false;
      }

      return true;
    },
    [sceneConfig.inputValidation]
  );

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as ImageGeneratorTab;
      const currentModelSupportsTab = Boolean(
        getModelSceneId(selectedModelConfig, tab)
      );

      if (currentModelSupportsTab && selectedModelConfig) {
        setActiveTab(tab);
        setProvider(selectedModelConfig.brand);
        setModel(getModelSceneId(selectedModelConfig, tab));
        setGeneratedImages([]);
        setShowPreview(false);
        return;
      }

      const providers = getAvailableProviders(tab);
      const nextProvider =
        providers.find((item) => item.value === provider)?.value ??
        providers[0]?.value ??
        '';
      const models = getAvailableModels(tab, nextProvider);
      const nextModel = getModelSceneId(models[0], tab);

      setActiveTab(tab);
      setProvider(nextProvider);
      setModel(nextModel);
      setGeneratedImages([]);
      setShowPreview(false);
    },
    [provider, selectedModelConfig]
  );

  const handleProviderChange = useCallback(
    (value: string) => {
      const nextProvider = value as ImageBrand;
      const nextModels = getAvailableModels(activeTab, nextProvider);
      setProvider(nextProvider);
      setModel(getModelSceneId(nextModels[0], activeTab));
    },
    [activeTab]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (hasInitializedFromPathRef.current) return;

    const routeTab: ImageGeneratorTab | null = pathname.includes(
      'image-to-image'
    )
      ? 'image-to-image'
      : pathname.includes('text-to-image')
        ? 'text-to-image'
        : null;

    const imageModelMatch = pathname.match(/\/image-models\/([^/]+)/);
    if (imageModelMatch) {
      const matchedModel = MODEL_OPTIONS.find(
        (option) => option.modelPath === imageModelMatch[1]
      );

      if (matchedModel) {
        const matchedTab =
          routeTab && getModelSceneId(matchedModel, routeTab)
            ? routeTab
            : getModelSceneId(matchedModel, 'text-to-image')
              ? 'text-to-image'
              : 'image-to-image';

        setActiveTab(matchedTab);
        setProvider(matchedModel.brand);
        setModel(getModelSceneId(matchedModel, matchedTab));
      }

      hasInitializedFromPathRef.current = true;
      return;
    }

    if (routeTab && routeTab !== activeTab) {
      const providers = getAvailableProviders(routeTab);
      const nextProvider =
        providers.find((item) => item.value === provider)?.value ??
        providers[0]?.value ??
        '';
      const models = getAvailableModels(routeTab, nextProvider);

      setActiveTab(routeTab);
      setProvider(nextProvider);
      setModel(getModelSceneId(models[0], routeTab));
    }

    hasInitializedFromPathRef.current = true;
  }, [activeTab, pathname, provider]);

  useEffect(() => {
    if (!availableProviders.some((item) => item.value === provider)) {
      const nextProvider = availableProviders[0]?.value ?? '';
      const nextModel = getModelSceneId(
        getAvailableModels(activeTab, nextProvider)[0],
        activeTab
      );
      setProvider(nextProvider);
      setModel(nextModel);
      return;
    }

    if (
      !availableModels.some(
        (item) => getModelSceneId(item, activeTab) === model
      )
    ) {
      setModel(getModelSceneId(availableModels[0], activeTab));
    }
  }, [activeTab, availableModels, availableProviders, model, provider]);

  useEffect(() => {
    if (!selectedModelConfig) return;

    if (previousModelRef.current !== model) {
      resetAdvancedOptions(selectedModelConfig);
      previousModelRef.current = model;
    }
  }, [model, resetAdvancedOptions, selectedModelConfig]);

  useEffect(() => {
    if (
      !sceneConfig.inputValidation?.image ||
      referenceImageItems.length === 0
    ) {
      return;
    }

    const { maxFileSize, supportedFormats } = sceneConfig.inputValidation.image;
    const validItems: ImageUploaderValue[] = [];
    let hasInvalid = false;

    for (const item of referenceImageItems) {
      if (item.status !== 'uploaded') {
        validItems.push(item);
        continue;
      }

      let isValid = true;
      if (maxFileSize && item.size) {
        const size = Math.round(item.size / 1024 / 1024);
        if (size > maxFileSize) {
          isValid = false;
        }
      }
      if (supportedFormats?.length && item.url) {
        const format = item.url.split('.').pop()?.toLowerCase() || '';
        if (!supportedFormats.includes(format)) {
          isValid = false;
        }
      }

      if (isValid) {
        validItems.push(item);
      } else {
        hasInvalid = true;
      }
    }

    if (hasInvalid) {
      setModeImages((prev) => ({
        ...prev,
        [activeTab]: validItems,
      }));
      toast.info(
        'Some reference images were removed because the selected model does not support them.'
      );
    }
  }, [activeTab, referenceImageItems, sceneConfig.inputValidation]);

  useEffect(() => {
    if (referenceImageItems.length <= sceneMaxImages) return;

    setModeImages((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].slice(0, sceneMaxImages),
    }));
    toast.info(
      `This model supports up to ${sceneMaxImages} reference image${sceneMaxImages > 1 ? 's' : ''}.`
    );
  }, [activeTab, referenceImageItems.length, sceneMaxImages]);

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
        const parsedResult =
          parseTaskResult(task.taskInfo) ?? parseTaskResult(task.taskResult);
        const imageUrls = extractImageUrls(parsedResult);

        setTaskStatus(currentStatus);

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
          await fetchUserCredits();
          return true;
        }

        if (currentStatus === AITaskStatus.FAILED) {
          toast.error(parsedResult?.errorMessage || 'Generate image failed');
          resetTaskState();
          await fetchUserCredits();
          return true;
        }

        setProgress((prev) => Math.min(prev + 5, 95));
        return false;
      } catch (error: any) {
        console.error('Error polling image task:', error);
        toast.error(`Query task failed: ${error.message}`);
        resetTaskState();
        await fetchUserCredits();
        return true;
      }
    },
    [fetchUserCredits, generationStartTime, resetTaskState]
  );

  useEffect(() => {
    if (!taskId || !isGenerating) return;

    let cancelled = false;

    const tick = async () => {
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
      if (completed) {
        clearInterval(interval);
      }
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isGenerating, pollTaskStatus, taskId]);
  const handleGenerate = useCallback(async () => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    if (remainingCredits < currentCreditInfo.discounted) {
      toast.error('Insufficient credits. Please top up to keep creating.');
      return;
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      toast.error('Please enter a prompt before generating.');
      return;
    }

    if (!provider || !model || !selectedModelConfig) {
      toast.error('Provider or model is not configured correctly.');
      return;
    }

    if (!isTextToImageMode && referenceImageUrls.length === 0) {
      toast.error('Please upload reference images before generating.');
      return;
    }

    const options: Record<string, any> = {
      ...(sceneConfig.defaultOptions ?? {}),
    };

    advancedTypes.forEach((type) => {
      if (type === 'switch') {
        const switches = sceneConfig.advancedOptions?.switches ?? [];
        switches.forEach((sw) => {
          const value = advancedOptions[sw.id] ?? sw.defaultValue;
          if (value !== undefined) {
            options[sw.id] = value;
          }
        });
        return;
      }

      const value = getAdvancedOptionValue(
        type,
        advancedOptions,
        selectedModelConfig,
        activeTab
      );
      console.log(value);

      if (!value) return;

      const optionFieldName = getModelOptionFieldName(
        type,
        selectedModelConfig,
        activeTab
      );

      options[optionFieldName] = value;
      // 有自定义字段，要删除旧字段
      if (optionFieldName != denormalizeOptionKey(type))
        delete options[denormalizeOptionKey(type)];
      console.log(options);
    });

    if (!isTextToImageMode && referenceImageUrls.length > 0) {
      const imageFieldName = getModelImageFieldName(
        selectedModelConfig,
        activeTab
      );
      const imageField = getModelCustomFields(
        selectedModelConfig,
        activeTab
      ).find((field) => field.type === 'image');
      options[imageFieldName] =
        imageField?.isArray === false
          ? referenceImageUrls[0]
          : referenceImageUrls;
    }

    setIsGenerating(true);
    setProgress(15);
    setTaskStatus(AITaskStatus.PENDING);
    setGeneratedImages([]);
    setShowPreview(true);
    setGenerationStartTime(Date.now());

    try {
      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaType: AIMediaType.IMAGE,
          scene: sceneConfig.id || activeTab,
          provider: selectedModelConfig.provider ?? provider,
          model,
          prompt: trimmedPrompt,
          options,
          credits: currentCreditInfo.discounted,
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

      const immediateResult =
        parseTaskResult(data.taskInfo ?? null) ??
        parseTaskResult(data.taskResult ?? null);
      const immediateImageUrls = extractImageUrls(immediateResult);

      if (
        data.status === AITaskStatus.SUCCESS &&
        immediateImageUrls.length > 0
      ) {
        setGeneratedImages(
          immediateImageUrls.map((url, index) => ({
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
        await fetchUserCredits();
        return;
      }

      setTaskId(newTaskId);
      setProgress(25);
      await fetchUserCredits();
    } catch (error: any) {
      console.error('Failed to generate image:', error);
      toast.error(`Failed to generate image: ${error.message}`);
      resetTaskState();
    }
  }, [
    activeTab,
    advancedOptions,
    advancedTypes,
    currentCreditInfo.discounted,
    fetchUserCredits,
    isTextToImageMode,
    model,
    prompt,
    provider,
    referenceImageUrls,
    remainingCredits,
    resetTaskState,
    selectedModelConfig,
    setIsShowSignModal,
    user,
  ]);

  const handleDownloadImage = useCallback(async (image: GeneratedImage) => {
    if (!image.url) return;

    try {
      setDownloadingImageId(image.id);
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
  }, []);

  const handleShareImage = useCallback(async (image: GeneratedImage) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: image.prompt || 'Generated image',
          text: image.prompt || 'Check out this generated image',
          url: image.url,
        });
      } else {
        await navigator.clipboard.writeText(image.url);
        toast.success('Image link copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to share image:', error);
      toast.error('Failed to share image');
    }
  }, []);

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

      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < particleCount; i += 1) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }

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

        particles.forEach((p1, index) => {
          particles.slice(index + 1).forEach((p2) => {
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
            <motion.div
              layout
              className="from-primary/5 via-background to-primary/10 border-primary/10 shadow-primary/5 relative overflow-hidden rounded-3xl border bg-gradient-to-br shadow-xl backdrop-blur-xl"
            >
              <div className="p-6 md:p-8">
                {srOnlyTitle && <h2 className="sr-only">{srOnlyTitle}</h2>}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]">
                  <div className="flex min-h-[160px] items-start justify-center">
                    {!isTextToImageMode ? (
                      <div>
                        <ImageUploader
                          key={`image-${activeTab}`}
                          defaultPreviews={referenceImageUrls}
                          title={t('form.reference_image')}
                          allowMultiple={canUploadMultipleImages}
                          maxImages={sceneMaxImages}
                          maxSizeMB={sceneMaxSizeMB}
                          onChange={handleReferenceImagesChange}
                          emptyHint={t('form.reference_image_placeholder')}
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
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      id="image-prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={t('form.prompt_placeholder')}
                      className="placeholder:text-muted-foreground/60 min-h-32 border-0 transition-all duration-300 focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      style={{ backgroundColor: 'transparent' }}
                    />
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>
                        {promptLength} / {MAX_PROMPT_LENGTH}
                      </span>
                    </div>
                    {isPromptTooLong && (
                      <div className="text-destructive text-xs">
                        {t('form.prompt_too_long')}
                      </div>
                    )}
                    {hasReferenceUploadError && (
                      <div className="text-destructive text-xs">
                        {t('form.some_images_failed_to_upload')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Select value={activeTab} onValueChange={handleTabChange}>
                    <SelectTrigger className="bg-background/60 border-primary/20 hover:bg-background/80 hover:border-primary/40 w-auto min-w-[140px] border backdrop-blur-sm transition-all duration-200 hover:shadow-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-to-image">
                        {t('tabs.text-to-image')}
                      </SelectItem>
                      <SelectItem value="image-to-image">
                        {t('tabs.image-to-image')}
                      </SelectItem>
                    </SelectContent>
                  </Select>

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
                            getDiscountLabel(
                              selectedModelConfig,
                              activeTab
                            ) && (
                              <span className="rounded bg-pink-100 px-1 text-[10px] text-pink-600">
                                {getDiscountLabel(
                                  selectedModelConfig,
                                  activeTab
                                )}
                              </span>
                            )}
                        </span>
                        <ChevronUp className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[420px]"
                      side="top"
                      align="start"
                    >
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <div className="border-border space-y-1 border-r pr-2">
                          <p className="text-muted-foreground mb-2 px-2 text-xs">
                            Providers
                          </p>
                          {availableProviders.map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => handleProviderChange(item.value)}
                              className={cn(
                                'hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-lg p-2 text-sm transition-colors',
                                provider === item.value &&
                                  'bg-primary/20 text-primary font-medium'
                              )}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>

                        <div className="max-h-60 space-y-1 overflow-y-auto">
                          <p className="text-muted-foreground mb-2 px-2 text-xs">
                            Models
                          </p>
                          {availableModels.map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => {
                                const nextModel = getModelSceneId(
                                  item,
                                  activeTab
                                );
                                if (nextModel === model) {
                                  setModelPopoverOpen(false);
                                  return;
                                }

                                setModel(nextModel);
                                setModelPopoverOpen(false);
                              }}
                              className={cn(
                                'hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between rounded-lg p-2 text-sm transition-colors',
                                model === getModelSceneId(item, activeTab) &&
                                  'bg-primary/20 text-primary font-medium'
                              )}
                            >
                              <span className="flex items-center gap-1">
                                {item.label}
                                {getDiscountLabel(item, activeTab) && (
                                  <span className="rounded bg-pink-100 px-1 text-[10px] text-pink-600">
                                    {getDiscountLabel(item, activeTab)}
                                  </span>
                                )}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {getModelCredits(
                                  item,
                                  activeTab,
                                  DEFAULT_CREDITS
                                )}{' '}
                                credits
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {advancedTypes.length > 0 && (
                    <Popover
                      open={advancedPopoverOpen}
                      onOpenChange={setAdvancedPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-background/60 border-primary/20 hover:bg-background/80 hover:border-primary/40 gap-2 border backdrop-blur-sm transition-all duration-200 hover:shadow-md"
                        >
                          <Settings className="h-4 w-4" />
                          <span className="flex items-center gap-1">
                            {advancedTypes
                              .slice(0, 3)
                              .flatMap((type, index) => {
                                if (type === 'switch') {
                                  const switches =
                                    sceneConfig.advancedOptions?.switches ?? [];
                                  return switches.map((sw, swIndex) => {
                                    const value = getAdvancedOptionValue(
                                      sw.id,
                                      advancedOptions,
                                      selectedModelConfig,
                                      activeTab
                                    );
                                    return (
                                      <span
                                        key={`${type}:${sw.id}`}
                                        className="flex items-center gap-1"
                                      >
                                        {(index > 0 || swIndex > 0) && (
                                          <span className="text-muted-foreground">
                                            |
                                          </span>
                                        )}
                                        <span className="bg-primary/10 rounded-full px-2 py-0.5 text-xs">
                                          {value
                                            ? t(
                                                'advanced_options.switch_options.on'
                                              )
                                            : t(
                                                'advanced_options.switch_options.off'
                                              )}
                                        </span>
                                      </span>
                                    );
                                  });
                                }

                                const value = getAdvancedOptionValue(
                                  type,
                                  advancedOptions,
                                  selectedModelConfig,
                                  activeTab
                                );
                                const displayValue =
                                  typeof value === 'boolean'
                                    ? value
                                      ? t('advanced_options.switch_options.on')
                                      : t('advanced_options.switch_options.off')
                                    : value;

                                return (
                                  <span
                                    key={type}
                                    className="flex items-center gap-1"
                                  >
                                    {index > 0 && (
                                      <span className="text-muted-foreground">
                                        |
                                      </span>
                                    )}
                                    <span className="bg-primary/10 rounded-full px-2 py-0.5 text-xs">
                                      {displayValue}
                                    </span>
                                  </span>
                                );
                              })}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[420px]"
                        side="top"
                        align="start"
                      >
                        <div className="space-y-4">
                          {advancedTypes.map((type) => {
                            const currentValue = getAdvancedOptionValue(
                              type,
                              advancedOptions,
                              selectedModelConfig,
                              activeTab
                            );

                            if (type === 'switch') {
                              const switches =
                                sceneConfig.advancedOptions?.switches ?? [];
                              if (switches.length === 0) return null;

                              return (
                                <div key={type} className="space-y-4">
                                  {switches.map((sw) => {
                                    const swValue = getAdvancedOptionValue(
                                      sw.id,
                                      advancedOptions,
                                      selectedModelConfig,
                                      activeTab
                                    );
                                    const isDisabled = disabledOptions.has(
                                      sw.id
                                    );
                                    return (
                                      <div
                                        key={sw.id}
                                        className={cn(
                                          'space-y-2',
                                          isDisabled &&
                                            'cursor-not-allowed opacity-50'
                                        )}
                                      >
                                        <Label className="text-muted-foreground text-xs font-medium">
                                          {t(sw.label)}
                                        </Label>
                                        <div className="flex items-center gap-2">
                                          <Switch
                                            checked={swValue as boolean}
                                            disabled={isDisabled}
                                            onCheckedChange={(checked) =>
                                              setAdvancedOptions((prev) => ({
                                                ...prev,
                                                [sw.id]: checked,
                                              }))
                                            }
                                          />
                                          <span className="text-muted-foreground text-xs">
                                            {swValue
                                              ? t(
                                                  'advanced_options.switch_options.on'
                                                )
                                              : t(
                                                  'advanced_options.switch_options.off'
                                                )}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }

                            // 检查是否是范围类型
                            const isRangeType =
                              effectiveCustomOptions?.[type] &&
                              'type' in effectiveCustomOptions?.[type]! &&
                              effectiveCustomOptions?.[type].type === 'range';

                            if (isRangeType) {
                              const rangeConfig = effectiveCustomOptions?.[
                                type
                              ] as any;
                              const currentNum =
                                Number(currentValue) || rangeConfig.min;

                              return (
                                <div key={type} className="space-y-3">
                                  <Label className="text-muted-foreground text-xs font-medium">
                                    {t(getOptionLabel(type))}
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
                                          [type]: Number(e.target.value),
                                        }))
                                      }
                                      className="bg-muted accent-primary h-2 flex-1 cursor-pointer appearance-none rounded-lg"
                                    />
                                    <span className="bg-primary/10 min-w-[60px] rounded-full px-3 py-1 text-center text-sm font-medium">
                                      {currentNum}
                                      {rangeConfig.unit || ''}
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            if (type === 'seed') {
                              return (
                                <div key={type} className="space-y-2">
                                  <Label className="text-muted-foreground text-xs font-medium">
                                    {t(getOptionLabel(type))}
                                  </Label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      value={currentValue as any}
                                      onChange={(e) =>
                                        setAdvancedOptions((prev) => ({
                                          ...prev,
                                          [type]:
                                            e.target.value === ''
                                              ? undefined
                                              : Number(e.target.value),
                                        }))
                                      }
                                      placeholder="0"
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setAdvancedOptions((prev) => ({
                                          ...prev,
                                          [type]: Math.floor(
                                            Math.random() * 1000000
                                          ),
                                        }))
                                      }
                                    >
                                      {t('random_seed')}
                                    </Button>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={type} className="space-y-2">
                                <Label className="text-muted-foreground text-xs font-medium">
                                  {t(getOptionLabel(type))}
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                  {getOptionsForModel(
                                    selectedModelConfig,
                                    type,
                                    activeTab,
                                    effectiveCustomOptions
                                  ).map((option) => {
                                    const isDisabled = disabledOptions.has(
                                      `${type}:${option.value}`
                                    );

                                    return (
                                      <motion.button
                                        key={String(option.value)}
                                        type="button"
                                        whileHover={
                                          isDisabled ? {} : { scale: 1.02 }
                                        }
                                        whileTap={
                                          isDisabled ? {} : { scale: 0.98 }
                                        }
                                        onClick={() =>
                                          !isDisabled &&
                                          setAdvancedOptions((prev) => ({
                                            ...prev,
                                            [type]: option.value,
                                          }))
                                        }
                                        className={cn(
                                          'flex items-center justify-center rounded-md border p-2 text-xs font-medium transition-all duration-200',
                                          currentValue === option.value
                                            ? 'bg-primary/20 border-primary text-primary shadow-primary/20 shadow-sm'
                                            : isDisabled
                                              ? 'bg-muted/50 border-muted-foreground/20 text-muted-foreground/40 cursor-not-allowed opacity-60'
                                              : 'bg-background/60 border-primary/20 hover:border-primary/50 hover:shadow-sm'
                                        )}
                                        disabled={isDisabled}
                                      >
                                        {option.label}
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}

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
                        isPromptTooLong ||
                        isReferenceUploading ||
                        hasReferenceUploadError ||
                        !prompt.trim() ||
                        (!isTextToImageMode && referenceImageUrls.length === 0)
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
                                <span>credits</span>
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
                                  {t('generating')}
                                </p>
                                <ProgressBar progress={progress} />
                                <p className="text-muted-foreground mt-3 text-sm">
                                  {taskStatusLabel}
                                </p>
                                <p className="text-primary mt-2 text-2xl font-bold">
                                  {progress}%
                                </p>

                                <div className="bg-primary/5 border-primary/20 mt-4 rounded-xl border p-4 text-left">
                                  <div className="flex items-start gap-3">
                                    <div className="text-primary mt-0.5">
                                      ⏱
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium">
                                        {t('waiting_hint.title')}
                                      </p>
                                      <p className="text-muted-foreground text-sm">
                                        {t('waiting_hint.description')}
                                      </p>
                                      <Link
                                        href="/activity/ai-tasks"
                                        target="_blank"
                                        className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium transition-colors"
                                      >
                                        {t('waiting_hint.link')}
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ) : generatedImages.length > 0 ? (
                            <motion.div
                              key="result"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4 }}
                              className="space-y-4"
                            >
                              <div
                                className={cn(
                                  'grid gap-4',
                                  generatedImages.length === 1
                                    ? 'grid-cols-1'
                                    : 'sm:grid-cols-2 xl:grid-cols-3'
                                )}
                              >
                                {generatedImages.map((image) => (
                                  <div key={image.id} className="space-y-3">
                                    <div className="border-primary/20 relative flex h-[260px] items-center justify-center overflow-hidden rounded-2xl border bg-black/5 sm:h-[320px]">
                                      <LazyImage
                                        src={image.url}
                                        alt={image.prompt || 'Generated image'}
                                        className="h-[320px] w-full object-contain object-center"
                                      />
                                    </div>
                                    <div className="flex items-center justify-center gap-3">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleShareImage(image)}
                                        className="bg-background/60 border-primary/20 hover:bg-background/80 hover:border-primary/40 border backdrop-blur-sm transition-all duration-200"
                                      >
                                        <Share2 className="mr-2 h-4 w-4" />
                                        {t('share')}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleDownloadImage(image)
                                        }
                                        disabled={
                                          downloadingImageId === image.id
                                        }
                                        className="bg-background/60 border-primary/20 hover:bg-background/80 hover:border-primary/40 border backdrop-blur-sm transition-all duration-200"
                                      >
                                        {downloadingImageId === image.id ? (
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
                                          setGeneratedImages([]);
                                        }}
                                        className="bg-background/60 border-primary/20 hover:bg-background/80 hover:border-primary/40 border backdrop-blur-sm transition-all duration-200"
                                      >
                                        🔄 {t('regenerate')}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="empty"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex flex-col items-center justify-center py-12 text-center"
                            >
                              <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                <ImageIcon className="text-muted-foreground h-10 w-10" />
                              </div>
                              <p className="text-muted-foreground">
                                {t('no_images_generated')}
                              </p>
                            </motion.div>
                          )}
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
