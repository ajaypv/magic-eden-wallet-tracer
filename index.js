import axios from "axios";
import express from "express";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set ,  onValue,update, remove,} from "firebase/database"; 
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


async function Mointoriamolo(){
    const db = getDatabase();
        const users12 = ref(db, 'magice' );
        onValue(users12, (snapshot) => {
          snapshot.forEach(async (childSnapshot) => {
            const childKey = childSnapshot.key;
            const childData = childSnapshot.val();
            let t1 = new Date(childData.createdDate)
            let t2 = new Date()
            const diffInMs = Math.abs(t2- t1);
            console.log(t2)
            let d1 = diffInMs/(1000 * 60 * 60 * 24);
            if (d1 >=1){
              remove(ref(db, 'magice/' + childKey))
            }
            else{
              console.log(d1)
            try{
              const url = `https://api-mainnet.magiceden.dev/v2/wallets/${childData.wallet_id}/activities?offset=0&limit=100`;
                  const response = await axios.get(url);
                  let  userdata_json1 = response
                  let  token = userdata_json1.data[0]["tokenMint"]
                  let  TransactionType = userdata_json1.data[0]["type"];
                  let  TransactionCollection = userdata_json1.data[0]["collection"];
                  let  TransactionPrice = userdata_json1.data[0]["price"];
                  let  TransactionNFT = userdata_json1.data[0]["tokenMint"];
                const tokens = `https://api.solscan.io/account?address=${token}`;
                const resp = await axios.get(tokens);
                const  res2 = resp.data.data.metadata.data.uri
                const response33 = await axios.get(res2);
                let name = response33.data.name
                let image = response33.data.image
                console.log(image)
                await new Promise(resolve => setTimeout(resolve, 500));
                if(childData.imageurl != image){              
                  update(ref(db, 'magice/' + childKey ) ,{imageurl :image})
                let phone = childData.whatsapp
                const whatsapp = phone.replace(/\s+/g,"");
                client.messages 
      .create({ 
         body: `Wallet :   ${childData.walletName}
Activity Type:  ${TransactionType}
Collection:   ${TransactionCollection}
Price:    ${TransactionPrice}`,
         from: 'whatsapp:+16184271719',       
         to: `whatsapp:${whatsapp}`,
         mediaUrl:image, 
       }) 
      .then(message => console.log(message.sid)) 
      .done();
            }}catch(e){
                console.log(e)
            }
          }   
          });
        })
         
  }
  

const interval_calling = setInterval(Mointoriamolo,60000)

const port = 5000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
