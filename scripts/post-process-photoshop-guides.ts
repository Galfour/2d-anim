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


async function getPixelSummary(sharpImage : sharp.Sharp) : Promise<Record<string, number>> {
  const { width, height } = await sharpImage.metadata();
  const { data } = await sharpImage.raw().toBuffer({ resolveWithObject: true });

  const summary : Record<string, number> = {} ;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3; // RGB (no alpha)
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const key = `${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}` ;
      summary[key] = (summary[key] || 0) + 1 ;
    }
  }
  return summary ;
}


const files = fs.readdirSync(path) ;

type Guide = {
  anchor : {
    x : number ;
    y : number ;
  } ;
  length : number ;
  imgWidth : number ;
  imgHeight : number ;
} ;

const allGuides : Record<string, Guide> = {} ;

const main = async () => {  
  for (const file of files) {
    if (!file.endsWith(".png") || file.endsWith("guide.png")) continue ;
    const guideFile = file.replace(".png", "guide.png") ;
    if (!fs.existsSync(path + "/" + guideFile)) continue ;
    console.log(`Processing ${file} & ${guideFile}`) ;
    const guideImg = sharp(`${path}/${guideFile}`) ;
    const start = await getAverageColorPixelPosition(guideImg, "FF0000") ;
    const end = await getAverageColorPixelPosition(guideImg, "0000FF") ;
    if (!start) {
      console.log(`No start found for ${file}`) ;
      const summary = await getPixelSummary(guideImg) ;
      console.log(summary) ;
      continue ;
    }
    if (!end) {
      console.log(`No end found for ${file}`) ;
      const summary = await getPixelSummary(guideImg) ;
      console.log(summary) ;
      continue ;
    }
    const length = Math.sqrt((start.x - end.x) ** 2 + (start.y - end.y) ** 2) ;
    const rotation = Math.atan2(-(end.y - start.y), end.x - start.x) ; // the sign is reversed because the y-axis is inverted
    if (Math.abs(rotation) > 0.02) {
      console.log(`Unacceptable rotation ${rotation} for ${file}`) ;
      continue ;
    }
    const metadata = await guideImg.metadata() ;
    const guide : Guide = {
      anchor : {
        x : parseFloat(start.x.toFixed(2)),
        y : parseFloat(start.y.toFixed(2))
      },
      length : parseFloat(length.toFixed(2)),
      imgWidth : metadata.width,
      imgHeight : metadata.height
    } ;
    console.log(guide) ;
    fs.writeFileSync(`${path}/${file.replace(".png", "guide.json")}`, JSON.stringify(guide, null, 2)) ;
    allGuides[file.replace(".png", "")] = guide ;
  }
  fs.writeFileSync(`${path}/all-guides.json`, JSON.stringify(allGuides, null, 2)) ;
  console.log("Done") ;
} ;


main() ;