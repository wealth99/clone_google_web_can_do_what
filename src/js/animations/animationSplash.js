import { gsap } from 'gsap/all';
import animationSwichCircle from './animationSwichCircle';
import animationCardMeshSort from './animationCardMeshSort';

export default function animationSplash() {
    const pageSplash = document.querySelector('.page-splash');
    const splashInner = document.querySelector('.page-splash .inner');

    const tl = gsap.timeline();
        tl.to(splashInner, { 
                duration: 0.5,
                rotation: -45,
                delay: .6,
                ease: 'power3.out' 
            })
        .to(splashInner, { 
                duration: 0.5,
                rotation: 90,
                opacity: 0,
                scale: 0.5, 
                ease: 'power3.out', 
                onComplete() {
                    animationSwichCircle(true);
                    animationCardMeshSort('grid', true);

                    gsap.to(pageSplash, {
                        duration: 0,
                        opacity: 0,
                        display: 'none' 
                    });
                }
            }
        );
}