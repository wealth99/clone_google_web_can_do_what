import * as THREE from 'three';

/**
 * 메쉬의 가로 및 세로 스케일 비율을 계산하여 반환하는 함수
 *
 * @param {THREE.Mesh} mesh - 계산할 대상인 three.js 메쉬 객체
 * @param {number} pixelWidth - 목표로 하는 메쉬의 가로 크기(픽셀 단위)
 * @param {number} pixelHeight - 목표로 하는 메쉬의 세로 크기(픽셀 단위)
 * @param {THREE.Camera} camera - 현재 장면의 카메라 객체
 * @returns {Object} - 메쉬의 가로 및 세로 스케일 비율 { scaleX, scaleY }
 */
export default function getMeshScaleByPixels(mesh, pixelWidth, pixelHeight, camera) {
    let tempMesh = mesh.clone();
    tempMesh.position.set(0, 0, 3);  // 필요한 Z 위치 설정
    tempMesh.rotation.set(0, 0, 0);
    tempMesh.scale.set(1, 1, 1);
    tempMesh.updateMatrixWorld(true); // 월드 매트릭스 업데이트

    // 메쉬의 바운딩 박스를 계산하여 크기를 얻음
    const boundingBox = new THREE.Box3().setFromObject(tempMesh);
    const size = boundingBox.getSize(new THREE.Vector3());

    // 메쉬의 중심 좌표를 계산
    const center = boundingBox.getCenter(new THREE.Vector3());

    // 메쉬의 월드 좌표에서 카메라 좌표계로 변환
    const centerInCameraSpace = center.clone().applyMatrix4(camera.matrixWorldInverse);

    // 카메라 좌표계에서 메쉬의 중심까지의 z축 거리(카메라의 시야 방향 기준)
    // const distance = Math.abs(centerInCameraSpace.z);
    const distance = Math.abs(1.1);

    // 카메라의 수직 시야각(FOV)을 라디안 단위로 변환
    const halfVFov = (camera.fov * Math.PI) / 360;

    // 화면의 종횡비(Aspect Ratio)를 계산
    const aspect = window.innerWidth / window.innerHeight;

    // 카메라의 수평 시야각(FOV) 계산
    const halfHFov = Math.atan(Math.tan(halfVFov) * aspect);

    // 화면 너비 및 높이에 대한 카메라의 시야 범위 계산
    const meshWidthInNDC = 2 * Math.tan(halfHFov) * distance;
    const meshHeightInNDC = 2 * Math.tan(halfVFov) * distance;

    // 현재 메쉬의 픽셀 크기 계산
    const currentPixelWidth = (size.x / meshWidthInNDC) * window.innerWidth;
    const currentPixelHeight = (size.y / meshHeightInNDC) * window.innerHeight;

    // 원하는 픽셀 크기 대비 스케일 비율 계산
    const scaleX = pixelWidth / currentPixelWidth;
    const scaleY = pixelHeight / currentPixelHeight;

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
    
    // 스케일 비율 반환
    return { scaleX, scaleY };
}