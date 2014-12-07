var _ = require('lodash');

var standardGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
function CameraDisplayObject3D(params) {
	params = _.merge({
		width: window.innerWidth,
		height: window.innerHeight,
		resolutionWidth: 100,
		resolutionHeight: 100,
		prescale: 1,
		geometry: standardGeometry,
		renderTargetOptions: undefined,
		generateMipmaps: false
	}, params || {});
	_.assign(this, params);

	//needs a camera
	if(!this.camera) throw new Error("You must provide a camera.");

	//find the scene
	this.scene = this.camera;
	while(this.scene.parent) {
		this.scene = this.scene.parent;
	}
	if(!(this.scene instanceof THREE.Scene)) this.scene = undefined;
	if(!this.scene) throw new Error("Your camera must be a child of a scene.");

	//if its default geometry, width and height should scale
	var scaleToSize = !!this.geometry;

	//material
	if(!this.material) this.material = new THREE.MeshBasicMaterial({
	});

	THREE.Mesh.call(this, this.geometry, this.material);
	this.setResolution(this.resolutionWidth, this.resolutionHeight);
	this.setSize(this.width, this.height);
	
	//bind the following functions to this because they might be called from other scopes 
	var _this = this;
	['render', 'prerender', 'postrender'].forEach(function(funcName) {
		_this[funcName] = _this[funcName].bind(_this);
	});
}

CameraDisplayObject3D.prototype = Object.create(THREE.Mesh.prototype);

_.assign(CameraDisplayObject3D.prototype, {
	prerender: function() {
		// console.log('prerender');
		this.backupAspect = this.camera.aspect;
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
	},
	postrender: function() {
		// console.log('postrender');
		this.camera.aspect = this.backupAspect;
		this.camera.updateProjectionMatrix();
	},
	render: function() {
		this.prerender();
		this.renderer.render(this.scene, this.camera, this.renderTarget);
		this.postrender();
	},
	setSize: function(width, height) {
		this.camera;
		this.width = width;
		this.height = height;
		this.scale.x = this.width * this.prescale;
		this.scale.y = this.height * this.prescale;
	},
	setResolution: function(width, height) {
		if(this.renderTarget) this.renderTarget.dispose();
		this.resolutionWidth = width;
		this.resolutionHeight = height;
		this.renderTarget = new THREE.WebGLRenderTarget(this.resolutionWidth, this.resolutionHeight, this.renderTargetOptions);
		this.renderTarget.generateMipmaps = this.generateMipmaps;
		this.material.map = this.renderTarget;
	},
	destroy: function() {
		if(this.parent) this.parent.remove(this);
		this.renderTarget.dispose();
		this.renderer = null;
		this.material.dispose();
		this.material = null;
	}
});
module.exports = CameraDisplayObject3D;