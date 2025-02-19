export function initNavigation() {
    const nav = document.createElement('nav');
    nav.className = 'bottom-nav';

    // Create home link (videographer name)
    const homeLink = document.createElement('a');
    homeLink.href = '/';
    homeLink.className = 'nav-home';
    homeLink.textContent = 'Darío Rivera';

    // Create contact button
    const contactBtn = document.createElement('a');
    const isContactPage = window.location.pathname.includes('/contact.html');

    if (isContactPage) {
        contactBtn.href = 'javascript:void(0)';
        contactBtn.textContent = 'Close';
        contactBtn.addEventListener('click', () => {
            if (document.referrer) {
                window.location.href = document.referrer;
            } else {
                window.location.href = '/';
            }
        });
    } else {
        contactBtn.href = '/src/contact.html';
        contactBtn.textContent = 'Contact';
    }

    contactBtn.className = 'nav-contact';

    // Append elements to nav
    nav.appendChild(homeLink);
    nav.appendChild(contactBtn);

    // Append nav to body
    document.body.appendChild(nav);
}