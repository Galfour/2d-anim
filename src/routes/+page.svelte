<script>

  let body = {
    x : 50 ,
    y : 50 ,
  } ;

	let head = {
    x : 2 ,
    y : -12 ,
    fill : 'black' ,
    circle : {
      cx : 0 ,
      cy : 0 ,
      r : 4 ,
    } ,
    hat : {
      cx : 0 ,
      cy : -3 ,
      r : 2 ,
    } ,
	} ;

  let bust = {
    fill : '#0000ff' ,
    rx : 5 ,
    ry : 10 ,
    cx : 0 ,
    cy : 0 ,
  } ;

  let leftArm = {
    fill : '#aaaaff' ,
    rx : 2 ,
    width : 10 ,
    height : 4 ,
    x : 5 ,
    y : -8 ,
    angle : 65 ,
  } ;

  let rightArm = {
    fill : '#5555ff' ,
    rx : 2 ,
    width : 10 ,
    height : 4 ,
    x : -2 ,
    y : -8 ,
    angle : 65 ,
  } ;

  let leftLeg = {
    fill : '#ffaaaa' ,
    rx : 2 ,
    width : 15 ,
    height : 4 ,
    x : 5 ,
    y : 5 ,
    angle : 80 ,
  } ;

  let rightLeg = {
    fill : '#ff5555' ,
    rx : 2 ,
    width : 15 ,
    height : 4 ,
    x : -2 ,
    y : 5 ,
    angle : 80 ,
  } ;
</script>

<svg width="400" height="400" viewBox="0 0 100 100" fill="red">
	<rect width="100" height="100" rx="25" fill="gray"/>

  <!-- body, just a container group -->
  <g transform={`translate(${body.x}, ${body.y})`}>
    <!-- left arm (one rounded rectangle) -->
    <rect {...leftArm} transform={`rotate(${leftArm.angle}, ${leftArm.x}, ${leftArm.y})`}/>

    <!-- left leg (one rounded rectangle) -->
    <rect {...leftLeg} transform={`rotate(${leftLeg.angle}, ${leftLeg.x}, ${leftLeg.y})`}/>

    <!-- bust (one ellipse) -->
    <ellipse {...bust} />
    <!-- head (two circles, head and hat) -->
    <g transform={`translate(${head.x}, ${head.y})`} fill={head.fill}>
      <circle {...head.circle} />
      <circle {...head.hat} />
    </g>



    <!-- right arm (one rounded rectangle) -->
    <rect {...rightArm} transform={`rotate(${rightArm.angle}, ${rightArm.x}, ${rightArm.y})`}/>



    <!-- right leg (one rounded rectangle) -->
    <rect {...rightLeg} transform={`rotate(${rightLeg.angle}, ${rightLeg.x}, ${rightLeg.y})`}/>
  </g>

</svg>

<div style="display : flex; flex-direction : column; gap : 20px">

<div style="display : flex; gap : 10px">
	<div>Head</div>
	<div>
		<div>Radius</div>
		<input type="range" min="1" max="100" bind:value={head.circle.r}/>
	</div>
	<div>
		<div>CX</div>
		<input type="range" min="1" max="100" bind:value={head.x}/>
	</div>
	<div>
		<div>CY</div>
		<input type="range" min="1" max="100" bind:value={head.y}/>
	</div>
  <div>
    <div>Color</div>
    <input type="color" bind:value={head.fill}/>
  </div>
</div>

<div style="display : flex; gap : 10px">
  <div>Bust</div>
  <div>
    <div>RX</div>
    <input type="range" min="1" max="100" bind:value={bust.rx}/>
  </div>
  <div>
    <div>RY</div>
    <input type="range" min="1" max="100" bind:value={bust.ry}/>
  </div>
  <div>
    <div>CX</div>
    <input type="range" min="1" max="100" bind:value={bust.cx}/>
  </div>
  <div>
    <div>CY</div>
    <input type="range" min="1" max="100" bind:value={bust.cy}/>
  </div>
  <div>
    <div>Color</div>
    <input type="color" bind:value={bust.fill}/>
  </div>
</div>

<div style="display : flex; gap : 10px">
  <div>Left Arm</div>
  <div>
    <div>RX</div>
    <input type="range" min="1" max="100" bind:value={leftArm.rx}/>
  </div>
</div>
<!-- 
<div style="display : flex; gap : 10px">
  <div>Right Arm</div>
  <div>
    <div>RX</div>
    <input type="range" min="1" max="100" bind:value={rightArm.rx}/>
  </div>
</div>

<div style="display : flex; gap : 10px">
  <div>Left Leg</div>
  <div>
    <div>RX</div>
    <input type="range" min="1" max="100" bind:value={leftLeg.rx}/>
  </div>
</div>

<div style="display : flex; gap : 10px">
  <div>Right Leg</div>
  <div>
    <div>RX</div>
    <input type="range" min="1" max="100" bind:value={rightLeg.rx}/>
  </div>
</div>
 -->


</div>