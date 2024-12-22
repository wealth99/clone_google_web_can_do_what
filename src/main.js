import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap, ScrollToPlugin } from 'gsap/all';
import * as utils from './js/utils';
import * as handlers from './js/handlers';
import { animationSplash } from './js/animations';
import appState from './js/state';

gsap.registerPlugin(ScrollToPlugin);

export default function main() {
    const getState = appState.getState.bind(appState);
    const setState = appState.setState.bind(appState);
    const {
        handleDocumentMousedown,
        handleDocumentMouseup,
        handleDocumentMousemove,
        handleDocumentClick,
        handleCloseButtonClick,
        handleShowButtonClick,
        handleNextButtonClick,
        handleWindowScroll,
        handleWindowResize,
        handleMouseAction,
        handleVotingButtonClick,
        handleSwitchButtonClick
    } = handlers;

    const {
        roundedBoxGeometry,
        getCardMeshPosition,
        updateVariablesMeshSize,
        updateScrollSpacer,
        createCanvasTexture
    } = utils;
    
    const devicePixelRatio = window.devicePixelRatio > 1 ? 1.5 : 1;
    const canvas = document.querySelector('#three-canvas');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.shadowMap.enabled = true;
    
    // 씬
    const scene = new THREE.Scene();

    // 카메라
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight, 
        0.1,
        1000
    );
    camera.position.z = 3.3;
    scene.add(camera);

    // 레이캐스터
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // 빛
    const ambientLight = new THREE.AmbientLight('white', 1);
    scene.add(ambientLight);

    // 빛2
    const dirLight = new THREE.DirectionalLight('white', 2);
    dirLight.position.set(-1, 3, 3);
    dirLight.target.position.set(0, 0, 0);
    dirLight.target.updateMatrixWorld();
    scene.add(dirLight);

    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 75;
    dirLight.shadow.radius = 8;
    dirLight.shadow.top = 5;
    dirLight.shadow.right = 5;
    dirLight.shadow.bottom = -5;
    dirLight.shadow.left = -5;
    dirLight.shadow.bias = -0.001; // 그림자 경계의 어긋남 방지
    dirLight.shadow.normalBias = 0.001; // 표면의 미세한 디테일 고려

    const boxGeometry = roundedBoxGeometry(1.5, 2.4, 0.2, 0.15, 15);
    const boxMaterial = new THREE.MeshBasicMaterial( { color: '#ebebeb', side: THREE.DoubleSide } );
    boxGeometry.center();
    boxGeometry.computeVertexNormals();

    setState('_camera', camera);
    setState('_mouse', mouse);
    setState('_raycaster', raycaster);
    setState('_renderer', renderer);
    setState('_dirLight', dirLight);
    setState('_scene', scene);
    setState('_boxGeometry', boxGeometry);
    setState('_devicePixelRatio', devicePixelRatio);

    // 카드 메쉬 만들기
    const createCardMesh = async () => {
        const cardMeshesInitInfo = Object.values(getState('_cardMeshesInitInfo'));

        for (const info of cardMeshesInitInfo) {
            const { name, imagePath, videoPath } = info;
            const { texture, videoContext, videoElement } = await createCanvasTexture(imagePath, videoPath);
            const position = getCardMeshPosition(info);
            const cardMeshes = getState('_cardMeshes');
            const cardMesh = new THREE.Mesh(
                boxGeometry, [
                    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }), 
                    boxMaterial,
                    boxMaterial,
                ]
            );

            cardMesh.position.copy(position);
            cardMesh.name = name;
            cardMesh.rotation.reorder('YXZ');
            cardMesh.scale.z = 0.1;
            cardMesh.castShadow = true;
            cardMesh.receiveShadow = true;
            setState('_cardMeshes', [...cardMeshes, cardMesh]);
            scene.add(cardMesh);

            if (videoPath) {
                info.texture = texture;
                info.videoContext = videoContext;
                info.videoElement = videoElement;
            }

            if (cardMesh.name === 'card-0') {
                updateVariablesMeshSize(cardMesh)
                updateScrollSpacer();
            }
        }
    }

    // 바닥 메쉬 만들기
    const createFloorMesh = () => {
        const floorShadowMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10), 
            new THREE.ShadowMaterial({ opacity: 0.15 })
        );
        floorShadowMesh.position.z = -0.05;
        floorShadowMesh.receiveShadow = true;
        scene.add(floorShadowMesh);
    }
    
    // 애니메이션
    const animate = () => {
        const { isShowClicked, cardType, cardMeshes, cardMeshesInitInfo } = getState(
            '_isShowClicked',
            '_cardType',
            '_cardMeshes',
            '_cardMeshesInitInfo'
        );

        requestAnimationFrame(animate);

        if (
            cardType === 'stack' 
            && !isShowClicked 
            && document.querySelector('.cards-gallery').classList.contains('stack-mode')
        ) {
            const sortedCardMeshes = cardMeshes.sort((a, b) => b.position.z - a.position.z);

            sortedCardMeshes.forEach((v, i) => {
                const name = v.name;
                const info = cardMeshesInitInfo[name];

                if (i > 2 && info.texture !== null) {
                    info.texture.needsUpdate = false;
                } else if (info.texture !== null) {
                    info.texture.needsUpdate = true;
                }
            });
        }

        renderer.render(scene, camera);
    }

    window.addEventListener('scroll', handleWindowScroll);
    window.addEventListener('resize', handleWindowResize);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('mousemove', handleDocumentMousemove);
    document.addEventListener('mousedown', handleDocumentMousedown);
    document.addEventListener('mouseup', handleDocumentMouseup);
    document.querySelector('.close-button').addEventListener('click', handleCloseButtonClick);
    document.querySelector('.voting-buttons').addEventListener('click', handleVotingButtonClick);
    document.querySelector('.switch-mode-button').addEventListener('click', handleSwitchButtonClick);
    document.querySelector('.next-button').addEventListener('click', handleNextButtonClick);
    document.querySelector('.next-button').addEventListener('mouseenter', handleMouseAction);
    document.querySelector('.next-button').addEventListener('mouseleave', handleMouseAction);
    document.querySelector('.show-button').addEventListener('click', handleShowButtonClick);
    document.querySelector('.show-button').addEventListener('mouseenter', handleMouseAction);
    document.querySelector('.show-button').addEventListener('mouseleave', handleMouseAction);

    createFloorMesh();
    createCardMesh();
    animationSplash();
    animate();
}

main();