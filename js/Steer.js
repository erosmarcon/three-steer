
EntityHelper = function (entity) {

    THREE.Group.apply(this);

    this.entity=entity;

    this.forward = new THREE.ArrowHelper(this.entity.forward, this.entity.position, 300, 0xFF0000)
    this.backward = new THREE.ArrowHelper(this.entity.backward, this.entity.position, 300, 0x0000FF)
    this.left = new THREE.ArrowHelper(this.entity.left, this.entity.position, 300, 0x0000FF)
    this.right = new THREE.ArrowHelper(this.entity.right, this.entity.position, 300, 0x0000FF)
    this.velocity = new THREE.ArrowHelper(this.entity.velocity.clone().normalize(), this.entity.position, 10, 0x00FF00)
    this.force = new THREE.ArrowHelper(this.entity.steeringForce.clone().normalize(), this.entity.position, 10, 0xFF0000)
    this.raycaster=new THREE.ArrowHelper(this.entity.forward, this.entity.position, 400, 0x000000)


    var geometry=new THREE.SphereGeometry(6)
    var material =new THREE.MeshBasicMaterial({ color: 0xFFFFFF})
    this.center=new THREE.Mesh(geometry, material)
    this.add(this.center)

    //this.add(this.forward)
    //this.add(this.backward)
    //this.add(this.left)
    //this.add(this.right)
    this.add(this.force)
    this.add(this.velocity)
    //this.add(this.raycaster)

}

EntityHelper.prototype = Object.assign(Object.create(THREE.Group.prototype), {
    constructor: EntityHelper,

    update: function () {

        this.position.set(this.entity.position.x, this.entity.position.y, this.entity.position.z);

        if(this.entity.velocity && this.entity.velocity.length())
        {
            this.velocity.setDirection(this.entity.velocity.clone().normalize())
            this.velocity.setLength(this.entity.velocity.length()*20)
        }

        if(this.entity.steeringForce && this.entity.steeringForce.length())
        {
            this.force.setDirection(this.entity.steeringForce.clone().normalize())
            this.force.setLength(this.entity.steeringForce.length()*20)
        }

        if(this.entity.raycaster )
        {
            this.raycaster.setDirection(this.entity.raycaster.ray.direction)
            this.raycaster.setLength(this.entity.avoidDistance)
        }
    }
});


Entity = function (mesh) {

    THREE.Group.apply(this);

    this.mesh=mesh;
    this.mass = 1;
    this.maxSpeed = 25;

    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);

    this.box = new THREE.Box3().setFromObject(mesh);
    this.raycaster=new THREE.Raycaster();

    this.velocitySamples=[]
    this.numSamplesForSmoothing=20

    Object.defineProperty(Entity.prototype, 'width', {
        enumerable: true,
        configurable: true,
        get: function () {
            return (this.box.max.x - this.box.min.x)
        }

    });

    Object.defineProperty(Entity.prototype, 'height', {
        enumerable: true,
        configurable: true,
        get: function () {
            return (this.box.max.y - this.box.min.y)
        }

    });

    Object.defineProperty(Entity.prototype, 'depth', {
        enumerable: true,
        configurable: true,
        get: function () {
            return (this.box.max.z - this.box.min.z)
        }

    });

    Object.defineProperty(Entity.prototype, 'forward', {
        enumerable: true,
        configurable: true,
        get: function () {
            return new THREE.Vector3(0, 0, -1).applyQuaternion(this.quaternion).negate()
        }

    });

    Object.defineProperty(Entity.prototype, 'backward', {
        enumerable: true,
        configurable: true,
        get: function () {
            return this.forward.clone().negate()
        }

    });

    Object.defineProperty(Entity.prototype, 'left', {
        enumerable: true,
        configurable: true,
        get: function () {
            return this.forward.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5)
        }

    });

    Object.defineProperty(Entity.prototype, 'right', {
        enumerable: true,
        configurable: true,
        get: function () {
            return this.left.clone().negate()
        }

    });

    this.add(this.mesh)

    this.radius=200 //temp

}

Entity.prototype = Object.assign(Object.create(THREE.Group.prototype), {
    constructor: Entity,

    update: function () {
        this.velocity.clampLength(0, this.maxSpeed)
        this.velocity.setY(0);
        this.position.add(this.velocity)
    },



    bounce:function(box)
    {

        if(this.position.x> box.max.x)
        {
            this.position.setX(box.max.x);
            this.velocity.angle=this.velocity.angle+.1
        }

        if(this.position.x< box.min.x)
        {
            this.position.setX(box.min.x);
            this.velocity.angle=this.velocity.angle+.1
        }

        if(this.position.z> box.max.z)
        {
            this.position.setZ(box.max.z);
            this.velocity.angle=this.velocity.angle+.1
        }
        if(this.position.z< box.min.z)
        {
            this.position.setZ(box.min.z);
            this.velocity.angle=this.velocity.angle+.1
        }

        if(this.position.y> box.max.y)
        {
            this.position.setY(box.max.y);
        }

        if(this.position.y<box.min.y)
        {
            this.position.setY(-box.min.y);
        }
    },

    wrap:function(box)
    {
        if(this.position.x> box.max.x)
        {
            this.position.setX(box.min.x+1);
        }

        else if(this.position.x< box.min.x)
        {
            this.position.setX(box.max.x-1);
        }

        if(this.position.z> box.max.z)
        {
            this.position.setZ(box.min.z+1);

        }
        else if(this.position.z< box.min.z)
        {
            this.position.setZ(box.max.z-1);
        }

        if(this.position.y> box.max.y)
        {
            this.position.setY(box.min.y+1);
        }

        else if(this.position.y<box.min.y)
        {
            this.position.setY(box.max.y+1);
        }
    },


    lookWhereGoing:function(smoothing) {
        var direction = this.position.clone().add(this.velocity).setY(this.position.y)
        if (smoothing) {
            if (this.velocitySamples.length == this.numSamplesForSmoothing) {
                this.velocitySamples.shift();
            }

            this.velocitySamples.push (this.velocity.clone().setY(this.position.y));
            direction.set(0,0,0);
            for (var v=0;v<this.velocitySamples.length;v++) {
                direction.add(this.velocitySamples[v])
            }
            direction.divideScalar(this.velocitySamples.length)
            direction=this.position.clone().add(direction).setY(this.position.y)
        }
        this.lookAt(direction)
    }
});

SteeringEntity = function (mesh) {

    Entity.call(this, mesh);

    this.maxForce = 5;
    this.arrivalThreshold = 400;

    this.wanderAngle = 0
    this.wanderDistance = 10;
    this.wanderRadius = 5;
    this.wanderRange = 1;

    this.avoidDistance = 400
    this.avoidBuffer=20; //NOT USED
    this.steeringForce = new THREE.Vector3(0, 0, 0);
}

SteeringEntity.prototype = Object.assign(Object.create(Entity.prototype), {

    constructor: SteeringEntity,

    seek: function (position) {
        var desiredVelocity = position.clone().sub(this.position);
        desiredVelocity.normalize().setLength(this.maxSpeed).sub(this.velocity);
        this.steeringForce.add(desiredVelocity);
    },

    flee: function (position) {
        var desiredVelocity = position.clone().sub(this.position);
        desiredVelocity.normalize().setLength(this.maxSpeed).sub(this.velocity);
        this.steeringForce.sub(desiredVelocity);
    },

    arrive: function (target) {
        var desiredVelocity = target.clone().sub(this.position);
        desiredVelocity.normalize()
        var distance = this.position.distanceTo(target)
        if (distance > this.arrivalThreshold)
            desiredVelocity.setLength(this.maxSpeed);
        else
            desiredVelocity.setLength(this.maxSpeed * distance / this.arrivalThreshold)
        desiredVelocity.sub(this.velocity);
        this.steeringForce.add(desiredVelocity);
    },

    pursue: function (target) {
        var lookAheadTime = this.position.distanceTo(target.position) / this.maxSpeed;
        var predictedTarget = target.position.clone().add(target.velocity.clone().setLength(lookAheadTime));
        this.seek(predictedTarget);
    },

    evade: function (target) {
        var lookAheadTime = this.position.distanceTo(target.position) / this.maxSpeed;
        var predictedTarget = target.position.clone().sub(target.velocity.clone().setLength(lookAheadTime));
        this.flee(predictedTarget);
    },

    idle:function()
    {
        this.velocity.setLength(0)
        this.steeringForce.set(0,0,0);
    },


    wander: function ()
    {
        var center = this.velocity.clone().normalize().setLength(this.wanderDistance);
        /*if(this.helper)
         this.helper.center.position.set(center.x, center.y, center.z)*/

        var offset = new THREE.Vector3(1, 1, 1);
        offset.setLength(this.wanderRadius);
        offset.x = Math.sin(this.wanderAngle) * offset.length()
        offset.z = Math.cos(this.wanderAngle) * offset.length()
        offset.y = Math.sin(this.wanderAngle) * offset.length()

        this.wanderAngle += Math.random() * this.wanderRange - this.wanderRange * .5;
        center.add(offset)
        center.setY(0)
        this.steeringForce.add(center);
    },

    interpose:function(targetA, targetB)
    {
            var midPoint=targetA.position.clone().add(targetB.position.clone()).divideScalar(2);
            var timeToMidPoint = this.position.distanceTo(midPoint) / this.maxSpeed;
            var pointA=targetA.position.clone().add(targetA.velocity.clone().multiplyScalar(timeToMidPoint))
            var pointB=targetB.position.clone().add(targetB.velocity.clone().multiplyScalar(timeToMidPoint))
            midPoint = pointA.add( pointB ).divideScalar(2);
            this.seek(midPoint)
    },


    avoid:function(obstacles)
    {
        var dynamic_length =this.velocity.length()/this.maxSpeed;
        var ahead=this.position.clone().add(this.velocity.clone().normalize().multiplyScalar(dynamic_length))
        var ahead2=this.position.clone().add(this.velocity.clone().normalize().multiplyScalar(this.avoidDistance*.5));
        //get most threatening
        var mostThreatening=null;
        for(var i=0;i<obstacles.length;i++) //use radius???
        {
            if(obstacles[i]===this)
                continue;
            var collision=obstacles[i].position.distanceTo(ahead) <=obstacles[i].radius || obstacles[i].position.distanceTo(ahead2)<=obstacles[i].radius
            if (collision && (mostThreatening == null || this.position.distanceTo( obstacles[i].position) <  this.position.distanceTo( mostThreatening.position))){
                mostThreatening = obstacles[i];
            }
        }
        //end
        var avoidance=new THREE.Vector3(0,0,0)
        if(mostThreatening!=null)
        {
            avoidance=ahead.clone().sub(mostThreatening.position).normalize().multiplyScalar(100)
        }
        this.steeringForce.add(avoidance);
    },

    update: function () {
        this.steeringForce.clampLength(0, this.maxForce);
        this.steeringForce.divideScalar(this.mass);
        this.velocity.add(this.steeringForce);
        this.steeringForce.set(0, 0, 0);
        Entity.prototype.update.call(this);
    }
});


/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
Math.getRandomArbitrary=function(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
Math.getRandomInt=function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

THREE.Vector3.prototype.perp=function()
{
    return new THREE.Vector3(-this.z, 0, this.x)
}

THREE.Vector3.prototype.sign=function(vector)
{
    return this.perp().dot(vector) <0 ? -1: 1
}


Object.defineProperty(THREE.Vector3.prototype, 'angle', {
    enumerable: true,
    configurable: true,
    get: function () {
        return Math.atan2(this.z, this.x)
    },

    set: function (value) {
        this.x = Math.cos(value) * this.length()
        this.z = Math.sin(value) * this.length()
    }

});










