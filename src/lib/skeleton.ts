import { AngleAdd, AngleRadians, AngleSub, AngleToRadians, AngleZero, type Angle } from "./angle" ;


export type Position = {
  x : number ,
  y : number ,
} ;

export type Space = {
  origin : Position ,
  angle : Angle ,
}

export const PositionAdd = (a : Position , b : Position) : Position => {
  return {
    x : a.x + b.x ,
    y : a.y + b.y ,
  } ;
} ;

export const PositionSub = (a : Position , b : Position) : Position => {
  return {
    x : a.x - b.x ,
    y : a.y - b.y ,
  } ;
} ;

export const PositionRotate = (a : Position , origin : Position , theta : Angle) : Position => {
  const dx = a.x - origin.x;
  const dy = a.y - origin.y;
  const cosTheta = Math.cos(AngleToRadians(theta));
  const sinTheta = Math.sin(AngleToRadians(theta));
  const rx = dx * cosTheta - dy * sinTheta;
  const ry = dx * sinTheta + dy * cosTheta;
  return {
    x: rx + origin.x,
    y: ry + origin.y,
  };
} ;

export const fromPolar = (r : number , theta : Angle) : Position => {
  return {
    x : r * Math.cos(AngleToRadians(theta)) ,
    y : r * Math.sin(AngleToRadians(theta)) ,
  } ;
} ;

export type JointProperties = {
  anchor : Position ,
  angle : Angle ,
  length : number ,
}

export const JointProperties = (anchor : Position , length : number , angle : Angle) => {
  return {
    anchor ,
    length ,
    angle ,
  } ;
} ;

export type JoinConstructor = JointProperties & {
  name : string ,
  children : Array<JoinConstructor> ,
} ;

export const JoinConstructor = (name : string , anchor : Position , length : number , angle : Angle , children : Array<JoinConstructor> = []) : JoinConstructor => {
  return {
    name ,
    anchor ,
    length ,
    angle ,
    children ,
  } ;
} ;

export type Joint = JointProperties & {
  name : string ,
  children : Array<string> ,
  parent? : string ,
} ;

export type RootProperties = {
  position : Position ,
} ;

export type Root = RootProperties & {
} ;

export const Root = (position : Position) => {
  return {
    position ,
  } ;
} ;

export type Skeleton = {
  root : Root ,
  joints : Record<string , Joint> ,
  layerOrder : Array<string> ,
} ;

export const getAllDescendants = (skeleton : Skeleton , jointName : string) : Array<string> => {
  const joint = skeleton.joints[jointName] ;
  if (joint === undefined) {
    throw new Error(`Joint ${jointName} not found`) ;
  }
  return [...joint.children , ...joint.children.flatMap(child => getAllDescendants(skeleton , child))] ;
}


export const Skeleton = (root : Root , jointConstructors : Array< JoinConstructor> , layerOrder : Array<string>) : Skeleton => {
  let jointConstructorStack : Array<{ jointConstructor : JoinConstructor , parent? : string }> = jointConstructors.map(jointConstructor => ({ jointConstructor , parent : undefined })) ;
  const jointConstructorsArray : Array<{ jointConstructor : JoinConstructor , parent? : string }> = [] ;
  while (jointConstructorStack.length > 0) {
    const { jointConstructor , parent } = jointConstructorStack.shift()! ;
    jointConstructorsArray.push({ jointConstructor , parent }) ;
    jointConstructorStack = [...jointConstructorStack , ...jointConstructor.children.map(child => ({ jointConstructor : child , parent : jointConstructor.name }))] ;
  }

  const joints : Record<string , Joint> = {} ;
  for (const { jointConstructor , parent } of jointConstructorsArray) {
    const name = jointConstructor.name ;
    if (joints[name] !== undefined) {
      throw new Error(`Duplicate joint name ${name}`) ;
    } ;
    if (parent !== undefined) {
      if (joints[parent] === undefined) {
        throw new Error(`Parent joint ${parent} not found`) ;
      }
      if (joints[parent].children.includes(name)) {
        throw new Error(`Child joint ${name} already exists`) ;
      }
      joints[parent].children.push(name) ;
    }
    joints[name] = {
      name ,
      children : [] ,
      parent ,
      anchor : { x : 0 , y : 0 } ,
      length : 0 ,
      angle : AngleZero() ,
    } ;
    jointConstructorStack = [...jointConstructorStack , ...jointConstructor.children.map(child => ({ jointConstructor : child , parent : name }))] ;
  }
  const skeleton = {
    root ,
    joints ,
  } ;
  for (const jointName in skeleton.joints) {
    const constructor = jointConstructorsArray.find(jointConstructor => jointConstructor.jointConstructor.name === jointName)!.jointConstructor ;
    const joint = skeleton.joints[jointName]! ;
    const parent = joint.parent ;
    let space : Space ;
    if (parent === undefined) {
      space = { origin : root.position , angle : AngleZero() } ;
    } else {
      const parentJoint = skeleton.joints[parent]! ;
      space = {
        angle : parentJoint.angle ,
        origin : PositionAdd(
          parentJoint.anchor ,
          fromPolar(parentJoint.length , parentJoint.angle) ,
        ) ,
      } ;
    }
    if (jointName === 'head') {
      console.log('head' ,
        space.origin , space.angle , constructor.anchor ,
        PositionRotate(constructor.anchor , { x : 0 , y : 0 } , space.angle) ,
      ) ;
    }
    const anchor = PositionAdd(
      space.origin ,
      PositionRotate(constructor.anchor , { x : 0 , y : 0 } , space.angle) ,
    ) ;
    const angle = AngleAdd(space.angle , constructor.angle) ;
    const length = constructor.length ;
    skeleton.joints[jointName] = {
      ...joint , anchor , angle , length ,
    } ;
  }

  // check that layerOrder contains exactly all the joint names
  if (layerOrder.length !== Object.keys(skeleton.joints).length) {
    throw new Error(`layerOrder length ${layerOrder.length} does not match number of joints ${Object.keys(skeleton.joints).length}`) ;
  }
  for (const jointName of Object.keys(skeleton.joints)) {
    if (!layerOrder.includes(jointName)) {
      throw new Error(`Joint ${jointName} not found in layerOrder`) ;
    }
  }

  return {
    ...skeleton ,
    layerOrder ,
  } ;
} ;

export type Transform =
| { type : 'translate' , delta : Position }
| { type : 'rotate' , origin : Position , delta : Angle }

export const applySingleJointTransform = (skeleton : Skeleton , jointName : string , transform : Transform) : void => {
  const joint = skeleton.joints[jointName] ;
  if (joint === undefined) {
    throw new Error(`Joint ${jointName} not found`) ;
  }
  switch (transform.type) {
    case 'translate':
      joint.anchor = PositionAdd(joint.anchor , transform.delta) ;
      break ;
    case 'rotate':
      const start = joint.anchor ;
      const target = PositionAdd(start , fromPolar(joint.length , joint.angle)) ;
      const newStart = PositionRotate(start , transform.origin , transform.delta) ;
      const newTarget = PositionRotate(target , transform.origin , transform.delta) ;
      const delta = PositionSub(newTarget , newStart) ;
      joint.anchor = newStart ;
      joint.angle = AngleRadians(Math.atan2(delta.y , delta.x)) ;
      break ;
    default:
      throw new Error(`Unknown transform type ${transform}`) ;
  }
}

export type JointControl = Partial<JointProperties> ;
export const applyJointControl = (skeleton : Skeleton , jointName : string , control : JointControl) : void => {
  const joint = skeleton.joints[jointName] ;
  if (joint === undefined) {
    throw new Error(`Joint ${jointName} not found`) ;
  }
  const { anchor , angle , length } = control ;
  if (anchor !== undefined) {
    const delta = PositionSub(anchor , joint.anchor) ;
    joint.anchor = anchor ;
    for (const child of getAllDescendants(skeleton , jointName)) {
      applySingleJointTransform(skeleton , child , { type : 'translate' , delta }) ;
    }
  }
  if (length !== undefined) {
    const previousTarget = PositionAdd(joint.anchor , fromPolar(joint.length , joint.angle)) ;
    const newTarget = PositionAdd(joint.anchor , fromPolar(length , joint.angle)) ;
    const delta = PositionSub(newTarget , previousTarget) ;
    joint.length = length ;
    for (const child of getAllDescendants(skeleton , jointName)) {
      applySingleJointTransform(skeleton , child , { type : 'translate' , delta }) ;
    }
  }
  if (angle !== undefined) {
    const delta = AngleSub(angle , joint.angle) ;
    joint.angle = angle ;
    for (const child of getAllDescendants(skeleton , jointName)) {
      applySingleJointTransform(skeleton , child , { type : 'rotate' , origin : joint.anchor , delta }) ;
    }
  }
} ;


export type RootControl = Partial<RootProperties> ;
export const applyRootControl = (root : Root , control : RootControl) => {
  return {
    ...root ,
    ...control ,
  } ;
} ;
export const applyRootControlState = (skeleton : Skeleton , control : RootControl) : void => {
  const root = skeleton.root ;
  const { position } = control ;
  if (position !== undefined) {
    const delta = PositionSub(position , root.position) ;
    root.position = position ;
    for (const jointName in skeleton.joints) {
      applySingleJointTransform(skeleton , jointName , { type : 'translate' , delta }) ;
    }
  } ;
} ;

export type SkeletonControl = {
  root? : RootControl ,
  joints? : Record<string , JointControl> ,
} ;

export const SkeletonControl = (root : RootControl , joints : Record<string , JointControl> ): SkeletonControl => {
  return {
    root ,
    joints ,
  } ;
} ;

export const applySkeletonControlState = (skeleton : Skeleton , control : SkeletonControl) : void => {
  if (control.root !== undefined) applyRootControlState(skeleton , control.root) ;
  if (control.joints !== undefined) {
    for (const [name , jointControl] of Object.entries(control.joints)) {
      applyJointControl(skeleton , name , jointControl) ;
    }
  }
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
  animation: SkeletonAnimation,
  onRootControl: (updated: RootControl) => void,
  onJointControl: (name: string, updated: JointControl) => void,
) => {
  const { frameData, frameRate } = animation ;
  const frameDuration = 1000 / frameRate ;
  const totalDuration = frameDuration * (frameData.length - 1);
  const startTime = performance.now();
  let previousFrameIndex = -1 ;

  const applyFrameData = (frameIndex : number) => {
    const frameData = animation.frameData[frameIndex] ;
    if (frameData.control.root !== undefined) onRootControl(frameData.control.root) ;
    if (frameData.control.joints !== undefined) {
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



export type Guide = {
  anchor : Position ,
  length : number ,
  imgWidth : number ,
  imgHeight : number ,
} ;
