import * as fs from 'fs';
import OpenAI from 'openai';
import { downloadImageAsPng } from 'src/helpers';

interface Options {
  baseImage: string;
}

export const imageVariationUseCase = async (
  openai: OpenAI,
  options: Options,
) => {
  const { baseImage } = options;
  console.log(baseImage);

  const pngImagePath = await downloadImageAsPng(baseImage, true);

  const resp = await openai.images.createVariation({
    // model: 'dall-e-3',
    image: fs.createReadStream(pngImagePath),
    n: 1,
    size: '1024x1024',
    response_format: 'url',
  });

  if (!resp) throw new Error('no response from the request');
  if (!resp.data?.length) {
    throw new Error('DALL·E-2 did not return edited image');
  }

  const variationUrl = resp.data[0].url;

  if (!variationUrl) {
    throw new Error('Image URL is missing from OpenAI response');
  }

  // const fileName = await downloadImageAsPng(resp.data[0].url, false);
  const fileName = await downloadImageAsPng(variationUrl, false);
  const url = `${process.env.SERVER_URL}/gpt/image-generation/${fileName}`;

  return { url, fileName };
};
