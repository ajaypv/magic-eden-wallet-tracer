import axios from "axios";
import express from "express";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set , get, onValue,update, remove,} from "firebase/database"; 
import { getAuth, signInWithEmailAndPassword} from "firebase/auth";
import dotenv from 'dotenv'
import twilio from 'twilio'
dotenv.config()

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

const firebaseConfig = {
    apiKey: "AIzaSyDgjkAFksGTqCUbA4R9m9UAMFM1Cy8MZMw",
    authDomain: "namekujilabs.firebaseapp.com",
    projectId: "namekujilabs",
    storageBucket: "namekujilabs.appspot.com",
    messagingSenderId: "527914262266",
    appId: "1:527914262266:web:b43975b52373a2b3467343",
    measurementId: "G-55B1F2E0LM"
  };

const fire = initializeApp(firebaseConfig);
const app = express()

const auth = getAuth();
signInWithEmailAndPassword(auth, "namesujiserver@gmail.com", "namekuji")
.then((userCredential) => {
})
.catch((error) => {
});

async function sendMessage(WhatsappNumber,walletName,TransactionType,TransactionPrice,TransactionCollection,image){
    client.messages 
      .create({ 
         body:`
Wallet :   ${walletName}
Activity Type:  ${TransactionType}
Collection:   ${TransactionCollection}
Price:    ${TransactionPrice}`, 
         from: 'whatsapp:+16184271719',       
         to: `whatsapp:${WhatsappNumber}` ,
         mediaUrl :image, 
       }) 
      .then(message => console.log(message.sid)) 
      .done();
    
}


async function magiceEdenResponse(wallet_id,childkey){
    try {
    const url = `https://api-mainnet.magiceden.dev/v2/wallets/${wallet_id}/activities?offset=0&limit=100`;
    const response = await axios.get(url);
    let  userdata_json1 = response
    let  token = userdata_json1.data[0]["tokenMint"]
    let  TransactionType = userdata_json1.data[0]["type"];
    let  TransactionCollection = userdata_json1.data[0]["collection"];
    let  TransactionPrice = userdata_json1.data[0]["price"];
    const tokens = `https://api.solscan.io/account?address=${token}`;
    const resp = await axios.get(tokens);
    const  res2 = resp.data.data.metadata.data.uri
    const response33 = await axios.get(res2);
    let image = response33.data.image
    const db = getDatabase();

    get(ref(db, 'magice/' + childkey )).then(async (snapshot) => {
        if (snapshot.exists()) {
          const imageurl  = snapshot.val().imageurl;
          const whatsapp =snapshot.val().whatsapp.replace(/\s+/g,"");
          const walletName = snapshot.val().walletName
          if(imageurl != image){       
            await update(ref(db, 'magice/' + childkey ) ,{imageurl :image});
            await sendMessage(whatsapp,walletName,TransactionType,TransactionPrice,TransactionCollection,image);
          }else{
          }

        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });
    }catch(error){
        console.log(error)
    }
   
}

async function Mointoriamolo(){
    try{
    const db = getDatabase();
        const users12 = ref(db, 'magice' );
        get(users12, (snapshot) => {
          snapshot.forEach(async (childSnapshot) => {
            const childKey = childSnapshot.key;
            const childData = childSnapshot.val();
            let t1 = new Date(childData.createdDate)
            let t2 = new Date()
            const diffInMs = Math.abs(t2- t1);
            let d1 = diffInMs/(1000 * 60 * 60 * 24);
            if (d1 >=1){
              await remove(ref(db, 'magice/' + childKey))
            }
            else{
               await magiceEdenResponse(childData.wallet_id,childKey);  
            }
          });
        },
        {
        onlyOnce: true
        }
        
        )
    }catch(err){
        console.log(err)
    }
         
  }
  

const interval_calling = setInterval(Mointoriamolo,60000)

const port = 5000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
