function clearContent() {
    // Limpiar el contenido de .container-output
    document.querySelector('.container-output').innerHTML = '';
    // Mostrar el contenedor de entrada
    document.querySelector('.container-input').style.display = 'flex';
    // Ocultar el contenedor de salida
    document.querySelector('.container-output').style.display = 'none';
}
document.getElementById('channelForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevenir el envío del formulario y el recargo de la página
    
    const channelHandle = document.getElementById('channelHandle').value.replace('@', ''); // Obtener el handle del canal sin el '@'
    const apiKey = 'AIzaSyDdwG_1IZ4XPwFS9F3pY8ttN-UpL6lSYBM'; // Reemplazar con tu clave de API de YouTube

    try {
        // Hacer la solicitud para buscar el canal usando el handle
        let response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${channelHandle}&key=${apiKey}`);
        let data = await response.json();

        if (data.items.length === 0) { // Verificar si el canal fue encontrado
            document.getElementById('result').innerText = 'El canal no se encontró.';
            return;
        }

        // Obtener el ID del canal
        const channelId = data.items[0].id.channelId;

        // Hacer la solicitud para obtener detalles del canal
        response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${channelId}&key=${apiKey}`);
        let datas = await response.json();

        if (!datas || datas.items.length === 0) { // Verificar si hay detalles del canal
            document.getElementById('result').innerText = 'No se encontraron detalles del canal.';
            return;
        }

        // Mostrar los detalles del canal en la consola
        console.log(datas);

        // Obtener el ID de la lista de reproducción de videos subidos
        const uploadsPlaylistId = datas.items[0].contentDetails.relatedPlaylists.uploads;

        // Hacer la solicitud para obtener el último video subido
        response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=1&key=${apiKey}`);
        data = await response.json();

        if (!data.items || data.items.length === 0) { // Verificar si hay videos subidos
            document.getElementById('result').innerText = 'El canal no tiene videos subidos.';
            return;
        }

        // Obtener la fecha del último video subido
        const lastVideoDate = new Date(data.items[0].snippet.publishedAt);
        const now = new Date(); // Fecha actual
        const timeDifference = Math.floor((now - lastVideoDate) / (1000 * 60 * 60 * 24)); // Calcular la diferencia en días
        document.querySelector('.container-input').style.display = 'none';
        document.querySelector('.container-output').style.display = 'flex';
        document.querySelector('.container-output').innerHTML = `
            <div class="info">
                <h1>${datas.items[0].snippet.title}</h1>
                <h3>${datas.items[0].snippet.customUrl} ${datas.items[0].statistics.subscriberCount || '0'} suscriptores ${datas.items[0].statistics.videoCount || '0'} videos</h3>
                <p>${datas.items[0].snippet.title} no sube un video hace ${timeDifference} días.</p>
            </div>
            <img src="${datas.items[0].snippet.thumbnails.default.url}" alt="">
        `;
    } catch (error) { // Manejo de errores
        console.error('Error:', error);
        document.getElementById('result').innerText = 'Ocurrió un error al obtener los datos.';
    }
});