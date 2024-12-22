import appState from '../state';

export default function handleDocumentMousedown(event) {
    const getState = appState.getState.bind(appState);
    const setState = appState.setState.bind(appState);
    const { clickStartX, clickStartY, clickStartTime  } = getState('_clickStartX', '_clickStartY', '_clickStartTime');
    const xDiff = Math.abs(event.clientX - clickStartX);
    const yDiff = Math.abs(event.clientY - clickStartY);
    const timeDiff = Date.now() - clickStartTime;

    if (xDiff > 5 || yDiff > 5 || timeDiff > 500) {
        setState('_mouseMoved', true);
    } else {
        setState('_mouseMoved', false);
    }
}