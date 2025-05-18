<script lang=ts>
  import { writable, type Writable } from "svelte/store";

  import { type Joint , JointProperties, Skeleton , SkeletonAnimationFrameData, type Guide, SkeletonControl, applySkeletonControlState, Root, JoinConstructor } from "./skeleton" ;
  import DebugJointSvg from "./DebugJointSvg.svelte";
  import ShowJointSvg from "./ShowJointSvg.svelte";
  // import ShowJointCss from "./ShowJointCss.svelte" ;
  import guides_ from "./all-guides-2.json" ;
  import { untrack } from "svelte" ;

  import { AngleDegrees as deg } from "$lib/angle" ;

  const allGuides : Record<string , Guide> = guides_ ;

  // const skeletonDefaultPause = SkeletonAnimationFrameData(SkeletonControl(
  //   { position : { x : 0 , y : 0 } } ,
  //   {
  //     leftLeg : JointProperties({ x : 2 , y : -1 } , 8 , 80) ,
  //     leftForeLeg : JointProperties({ x : 0 , y : 0 } , 7 , 10) ,
  //     leftFoot : JointProperties({ x : 0 , y : 0 } , 3.5 , -80) ,
  //     body : JointProperties({ x : 0 , y : 0 } , 10 , -90) ,
  //     leftArm : JointProperties({ x : 0 , y : 3 } , 5 , 135) ,
  //     leftForeArm : JointProperties({ x : 0 , y : 0 } , 5 , -10) ,
  //     leftHand : JointProperties({ x : -.5 , y : 0 } , 2 , -10) ,
  //     head : JointProperties({ x : 1 , y : 0 } , 5 , 5) ,
  //     rightArm : JointProperties({ x : -1.5 , y : -3 } , 6 , 155) ,
  //     rightForeArm : JointProperties({ x : 0 , y : 0 } , 5 , -30) ,
  //     rightHand : JointProperties({ x : -.5 , y : 0 } , 2 , -15) ,
  //     rightLeg : JointProperties({ x : -2 , y : 1 } , 8 , 90) ,
  //     rightForeLeg : JointProperties({ x : 0 , y : 0 } , 7 , 10) ,
  //     rightFoot : JointProperties({ x : 0 , y : 0 } , 3.5 , -90) ,
  //   } ,
  // )) ;


  let bodyAngle = $state('0') ;
  let leftArmAngle = $state('0') ;
  let rightArmAngle = $state('0') ;
  let leftLegAngle = $state('0') ;
  let leftForeLegAngle = $state('0') ;

  // $effect(() => {
  //   leftArmAngle ;
  //   untrack(() => {
  //     applySkeletonControlState(skeleton , { joints : { leftArm : { angle : parseFloat(leftArmAngle) } } }) ;
  //     console.log(leftArmAngle) ;
  //   }) ;
  // }) ;

  // $effect(() => {
  //   bodyAngle ;
  //   untrack(() => {
  //     applySkeletonControlState(skeleton , { joints : { body : { angle : parseFloat(bodyAngle) } } }) ;
  //     console.log(bodyAngle) ;
  //   }) ;
  // }) ;

  // $effect(() => {
  //   rightArmAngle ;
  //   untrack(() => {
  //     applySkeletonControlState(skeleton , { joints : { rightArm : { angle : parseFloat(rightArmAngle) } } }) ;
  //     console.log(rightArmAngle) ;
  //   }) ;
  // }) ;

  // $effect(() => {
  //   leftLegAngle ;
  //   untrack(() => {
  //     applySkeletonControlState(skeleton , { joints : { leftLeg : { angle : parseFloat(leftLegAngle) } } }) ;
  //     console.log(leftLegAngle) ;
  //   }) ;
  // }) ;

  // $effect(() => {
  //   leftForeLegAngle ;
  //   untrack(() => {
  //     applySkeletonControlState(skeleton , { joints : { leftForeLeg : { angle : parseFloat(leftForeLegAngle) } } }) ;
  //     console.log(leftForeLegAngle) ;
  //   }) ;
  // }) ;

  // Root is at the hips
  const skeleton = $state(Skeleton(Root({x : 0 , y : 0}) , [
    JoinConstructor('leftLeg' , { x : 2 , y : -1 } , 8 , deg(80) , [
      JoinConstructor('leftForeLeg' , { x : 0 , y : 0 } , 7 , deg(10) , [
        JoinConstructor('leftFoot' , { x : 0 , y : 0 } , 3.5 , deg(-80)) ,
      ]) ,
    ]) ,
    JoinConstructor('body' , { x : 0 , y : 0 } , 10 , deg(-90) , [
      JoinConstructor('leftArm' , { x : 0 , y : 3 } , 5 , deg(135) , [
        JoinConstructor('leftForeArm' , { x : 0 , y : 0 } , 5 , deg(-10) , [
          JoinConstructor('leftHand' , { x : -.5 , y : 0 } , 2 , deg(-10)) ,
        ]) ,
      ]) ,
      JoinConstructor('head' , { x : 1 , y : 0 } , 5 , deg(5)) ,
      JoinConstructor('rightArm' , { x : -1.5 , y : -3 } , 6 , deg(155) , [
        JoinConstructor('rightForeArm' , { x : 0 , y : 0 } , 5 , deg(-30) , [
          JoinConstructor('rightHand' , { x : -.5 , y : 0 } , 2 , deg(-15)) ,
        ]) ,
      ]) ,
    ]) ,
    JoinConstructor('rightLeg' , { x : -2 , y : 1 } , 8 , deg(90) , [
      JoinConstructor('rightForeLeg' , { x : 0 , y : 0 } , 7 , deg(10) , [
        JoinConstructor('rightFoot' , { x : 0 , y : 0 } , 3.5 , deg(-90)) ,
      ]) ,
    ]) ,
  ] , [
    'leftArm' , 'leftForeArm' , 'leftHand' ,
    'leftForeLeg' , 'leftLeg' , 'leftFoot' ,
    'body' , 'head' ,
    'rightForeLeg' , 'rightLeg' , 'rightFoot' ,
    'rightArm' , 'rightForeArm' , 'rightHand' ,
  ])) ;

  // this leaks memory by auto-subscribing
  const editableJointStores = (x : Skeleton) : Record<string , Writable<JointProperties>> => {
    const storeMap : Record<string , Writable<JointProperties>> = {} ;

    for (const [name , joint] of Object.entries(x.joints)) {
      const store = writable<JointProperties>(joint) ;
      store.subscribe((newState) => {
        applySkeletonControlState(x , { joints : { [name] : newState } }) ;
      }) ;
      storeMap[name] = store ;
    }

    return storeMap ;
  } ;

  const skeletonStores = {
    joints : editableJointStores(skeleton) ,
  } ;

  const allImageUrlsArray = Object.keys(skeleton.joints).map(x => [x , `/character-dummy-2/${x.toLowerCase()}.png`] as const) ;
  const allImageUrls : Record<string , string> = Object.fromEntries(allImageUrlsArray) ;

</script>

<svg width="600" height="600" viewBox="0 0 100 100" fill="red">
	<rect width="100" height="100" rx="25" fill="#bbb"/>

  <g transform="translate(50 50) scale(2)">
    {#each Object.values(skeleton.joints) as joint , index}
      {@const rankRatio = index / Object.keys(skeleton.joints).length}
      <DebugJointSvg {joint} {rankRatio} showText={false}/>
    {/each}
  </g>
</svg>

<svg width="600" height="600" viewBox="0 0 100 100" fill="red">
	<rect width="100" height="100" rx="25" fill="#bbb"/>

  <g transform="translate(50 50) scale(2)">
    {#each skeleton.layerOrder as jointName}
      {@const joint = skeleton.joints[jointName]}
      <ShowJointSvg {joint} {allImageUrls} {allGuides}/>
    {/each}
  </g>
</svg>

<div style="display : flex; flex-direction : row; gap : 20px">
  <div>
    <div>Body Angle</div>
    <input type="range" bind:value={bodyAngle} min="-180" max="180" step="0.1"/>
  </div>
  <div>
    <div>Right Arm Angle</div>
    <input type="range" bind:value={rightArmAngle} min="-180" max="180" step="0.1"/>
  </div>
  <div>
    <div>Left Arm Angle</div>
    <input type="range" bind:value={leftArmAngle} min="-180" max="180" step="0.1"/>
  </div>
  <div>
    <div>Left Leg Angle</div>
    <input type="range" bind:value={leftLegAngle} min="-180" max="180" step="0.1"/>
  </div>
  <div>
    <div>Left Fore Leg Angle</div>
    <input type="range" bind:value={leftForeLegAngle} min="-180" max="180" step="0.1"/>
  </div>
</div>

<!-- 
<div style="width : 600px; height : 600px; position : relative; background-color : #bbb">
  <div style="position : absolute; top : 0; left : 0; width : 100px; height : 100px; background-color : #bbb; border-radius : 25px;"></div>

  <div style:transform="translate(50 50) scale(2)">
    {#each skeleton.anchor.children as joint , index}
      <ShowJointCss joint={joint} path={[index]} {allImageUrls} {allGuides} pixelsPerUnit={2}/>
    {/each}
  </div>
</div> -->

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