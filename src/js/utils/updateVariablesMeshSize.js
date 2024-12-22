import appState from '../state';
import getPixelSizeFromMesh from './getPixelSizeFromMesh';

/**
 *  메쉬가 화면에서 차지하는 픽셀 크기를 계산하는 함수
 * 
 * @param {THREE.Mesh} mesh - 계산할 대상인 three.js 메쉬 객체
 */
export default function updateVariablesMeshSize(mesh) {
    const getState = appState.getState.bind(appState);
    const setState = appState.setState.bind(appState);
    const { camera, renderer } = getState('_camera', '_renderer');
    const { pixelSizeWidth, pixelSizeHeight } = getPixelSizeFromMesh(mesh, camera, renderer);

    setState('_currentMeshWidth', pixelSizeWidth);
    setState('_currentMeshHeight', pixelSizeHeight);

    document.documentElement.style.setProperty('--cardPixelWidth', `${pixelSizeWidth}px`);
    document.documentElement.style.setProperty('--cardPixelHeight', `${pixelSizeHeight}px`);
}