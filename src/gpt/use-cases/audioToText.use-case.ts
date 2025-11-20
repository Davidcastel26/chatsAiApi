import * as fs from 'fs';
import OpenAI from 'openai';

interface Options {
  prompt?: string;
  audioFile: Express.Multer.File;
}

export const AudioToTextUseCase = async (openai: OpenAI, options: Options) => {
  const { prompt, audioFile } = options;

  console.log({ prompt, audioFile });

  const response = await openai.audio.transcriptions.create({
    model: 'gpt-4o-mini-transcribe',
    file: fs.createReadStream(audioFile.path),
    prompt: prompt, //Same lang from the audio
    language: 'en',
    // response_format: 'text',
    response_format: 'json',
  });

  console.log(response);

  return response;
};
