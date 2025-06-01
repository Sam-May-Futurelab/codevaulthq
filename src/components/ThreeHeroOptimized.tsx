import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeHeroOptimized = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

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

    // Renderer setup with performance optimizations
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: false, // Disable antialiasing for performance
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Create floating orb with reduced geometry complexity
    const orbGeometry = new THREE.SphereGeometry(1, 16, 16); // Reduced from 32,32
    const orbMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    scene.add(orb);

    // Create glow effect with reduced complexity
    const glowGeometry = new THREE.SphereGeometry(1.2, 12, 12); // Reduced from 32,32
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    // Create particles with reduced count
    const particlesCount = 500; // Reduced from 1000
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 8; // Reduced spread
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.015, // Slightly smaller
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.6
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create grid with reduced complexity
    const gridHelper = new THREE.GridHelper(15, 15, 0x00ff88, 0x00ff88); // Reduced from 20,20
    gridHelper.material.opacity = 0.08; // Reduced opacity
    gridHelper.material.transparent = true;
    gridHelper.rotateX(Math.PI / 2);
    gridHelper.position.z = -2;
    scene.add(gridHelper);

    // Mouse interaction variables
    let mouseX = 0;
    let mouseY = 0;

    // Performance monitoring
    let lastFrameTime = 0;
    const targetFPS = 30; // Reduce target FPS for better performance
    const frameInterval = 1000 / targetFPS;

    // Animation loop with performance throttling
    const animate = (currentTime?: number) => {
      if (!renderer || !scene || !camera || !orb || !glow || !particlesMesh) return;
      
      // Performance throttling
      if (currentTime && currentTime - lastFrameTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = currentTime || 0;

      // Only animate if component is visible
      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Reduced animation complexity
      orb.rotation.x += 0.003; // Reduced from 0.005
      orb.rotation.y += 0.003;
      glow.rotation.x += 0.002; // Reduced from 0.003
      glow.rotation.y += 0.002;

      // Smooth mouse-responsive movement with reduced sensitivity
      const targetX = mouseX * 0.05; // Reduced from 0.1
      const targetY = mouseY * 0.05;
      
      // Lerp to smooth movement with reduced responsiveness
      orb.position.x += (targetX - orb.position.x) * 0.01; // Reduced from 0.02
      orb.position.y += (targetY - orb.position.y) * 0.01;
      glow.position.x = orb.position.x;
      glow.position.y = orb.position.y;

      // Gentle particle rotation
      particlesMesh.rotation.y += 0.001; // Reduced from 0.002
      particlesMesh.rotation.x += 0.0005; // Reduced from 0.001

      // Subtle glow pulse with reduced intensity
      const pulseScale = 1 + Math.sin(Date.now() * 0.001) * 0.03; // Reduced from 0.05
      glow.scale.setScalar(pulseScale);

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop after a brief delay
    setTimeout(() => {
      animate();
    }, 100);    // Handle resize with debouncing
    let resizeTimeout: number;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!camera || !renderer) return;
        
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }, 100) as unknown as number;
    };

    window.addEventListener('resize', handleResize);    // Mouse interaction with throttling
    let mouseMoveTimeout: number;
    const handleMouseMove = (event: MouseEvent) => {
      clearTimeout(mouseMoveTimeout);
      mouseMoveTimeout = setTimeout(() => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      }, 16) as unknown as number; // Throttle to ~60fps
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Visibility detection for performance
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      clearTimeout(resizeTimeout);
      clearTimeout(mouseMoveTimeout);
      
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
      gridHelper.geometry.dispose();
      gridHelper.material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export default ThreeHeroOptimized;
