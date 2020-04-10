var $ = s=>document.querySelector(s);
var mymap = L.map('mapid').setView([51.505, -0.09], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(mymap);

mymap.on('click',ev=>{
    $("#long").value = ev.latlng.lng;
    $("#latt").value = ev.latlng.lat;
})
mymap.locate({setView:true});

console.log('hi');

$("form.contact-form").addEventListener('submit',submit,false);


function submit(e){
    e.preventDefault();
    let form = $("form.contact-form");
    let f = new FormData(form);
    let object = {};
    f.forEach((value, key) => {object[key] = value});
    let json = JSON.stringify(object);
    console.log(json);
}