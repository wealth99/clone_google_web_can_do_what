export default function updateMeshSizeBreakPoints() {
    // const isPageOpen = document.body.classList.contains('page-open');
    const wW = window.innerWidth;
    const maxWidth = (() => {
        let result;

        // 769 ~
        if (wW >= 769) {
            result = 1380;
        }

        // 640 ~ 768
        if (640 <= wW && 768 >= wW) {
            result = 940;
        }

        // 0 ~ 639
        if (wW <= 639) {
            result = 840;
        }

        return result;
    })();

    // if(isPageOpen) return;

    // if (window.innerWidth < maxWidth) {
    //     const scaleFactor = window.innerWidth / maxWidth;
    //     const yAxis = 1 - 1 * scaleFactor;
        
    //     console.log('yAxis: ', yAxis);
    //     console.log('scaleFactor:' ,scaleFactor);

    //     cardMeshes.forEach(v => {
    //         const initPosition = getCardMeshPosition(cardMeshesInitInfo[v.name]);

    //         v.scale.set(scaleFactor, scaleFactor);
    //         v.position.set(initPosition.x * scaleFactor, yAxis + initPosition.y * scaleFactor);
    //     });
    // } else {
    //     cardMeshes.forEach(v => {
    //         const initPosition = getCardMeshPosition(cardMeshesInitInfo[v.name]);

    //         v.scale.set(1, 1);
    //         v.position.set(initPosition.x, initPosition.y);
    //     });
    // }
}