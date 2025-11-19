import { Response } from 'express';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { GptService } from './gpt.service';
import {
  OrthograpyhDto,
  ProsConsDiscusserDto,
  TextToAudioDto,
  TranslateDto,
} from './dtos';

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
    // res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    // res.setHeader('Transfer-Encoding', 'chunked');

    const stream =
      await this.gptService.prosConsDiscusserStream(prosConsDiscusserDto);

    // res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    // res.setHeader('Connection', 'keep-alive');
    res.status(HttpStatus.OK);

    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        const piece = event.delta.toString() || '';
        console.log(piece);
        // res.write(`${event.delta}`);
        res.write(piece);
      }
    }
    // res.write('event: done\ndata: {}\n\n');
    res.end();
  }

  @Post('translate')
  translateText(@Body() translateDto: TranslateDto) {
    return this.gptService.translateText(translateDto);
  }

  @Post('text-to-audio')
  textToAudioHandeler(@Body() textToAudioDto: TextToAudioDto) {
    return this.gptService.textToAudio(textToAudioDto);
  }
}
