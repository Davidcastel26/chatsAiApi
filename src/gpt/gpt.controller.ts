import { Body, Controller, Post } from '@nestjs/common';
import { GptService } from './gpt.service';
import { OrthograpyhDto } from './dtos';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('orthography-check')
  orthographyCheck(@Body() orthograpyhDto: OrthograpyhDto) {
    return this.gptService.orthographyCheck(orthograpyhDto);
  }
}
