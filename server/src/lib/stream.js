import {StreamChat} from "stream-chat"
import "dotenv/config"

const apiKey = process.env.STREAM_API_KEY;
const secret = process.env.STREAM_API_SECRET;

if(!apiKey || !secret){
    console.error("Missing API key or secret"); 
}

const streamClient = StreamChat.getInstance(apiKey,secret);

export const createStreamUser = async (userData)=>{
    try {
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.log("Error userting Stream user:",error);
    }
}

