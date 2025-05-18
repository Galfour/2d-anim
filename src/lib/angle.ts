export type Angle =
| { type : 'degrees' , value : number }
| { type : 'radians' , value : number }

export const AngleDegrees = (value : number) : Angle => {
  return { type : 'degrees' , value } ;
} ;

export const AngleRadians = (value : number) : Angle => {
  return { type : 'radians' , value } ;
} ;

export const AngleToRadians = (angle : Angle) : number => {
  return angle.type === 'degrees' ? angle.value * (Math.PI / 180) : angle.value ;
} ;

export const AngleToDegrees = (angle : Angle) : number => {
  return angle.type === 'radians' ? angle.value * (180 / Math.PI) : angle.value ;
} ;

export const AngleAdd = (a : Angle , b : Angle) : Angle => {
  return { type : 'degrees' , value : AngleToDegrees(a) + AngleToDegrees(b) } ;
} ;

export const AngleSub = (a : Angle , b : Angle) : Angle => {
  return { type : 'degrees' , value : AngleToDegrees(a) - AngleToDegrees(b) } ;
} ;

export const AngleZero = () : Angle => {
  return { type : 'degrees' , value : 0 } ;
} ;