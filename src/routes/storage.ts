import { get, set , del } from 'idb-keyval' ;
import type { SkeletonAnimationFrameData } from '../lib/skeleton';

const ANIMATION_FRAMES_KEY = 'animationFrames' ;
const ANIMATION_FRAME_KEY_PREFIX = 'animationFrame:' ;

export const getAllAnimationFrames = async () : Promise<Array<string>> => {
  const framesRaw = await get(ANIMATION_FRAMES_KEY) ;
  const frames = framesRaw ? JSON.parse(framesRaw) : [] ;
  return frames ;
} ;

export const getAnimationFrame = async (frameName : string) : Promise<SkeletonAnimationFrameData | undefined> => {
  const frameRaw = await get(`${ANIMATION_FRAME_KEY_PREFIX}${frameName}`) ;
  const frame = frameRaw ? JSON.parse(frameRaw) : undefined ;
  return frame ;
} ;

export const saveAnimationFrame = async (frameName : string , frame : SkeletonAnimationFrameData) => {
  await set(`${ANIMATION_FRAME_KEY_PREFIX}${frameName}` , JSON.stringify(frame)) ;
  const allNames = await getAllAnimationFrames() ;
  const allNamesSet = new Set(allNames) ;
  allNamesSet.add(frameName) ;
  await set(ANIMATION_FRAMES_KEY , JSON.stringify(Array.from(allNamesSet))) ;
} ;

export const removeAnimationFrame = async (frameName : string) => {
  await del(`${ANIMATION_FRAME_KEY_PREFIX}${frameName}`) ;
  const allNames = await getAllAnimationFrames() ;
  const allNamesSet = new Set(allNames) ;
  allNamesSet.delete(frameName) ;
  await set(ANIMATION_FRAMES_KEY , JSON.stringify(Array.from(allNamesSet))) ;
} ;