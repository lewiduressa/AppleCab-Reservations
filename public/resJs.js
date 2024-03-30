const ACCESS_TOKEN = 'Add your mapbox private key here. You can find one from their website for free!';

const script = document.getElementById('search-js');
script.onload = function () {
    mapboxsearch.autofill({
        accessToken: ACCESS_TOKEN
    });
};

document.getElementById("submitBtn").addEventListener("click", (e) => {
    e.preventDefault();
    if (!document.getElementsByTagName("form")[0].checkValidity()) {
        alert("Please fill in all fields.")
    } else {
        alert("Yay! You made it! You successfully completed all address forms! No payment page developed yet :)")
    }
})

const ap = document.getElementById("addLinePick");
const cp = document.getElementById("cityPick");
const sp = document.getElementById("statePick");
const zp = document.getElementById("zipPick");
const ad = document.getElementById("addLineDest");
const cd = document.getElementById("cityDest");
const sd = document.getElementById("stateDest");
const zd = document.getElementById("zipDest");

ap.addEventListener("input", (e) => {
    checkInputs()
})

cp.addEventListener("input", (e) => {
    checkInputs()
})
sp.addEventListener("input", (e) => {
    checkInputs()
})
zp.addEventListener("input", (e) => {
    checkInputs()
})
ad.addEventListener("input", (e) => {
    checkInputs()
})
cd.addEventListener("input", (e) => {
    checkInputs()
})
sd.addEventListener("input", (e) => {
    checkInputs()
})
zd.addEventListener("input", (e) => {
    checkInputs()
})

let canDraw = true;
let canRequestCheck = false;
let TIMER = 3000;
function checkInputs() {
    if (canDraw && !(ap.value == "" || cp.value == "" || sp.value == "" || zp.value == "" ||
        ad.value == "" || cd.value == "" || sd.value == "" || zd.value == "")) {
        canDraw = false;
        canRequestCheck = true;
        document.getElementById('map').style.opacity = 1;
        drawMap();
        setTimeout(() => {
            canDraw = true;
        }, TIMER)
    } else if (canRequestCheck) {
        setTimeout(checkInputs, TIMER);
        canRequestCheck = false;
        document.getElementById('map').style.opacity = 0.5;
    }
}


async function drawMap() {
    const startAdd = encodeURIComponent(`${ap.value} ${cp.value} ${sp.value} ${zp.value}`);
    const destAdd = encodeURIComponent(`${ad.value} ${cd.value} ${sd.value} ${zd.value}`);

    const urlStart = `https://api.mapbox.com/geocoding/v5/mapbox.places/${startAdd}.json?access_token=${ACCESS_TOKEN}`;
    const urlDest = `https://api.mapbox.com/geocoding/v5/mapbox.places/${destAdd}.json?access_token=${ACCESS_TOKEN}`;
    let coorStart;
    let coorDest;

    await fetch(urlStart)
        .then(async res => {
            return await res.json();
        }).then(data => {
            coorStart = data.features[0].center;
        })

    await fetch(urlDest)
        .then(async res => {
            return await res.json();
        }).then(data => {
            coorDest = data.features[0].center;
        })

    const coords = coorDest;
    const end = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Point',
                    coordinates: coords
                }
            }
        ]
    };
    if (map.getLayer('end')) {
        map.getSource('end').setData(end);
    } else {
        map.addLayer({
            id: 'end',
            type: 'circle',
            source: {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: coords
                            }
                        }
                    ]
                }
            },
            paint: {
                'circle-radius': 10,
                'circle-color': '#f30'
            }
        });
    }
    getRoute(coorStart, coords);
}



mapboxgl.accessToken = ACCESS_TOKEN;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-82.989330, 39.964334], // starting position
    zoom: 12
});

// an arbitrary start will always be the same
// only the end or destination will change
const start = [-82.989330, 39.964334];

async function getRoute(start, end) {
    // make a directions request using cycling profile
    // an arbitrary start will always be the same
    // only the end or destination will change
    const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' }
    );
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;
    const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: route
        }
    };
    // if the route already exists on the map, we'll reset it using setData
    if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
    }
    // otherwise, we'll make a new request
    else {
        map.addLayer({
            id: 'point',
            type: 'circle',
            source: {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: start
                            }
                        }
                    ]
                }
            },
            paint: {
                'circle-radius': 10,
                'circle-color': '#3887be'
            }
        });
        map.addLayer({
            id: 'route',
            type: 'line',
            source: {
                type: 'geojson',
                data: geojson
            },
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#3887be',
                'line-width': 5,
                'line-opacity': 0.75
            }
        });
    }


    map.fitBounds([
        [start[0] - .009, start[1] - .009], // southwestern corner of the bounds
        [end[0] + .009, end[1] + .009] // northeastern corner of the bounds
    ]);

}