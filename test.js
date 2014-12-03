var onReady = function() {
	var View = require('threejs-managed-view').View,
		CameraDisplayObject = require('./');

	var TestScene = require('./TestScene');
	var testScene = new TestScene();
	
	var view = new View({
		scene: testScene.scene,
		camera: testScene.camera,
		stats: true
	});

	//primary test view
	var camView = new CameraDisplayObject({
		renderer: view.renderer,
		camera: testScene.camera,
		width: 4,
		height: 4,
		prerender: function() {
			this.visible = false;
		},
		postrender: function() {
			this.visible = true;
		}
	});
	camView.position.y = 2;
	view.renderManager.onEnterFrame.add(function() {
		camView.render();
	})

	testScene.scene.add(camView);

	//test resize
	setTimeout(function() {
		camView.setSize(4, 2);
	}, 1000);

	//test resolution changes
	setTimeout(function() {
		camView.setResolution(400, 200);
	}, 2000);

	//test multiple create/destroys
	var tempMonitorPlane;
	var tempCamera = new THREE.PerspectiveCamera();
	var tempCameraLookTarget = new THREE.Vector3(0, 1, 0);
	var tempMonitorPlaneLookTarget = new THREE.Vector3();
	testScene.scene.add(tempCamera);
	setInterval(function() {
		if(tempMonitorPlane) {
			view.renderManager.onEnterFrame.remove(tempMonitorPlane.render);
			tempMonitorPlane.destroy();
		}
		tempCamera.position.set(
			(Math.random() - .5) * 8,
			3,
			(Math.random() - .5) * 8
		);
		tempMonitorPlane = new CameraDisplayObject({
			camera: tempCamera,
			renderer: view.renderer,
			width: 4,
			height: 3 * Math.random() + 1,
			resolutionWidth: 400,
			resolutionHeight: 200
		});
		tempMonitorPlane.position.copy(tempCamera.position);
		testScene.scene.add(tempMonitorPlane);
		tempMonitorPlaneLookTarget.setFromMatrixPosition(testScene.camera.matrixWorld);
		tempMonitorPlane.lookAt(tempMonitorPlaneLookTarget);
		tempCamera.lookAt(tempCameraLookTarget);
		view.renderManager.onEnterFrame.add(tempMonitorPlane.render);
	}, 1000)

	testScene.bindRenderer(view.renderer);
	view.renderManager.onEnterFrame.add(testScene.onEnterFrame);
	view.renderManager.skipFrames = 10;
}

var loadAndRunScripts = require('loadandrunscripts');
loadAndRunScripts(
	[
		'bower_components/three.js/three.js',
		'lib/stats.min.js',
		'lib/threex.rendererstats.js',
	],
	onReady
);
