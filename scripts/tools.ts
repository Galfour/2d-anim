import sharp from 'sharp';

export async function getAverageColorPixelPosition(sharpImage : sharp.Sharp, color : string) {
  const targetR = parseInt(color.slice(0 , 2), 16) ;
  const targetG = parseInt(color.slice(2 , 4), 16) ;
  const targetB = parseInt(color.slice(4 , 6), 16) ;

  const { width, height, channels } = await sharpImage.metadata();
  const { data } = await sharpImage.raw().toBuffer({ resolveWithObject: true });

  let totalX = 0;
  let totalY = 0;
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels; // RGB (no alpha)
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (r === targetR && g === targetG && b === targetB) {
        totalX += x;
        totalY += y;
        count++;
      }
    }
  }

  if (count === 0) {
    return null; // No full blue pixels
  }

  return {
    x: totalX / count,
    y: totalY / count
  };
}