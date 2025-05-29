import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export class GSAPAnimations {
  static initHeroAnimations() {
    // Hero title animation with stagger
    gsap.fromTo('.hero-title-char', 
      { 
        y: 100, 
        opacity: 0,
        rotationX: 90 
      },
      {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 1.2,
        ease: 'power3.out',
        stagger: 0.05
      }
    );

    // Hero subtitle glow effect
    gsap.to('.hero-subtitle', {
      textShadow: '0 0 20px rgba(14, 165, 233, 0.5)',
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: 'power2.inOut'
    });

    // Floating animation for hero elements
    gsap.to('.floating', {
      y: -20,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: 'power2.inOut',
      stagger: 0.2
    });
  }

  static initScrollAnimations() {
    // Stats section animation
    gsap.fromTo('.stat-card', 
      { 
        scale: 0.8, 
        opacity: 0,
        y: 50 
      },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'back.out(1.7)',
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.stats-section',
          start: 'top 80%',
          end: 'bottom 20%'
        }
      }
    );    // Snippet cards parallax effect
    gsap.utils.toArray('.snippet-card').forEach((card: any) => {
      gsap.fromTo(card, 
        { 
          y: 100, 
          opacity: 0,
          rotationY: 15 
        },
        {
          y: 0,
          opacity: 1,
          rotationY: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'bottom 15%'
          }
        }
      );
    });

    // Top 10 carousel animation
    gsap.fromTo('.top10-item', 
      { 
        x: 200, 
        opacity: 0,
        scale: 0.9 
      },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: '.top10-section',
          start: 'top 80%'
        }
      }
    );

    // Trending tags wave animation
    gsap.fromTo('.trending-tag', 
      { 
        y: 30, 
        opacity: 0,
        rotationX: 30 
      },
      {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: {
          amount: 0.8,
          from: 'start'
        },
        scrollTrigger: {
          trigger: '.trending-section',
          start: 'top 85%'
        }
      }
    );
  }

  static initInteractiveAnimations() {
    // Hover animations for cards
    document.querySelectorAll('.interactive-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.05,
          rotationY: 5,
          z: 50,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          rotationY: 0,
          z: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });

    // Button hover effects
    document.querySelectorAll('.gsap-button').forEach(button => {
      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          scale: 1.1,
          boxShadow: '0 10px 30px rgba(14, 165, 233, 0.3)',
          duration: 0.2,
          ease: 'power2.out'
        });
      });

      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          scale: 1,
          boxShadow: '0 4px 15px rgba(14, 165, 233, 0.1)',
          duration: 0.2,
          ease: 'power2.out'
        });
      });
    });
  }

  static initLoadingAnimation() {
    // Page loading animation
    const tl = gsap.timeline();
    
    tl.from('.page-container', {
      opacity: 0,
      duration: 0.5
    })
    .from('.header', {
      y: -100,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.3')
    .from('.main-content > *', {
      y: 50,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.1
    }, '-=0.5');

    return tl;
  }

  static createMagneticEffect(element: HTMLElement) {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * 0.1;
      const deltaY = (e.clientY - centerY) * 0.1;
      
      gsap.to(element, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }

  static animateCounter(element: HTMLElement, endValue: number, duration: number = 2) {
    const obj = { value: 0 };
    
    gsap.to(obj, {
      value: endValue,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = Math.floor(obj.value).toLocaleString();
      },
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        once: true
      }
    });
  }

  static createParticleTrail(element: HTMLElement) {
    const handleMouseMove = (e: MouseEvent) => {
      const particle = document.createElement('div');
      particle.className = 'particle-trail';
      particle.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 4px;
        height: 4px;
        background: linear-gradient(45deg, #0ea5e9, #8b5cf6);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
      `;
      
      document.body.appendChild(particle);
      
      gsap.fromTo(particle, 
        { scale: 1, opacity: 1 },
        {
          scale: 0,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => particle.remove()
        }
      );
    };

    element.addEventListener('mousemove', handleMouseMove);
    return () => element.removeEventListener('mousemove', handleMouseMove);
  }
}
