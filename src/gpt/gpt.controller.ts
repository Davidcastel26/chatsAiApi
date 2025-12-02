import type { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { GptService } from './gpt.service';
import {
  AudioToTextDto,
  ImageGenerationDto,
  ImageVariationDto,
  OrthograpyhDto,
  ProsConsDiscusserDto,
  TextToAudioDto,
  TranslateDto,
} from './dtos';
import { diskStorage } from 'multer';

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
  async textToAudioHandeler(
    @Body() textToAudioDto: TextToAudioDto,
    @Res() res: Response,
  ) {
    const filePath = await this.gptService.textToAudio(textToAudioDto);

    res.setHeader('Content-Type', 'audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Get('text-to-audio/:fileId')
  textToAudioGetHandeler(
    @Res() res: Response,
    @Param('fileId') fileId: string,
  ) {
    const filePath = this.gptService.getTextToAudio(fileId);

    res.setHeader('Content-Type', 'audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Post('audio-to-text')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './generated/uploads',
        filename: (req, file, callback) => {
          const fileExtension = file.originalname.split('.').pop();
          const fileName = `${new Date().getTime()}.${fileExtension}`;

          return callback(null, fileName);
        },
      }),
    }),
  )
  audioToTextHandler(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1000 * 1024 * 5,
            message: 'File is bigger than 5mb',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() audioToTextDto: AudioToTextDto,
  ) {
    // console.log({ file: file });
    // console.log({ audioToTextDto });
    return this.gptService.audioToText(file, audioToTextDto);
  }

  @Post('image-generation')
  async imageGenerationHandler(@Body() imageGenerationDto: ImageGenerationDto) {
    return await this.gptService.imageGeneration(imageGenerationDto);
  }

  @Get('image-generation/:fileName')
  imageGetHandler(@Res() res: Response, @Param('fileName') fileName: string) {
    const filePath = this.gptService.getImageGenerated(fileName);

    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Post('image-variation/v1')
  async imageVariationHandler(@Body() imageVariationDto: ImageVariationDto) {
    return await this.gptService.imageVariation(imageVariationDto);
  }

  @Post('image-variation/v2')
  async imageVariationHQHandler(@Body() imageVariationDto: ImageVariationDto) {
    return await this.gptService.imageVariationHQ(imageVariationDto);
  }
}
