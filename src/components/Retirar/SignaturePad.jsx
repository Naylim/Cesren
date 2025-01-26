// src/components/SignaturePad.js
import  { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import styled from "styled-components";

const SignatureWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  canvas {
    border: 2px solid #000;
    border-radius: 5px;
    width: 400px;
    height: 200px;
  }

  button {
    margin: 10px;
    padding: 8px 12px;
    background-color: #1565c0;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    width: 401px;
  }
`;

const SignaturePad = () => {
  const sigCanvas = useRef();

  const clear = () => sigCanvas.current.clear();

  return (
    <SignatureWrapper>
      <SignatureCanvas
        ref={sigCanvas}
        penColor="black"
        canvasProps={{ width: 400, height: 200 ,  style: { backgroundColor: "#fff", borderRadius: "5px" } }}
      />
      <div>
        <button onClick={clear}>Limpiar</button>
      </div>
    </SignatureWrapper>
  );
};

export default SignaturePad;
