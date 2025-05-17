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

  let leftArmGroup = {
    x : 5 ,
    y : -8 ,
    angle : 65 ,
  } ;

  let leftArm = {
    fill : '#aaaaff' ,
    rx : 2 ,
    width : 10 ,
    height : 4 ,
  } ;

  let leftForeArm = {
    fill : '#aaaabb' ,
    rx : 2 ,
    width : 10 ,
    height : 4 ,
    x : 7 ,
    y : 0 ,
    angle : 10 ,
  } ;

  let rightArmGroup = {
    x : -1 ,
    y : -8 ,
    angle : 75 ,
  } ;

  let rightArm = {
    fill : '#5555ff' ,
    rx : 2 ,
    width : 10 ,
    height : 4 ,
  } ;

  let rightForeArm = {
    fill : '#5555aa' ,
    rx : 2 ,
    width : 10 ,
    height : 4 ,
    x : 7 ,
    y : 0 ,
    angle : 10 ,
  } ;

  let leftLegGroup = {
    x : 2 ,
    y : 5 ,
    angle : 10 ,
  } ;

  let leftLeg = {
    fill : '#ffaaaa' ,
    rx : 3 ,
    x : -2 ,
    width : 15 ,
    height : 5 ,
  } ;

  

  let leftForeLeg = {
    fill : '#ff8888' ,
    rx : 3 ,
    width : 13 ,
    height : 4.5 ,
    x : 9 ,
    y : 0.5 ,
    angle : 10 ,
  } ;

  let rightLeg = {
    fill : '#cc5555' ,
    rx : 3 ,
    width : 15 ,
    height : 5 ,
    x : -2 ,
    y : 5 ,
    angle : 80 ,
  } ;
</script>

<svg width="800" height="800" viewBox="0 0 100 100" fill="red">
	<rect width="100" height="100" rx="25" fill="gray"/>

  <!-- body, just a container group -->
  <g transform={`translate(${body.x}, ${body.y})`}>

    <!-- left arm group (two rounded rectangles) -->
    <g transform={`rotate(${leftArmGroup.angle} , ${leftArmGroup.x}, ${leftArmGroup.y}) translate(${leftArmGroup.x}, ${leftArmGroup.y})`}>
      <rect {...leftArm}/>
      <rect {...leftForeArm} transform={`rotate(${-1 * leftForeArm.angle}, ${leftForeArm.x + leftForeArm.rx}, ${leftForeArm.y + leftForeArm.height / 2})`}/>
    </g>

    <!-- left leg group (two rounded rectangles) -->
    <g transform={`rotate(${-leftLegGroup.angle + 90} , ${leftLegGroup.x}, ${leftLegGroup.y + leftLeg.height / 2}) translate(${leftLegGroup.x}, ${leftLegGroup.y})`}>
      <rect {...leftLeg}/>
      <rect {...leftForeLeg} transform={`rotate(${leftForeLeg.angle}, ${leftForeLeg.x }, ${leftForeLeg.y + leftForeLeg.height / 2})`}/>

      <!-- debug purpose (rotation center fore leg) -->
      <circle cx={leftForeLeg.x} cy={leftForeLeg.y + leftForeLeg.height / 2} r="1" fill="red"/>

    </g>

    <!-- bust (one ellipse) -->
    <ellipse {...bust} />
    <!-- head (two circles, head and hat) -->
    <g transform={`translate(${head.x}, ${head.y})`} fill={head.fill}>
      <circle {...head.circle} />
      <circle {...head.hat} />
    </g>



    <!-- right arm (one rounded rectangle) -->
    <g transform={`rotate(${rightArmGroup.angle} , ${rightArmGroup.x}, ${rightArmGroup.y}) translate(${rightArmGroup.x}, ${rightArmGroup.y})`}>
      <rect {...rightArm}/>
      <rect {...rightForeArm} transform={`rotate(${-1 * rightForeArm.angle}, ${rightForeArm.x + rightForeArm.rx}, ${rightForeArm.y + rightForeArm.height / 2})`}/>
    </g>



    <!-- right leg (one rounded rectangle) -->
    <rect {...rightLeg} transform={`rotate(${rightLeg.angle}, ${rightLeg.x}, ${rightLeg.y})`}/>

  </g>

</svg>

<div style="display : flex; flex-direction : column; gap : 20px">
  <div style="display : flex; flex-direction : row; gap : 20px">
    <div>Left Fore Leg</div>
    <div>
      <div>Angle</div>
      <input type="range" bind:value={leftForeLeg.angle} min="-90" max="90" step="0.1"/>
      <div>{leftForeLeg.angle}</div>
    </div>


  </div>

</div>