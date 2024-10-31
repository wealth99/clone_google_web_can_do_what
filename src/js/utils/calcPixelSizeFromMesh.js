import * as THREE from 'three';

/**
 * 메쉬의 크기를 바탕으로 화면에서의 픽셀 크기를 계산하는 함수
 *
 * @param {THREE.Mesh} mesh - 계산할 대상인 three.js 메쉬 객체
 * @param {THREE.PerspectiveCamera} camera - 현재 장면의 카메라 객체
 * @returns {Object} - 메쉬의 화면 내 가로 및 세로 픽셀 크기
 *  - {number} pixelSizeWidth: 메쉬의 가로 크기에 해당하는 픽셀 수
 *  - {number} pixelSizeHeight: 메쉬의 세로 크기에 해당하는 픽셀 수
 */
export default function calcPixelSizeFromMesh(mesh, camera) {
    // 메쉬의 바운딩 박스를 계산하여 크기를 얻음
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    const size = boundingBox.getSize(new THREE.Vector3());

    // 메쉬의 중심 좌표를 계산
    const center = boundingBox.getCenter(new THREE.Vector3());

    // 메쉬의 월드 좌표에서 카메라 좌표계로 변환
    const centerInCameraSpace = center.clone().applyMatrix4(camera.matrixWorldInverse);

    // 카메라 좌표계에서 메쉬의 중심까지의 z축 거리(카메라의 시야 방향 기준)
    const distance = Math.abs(centerInCameraSpace.z) || camera.position.z;

    // 카메라의 수직 시야각(FOV)을 라디안 단위로 변환
    const vFov = (camera.fov * Math.PI) / 180;

    // 카메라로부터 메쉬까지의 거리에 따른 화면의 실제 높이 계산
    const height = 2 * Math.tan(vFov / 2) * distance;

    // 화면의 종횡비(Aspect Ratio)를 계산
    const aspect = window.innerWidth / window.innerHeight;

    // 화면의 실제 너비 계산
    const width = height * aspect;

    // 메쉬의 실제 가로 크기에 해당하는 픽셀 수 계산
    const pixelSizeWidth = window.innerWidth * ((1 / width) * size.x);

    // 메쉬의 실제 세로 크기에 해당하는 픽셀 수 계산
    const pixelSizeHeight = window.innerHeight * ((1 / height) * size.y);

    // 메쉬의 가로 및 세로 픽셀 크기를 반환
    return { 
        pixelSizeWidth,
        pixelSizeHeight
    };
}