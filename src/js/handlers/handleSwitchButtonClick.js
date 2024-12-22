import appState from '../state';
import { gsap } from 'gsap/all';
import { animationCardMeshSort } from '../animations'; 

export default function handleSwitchButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const getState = appState.getState.bind(appState);
    const setState = appState.setState.bind(appState);
    const { isSwitchClicked, cardType } = getState('_isSwitchClicked', '_cardType');

    if (isSwitchClicked) return;

    const target = event.currentTarget;
    const hasStackActive = target.classList.contains('stack-active');
    const hasGridActive = target.classList.contains('grid-active');
    const action = () => {
        target.classList.remove('stack-active', 'grid-active');
        document.body.style.cursor = '';

        if (hasStackActive) {
            setState('_cardType', 'grid');
            target.classList.add('grid-active');
            animationCardMeshSort('grid');
        }

        if (hasGridActive) {
            setState('_cardType', 'stack');
            target.classList.add('stack-active');
            animationCardMeshSort('stack');
        }
    }

    setState('_isSwitchClicked', true);
    setState('_prevScrollY', 0);

    if (window.scrollY > 0 && cardType === 'grid') {
        gsap.to(window, { 
            duration: 0.4,
            scrollTo: { y: 0 },
            ease: 'power2.out', 
            onComplete() {
                action();
            }
        });
    } else {
        action();
    }
}