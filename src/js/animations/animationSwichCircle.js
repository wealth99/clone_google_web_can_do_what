import { gsap } from 'gsap/all';

export default function animationSwichCircle(isActive) {
    const cardsGallery = document.querySelector('.cards-gallery');
    const switchCircles = document.querySelectorAll('.switch-circle');

    if (isActive) {
        cardsGallery.classList.remove('stack-mode', 'grid-mode');
        cardsGallery.classList.add('grid-mode');
        
        gsap.fromTo(switchCircles,
            { scale: 0.12 },
            {
                duration: 0.8,
                scale: 14,
                ease: 'cubic-bezier(0.475, 0.175, 0.515, 0.805)', 
                stagger: { each: 0.08, from: 'start' },
            }
        );
    } else {
        gsap.fromTo(switchCircles,
            { scale: 14 },
            {
                duration: 0.5,
                scale: 0.12,
                ease: 'cubic-bezier(0.185, 0.390, 0.745, 0.535)', 
                stagger: { each: 0.08, from: 'end' },
            });
    }
}