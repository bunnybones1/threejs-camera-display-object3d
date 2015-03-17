var standardGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
function CameraDisplayObject3D(options) {
	var _width = options.width || window.innerWidth;
	var _height = options.height || window.innerHeight;
	var _resolutionWidth = options.resolutionWidth || 100;
	var _resolutionHeight = options.resolutionHeight || 100;
	var _prescale = options.prescale || 1;
	var _geometry = options.geometry || standardGeometry;
	var _renderTargetOptions = options.renderTargetOptions;
	var _generateMipmaps = options.generateMipmaps || false;
	var _material = options.material || new THREE.MeshBasicMaterial({
		// side: THREE.DoubleSide,
		// color: 0xff0000
	});
	var _maintainAspect = options.maintainAspect !== undefined ? options.maintainAspect : true;

	var _renderer = options.renderer;
	_setCamera(options.camera);
	_setScene.call(this, options.scene);

	var _render,
		_camera,
		_scene,
		_renderTarget,
		_backupAspect;

	THREE.Mesh.call(this, _geometry, _material);
	_setResolution(_resolutionWidth, _resolutionHeight);
	_setSize.call(this, _width, _height);

	function _update() {
		_prerender();
		_render();
		_postrender();
	}

	function _updateRaw() {
		_render();
	}

	function _prerender() {
		_backupAspect = _camera.aspect;
		_camera.aspect = _width / _height;
		_camera.updateProjectionMatrix();
	}

	function _postrender() {
		_camera.aspect = _backupAspect;
		_camera.updateProjectionMatrix();
	}

	function _renderOneScene() {
		_renderer.render(_scene, _camera, _renderTarget);
	}

	function _renderManyScenes() {
		_renderer.render(_scene[0], _camera, _renderTarget);
		_renderer.autoClear = false;
		for (var i = 1; i < _scene.length; i++) {
			_renderer.render(_scene[i], _camera, _renderTarget);
		}
		_renderer.autoClear = true;
	}

	function _setSize(width, height) {
		_width = width;
		_height = height;
		this.scale.x = _width * _prescale;
		this.scale.y = _height * _prescale;
	}

	function _setResolution(width, height) {
		if(_renderTarget) _renderTarget.dispose();
		_resolutionWidth = width;
		_resolutionHeight = height;
		_renderTarget = new THREE.WebGLRenderTarget(_resolutionWidth, _resolutionHeight, _renderTargetOptions);
		_renderTarget.generateMipmaps = _generateMipmaps;
		_material.map = _renderTarget;
	}

	function _setScene(scene) {
		_scene = scene;
		if(scene instanceof THREE.Scene) {
			_render = _renderOneScene;
		} else if(scene instanceof Array) {
			_render = _renderManyScenes;
		}
	}

	function _setCamera(camera) {
		_camera = camera;
	}

	function _destroy() {
		if(this.parent) this.parent.remove(this);
		_renderTarget.dispose();
		_renderer = null;
		_material.dispose();
		_material = null;
		_camera = null;
		_scene = null;
	}

	//public
	this.update = _maintainAspect ? _update : _updateRaw;
	this.setSize = _setSize;
	this.setResolution = _setResolution;
	this.setScene = _setScene;
	this.setCamera = _setCamera;
	this.destroy = _destroy;
}

CameraDisplayObject3D.prototype = Object.create(THREE.Mesh.prototype);

module.exports = CameraDisplayObject3D;