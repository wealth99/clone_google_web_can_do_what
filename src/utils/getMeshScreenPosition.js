import * as THREE from 'three';

/**
 * 메쉬의 월드 좌표를 클라이언트 좌표로 변환하는 함수
 * 
 * @param {THREE.mesh} cardMesh - 계산할 대상인 three.js 메쉬 객체.
 * @param {THREE.PerspectiveCamera} camera - 크기를 계산할 대상인 three.js 메쉬 객체.
 * @returns {Object} - 메쉬의 클라이언트 가로 및 세로 위치값
*/
export default function getMeshScreenPosition(mesh, camera, renderer) {
    // 메쉬의 월드 좌표를 벡터로 가져옵니다.
    const vector = new THREE.Vector3();

    // 메쉬의 월드 좌표를 가져옵니다.
    mesh.getWorldPosition(vector);

    // 월드 좌표를 NDC 좌표로 변환합니다.
    vector.project(camera);

    // 화면 좌표계를 -1 ~ 1 범위로 변환한 값을 정규화합니다.
    const widthHalf = 0.5 * renderer.domElement.width;
    const heightHalf = 0.5 * renderer.domElement.height;

    // NDC 좌표를 2D 화면 좌표(픽셀 좌표)로 변환합니다.
    const screenX = (vector.x * widthHalf) + widthHalf;
    const screenY = -(vector.y * heightHalf) + heightHalf;

    return {
        x: screenX,
        y: screenY
    };
}