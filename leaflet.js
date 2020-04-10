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

// onload = submit;

async function submit(e){
    e.preventDefault();
    let form = $("form.contact-form");
    let f = new FormData(form);
    let jsonForm = {};
    f.forEach((value, key) => {jsonForm[key] = value});
    if (jsonForm.lat == ""){
        jsonForm = {"long":"23.318670272565218","lat":"42.68131953838309","invest_range":"medium","monthly_bill":"123","price_per_kwh":"32"};
    }
    let jsonForSend = JSON.stringify(jsonForm);
    console.log(jsonForSend);
    /* Send json to back-end */
    let data = await fetch("anton_data.json").then(file=>file.json());
    
    let page3source = await fetch("results.html").then(html=>html.text());
    var parser = new DOMParser();
    var page3 = parser.parseFromString(page3source, 'text/html');
    
    document.body.innerHTML = page3.body.innerHTML;

    // await new Promise(res=>setTimeout(res,1000));
    
    document.body.removeChild($('#preloader'));

    let system = {
        "low":"lowSystem",
        "medium":"midSystem",
        "high":"highSystem"
    }[jsonForm.invest_range];
    // debugger;
    let barData = [];
    for (var a=1;a<=12;a++){
        barData.push(Math.round(data.solar.monthIrradiance[a]*data.solar[system].CalculatedSystemPower));
    }
    // let barData = data.solar.monthIrradiance.map(p=>p * data[system].CalculatedSystemPower)

    var ctx = document.getElementById('barplotcanvas').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'kW/h Generated',
                data: barData,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            onClick:function(e){
                let target = myChart.getElementAtEvent(e);
                if (target.length){
                    let month = target[0]['_index']+1;
                    changeMonth(month);
                }
            }
        }
    });
    changeMonth(1);
    function changeMonth(index){
        let power = Math.round(data.solar.monthIrradiance[index]*data.solar[system].CalculatedSystemPower);
        $("#monthPower").innerHTML = power;
        $("#monthSaves").innerHTML = power * jsonForm.price_per_kwh;
        $("#monthAngle").innerHTML = data.solar.angleData[index].angleDegrees;
    }    
}