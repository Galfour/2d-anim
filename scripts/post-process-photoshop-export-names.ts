import * as fs from "fs" ;

// get path of folder to process from command line

const path = process.argv[2] ;
console.log(path) ;

// check if path exists
if (!fs.existsSync(path)) {
  console.error(`Path ${path} does not exist`) ;
  process.exit(1) ;
}

const files = fs.readdirSync(path) ;

for (const file of files) {
  if (file.endsWith(".png")) {
    let newName = file ;
    newName = newName.replace(/-/g, "") ;
    newName = newName.replace(/.png.png/g, ".png") ;
    newName = newName.replace(/_\d+_/g, " ") ;
    newName = newName.toLowerCase() ;
    fs.renameSync(path + "/" + file, path + "/" + newName) ;
    console.log(`Renamed ${file} to ${newName}`) ;
  }
}

console.log("Done") ;