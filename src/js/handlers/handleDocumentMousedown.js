import appState from '../state';

export default function handleDocumentMousedown(event) {
    const setState = appState.setState.bind(appState);
    
    setState('_clickStartX', event.clientX);
    setState('_clickStartY', event.clickStartY);
    setState('_clickStartTime', Date.now());
}