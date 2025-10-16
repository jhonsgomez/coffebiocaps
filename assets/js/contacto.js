document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#contact form');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('action', 'enviar_contacto');
        formData.append('nombre', document.querySelector('input[placeholder="Nombre completo"]').value);
        formData.append('ciudad', document.querySelector('input[placeholder="Ciudad"]').value);
        formData.append('email', document.querySelector('input[placeholder="Correo electrónico"]').value);
        formData.append('telefono', document.querySelector('input[placeholder="Teléfono"]').value);
        formData.append('empresa', document.querySelector('input[placeholder="Empresa"]').value);
        formData.append('mensaje', document.querySelector('#message_form').value);

        // Deshabilitar botón
        const button = form.querySelector('button[type="submit"]');
        const textoOriginal = button.textContent;
        button.disabled = true;
        button.textContent = 'Enviando...';

        // Enviar petición
        fetch('../wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('¡Mensaje enviado correctamente!');
                    form.reset();
                } else {
                    alert('Error: ' + (data.data || 'No se pudo enviar el mensaje'));
                }
            })
            .catch(error => {
                alert('Error al enviar el mensaje. Por favor intenta de nuevo.');
                console.error('Error:', error);
            })
            .finally(() => {
                button.disabled = false;
                button.textContent = textoOriginal;
            });
    });
});