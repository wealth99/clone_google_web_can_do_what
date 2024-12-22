import { gsap } from 'gsap/all';
import appState from '../state';
import { animationCardMeshReset } from '../animations';

export default function handleCloseButtonClick() {
    const getState = appState.getState.bind(appState);
    const enabledMesh = getState('enabledMesh');

    if (window.scrollY > 0) {
        gsap.to(window, { 
            duration: 0.5,
            scrollTo: { y: 0 },
            ease: 'sine.out', 
            onComplete() {
                animationCardMeshReset(enabledMesh);
            }
        });
    } else {
        animationCardMeshReset(enabledMesh);
    }
}