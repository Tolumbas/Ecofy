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
    // 
    
    let page3source = await fetch("results.html").then(html=>html.text());
    var parser = new DOMParser();
    var page3 = parser.parseFromString(page3source, 'text/html');
    
    document.body.innerHTML = page3.body.innerHTML;
    
    let data = await fetch(`https://ecofy-api.azurewebsites.net/api/predict?lat=${jsonForm.lat}&lon=${jsonForm.long}&kwhPrice=${jsonForm.price_per_kwh}&avg_monthlyBill=${jsonForm.monthly_bill}&availArea=${jsonForm.roof_area}`)
        .then(file=>file.json())
        // .catch(e=>alert(`Server Error:${e}`));
    // await new Promise(res=>setTimeout(res,1000));
    
    console.log(data);

    document.body.removeChild($('#preloader'));

    let system = {
        "low":"lowSystem",
        "medium":"midSystem",
        "high":"highSystem"
    }[jsonForm.invest_range];
    // debugger;
    let barDataSolar = [];
    let barDataWind = [];
    let barDataSolarSaves =[];
    let barDataWindSaves = [];

    for (var a=1;a<=12;a++){
        let solarpower = Math.round(data.energyTypes.solar.monthIrradiance[a]*data.energyTypes.solar[system].CalculatedSystemPower);
        barDataSolar.push(solarpower);
        barDataSolarSaves.push(solarpower *  jsonForm.price_per_kwh);
        barDataWind.push(Math.round(data.energyTypes.wind["lowSystem"].MonthlyGeneration[a]));
        barDataWindSaves.push(data.energyTypes.wind["lowSystem"].MonthlySaving[a]);
    }
    // let barData = data.solar.monthIrradiance.map(p=>p * data[system].CalculatedSystemPower)
    
    
    ///SOLAR
    var ctxSolar = document.getElementById('barplotcanvassolar').getContext('2d');
    var myChartSolar = new Chart(ctxSolar, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'kW/h Generated Solar',
                data: barDataSolar,
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
                let target = myChartSolar.getElementAtEvent(e);
                if (target.length){
                    let month = target[0]['_index']+1;
                    changeMonth(month,"Solar");
                }
            }
        }
    });
    /// WIND
    var ctxWind = document.getElementById('barplotcanvaswind').getContext('2d');
    var myChartWind = new Chart(ctxWind, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'kW/h Generated Wind',
                data: barDataWind,
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
                let target = myChartWind.getElementAtEvent(e);
                if (target.length){
                    let month = target[0]['_index']+1;
                    changeMonth(month,"Wind");
                }
            }
        }
    });

    /** Saves */


    ///Solar saves
    let ctxSolarSaves = $("#barplotcanvassolarsaves").getContext('2d');
    var myChartSolarSaves = new Chart(ctxSolarSaves, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: '$ Saved',
                data: barDataSolarSaves,
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
            }
        }
    });
    ///Wind saves
    let ctxWindSaves = $("#barplotcanvaswindsaves").getContext('2d');
    var myChartWindSaves = new Chart(ctxWindSaves, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: '$ Saved',
                data: barDataWindSaves,
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
            }
        }
    });







    $("#choiceEnergy").innerHTML = data.reccomendedSystem;
    if (data.reccomendedSystem == "solar"){
        $("#barplot1").style.backgroundColor = "#DFD";
    }
    else if (data.reccomendedSystem == "solar"){
        $("#barplot2").style.backgroundColor = "#DFD";
    }
    else if (data.reccomendedSystem == "hybrid solar/wind"){
        $("#barplot1").style.backgroundColor = "#DFD";
        $("#barplot2").style.backgroundColor = "#DFD";
    }


    changeMonth(1,"Solar");
    changeMonth(1,"Wind");

    function changeMonth(index,type){
        if (type == "Solar"){
            let power = Math.round(data.energyTypes.solar.monthIrradiance[index]*data.energyTypes.solar[system].CalculatedSystemPower);
            $(`#monthPowerSolar`).innerHTML = power;
            $(`#monthSavesSolar`).innerHTML = power * jsonForm.price_per_kwh;
            $(`#monthAngleSolar`).innerHTML = data.energyTypes.solar.angleData[index].angleDegrees;
        }
        else{
            let power = data.energyTypes.wind["lowSystem"].MonthlyGeneration[index];
            let saves = data.energyTypes.wind["lowSystem"].MonthlySaving[index];
            $(`#monthPowerWind`).innerHTML = power;
            $(`#monthSavesWind`).innerHTML = saves;
            $(`#monthAngleWind`).innerHTML = data.energyTypes.wind.windSpeed[index];
        }
    }    
}