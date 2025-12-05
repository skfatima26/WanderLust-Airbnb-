
mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v12', // style URL
center:listing.geometry.coordinates,// starting position [lng, lat]
zoom: 9, // starting zoom
});

const marker = new mapboxgl.Marker({color:"red"})
    .setLngLat(listing.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({offset: 25})
    .setHTML(`<h2>${listing.location}</h2> <p>Exact Location!!</p>`))
    .addTo(map);
    
