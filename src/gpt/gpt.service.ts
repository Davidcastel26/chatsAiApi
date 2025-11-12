import { Injectable } from '@nestjs/common';

import OpenAI from 'openai';

import { OrthograpyhDto } from './dtos/orthography.dto';
import { orthographyUseCase } from './use-cases';

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
}
