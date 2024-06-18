document.addEventListener('DOMContentLoaded', () => {
    const produseButton = document.getElementById('produse');
    const domnitoriButton = document.getElementById('domnitori');
    const menuButton = document.getElementById('index');

    domnitoriButton.addEventListener('click', () => {
      window.location.href = '/domnitori';
    });
    menuButton.addEventListener('click', () => {
      window.location.href = '/';
    });
    produseButton.addEventListener('click', () => {
        window.location.href = '/produse';
    });
  });