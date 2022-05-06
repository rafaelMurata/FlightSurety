import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;
    let airlines = null;
    let flightName = null;
    let depature = null;
  
    let code_meaning ={
         0: "STATUS_CODE_UNKNOWN",
        10: "STATUS_CODE_ON_TIME",
        20: "STATUS_CODE_LATE_AIRLINE",
        30: "STATUS_CODE_LATE_WEATHER",
        40: "STATUS_CODE_LATE_TECHNICAL",
        50: "STATUS_CODE_LATE_OTHER"
    }
    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
      }
      

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log("isOperational "+result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ],"display-wrapper","");
        });

        $("#table-airline tr").remove(); 
        $("#table-passangers tr").remove(); 
        listAllFlight();
        listAllPassengers();
        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;              
            let depatureDate = DOM.elid('depature-date').value;          
    
            // Write transaction
            contract.fetchFlightStatus(flight,depatureDate, (error, result) => {
                airlines = result.airline;
                depature = result.timestamp;
                flightName = result.flight;
                var theDate = new Date(result.timestamp * 1000);

                DOM.elid("table-report").style.display = "none";
                DOM.elid("withdrawn").style.display = "none";

                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + theDate.toISOString().slice(0, 10) +' '+ contract.passengersRegistered[0].name, date_:depatureDate} ], "display-flight","");
            });
            loadTableAirline(contract.airlinesRegistered);
            loadTablePassengers(contract.passengersRegistered);

            console.log("Contract passengersRegistered"+JSON.stringify( contract.passengersRegistered));
            console.log("Contract airlinesRegistered"+JSON.stringify( contract.airlinesRegistered));

        });

        // GEt oracles response
        DOM.elid('oracle-response').addEventListener('click', () => {
             
                fetchOracleIndex();

                sleep(500).then(() => {
                    let airline = airlines;
                    let flight = flightName;
                    let timestamps = depature;

                    let eventIndex_ = DOM.elid('oracleIndex').innerHTML;
                    
                    contract.submitOracleResponse(parseInt(eventIndex_), airline, flight, timestamps, (error, result) => {
                        console.log("The value event is ",eventIndex_);
                        var theDate = new Date(result.timestamp * 1000);

                        DOM.elid("oracle-response").style.display="none";
                        DOM.elid("table-report").style.display = "block";
    
                        DOM.elid('status-code').innerHTML = code_meaning[result.statusCode];
                        DOM.elid('flight-name').innerHTML = result.flight;
                        DOM.elid('timestamp').innerHTML =theDate;
    
                        if(result.statusCode == 20 || result.statusCode == 40){
    
                            DOM.elid('amount').innerHTML = DOM.elid('delay').innerHTML;
                            DOM.elid("withdraw-funds").style.display = "block";
                        }else{
                            DOM.elid('amount').innerHTML = 0;
                            
                        }

                                        
                    });
                })

        })


        //  Listen to insurance insurance event
        DOM.elid('insurance').addEventListener('change', () => {
            let insurance = DOM.elid('insurance').value;
            let delay = document.getElementById('delay');
            let premium = document.getElementById('premium');
            premium.innerHTML = insurance + ' ether';
            delay.innerHTML = (insurance * 1.5) + ' ether' ;
        });

        // Listen to buy insurance event
        DOM.elid('buy').addEventListener('click', () => {
            let price = DOM.elid('insurance').value;
            let fname = DOM.elid("flightName").innerHTML;
            let fdate = DOM.elid("flightDate").innerHTML;
            let flight = DOM.elid('flight-number').value;
            // buy flight insurance  
            contract.buy(flight,fdate,price, (error, result)=> {
                console.log("Buy ", result);
                display('Oracles', 'Trigger oracles', [ { label: '', error: error, value: "Flight Name: "+fname+" | Depature Date: "+fdate+" | Assurance Paid: "+price+" ether"+ " | Paid on Delay: "+price*1.5+" ether"} ],"display-flight", "display-detail");
                $('#myModal').modal('hide');
                $('#oracle-response').click();
            });
        });
        // Passenger withdraw funds
        DOM.elid('withdraw-funds').addEventListener('click', () => {
            let price = DOM.elid('insurance').value;
            let fname = DOM.elid("flightName").innerHTML;
            let depatureDate = DOM.elid('depature-date').value;          
            let flight = DOM.elid('flight-number').value;
            contract.pay((error, result) => {
                let pay = JSON.stringify(result);
              
                DOM.elid('withdraw-funds').style.display = "none"; 
                DOM.elid('table-report').style.display = "none"; 

                alert("Withdrawal successful " + DOM.elid("delay").innerHTML +" to " +pay);
            });
            contract.creditPassenger(flight,depatureDate,(error, result) => {
                console.log("creditPassenger "+JSON.stringify(result));
        
            });

        })

    });

})();


function display(title, description, results, id, cls) {
    let displayDiv = DOM.elid(id.toString());
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        if(cls.toString() == "display-detail"){
            DOM.elid("oracle-response").style.display="block";
        }else{
            row.appendChild(DOM.div({className: 'col-sm-3 field-value'}, result.error ? String(result.error) : String(result.value)));
        }if(id.toString() == "display-flight" && cls.toString() == ""){
            let b = DOM.button({className: 'col-sm-1.5 field btn btn-primary buy-insurance'}, "Insurance Policy");
            b.setAttribute("data-toggle","modal");
            b.setAttribute("data-target","#myModal");
            row.appendChild(b);

            // Add value to modal
            let fname = DOM.elid("flightName");
            let fdate = DOM.elid("flightDate");
            let fPassenger = DOM.elid("flightPassenger");
            fname.innerHTML = result.value.split(' ')[0];
            fdate.innerHTML = result.value.split(' ')[1];
            fPassenger.innerHTML = result.value.split(' ')[2];
        }
            
        section.appendChild(row);
    })

    displayDiv.removeChild(displayDiv.firstChild);
    displayDiv.append(section);

}

function listAllFlight(){
    // List of flight numbers
    let flights = [
        {"id": 0, "name": "AZUL-AZUAD001"},
        {"id": 1, "name": "LATAM-LATAM001"},
        {"id": 2, "name": "GOL-GOL001"},
        {"id": 3, "name": "TAP-TAP001"},
        {"id": 4, "name": "Passaredo-PASS001"}
    ]
     // begin flight selection
     let dropdown = document.getElementById('flight-number');
     dropdown.length = 0;
    for (let i = 0; i < flights.length; i++) {
        let option = document.createElement('option');
        option.text = flights[i].name ;
        option.value = flights[i].name;
        dropdown.add(option);
    }    
}

function listAllPassengers(){
    // List of passengers numbers
    let passengers = [
        {"id": 0, "name": "Jose"},
        {"id": 1, "name": "Maria"},
        {"id": 2, "name": "Rafael"},
        {"id": 3, "name": "Chewie"},
        {"id": 4, "name": "User"}
    ]
     // begin flight selection
     let dropdown = document.getElementById('passenger-number');
     dropdown.length = 0;
    for (let i = 0; i < passengers.length; i++) {
        let option = document.createElement('option');
        option.text = passengers[i].name ;
        option.value = passengers[i].name;
        dropdown.add(option);
    }    
}
function loadTableAirline(airlinesRegistered){
    
    // CREATE DYNAMIC TABLE.
    var table = document.getElementById("table-airline"), row, cellA, cellB;
    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

    // Getting the all column names
    var cols = Headers(airlinesRegistered, table); 
  
    // Traversing the JSON data
    for (var i = 0; i < airlinesRegistered.length; i++) {
        var row = $('<tr/>');  
        for (var colIndex = 0; colIndex < cols.length; colIndex++)
        {
            var val = airlinesRegistered[i][cols[colIndex]];
             
            // If there is any key, which is matching
            // with the column name
            if (val == null) val = ""; 
                row.append($('<td/>').html(val));
        }
         
        // Adding each row to the table
        $(table).append(row);
    }

}
function loadTablePassengers(passengersRegistered){
    
    // CREATE DYNAMIC TABLE.
    var table = document.getElementById("table-passangers"), row, cellA, cellB;
    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

    // Getting the all column names
    var cols = HeadersPassengers(passengersRegistered, table); 
  
    // Traversing the JSON data
    for (var i = 0; i < passengersRegistered.length; i++) {
        var row = $('<tr/>');  
        for (var colIndex = 0; colIndex < cols.length; colIndex++)
        {
            var val = passengersRegistered[i][cols[colIndex]];
             
            // If there is any key, which is matching
            // with the column name
            if (val == null) val = ""; 
                row.append($('<td/>').html(val));
        }
         
        // Adding each row to the table
        $(table).append(row);
    }

}
function HeadersPassengers(list, selector) {
    var columns = [];
    var header = $('<tr/>');
     
    for (var i = 0; i < list.length; i++) {
        var row = list[i];
         
        for (var k in row) {
            if ($.inArray(k, columns) == -1) {
                columns.push(k);
                 
                // Creating the header
                header.append($('<th/>').html(k));
            }
        }
    }
     
    // Appending the header to the table
    $(selector).append(header);
        return columns;
}
function Headers(list, selector) {
    var columns = [];
    var header = $('<tr/>');
     
    for (var i = 0; i < list.length; i++) {
        var row = list[i];
         
        for (var k in row) {
            if ($.inArray(k, columns) == -1) {
                columns.push(k);
                 
                // Creating the header
                header.append($('<th/>').html(k));
            }
        }
    }
     
    // Appending the header to the table
    $(selector).append(header);
        return columns;
}     
 function fetchOracleIndex(response){
    // Fetch oracle index
    const responseURL = 'http://localhost:3000/oracleIndex';

    fetch(responseURL)  
    .then(  
        function(res) {  
            res.json().then(function(dataf) {  
                let p = document.getElementById('oracleIndex');  
                dataf = dataf.result;
                p.innerHTML = parseInt(dataf);
            }); 
        }  
    )  
    .catch(function(err) {  
        console.error('Fetch Error -', err);  
    });
}