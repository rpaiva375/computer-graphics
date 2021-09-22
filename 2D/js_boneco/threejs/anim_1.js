function WaveAnimation() {}

Object.assign(WaveAnimation.prototype, {

    init(){
        let upperArmForwardTween = new TWEEN.Tween({theta:0})
            .to({theta:degreeToRad(95)},500)
            .onUpdate(function(){
                let right_upper_arm = ( (robot.getObjectByName("right_upper_arm")) )
                let rotation_point = new THREE.Vector3
                    (
                        ( right_upper_arm.geometry.parameters.width + right_upper_arm.__position.x) / 2,
                        ( right_upper_arm.geometry.parameters.height + right_upper_arm.__position.y) / 2,
                        -1
                    );
    
                right_upper_arm.rotateAroundPoint( rotation_point, this._object.theta - right_upper_arm.rotation.z );
    
                stats.update();
                renderer.render(scene, camera);    
            })
    
        let lowerArmTween = new TWEEN.Tween({theta:degreeToRad(0)})
            .to({theta:[degreeToRad(110), 0]},1200)
            .onUpdate(function() {
                let right_lower_arm = ( (robot.getObjectByName("right_upper_arm")).getObjectByName("lower_arm") );
                let rotation_point = new THREE.Vector3
                (
                    (0) / 2,
                    (right_lower_arm.__position.y  ) / 1.5,
                    0
                );
                right_lower_arm.rotateAroundPoint( rotation_point, this._object.theta - right_lower_arm.rotation.z );
                stats.update();
                renderer.render(scene, camera);
            })

        let handTween = new TWEEN.Tween({theta:degreeToRad(0)})
            .to({theta:[degreeToRad(110), 0]},800)
            .onUpdate(function() {
                let right_hand = ( (robot.getObjectByName("right_upper_arm")).getObjectByName("lower_arm").getObjectByName("hand") );
                let rotation_point = new THREE.Vector3
                (
                    (0) / 2,
                    (right_hand.__position.y  ) / 1.5,
                    0
                );
                right_hand.rotateAroundPoint( rotation_point, this._object.theta - right_hand.rotation.z );
                stats.update();
                renderer.render(scene, camera);
            })
        
        let upperArmBackwardTween = new TWEEN.Tween({theta:degreeToRad(120)})
            .to({theta:0},500)
            .onUpdate(function(){
                let right_upper_arm = ( (robot.getObjectByName("right_upper_arm")) )
                let rotation_point = new THREE.Vector3
                    (
                        ( right_upper_arm.geometry.parameters.width + right_upper_arm.__position.x) / 2,
                        ( right_upper_arm.geometry.parameters.height + right_upper_arm.__position.y) / 2,
                        -1
                    );
    
                right_upper_arm.rotateAroundPoint( rotation_point, this._object.theta - right_upper_arm.rotation.z );
    
                stats.update();
                renderer.render(scene, camera);    
            })
            
    
        upperArmForwardTween.chain(lowerArmTween, handTween)
        lowerArmTween.chain(upperArmBackwardTween)
        upperArmForwardTween.start()
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