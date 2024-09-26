document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username');
    if (username) {
        fetch(`/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('clicks').innerText = data.clicks;
                document.getElementById('gems').innerText = data.gems;
            }
        });
    }

    document.getElementById('clickButton').addEventListener('click', function() {
        fetch('/click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('clicks').innerText = data.clicks;
                document.getElementById('gems').innerText = data.gems;
            }
        });
    });

    document.getElementById('shopButton').addEventListener('click', function() {
        window.location.href = 'shop.html';
    });
});
