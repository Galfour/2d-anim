<script lang="ts">
  import { AngleToDegrees } from "$lib/angle";
  import { PositionAdd, type Joint, fromPolar } from "./skeleton" ;

  let { joint , rankRatio , showText = true } : { joint : Joint , rankRatio : number , showText : boolean } = $props() ;

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

  let hue = rankRatio * 360 ;

  const color = hslToHex(hue , 100 , 50) ;

  // console.log('joint' , joint.name , $state.snapshot(joint)) ;

  const target = PositionAdd(joint.anchor , fromPolar(joint.length , joint.angle)) ;
</script>

<circle cx={joint.anchor.x} cy={joint.anchor.y} r={.25} fill={"red"} fill-opacity={0.8} />
<circle cx={target.x} cy={target.y} r={.25} fill={"blue"} fill-opacity={0.8} />

<g transform={`translate(${joint.anchor.x} ${joint.anchor.y})`}>
  <g transform={`rotate(${AngleToDegrees(joint.angle)} 0 0)`}>
    <!-- print joint as rounded rectangle with color -->
    <rect
      x={0} y={-1}
      width={joint.length} height={2} rx={1} fill={color} fill-opacity={0.4}
    />

    {#if showText}
      <!-- print name of the joint -->
      <text x={0} y={0} font-size={2} fill={"black"}>{joint.name}</text>
    {/if}

    <!-- debug circle at end of the joint -->
    <!-- <circle cx={joint.length} cy={0} r={.5} fill={color} fill-opacity={0.6} /> -->

    <!-- debug circle at beginning of the joint -->
    <!-- <circle cx={0} cy={0} r={.5} fill={color} fill-opacity={0.6} /> -->
  </g>
</g>

