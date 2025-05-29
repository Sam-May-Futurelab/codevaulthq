import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeHero = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Create floating orb
    const orbGeometry = new THREE.SphereGeometry(1, 32, 32);
    const orbMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    scene.add(orb);

    // Create glow effect
    const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    // Create particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.6
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x00ff88, 0x00ff88);
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    gridHelper.rotateX(Math.PI / 2);
    gridHelper.position.z = -2;
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Rotate orb
      orb.rotation.x += 0.005;
      orb.rotation.y += 0.005;
      glow.rotation.x += 0.003;
      glow.rotation.y += 0.003;

      // Float orb
      orb.position.y = Math.sin(Date.now() * 0.001) * 0.3;
      glow.position.y = Math.sin(Date.now() * 0.001) * 0.3;

      // Animate particles
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;

      // Pulse glow
      const pulseScale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
      glow.scale.setScalar(pulseScale);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      
      orb.rotation.y = mouseX * 0.5;
      orb.rotation.x = mouseY * 0.3;
      
      particlesMesh.rotation.y = mouseX * 0.1;
      particlesMesh.rotation.x = mouseY * 0.1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js objects
      orbGeometry.dispose();
      orbMaterial.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export default ThreeHero;
