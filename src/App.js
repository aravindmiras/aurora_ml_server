import React, { useEffect, useState } from "react";
import { rdb } from "./firebaseConfig";
import {ref, onValue, set} from 'firebase/database';
import axios from "axios";

const App = () => {
  const [dataone, setData] = useState([]);

  const [voltage, setVoltage]=useState('0');
  const [rated_voltage, setRV]=useState('0');

  const [rated_current, setRC]=useState('0');
  const [current, setCurrent]=useState('0');
  const [rpm, setRPM]=useState('0');
  const [temperature, setTemperature]=useState('0');
  const [humidity, setHumidity]=useState('0');
  const [power, setPower] = useState('0');
  const [vibration, setVibration]=useState('0');
  const [mlurl, setMLurl]=useState('');
  const [status, setStatus]=useState('No maintenance required')
  const [trigger, setTrigger]=useState(0);


  const mlCode = async  () => {
  const params = { current,voltage,temperature, humidity, vibration };
   await axios
      .post('https://bb7a-14-194-54-206.ngrok-free.app/prediction', params,{
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      })
      .then((res) => {
        const msg = res.data.data;
        console.log(msg);
        setStatus(msg);
      });
      
      // .catch((error) => alert(`Error: ${error.message} Unprocessable data`));
  };

  // const set = (msg) => {
  //   setStatus(msg);
  // };
  const firebaseGet = () =>{
    const fetchRef = ref(rdb,'motordat/');
    onValue(fetchRef, (snapshot) =>{
      const adata = snapshot?.val();
      const motorData = Object.keys(adata).map(key => ({
         id: key,
         ...adata[key] 
      }));
      setData(motorData);
      if(dataone.length > 0){
        setVoltage(dataone[0]?.actualVoltage);
        setRC(dataone[0]?.ratedCurrent);
        setRV(dataone[0]?.ratedVoltage);
        setCurrent(dataone[0]?.actualCurrent);
        setRPM(dataone[0]?.actualRPM);
        setTemperature(dataone[0]?.temperature);
        setHumidity(dataone[0]?.humidity);
        setVibration(dataone[0]?.vibration);
        setPower(dataone[0]?.actualVoltage*dataone[0]?.actualCurrent);
        setMLurl(dataone[0]?.mlmodel);
        console.log('setValues method called');
        
      }
    }
    );
  }

  const firebasePush = () =>{
    const pushRef = ref(rdb, 'motordat/motor/maintenance/');
    set(pushRef, status);
    console.log('firebase push called');
  }

  useEffect(()=>{
    
    const timeout = setTimeout(() => {
      firebaseGet();
      mlCode();
      firebasePush();
      setTrigger((trigger) => trigger+1)
      
    }, 5000);
    
          
    
  
  
  return () => clearTimeout(timeout);
},[trigger]);

  

  return (
    <div>
      <h1>Aurora ML Admin - {trigger}</h1>
      <p>Voltage: {voltage}/{rated_voltage}</p>
      <p>Current: {current}/{rated_current} </p>
      <p>RPM: {rpm}</p>
      <p>Power: {power}</p>
      <p>Temperature: {temperature}</p>
      <p>Humidity: {humidity}</p>
      <p>Status: {JSON.stringify(status)}</p>
    </div>
  );
}

export default App;
