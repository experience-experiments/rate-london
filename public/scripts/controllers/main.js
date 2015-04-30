'use strict';

/**
 * @ngdoc function
 * @name pixwallApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the pixwallApp
 */
angular.module('pixwallApp')
  .controller('MainCtrl', function ($scope,$timeout,$route,$location) {
   	
   	  
   	  $scope.mouse;
      $scope.presetColors=['#FFC95B','#62A2FF','#8668FF','#FFEE6F','#E88853','#FF5B5E','#D65FE8','#59E8E0','#62FF89','#AEE865'];
      $scope.selectedCategoryIndex = 0;
      $scope.categories=[{color: $scope.presetColors[0],name:""}];
      $location.path("/map/nkfYwizCAG");
	  			      
	  $scope.currentLabel;
	      
	     //FORMAT:
	     /*   [ 
		     	{"area":{"category":"1","path":"M 10 10 L 20 20","color":"#62A2FF"}},
		     	{"text":{"label":"Hipster land","position":{"x":12,"y":45}},
	     		{"pin":{"position":{"x":12,"y":45}}}
		 	 ]
		 */
       $scope.mapData=[];
      

      
       	$scope.onSubmitCategory = function (e){
	      
		      //NEW CATEGORY
		      var newCategory={color: $scope.presetColors[$scope.categories.length],name:$scope.newCategoryName};
		      
		      $scope.categories.push(newCategory);
		      
		      //SELECT NEW CATEGORY:
		      $scope.selectedCategoryIndex=$scope.categories.length-1;
		      
		  }
		  	
		  	//INIT PARSE
	  		Parse.initialize("jWmKfNZKKvQBj3wqu6a5jV4hhrUlWBW6guUGfieT", "oCl7Zy22n7HyCtBooJhQ7aLNMihz6dJTpBcz7XiZ");
	  		var MapData = Parse.Object.extend("MapData");
	  		var AreaData = Parse.Object.extend("Area");
	  		var LabelData = Parse.Object.extend("Label");
	  		var PinData = Parse.Object.extend("Pin");
	  		//var parseMapData = new MapData();
			var parseMapData;
			var query = new Parse.Query(MapData);
			//$location.replace();
			//$route.current.params = {"mapId":"nkfYwizCAG"};

			query.get("nkfYwizCAG", {
			  success: function(mapData) {
			    // The object was retrieved successfully.
			    parseMapData = mapData;
			    
			    //console.log(parseMapData.get("area"));
			    //////////////////////
			   /////////AREAS/////////
			   ///////////////////////
			    var areaMapData = parseMapData.get("area");
			    for(var i in areaMapData){
				    
				     var newArea = createArea(areaMapData[i]["color"]);
				     
				     //newArea.setAttribute("path", );
				     newArea.firstChild.firstChild.setAttribute("d", areaMapData[i]["path"]);						
   			    }
			    
			     //////////////////////
			   /////////PINS/////////
			   ///////////////////////
			    var pinMapData = parseMapData.get("pin");
			    for(var i in pinMapData){
				    
				     var newPin = createPin(pinMapData[i]["position"].x,pinMapData[i]["position"].y);
				        
			    }
			    
			    
			     //////////////////////
			   /////////LABELS/////////
			   ///////////////////////
			    var labelMapData = parseMapData.get("label");
			    for(var i in labelMapData){
				    
				     var newLabel = createLabel(labelMapData[i]["position"].x,labelMapData[i]["position"].y,labelMapData[i]["text"]);
				        
			    }
			    
			    console.log("set location:");

			    
			  },
			  error: function(object, error) {
			    // The object was not retrieved successfully.
			    // error is a Parse.Error with an error code and message.
			  }
			});
	  		
	  		
	  		function saveData(){
		  		//SAVE MAP
				parseMapData.save(null, {
				  success: function(mapData) {
				    // Execute any logic that should take place after the object is saved.
				    console.log('New object created with objectId: ' + mapData.id);
				  },
				  error: function(mapData, error) {
				    console.log("Sorry buddy. Couldn't save your map " + error.message);
				  }
				});

		  		
	  		}
	  		
	  	  		
  	 		
			var mapContainer,map;
			var camera, scene, renderer,zoomFactor = 1;
			var objects;
			var currentBubble,currentArea;
			var raycaster = new THREE.Raycaster();
			var mouse2D = new THREE.Vector2();
			var currentArea,currentColor;
			
			init();
			animate();
  	 	
  	 
			function init() {
				console.log("INIT");
				
				//INIT 3D
				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 15000 );
				camera.position.z = 1000;

				scene = new THREE.Scene();
				scene.autoUpdate = false;
				
				renderer = new THREE.CSS3DRenderer();
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.domElement.style.position = 'absolute';

				
				var i, j;
				var currentPathValues, currentPathPoints =[] ;
				
				//CREATE MAP
				mapContainer = document.getElementById( 'mapContainer' );
				map = document.createElement( 'img' );
				map.src="images/map4000px.jpg";
				map.style.position = "absolute";
				var object = new THREE.CSS3DObject( map );
				scene.add( object );
				map.object=object;
				mapContainer.appendChild( renderer.domElement );
			
				
				//EVENTS 
				window.addEventListener( 'resize', onWindowResize, false );
				mapContainer.addEventListener( 'mousedown', onMouseDown, false );
				mapContainer.addEventListener( 'ondblclick', onDbleClick, false );
				document.addEventListener("keydown", onKeyPressInput);
				window.addEventListener( 'mousemove', onMouseMove, false );

				
				function onDbleClick(e){
					console.log("ondoubleClick");
					
					//CALCULATE 2D POSITION FROM 3D PLANE
					var pos = calculate2DPosition(e);
					currentColor = $scope.categories[$scope.selectedCategoryIndex].color;
					
					//CREATE NEW PIN
					var newPin = createPin(pos.x,pos.y);	
					var newPinData = {"position":pos};
					newPin.data = newPinData;
					parseMapData.addUnique("pin",(newPinData));

					
						
				 };
				
				
				function onMouseDown(e){
					
					//CALCULATE 2D POSITION FROM 3D PLANE
					var pos = calculate2DPosition(e);
					 
					currentColor = $scope.categories[$scope.selectedCategoryIndex].color;
					
					//RESET AREA:
					currentArea = null;
					
					//REINIT LABEL
					//$scope.currentLabel = null;
					
					window.addEventListener( 'mousemove', onMouseDownMove, false );
					window.addEventListener( 'mouseup', onMouseUp, false );

				 };
				 
				 
				 
				 
				function onMouseDownMove(e){
					e.preventDefault();
					 console.log("on mouse move");
					
					//CREATE AN AREA IF WE START TO MOVE 
					if(currentArea==null){					
						currentArea = createArea(currentColor);
						
						var newAreaData = {"color":currentColor,"position":{"x":"0","y":"0"}};
						currentArea.data = newAreaData;
						parseMapData.addUnique("area",(newAreaData));
						
					}else {

						//CALCULATE 2D POSITION FROM 3D PLANE
						var pos = calculate2DPosition(e);
						var currentPathString = addAreaPoint(currentArea,pos);
						
						currentArea.data["path"] = currentPathString;
						
					}
					

				};


				 
				 
				 function onMouseUp(e){
					 
					var pos = calculate2DPosition(e);
					//CREATE PIN IF NO AREA
					
					
					if(currentArea!=null) saveData();	
					 
					 window.removeEventListener( 'mousemove', onMouseDownMove );
					 window.removeEventListener( 'mouseup', onMouseUp );

				 }
				 
				 
				 
				function onMouseMove( e){
					$scope.mouse = calculate2DPosition(e);
				}
				 
				 
				function onKeyPressInput(e){
	      
			      
			      if( $scope.currentLabel==null){	
				         
				         //DON'T DO THAT IF WE'RE ON A TEXT INPUT
						// if(e.target.tagName=="INPUT")return;
						 
				       $scope.currentLabel = createLabel($scope.mouse.x,$scope.mouse.y,String.fromCharCode(e.charcode));
				       //CREATE NEW PARSE LABEL DATA
				       var newLabelData = {"position":$scope.mouse,"text":$scope.currentLabel.value};
					   parseMapData.addUnique("label",newLabelData);
					   $scope.currentLabel.data = newLabelData;
				       
				       
			      }else if(e.keyCode == "13"){
			      	
			      		console.log("save TEXT : "+$scope.currentLabel.value);
			      		
			      		//SAVE DATA
			      		
				       saveData();
			      
			      		//IF PRESS ENTER REMOVE FOCUS
				  		
				      console.log('pressed enter');
				      if($scope.currentLabel)$scope.currentLabel.blur();
				      $scope.currentLabel = null;
				      render();
			      }else{
				      console.log("save new field:"+$scope.currentLabel.value);
				      $scope.currentLabel.data.text = $scope.currentLabel.value;
				      saveData();
			      }
				  
			      
		      	}
				
			}

			
			
			 $(window).on('wheel', function(e){
			 	//console.log('wheeeeee');
		        var eo = e.originalEvent;
		        
		       			        	//ZOOM/PINCH
			         if (eo.ctrlKey) {
				        eo.preventDefault();
				        eo.stopImmediatePropagation();
						
						
						
						 if(!currentBubble){
			        
					        //console.log("PINCH!!");
					        // perform desired zoom action here
					        camera.position.z -= eo.wheelDeltaY* 0.4;
		
							console.log(camera.position.z);
					        if(camera.position.z<500){
					        	camera.position.z =500;
					        }
					        if(camera.position.z>4000){
					        	camera.position.z =4000;
					        }
					        
				        }else {
					        console.log(currentBubble);
					        currentBubble.scale.x += eo.wheelDeltaY* 0.0002;
					        currentBubble.scale.y += eo.wheelDeltaY* 0.0002;
					        
					        
					        //currentBubble.
					        
					        if(currentBubble.scale.x<0.1){
						        
						        currentBubble.scale.x = 0.1;
						        currentBubble.scale.y = 0.1;
					        }
					        
					        
				        }
				        
				        
				    }else {
					    
					    
					    //RESET BUBBLE
					    currentBubble=null;
					   
					   //REINIT LABEL
					   //	if($scope.currentLabel)$scope.currentLabel.blur();						
					   //	$scope.currentLabel = null;
					    
					    //PANNING
						
				        if(Math.abs(eo.wheelDeltaY) < 10 && Math.abs(eo.wheelDeltaX) > 2){
				          e.preventDefault();
	
				          if(eo.wheelDeltaX < -100 && !scope.item.swipedLeft){
				              // swipe left
				              camera.position.x += delta* 10;
				          }
						  
				          if(eo.wheelDeltaX > 100 && scope.item.swipedLeft){
				              // swipe right
				              
				          }
	
				          camera.position.x -= eo.wheelDeltaX* 1;
				          camera.position.y += eo.wheelDeltaY* 1;
				        }else {
				        	camera.position.x -= eo.wheelDeltaX* 1;
				          camera.position.y += eo.wheelDeltaY* 1;
				        }
					}
			  
		      });
			
			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				requestAnimationFrame( animate );
				render();

			}

			function render() {
				
				// update the picking ray with the camera and mouse position	
				raycaster.setFromCamera( mouse2D, camera );	
			
				// calculate objects intersecting the picking ray
				var intersects = raycaster.intersectObjects( scene.children );

				scene.updateMatrixWorld();
				scene.traverse( function ( object ) {

					if ( object instanceof THREE.LOD ) {

						object.update( camera );

					}

				} );

				renderer.render( scene, camera );

			}
			
			
			
			
			
			
			
			
			
			///////////// CREATE OBJECTS /////////////
  	 		function createLabel(x,y,text){
	  	 		console.log("create label "+x+" "+y);
	  	 		
	  	 		var newLabel = document.createElement( 'input' );
	  	 		newLabel.type="text";
	  	 		newLabel.value	= text;	
	  	 		
	  	 		newLabel.className = 'textLabel';	  	 		
				var object = new THREE.CSS3DObject( newLabel );
				scene.add( object );
				
				//Render here so we can focus
				render();
				newLabel.focus();
				
	  	 		object.position.x = x;
				object.position.y = y;
				object.position.z = 100;
				
				
				
	  	 		return newLabel;
	  	 		
  	 		}
  	 		
  	 		
				
  	 		function createPin(x,y){
	  	 		console.log("create Pin "+x+" "+y);
	  	 		
	  	 		var newPin = document.createElement( 'img' );						
				newPin.setAttribute("src", "images/redPointer.png");
				newPin.setAttribute("width", 50);
				
				var object = new THREE.CSS3DObject( newPin );
				scene.add( object );
								
	  	 		object.position.x = x;
				object.position.y = y+35;
				object.position.z = 10;
				
								
	  	 		return newPin;
	  	 		
  	 		}
  	 		
  	 		function createArea(color){
	  	 		
	  	 		//CREATE NEW AREA WITH FIRST PRESET COLOR
	  	 		var newArea = document.createElement( 'div' );
				newArea.innerHTML='<svg width="'+map.width+'" height="'+map.height+'"><path  fill="'+color+'" /></svg>';
				newArea.className = 'area';	 

				//INIT ARRAY OF POINTS
				newArea.points = [];
				
				var object = new THREE.CSS3DObject( newArea );
				scene.add( object );
				
	  	 		object.position.x = 0;
				object.position.y = 0;
				object.position.z = 0.1;
				
				
				
				return newArea;
	  	 		
  	 		}
  	 		
				  	 		
  	 		
  	 		function createBubble(x,y,color){
	  	 		console.log("create bubble "+x+" "+y);
	  	 		
	  	 		 	  	 		
	  	 		var newBubble = document.createElement( 'div' );
	  	 		
		  	 	newBubble.innerHTML='<svg><circle cx="50" cy="50" r="40" stroke="black" stroke-width="2" fill="'+color+'" /></svg>';		
		  	
	  	 		newBubble.className = 'bubble';	  
				var object = new THREE.CSS3DObject( newBubble );
				scene.add( object );
				
	  	 		object.position.x = x;
				object.position.y = y;
				object.position.z = 1;
	  	 		
	  	 		currentBubble = object;
	  	 		
  	 		}
  	 		
			
			
			
			
				 		
  	 		function addAreaPoint(area,point){
	  	 		
	  	 		//console.log(pos);
				area.points.push(point);
				
				var simplifiedPoints = simplify(area.points, 4, false);
				
				return updateArea(area,simplifiedPoints);
				
				
  	 		}
  	 		
  	 		
  	 		function updateArea(area,points){
	  	 		
	  	 		
				//RECALCULATE PATH FOR SVG
				var currentPathString = [];
				for(var i=0;i<points.length;i++){
					var currentPoint = points[i];
					//FIRST TIME WE MOVE THE PATH TO POSITION
					if(i==0){
						currentPathString = "M "+parseInt(map.width/2+currentPoint.x)+" "+parseInt(map.height/2-currentPoint.y)+" ";
					}
					
					currentPathString+="L "+parseInt(map.width/2+currentPoint.x)+" "+parseInt(map.height/2-currentPoint.y)+" ";
					
				}
				//CLOSE PATH
				currentPathString += "Z";	
				
				currentArea.firstChild.firstChild.setAttribute("d", currentPathString);						
				
				return currentPathString;
	  	 		
  	 		}
  	 		
  	 		
  	 		
 
  	 		

			
			
			
			
			//UTILS 
			
  	 		function calculate2DPosition(e){
					
					var vector = new THREE.Vector3();
					vector.set( ( e.clientX / window.innerWidth ) * 2 - 1,  - ( e.clientY / window.innerHeight ) * 2 + 1,    0.5 );
					vector.unproject( camera );
					var dir = vector.sub( camera.position ).normalize();
					var distance = - camera.position.z / dir.z;
					var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
					return pos;
				}
  	 		
			function getPosition(element) {
			    var xPosition = 0;
			    var yPosition = 0;
			      
			    while (element) {
			        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
			        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
			        element = element.offsetParent;
			    }
			    return { x: xPosition, y: yPosition };
			}
  	 		
  	 				
  	 
  	 
  	 
  	 
  //CONNECT USER
  /*$scope.currentUser = Parse.User.current();
 
  $scope.signUp = function(form) {
    var user = new Parse.User();
    user.set("email", form.email);
    user.set("username", form.username);
    user.set("password", form.password);
 
    user.signUp(null, {
      success: function(user) {
        $scope.currentUser = user;
        $scope.$apply(); // Notify AngularJS to sync currentUser
      },
      error: function(user, error) {
        alert("Unable to sign up:  " + error.code + " " + error.message);
      }
    });    
  };
 
  $scope.logOut = function(form) {
    Parse.User.logOut();
    $scope.currentUser = null;
  };*/
  
  
  
  /////IMAGE UPLOAD STUFF
  /*
  var holder = document.getElementById('holder')
    
  holder.ondragover = function () { this.className = 'hover'; return false; };
  holder.ondragend = function () { this.className = ''; return false; };
  holder.ondrop = function (e) {
	 
	  e.preventDefault();
	
	  var file = e.dataTransfer.files[0],
	      reader = new FileReader();
	  reader.onload = function (event) {
	    console.log(event.target);
	    holder.style.background = 'url(' + event.target.result + ') no-repeat center';
	  };
	  console.log(file);
	  reader.readAsDataURL(file);
	
	  return false;
	};
    
    $scope.onChangeFile = function(){
	    console.log("change file");
	   
	    var fileUploadControl = $("#profilePhotoFileUpload")[0];
	     console.log(fileUploadControl.files);
		if (fileUploadControl.files.length > 0) {
		  var file = fileUploadControl.files[0];
		  //var name = "photo.jpg";
		 
		}
		
		  var fileReader = new FileReader();
	      fileReader.readAsDataURL(file);
	      fileReader.onload = function(e) {
	        $timeout(function() {
	          $scope.fileDataURL = e.target.result;
	          console.log($scope.fileDataURL);
	          $scope.$apply();
	        });
	      }
		
		
		
		$scope.file = file;
    }
    
    */

  });
  
  
  
  
  angular.module('pixwallApp').directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
  
