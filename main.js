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
let data = [];
let hiddenCategories = [];

const addStars = () => {};

const setupScene = () => {
  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xbbbbbb));
  scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

  // Setup camera
  camera = new THREE.PerspectiveCamera();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.position.z = 340;

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

const renderGlobe = (animateIn = true) => {
  const animate = () => {
    tbControls.update();
    renderers.forEach((r) => r.render(scene, camera));
    requestAnimationFrame(animate);
  };

  const oldEarth = scene.getObjectByName('earth');

  if (oldEarth) {
    scene.remove(oldEarth);
    document
      .querySelectorAll('.category-container')
      .forEach((el) => el.remove());

    animate();
  }

  const globe = new ThreeGlobe({
    animateIn,
  })
    .globeImageUrl('/earth.jpg')
    .bumpImageUrl('/earth-topology.png')
    .htmlElementsData(
      data.filter((d) => !hiddenCategories.includes(d.category)),
    )
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

  globe.name = 'earth';
  scene.add(globe);
  globe.position.set(10, 40, 0);
  // Update pov when camera moves
  globe.setPointOfView(camera.position, globe.position);
  tbControls.addEventListener('change', () =>
    globe.setPointOfView(camera.position, globe.position),
  );

  animate();
};

const renderStars = (starCount = 2000) => {
  const stars = new THREE.Group();

  const geometry = new THREE.SphereGeometry(0.2, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

  for (let i = 0; i < starCount; i++) {
    const star = new THREE.Mesh(geometry, material);
    star.position.x = Math.random() * 800 - 500;
    star.position.y = Math.random() * 800 - 500;
    star.position.z = Math.random() * 1000 - 500;
    stars.add(star);
  }

  scene.add(stars);
  stars.renderOrder = -1;
};

const renderLegend = () => {
  const legend = document.getElementById('legend-list');
  for (const category of Object.keys(categories)) {
    const div = document.createElement('div');
    div.innerHTML = `
    <div class='legend-item'>
      <input id="${category}" type='checkbox' value="${category}">
      <label for="${category}">${categories[category]} ${category}</label>
    </div>
    `;
    legend.appendChild(div);
  }

  legend.addEventListener('change', (e) => {
    const { value } = e.target;
    if (hiddenCategories.includes(value)) {
      hiddenCategories = hiddenCategories.filter((c) => c !== value);
    } else {
      hiddenCategories.push(value);
    }

    renderGlobe(false);
  });
};

const run = async () => {
  try {
    setupScene();
    const response = await fetch('/data.json');
    data = await response.json();
    renderStars();
    renderGlobe();
    renderLegend();

    document
      .getElementById('search')
      .addEventListener('keyup', handleSearch(data));
  } catch (error) {}
};

run();
