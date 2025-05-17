<script lang="ts">
  import DebugJointSvg from "./DebugJointSvg.svelte" ;
  import { Joint } from "./skeleton" ;

  export let joint : Joint ;
  export let path : Array<number> = [] ;
  export let showText : boolean = true ;

  function hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));

    const r = f(0);
    const g = f(8);
    const b = f(4);

    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  }


  // assume there are at most 3 siblings at each joint, and we compute the hue based on the first 3 indexes
  // [] -> 0
  // [a] -> 1 + a
  // [a , b] -> (1 + 3) + 3*a + b
  // [a , b , c] -> (1 + 3 + 3*3) + 3*3*a + 3*b + c
  // total = 1 + 3 + 3*3 + 3*3*3 = 40

  let hueNonNormalized =
    path.length === 0 ? 0 :
    path.length === 1 ? 1 + path[0] :
    path.length === 2 ? 4 + 3 * path[0] + path[1] :
    13 + 3 * 3 * path[0] + 3 * 3 * path[1] + path[2] ;

  // normalize to 0-360
  let hue = hueNonNormalized * 360 / 40 ;

  // similar for lightness, but for next 3 entries in the path
  let lightnessNonNormalized =
    path.length < 3 ? 0 :
    path.length === 3 ? 1 + path[3] :
    path.length === 4 ? 4 + 3 * path[3] + path[4] :
    13 + 3 * 3 * path[3] + 3 * 3 * path[4] + path[5] ;

  // normalize to 25-75
  let lightness = ~~(lightnessNonNormalized * 50 / 40) + 25 ;
  // let saturation = ~~(saturationNonNormalized * 50 / 40) + 25 ;

  const color = hslToHex(hue , 100 , lightness) ;

</script>

<g transform={`translate(${joint.start.x} ${joint.start.y}) rotate(${joint.angle} 0 0)`}>
  <!-- print joint as rounded rectangle with color -->
  <rect
    x={0} y={-1}
    width={joint.length} height={2} rx={1} fill={color} fill-opacity={0.4}
  />

  {#if showText}
    <!-- print name of the joint -->
    <text x={joint.start.x} y={joint.start.y - 1} font-size={2} fill={"black"}>{joint.name}</text>
  {/if}

  <g transform={`translate(${joint.length} 0)`}>
    {#each joint.children as child , index}
      <DebugJointSvg joint={child} path={[...path , index]} {showText}/>
    {/each}
  </g>

  <!-- debug circle at end of the joint -->
  <circle cx={joint.length} cy={0} r={.5} fill={color} fill-opacity={0.6} />
</g>

<!-- debug circle at beginning of the joint -->
<circle cx={joint.start.x} cy={joint.start.y} r={.5} fill={color} fill-opacity={0.6} />
