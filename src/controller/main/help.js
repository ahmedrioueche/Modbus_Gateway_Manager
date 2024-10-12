document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.button.menu');
    const sections = document.querySelectorAll('.help-section');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            sections.forEach(section => {
                if (section.id === sectionId) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        });
    });

    // Initially display the first section and hide the others
    if (sections.length > 0) {
        sections.forEach((section, index) => {
            section.style.display = index === 0 ? 'block' : 'none';
        });
    }
});
