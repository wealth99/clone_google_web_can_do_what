export default function getCardMeshPosition(info) {
    const wW = window.innerWidth;

    // 769 ~ 1380
    if (wW >= 769) {
        return info.positions[0];
    }

    // 640 ~ 768
    if (640 <= wW && 768 >= wW) {
        return info.positions[1];
    }

    // 0 ~ 640
    if (wW <= 640) {
        return info.positions[2];
    }
}