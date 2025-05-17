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
  const { start , end , length , rotation , imgWidth , imgHeight } = guide ;

  const lengthX = length * Math.cos(rotation * Math.PI / 180) ;
  const lengthY = length * Math.sin(rotation * Math.PI / 180) ;
  const imgAspectRatio = imgWidth / imgHeight ;
  const ratioX = lengthX / imgWidth ;
  const ratioY = lengthY / imgHeight ;
  const ratioStartX = start.x / imgWidth ;
  const ratioStartY = start.y / imgHeight ;


  console.log(joint.name , imageUrl , guide) ;
  console.log(lengthX , lengthY) ;


  function extendedLengthToRectangleEdge(
    x0: number,
    y0: number,
    theta: number,
    width: number,
    height: number
  ): number {
    const dx = Math.cos(theta);
    const dy = Math.sin(theta);

    let tMin = Infinity;

    // Intersect with left (x = 0)
    if (dx !== 0) {
      const t = (0 - x0) / dx;
      const y = y0 + t * dy;
      if (t >= 0 && y >= 0 && y <= height) {
        tMin = Math.min(tMin, t);
      }
    }

    // Intersect with right (x = width)
    if (dx !== 0) {
      const t = (width - x0) / dx;
      const y = y0 + t * dy;
      if (t >= 0 && y >= 0 && y <= height) {
        tMin = Math.min(tMin, t);
      }
    }

    // Intersect with bottom (y = 0)
    if (dy !== 0) {
      const t = (0 - y0) / dy;
      const x = x0 + t * dx;
      if (t >= 0 && x >= 0 && x <= width) {
        tMin = Math.min(tMin, t);
      }
    }

    // Intersect with top (y = height)
    if (dy !== 0) {
      const t = (height - y0) / dy;
      const x = x0 + t * dx;
      if (t >= 0 && x >= 0 && x <= width) {
        tMin = Math.min(tMin, t);
      }
    }

    // If no valid intersection
    return tMin === Infinity ? 0 : tMin;
  }


  const extendedLengthA = extendedLengthToRectangleEdge(
    start.x,
    (imgHeight - start.y),
    guide.rotation * Math.PI / 180,
    imgWidth,
    imgHeight
  ) ;
  const extendedLengthB = extendedLengthToRectangleEdge(
    start.x,
    (imgHeight - start.y),
    Math.PI + guide.rotation * Math.PI / 180,
    imgWidth,
    imgHeight
  ) ;

  const normalExtendedLengthA = extendedLengthToRectangleEdge(
    start.x,
    (imgHeight - start.y),
    guide.rotation * Math.PI / 180 + Math.PI / 2,
    imgWidth,
    imgHeight
  ) ;
  const normalExtendedLengthB = extendedLengthToRectangleEdge(
    start.x,
    (imgHeight - start.y),
    Math.PI + guide.rotation * Math.PI / 180 + Math.PI / 2,
    imgWidth,
    imgHeight
  ) ;

  const ratioLength = length / (extendedLengthA + extendedLengthB) ;
  const normalRatio = (extendedLengthA + extendedLengthB) / (normalExtendedLengthA + normalExtendedLengthB) ;
  console.log(ratioLength) ;
  const jointCoordinateStartX = -ratioStartX * joint.length * ratioLength ;
  const jointCoordinateStartY = -ratioStartY * joint.length * ratioLength / imgAspectRatio ;

  const width = joint.length * ratioLength ;
  const height = width / imgAspectRatio ;

</script>

<g transform={`translate(${joint.start.x} ${joint.start.y}) rotate(${joint.angle} 0 0)`}>
<!-- <g transform={`translate(${joint.start.x} ${joint.start.y}) rotate(0 0 0)`}> -->

  <!-- print joint's image -->
  {#if imageUrl && guide}
    <g transform={`rotate(${guide.rotation} 0 0)`}>
      <image href={imageUrl} x={jointCoordinateStartX} y={jointCoordinateStartY} width={width} height={height} />
      <rect x={jointCoordinateStartX} y={jointCoordinateStartY} width={width} height={height} fill={"red"} fill-opacity={0.4} />
    </g>
    <!-- <g transform={`translate(-${guide.start.x} -${guide.start.y}) rotate(${guide.rotation} 0 0)`}>
      <image href={imageUrl} x={0} y={0} width={50} height={50} />
    </g> -->
  {:else}
    <!-- just a red rectangle for debug purposes -->
    <rect x={0} y={-1} width={joint.length} height={2} rx={1} fill={"red"} fill-opacity={0.4} />
  {/if}
  <rect
    x={0} y={-1}
    width={joint.length} height={2} rx={1} fill={"red"} fill-opacity={0.4}
  />
  <rect
    x={-.5} y={-.5}
    width={1} height={1} rx={1} fill={"red"} fill-opacity={1}
  />

  
  <g transform={`translate(${joint.length} 0)`}>
    {#each joint.children as child , index}
      <ShowJointSvg joint={child} path={[...path , index]} {allImageUrls} {allGuides}/>
    {/each}
  </g>

</g>
