import { ImageGenerationDto } from './dtos/imageGeneration.dto';
import * as path from 'path';
import * as fs from 'fs';
import { Injectable, NotFoundException } from '@nestjs/common';

import OpenAI from 'openai';

import { OrthograpyhDto } from './dtos/orthography.dto';
import {
  AudioToTextUseCase,
  imageGenerationUseCase,
  orthographyUseCase,
  prosConsDiscusserStreamUseCase,
  prosConsDiscusserUseCase,
  textToAudioUseCase,
  translateTextUseCase,
} from './use-cases';
import {
  AudioToTextDto,
  ProsConsDiscusserDto,
  TextToAudioDto,
  TranslateDto,
} from './dtos';

@Injectable()
export class GptService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async orthographyCheck(orthograpyhDto: OrthograpyhDto) {
    return await orthographyUseCase(this.openai, {
      prompt: orthograpyhDto.prompt,
    });
  }

  async prosConsDiscusser({ prompt }: ProsConsDiscusserDto) {
    return await prosConsDiscusserUseCase(this.openai, {
      prompt,
    });
  }

  async prosConsDiscusserStream({ prompt }: ProsConsDiscusserDto) {
    return await prosConsDiscusserStreamUseCase(this.openai, {
      prompt,
    });
  }

  async translateText({ prompt, lang }: TranslateDto) {
    return await translateTextUseCase(this.openai, {
      prompt,
      lang,
    });
  }

  async textToAudio({ prompt, voice }: TextToAudioDto) {
    return await textToAudioUseCase(this.openai, {
      prompt,
      voice,
    });
  }

  getTextToAudio(fileId: string) {
    const filePath = path.resolve(
      __dirname,
      '../../generated/audios/',
      `${fileId}.mp3`,
    );

    const wasFound = fs.existsSync(filePath);

    if (!wasFound) throw new NotFoundException(`File ${fileId} not found`);

    return filePath;
  }

  async audioToText(
    audioFile: Express.Multer.File,
    audioToTextDto: AudioToTextDto,
  ) {
    const { prompt } = audioToTextDto;

    return await AudioToTextUseCase(this.openai, { audioFile, prompt });
  }

  async imageGeneration(imageGenerationDto: ImageGenerationDto) {
    return await imageGenerationUseCase(this.openai, { ...imageGenerationDto });
  }

  getImageGenerated(filename: string) {
    const filePath = path.resolve('./', './generated/images/', filename);
    const exists = fs.existsSync(filePath);

    if (!exists) throw new NotFoundException('File not found');
    console.log({ filePath });

    return filePath;
  }
}
