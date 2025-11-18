import { Injectable } from '@nestjs/common';

import OpenAI from 'openai';

import { OrthograpyhDto } from './dtos/orthography.dto';
import {
  orthographyUseCase,
  prosConsDiscusserStreamUseCase,
  prosConsDiscusserUseCase,
  translateTextUseCase,
} from './use-cases';
import { ProsConsDiscusserDto, TranslateDto } from './dtos';

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
}
