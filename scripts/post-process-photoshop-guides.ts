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

async function getAverageColorPixelPosition(imagePath : string, color : string) {
  const targetR = parseInt(color.slice(0 , 2), 16) ;
  const targetG = parseInt(color.slice(2 , 4), 16) ;
  const targetB = parseInt(color.slice(4 , 6), 16) ;

  const image = sharp(imagePath);
  const { width, height } = await image.metadata();
  const { data } = await image.raw().toBuffer({ resolveWithObject: true });

  let totalX = 0;
  let totalY = 0;
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3; // RGB (no alpha)
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


const files = fs.readdirSync(path) ;

type Guide = {
  start : {
    x : number ;
    y : number ;
  } ;
  end : {
    x : number ;
    y : number ;
  } ;
  length : number ;
  rotation : number ;
} ;

const allGuides : Record<string, Guide> = {} ;

const main = async () => {  
  for (const file of files) {
    if (!file.endsWith(".png") || file.endsWith("guide.png")) continue ;
    const guideFile = file.replace(".png", "guide.png") ;
    if (!fs.existsSync(path + "/" + guideFile)) continue ;
    console.log(`Processing ${file}`) ;
    const start = await getAverageColorPixelPosition(`${path}/${guideFile}`, "FF0000") ;
    const end = await getAverageColorPixelPosition(`${path}/${guideFile}`, "0000FF") ;
    if (!start || !end) {
      console.log(`No start or end found for ${file}`) ;
      continue ;
    }
    const length = ~~(Math.sqrt((start.x - end.x) ** 2 + (start.y - end.y) ** 2)) ;
    const rotation = ~~(Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI) ;
    const guide : Guide = {
      start : {
        x : ~~start.x,
        y : ~~start.y
      },
      end : {
        x : ~~end.x,
        y : ~~end.y
      },
      length : length,
      rotation : rotation
    } ;
    console.log(guide) ;
    fs.writeFileSync(`${path}/${file.replace(".png", "guide.json")}`, JSON.stringify(guide, null, 2)) ;
    allGuides[file.replace(".png", "")] = guide ;
  }
  fs.writeFileSync(`${path}/all-guides.json`, JSON.stringify(allGuides, null, 2)) ;
  console.log("Done") ;
} ;


main() ;