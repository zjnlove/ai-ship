import { task } from 'better-auth/react';
import { th } from 'zod/v4/locales';

import { envConfigs } from '@/config';
import { getUuid } from '@/shared/lib/hash';

import { saveFiles } from '.';
import {
  AIConfigs,
  AIFile,
  AIGenerateParams,
  AIImage,
  AIMediaType,
  AIProvider,
  AISong,
  AITaskResult,
  AITaskStatus,
  AIVideo,
} from './types';

/**
 * Kie configs
 * @docs https://kie.ai/
 */
export interface KieConfigs extends AIConfigs {
  apiKey: string;
  customStorage?: boolean; // use custom storage to save files
}

// ✅ 模块级全局锁，所有请求和实例共享，防止并发重复转存
const savingTasks = new Set<string>();

/**
 * Kie provider
 * @docs https://kie.ai/
 */
export class KieProvider implements AIProvider {
  // provider name
  readonly name = 'kie';
  // provider configs
  configs: KieConfigs;

  // api base url
  private baseUrl = 'https://api.kie.ai/api/v1';

  // init provider
  constructor(configs: KieConfigs) {
    this.configs = configs;
  }

  async generateMusic({
    params,
  }: {
    params: AIGenerateParams;
  }): Promise<AITaskResult> {
    const apiUrl = `${this.baseUrl}/generate`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    // todo: check model
    if (!params.model) {
      params.model = 'V5';
    }

    // build request params
    let payload: any = {
      prompt: params.prompt,
      model: params.model,
      callBackUrl: params.callbackUrl,
    };

    if (params.options && params.options.customMode) {
      // custom mode
      payload.customMode = true;
      payload.title = params.options.title;
      payload.style = params.options.style;
      payload.instrumental = params.options.instrumental;
      if (!params.options.instrumental) {
        // not instrumental, lyrics is used as prompt
        payload.prompt = params.options.lyrics;
      }
    } else {
      // not custom mode
      payload.customMode = false;
      payload.prompt = params.prompt;
      payload.instrumental = params.options?.instrumental;
    }

    // const params = {
    //   customMode: false,
    //   instrumental: false,
    //   style: "",
    //   title: "",
    //   prompt: prompt || "",
    //   model: model || "V4_5",
    //   callBackUrl,
    //   negativeTags: "",
    //   vocalGender: "m", // m or f
    //   styleWeight: 0.65,
    //   weirdnessConstraint: 0.65,
    //   audioWeight: 0.65,
    // };

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      throw new Error(`request failed with status: ${resp.status}`);
    }

    const { code, msg, data } = await resp.json();

    if (code !== 200) {
      throw new Error(`generate music failed: ${msg}`);
    }

    if (!data || !data.taskId) {
      throw new Error(`generate music failed: no taskId`);
    }

    return {
      taskStatus: AITaskStatus.PENDING,
      taskId: data.taskId,
      taskInfo: {},
      taskResult: data,
    };
  }

  async generateImage({
    params,
  }: {
    params: AIGenerateParams;
  }): Promise<AITaskResult> {
    const apiUrl = `${this.baseUrl}/jobs/createTask`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    if (!params.model) {
      throw new Error('model is required');
    }

    if (!params.prompt) {
      throw new Error('prompt is required');
    }

    // build request params
    let payload: any = {
      model: params.model,
      callBackUrl: params.callbackUrl,
      input: {
        prompt: params.prompt,
      },
    };

    if (params.options) {
      const options = params.options;
      // image_input : []
      if (options.image_input && Array.isArray(options.image_input)) {
        payload.input.image_input = options.image_input;
      }
      // image: string
      if (options.image && typeof options.image === 'string') {
        payload.input.image = options.image;
      }
      // input_urls: []
      if (options.input_urls && Array.isArray(options.input_urls)) {
        payload.input.input_urls = options.input_urls;
      }
      // image_url: string
      if (options.image_url && typeof options.image_url === 'string') {
        payload.input.image_url = options.image_url;
      }
      if (options.aspect_ratio) {
        payload.input.aspect_ratio = options.aspect_ratio;
      }
      if (options.image_size) {
        payload.input.image_size = options.image_size;
      }
      if (options.resolution) {
        payload.input.resolution = options.resolution;
      }
      if (options.output_format) {
        payload.input.output_format = options.output_format;
      }
      if (options.quality) {
        payload.input.quality = options.quality;
      }
      if (options.nsfw_checker !== undefined) {
        payload.input.nsfw_checker = options.nsfw_checker;
      }
    }
    // console.log('kie input', apiUrl, headers, payload);
    // throw new Error('kie generate image is disabled for testing');
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      throw new Error(`request failed with status: ${resp.status}`);
    }

    const { code, msg, data } = await resp.json();
    console.log('kie generate image response', { code, msg, data });

    if (code !== 200) {
      throw new Error(`generate image failed: ${msg}`);
    }

    if (!data || !data.taskId) {
      throw new Error(`generate image failed: no taskId`);
    }

    return {
      taskStatus: AITaskStatus.PENDING,
      taskId: data.taskId,
      taskInfo: {},
      taskResult: data,
    };
  }

  async generateVideo({
    params,
  }: {
    params: AIGenerateParams;
  }): Promise<AITaskResult> {
    let apiUrl = `${this.baseUrl}/jobs/createTask`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    if (!params.model) {
      throw new Error('model is required');
    }

    if (params.model.includes('veo3')) {
      apiUrl = `${this.baseUrl}/veo/generate`;
    }

    // console.log('kie generate video input', apiUrl, headers, params);
    // build request params
    let payload: any = {
      model: params.model,
      callBackUrl: params.callbackUrl,
      input: {},
    };

    if (params.prompt) {
      if (params.model.includes('veo3')) {
        payload.prompt = params.prompt;
      } else {
        payload.input.prompt = params.prompt;
      }
    }

    if (params.options) {
      const options = params.options;
      if (params.model.includes('veo3')) {
        payload = { ...payload, ...options };
      } else {
        payload.input = { ...payload.input, ...options };
      }
    }
    console.log('kie generate video payload', payload, apiUrl);

    // 接口测试模式，直接返回模拟结果
    if (envConfigs.api_test_mode === 'true') {
      return {
        taskStatus: AITaskStatus.PENDING,
        taskId: 'eaf83578cb8ce56ab1e6cb10c2ee73b9',
        taskInfo: {},
        taskResult: { taskId: 'eaf83578cb8ce56ab1e6cb10c2ee73b9' },
      };
    }
    throw new Error('kie generate video is disabled for testing');
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      console.log(
        'kie generate video response error',
        resp.status,
        await resp.text()
      );
      throw new Error(`request failed with status: ${resp.status}`);
    }

    const { code, msg, data } = await resp.json();

    if (code !== 200) {
      throw new Error(`generate video failed: ${msg}`);
    }

    if (!data || !data.taskId) {
      throw new Error(`generate video failed: no taskId`);
    }

    return {
      taskStatus: AITaskStatus.PENDING,
      taskId: data.taskId,
      taskInfo: {},
      taskResult: data,
    };
  }

  // generate task
  async generate({
    params,
  }: {
    params: AIGenerateParams;
  }): Promise<AITaskResult> {
    if (
      ![AIMediaType.MUSIC, AIMediaType.IMAGE, AIMediaType.VIDEO].includes(
        params.mediaType
      )
    ) {
      throw new Error(`mediaType not supported: ${params.mediaType}`);
    }

    if (params.mediaType === AIMediaType.MUSIC) {
      return this.generateMusic({ params });
    } else if (params.mediaType === AIMediaType.IMAGE) {
      return this.generateImage({ params });
    } else if (params.mediaType === AIMediaType.VIDEO) {
      return this.generateVideo({ params });
    }

    throw new Error(`mediaType not supported: ${params.mediaType}`);
  }

  async queryImage({ taskId }: { taskId: string }): Promise<AITaskResult> {
    const apiUrl = `${this.baseUrl}/jobs/recordInfo?taskId=${taskId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });
    if (!resp.ok) {
      throw new Error(`request failed with status: ${resp.status}`);
    }

    const { code, msg, data } = await resp.json();

    if (code !== 200) {
      throw new Error(msg);
    }

    if (!data || !data.state) {
      throw new Error(`query failed`);
    }

    let images: AIImage[] | undefined = undefined;

    if (data.resultJson) {
      const resultJson = JSON.parse(data.resultJson);
      const resultUrls = resultJson.resultUrls;
      if (Array.isArray(resultUrls)) {
        images = resultUrls.map((image: any) => ({
          id: '',
          createTime: new Date(data.createTime),
          imageUrl: image,
        }));
      }
    }

    const taskStatus = this.mapImageStatus(data.state);

    // use custom storage to save images
    if (
      taskStatus === AITaskStatus.SUCCESS &&
      images &&
      images.length > 0 &&
      this.configs.customStorage
    ) {
      const filesToSave: AIFile[] = [];
      images.forEach((image, index) => {
        if (image.imageUrl) {
          filesToSave.push({
            url: image.imageUrl,
            contentType: 'image/png',
            key: `kie/image/${getUuid()}.png`,
            index: index,
            type: 'image',
          });
        }
      });

      if (filesToSave.length > 0) {
        const uploadedFiles = await saveFiles(filesToSave);
        if (uploadedFiles) {
          uploadedFiles.forEach((file: AIFile) => {
            if (file && file.url && images && file.index !== undefined) {
              const image = images[file.index];
              if (image) {
                image.imageUrl = file.url;
              }
            }
          });
        }
      }
    }

    return {
      taskId,
      taskStatus,
      taskInfo: {
        images,
        status: data.state,
        errorCode: data.failCode,
        errorMessage: data.failMsg,
        createTime: new Date(data.createTime),
      },
      taskResult: data,
    };
  }

  async queryVideo({
    taskId,
    aiTaskId,
  }: {
    taskId: string;
    aiTaskId: string;
  }): Promise<AITaskResult> {
    const apiUrl = `${this.baseUrl}/jobs/recordInfo?taskId=${taskId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });
    if (!resp.ok) {
      throw new Error(`request failed with status: ${resp.status}`);
    }

    const { code, msg, data } = await resp.json();

    if (code !== 200) {
      throw new Error(msg);
    }

    if (!data || !data.state) {
      throw new Error(`query failed`);
    }

    let videos: AIVideo[] | undefined = undefined;

    if (data.resultJson) {
      const resultJson = JSON.parse(data.resultJson);
      const resultUrls = resultJson.resultUrls;
      if (Array.isArray(resultUrls)) {
        videos = resultUrls.map((video: any) => ({
          id: '',
          createTime: new Date(data.createTime),
          videoUrl: video,
        }));
      }
    }

    const taskStatus = this.mapImageStatus(data.state);
    // ✅ 异步后台转存，不阻塞当前请求响应
    if (
      taskStatus === AITaskStatus.SUCCESS &&
      videos &&
      videos.length > 0 &&
      this.configs.customStorage &&
      !savingTasks.has(taskId)
    ) {
      // 启用自定义存储， 立即启动异步转存，不等待结果
      setTimeout(async () => {
        await this.saveVideoWithRetry(taskId, aiTaskId, [...videos], data, 3);
      }, 0);
    }

    return {
      taskId,
      taskStatus,
      taskInfo: {
        videos,
        status: data.state,
        errorCode: data.failCode,
        errorMessage: data.failMsg,
        createTime: new Date(data.createTime),
      },
      taskResult: data,
    };
  }

  // query task
  async query({
    taskId,
    aiTaskId,
    mediaType,
  }: {
    taskId: string;
    aiTaskId: string;
    mediaType?: AIMediaType;
  }): Promise<AITaskResult> {
    if (mediaType === AIMediaType.IMAGE) {
      return this.queryImage({ taskId });
    }

    if (mediaType === AIMediaType.VIDEO) {
      return this.queryVideo({ taskId, aiTaskId });
    }

    const apiUrl = `${this.baseUrl}/generate/record-info?taskId=${taskId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });
    if (!resp.ok) {
      throw new Error(`request failed with status: ${resp.status}`);
    }

    const { code, msg, data } = await resp.json();

    if (code !== 200) {
      throw new Error(msg);
    }

    if (!data || !data.status) {
      throw new Error(`query failed`);
    }

    const songs: AISong[] = data?.response?.sunoData?.map((song: any) => ({
      id: song.id,
      createTime: new Date(song.createTime),
      audioUrl: song.audioUrl,
      imageUrl: song.imageUrl,
      duration: song.duration,
      prompt: song.prompt,
      title: song.title,
      tags: song.tags,
      style: song.style,
      model: song.modelName,
      artist: song.artist,
      album: song.album,
    }));

    const taskStatus = this.mapStatus(data.status);

    // save files if custom storage is enabled
    if (
      taskStatus === AITaskStatus.SUCCESS &&
      songs &&
      songs.length > 0 &&
      this.configs.customStorage
    ) {
      const audioFilesToSave: AIFile[] = [];
      const imageFilesToSave: AIFile[] = [];

      songs.forEach((song, index) => {
        if (song.audioUrl) {
          audioFilesToSave.push({
            url: song.audioUrl,
            contentType: 'audio/mpeg',
            key: `kie/audio/${getUuid()}.mp3`,
            index: index,
            type: 'audio',
          });
        }
        if (song.imageUrl) {
          imageFilesToSave.push({
            url: song.imageUrl,
            contentType: 'image/png',
            key: `kie/image/${getUuid()}.png`,
            index: index,
            type: 'image',
          });
        }
      });

      if (audioFilesToSave.length > 0) {
        const uploadedFiles = await saveFiles(audioFilesToSave);
        if (uploadedFiles) {
          uploadedFiles.forEach((file: AIFile) => {
            if (file && file.url && songs && file.index !== undefined) {
              const song = songs[file.index];
              song.audioUrl = file.url;
            }
          });
        }
      }

      if (imageFilesToSave.length > 0) {
        const uploadedFiles = await saveFiles(imageFilesToSave);
        if (uploadedFiles) {
          uploadedFiles.forEach((file: AIFile) => {
            if (file && file.url && songs && file.index !== undefined) {
              const song = songs[file.index];
              song.imageUrl = file.url;
            }
          });
        }
      }
    }

    return {
      taskId,
      taskStatus,
      taskInfo: {
        songs,
        status: data.status,
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
        createTime: new Date(data.createTime),
      },
      taskResult: data,
    };
  }

  /**
   * ✅ 带3次重试的异步视频转存方法
   * 指数退避策略: 2s → 5s → 10s
   */
  private async saveVideoWithRetry(
    taskId: string,
    aiTaskId: string,
    videos: AIVideo[],
    data: any,
    retries = 3
  ): Promise<void> {
    try {
      savingTasks.add(taskId);
      const filesToSave: AIFile[] = videos
        .filter((v) => v.videoUrl)
        .map((video, index) => ({
          url: video.videoUrl!,
          contentType: 'video/mp4',
          key: `kie/video/${getUuid()}.mp4`,
          index,
          type: 'video',
        }));
      if (filesToSave.length === 0) return;
      console.log(
        `[转存开始] taskId: ${taskId}, 视频数量: ${filesToSave.length}, 剩余重试: ${retries}`
      );
      const uploadedFiles = await saveFiles(filesToSave);
      if (uploadedFiles && uploadedFiles.length > 0) {
        // 更新video地址
        uploadedFiles.forEach((file) => {
          if (file?.url && file.index !== undefined && videos[file.index]) {
            videos[file.index].videoUrl = file.url;
          }
        });

        console.log(
          `[转存成功] taskId: ${taskId}, 成功数量: ${uploadedFiles.length}`
        );
        console.log('--------------' + aiTaskId);
        // ✅ 转存成功后更新数据库，保留所有原始字段
        if (aiTaskId) {
          try {
            const { updateAITaskById } = await import(
              '@/shared/models/ai_task'
            );

            // 构造完整的taskInfo，保留第三方所有原始字段
            const updatedTaskInfo = {
              videos,
              status: data.state,
              errorCode: data.failCode,
              errorMessage: data.failMsg,
              createTime: new Date(data.createTime),
            };

            await updateAITaskById(aiTaskId, {
              taskInfo: JSON.stringify(updatedTaskInfo),
            });

            console.log(
              `[数据库更新成功] aiTaskId: ${aiTaskId}, 转存地址已永久保存`
            );
          } catch (dbError: any) {
            console.error(
              `[数据库更新失败] aiTaskId: ${aiTaskId}`,
              dbError.message
            );
          }
        }
      }
    } catch (e: any) {
      if (retries > 0) {
        const delays = [2000, 5000, 10000];
        const delay = delays[3 - retries];
        console.log(
          `[转存重试] taskId: ${taskId}, ${retries}次后重试, 延迟${delay}ms, 错误: ${e.message}`
        );
        // 释放锁，允许下次重试
        savingTasks.delete(taskId);
        // 延迟重试
        setTimeout(() => {
          this.saveVideoWithRetry(taskId, aiTaskId, videos, data, retries - 1);
        }, delay);
        return;
      }
      // 全部重试失败
      console.error(
        `[转存最终失败] taskId: ${taskId}, 已重试3次, 降级使用原始地址`,
        e
      );
    } finally {
      // 只有不再重试的时候才永久释放锁
      if (retries <= 0) {
        savingTasks.delete(taskId);
      }
    }
  }

  // map image task status
  private mapImageStatus(status: string): AITaskStatus {
    switch (status) {
      case 'waiting':
        return AITaskStatus.PENDING;
      case 'queuing':
        return AITaskStatus.PENDING;
      case 'generating':
        return AITaskStatus.PROCESSING;
      case 'success':
        return AITaskStatus.SUCCESS;
      case 'fail':
        return AITaskStatus.FAILED;
      default:
        throw new Error(`unknown status: ${status}`);
    }
  }

  // map music task status
  private mapStatus(status: string): AITaskStatus {
    switch (status) {
      case 'PENDING':
        return AITaskStatus.PENDING;
      case 'TEXT_SUCCESS':
        return AITaskStatus.PROCESSING;
      case 'FIRST_SUCCESS':
        return AITaskStatus.PROCESSING;
      case 'SUCCESS':
        return AITaskStatus.SUCCESS;
      case 'CREATE_TASK_FAILED':
      case 'GENERATE_AUDIO_FAILED':
      case 'CALLBACK_EXCEPTION':
      case 'SENSITIVE_WORD_ERROR':
        return AITaskStatus.FAILED;
      default:
        throw new Error(`unknown status: ${status}`);
    }
  }
}
