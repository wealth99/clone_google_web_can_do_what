import appState from '../state';
import { animationMouseAction } from '../animations';
 
export default function handleMouseAction(event) {
    const getState = appState.getState.bind(appState);
    const { isNextClicked, isShowClicked, cardType } = getState('_isNextClicked', '_isShowClicked', '_cardType');

    if (cardType === 'grid' || isShowClicked || isNextClicked) return;
    
    const eventType = event.type;
    const element = event.currentTarget;

    animationMouseAction(element, eventType);
}