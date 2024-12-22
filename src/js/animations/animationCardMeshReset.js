import * as THREE from 'three';
import { gsap } from 'gsap/all';
import appState from '../state';
import { 
    roundedBoxGeometry, 
    updateFooterLocation, 
    getCardMeshPosition
} from '../utils';

export default function animationCardMeshReset(mesh) {
    const getState = appState.getState.bind(appState);
    const setState = appState.setState.bind(appState);
    const pageIntro = document.querySelector('.page-intro');
    const hoverBg2 = document.querySelectorAll('.hover-wraaper .hover-bg-2');
    const { cardType, prevScrollY, cardMeshes, dirLight, canvas, camera, cardMeshesInitInfo } = getState(
        '_cardType',
        '_prevScrollY',
        '_cardMeshes',
        '_dirLight',
        '_canvas',
        '_camera',
        '_cardMeshesInitInfo'
    )
    let position;
    
    gsap.to(pageIntro, { 
        duration: 0, 
        opacity: 0, 
        display: 'none'
    });

    gsap.to(canvas, { 
        duration: 0, 
        opacity: 1, 
        display: 'block' 
    });

    if (cardType === 'grid') {
        position = getCardMeshPosition(cardMeshesInitInfo[mesh.name]);

        gsap.to(mesh.scale, {
            duration: 1, 
            x: 1,
            y: 1, 
            ease: 'power1.out' 
        });
    }
    
    if (cardType === 'stack') {
        const sortedCardMeshes = cardMeshes.sort((a, b) => b.position.z - a.position.z);

        position = new THREE.Vector3(0, 0, 0);

        dirLight.position.set(-1, 3, 3);
        dirLight.updateMatrixWorld();

        gsap.to(mesh.scale, { 
            duration: 1, 
            x: 1.3,
            y: 1.3,
            ease: 'power1.out'
        });

        for (let i = 0; i < sortedCardMeshes.length; i++) {
            const sortedCardMesh = sortedCardMeshes[i];
            const angle = - Math.PI / 25 * i;

            gsap.to(sortedCardMesh.rotation, {
                duration: 0.3,
                z: angle,
                delay: 0.3,
                ease: 'power1.out'
            });

            if (i === 2) break;
        }
    } 

    gsap.to(hoverBg2, {
        duration: .8,
        scaleX: 0,
        scaleY: 1.15,
        ease: 'power1.out'
    });

    gsap.to(mesh.position, { 
        duration: 1,
        x: position.x,
        y: position.y,
        z: position.z,
        ease: 'power1.out',
        onUpdate() {
            const progress = this.progress();
            if (progress > 0.3 && !this.called) {
                this.called = true;
            
                mesh.geometry.dispose();
                mesh.geometry = roundedBoxGeometry(1.5, 2.4, 0.2, 0.15, 15)
                mesh.geometry.computeVertexNormals();
            } 
        }
    });

    gsap.to(mesh.rotation, {
        duration: 1, 
        y: 0, 
        ease: 'power1.out' 
    });

    gsap.to(camera.position, { 
        duration: 1, 
        z: 3.3, 
        delay: 0.3, 
        ease: 'power2.out', 
        onComplete() {
            document.body.classList.remove('page-open');
            setState('_isClicked', false);
            setState('_isShowClicked', false);
            updateFooterLocation(false);
        }
    });

    gsap.to(window, {
        duration: 1,
        scrollTo: { y: prevScrollY },
        delay: 0.3, 
        ease: 'power2.out'
    })
}