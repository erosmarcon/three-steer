/**
 * Created by eros on 27/03/2017.
 */
Entity = function (mesh) {

    THREE.Group.apply(this);


    this.mass=1
    this.maxSpeed=10
    this.position=new THREE.Vector3(0,0,0)//!!!!!
    this.velocity=new THREE.Vector3(0,0,0)
    this.add(mesh)

}

Entity.prototype = Object.assign(Object.create(THREE.Group.prototype), {
    constructor: Entity,

    update:function()
    {
        this.velocity.clampLength(0, this.maxSpeed)
        this.position.add(this.velocity)
    }
});

SteeringEntity = function (mesh)
{
    Entity.call(this, mesh);

    this.maxForce=1;
    this.arrivalThreshold=100;
    this.wanderAngle=0
    this.wanderDistance=10;
    this.wanderRadius=5;
    this.wanderRange=1;
    this.steeringForce=new THREE.Vector3(0,0,0);
}

SteeringEntity.prototype = Object.assign(Object.create(Entity.prototype), {

    constructor: SteeringEntity,

    seek:function(target)
    {
        var desiredVelocity=target.clone().sub(this.position);
        desiredVelocity.normalize().setLength(this.maxSpeed).sub(this.velocity);
        this.steeringForce.add(desiredVelocity);
    },

    flee:function(target){
        var desiredVelocity=target.clone().sub(this.position);
        desiredVelocity.normalize().setLength(this.maxSpeed).sub(this.velocity);
        this.steeringForce.sub(desiredVelocity);
    },

    arrive:function(target)
    {
        var desiredVelocity=target.clone().sub(this.position);
        desiredVelocity.normalize()
        var distance = this.position.distanceTo(target)
        if(distance >  this.arrivalThreshold)
            desiredVelocity.setLength(this.maxSpeed)
        else
            desiredVelocity.setLength(this.maxSpeed*distance/this.arrivalThreshold)
        desiredVelocity.sub(this.velocity);
        this.steeringForce.add(desiredVelocity);
    },

    pursue:function(target)
    {
        var lookAheadTime=this.position.distanceTo(target.position) /this.maxSpeed;
        var predictedTarget = target.position.clone().add(target.velocity.clone().setLength(lookAheadTime));
        this.seek(predictedTarget);
    },

    evade:function(target)
    {
        var lookAheadTime=this.position.distanceTo(target.position) /this.maxSpeed;
        var predictedTarget = target.position.clone().sub(target.velocity.clone().setLength(lookAheadTime));
        this.flee(predictedTarget);
    },

    wander:function() //TODO: specify axis
    {
        var center = this.velocity.clone().normalize().setLength(this.wanderDistance);
        var offset = new THREE.Vector3(1,1,1);
        offset.setLength(this.wanderRadius);
        offset.x=Math.cos(this.wanderAngle)*offset.length()
        offset.z=Math.sin(this.wanderAngle)*offset.length()
        offset.y=Math.sin(this.wanderAngle)*offset.length()
        this.wanderAngle+=Math.random()*this.wanderRange-this.wanderRange*.5;
        center.add(offset)
        this.steeringForce.add(center);
    },


    update:function()
    {
        this.steeringForce.clampLength(0, this.maxForce)
        this.steeringForce.divideScalar(this.mass);
        this.velocity.add(this.steeringForce)
        this.steeringForce.set(0,0,0)
        Entity.prototype.update.call( this );
    }
});










