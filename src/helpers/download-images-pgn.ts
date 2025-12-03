import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';

import { InternalServerErrorException } from '@nestjs/common';

export const downloadImageAsPng = async (
  url: string,
  fullPath: boolean = false,
) => {
  const response = await fetch(url);

  if (!response.ok)
    throw new InternalServerErrorException('Download image was not possible');

  const folderPath = path.resolve('./', './generated/images');
  fs.mkdirSync(folderPath, { recursive: true });

  const imageNamePng = `${new Date().getTime()}.png`;
  const buffer = Buffer.from(await response.arrayBuffer());

  const completePath = path.join(folderPath, imageNamePng);

  await sharp(buffer).png().ensureAlpha().toFile(completePath);

  return fullPath ? completePath : imageNamePng;
};

export const downloadBase64ImageFromOpenAi = async (
  base64Image: string,
  fullPath: boolean = false,
) => {
  if (!base64Image || base64Image.length === 0) {
    throw new Error('Empty base64 image');
  }

  const pureBase64 = base64Image.includes(';base64,')
    ? base64Image.split(';base64,').pop()!
    : base64Image;

  const imageBuffer = Buffer.from(pureBase64, 'base64');

  const folderPath = path.resolve('./', './generated/images/');
  fs.mkdirSync(folderPath, { recursive: true });

  const imageNamePng = `${Date.now()}-64.png`;
  const completePath = path.join(folderPath, imageNamePng);

  await sharp(imageBuffer).png().ensureAlpha().toFile(completePath);

  return fullPath ? completePath : imageNamePng;
};

export const downloadBase64ImageAsPng = async (
  base64Image: string,
  fullPath: boolean = false,
) => {
  // Remover encabezado
  base64Image = base64Image.split(';base64,').pop()!;
  const imageBuffer = Buffer.from(base64Image, 'base64');

  const folderPath = path.resolve('./', './generated/images/');
  fs.mkdirSync(folderPath, { recursive: true });

  const imageNamePng = `${new Date().getTime()}-64.png`;
  const completePath = path.join(folderPath, imageNamePng);

  // Transformar a RGBA, png // Así lo espera OpenAI
  await sharp(imageBuffer).png().ensureAlpha().toFile(completePath);

  return fullPath ? completePath : imageNamePng;
};

export const convertCanvasMaskToDalleMask = async (
  base64Image: string,
  fullPath: boolean = false,
) => {
  // Remove header
  const raw = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(raw, 'base64');

  const folderPath = path.resolve('./', './generated/images/');
  fs.mkdirSync(folderPath, { recursive: true });

  const maskName = `${Date.now()}-mask.png`;
  const maskPath = path.join(folderPath, maskName);

  // Convert transparent mask → black/white
  // Transparent pixels → BLACK (editable)
  // Opaque pixels → WHITE (keep)
  await sharp(buffer)
    .ensureAlpha()
    .removeAlpha() // removes transparency
    .threshold(1) // convert to b/w mask
    .toFormat('png')
    .toFile(maskPath);

  return fullPath ? maskPath : maskName;
};
