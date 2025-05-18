import { AngleToDegrees, type Angle } from "./angle";
import type { Position, SkeletonAnimationFrameData } from "./skeleton";

export const lerp = (a : number , b : number , t : number) => {
  return a + (b - a) * t ;
} ;

export const lerpPosition = (a : Position , b : Position , t : number) : Position => {
  return {
    x : lerp(a.x , b.x , t) ,
    y : lerp(a.y , b.y , t) ,
  } ;
} ;

export const lerpAngle = (a : Angle , b : Angle , t : number) : Angle => {
  if (a.type === 'radians' && b.type === 'radians') {
    return {
      type : 'radians' ,
      value : lerp(a.value , b.value , t) ,
    } ;
  }
  return {
    type : 'degrees' ,
    value : lerp(AngleToDegrees(a) , AngleToDegrees(b) , t) ,
  } ;
} ;

export const lerpAnimationFrame = (a : SkeletonAnimationFrameData , b : SkeletonAnimationFrameData , t : number) : SkeletonAnimationFrameData => {
  const result : SkeletonAnimationFrameData = {
    control : {
      root : undefined ,
      joints : undefined ,
    } ,
  } ;

  // Check that they are both dealing similarly with root and joints
  if (!!a.control.root !== !!b.control.root) {
    throw new Error("Root presence is not the same") ;
  }
  if (a.control.root && b.control.root) {
    if (!!a.control.root.position !== !!b.control.root.position) {
      throw new Error("Root position presence is not the same") ;
    }
    result.control.root = {} ;
    if (a.control.root.position && b.control.root.position) {
      result.control.root.position = lerpPosition(a.control.root.position , b.control.root.position , t) ;
    }
  }
  
  if (!!a.control.joints !== !!b.control.joints) {
    throw new Error("Joints presence is not the same") ;
  }
  if (a.control.joints && b.control.joints) {
    result.control.joints = {} ;

    if (Object.keys(a.control.joints).length !== Object.keys(b.control.joints).length) {
      throw new Error("Joints length is not the same") ;
    }

    for (const keyA in a.control.joints) {
      result.control.joints[keyA] = {} ;
      const jointA = a.control.joints[keyA] ;
      const jointB = b.control.joints[keyA] ;
      if (!jointB) throw new Error("Joint keys are not the same") ;
      if (!!jointA.anchor !== !!jointB.anchor) {
        throw new Error("Joint anchor presence is not the same") ;
      }
      if (jointA.anchor && jointB.anchor) {
        result.control.joints[keyA].anchor = lerpPosition(jointA.anchor , jointB.anchor , t) ;
      }
      if (!!jointA.angle !== !!jointB.angle) {
        throw new Error("Joint angle presence is not the same") ;
      }
      if (jointA.angle && jointB.angle) {
        result.control.joints[keyA].angle = lerpAngle(jointA.angle , jointB.angle , t) ;
      }
      if (!!jointA.length !== !!jointB.length) {
        throw new Error("Joint length presence is not the same") ;
      }
      if (jointA.length && jointB.length) {
        result.control.joints[keyA].length = lerp(jointA.length , jointB.length , t) ;
      }
    }
  }

  return result ;
} ;
  
