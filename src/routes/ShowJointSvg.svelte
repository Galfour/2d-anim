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

  const preRatio = start.x / imgWidth ;
  const contentRatio = length / imgWidth ;
  const postRatio = (imgWidth - start.x - length) / imgWidth ;

  const aspectRatio = imgWidth / imgHeight ;

  console.log(joint.name , imageUrl , guide) ;

</script>

<g transform={`translate(${joint.start.x} ${joint.start.y}) rotate(${joint.angle} 0 0)`}>

  <!-- print joint's image -->
  {#if imageUrl && guide}
    <image href={imageUrl}
      x={-preRatio * joint.length}
      y={-joint.length / aspectRatio / contentRatio / 2}
      width={joint.length / contentRatio}
      height={joint.length / contentRatio / aspectRatio} preserveAspectRatio="none"
    />
    <rect x={0} y={-1} width={joint.length} height={2} rx={1} fill={"red"} fill-opacity={0.4} />
  {:else}
    <!-- just a red rectangle for debug purposes -->
    <rect x={0} y={-1} width={joint.length} height={2} rx={1} fill={"red"} fill-opacity={0.4} />
  {/if}

  
  <g transform={`translate(${joint.length} 0)`}>
    {#each joint.children as child , index}
      <ShowJointSvg joint={child} path={[...path , index]} {allImageUrls} {allGuides}/>
    {/each}
  </g>

</g>
