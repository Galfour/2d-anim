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
import { getAverageColorPixelPosition } from "./tools";


async function rotateImage(angle : number , inputPath : string , outputPath : string = inputPath) {
  const image = sharp(inputPath).rotate(angle , { background : { r : 0 , g : 0 , b : 0 , alpha : 0 } }) ;
  if (outputPath !== inputPath) {
    await image.toFile(outputPath) ;
  } else {
    await image.toFile(inputPath + 'rotated') ;
    fs.renameSync(inputPath + 'rotated', inputPath) ;
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
    const spriteImg = sharp(`${path}/${file}`) ;
    const guideImg = sharp(`${path}/${guideFile}`) ;

    const start = await getAverageColorPixelPosition(guideImg, "FF0000") ;
    const end = await getAverageColorPixelPosition(guideImg, "0000FF") ;
    if (!start) {
      console.log(`No start found for ${file}`) ;
      continue ;
    }
    if (!end) {
      console.log(`No end found for ${file}`) ;
      continue ;
    }
    const rotation = ~~(Math.atan2(-(end.y - start.y), end.x - start.x) * 180 / Math.PI) ; // the sign is reversed because the y-axis is inverted
    await rotateImage(rotation, `${path}/${file}`) ;
    await rotateImage(rotation, `${path}/${guideFile}`) ;
  }
  console.log("Done") ;
} ;


main() ;