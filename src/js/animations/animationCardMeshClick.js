import { gsap } from 'gsap/all';
import appState from '../state';
import animationBackground from './animationBackground';
import { 
    getMeshScaleByPixels, 
    getMeshWorldYAtClientY, 
    roundedBoxGeometry,
    updateFooterLocation
} from '../utils';

export default function animationCardMeshClick(object) {
    const getState = appState.getState.bind(appState);
    const setState = appState.setState.bind(appState);
    const pageIntro = document.querySelector('.page-intro');
    const { canvas, camera, cardType, renderer } = getState('_canvas', '_camera', '_cardType', '_renderer');
    const { scaleX, scaleY } = getMeshScaleByPixels(object, 1190, 1904, camera); // 오차범위 10픽셀?... 1200x1920
    const newPositionY = getMeshWorldYAtClientY(object, camera, renderer);
    const { x, y, z } = object.position;

    document.body.classList.add('page-open');
    document.body.style.cursor = '';
    document.body.style.overflow = 'hidden';
    setState('enabledMesh', object);
    updateFooterLocation(true);
    animationBackground();
   
    if (cardType === 'stack') {
        const excludeFirstMeshes = getState('_cardMeshes')
            .sort((a, b) => b.position.z - a.position.z)
            .filter((v, i) => i !== 0);

        excludeFirstMeshes.forEach(v => {
            gsap.to(v.rotation, {
                duration: 0.5,
                x: 0,
                y: 0,
                z: 0,
                delay: .1,
                ease: 'power1.out',
            });
        });

        gsap.to(object.position, {
            duration: 0.8,
            x: 0,
            y: newPositionY,
            z: 3,
            ease: 'sine.out',
        });
    }
    
    if (cardType === 'grid') {
        if (object.name === 'card-2' || object.name === 'card-5') {
            gsap.to(object.position, {
                duration: 0.8,
                x: 0,
                y: newPositionY,
                z: 3,
                ease: 'sine.out'
            });
        } else {
            gsap.to(object.position, {
                duration: 1,
                keyframes: {
                    '0%':   { x, y, z, },
                    '50%':  { x: 1, y: 0, z: 1.5 },
                    '100%': { x: 0, y: newPositionY, z: 3 },
                    easeEach: 'sine.out' 
                },
                ease: 'sine.out',
            });
        }
    }

    gsap.to(object.scale, { 
        duration: 1, 
        x: scaleX,
        y: scaleY,
        ease: 'power1.out',
    });

    gsap.to(object.rotation, {
        duration: 0.5,
        y: 0,
        z: 0,
        ease: 'power1.out',
    })

    gsap.to(object.rotation, { 
        duration: 1, 
        y: Math.PI,
        ease: 'power1.out',
        onUpdate() {
            const progress = this.progress();
            if (progress > 0.3 && !this.called) {
                this.called = true;
            
                object.geometry.dispose();
                object.geometry = roundedBoxGeometry(1.5, 2.4, 0.2, 0.1, 9);
                object.geometry.computeVertexNormals();
            } 
        }
    });

    gsap.to(camera.position, { 
        duration: 1, 
        y: 0, 
        z: 4.1,
        ease: 'power1.out', 
        onComplete() {
            window.scrollTo(0, 0);
            document.body.style.overflow = '';

            gsap.to(pageIntro, {
                duration: 0,
                opacity: 1,
                display: 'block'
            });

            gsap.to(canvas, {
                duration: 0,
                opacity: 0,
                display: 'none'
            });
        }
    });
}