let config = {
	w: window.innerWidth,
	h: window.innerHeight-40,
	ballColor: "red",
	ballhistColor: "rgba(255,0,0,0.3)",
	boxColor: "blue",
	boxhistColor: "rgba(0,0,255,0.3)",
	triangleColor: "green",
	trianglehistColor: "rgba(0,255,0,0.3)",

	ballSize: 10,
	pinSize: 10,
	gridSize: 40,

	maxGridSize: 20,

}


var Engine = Matter.Engine,
	World = Matter.World,
	Bodies = Matter.Bodies,
	Events = Matter.Events,
	Runner = Matter.Runner,
	Constraint = Matter.Constraint,
	Mouse = Matter.Mouse,
	MouseConstraint = Matter.MouseConstraint;

var engine,world,mConstraint,sensor,runner;
var things = [];
var histogram = [];
var histmax = [];
var nx=40;
var ny=20;
var count;
var histSelection;
var running=true;


function setup(){
	gridSetup()
	cleanHistogram()

	createP("Pins: ").style("display","inline")
	pinSelection=createRadio().style("display","inline-block").style("width","200px")
	pinSelection.option("Ball")
	pinSelection.option("Box")
	pinSelection.option("Triangle")
	pinSelection.value("Ball")
	pinSelection.attribute("onChange","pinGenerator(pinSelection.value(),c='white')")

	ballSelection=createCheckbox("Ball").style("display","inline").checked(true)
	boxSelection=createCheckbox("Box").style("display","inline")
	triangleSelection=createCheckbox("Triangle").style("display","inline-block").style("width","200px")

	createButton("clear").attribute("onClick","cleanHistogram()").style("display","inline-block").style("width","100px")
	createButton("pause").attribute("onClick","pause()").style("display","inline-block").style("width","100px")

	histSelection=createCheckbox("histogram").style("display","inline-block").style("width","100px")
	createP("")

	var canvas = createCanvas(config.w,config.h)

	engine = Engine.create()
	world = engine.world;
	runner = Runner.create()


	pinGenerator(pinSelection.value(),c="white")
	sensorGenerator()
//+++++++++++++++++++++++++++++ Chain
/*
	var p0 = new Ball(200,10,10,"blue",{isStatic:true,friction:0.8,frictionStatic:0.8,restitution:0.3})
	things.push(p0)
	for(var i=0;i<10;++i){
		var p1 = new Ball(200+i*20,10,10,"blue",{isStatic:false,friction:0.8,frictionStatic:0.8,restitution:0.3})
		var cons = new Bind(p0,p1,10,0.1,"white",{x:5,y:0},{x:-5,y:0})
		things.push(p1)
		things.push(cons)
		p0=p1
	}
*/
	var mouse = Mouse.create(canvas.elt)
	mouse.pixelRatio = pixelDensity()
	mConstraint = MouseConstraint.create(engine,{mouse:mouse})
	World.add(world,mConstraint)

	Events.on(engine,"collisionEnd",sensorCollision)
	Runner.start(runner,engine)
//	Events.on(engine,"afterUpdate",drawOnce)
}
// function draw(){
// 	Engine.update(engine,16.6666)
// }

function draw(){
	background("black")


	var res=[0,0,0,0]

	if(ballSelection.checked()){res[0]+=1;res[1]+=1}
	if(boxSelection.checked()){res[0]+=1;res[2]+=1}
	if(triangleSelection.checked()){res[0]+=1;res[3]+=1}
	if(res[0]==0){res[0]=1}

	ballGenerator((Math.random()-0.5)*10*config.ballSize+config.w/2,4*config.ballSize,1,res[1]/res[0],res[2]/res[0],res[3]/res[0])

	for( var i=things.length-1;i>=0;i--){
		if(things[i].inside(0,0,config.w,config.h)){
			things[i].show()
		} else {
			things[i].removeFrom(world)
			things.splice(i,1)
		}
	}

	if(mConstraint.body){
		var pos = mConstraint.body.position
		var offset = mConstraint.constraint.pointB;
		var m = mConstraint.mouse.position
		stroke(0,255,0)
		line(pos.x + offset.x, pos.y + offset.y, m.x, m.y)
	}

	if(histSelection.checked()){
		var hmax = 1+max(histmax)
		for(var i=0;i<histogram.length;++i){
			fill(config.ballhistColor)
			rect((config.gridSize/2)+i*config.gridSize,config.h-20,config.gridSize,-histogram[i].ball*2*config.h/3/hmax)
			fill(config.boxhistColor)
			rect((config.gridSize/2)+i*config.gridSize,config.h-20,config.gridSize,-histogram[i].box*2*config.h/3/hmax)
			fill(config.trianglehistColor)
			rect((config.gridSize/2)+i*config.gridSize,config.h-20,config.gridSize,-histogram[i].triangle*2*config.h/3/hmax)
		}
	}

	textSize(32);
	fill("white")
	text(count,30,30)
}

function pause(){
	if(running){
		noLoop()
		Runner.stop(runner,engine)
	} else {
		Runner.start(runner,engine)
		loop()
	}
	running = !running
}

function cleanHistogram(){
	histogram=[]
	histmax = []
	count=0
	for(var i=0;i<config.nx;++i){
		histogram.push({ball:0,box:0,triangle:0})
		histmax.push(0)
	}
}

function cleanThings(label){
	for(var i=things.length-1;i>=0;i--){
		if(things[i].label==label){
			things[i].removeFrom(world)
			things.splice(i,1)
		}
	}
}

function sensorCollision(event){
	event.pairs.forEach((p)=>{
		if(p.bodyA.id==sensor.body.id){
			var i = Math.floor(p.bodyB.position.x/config.w*config.nx);
			if(i>=0 && i<config.nx){
				switch(p.bodyB.label){
					case "ball":histogram[i].ball += 1; break;
					case "box":histogram[i].box += 1; break;
					case "triangle":histogram[i].triangle += 1; break;
				}
				histmax[i]=max(max(histogram[i].ball,histogram[i].box),histogram[i].triangle)
				count++;
			}
		}
	})
}

function sensorGenerator(c="rgba(100,100,100,0.3)"){
	sensor = new Box(config.w/2,(config.ny-1)*config.h/config.ny,config.w,config.gridSize/2,c,{isStatic:true,isSensor:true})
	sensor.label = "sensor"
	things.push(sensor)
	sensor.addTo(world)
}

function pinGenerator(pin,c="white"){
	cleanThings("pin")
	for(var i=0;i<config.nx;++i){
		for(var j=3;j<config.ny-1;++j){
			if(j%2==0){
				var x = (2*i+1)*config.gridSize/2
			} else {
				var x = i*config.gridSize
			}
			var y = j*config.gridSize;
			var ball;
			switch(pin){
				case "Ball":{
					ball = new Ball(x,y,config.pinSize,c,{isStatic:true,friction:0.1,frictionStatic:0.1,restitution:0.6,angle:PI/2})
					break;
				}
				case "Box":{
					ball = new Box(x,y,config.pinSize,config.pinSize,c,{isStatic:true,friction:0.1,frictionStatic:0.1,restitution:0.6,angle:PI/2})
					break;
				}
				case "Triangle":{
					ball = new Triangle(x,y,config.pinSize,c,{isStatic:true,friction:0.1,frictionStatic:0.1,restitution:0.6,angle:PI/2})
					break;
				}
			}
			ball.label = "pin"
			things.push(ball)
			ball.addTo(world)
		}
	}
}

function ballGenerator(x,y,rate=1,rateBall=1,rateBox=0,rateTriangle=0){
	if(Math.random()<rate){
		var r = Math.random()
		var ball;
		if(r>1-rateBall){
			ball = new Ball(x,y,config.ballSize,config.ballColor,{isStatic:false,friction:0.1,frictionStatic:0.1,restitution:0.6})
			ball.body.label="ball"			
		} else if(r>1-rateBall-rateBox){
			ball = new Box(x,y,2*config.ballSize,2*config.ballSize,config.boxColor,{isStatic:false,friction:0.1,frictionStatic:0.1,restitution:0.6})
			ball.body.label="box"			
		} else if(r>1-rateBall-rateBox-rateTriangle){
			ball = new Triangle(x,y,config.ballSize,config.triangleColor,{isStatic:false,friction:0.1,frictionStatic:0.1,restitution:0.6})		
			ball.body.label="triangle"
		} 
		if(ball){
			ball.label = "ball"
			things.push(ball)
			ball.addTo(world)
		}
	}
}

function gridSetup(){
	config.nx=Math.floor(config.w/config.gridSize)
	config.ny=Math.floor(config.h/config.gridSize)
	if(config.nx>config.maxGridSize || config.ny>config.maxGridSize){
		config.gridSize = min(config.w,config.h)/config.maxGridSize
		config.nx=Math.floor(config.w/config.gridSize)
		config.ny=Math.floor(config.h/config.gridSize)
		config.ballSize=config.gridSize/6
		config.pinSize=config.gridSize/6
	}
}

