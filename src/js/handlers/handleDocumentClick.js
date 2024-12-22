import { gsap } from 'gsap/all';
import appState from '../state';
import { animationCardMeshClick } from '../animations';

export default function handleDocumentClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const getState = appState.getState.bind(appState);
    const setState = appState.setState.bind(appState);
    const { mouseMoved, isClicked, isSwitchClicked, cardType, canvas, camera, mouse, raycaster } = getState(
        '_mouseMoved',
        '_isClicked',
        '_isSwitchClicked',
        '_cardType',
        '_canvas',
        '_camera',
        '_mouse',
        '_raycaster'
    );

    if (mouseMoved || isClicked || cardType === 'stack' || isSwitchClicked) return;

    mouse.x = event.clientX / canvas.clientWidth * 2 - 1;
    mouse.y = -(event.clientY / canvas.clientHeight * 2 - 1);

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(getState('_cardMeshes'));
    const isIntersect = intersects.length > 0;

    if (isIntersect) {
        const object = intersects[0].object;

        setState('_isClicked', true);
        setState('_prevScrollY', window.scrollY);

        if (window.scrollY > 0 && cardType === 'grid') {
            gsap.to(window, { 
                duration: 0.4,
                scrollTo: { y: 0 },
                ease: 'power2.out', 
                onComplete() {
                    animationCardMeshClick(object);
                }
            });
        } else {
            animationCardMeshClick(object);
        }
    }
}