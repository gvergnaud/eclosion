UI.storyTelling = (function(){
	'use strict';

	var View = {

		start : function(){
		
			// Set the attributes of circles, line and Text
			var circles = document.querySelectorAll("circle");
			for(var i = 0; i < circles.length; i++){
				circles[i].setAttribute("cx", window.innerWidth / 2);
			}
			
			var randomCircle = document.querySelectorAll("#randomCircle>circle");
			for(var i = 0; i < randomCircle.length; i ++){
				randomCircle[i].setAttribute("cy", window.innerHeight + 10);
			}
			
			document.querySelector("#storyTelling line").setAttribute("x1", window.innerWidth / 2);
			document.querySelector("#storyTelling line").setAttribute("x2", window.innerWidth / 2);
			document.querySelector("#storyTelling line").setAttribute("y1", -(window.innerHeight));
			document.querySelector("#storyTelling line").setAttribute("y1", 0);
			
			var text = document.querySelectorAll(".phrase");
        	for(var i = 0; i < text.length; i++){
	        	var self = this;
	        	text[i].setAttribute("transform", "translate(" + ((window.innerWidth / 2) - (text[i]
        		.clientWidth / 2)) + "," + 85 * window.innerHeight / 100 + ")");
        	}
        	
        	var beginning = document.querySelectorAll(".words")[0];
        	var firstEnd = document.querySelectorAll(".word")[0];
        	var secondEnd = document.querySelectorAll(".word")[1];
        	var sizeTotal = beginning.clientWidth + firstEnd.clientWidth;
        	
        	beginning.setAttribute("transform", "translate("+ ((window.innerWidth / 2) - (sizeTotal / 2)) + "," + 85 * window.innerHeight / 100 +")");
        	firstEnd.setAttribute("transform", "translate("+ (((window.innerWidth / 2) - (sizeTotal / 2)) + beginning.clientWidth + 10)
        		+ "," + 85 * window.innerHeight / 100 +")");
        	secondEnd.setAttribute("transform", "translate("+ (((window.innerWidth / 2) - (sizeTotal / 2)) + beginning.clientWidth + 10)
        		+ "," + 85 * window.innerHeight / 100 +")");
        	
        	beginning = document.querySelectorAll(".last")[0];
        	var end = document.querySelectorAll(".last")[1];
        	sizeTotal = beginning.clientWidth + end.clientWidth;
        	
        	beginning.setAttribute("transform", "translate("+ ((window.innerWidth / 2) - (sizeTotal / 2)) + "," + 50 * window.innerHeight / 100 +")");
        	end.setAttribute("transform", "translate("+ (((window.innerWidth / 2) - (sizeTotal / 2)) + beginning.clientWidth + 10)
        		+ "," + 50 * window.innerHeight / 100 +")");
        	
        	// Valeurs de références
        	var valLeftX = document.querySelectorAll(".firstDiv")[0].cx.animVal.value - (window.innerWidth / 4);
        	var valLeftY = window.innerHeight / 2;
        	var valRightX = document.querySelectorAll(".firstDiv")[1].cx.animVal.value + (window.innerWidth / 4);
        	var valRightY = window.innerHeight / 2;
        	
        	var distance = 100;
        	var r = 40;
        	
        	
        	// SEQUENCES
		    var phase1 = [
	        	
	        	{
	        		elements: document.querySelectorAll("#storyTelling>g:first-child>g>circle"), 
	        		properties: { cy : window.innerHeight / 2 - 20},
	        		options: {duration: 600, easing: 'easeInOutBack', sequenceQueue : false}
	        	},
	        	
	        	{
	        		elements: document.querySelector("#phrase1"), 
	        		properties: { opacity:1 },
	        		options: {duration: 600, easing: 'easeInOutBack', delay : 600, sequenceQueue : false}
	        	},
	        	
	        	{
	        		elements: document.querySelectorAll("#phrase1"), 
	        		properties: { opacity: 0},
	        		options: {duration: 800, easing: 'easeInOutBack', delay : 700}
	        	},
	        	
	        	{
	        		elements: document.querySelectorAll("#storyTelling>g:first-child>g>circle:first-child"), 
	        		properties: { opacity: 0},
	        		options: {duration: 500, easing: 'easeInOutBack', sequenceQueue : false}
	        	},
	        	
	        	{
	        		elements: document.querySelector("#storyTelling line"), 
	        		properties: { y1:  0, y2 : window.innerHeight},
	        		options: {duration: 800, easing: 'easeInOutBack', sequenceQueue : false}
	        	}, 
	        	
	        	// Animation des 2 noeuds provenant du noeud central
	        	{
		        	elements: document.querySelectorAll(".firstDiv")[0], 
	        		properties: { cx: document.querySelectorAll(".firstDiv")[0].cx.animVal.value - (window.innerWidth / 4)},
	        		options: {duration: 800, easing: 'easeInOutBack', sequenceQueue : false}
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".firstDiv")[1], 
	        		properties: { cx: document.querySelectorAll(".firstDiv")[1].cx.animVal.value + (window.innerWidth / 4)},
	        		options: {duration: 800, easing: 'easeInOutBack', sequenceQueue : false}
	        	},
	        	
	        	// Animation des 8 noeuds enfants
	        	
	        	{
		        	elements: document.querySelectorAll(".left"), 
	        		properties: { cx: document.querySelectorAll(".firstDiv")[0].cx.animVal.value - (window.innerWidth / 4)},
	        		options: {duration: 800, easing: 'easeInOutBack', sequenceQueue : false}
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".right"), 
	        		properties: { cx: document.querySelectorAll(".firstDiv")[1].cx.animVal.value + (window.innerWidth / 4)},
	        		options: {duration: 800, easing: 'easeInOutBack', sequenceQueue : false}
	        	},
	        	
	        	// Animation des nodes de gauche et de droite
	        	{
		        	elements: document.querySelectorAll(".left")[0], 
	        		properties: { 
	        			cx: valLeftX - distance,
		        		cy : valLeftY - (distance + r)
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack'}
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".right")[0], 
	        		properties: { 
		        		cy : valRightY - (distance + r)
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack', sequenceQueue : false}
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".left")[1], 
	        		properties: { 
	        			cx: valLeftX + distance,
		        		cy : valLeftY - (distance + r)
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack', sequenceQueue : false, delay:50, }
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".right")[1], 
	        		properties: { 
	        			cx: valRightX + distance,
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack', sequenceQueue : false, delay:50, }
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".left")[2], 
	        		properties: { 
	        			cx: valLeftX - distance,
		        		cy : valLeftY + distance
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack', sequenceQueue : false, delay:50, }
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".right")[2], 
	        		properties: { 
		        		cy : valRightY + distance
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack', sequenceQueue : false, delay:50, }
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".left")[3], 
	        		properties: { 
	        			cx: valLeftX + distance,
		        		cy : valLeftY + distance
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack', sequenceQueue : false, delay:50, }
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".right")[3], 
	        		properties: { 
	        			cx: valRightX - distance,
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack', sequenceQueue : false, delay:50, }
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".firstDiv"), 
	        		properties: { opacity : 0},
	        		options: {duration: 500, easing: 'easeInOutBack', delay : 100}
	        	}
	        ];
	        
	        // Sequence inverse
	        var phase1Reverse = [
	        	{
		        	elements: document.querySelectorAll(".path"), 
	        		properties: { opacity : 0},
	        		options: {duration: 500, easing: 'easeInOutBack'}
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".firstDiv"), 
	        		properties: { opacity : 1},
	        		options: {duration: 500, easing: 'easeInOutBack'}
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".right")[3], 
	        		properties: { 
	        			cx: valRightX
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack', sequenceQueue : false, delay:50, }
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".left")[3], 
	        		properties: { 
	        			cx: valLeftX,
		        		cy : valLeftY - r / 2
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack', sequenceQueue : false, delay:50, }
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".right")[2], 
	        		properties: { 
		        		cy : valRightY - r / 2
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack', sequenceQueue : false, delay:50, }
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".left")[2], 
	        		properties: { 
	        			cx: valLeftX,
		        		cy : valLeftY - r / 2
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack', sequenceQueue : false, delay:50, }
	        	},
	        	
	        	
	        	{
		        	elements: document.querySelectorAll(".right")[1], 
	        		properties: { 
	        			cx: valRightX,
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack', sequenceQueue : false, delay:50, }
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".left")[1], 
	        		properties: { 
	        			cx: valLeftX,
		        		cy : valLeftY - r / 2
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack', sequenceQueue : false, delay:50, }
	        	},
	        	
	        	
	        	{
		        	elements: document.querySelectorAll(".right")[0], 
	        		properties: { 
		        		cy : valRightY - r / 2
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack', sequenceQueue : false, delay : 50}
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".left")[0], 
	        		properties: { 
	        			cx: valLeftX,
		        		cy : valLeftY - r / 2
	        		},
	        		options: {duration: 200, easing: 'easeInOutBack', delay: 50}
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".firstDiv"), 
	        		properties: { cx: window.innerWidth / 2 },
	        		options: {duration: 800, easing: 'easeInOutBack'}
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".left"), 
	        		properties: { cx: window.innerWidth / 2},
	        		options: {duration: 800, easing: 'easeInOutBack', sequenceQueue : false}
	        	},
	        	
	        	{
		        	elements: document.querySelectorAll(".right"), 
	        		properties: { cx: window.innerWidth / 2},
	        		options: {duration: 800, easing: 'easeInOutBack', sequenceQueue : false}
	        	},
	        	
	        	{
	        		elements: document.querySelectorAll("#storyTelling>g:first-child>g>circle:first-child"), 
	        		properties: { opacity: 1},
	        		options: {duration: 800, easing: 'easeInOutBack', delay : 100, sequenceQueue : false}
	        	},
	        	
	        	
	        	{
	        		elements: document.querySelector("#storyTelling>g:first-child>line"), 
	        		properties: { y1:  -(window.innerHeight), y2 : 0},
	        		options: {duration: 800, easing: 'easeInOutBack'}
	        	}
	        ];
	        
	        var phase2 = [
				{
					elements: document.querySelectorAll("text.words")[0], 
					properties: { opacity:1 },
					options: {duration: 800, easing: 'easeInOutBack', delay : 800}
				},
				
				{
					elements: document.querySelectorAll(".word")[0], 
					properties: { opacity:1 },
					options: {duration: 800, easing: 'easeInOutBack', sequenceQueue: false}
				},
				
				{
					elements: document.querySelectorAll(".word")[0], 
					properties: { opacity:0 },
					options: {duration: 800, easing: 'easeInOutBack', delay : 800}
				},
				
				{
					elements: document.querySelectorAll(".word")[1], 
					properties: { opacity:1 },
					options: {duration: 800, easing: 'easeInOutBack', sequenceQueue: false}
				},
				
				{
					elements: document.querySelectorAll("text.words"), 
					properties: { opacity:0 },
					options: {duration: 800, easing: 'easeInOutBack', delay : 1000}
				},
				
				
				{
					elements: document.querySelectorAll("#randomCircle>circle"), 
					properties: { 
						cx : function() { return Math.floor(Math.random() * window.innerWidth)},
						cy : function() { return Math.floor(Math.random() * window.innerHeight)}
					},
					options: {duration: 4000, easing: 'easeInOutBack', sequenceQueue : false, queueName : "test"}
				},
				
				{
	        		elements: document.querySelectorAll("#storyTelling>g:first-child>g>circle"), 
	        		properties: { opacity:0},
	        		options: {duration: 1000, easing: 'easeInOutBack', sequenceQueue : false}
	        	},
				
				{
					elements: document.querySelectorAll(".last")[0], 
					properties: { opacity:1 },
					options: {duration: 500, easing: 'easeInOutBack', sequenceQueue : false}
				},
				
				{
					elements: document.querySelectorAll(".last")[1], 
					properties: { opacity:1 },
					options: {duration: 500, easing: 'easeInOutBack', delay : 500}
				},
				
				{
					elements: document.querySelectorAll(".last"), 
					properties: {opacity:0 },
					options: {duration: 1000, easing: 'easeInOutBack', delay : 1500}
				},
				
				{
					elements: document.querySelectorAll("#randomCircle>circle"), 
					properties: { opacity: 0},
					options: {duration: 1000, easing: 'easeInOutBack', sequenceQueue : false}
				},
				
				{
					elements: document.querySelector("#home"), 
					properties: { opacity: 1},
					options: {duration: 600, easing: 'easeInOutBack'}
				},
				
				{
					elements: document.querySelector("#home a"), 
					properties: { translateY: "20px"},
					options: {duration: 800, easing: 'easeInOutBack', sequenceQueue : false}
				}
				
			];
	        
	        /* Gestion de Lancement des Animations */
	        // Lancement de la phase 1
	        Velocity.RunSequence(phase1);
	        
	        // Apparition du skip après 2s d'animation
	        setTimeout(function(){
		        Velocity(document.querySelector("#skip"), "fadeIn", 500);
	        }, 300);
				
	        setTimeout(function(){
	        	
	        	// First Path
	        	var d = " M " + (valLeftX - distance) + " " + (valLeftY - (distance + r))+ " L " + (valLeftX + distance) + " " + (valLeftY - (distance + r))
	        	+ " L " + (valLeftX + distance) + " " + (valLeftY + distance) + " L " + (valLeftX - distance) + " " + (valLeftY + distance) 
	        	+ " L " + (valLeftX - distance) + " " + (valLeftY - (distance + r));
	        	
	        	document.querySelector("#path").setAttribute("d", d);
	        	document.getElementById("storyTelling").appendChild(path);
	        	
	        	// Second Path
	        	var d2 = " M " + valRightX + " " + (valRightY - (distance + r)) + " L " + (valRightX + distance) + " " + (valRightY - r / 2)
	        	+ " L " + valRightX + " " + (valRightY + distance) + " L " + (valRightX - distance) + " " + (valRightY - r / 2)
	        	+ " L " + valRightX + " " + (valRightY - (distance + r));
	        	
	        	document.querySelector("#path2").setAttribute("d", d2);
	        	document.getElementById("storyTelling").appendChild(path);
	        	
	        	// Animate Paths
	        	var dash = 1000;
				Velocity(document.querySelectorAll(".path"),{
					  	strokeWidth: 1,
					    strokeDashoffset: 0,
					    strokeDasharray: dash
					}
				, 1000);
				
				setTimeout(function(){
	        	
		        	// Lancement de la phase 1 à l'envers
					Velocity.RunSequence(phase1Reverse);
					
					setTimeout(function(){
						//Lancement de la phase 2
					 	Velocity.RunSequence(phase2);
					 	
					 	setTimeout(function(){
						 	Velocity(document.querySelector("#skip"), "fadeOut", 800);
					 	}, 5500);
					 	
					}, 2500);
					
				}, 1200);
		    }, 3200);
		},
		
		skip : function(){
			Velocity(document.querySelector("#skip"), "fadeOut", 800);
			Velocity(document.querySelector("#home"), "fadeOut", 800);
			Velocity(document.querySelector("#storyTelling"), {opacity:0}, 800);
			Velocity(document.querySelector("#storyTelling"), "fadeOut", 900);
		}
	};

	return View;
})();