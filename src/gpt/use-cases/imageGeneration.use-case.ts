import OpenAI from 'openai';
import { downloadBase64ImageFromOpenAi } from 'src/helpers';

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
      tools: [{ type: 'image_generation' }],
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

    const newImage = await downloadBase64ImageFromOpenAi(base64Image);

    return {
      url: newImage,
    };
  }

  const resp = await openai.responses.create({
    model: 'gpt-4.1-mini',
    input: prompt,
    tools: [{ type: 'image_generation' }],
  });

  return resp;
};
