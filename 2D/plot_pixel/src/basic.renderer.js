(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.BasicRenderer = {}));
}(this, (function (exports) { 'use strict';


        /* ------------------------------------------------------------ */  
    function createBoundingBox( primitive ){
        var vertices = primitive.vertices;
    
        var minimumX = vertices[0][0];
    
        vertices.forEach((point) => {
            if ( point[0] < minimumX ) {
                minimumX = point[0];
            }
        }); 
    
        var maximunX = vertices[0][0];
        
        vertices.forEach((point) => {
            if ( point[0] > maximunX ) {
                maximunX = point[0];
            }
        });
    
        var maximunY = vertices[0][1];
    
        vertices.forEach((point) => {
            if ( point[1] > maximunY ) {
                maximunY = point[1];
            }
        });
    
        var minimumY =  vertices[0][1];
    
        vertices.forEach((point) => {
            if ( point[1] < minimumY ) {
                minimumY = point[1];
            }
        });
    
        var boundingBox = {
            maximunX : maximunX,
            minimumX : minimumX,
            maximunY : maximunY,
            minimumY : minimumY
        }
    
        primitive.boundingBox = boundingBox;
        return primitive;
    }
    
    function createCircleBoundingBox ( primitive ){
        var boundingBox = {
            maximunX : primitive.center.get(0) + primitive.radius,
            minimumX : primitive.center.get(0) - primitive.radius,
            maximunY : primitive.center.get(1) + primitive.radius,
            minimumY : primitive.center.get(1) - primitive.radius
        }

        primitive.boundingBox = boundingBox;
    
        return primitive;
    }

    function checkPixelInBoundingBox(x ,y ,boundingBox){
        if ( x > boundingBox.minimumX && x < boundingBox.maximunX && y < boundingBox.maximunY && y > boundingBox.minimumY){
            return true;
        }
            return false;
    }
    
    function checkPixelInPolygon(x , y , primitive ){
        var vertices = primitive.vertices;
    
        var shapeVectors = [];
    
        vertices.forEach( (vertice, index) => {
            var vector = []
            if (index + 1 < vertices.length ){
                
                vector[0] = vertices[index + 1][0] - vertice[0];
                vector[1] = vertices[index + 1][1] - vertice[1];
    
                shapeVectors.push(vector);
            }
            else{    
                vector[0] = vertices[0][0] - vertice[0];
                vector[1] = vertices[0][1] - vertice[1];
    
                shapeVectors.push(vector);           
            }
        })
    
        var normalVectors = [];
    
        shapeVectors.forEach((vector) =>{
            normalVectors.push([ - vector[1] , vector[0] ]);
        })
    
        var dotVectors = [];
    
        vertices.forEach((vertice) => {
            dotVectors.push([ x - vertice[0] , y - vertice[1]])
        })
    
        var retorno = true;

        dotVectors.forEach((dotVector,index) => {
            if ( (dotVector[0] * normalVectors[index][0] + dotVector[1] * normalVectors[index][1] ) < 0){
                retorno =  false;
            }
        })
        return retorno;
    }

    
    function checkPixelInCircle(x ,y ,primitive ){
        if ((x - primitive.center.get(0))**2 + (y - primitive.center.get(1))**2 > primitive.radius**2){
            return false;
        }
        return true;
    }
       
    function inside(  x, y, primitive  ) {
        switch (primitive.shape){
            case "circle":
                if (checkPixelInBoundingBox(x,y, primitive.boundingBox)){
                    return checkPixelInCircle(x , y , primitive)
                }
            default:
                if (checkPixelInBoundingBox (x,y, primitive.boundingBox)){
                    return checkPixelInPolygon(x , y, primitive);        
                }
        }
    }

    function isReflexiveTriangle(vertices){
        var angle = ((vertices[1][0]-vertices[0][0]) * (vertices[2][1]-vertices[1][1])) - ((vertices[2][0] - vertices[1][0]) * (vertices[1][1] - vertices[0][1]));
        
        if (angle < 0){
            return true;
        }
        return false;
    }

    function removeElementFromArray(element,array){
        var i ;
        for(i=0; i<array.length; i++){
            if(element[0]==array[i][0] && element[1]==array[i][1] ){
                array.splice(i,1)
                return array;
            }
        }
    }
    
    function Screen( width, height, scene ) {
        this.width = width;
        this.height = height;
        this.scene = this.preprocess(scene);   
        this.createImage(); 
    }

    Object.assign( Screen.prototype, {

            preprocess: function(scene) {
                // Possible preprocessing with scene primitives, for now we don't change anything
                // You may define bounding boxes, convert shapes, etc
                
                var preprop_scene = [];

                function earClipping(primitive){
                    var verticesList = primitive.vertices;
                    if (verticesList.length <= 3){
                        preprop_scene.push( createBoundingBox(primitive) );                    
                        return 
                    }

                    verticesList.forEach((vertice,index) => {
                        
                        var triangle;

                        switch(index){
                            case verticesList.length - 1:
                                var triangle = [verticesList[index-1],vertice,verticesList[0]];
                                break;
                            case 0:
                                var triangle = [verticesList[verticesList.length - 1],vertice,verticesList[index+1]];
                                break;
                            default:
                                var triangle = [verticesList[index-1],vertice,verticesList[index+1]];
                                break;
                        }

                        var localPrimitive = {
                            vertices: triangle,
                            color: primitive.color  
                        }

                        var existsVerticeInTriangle = false;
                        for (var polygonVertices of verticesList) {
                            if (triangle.includes(polygonVertices) == false){
                                if (checkPixelInPolygon(polygonVertices[0], polygonVertices[1], localPrimitive)){
                                    existsVerticeInTriangle = true;
                                    break;
                                }
                            }
                        }
                        
                        console.log(triangle);

                        if (existsVerticeInTriangle == false && isReflexiveTriangle(triangle) == false){
                            preprop_scene.push(createBoundingBox(localPrimitive));
                            primitive.vertices = removeElementFromArray(vertice, primitive.vertices);
                            return earClipping(primitive);
                        }
                    })
                }

                for( var primitive of scene ) {

                    if(primitive.shape == "circle"){
                        preprop_scene.push(createCircleBoundingBox(primitive));
                    }
                    else{
                    primitive.vertices = primitive.vertices.tolist();
                    earClipping(primitive);                    
                    }
                }
                return preprop_scene;
            },

            createImage: function() {
                this.image = nj.ones([this.height, this.width, 3]).multiply(255);
            },

            rasterize: function() {
                var color;
         
                // In this loop, the image attribute must be updated after the rasterization procedure.
                for( var primitive of this.scene ) {

                    // Loop through all pixels
                    for (var i = 0; i < this.width; i++) {
                        var x = i + 0.5;
                        for( var j = 0; j < this.height; j++) {
                            var y = j + 0.5;

                            // First, we check if the pixel center is inside the primitive 
                            if ( inside( x, y, primitive ) ) {
                                // only solid colors for now
                                color = primitive.color;
                                this.set_pixel( i, this.height - (j + 1), color );
                            }
                            
                        }
                    }
                }
                
               
              
            },

            set_pixel: function( i, j, colorarr ) {
                // We assume that every shape has solid color
         
                this.image.set(j, i, 0,    colorarr.get(0));
                this.image.set(j, i, 1,    colorarr.get(1));
                this.image.set(j, i, 2,    colorarr.get(2));
            },

            update: function () {
                // Loading HTML element
                var $image = document.getElementById('raster_image');
                $image.width = this.width; $image.height = this.height;

                // Saving the image
                nj.images.save( this.image, $image );
            }
        }
    );

    exports.Screen = Screen;
    
})));

