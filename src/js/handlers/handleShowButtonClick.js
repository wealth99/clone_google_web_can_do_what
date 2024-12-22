import appState from '../state';
import { animationCardMeshClick } from '../animations';

export default function handleShowButtonClick() {
    const getState = appState.getState.bind(appState);
    const setState = appState.setState.bind(appState);
    const { isNextClicked, cardMeshes } = getState('_isNextClicked', '_cardMeshes'); 
    const firstCardMesh = cardMeshes.sort((a, b) => b.position.z - a.position.z)[0];

    if(isNextClicked) return;
    
    setState('_isShowClicked', true);
    animationCardMeshClick(firstCardMesh);
}