import { Response } from 'express';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { GptService } from './gpt.service';
import { OrthograpyhDto, ProsConsDiscusserDto } from './dtos';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('orthography-check')
  orthographyCheck(@Body() orthograpyhDto: OrthograpyhDto) {
    return this.gptService.orthographyCheck(orthograpyhDto);
  }

  @Post('pros-cons-discusser')
  prosConsDiscusser(@Body() prosConsDiscusserDto: ProsConsDiscusserDto) {
    return this.gptService.prosConsDiscusser(prosConsDiscusserDto);
  }

  @Post('pros-cons-discusser-stream')
  async prosConsDiscusserStream(
    @Body() prosConsDiscusserDto: ProsConsDiscusserDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.status(HttpStatus.OK);

    const stream =
      await this.gptService.prosConsDiscusserStream(prosConsDiscusserDto);

    res.setHeader('Content-Type', 'application/json');
    res.status(HttpStatus.OK);

    for await (const chunk of stream) {
      const piece = chunk.choices[0].delta.content || '';
      // console.log(piece);
      res.write(piece);
    }

    res.end();
  }
}
