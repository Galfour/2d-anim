<script lang=ts>
  import { writable, type Writable } from "svelte/store";

  import { type Joint , JointProperties, Skeleton , SkeletonAnimationFrameData, type Guide, SkeletonControl, applySkeletonControlState, Root, JoinConstructor, type RootControl, type JointControl, type SkeletonAnimation, runSkeletonAnimation, applyJointControl, applyRootControl } from "$lib/skeleton" ;
  import DebugJointSvg from "./DebugJointSvg.svelte";
  import ShowJointSvg from "./ShowJointSvg.svelte";
  // import ShowJointCss from "./ShowJointCss.svelte" ;
  import guides_ from "./all-guides-2.json" ;

  import { AngleToDegrees, AngleDegrees as deg } from "$lib/angle" ;
    import { onMount } from "svelte";
    import { getAllAnimationFrames, getAnimationFrame, removeAnimationFrame, saveAnimationFrame } from "./storage";
    import { lerp, lerpAnimationFrame } from "$lib/lerp";

  const allGuides : Record<string , Guide> = guides_ ;

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

  let allAnimationFrames : Array<string> = $state([]) ;

  const fetchAllAnimationFrames = async () => {
    allAnimationFrames = await getAllAnimationFrames() ;
  } ;

  onMount(async () => {
    await fetchAllAnimationFrames() ;
  }) ;

  let bufferName : string = $state('') ;
  let bufferContent : SkeletonAnimationFrameData | undefined = $state(undefined) ;

  let animationStartName : string | undefined = $state(undefined) ;
  let animationEndName : string | undefined = $state(undefined) ;
  let animationFrameQuantity : number = $state(120) ;
  let animationFrameRate : number = $state(60) ;

  // LERP between start and end at frameRate frames per second
  const generateAnimation = async () : Promise<SkeletonAnimation | undefined> => {
    if (!animationStartName || !animationEndName) return ;
    const animationStart = await getAnimationFrame(animationStartName) ;
    const animationEnd = await getAnimationFrame(animationEndName) ;
    if (!animationStart || !animationEnd) return ;

    const skeletonAnimation : SkeletonAnimation = {
      frameData : [] ,
      frameRate : animationFrameRate ,
    }

    for (let i = 0; i < animationFrameQuantity; i++) {
      const t = i / animationFrameQuantity ;
      const lerped = lerpAnimationFrame(animationStart, animationEnd, t);
      skeletonAnimation.frameData.push(lerped) ;
    }

    return skeletonAnimation ;
  } ;

  const playAnimation = async () => {
    const animation = await generateAnimation() ;
    if (!animation) return ;
    runSkeletonAnimation(animation , (rootControl) => {
      applyRootControl(skeleton.root , rootControl) ;
    } , (name , jointControl) => {
      console.log('jointControl' , name , jointControl) ;
      applyJointControl(skeleton , name , jointControl) ;
    }) ;
  } ;
</script>

<svg width="500" height="500" viewBox="0 0 100 100" fill="red">
	<rect width="100" height="100" rx="25" fill="#bbb"/>

  <g transform="translate(50 50) scale(2)">
    {#each Object.values(skeleton.joints) as joint , index}
      {@const rankRatio = index / Object.keys(skeleton.joints).length}
      <DebugJointSvg {joint} {rankRatio} showText={false}/>
    {/each}
  </g>
</svg>

<svg width="500" height="500" viewBox="0 0 100 100" fill="red">
	<rect width="100" height="100" rx="25" fill="#bbb"/>

  <g transform="translate(50 50) scale(2)">
    {#each skeleton.layerOrder as jointName}
      {@const joint = skeleton.joints[jointName]}
      <ShowJointSvg {joint} {allImageUrls} {allGuides}/>
    {/each}
  </g>
</svg>

<div style="display : flex; flex-direction : row; gap : 20px ; flex-wrap : wrap">
  {#each Object.entries(skeleton.joints) as [jointName , joint]}
    <div>
      <div>{joint.name}</div>
      <input type="range" bind:value={
        () => AngleToDegrees(joint.angle) , 
        (x) => applySkeletonControlState(skeleton , { joints : { [jointName] : { angle : deg(x) } } })
      } min="-180" max="180" step="0.1"/>
    </div>
  {/each}
</div>

<div style="display : flex; flex-direction : column; gap : 10px ; flex-wrap : wrap ; width : max-content">
  <h2>Animation Frames</h2>
  <div style="display : flex; flex-direction : row; gap : 10px ; flex-wrap : wrap ; width : max-content">
    {#each allAnimationFrames as frameName}
      <div style="border : 1px solid gray ; padding : 10px ; border-radius : 5px ; width : max-content">
        <div>{frameName}</div>
        <button onclick={async () => {
          const frame = await getAnimationFrame(frameName) ;
          if (frame) {
            applySkeletonControlState(skeleton , frame.control) ;
          }
        }}>Load</button>  
        <button onclick={async () => {
          await removeAnimationFrame(frameName) ;
          await fetchAllAnimationFrames() ;
        }}>Remove</button>
      </div>
    {/each}
  </div>
  <br>
  <button onclick={() => {
    const rootControl : RootControl = {} ;
    const jointControls : Record<string , JointControl> = {} ;
    for (const [name , joint] of Object.entries(skeleton.joints)) {
      jointControls[name] = { angle : joint.angle } ;
    }
    bufferContent = SkeletonAnimationFrameData(SkeletonControl(rootControl , jointControls)) ;
  }}>Keyframe current angles into buffer</button>
  <div style="display : none">
    <div style="width : 800px ; overflow-y : auto ; max-height : 8lh ; min-height : 1lh ; border : 1px solid gray ; padding : 10px ; border-radius : 5px ;">{JSON.stringify(bufferContent , null , 2)}</div>
  </div>
  <div>{bufferContent ? 'There is a buffer' : 'No buffer'}</div>
  <input type="text" bind:value={bufferName}/>
  <button disabled={!bufferContent || !bufferName} onclick={async () => {
    if (!bufferContent || !bufferName) return ;
    await saveAnimationFrame(bufferName , bufferContent) ;
    await fetchAllAnimationFrames() ;
  }}>Save</button>
</div>

<div>
  <h2>Animation</h2>
  <div style="display : flex; flex-direction : row; gap : 10px ; flex-wrap : wrap ; width : max-content">
    <div>
      <div>Start Frame</div>
      <select bind:value={animationStartName}>
        {#each allAnimationFrames as frameName}
          <option value={frameName}>{frameName}</option>
        {/each}
      </select>
    </div>
    <div>
      <div>End Frame</div>
      <select bind:value={animationEndName}>
        {#each allAnimationFrames as frameName}
          <option value={frameName}>{frameName}</option>
        {/each}
      </select>
    </div>
    <div style="width : 100px">
      <div>Frame Rate</div>
      <select bind:value={animationFrameRate}>
        {#each [12 , 25 , 30 , 60 , 120 , 240] as rate}
          <option value={rate}>{rate}</option>
        {/each}
      </select>
    </div>
    <div>
      <div>Frame Quantity</div>
      <input type="number" bind:value={animationFrameQuantity} style="width : 50px"/>
    </div>
  </div>
  <button onclick={playAnimation} disabled={!animationStartName || !animationEndName}>Play</button>
</div>