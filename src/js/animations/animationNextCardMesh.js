import { gsap } from 'gsap/all';
import appState from '../state';

export default function animationNextCardMesh() {
    const getState = appState.getState.bind(appState);
    const setState = appState.setState.bind(appState);
    const hoverBg = document.querySelectorAll('.hover-wraaper .hover-bg');
    const cardsGallery = document.querySelector('.cards-gallery');
    const { bodyBgColors, isShowClicked, cardType, cardMeshes, cardMeshesZindex, clickCount, cardMeshesInitInfo } = getState(
        '_bodyBgColors', 
        '_isShowClicked', 
        '_cardType', 
        '_cardMeshes',
        '_cardMeshesZindex',
        '_clickCount',
        '_cardMeshesInitInfo',
    );
    const sortedCardMeshes = cardMeshes.sort((a, b) => b.position.z - a.position.z);
    const firstCardMesh = sortedCardMeshes[0];
    const excludeFirstMeshes = sortedCardMeshes.filter((v, i) => v !== firstCardMesh);

    gsap.to(firstCardMesh.position, {
        duration: 0.8,
        x: -7,
        z: 3,
        ease: 'sine.out'
    });

    gsap.to(firstCardMesh.rotation, {
        duration: 0.8,
        y: -Math.PI * 0.8,
        ease: 'power1.out',
        onComplete() {
            setState('_isNextClicked', false);
            cardsGallery.removeAttribute('inert');
            cardsGallery.style.pointerEvents = '';

            gsap.to(firstCardMesh.position, {
                duration: 0,
                x: 0,
                z: cardMeshesZindex.slice(-1)[0] + -0.03 
            });
            
            gsap.to(firstCardMesh.rotation, {
                duration: 0,
                y: 0,
                z: 0 
            });
        }
    });

    excludeFirstMeshes.forEach((v, i) => {
        const cardMesh = v;
        const angle = - Math.PI / 25 * i;

        if (i < 3) {
            gsap.to(cardMesh.rotation, {
                duration: 0.3, 
                z: angle,
                ease: 'power2.out',
                delay: 0.5
            });
        }

        gsap.to(cardMesh.scale, {
            duration: 0.4,
            x: '+=.05',
            y: '+=.05',
            ease: 'power1.out'
        });

        gsap.to(cardMesh.scale, {
            duration: 0.8,
            x: 1.3,
            y: 1.3,
            ease: 'elastic.out(7, 0.6)',
            delay: 0.4
        });
        
        gsap.to(cardMesh.position, {
            duration: 0.5,
            z: cardMeshesZindex[i],
            ease: 'power2.out',
            delay: 0.5
        });
    });
    
    gsap.to(hoverBg, {
        duration: 0.5,
        scaleX: 1.5,
        scaleY: 1.5,
        ease: 'power1.out',
        onComplete() {
            document.body.className = '';
            document.body.className = bodyBgColors[clickCount][0];

            gsap.to(hoverBg, {
                duration: 0,
                scaleX: 0,
                scaleY: 1.15,
            });
        }
    });

    if (cardType === 'stack' && !isShowClicked) {
        sortedCardMeshes.forEach((v, i) => {
            const name = v.name;
            const info = cardMeshesInitInfo[name];

            if (i > 2 && info.texture !== null) {
                info.texture.needsUpdate = false;
                cancelAnimationFrame(info.animationFrame);
            } else if (info.texture !== null) {
                info.texture.needsUpdate = true;
                info.renderVideoToCanvas();
            }
        });
    }
}