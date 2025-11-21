import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';

import { InternalServerErrorException } from '@nestjs/common';

// const sharp = require('sharp');

export const downloadImageAsPng = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok)
    throw new InternalServerErrorException('Download image was not possible');

  const folderPath = path.resolve('./', './generated/images');
  fs.mkdirSync(folderPath, { recursive: true });

  const imageNamePng = `${new Date().getTime()}.png`;
  const buffer = Buffer.from(await response.arrayBuffer());

  //   fs.writeFileSync(`${folderPath}/${imageNamePng}`, buffer);
  const completePath = path.join(folderPath, imageNamePng);

  //   await sharp(buffer).png().ensureAlpha().toFile(completePath);
  await sharp(buffer).png().ensureAlpha().toFile(completePath);

  return completePath;
};

export const downloadBase64ImageFromOpenAi = async (base64Image: string) => {
  if (!base64Image || base64Image.length === 0) {
    throw new Error('Empty base64 image');
  }

  // Si viniera con encabezado tipo "data:image/png;base64,..."
  const pureBase64 = base64Image.includes(';base64,')
    ? base64Image.split(';base64,').pop()!
    : base64Image;

  const imageBuffer = Buffer.from(pureBase64, 'base64');

  const folderPath = path.resolve('./', './generated/images/');
  fs.mkdirSync(folderPath, { recursive: true });

  const imageNamePng = `${Date.now()}-64.png`;

  await sharp(imageBuffer)
    .png()
    .ensureAlpha()
    .toFile(path.join(folderPath, imageNamePng));

  return path.join(folderPath, imageNamePng);
};

export const downloadBase64ImageAsPng = async (base64Image: string) => {
  // Remover encabezado
  base64Image = base64Image.split(';base64,').pop()!;
  //   const imageBuffer = Buffer.from(base64Image, 'base64');
  const imageBuffer = Buffer.from(base64Image, 'base64');

  const folderPath = path.resolve('./', './generated/images/');
  fs.mkdirSync(folderPath, { recursive: true });

  const imageNamePng = `${new Date().getTime()}-64.png`;

  // Transformar a RGBA, png // Así lo espera OpenAI
  await sharp(imageBuffer)
    .png()
    .ensureAlpha()
    .toFile(path.join(folderPath, imageNamePng));

  return path.join(folderPath, imageNamePng);
};
