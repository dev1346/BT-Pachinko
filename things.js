class Thing {
	constructor(x,y,c,options={isStatic:false,friction:0.8,frictionStatic:0.8,restitution:0.3,slop:0}){
		this.color = c; 
		this.body=Bodies.circle(x,y,1,options)
	}

	show(){
		fill(this.color)
		stroke("white")
		beginShape()
			this.body.vertices.forEach((v)=>{
				vertex(v.x,v.y)
			})
		endShape(CLOSE)
	}

	inside(xmin,ymin,xmax,ymax){
		return((this.body.position.x<xmax)&&(this.body.position.x>=xmin)&&(this.body.position.y<ymax)&&(this.body.position.y>=ymin))
	}

	addTo(w){
		World.add(w,this.body)
	}

	removeFrom(w){
		World.remove(w,this.body)
	}
}

class Box extends Thing {
	constructor(x,y,w,h,c,options={isStatic:false}){
		super(x,y,c,options)
		this.w = w;
		this.h = h;
		this.body=Bodies.rectangle(x,y,w,h,options)
	}	
}

class Ball extends Thing {
	constructor(x,y,r,c,options={isStatic:false}){
		super(x,y,c,options)
		this.r = r;
		this.body=Bodies.circle(x,y,r,options)
	}	
}

class Triangle extends Thing {
	constructor(x,y,r,c,options={isStatic:false}){
		super(x,y,c,options)
		this.r = r;
		this.body=Bodies.polygon(x,y,3,r,options)
	}	
}

class Bind {
	constructor(b1,b2,length=10,stiff=0.01,c="white",pos1={x:0,y:0},pos2={x:0,y:0}){
		var options = {
			bodyA: b1.body,
			bodyB: b2.body,
			pointA: pos1,
			pointB: pos2,
			length: length,
			stiffness: stiff
		}
		this.color = c
		this.body = Constraint.create(options)
	}
	
	show(){
		stroke(this.color)
		var x1=this.body.bodyA.position.x+this.body.pointA.x
		var y1=this.body.bodyA.position.y+this.body.pointA.y
		var x2=this.body.bodyB.position.x+this.body.pointB.x
		var y2=this.body.bodyB.position.y+this.body.pointB.y
		line(x1,y1,x2,y2)
	}

	inside(xmin,ymin,xmax,ymax){
		var x1=this.body.bodyA.position.x+this.body.pointA.x
		var y1=this.body.bodyA.position.y+this.body.pointA.y
		var x2=this.body.bodyB.position.x+this.body.pointB.x
		var y2=this.body.bodyB.position.y+this.body.pointB.y
		var a=(x1<xmax)&&(x1>=xmin)&&(y1<ymax)&&(y1>=ymin)
		return(a&&(x2<xmax)&&(x2>=xmin)&&(y2<ymax)&&(y2>=ymin))
	}

	addTo(w){
		World.add(w,this.body)
	}

	removeFrom(w){
		World.remove(w,this.body)
	}
}