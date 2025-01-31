
   var OpenTripMapKey = "5ae2e3f221c38a28845f05b6e8cfaa33e6a2f1fbe1d1350f053db399";
   var mapBoxAT="pk.eyJ1Ijoic2ltb25ldGFibG8iLCJhIjoiY2wzMXFvYW0xMDI0ZjNjb2ZmOGx5eWMzMSJ9.D_d2l01EuXlPcVxIdhaRww"

    mapboxgl.accessToken = mapBoxAT;
    var map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: [12.5, 41.9],
        zoom: 8
    });

    map.addControl(new mapboxgl.NavigationControl());
    var btn=document.getElementsByTagName("button");
    for(i=0; i<btn.length; i++){
        btn[i].addEventListener("click", showLayer)
    }

    function showLayer(e){
        var name=this.id;
        if(this.value=="on"){
            map.setLayoutProperty("OTM-pois-"+name, "visibility", "none");
            this.value='off'
        }
        else if(this.value=="off"){
            map.setLayoutProperty("OTM-pois-"+name, "visibility", "visible");
            this.value='on'
        }
        else{
            this.value='on'
            map.addLayer({
                id: "OTM-pois-"+name,
                type: "circle",
                source: {
                    type: "vector",
                    tiles: ["https://api.opentripmap.com/0.1/en/tiles/pois/{z}/{x}/{y}.pbf?kinds="+name+"&rate=2&apikey=" + OpenTripMapKey]
                },
                layout: {
                    "visibility" : "visible"
                },
                paint: {
                    "circle-radius": 5,
                    "circle-stroke-width": 0.6
                },
                "source-layer": "pois",
            });
            if(name=="foods"){
                map.setPaintProperty("OTM-pois-"+name, 'circle-color', "rgb(255, 51, 0)")
            }
            if(name=="religion"){
                map.setPaintProperty("OTM-pois-"+name, 'circle-color', "rgb(255, 204, 0)")
            }
            if(name=="natural"){
                map.setPaintProperty("OTM-pois-"+name, 'circle-color', "rgb(102, 153, 0)")
            }
            if(name=="museums"){
                map.setPaintProperty("OTM-pois-"+name, 'circle-color', "rgb(51, 153, 255)")
            }
            if(name=="architecture"){
                map.setPaintProperty("OTM-pois-"+name, 'circle-color', "rgb(255, 51, 204)")
            }

            map.on("click", "OTM-pois-"+name, function(e) {
                //let coordinates = e.features[0].geometry.coordinates.slice();
                let id = e.features[0].properties.id;
                let poiname = e.features[0].properties.name;
                var datatoserver={
                    name:poiname,
                    id:id
                }
                var dataString=JSON.stringify(datatoserver);
                $.ajax({
                    type: "POST",
                    url: "http://localhost:3000/poinfo",
                    dataType: "json",
                    data: {
                        info: dataString
                    },
                    success: function(data) {
                        showInfo(data)
                    },
                    error: function() {
                        alert('error')
                    }
                });
            });
        
            let popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
            });
        
            map.on("mouseenter", "OTM-pois-"+name, function (e) {
                map.getCanvas().style.cursor = "pointer";
                let coordinates = e.features[0].geometry.coordinates.slice();
                let id = e.features[0].properties.id;
                let poiname = e.features[0].properties.name;
                popup
                    .setLngLat(coordinates)
                    .setHTML("<strong>" + poiname + "</strong>")
                    .addTo(map);
            });
        
            map.on("mouseleave", "OTM-pois-"+name, function () {
                map.getCanvas().style.cursor = "";
                popup.remove();
            });   
        }
    };
    
    function showInfo(data) {
        let poi = document.createElement("div");
        poi.innerHTML = "<h2>" + data.name + "<h2>";
        poi.innerHTML += "<p><i>" + getCategoryName(data.kinds) + "</i></p>";
        if (data.preview) {
            poi.innerHTML += "<img src='"+data.preview.source+"'>";
        }
        poi.innerHTML += data.wikipedia_extracts
            ? data.wikipedia_extracts.html
            : data.info
                ? data.info.descr
                : "No description";

        poi.innerHTML += "<p><a target='_blank' href='"+ data.otm + "'>Show more at OpenTripMap</a></p>";
        
        var info=document.getElementById('info');
        info.innerHTML="";
        info.appendChild(poi);

    }



