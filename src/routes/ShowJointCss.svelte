<!-- Currently Broken -->

<script lang="ts">
  import ShowJointCss from "./ShowJointCss.svelte" ;
  import { Joint, type Guide } from "./skeleton" ;

  export let joint : Joint ;
  export let path : Array<number> = [] ;
  export let allImageUrls : Record<string , string> ;
  export let allGuides : Record<string , Guide> ;
  export let pixelsPerUnit : number ;

  const imageUrl = allImageUrls[joint.name.toLowerCase()] ;
  if (!imageUrl) {
    console.error(`No image url for joint ${joint.name}`) ;
  }

  const guide = allGuides[joint.name.toLowerCase()] ;
  if (!guide) {
    console.error(`No guide for joint ${joint.name}`) ;
  }
  const { start , length , imgWidth , imgHeight } = guide ;

  const aspectRatio = imgWidth / imgHeight ;
  const fullWidth = joint.length * pixelsPerUnit / length ;
  const fullHeight = fullWidth / aspectRatio ;

</script>

<div
  style:transform={`translate(${joint.start.x * pixelsPerUnit}px ${joint.start.y * pixelsPerUnit}px) rotate(${joint.angle}deg)`}
  style:position={`absolute`}
  style:width={`${100 * pixelsPerUnit}px`}
  style:height={`${100 * pixelsPerUnit}px`}
  style="border : 1px solid red;"
>

  <div
    style:transform={`translate(${joint.length * pixelsPerUnit}px 0px)`}
    style:position={`absolute`}
  >
    {#each joint.preChildren as child , index}
      <ShowJointCss joint={child} path={[...path , index]} {allImageUrls} {allGuides} {pixelsPerUnit}/>
    {/each}
  </div>


  <!-- print joint's image -->
  {#if imageUrl && guide}
    <image href={imageUrl}
      x={-start.x}
      y={-fullHeight / 2}
      width={fullWidth}
      height={fullHeight} preserveAspectRatio="none"
    />
    <div style="position : absolute; top : 0; left : 0; width : {joint.length * pixelsPerUnit}px; height : 2px; background-color : red; opacity : 0.4;"></div>
    
  {:else}
    <!-- just a red rectangle for debug purposes -->
    <rect x={0} y={-1} width={joint.length} height={2} rx={1} fill={"red"} fill-opacity={0.4} />
  {/if}

  
  <div
    style:transform={`translate(${joint.length * pixelsPerUnit}px 0px)`}
    style:position={`absolute`}
  >
    {#each joint.postChildren as child , index}
      <ShowJointCss joint={child} path={[...path , joint.preChildren.length + index]} {allImageUrls} {allGuides} {pixelsPerUnit}/>
    {/each}
  </div>

</div>