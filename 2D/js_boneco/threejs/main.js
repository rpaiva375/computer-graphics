
THREE.Object3D.prototype.savePosition = function() {
    return function () {
        this.__position = this.position.clone(); 
        
        return this;
    }
}();

THREE.Object3D.prototype.rotateAroundPoint = function() {
    return function (point, theta, pointIsWorld = false, axis = new THREE.Vector3(0, 0, 1)) {

        if(pointIsWorld){
            this.parent.localToWorld(this.position);
        }
    
        this.position.sub(point);
        this.position.applyAxisAngle(axis, theta);
        this.position.add(point);
    
        if(pointIsWorld){
            this.parent.worldToLocal(this.position);
        }
    
        this.rotateOnAxis(axis, theta);

        return this;
    }

}();


var camera, scene, renderer;
var stats;
var robot;



function init() {
    var width = 40;
    var height = 22;
    camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0, 2 );
    camera.lookAt( 0, 0, -1);
    camera.position.z = 1;

    scene = new THREE.Scene();
    robot = gen_robot();
    scene.add(robot);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    window.addEventListener('resize', onWindowResize, false);
    renderer.setSize(window.innerWidth, window.innerHeight);

    stats = new Stats();
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(stats.dom);

    document.addEventListener("keydown", onDocumentKeyDown, false);

    scene.traverse( function( node ) {
        if ( node instanceof THREE.Object3D ) {
            node.savePosition();
        }

    } );

    stats.update();
    renderer.render(scene, camera);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
}

function onDocumentKeyDown(event) {
    animations = {
        1 : WaveAnimation,
        2 : JumpingJackAnimation,
        3 : StrongBIRLAnimation
    }
    key = parseInt(event.key)
    if (key >= 1 && key <= Object.keys(animations).length){
        animation = new animations[event.key]();
        animation.run()
    }
}
function degreeToRad(degrees) {
    return degrees * Math.PI/180
}

init();