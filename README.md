# ThreeSteer

<p align="center">
  <img src="https://github.com/erosmarcon/three-steer/blob/master/images/screenshots/ThreeSteer-shot-1.png"/>
</p>


## What is
A basic steering behaviors library based on THREE.js.
The term 'Steering Behaviors' refers to a set of common AI movement algorithms and was coined by [Craig Reynolds](https://en.wikipedia.org/wiki/Craig_Reynolds_(computer_graphics)) in a [paper](http://www.red3d.com/cwr/papers/1999/gdc99steer.html) published in 1999.


## How to setup

Include THREE.js library and ThreeSteer:

    <script src="libs/three.min.js"></script>
    <script src="js/ThreeSteer.js"></script>


Create a basic 3D scene:

    <script>
        var container;
        var camera;
        var scene, renderer;

        function init(element){
            container= document.getElementById(element);
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000);
            scene = new THREE.Scene();
            renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);
            camera.position.set(0, 3000, 3000;
            camera.lookAt(new THREE.Vector3(0,0,0))
            animate();
        }

        function animate(){
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
    </script>

    <body onload="init('container')">
        <div id="container"></div>
    </body>

## How to use

Simply instantiate and add to the scene SteeringEntities.
SteeringEntity is only an empty container with the motion logic, you need to pass a visible Object3D to the constructor to see it in action:


    var geometry = new THREE.BoxGeometry( 100, 200, 50 );
    var material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, wireframe: true } );
    var mesh = new THREE.Mesh(geometry, material);

    entity = new SteeringEntity(mesh);
    scene.add(entity);


Call the behavior/s and the update method inside main render/animation loop. Eg:

    function animate(){
        requestAnimationFrame(animate);
        entity.seek(point);
        entity.lookWhereGoing(true);
        entity.update();
        renderer.render(scene, camera);
    }

Supported Behaviors are:

* Seek
* Flee
* Arrive
* Pursue
* Evade
* Interpose
* Wander
* Collision Avoidance
* Follow Path
* Follow Leader
* Cohesion, separation and alignment (Flocking)


Currently the library only moves objects in the x/z direction.


## Examples

[Let's see action!](http://www.uxvision.it/projects/ThreeSteer/examples/index.html)