<script lang="ts">
    import { AngleToDegrees } from "$lib/angle";
  import ShowJointSvg from "./ShowJointSvg.svelte" ;
  import { type Joint, type Guide } from "$lib/skeleton" ;

  export let joint : Joint ;
  export let allImageUrls : Record<string , string> ;
  export let allGuides : Record<string , Guide> ;

  const imageUrl = allImageUrls[joint.name] ;
  if (!imageUrl) {
    console.error(`No image url for joint ${joint.name}`) ;
  }

  const guide = allGuides[joint.name.toLowerCase()] ;
  if (!guide) {
    console.error(`No guide for joint ${joint.name}`) ;
  }
  const { anchor , length , imgWidth , imgHeight } = guide ;

  const preContentRatio = anchor.x / length ;
  const postContentRatio = (imgWidth - anchor.x - length) / length ;

  const contentWidth = joint.length ;
  const preWidth = contentWidth * preContentRatio ;
  const postWidth = contentWidth * postContentRatio ;
  const fullWidth = preWidth + contentWidth + postWidth ;

  const aspectRatio = imgWidth / imgHeight ;
  const fullHeight = fullWidth / aspectRatio ;

</script>

<g transform={`translate(${joint.anchor.x} ${joint.anchor.y}) rotate(${AngleToDegrees(joint.angle)} 0 0)`}>

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

</g>
