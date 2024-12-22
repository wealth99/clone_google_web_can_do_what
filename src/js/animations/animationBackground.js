import { gsap } from 'gsap/all';

export default function animationBackground() {
    const hoverBg2 = document.querySelectorAll('.hover-wraaper .hover-bg-2');
    
    gsap.to(hoverBg2, { 
        duration: 0.8,
        scaleX: 1.5,
        scaleY: 1.5, 
        ease: 'power1.out'
    });
}