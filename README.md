# ThreeSteer

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
            camera.position.set(0, 0, 1500);
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

Currently the library only moves objects in the x/z direction.