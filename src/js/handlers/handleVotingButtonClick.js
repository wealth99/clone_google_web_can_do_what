export default function handleVotingButtonClick(event) {
    const target = event.target;
    const parent = target.closest('button');
    const classList = parent?.classList;
    const container = parent?.closest('.voting');
    
    container?.classList.remove('voted-up', 'voted-down');
    
    if (classList.contains('button-vote-up')) {
        container.classList.add('voted-up');
    }

    if (classList.contains('button-vote-down')) {
        container.classList.add('voted-down');
    }
}