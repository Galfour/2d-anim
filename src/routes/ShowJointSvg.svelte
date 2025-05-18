<script lang="ts">
  import ShowJointSvg from "./ShowJointSvg.svelte" ;
  import { Joint, type Guide } from "./skeleton" ;

  export let joint : Joint ;
  export let path : Array<number> = [] ;
  export let allImageUrls : Record<string , string> ;
  export let allGuides : Record<string , Guide> ;

  const imageUrl = allImageUrls[joint.name.toLowerCase()] ;
  if (!imageUrl) {
    console.error(`No image url for joint ${joint.name}`) ;
  }

  const guide = allGuides[joint.name.toLowerCase()] ;
  if (!guide) {
    console.error(`No guide for joint ${joint.name}`) ;
  }
  const { start , length , imgWidth , imgHeight } = guide ;

  const preContentRatio = start.x / length ;
  const postContentRatio = (imgWidth - start.x - length) / length ;

  const contentWidth = joint.length ;
  const preWidth = contentWidth * preContentRatio ;
  const postWidth = contentWidth * postContentRatio ;
  const fullWidth = preWidth + contentWidth + postWidth ;

  const aspectRatio = imgWidth / imgHeight ;
  const fullHeight = fullWidth / aspectRatio ;

</script>

<g transform={`translate(${joint.start.x} ${joint.start.y}) rotate(${joint.angle} 0 0)`}>

  <g transform={`translate(${joint.length} 0)`}>
    {#each joint.preChildren as child , index}
      <ShowJointSvg joint={child} path={[...path , index]} {allImageUrls} {allGuides}/>
    {/each}
  </g>


  <!-- print joint's image -->
  {#if imageUrl && guide}
    <image href={imageUrl}
      x={-preWidth}
      y={-fullHeight / 2}
      width={fullWidth}
      height={fullHeight} preserveAspectRatio="none"
    />
    <!-- <rect x={0} y={-1} width={joint.length} height={2} rx={.2} fill={"red"} fill-opacity={0.4} /> -->
    <!-- <rect x={-preWidth} y={-1} width={fullWidth} height={2} rx={.2} fill={"blue"} fill-opacity={0.1} /> -->
    
  {:else}
    <!-- just a red rectangle for debug purposes -->
    <rect x={0} y={-1} width={joint.length} height={2} rx={1} fill={"red"} fill-opacity={0.4} />
  {/if}

  
  <g transform={`translate(${joint.length} 0)`}>
    {#each joint.postChildren as child , index}
      <ShowJointSvg joint={child} path={[...path , joint.preChildren.length + index]} {allImageUrls} {allGuides}/>
    {/each}
  </g>

</g>
