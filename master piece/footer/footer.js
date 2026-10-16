(async () => {
    const mount = document.getElementById("site-footer");
    if (!mount) return;

    try {
        const response = await fetch(new URL("../footer/footer.html", window.location.href));
        if (!response.ok) throw new Error(`Footer request failed: ${response.status}`);
        mount.innerHTML = await response.text();
        const year = mount.querySelector("[data-current-year]");
        if (year) year.textContent = String(new Date().getFullYear());
    } catch (error) {
        console.error("Could not load the site footer.", error);
    }
})();
