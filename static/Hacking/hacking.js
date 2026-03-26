
// Début du code js de la page hacking

const buttons = [
    { id: 'terminal', url: 'index.html' },
    { id: 'simple', url: 'simple.html' },
    { id: 'analyseur', url: 'analyseur.html' },
];

function onClick(event, url) {
    window.location.href = url;
}

function onMouseDown(event) {
    event.currentTarget.classList.add('clicked');
    event.currentTarget.style.transform = 'translate(0px, 0px)';
}

buttons.forEach(button => {
    const element = document.getElementById(button.id);
    element.addEventListener('click', (event) => onClick(event, button.url));
    element.addEventListener('mousedown', onMouseDown);
});

const categories = document.querySelectorAll('.category');
categories.forEach(category => {
    category.addEventListener('click', () => {
        category.classList.toggle('expanded');
    });
});

// Fin du code js de la page hacking
