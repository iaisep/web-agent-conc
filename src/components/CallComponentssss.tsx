// src/components/CallComponent.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import "../App.css";
import myImage from '../assets/isep_logo.png';
import { RetellWebClient } from "retell-client-js-sdk";
import ringTone from '../assets/ringtone.mp3';  // Asegúrate de tener este archivo en la carpeta de activos

interface RegisterCallResponse {  
  access_token: string;
} 

const retellWebClient = new RetellWebClient();

const CallComponent: React.FC = () => {
  const { agentId, promptId } = useParams<{ agentId: string; promptId: string }>();
  const [isCalling, setIsCalling] = useState(false);
  const [callToken, setCallToken] = useState<string | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);  // Referencia al elemento de audio

  useEffect(() => {
    if (!agentId || !promptId) {
      console.error("Agent ID or Prompt ID is missing!");
      return;
    }

    // Configuración del timbre telefónico
    if (!ringtoneRef.current) {
      ringtoneRef.current = new Audio(ringTone);
      ringtoneRef.current.loop = true;  // Repetir el sonido hasta que se detenga
    }

    // Configurar eventos para el cliente de RetellWebClient
    retellWebClient.on("call_started", () => {
      console.log("call started");
      setIsCalling(true);
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();  // Detener el timbre cuando la llamada comienza
        ringtoneRef.current.currentTime = 0;  // Reiniciar el tiempo del audio
      }
    });

    retellWebClient.on("call_ended", () => {
      console.log("call ended");
      setIsCalling(false);
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();  // Asegurarse de que el timbre esté detenido
        ringtoneRef.current.currentTime = 0;  // Reiniciar el tiempo del audio
      }
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
      const response = await fetch("https://llm.developuisep.store/create-web-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
          prompt_id: promptId,
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

  // Callback para alternar el estado de la conversación con retardo
  const toggleConversation = useCallback(() => {
    if (!agentId || !promptId) {
      console.error("Agent ID or Prompt ID is missing!");
      return;
    }

    const delay = Math.random() * (5000 - 3000) + 3000;  // Calcular retardo entre 3 y 5 segundos

    setTimeout(async () => {
      if (isCalling) {
        retellWebClient.stopCall();
        setIsCalling(false);
        console.log("Conversation ended.");
      } else {
        // Verificar y reproducir el timbre
        if (ringtoneRef.current) {
          try {
            await ringtoneRef.current.play();  // Intentar reproducir el timbre
            console.log("Ringtone is playing...");
          } catch (error) {
            console.error("Error playing ringtone:", error);
          }
        }

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
    }, delay);  // Aplicar retardo antes de iniciar la conversación
  }, [isCalling, agentId, promptId]); // Dependencias del useCallback

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <img src={myImage} alt="logos.png" />
        </div>
        <div className ="text">
            <h1>comunícate con un agente de servicios</h1>          
        </div>
        <button className="but-styles" onClick={toggleConversation}>
          {isCalling ? "Stop" : "Start"}
        </button>
      </header>
    </div>
  );
};

export default CallComponent;
