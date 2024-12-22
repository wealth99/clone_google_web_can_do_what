import appState from '../state';
import { animationCardMeshHover } from '../animations';

export default function handleDocumentMousemove(event) {
    const getState = appState.getState.bind(appState);
    const { isClicked, cardType, canvas, camera, mouse, raycaster } = getState(
        '_isClicked',
        '_cardType',
        '_canvas',
        '_camera',
        '_mouse',
        '_raycaster'
    )

    if (isClicked || cardType === 'stack') return;

    mouse.x = event.clientX / canvas.clientWidth * 2 - 1;
    mouse.y = -(event.clientY / canvas.clientHeight * 2 - 1);

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(getState('_cardMeshes'));
    const isIntersect = intersects.length > 0;    

    if (isIntersect) {
        animationCardMeshHover(intersects[0].object);
    } else {
        animationCardMeshHover();
    }
}