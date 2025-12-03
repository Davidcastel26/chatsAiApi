import * as fs from 'fs';

import OpenAI from 'openai';
import {
  convertCanvasMaskToDalleMask,
  downloadBase64ImageFromOpenAi,
  downloadImageAsPng,
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
      tools: [{ type: 'image_generation', size: '1024x1024', quality: 'high' }],
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

  const pngImagePath = await downloadImageAsPng(originalImage, true);
  const maskPath = await convertCanvasMaskToDalleMask(maskImage, true);
  // const maskPath = await downloadBase64ImageAsPng(maskImage, true);
  console.log('-------');
  console.log('-------');
  console.log('-------');
  console.log({ pngImagePath, maskPath });
  console.log('-------');
  console.log('-------');
  console.log('-------');
  console.log('-------');

  const resp = await openai.images.edit({
    model: 'dall-e-2',
    prompt,
    image: fs.createReadStream(pngImagePath),
    mask: fs.createReadStream(maskPath),
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
