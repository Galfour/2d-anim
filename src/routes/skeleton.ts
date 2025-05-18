type Position = {
  x : number ,
  y : number ,
} ;

export type JointProperties = {
  start : Position ,
  angle : number ,
  length : number ,
}

export const JointProperties = (start : Position , length : number , angle : number) => {
  return {
    start ,
    length ,
    angle ,
  } ;
} ;

type Joint = JointProperties & {
  name : string ,
  preChildren : Array<Joint> ,
  postChildren : Array<Joint> ,
} ;

const Joint = (name : string , start : Position , length : number , angle : number , preChildren : Array<Joint> = [] , postChildren : Array<Joint> = []) => {
  return {
    name ,
    start ,
    length ,
    angle ,
    preChildren ,
    postChildren ,
  } ;
} ;

type AnchorProperties = {
  position : Position ,
} ;

type Anchor = AnchorProperties & {
  children : Array<Joint> ,
} ;

const Anchor = (position : Position , children : Array<Joint> = []) => {
  return {
    position ,
    children ,
  } ;
} ;

type Skeleton = {
  anchor : Anchor ,
} ;

const Skeleton = (anchor : Anchor) => {
  return {
    anchor ,
  } ;
} ;

const getAllDescendants = (joint : Joint) : Array<Joint> => {
  return [joint , ...joint.preChildren.flatMap(getAllDescendants) , ...joint.postChildren.flatMap(getAllDescendants)] ;
} ;

const getAllJoints = (skeleton : Skeleton) : Array<Joint> => {
  return skeleton.anchor.children.flatMap(getAllDescendants) ;
} ;

type JointControl = Partial<JointProperties> ;
const applyJointControl = (joint : Joint , control : JointControl) => {
  return {
    ...joint ,
    ...control ,
  } ;
} ;
export const applyJointControlState = (joint : Joint , control : JointControl) : void => {
  const { start , angle , length } = control ;
  if (start !== undefined) joint.start = start ;
  if (angle !== undefined) joint.angle = angle ;
  if (length !== undefined) joint.length = length ;
} ;

type AnchorControl = Partial<AnchorProperties> ;
const applyAnchorControl = (anchor : Anchor , control : AnchorControl) => {
  return {
    ...anchor ,
    ...control ,
  } ;
} ;
export const applyAnchorControlState = (anchor : Anchor , control : AnchorControl) : void => {
  const { position } = control ;
  if (position !== undefined) anchor.position = position ;
} ;

export type SkeletonControl = {
  anchor? : AnchorControl ,
  joints? : Record<string , JointControl> ,
} ;

export const SkeletonControl = (anchor : AnchorControl , joints : Record<string , JointControl> ): SkeletonControl => {
  return {
    anchor ,
    joints ,
  } ;
} ;

export const applySkeletonControlState = (skeleton : Skeleton , control : SkeletonControl) : void => {
  if (control.anchor !== undefined) applyAnchorControlState(skeleton.anchor , control.anchor) ;
  if (control.joints !== undefined) {
    const map = SkeletonMap(skeleton) ;
    for (const [name , jointControl] of Object.entries(control.joints)) {
      applyJointControlState(map.joints[name] , jointControl) ;
    }
  }
} ;

type SkeletonMap = {
  anchor : Anchor ,
  joints : Record<string , Joint> ,
} ;

const concatRecords = <T>(arr : Array<Record<string , T>>) : Record<string , T> => {
  const result : Record<string , T> = {} ;
  for (const map of arr) {
    for (const [key , value] of Object.entries(map)) {
      if (result[key]) {
        throw new Error(`Duplicate key ${key}`) ;
      }
      result[key] = value ;
    }
  }
  return result ;
} ;

const SkeletonJointsMap = (joint : Joint) : SkeletonMap['joints'] => {
  const map : SkeletonMap['joints'] = {} ;
  map[joint.name] = joint ;
  const preMaps = joint.preChildren.map(SkeletonJointsMap) ;
  const postMaps = joint.postChildren.map(SkeletonJointsMap) ;
  return concatRecords([map , ...preMaps , ...postMaps]) ;
} ;

const SkeletonMap = (skeleton : Skeleton) : SkeletonMap => {
  return {
    anchor : skeleton.anchor ,
    joints : concatRecords(skeleton.anchor.children.map(SkeletonJointsMap)) ,
  } ;
} ;

export type SkeletonAnimationFrameData = {
  control : SkeletonControl ,
} ;

export const SkeletonAnimationFrameData = (control : SkeletonControl) : SkeletonAnimationFrameData => {
  return {
    control ,
  } ;
} ;

export type SkeletonAnimation = {
  frameData : Array<SkeletonAnimationFrameData> ,
  frameRate : number ,
} ;

export const runSkeletonAnimation = (
  skeleton: Skeleton,
  animation: SkeletonAnimation,
  onAnchorControl: (updated: AnchorControl) => void,
  onJointControl: (name: string, updated: JointControl) => void,
) => {
  const { frameData, frameRate } = animation ;
  const frameDuration = 1000 / frameRate ;
  const totalDuration = frameDuration * (frameData.length - 1);
  const startTime = performance.now();
  let previousFrameIndex = -1 ;

  const applyFrameData = (frameIndex : number) => {
    const frameData = animation.frameData[frameIndex] ;
    if (frameData.control.anchor !== undefined) onAnchorControl(frameData.control.anchor) ;
    if (frameData.control.joints !== undefined) {
      const map = SkeletonMap(skeleton) ;
      for (const [name , jointControl] of Object.entries(frameData.control.joints)) {
        onJointControl(name , jointControl) ;
      }
    }
    previousFrameIndex = frameIndex ;
  } ;

  const tick = (now: number) => {
    const elapsed = now - startTime;
    if (elapsed >= totalDuration) {
      if (previousFrameIndex === frameData.length - 1) return ;
      applyFrameData(frameData.length - 1) ;
      return;
    }

    const frameIndex = Math.floor(elapsed / frameDuration) ;
    applyFrameData(frameIndex) ;

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};



type Guide = {
  start : {
    x : number ;
    y : number ;
  } ;
  length : number ;
  imgWidth : number ;
  imgHeight : number ;
} ;

export {
  Joint ,
  Anchor ,
  Skeleton ,
  getAllJoints ,
  getAllDescendants ,
  type Guide ,
  type JointControl ,
  applyJointControl ,
  type AnchorControl ,
  applyAnchorControl ,
  SkeletonMap ,
} ;