// src/components/CallComponent.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import "../App.css";
import myImage from '../assets/isep_logo.png';
import { RetellWebClient } from "retell-client-js-sdk";

interface RegisterCallResponse {  
  access_token: string;
} 

const retellWebClient = new RetellWebClient();

const CallComponent: React.FC = () => {
  const { agentId, promptId } = useParams<{ agentId: string; promptId: string }>();
  const [isCalling, setIsCalling] = useState(false);
  const [callToken, setCallToken] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId || !promptId) {
      console.error("Agent ID or Prompt ID is missing!");
      return;
    }

    retellWebClient.on("call_started", () => {
      console.log("call started");
      setIsCalling(true);
    });

    retellWebClient.on("call_ended", () => {
      console.log("call ended");
      setIsCalling(false);
    });

    retellWebClient.on("agent_start_talking", () => {
      console.log("agent_start_talking");
    });

    retellWebClient.on("agent_stop_talking", () => {
      console.log("agent_stop_talking");
    });
  }, [agentId, promptId]);

  // Función asincrónica para registrar una llamada
  async function registerCall(agentId: string, promptId: string): Promise<RegisterCallResponse> {
    try {

       const response = await fetch("https://iallamadas.universidadisep.com/create-web-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId, // Pass the agentId as agent_id
          prompt_id: promptId, // Pass the agentId as agent_id

        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data: RegisterCallResponse = await response.json();
      console.log(data);
      return data;
      
    } catch (err) {
      console.log(err);
      throw new Error('Error registering call');
    }
  }

  // Callback para alternar el estado de la conversación
  const toggleConversation = useCallback(async () => {
    if (!agentId || !promptId) { // Verifica que agentId no sea undefined
      console.error("Agent ID or Prompt ID is missing!");
      return;
    }

    if (isCalling) {
      retellWebClient.stopCall();
      setIsCalling(false);
      console.log("Conversation ended.");
    } else {
      const registerCallResponse = await registerCall(agentId, promptId);
      if (registerCallResponse.access_token) {
        retellWebClient
          .startCall({
            accessToken: registerCallResponse.access_token,
          })
          .catch(console.error);
        setIsCalling(true); // Update button to "Stop" when conversation starts
      }
    }
  }, [isCalling, agentId]); // Dependencias del useCallback

  return (
<div className="App">
      <header className="App-header">
        <div>
          <img src={myImage} alt="logos.png" />
        </div>
        <div className ="text">
            <h1>comunícate con un agente de servicios</h1>          
        </div>
        <button className ="but-styles"onClick={toggleConversation}>
          {isCalling ? "Stop" : "Start"}
        </button>
      </header>
    </div>
  );
};

export default CallComponent;
