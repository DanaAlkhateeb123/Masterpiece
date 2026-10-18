(function () {
    var ribbon = document.querySelector('.collection-ribbon');
    var button = document.querySelector('.ribbon-pause');
    if (!ribbon || !button) return;
    button.addEventListener('click', function () {
        var paused = ribbon.classList.toggle('is-paused');
        button.setAttribute('aria-pressed', String(paused));
        button.setAttribute('aria-label', paused ? 'Resume collection ribbon' : 'Pause collection ribbon');
        button.querySelector('svg').innerHTML = paused ? '<path d="m5 3 7 5-7 5Z"/>' : '<path d="M5 3v10M11 3v10"/>';
    });
})();