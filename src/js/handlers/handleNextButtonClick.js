import appState from '../state';
import { animationNextCardMesh } from '../animations';

export default function handleNextButtonClick() {
    const getState = appState.getState.bind(appState);
    const setState = appState.setState.bind(appState);
    const { bodyBgColors, isNextClicked } = getState('_bodyBgColors', '_isNextClicked');
    const cardsGallery = document.querySelector('.cards-gallery');

    if (isNextClicked) return; 

    setState('_isNextClicked', true);
    cardsGallery.setAttribute('inert', '');
    cardsGallery.style.pointerEvents = 'none';

    if (getState('_clickCount') === 5) {
        setState('_clickCount', -1);
    }

    setState('_clickCount', getState('_clickCount') + 1);
    document.body.backgroundColor = bodyBgColors[getState('_clickCount')][1];
    
    animationNextCardMesh();
}