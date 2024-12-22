import { gsap } from 'gsap/all';
import appState from '../state';

export default function animationCardMeshHover(object = null) {
    const getState = appState.getState.bind(appState);
    const cardType = getState('_cardType');

    document.body.style.cursor = object ? 'pointer' : '';

    if (cardType === 'grid') {
        getState('_cardMeshes').forEach(v => {
            const position = object === v ? 0.1 : 0;

            gsap.to(v.position, { 
                duration: 0.5,
                z: position, 
                ease: 'power1.out'
            });
        });
    }
}