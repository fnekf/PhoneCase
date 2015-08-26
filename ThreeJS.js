var ThreeJS = function(aP5, aDiv) {

  var mP5 = aP5;
  var mDiv = aDiv;
  var mIsWebGL;
  var mRenderer;
  var mScene;
  var mCamera;
  var mMesh;
  var mTextureMapDynamic, mTextureMapStatic;
  var mShaderMaterialTexture, mShaderMaterialFakeTexture, mShaderMaterialTextureDistort;
  var mTrackballControls;
  var mTransformControls;
  var mBBoxHelper;
  var mAxes;
  var mObjectPath;


  this.setupScene = function() {

    mScene = new THREE.Scene();

    mCamera = new THREE.PerspectiveCamera(25, width / height, 1, 10000);
    mCamera.position.z = 50;
    mCamera.lookAt(mScene.position);

    mTrackballControls = new THREE.TrackballControls(mCamera, mRenderer.domElement);
    mTrackballControls.rotateSpeed = 5.0;
    mTrackballControls.zoomSpeed = 1.2;
    mTrackballControls.panSpeed = 0.8;
    mTrackballControls.noZoom = false;
    mTrackballControls.noPan = false;
    mTrackballControls.staticMoving = true;
    mTrackballControls.dynamicDampingFactor = 0.3;
    mTrackballControls.keys = [65, 83, 68];

    mTransformControls = new THREE.TransformControls(mCamera, mRenderer.domElement);
    mTransformControls.enabled = false;
    mScene.add(mTransformControls);

    mTextureMapStatic = THREE.ImageUtils.loadTexture('data/testImage.jpg');
    mTextureMapStatic.minFilter = THREE.NearestFilter;

    setupShaders();

    mMesh = new THREE.Mesh(new THREE.TorusGeometry(10, 3, 16, 100), mShaderMaterialFakeTexture);
    mMesh.geometry.computeBoundingBox();
    mMesh.position.z = -20;
    mMesh.castShadow = true;
    mMesh.receiveShadow = true;
    mMesh.name = "MainMesh";
    mScene.add(mMesh);

    mBBoxHelper = new THREE.BoundingBoxHelper(mMesh, 0xff00ff00);
    mBBoxHelper.name = "BBox Helper";
    mBBoxHelper.visible = false;
    mBBoxHelper.update();
    mScene.add(mBBoxHelper);

    var geometry = new THREE.PlaneBufferGeometry(5, 20, 600, 1200);
    geometry.computeBoundingBox();
    var plane = new THREE.Mesh(geometry, mShaderMaterialDistortHeight);
    plane.position.z = 0;
    plane.scale.x = 20;
    plane.scale.y = 10;
    plane.recieveShadow = true;
    mScene.add(plane);
    plane = new THREE.Mesh(geometry, mShaderMaterialTexture);
    plane.position.z = -10;
    plane.scale.x = 20;
    plane.scale.y = 10;
    plane.recieveShadow = true;
    mScene.add(plane);

    mAxes = buildAxes(1000);
    mAxes.visible = false;
    mScene.add(mAxes);
  };

  this.update = function() {
    mCamera.lookAt(mScene.position);

    mTrackballControls.update();
    mTransformControls.update();
    mBBoxHelper.update();
    mTextureMapDynamic = new THREE.Texture(mP5.mFbo.elt);
    mTextureMapDynamic.minFilter = THREE.LinearFilter;
    mTextureMapDynamic.magFilter = THREE.LinearFilter;
    mTextureMapDynamic.needsUpdate = true;
    //console.log(mTextureMapDynamic.image.width);
    mShaderMaterialTexture.uniforms["uTextureMap"].value = mTextureMapStatic;
    mShaderMaterialTextureDistort.uniforms["uTextureMap"].value = mTextureMapDynamic;
    mShaderMaterialFakeTexture.uniforms["uTextureMap"].value = mTextureMapStatic;
    mShaderMaterialFakeTextureDistort.uniforms["uTextureMap"].value = mTextureMapDynamic;
    mShaderMaterialFakeTextureDistortHeight.uniforms["uTextureMap"].value = mTextureMapDynamic;
    mShaderMaterialTextureDistortHeight.uniforms["uTextureMap"].value = mTextureMapDynamic;
    mShaderMaterialDistortHeight.uniforms["uTextureMap"].value = mTextureMapDynamic;
    var boundingBox = mMesh.geometry.boundingBox.clone();
    mShaderMaterialFakeTexture.uniforms["uBBox"].value = [new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.max.z - 1), boundingBox.max];
    mShaderMaterialFakeTextureDistort.uniforms["uBBox"].value = [new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z), boundingBox.max];
    mShaderMaterialFakeTextureDistortHeight.uniforms["uBBox"].value = [new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z), boundingBox.max];
  };

  this.draw = function() {
    mRenderer.render(mScene, mCamera);
    //this.mComposer.render();
  };

  this.setTransformControlsMode = function(aName) {
    mTransformControls.setMode(aName);
  };

  this.switchControls = function() {
    if (mTransformControls.enabled === false) {
      mTrackballControls.enabled = false;
      mTransformControls.attach(mMesh);
      mTransformControls.enabled = true;
      mBBoxHelper.visible = true;
      mAxes.visible = true;
    } else {
      mTrackballControls.enabled = true;
      mTransformControls.enabled = false;
      mBBoxHelper.visible = false;
      mAxes.visible = false;
      mTransformControls.detach();
    }
  };

  this.loadSTLFile = function(aName) {
    var loader = new THREE.STLLoader();
    loader.load(aName, function(geometry) {
      var oldMesh = mScene.getObjectByName(mMesh.name);
      mScene.remove(oldMesh);
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();
      geometry.verticesNeedUpdate = true;
      geometry.elementsNeedUpdate = true;
      geometry.uvsNeedUpdate = true;
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      mMesh = new THREE.Mesh(geometry, mShaderMaterialFakeTextureDistortHeight);
      mMesh.castShadow = true;
      mMesh.receiveShadow = true;
      mMesh.name = "MainMesh";
      mScene.add(mMesh);
      //parent.mTransformControls.attach(mesh);
      mScene.remove(mScene.getObjectByName(mBBoxHelper.name));
      mBBoxHelper = new THREE.BoundingBoxHelper(mMesh, 0xff00ff00);
      mBBoxHelper.name = "BBox Helper";
      mBBoxHelper.visible = false;
      mScene.add(mBBoxHelper);
    });
  };

  this.exportBinarySTL = function(aName) {
    var writer = new BinaryStlWriter();
    writer.save(mMesh.geometry, aName);
  };

  this.exportSTL = function(aName) {
    var exporter = new THREE.STLExporter();
    var stlString = exporter.parse(mMesh);
    var blob = new Blob([stlString], {
      type: 'text/plain'
    });
    saveAs(blob, aName + '.stl');
  };

  this.loadJSONFile = function(aName) {
    var loader = new THREE.BufferGeometryLoader();
    mObjectPath = aName;
    // load a resource
    loader.load(
      // resource URL
      aName,
      // Function when resource is loaded
      function(geometry) {
        var oldMesh = mScene.getObjectByName(mMesh.name);
        mScene.remove(oldMesh);
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        geometry.verticesNeedUpdate = true;
        geometry.elementsNeedUpdate = true;
        geometry.uvsNeedUpdate = true;
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        mMesh = new THREE.Mesh(geometry, mShaderMaterialFakeTextureHeight);
        mMesh.castShadow = true;
        mMesh.receiveShadow = true;
        mMesh.name = "MainMesh";
        mScene.add(mMesh);
        //parent.mTransformControls.attach(mesh);
        mScene.remove(mScene.getObjectByName(mBBoxHelper.name));
        mBBoxHelper = new THREE.BoundingBoxHelper(mMesh, 0xff00ff00);
        mBBoxHelper.name = "BBox Helper";
        mBBoxHelper.visible = false;
        mScene.add(mBBoxHelper);
      },
      // Function called when download progresses
      function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      // Function called when download errors
      function(xhr) {
        console.log('An error happened');
      }
    );
  };

  this.setupRenderer = function(aWidth, aHeight) {
    if (Detector.webgl) {
      mRenderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
      });
      mIsWebGL = true;
    } else {
      mRenderer = new THREE.CanvasRenderer({
        alpha: true,
        antialias: true
      });
      mIsWebGL = false;
    }
    var container = mDiv.elt;
    mRenderer.setSize(aWidth, aHeight);
    container.appendChild(mRenderer.domElement);
    mRenderer.domElement.style.zIndex = "1";
    mRenderer.domElement.style.backgroundColor = "transparent";
    mRenderer.domElement.style.left = '0';
    mRenderer.domElement.style.top = '0';
    mRenderer.domElement.style.position = "absolute";
  };

  this.resizeRenderer = function(aWidth, aHeight) {
    mRenderer.setSize(aWidth, aHeight);
    mCamera.aspect = aWidth / aHeight;
    mCamera.updateProjectionMatrix();
    mCamera.lookAt(mScene.position);
    mTrackballControls.handleResize();
  };

  this.exportJSON = function() {
    var geo = mMesh.geometry;
    geo.applyMatrix(mMesh.matrix);
    geo.computeFaceNormals();
    geo.computeVertexNormals();
    geo.verticesNeedUpdate = true;
    geo.elementsNeedUpdate = true;
    geo.uvsNeedUpdate = true;
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    mMesh.applyMatrix(new THREE.Matrix4().getInverse(mMesh.matrix));
    //mMesh.autoMatrixUpdate = false;
    var output = geo.toJSON();
    output = JSON.stringify(output, null, '\t');
    output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');

    exportString(output, mObjectPath);
  }


  //Private Methods

  function setupShaders() {
    mShaderMaterialFakeTexture = new THREE.ShaderMaterial({

      uniforms: {
        uTextureMap: {
          type: "t",
          value: null
        },
        uBBox: {
          type: "v3v",
          value: null
        },
      },
      attributes: {},
      side: THREE.DoubleSide,
      vertexColors: THREE.VertexColors,
      vertexShader: document.getElementById('vertexShaderFakeTexture').textContent,
      fragmentShader: document.getElementById('fragmentShaderFakeTexture').textContent
    });

    mShaderMaterialTexture = new THREE.ShaderMaterial({

      uniforms: {
        uTextureMap: {
          type: "t",
          value: null
        },
      },
      attributes: {},
      side: THREE.DoubleSide,
      vertexColors: THREE.VertexColors,
      vertexShader: document.getElementById('vertexShaderTexture').textContent,
      fragmentShader: document.getElementById('fragmentShaderTexture').textContent
    });

    mShaderMaterialTextureDistort = new THREE.ShaderMaterial({

      uniforms: {
        uTextureMap: {
          type: "t",
          value: null
        },
      },
      attributes: {},
      side: THREE.DoubleSide,
      vertexColors: THREE.VertexColors,
      vertexShader: document.getElementById('vertexShaderTextureDistort').textContent,
      fragmentShader: document.getElementById('fragmentShaderTextureDistort').textContent
    });

    mShaderMaterialFakeTextureDistort = new THREE.ShaderMaterial({

      uniforms: {
        uTextureMap: {
          type: "t",
          value: null
        },
        uBBox: {
          type: "v3v",
          value: null
        },
      },
      attributes: {},
      side: THREE.DoubleSide,
      vertexColors: THREE.VertexColors,
      vertexShader: document.getElementById('vertexShaderFakeTextureDistort').textContent,
      fragmentShader: document.getElementById('fragmentShaderFakeTextureDistort').textContent
    });

    mShaderMaterialFakeTextureDistortHeight = new THREE.ShaderMaterial({

      uniforms: {
        uTextureMap: {
          type: "t",
          value: null
        },
        uBBox: {
          type: "v3v",
          value: null
        },
      },
      attributes: {},
      side: THREE.DoubleSide,
      vertexColors: THREE.VertexColors,
      vertexShader: document.getElementById('vertexShaderFakeTextureDistortHeight').textContent,
      fragmentShader: document.getElementById('fragmentShaderFakeTextureDistortHeight').textContent
    });

    mShaderMaterialTextureDistortHeight = new THREE.ShaderMaterial({

      uniforms: {
        uTextureMap: {
          type: "t",
          value: null
        },
      },
      attributes: {},
      side: THREE.DoubleSide,
      vertexColors: THREE.VertexColors,
      vertexShader: document.getElementById('vertexShaderTextureDistortHeight').textContent,
      fragmentShader: document.getElementById('fragmentShaderTextureDistortHeight').textContent
    });
    
    mShaderMaterialDistortHeight = new THREE.ShaderMaterial({

      uniforms: {
        uTextureMap: {
          type: "t",
          value: null
        },
      },
      attributes: {},
      side: THREE.DoubleSide,
      vertexColors: THREE.VertexColors,
      vertexShader: document.getElementById('vertexShaderDistortHeight').textContent,
      fragmentShader: document.getElementById('fragmentShaderDistortHeight').textContent
    });
  }

  function buildAxes(length) {
    var axes = new THREE.Object3D();

    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0), 0xFF0000, false)); // +X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-length, 0, 0), 0xFF0000, true)); // -X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0), 0x00FF00, false)); // +Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -length, 0), 0x00FF00, true)); // -Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, length), 0x0000FF, false)); // +Z
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -length), 0x0000FF, true)); // -Z

    return axes;

  }

  function buildAxis(src, dst, colorHex, dashed) {
    var geom = new THREE.Geometry(),
      mat;

    if (dashed) {
      mat = new THREE.LineDashedMaterial({
        linewidth: 3,
        color: colorHex,
        dashSize: 3,
        gapSize: 3
      });
    } else {
      mat = new THREE.LineBasicMaterial({
        linewidth: 3,
        color: colorHex
      });
    }

    geom.vertices.push(src.clone());
    geom.vertices.push(dst.clone());
    geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

    var axis = new THREE.Line(geom, mat, THREE.LinePieces);

    return axis;

  }

  function exportString(output, filename) {

    var blob = new Blob([output], {
      type: 'text/plain'
    });
    var objectURL = URL.createObjectURL(blob);

    var link = document.createElement('a');
    link.href = objectURL;
    link.download = filename || 'data.json';
    link.target = '_blank';
    link.click();
  }
}