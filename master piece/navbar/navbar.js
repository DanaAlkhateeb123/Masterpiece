(async () => {
    const mount = document.getElementById("site-header");
    if (!mount) return;

    try {
        const sidebarStyles = document.createElement("link");
        sidebarStyles.rel = "stylesheet";
        const sidebarCssUrl = new URL("../account-sidebar/account-sidebar.css", window.location.href);
        sidebarCssUrl.searchParams.set("v", "3");
        sidebarStyles.href = sidebarCssUrl.href;
        document.head.appendChild(sidebarStyles);

        const response = await fetch(new URL("../navbar/navbar.html", window.location.href));
        if (!response.ok) throw new Error(`Navbar request failed: ${response.status}`);
        mount.innerHTML = await response.text();

        // Render the signed-in state as soon as the shared navbar is mounted.
        // This keeps the account identity visible even while the drawer loads.
        const renderNavUser = () => {
            let user = null;
            try { user = JSON.parse(localStorage.getItem("nostalgiaUser") || "null"); }
            catch (error) { user = null; }

            const signIn = mount.querySelector(".nav-sign-in");
            const trigger = mount.querySelector("#nav-user-trigger");
            const name = mount.querySelector("#nav-user-name");
            const image = mount.querySelector("#nav-user-avatar-image");
            const initials = mount.querySelector("#nav-user-avatar-initials");
            const displayName = user && (user.name || [user.firstName, user.lastName].filter(Boolean).join(" "));
            const isSignedIn = Boolean(user && (displayName || user.email));

            if (signIn) signIn.hidden = isSignedIn;
            if (trigger) trigger.hidden = !isSignedIn;
            if (!isSignedIn) return;

            const safeName = displayName || user.email.split("@")[0];
            if (name) name.textContent = safeName.trim().split(/\s+/)[0];
            if (initials) {
                initials.textContent = safeName.trim().split(/\s+/).slice(0, 2)
                    .map((part) => part.charAt(0)).join("").toUpperCase() || "N";
                initials.hidden = Boolean(user.photo);
            }
            if (image) {
                if (user.photo) {
                    image.src = user.photo;
                    image.hidden = false;
                    image.onerror = () => {
                        image.hidden = true;
                        if (initials) initials.hidden = false;
                    };
                } else {
                    image.hidden = true;
                    image.removeAttribute("src");
                }
            }
        };
        const applyMotionPreference = () => {
            try {
                const user = JSON.parse(localStorage.getItem("nostalgiaUser") || "null");
                const preferences = JSON.parse(localStorage.getItem("nostalgiaPreferences:" + (user && (user.id || user.email) || "guest")) || "{}");
                document.documentElement.classList.toggle("reduce-motion", Boolean(preferences && preferences.reduceMotion));
            } catch (_) { document.documentElement.classList.remove("reduce-motion"); }
        };
        applyMotionPreference();
        window.addEventListener("storage", applyMotionPreference);
        window.addEventListener("nostalgia-auth-changed", applyMotionPreference);
        renderNavUser();
        window.addEventListener("storage", renderNavUser);
        window.addEventListener("nostalgia-auth-changed", renderNavUser);

        const currentPage = window.location.pathname.split("/").filter(Boolean).pop()?.replace(/\.html$/i, "") || "home";
        mount.querySelectorAll("[data-page]").forEach((link) => {
            if (link.dataset.page === currentPage) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }
        });

        const query = new URLSearchParams(window.location.search).get("search");
        const searchInput = mount.querySelector("#site-search");
        if (query && searchInput) searchInput.value = query;

        const toggle = mount.querySelector(".nav-toggle");
        const links = mount.querySelector(".nav-links");
        toggle?.addEventListener("click", () => {
            const isOpen = links.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
            toggle.textContent = isOpen ? "×" : "☰";
        });

        const sidebarResponse = await fetch(new URL("../account-sidebar/account-sidebar.html", window.location.href), { cache: "no-store" });
        if (!sidebarResponse.ok) throw new Error(`Account sidebar request failed: ${sidebarResponse.status}`);
        const sidebarDocument = new DOMParser().parseFromString(await sidebarResponse.text(), "text/html");
        sidebarDocument.querySelectorAll("script").forEach((script) => {
            if (script.textContent.includes("Code injected by live-server")) script.remove();
        });
        document.body.insertAdjacentHTML("beforeend", sidebarDocument.body.innerHTML);
        const sidebarScript = document.createElement("script");
        sidebarScript.src = new URL("../account-sidebar/account-sidebar.js", window.location.href).href;
        sidebarScript.onload = () => window.initAccountSidebar?.();
        document.body.appendChild(sidebarScript);
    } catch (error) {
        console.error("Could not load the site header.", error);
    }
})();
