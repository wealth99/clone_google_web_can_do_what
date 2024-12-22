import * as THREE from 'three';
import appState from '../state';
import getMeshScaleByPixels from './getMeshScaleByPixels';

/**
 * 메쉬를 특정 클라이언트 Y 좌표에 맞추기 위한 월드 Y 좌표를 계산하는 함수
 * 
 * @param {THREE.Mesh} mesh - 계산할 대상인 three.js 메쉬 객체
 * @param {THREE.Camera} camera - 현재 장면의 카메라 객체
 * @param {THREE.WebGLRenderer} renderer - 장면을 렌더링하는 WebGLRenderer 객체
 * @returns {number} - 계산된 최종 월드 좌표의 Y 값
 */
export default function getMeshWorldYAtClientY(mesh, camera, renderer) {
    const getState = appState.getState.bind(appState);
    const devicePixelRatio = getState('_devicePixelRatio');

    // 카메라의 복사본을 생성하여 z 위치를 4.1로 설정합니다.
    let tempCamera = camera.clone();
    tempCamera.position.z = 4.1; // 고정된 Z 위치
    tempCamera.updateProjectionMatrix(); // 프로젝션 매트릭스 업데이트
    tempCamera.updateMatrixWorld(true); // 월드 매트릭스 업데이트

    // 메쉬의 복사본을 생성합니다.
    let tempMesh = mesh.clone();
    tempMesh.position.set(0, 0, 3); 
    tempMesh.rotation.set(0, 0, 0);
    tempMesh.scale.set(1, 1, 1);
    const { scaleX, scaleY } = getMeshScaleByPixels(tempMesh, 1190, 1904, tempCamera);
    tempMesh.scale.set(scaleX, scaleY, 0.1);
    tempMesh.updateMatrixWorld(true); // 월드 매트릭스 업데이트

    // 복사본 메쉬의 월드 좌표를 가져옵니다.
    const meshWorldPos = new THREE.Vector3();
    tempMesh.getWorldPosition(meshWorldPos);

    // 카메라의 월드 좌표를 가져옵니다.
    const cameraWorldPos = new THREE.Vector3();
    tempCamera.getWorldPosition(cameraWorldPos);

    // 복사본 메쉬의 경계 상자에서 높이를 계산합니다.
    const boundingBox = new THREE.Box3().setFromObject(tempMesh);
    const meshHeight = (boundingBox.max.y - boundingBox.min.y);

    // 월드 좌표를 NDC 좌표로 변환합니다.
    meshWorldPos.project(tempCamera);

    // 클라이언트 Y 좌표를 NDC로 변환합니다.
    const targetClientY = 128; // 목표 클라이언트 Y 좌표 (오차범위+-5)
    const targetNDCY = -((targetClientY / (renderer.domElement.height / devicePixelRatio)) * 2 - 1);

    // NDC 좌표를 갱신합니다.
    meshWorldPos.y = targetNDCY;

    // 갱신된 NDC 좌표를 월드 좌표로 변환합니다.
    meshWorldPos.unproject(tempCamera);

    // 카메라와 메쉬의 Y 좌표 차이를 구합니다.
    const yDifference = cameraWorldPos.y - meshWorldPos.y;

    // 카메라의 월드 Y 좌표에 yDifference를 더해 최종 Y 좌표를 설정합니다.
    const finalWorldY = cameraWorldPos.y - yDifference;

    // 복사된 메쉬 정리
    if (tempMesh) {
        if (tempMesh.geometry) {
            tempMesh.geometry.dispose();
        }

        if (tempMesh.material) {
            if (Array.isArray(tempMesh.material)) {
                tempMesh.material.forEach(material => material.dispose());
            } else {
                tempMesh.material.dispose();
            }
        }

        tempMesh = null; // 참조 해제
    }

    // 복사된 카메라 정리
    tempCamera = null; // 참조 해제

    // 최종 월드 좌표 Y 값을 반환합니다.
    return finalWorldY - meshHeight / 2;
}