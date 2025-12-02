import * as fs from 'fs';
import OpenAI from 'openai';
import { downloadBase64ImageFromOpenAi, downloadImageAsPng } from 'src/helpers';

interface Options {
  baseImage: string;
}

export const imageVariationHQUseCase = async (
  openai: OpenAI,
  options: Options,
) => {
  const { baseImage } = options;

  const prompt: string = 'Create a new variant from this image';

  if (!baseImage) throw new Error('Base image URL is Required');

  const pngImagePath = await downloadImageAsPng(baseImage, true);
  const fileBuffer = fs.readFileSync(pngImagePath);
  const base64Image = fileBuffer.toString('base64');
  const dataUrl = `data:image/png;base64,${base64Image}`;

  const resp = await openai.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: prompt,
          },
          {
            type: 'input_image',
            image_url: dataUrl,
            detail: 'high',
          },
        ],
      },
    ],
    tools: [
      {
        type: 'image_generation',
      },
    ],
  });

  if (!resp.output) {
    throw new Error('Image output is missing from OpenAI response');
  }

  const imageCalls = resp.output.filter(
    (output) => output.type === 'image_generation_call',
  );

  if (!imageCalls.length) {
    throw new Error('No image data returned from imageData');
  }

  const newBase64Image = imageCalls[0].result;

  if (!newBase64Image) {
    throw new Error('Image base64 result is missing');
  }

  const fileName = await downloadBase64ImageFromOpenAi(newBase64Image);
  const url = `${process.env.SERVER_URL}/gpt/image-generation/${fileName}`;

  console.log('file name with the URL ---------', url);

  console.log(resp);

  return {
    url: url,
    id: resp.output[0].id,
    revised_prompt: resp.prompt,
    type: resp.output[0].type,
    tokens: resp.usage?.total_tokens,
  };
};
