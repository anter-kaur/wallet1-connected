import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { contractAbi, contractAddress } from './contract';

function App() {
  const [account, setAccount] = useState('');
  const [value, setValue] = useState('');
  const [addValue, setAddValue] = useState(0);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const connectMetamask = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);
        try {
          await provider.request({ method: "eth_requestAccounts" });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          const contractInstance = new web3Instance.eth.Contract(contractAbi, contractAddress);
          setContract(contractInstance);
        } catch (error) {
          console.error("Error while connecting to contract:", error);
        }
      } else {
        console.error("Install Metamask");
      }
    };

    connectMetamask();
  }, []);

  const handleSubmit = async () => {
    if (web3 && contract) {
      try {
        await sendTransaction(addValue);
        const result = await contract.methods.get().call();
        setValue(result.toString());
        console.log('Transaction result:', result);
      } catch (error) {
        console.error("Error while sending transaction:", error);
      }
    } else {
      console.error("Web3 or contract not initialized");
    }
  };

  const sendTransaction = async (valueToAdd) => {
    try {
      // Ensure valueToAdd is a valid number and within the range of uint8
      const parsedValueToAdd = parseInt(valueToAdd);
      if (isNaN(parsedValueToAdd) || parsedValueToAdd < 0 || parsedValueToAdd > 255) {
        throw new Error("Invalid value to add. Must be a number between 0 and 255.");
      }

      const gasEstimate = await contract.methods.set(parsedValueToAdd).estimateGas({ from: account });
      const tx = {
        from: account,
        to: contractAddress,
        gas: gasEstimate,
        data: contract.methods.set(parsedValueToAdd).encodeABI()
      };
      const receipt = await web3.eth.sendTransaction(tx);
      console.log('Transaction successful:', receipt);
    } catch (error) {
      console.error('Error while sending transaction:', error.message);
    }
  };

  return (
    <div className="App">
      <h1>Smart Contract Integration</h1>
      <p>Account: {account}</p>
      <input
        type='number'
        value={addValue}
        onChange={(e) => setAddValue(e.target.value)}
        min="0"
        max="255"
      />
      <button type='submit' onClick={handleSubmit}>Submit</button>
      <p>Value from contract: {value}</p>
    </div>
  );
}

export default App;
