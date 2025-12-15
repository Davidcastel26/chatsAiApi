import * as fs from 'fs';

import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

import {
  // convertCanvasMaskToDalleMask,
  downloadBase64ImageFromOpenAi,
  // downloadImageAsPng,
  downloadImageAsPngForMaskProcess,
  saveMaskBase64ToPng,
} from 'src/helpers';

interface Options {
  prompt?: string;
  originalImage?: string;
  maskImage?: string;
}

export const imageGenerationUseCase = async (
  openai: OpenAI,
  options: Options,
) => {
  const { prompt, maskImage, originalImage } = options;

  if (!prompt) {
    throw new Error('Prompt is required to generate an image');
  }

  if (!maskImage || !originalImage) {
    const resp = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: prompt,
      tools: [{ type: 'image_generation', size: '1024x1024', quality: 'low' }],
    });

    if (!resp.output) {
      throw new Error('Image URL is missing from output OpenAI response');
    }

    const imageCalls = resp.output.filter(
      (output) => output.type === 'image_generation_call',
    );

    if (!imageCalls.length) {
      throw new Error('No image data returned from imageData');
    }

    const base64Image = imageCalls[0].result;

    if (!base64Image) {
      throw new Error('Image base64 result is missing');
    }

    const fileName = await downloadBase64ImageFromOpenAi(base64Image);
    const url = `${process.env.SERVER_URL}/gpt/image-generation/${fileName}`;

    return {
      url: url,
      id: resp.output[0].id,
      revised_prompt: resp.prompt,
      type: resp.output[0].type,
      tokens: resp.usage?.total_tokens,
    };
  }

  // const pngImagePath = await downloadImageAsPng(originalImage, true);
  const pngImagePath = await downloadImageAsPngForMaskProcess(
    originalImage,
    true,
  );
  const maskPath = await saveMaskBase64ToPng(maskImage, true);
  // const maskPath = await downloadBase64ImageAsPng(maskImage, true);
  console.log('-------');
  console.log('-------');
  console.log('-------');
  console.log({ pngImagePath, maskPath });
  console.log('-------');
  console.log('-------');
  console.log('-------');
  console.log('-------');

  const fileBuffer = fs.readFileSync(pngImagePath);
  console.log('-------');
  console.log('-------');
  console.log('-------');
  console.log('-------');
  console.log(fileBuffer.slice(0, 8));
  console.log('-------');
  console.log('-------');
  console.log('-------');
  console.log('-------');

  const imageBuffer = fs.readFileSync(pngImagePath);
  const maskBuffer = fs.readFileSync(maskPath);

  const resp = await openai.images.edit({
    model: 'dall-e-2',
    prompt,
    image: await toFile(imageBuffer, 'image.png', { type: 'image/png' }),
    mask: await toFile(maskBuffer, 'mask.png', { type: 'image/png' }),
    n: 1,
    size: '1024x1024',
    response_format: 'b64_json',
  });

  console.log({
    'THIS IS RESP': resp,
  });

  if (!resp.data?.length) {
    throw new Error('DALL·E-2 did not return edited image');
  }

  const editedBase64 = resp.data[0].b64_json;

  // Leemos original y mask como base64 también
  const originalBase64 = fs.readFileSync(pngImagePath, 'base64');
  const maskBase64 = fs.readFileSync(maskPath, 'base64');

  return {
    originalBase64,
    maskBase64,
    editedBase64,
  };
};
