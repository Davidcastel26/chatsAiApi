import * as path from 'path';
import * as fs from 'fs';
import OpenAI from 'openai';

interface Options {
  prompt: string;
  voice?: string;
}

export const textToAudioUseCase = async (
  openai: OpenAI,
  { prompt, voice }: Options,
) => {
  const voices = {
    alloy: 'alloy',
    ash: 'ash',
    ballad: 'ballad',
    coral: 'coral',
    echo: 'echo',
    sage: 'sage',
    shimmer: 'shimmer',
    verse: 'verse',
    marin: 'marin',
    cedar: 'cedar',
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const selectedVoice: string = voice ? voices[voice] : 'alloy';

  const folderPath = path.resolve(__dirname, '../../../generated/audios');
  const speechFile = path.resolve(`${folderPath}/${new Date().getTime()}.mp3`);

  fs.mkdirSync(folderPath, { recursive: true });

  const mp3 = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    input: prompt,
    voice: selectedVoice,
    response_format: 'mp3',
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  fs.writeFileSync(speechFile, buffer);

  return speechFile;
};
