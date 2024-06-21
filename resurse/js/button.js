document.addEventListener('DOMContentLoaded', () => {
    const produseButton = document.getElementById('produse');
    const domnitoriButton = document.getElementById('domnitori');

    domnitoriButton.addEventListener('click', () => {
      window.location.href = '/domnitori';
    });
    produseButton.addEventListener('click', () => {
        window.location.href = '/produse';
    });
  });