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
	var tempCamView;
	var tempCamera = new THREE.PerspectiveCamera();
	var lookTarget = new THREE.Vector3();
	testScene.scene.add(tempCamera);
	setInterval(function() {
		if(tempCamView) {
			view.renderManager.onEnterFrame.remove(tempCamView.render);
			tempCamView.destroy();
		}
		tempCamera.position.set(
			(Math.random() - .5) * 8,
			3,
			(Math.random() - .5) * 8
		);
		tempCamView = new CameraDisplayObject({
			camera: tempCamera,
			renderer: view.renderer,
			width: 4,
			height: 2,
			resolutionWidth: 400,
			resolutionHeight: 200
		});
		tempCamView.position.copy(tempCamera.position);
		testScene.scene.add(tempCamView);
		lookTarget.setFromMatrixPosition(testScene.camera.matrixWorld);
		tempCamView.lookAt(lookTarget);
		view.renderManager.onEnterFrame.add(tempCamView.render);
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
