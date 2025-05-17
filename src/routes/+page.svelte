<script lang=ts>
  import { writable, type Writable } from "svelte/store";

  import { Joint , Anchor , Skeleton , type JointProperties } from "./skeleton" ;
    import DebugJointSvg from "./DebugJointSvg.svelte";


  // Root is at the hips
  const skeleton = Skeleton(Anchor({x : 0 , y : 0} , [
    Joint('body' , { x : 0 , y : 0 } , 10 , -90 , [
      Joint('head' , { x : 1 , y : 0 } , 5 , 0) ,
      Joint('leftArm' , { x : 0 , y : 3 } , 5 , 135 , [
        Joint('leftForeArm' , { x : 0 , y : 0 } , 5 , -10 , [
          Joint('leftHand' , { x : -.5 , y : 0 } , 2 , -10) ,
        ]) ,
      ]) ,
      Joint('rightArm' , { x : -1.5 , y : -3 } , 6 , 155 , [
        Joint('rightForeArm' , { x : 0 , y : 0 } , 5 , -30 , [
          Joint('rightHand' , { x : -.5 , y : 0 } , 2 , -15) ,
        ]) ,
      ]) ,
    ]) ,
    Joint('leftLeg' , { x : 2 , y : -1 } , 8 , 80 , [
      Joint('leftForeLeg' , { x : 0 , y : 0 } , 7 , 10 , [
        Joint('leftFoot' , { x : 0 , y : 0 } , 3.5 , -80) ,
      ]) ,
    ]) ,
    Joint('rightLeg' , { x : -2 , y : 1 } , 8 , 90 , [
      Joint('rightForeLeg' , { x : 0 , y : 0 } , 7 , 10 , [
        Joint('rightFoot' , { x : 0 , y : 0 } , 3.5 , -90) ,
      ]) ,
    ]) ,
  ])) ;

  const concatRecords = <T>(arr : Array<Record<string , T>>) : Record<string , T> => {
    const result : Record<string , T> = {} ;
    for (const map of arr) {
      for (const [key , value] of Object.entries(map)) {
        result[key] = value ;
      }
    }
    return result ;
  } ;

  // this leaks memory by auto-subscribing
  const editableJointStores = (x : Joint) : Record<string , Writable<JointProperties>> => {
    const selfStore = writable<JointProperties>({
      start : x.start ,
      angle : x.angle ,
      length : x.length ,
    }) ;
    selfStore.subscribe((newState) => {
      x.angle = newState.angle ;
      x.length = newState.length ;
      x.start = newState.start ;
    }) ;


    const childrenStores = x.children.map(editableJointStores) ;
    const storeMap : Record<string , Writable<JointProperties>> = {
      [x.name] : selfStore ,
      ...concatRecords(childrenStores) ,
    } ;

    return storeMap ;
  } ;

  const skeletonStores = skeleton.anchor.children.map(editableJointStores) ;
</script>

<svg width="800" height="800" viewBox="0 0 100 100" fill="red">
	<rect width="100" height="100" rx="25" fill="gray"/>

  <g transform="translate(50 50) scale(2)">
    {#each skeleton.anchor.children as joint , index}
      <DebugJointSvg joint={joint} path={[index]}/>
    {/each}
  </g>

</svg>
<!-- 
<div style="display : flex; flex-direction : column; gap : 20px">
  <div style="display : flex; flex-direction : row; gap : 20px">
    <div>Left Fore Leg</div>
    <div>
      <div>Angle</div>
      <input type="range" bind:value={leftForeLeg.angle} min="-90" max="90" step="0.1"/>
      <div>{leftForeLeg.angle}</div>
    </div>


  </div>

</div> -->