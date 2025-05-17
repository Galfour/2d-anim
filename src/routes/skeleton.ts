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
  children : Array<Joint> ,
} ;

const Joint = (name : string , start : Position , length : number , angle : number , children : Array<Joint> = []) => {
  return {
    name ,
    start ,
    length ,
    angle ,
    children ,
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

export {
  Joint ,
  type JointProperties ,
  Anchor ,
  Skeleton ,
} ;