import { gsap } from 'gsap/all';
import appState from '../state';

export default function animationMouseAction(element, eventType) {
    const getState = appState.getState.bind(appState);
    const hasNextButton = element.classList.contains('next-button');
    const hasShowButton = element.classList.contains('show-button');
    const nextCardBackground = document.querySelector('.next-card .hover-bg');
    const showMeBackground = document.querySelector('.show-me .hover-bg-2');
    const { dirLight, cardMeshes } = getState('_dirLight', '_cardMeshes');
    const firstMesh = cardMeshes.sort((a, b) => b.position.z - a.position.z)[0];
    let targetHover;

    if (eventType === 'mouseenter') {
        if (hasNextButton) {
            targetHover = nextCardBackground;

            dirLight.position.set(-1, 3, 3);

            gsap.to(firstMesh.position, {
                duration: 0.6,
                x: -1.2,
                z: 0.4,
                ease: 'power1.out'
            });

            gsap.to(firstMesh.rotation, {
                duration: 0.6,
                y: -Math.PI / 5,
                z: Math.PI / 20,
                ease: 'power1.out'
            });
        } 

        if (hasShowButton) {
            targetHover = showMeBackground;

            dirLight.position.set(1, 3, 3);

            gsap.to(firstMesh.position, {
                duration: 0.6,
                x: 1.2,
                z: 0.4,
                ease: 'power1.out'
            });

            gsap.to(firstMesh.rotation, {
                duration: 0.6,
                y: Math.PI / 5,
                z: -Math.PI / 20,
                ease: 'power1.out'
            });
        }

        gsap.to(targetHover, {
            duration: 0.6,
            scaleX: 0.6,
            scaleY: 1.15,
            ease: 'power1.out'
        });
    }

    if (eventType === 'mouseleave') {
        if (hasNextButton) {
            targetHover = nextCardBackground;
        }
        
        if (hasShowButton) {
            targetHover = showMeBackground;

            setTimeout(() => {
                dirLight.position.set(-1, 3, 3);
            }, 550);
        }

        gsap.to(firstMesh.position, {
            duration: 0.6,
            x: 0,
            z: 0,
            ease: 'power1.out'
        });

        gsap.to(firstMesh.rotation, {
            duration: 0.6,
            y: 0,
            z: 0,
            ease: 'power1.out'
        });

        gsap.to(targetHover, {
            duration: 0.6,
            scaleX: 0,
            scaleY: 1.15,
            ease: 'power1.out'
        });
    }
}