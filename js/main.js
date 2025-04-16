const container = document.getElementById('container');
const verticalSlider = document.getElementById('vertical-slider');
const horizontalSlider = document.getElementById('horizontal-slider');
const left = document.getElementById('left');
const right = document.getElementById('right');
const bottom = document.getElementById('bottom');
const infoIcon = document.getElementById('info-icon');
const infoDialog = document.getElementById('info-dialog');

let isDraggingVertical = false;
let isDraggingHorizontal = false;

// Show/hide info dialog
infoIcon.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent the click from propagating to the document
    if (infoDialog.style.display === 'none' || !infoDialog.style.display) {
        infoDialog.style.display = 'block';
    } else {
        infoDialog.style.display = 'none';
    }
});

// Hide info dialog when clicking outside of it
document.addEventListener('click', (e) => {
    if (infoDialog.style.display === 'block' && !infoDialog.contains(e.target) && e.target !== infoIcon) {
        infoDialog.style.display = 'none';
    }
});

verticalSlider.addEventListener('mousedown', () => isDraggingVertical = true);
horizontalSlider.addEventListener('mousedown', () => isDraggingHorizontal = true);

document.addEventListener('mouseup', () => {
    isDraggingVertical = false;
    isDraggingHorizontal = false;
});

document.addEventListener('mousemove', (e) => {
    if (isDraggingVertical) {
        const containerRect = container.getBoundingClientRect();
        const newLeftWidth = e.clientX - containerRect.left;
        const newRightWidth = containerRect.width - newLeftWidth - 10; // 10px for slider
        if (newLeftWidth > 0 && newRightWidth > 0) {
            left.style.width = `${newLeftWidth}px`;
            right.style.width = `${newRightWidth}px`;
        }
    }

    if (isDraggingHorizontal) {
        const containerRect = container.getBoundingClientRect();
        const newTopHeight = e.clientY - containerRect.top;
        const newBottomHeight = containerRect.height - newTopHeight - 10; // 10px for slider
        if (newTopHeight > 0 && newBottomHeight > 0) {
            document.getElementById('top').style.height = `${newTopHeight}px`;
            bottom.style.height = `${newBottomHeight}px`;
        }
    }
});

// Set default sizes for the quadrants
function setDefaultSizes() {
    const containerRect = container.getBoundingClientRect();
    const defaultTopHeight = containerRect.height / 2 - 5; // Half height minus slider
    const defaultLeftWidth = containerRect.width / 2 - 5; // Half width minus slider

    document.getElementById('top').style.height = `${defaultTopHeight}px`;
    left.style.width = `${defaultLeftWidth}px`;
    right.style.width = `${defaultLeftWidth}px`;
    bottom.style.height = `${defaultTopHeight}px`;
}

// Initialize default sizes on load
window.addEventListener('load', setDefaultSizes);
window.addEventListener('resize', setDefaultSizes); // Adjust sizes on window resize