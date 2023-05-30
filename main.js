import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.151.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.151.0/examples/jsm/loaders/GLTFLoader.js';

// Scene
const scene = new THREE.Scene();

//Load Background Texture
const textureLoader = new THREE.TextureLoader();
textureLoader.load('background/krusty.jpg' , function(texture)
            {
             scene.background = texture;  
            });

// Camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Set camera position
camera.position.z = 100;

// Load Mr. Krabs
const loader = new GLTFLoader();
let mixer;
let model;
let model2;

loader.load( 'models/mrkrabs/scene.gltf', function ( gltf ) {
    model = gltf.scene;
    const clips = gltf.animations;

    mixer = new THREE.AnimationMixer(model);
    const takeClip = THREE.AnimationClip.findByName(clips, 'Take 001');
    const takeAction = mixer.clipAction(takeClip);
    takeAction.play();

    model.position.setX(0);
    model.position.setY(-400);
    model.position.setZ(-750);

	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

// Lighting
const light = new THREE.DirectionalLight( 0xffffff, 3.5 ); // soft white light

light.position.setX(0);
light.position.setY(100);
light.position.setZ(1000);
scene.add( light );

// Clock
const clock = new THREE.Clock()

// Resize Window Event Listener
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

let rotationDirection = "right";
let positionX = 0;

// Audio Setup
const listener = new THREE.AudioListener();
camera.add( listener );

const sound = new THREE.Audio( listener );

const audioLoader = new THREE.AudioLoader();
audioLoader.load( 'audio/krab.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
	sound.play();
});

// Keydown Controls
function setupKeyControls() {
    document.onkeydown = function(e) {
        switch(e.keyCode) {
            case 38: // Up Arrow Key
                break;
            case 40: // Down Arrow Key
                break;
            case 37: // Left Arrow Key
                if (positionX > -window.innerWidth/2) {
                    positionX -= 10;
                    model.position.setX(positionX);
                }
                break
            case 39: // Right Arrow Key
                if (positionX < window.innerWidth/2) {
                    positionX += 10;
                    model.position.setX(positionX);
                }
                break;
        }
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }

const delay = ms => new Promise(res => setTimeout(res, ms));
let meshArray = [];

// Generate patties function
async function generatePatties() {
    while(true) {
        loader.load( 'models/burger/scene.gltf', function ( gltf2 ) {
            model2 = gltf2.scene;
        
            model2.position.setX(getRandomInt(-window.innerWidth/2, window.innerWidth/2));
            model2.position.setY(window.innerHeight);
            model2.position.setZ(-900);
        
            model2.scale.set(100, 100, 100);

            scene.add( gltf2.scene );
        
        }, undefined, function ( error ) {
        
            console.error( error );
        
        } );

        await delay(2000);

        meshArray.push(model2);

    }
}

// Score
let score = 0;

// Animate Function
function animate() {
	requestAnimationFrame( animate );

    if (model) {
        if (model.rotation.y >= 0.5) {
            rotationDirection = "left";
        }
        else if (model.rotation.y <= -0.5) {
            rotationDirection = "right";
        }

        if (rotationDirection == "right") {
            model.rotation.y += 0.015;
        }
        else {
            model.rotation.y -= 0.015;
        }


        for (var i = 0; i<meshArray.length; i++) {
            if (meshArray[i]) {
                meshArray[i].position.setY(meshArray[i].position.y - 1); 
                
                // Delete if out of range
                if (meshArray[i].position.y <= -window.innerHeight) {
                    scene.remove(meshArray[i]);
                    meshArray.splice(i, 1);
                }

                // Add score if in range
                else if (meshArray[i].position.y <= -200) {
                    const distance = Math.abs(meshArray[i].position.x - model.position.x);

                    if (distance <= 100) {
                        score++;

                        var element = document.getElementById("info");

                        if (element) {
                            element.innerHTML = "Score: " + score;
                        }

                        scene.remove(meshArray[i]);
                        meshArray.splice(i, 1);
                    }
                }
            }
        }
        
    }

    if (mixer) {
        mixer.update(clock.getDelta());
    }

    setupKeyControls();

	render();
}

generatePatties();

// Render Function
function render() {
    renderer.render(scene, camera)
}

// Animate Function Call
animate();