import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import './style.css';
import { TrackballControls } from 'three/addons/controls/TrackballControls';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer';
import { handleSearch } from './search';
import { categories } from './categories';

let scene = null;
let camera = null;
let renderers = null;
let tbControls = null;

const addStars = () => {};

const setupScene = () => {
  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xbbbbbb));
  scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

  // Setup camera
  camera = new THREE.PerspectiveCamera();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.position.z = 330;

  // Setup renderers
  renderers = [new THREE.WebGLRenderer(), new CSS2DRenderer()];
  renderers.forEach((r, idx) => {
    r.setSize(window.innerWidth, window.innerHeight);
    if (idx > 0) {
      // overlay additional on top of main renderer
      r.domElement.style.position = 'absolute';
      r.domElement.style.top = '0px';
      r.domElement.style.pointerEvents = 'none';
    }
    document.getElementById('map').appendChild(r.domElement);
  });

  // Add camera controls
  tbControls = new TrackballControls(camera, renderers[0].domElement);
  tbControls.minDistance = 101;
  tbControls.rotateSpeed = 5;
  tbControls.zoomSpeed = 0.8;

  addStars();
};

const renderGlobe = (data) => {
  const Globe = new ThreeGlobe()
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    .htmlElementsData(data)
    .htmlElement((d) => {
      const el = document.createElement('div');

      el.innerHTML = `
      <div class='category-container'>
      <a  
      target='_blank'
       href=${d.link}
       class='category-button'
       aria-label="${d.category}">${categories[d.category]}</a>
      
        <div class='tooltip'>
          <h3>${d.movie} (${d.year})</h3>
          <p>Location: ${d.location}</p>
        </div>  
      </div>
      `;

      el.style.width = `${10}px`;
      return el;
    });

  scene.add(Globe);
  Globe.position.set(10, 40, 0);
  // Update pov when camera moves
  Globe.setPointOfView(camera.position, Globe.position);
  tbControls.addEventListener('change', () =>
    Globe.setPointOfView(camera.position, Globe.position),
  );

  // Kick-off renderers
  const animate = () => {
    tbControls.update();
    renderers.forEach((r) => r.render(scene, camera));
    requestAnimationFrame(animate);
  };

  animate();
};

const run = async () => {
  try {
    setupScene();
    const response = await fetch('/data.json');
    const data = await response.json();
    renderGlobe(data);
    document
      .getElementById('search')
      .addEventListener('keyup', handleSearch(data));
  } catch (error) {}
};

run();
