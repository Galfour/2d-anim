import * as fs from "fs" ;

// get path of folder to process from command line

const path = process.argv[2] ;
console.log(path) ;

// check if path exists
if (!fs.existsSync(path)) {
  console.error(`Path ${path} does not exist`) ;
  process.exit(1) ;
}

import sharp from 'sharp';

type BoundingBox = {
  x : number ;
  y : number ;
  width : number ;
  height : number ;
} ;

async function getNonTransparentBoundingBox(imagePath : string) : Promise<BoundingBox | null> {
  const image = sharp(imagePath);
  const { width, height } = await image.metadata();
  const { data } = await image.raw().toBuffer({ resolveWithObject: true });

  let minX = width, minY = height, maxX = -1, maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4; // RGBA
      const alpha = data[i + 3];

      if (alpha !== 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX === -1) {
    return null; // Entire image is transparent
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

function getCombinedBoundingBox(box1 : BoundingBox, box2 : BoundingBox) : BoundingBox {
  const minX = Math.min(box1.x, box2.x);
  const minY = Math.min(box1.y, box2.y);

  const maxX = Math.max(box1.x + box1.width, box2.x + box2.width);
  const maxY = Math.max(box1.y + box1.height, box2.y + box2.height);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

async function cropImageToBoundingBox(boundingBox : BoundingBox, inputPath : string, outputPath : string = inputPath) {

  const image = sharp(inputPath)
    .extract({
      left: boundingBox.x,
      top: boundingBox.y,
      width: boundingBox.width,
      height: boundingBox.height
    }) ;

  if (outputPath !== inputPath) {
    await image.toFile(outputPath);
  } else {
    await image.toFile(inputPath + 'cropped') ;
    fs.renameSync(inputPath + 'cropped', inputPath) ;
  }

  return image ;
}

const files = fs.readdirSync(path) ;


const main = async () => {  
  for (const file of files) {
    if (!file.endsWith(".png") || file.endsWith("guide.png")) continue ;
    const guideFile = file.replace(".png", "guide.png") ;
    if (!fs.existsSync(path + "/" + guideFile)) continue ;
    console.log(`Processing ${file}`) ;
    const spriteBoundingBox = await getNonTransparentBoundingBox(`${path}/${file}`) ;
    const guideBoundingBox = await getNonTransparentBoundingBox(`${path}/${guideFile}`) ;
    const boundingBox = getCombinedBoundingBox(spriteBoundingBox, guideBoundingBox) ;
    console.log(boundingBox) ;
    await cropImageToBoundingBox(boundingBox, `${path}/${file}`) ;
    await cropImageToBoundingBox(boundingBox, `${path}/${guideFile}`) ;
  }
  console.log("Done") ;
} ;


main() ;