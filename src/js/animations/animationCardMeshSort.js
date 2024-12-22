import * as THREE from 'three';
import { gsap } from 'gsap/all';
import appState from "../state";
import animationSwichCircle from './animationSwichCircle';
import { 
    getCardMeshPosition,
    updateVariablesMeshSize, 
    updateFooterLocation, 
    updateScrollSpacer 
} from '../utils';

export default function animationCardMeshSort(type, isLoading = false) {
    const getState = appState.getState.bind(appState);
    const setState = appState.setState.bind(appState);
    const cardsGallery = document.querySelector('.cards-gallery');
    const scrollSpacer = document.querySelector('.cards-gallery-scroll-spacer');
    const { dirLight, cardMeshes, cardMeshesInitInfo, boxGeometry, scene } = getState(
        '_dirLight',
        '_cardMeshes',
        '_cardMeshesInitInfo',
        '_boxGeometry',
        '_scene'
    );

    const sortedCardMeshes = cardMeshes.sort((a, b) => a.name.localeCompare(b.name));
    const effect = {
        position(target, x, y, z, duration = 0.5) {
            gsap.fromTo(target, 
                { x: 0, y: 0, z: 0 }, 
                { duration, x, y, z, ease: 'power1.out', overwrite: true }
            )
        },
        position2(taregt, x, y, z, ease, overwrite = false, duration = 0.5) {
            return gsap.to(taregt, { duration, x, y, z, ease, overwrite });
        },
        rotate(target, z, duration = 0.3) {
            gsap.to(target, { duration, z, ease: 'power3.out' });
        },
        scale(target, x, y, delay, ease, overwrite = false, duration = 0.6) {
            return gsap.to(target, { duration, x, y, delay, ease, overwrite });
        }
    }
    
    dirLight.position.set(-1, 3, 3);
    dirLight.updateMatrixWorld();

    const createShadowCardMesh = (mesh, rotationZ) => {
        const cardShadowMeshes = getState('_cardShadowMeshes');
        const position = mesh.position.clone();
        const rotation = mesh.rotation.clone();
        const scale = mesh.scale.clone();
        const shadowMaterial = new THREE.ShadowMaterial({ 
            opacity: 0.15, 
            transparent: true, 
            side: THREE.DoubleSide 
        });
    
        const shadowMesh = new THREE.Mesh(boxGeometry, shadowMaterial);
        shadowMesh.position.copy(position);
        shadowMesh.rotation.set(rotation.x, rotation.y, rotationZ);
        shadowMesh.scale.copy(scale);
        shadowMesh.receiveShadow = true;
        shadowMesh.castShadow = true;
    
        scene.add(shadowMesh);
        setState('_cardShadowMeshes', [...cardShadowMeshes, shadowMesh]);
    }

    const gridEffect = (cardMesh, { x, y, z }, index) => {
        const cardShadowMeshes = getState('_cardShadowMeshes');

        isLoading === true 
            ? effect.position(cardMesh.position, x, y, z) // 첫 로딩시에 가운데서 퍼지게
            : updateFooterLocation(true); 

        if (cardShadowMeshes.length > 0) {
            cardShadowMeshes.forEach(v => {
                gsap.to(v.material, {
                    duration: 0,
                    opacity: 0,
                    display: 'none'
                });
            });
        }

        effect.rotate(cardMesh.rotation, 0);
        
        effect.scale(cardMesh.scale, 1, 1, 0.1, 'back.in(2)', true).eventCallback('onUpdate', function() {
            const progress = this.progress();
            
            if (progress > 0.9 && !this.called) {
                this.called = true;

                if (!isLoading) {
                    animationSwichCircle(true);
                }

                effect.position2(cardMesh.position, x, y, z, 'sine.out', true).eventCallback('onComplete', function() {
                    if (index === 5) {
                        setState('_isSwitchClicked', false);
                        updateVariablesMeshSize(cardMeshes[0]);
                        updateFooterLocation(false);
                        updateScrollSpacer();
                    }
                });
            }
        });

        sortedCardMeshes.forEach(v => {
            const name = v.name;
            const info = cardMeshesInitInfo[name];

            if (info.texture !== null) {
                cancelAnimationFrame(info.animationFrame);
                info.texture.needsUpdate = false;
            }
        });
    }

    const stackEffect = (cardMesh, index) => {
        const { cardMeshesZindex, cardShadowMeshes } = getState('_cardMeshesZindex', '_cardShadowMeshes');
        const zIndex = -index / 40;
        
        if (cardMeshesZindex.length <= 5) {
            setState('_cardMeshesZindex', [...cardMeshesZindex, zIndex]);
        }

        if (cardShadowMeshes.length > 0) {
            cardShadowMeshes.forEach(v => {
                gsap.to(v.material, {
                    duration: 0,
                    opacity: 0.15,
                });
            });
        }

        animationSwichCircle(false);

        effect.position2(cardMesh.position, 0, 0, zIndex, 'power2.inOut').eventCallback('onUpdate', function() {
            const progress = this.progress();

            if (progress > 0.7 && !this.called) {
                this.called = true;
                
                effect.scale(cardMesh.scale, '+=0.3', '+=0.3', 0, 'back.out(3)').eventCallback('onComplete', function() {
                    if (index === 5) {
                        sortedCardMeshes.forEach((v, i) => {
                            const z = -Math.PI / 25 * i;

                            if (i < 3) {
                                effect.rotate(v.rotation, z);
                            }
                            
                            if (i !== 0 && getState('_cardShadowMeshes').length < 2) {
                                createShadowCardMesh(v, z);
                            }

                            scrollSpacer.style.height = '';
                            cardsGallery.classList.remove('stack-mode', 'grid-mode');
                            cardsGallery.classList.add('stack-mode');
                            setState('_isSwitchClicked', false);
                            updateFooterLocation(false);
                            Object.values(cardMeshesInitInfo)[1].renderVideoToCanvas();
                        });
                    }
                });
            }
        })
        .eventCallback('onComplete', function() {
            if (index === 5) {
                setTimeout(() => {
                    updateVariablesMeshSize(cardMeshes[0]);
                }, 500);
            }
        });
    }

    sortedCardMeshes.forEach((v ,i) => {
        const { x, y, z } = getCardMeshPosition(cardMeshesInitInfo[v.name]);

        type === 'grid' 
            ? gridEffect(v, { x, y, z }, i) 
            : stackEffect(v, i);
    });
}


