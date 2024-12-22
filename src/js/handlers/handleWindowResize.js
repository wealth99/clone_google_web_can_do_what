import appState from '../state';
import { updateScrollSpacer, updateVariablesMeshSize, updateMeshSizeBreakPoints } from '../utils';

export default function handleWindowResize() {
    const getState = appState.getState.bind(appState);
    const { cardMeshes, camera, renderer } = getState('_cardMeshes', '_camera', '_renderer');
    
    // updateMeshSizeBreakPoints();
    updateVariablesMeshSize(cardMeshes[0]);
    updateScrollSpacer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}