

function JumpingJackAnimation() {}

Object.assign(JumpingJackAnimation.prototype, {

    init(){
        let upperArmTween = new TWEEN.Tween({theta:0})
            .to({theta:[0,degreeToRad(100),0]},1500)
            .onUpdate(function(){
                let right_upper_arm = ( (robot.getObjectByName("right_upper_arm")) )
                let left_upper_arm = ( (robot.getObjectByName("left_upper_arm")) )
                let rotation_point_right = new THREE.Vector3
                    (
                        ( right_upper_arm.geometry.parameters.width + right_upper_arm.__position.x) / 2,
                        ( right_upper_arm.geometry.parameters.height + right_upper_arm.__position.y) / 2,
                        -2
                    );
                let rotation_point_left = new THREE.Vector3
                    (
                        (left_upper_arm.__position.x - (( left_upper_arm.geometry.parameters.width + left_upper_arm.__position.x) / 2)),
                        ( left_upper_arm.geometry.parameters.height + left_upper_arm.__position.y) / 2,
                        -2
                    );

                let angle = this._object.theta - right_upper_arm.rotation.z
                right_upper_arm.rotateAroundPoint( rotation_point_right, angle );
                left_upper_arm.rotateAroundPoint( rotation_point_left, angle*-1 );

                stats.update();
                renderer.render(scene, camera);
            })

        let lowerArmTween = new TWEEN.Tween({theta:degreeToRad(0)})
            .to({theta:[0,degreeToRad(120), 0]},1500)
            .onUpdate(function() {
                let right_lower_arm = ( (robot.getObjectByName("right_upper_arm")).getObjectByName("lower_arm") );
                let left_lower_arm = ( (robot.getObjectByName("left_upper_arm")).getObjectByName("lower_arm") );
                let rotation_point = new THREE.Vector3
                (
                    ( 0) / 2,
                    ( right_lower_arm.__position.y  ) / 1.5,
                    0
                );

                let angle = this._object.theta - right_lower_arm.rotation.z
                right_lower_arm.rotateAroundPoint( rotation_point, angle );
                left_lower_arm.rotateAroundPoint( rotation_point, angle*-1 );
                stats.update();
                renderer.render(scene, camera);
            })

        let handTween = new TWEEN.Tween({theta:degreeToRad(0)})
            .to({theta:[degreeToRad(110), 0]},1500)
            .onUpdate(function() {
                let right_hand = ( (robot.getObjectByName("right_upper_arm")).getObjectByName("lower_arm").getObjectByName("hand") );
                let left_hand = ( (robot.getObjectByName("left_upper_arm")).getObjectByName("lower_arm").getObjectByName("hand") );
                let rotation_point = new THREE.Vector3
                (
                    (0) / 2,
                    (right_hand.__position.y  ) / 1.5,
                    0
                );
                let angle = this._object.theta - right_hand.rotation.z
                right_hand.rotateAroundPoint( rotation_point, angle );
                left_hand.rotateAroundPoint( rotation_point, angle*-1 );
                stats.update();
                renderer.render(scene, camera);
            })

        let legsTween = new TWEEN.Tween({theta:0})
            .to({theta:[0,degreeToRad(40),0]},1500)
            .onUpdate(function(){
                let left_upper_leg = ( (robot.getObjectByName("left_upper_leg")) )
                let right_upper_leg = ( (robot.getObjectByName("right_upper_leg")) )

                let rotation_point_right = new THREE.Vector3
                    (
                        ( right_upper_leg.geometry.parameters.width + right_upper_leg.__position.x) / 2,
                        ( right_upper_leg.geometry.parameters.height + right_upper_leg.__position.y) / 2,
                        -2
                    );
                let rotation_point_left = new THREE.Vector3
                    (
                        (left_upper_leg.__position.x - (( left_upper_leg.geometry.parameters.width + left_upper_leg.__position.x) / 2)),
                        ( left_upper_leg.geometry.parameters.height + left_upper_leg.__position.y) / 2,
                        -2
                    );

                let angle = this._object.theta - right_upper_leg.rotation.z
                right_upper_leg.rotateAroundPoint( rotation_point_right, angle );
                left_upper_leg.rotateAroundPoint( rotation_point_left, angle*-1 );
                stats.update();
                renderer.render(scene, camera);

            })

        let torsoTween = new TWEEN.Tween({height:0})
            .to({height:[0,2,0]},1500)
            .onUpdate(function(){
                let torso = ( (robot.getObjectByName("torso")) )
                torso.position.y=this._object.height
                stats.update();
                renderer.render(scene, camera);    
            })

        torsoTween.start()
        upperArmTween.start()       
        lowerArmTween.start()
        handTween.start()
        legsTween.start()
    },
    animate(time){
        window.requestAnimationFrame(this.animate.bind(this));
        TWEEN.update(time);
    },
    run(){
        this.init();
        this.animate(0);
    }
    
});