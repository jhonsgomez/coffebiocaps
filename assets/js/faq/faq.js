function toggleAnswer(element) {
    const parentDiv = element.closest('.col-span-1');

    const answer = parentDiv.querySelector('.answer');
    const icon = parentDiv.querySelector('.toggle-btn');

    if (answer.classList.contains('active')) {
        answer.classList.remove('active');
        icon.textContent = '+';
    } else {
        answer.classList.add('active');
        icon.textContent = '-';
    }
}