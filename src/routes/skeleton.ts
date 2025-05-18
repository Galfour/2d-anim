type Position = {
  x : number ,
  y : number ,
} ;

type JointProperties = {
  start : Position ,
  angle : number ,
  length : number ,
}

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

type Anchor = {
  position : Position ,
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
  type JointProperties ,
  Anchor ,
  Skeleton ,
  getAllJoints ,
  getAllDescendants ,
  type Guide ,
} ;