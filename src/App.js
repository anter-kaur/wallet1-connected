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
  // const [contract,setContract]=useState('');

  useEffect(() => {
    const connectMetamask = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const web3 = new Web3(provider);
        try {
          await provider.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);

          const contract= new web3.eth.Contract(contractAbi, contractAddress);
          console.log(account);
        } catch (error) {
          console.error("Error while connecting to contract:", error);
        }
      } else {
        console.error("Install Metamask");
      }
    };

    connectMetamask();
  }, []);

// const handleSubmit=async ()=>{
//   const setval=await contract.methods.set(addValue).send({from:account});
//           const result = await contract.methods.get().call();
//           console.log('in effect hook: ',result)
//           setValue(result.toString());
// }


  const handleSubmit = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      const web3 = new Web3(provider);
      try {
        const contract = new web3.eth.Contract(contractAbi, contractAddress);
        await contract.methods.set(addValue).send({ from: account });

        const result = await contract.methods.get().call();
        setValue(result.toString());
        console.log('in submit: ',result)
      } 
      catch (error) {
        console.error("Error while sending transaction:", error);
      }
    } 
    // else {
    //   console.error("Install Metamask");
    // }
  };

  return (
    <div className="App">
      <h1>Smart Contract Integration</h1>
      <p>Account: {account}</p>
      <input
        type='text'
        onChange={(e) => setAddValue(e.target.value)}
      />
      <button type='submit' onClick={handleSubmit}>Submit</button>
      <p>Value from contract: {value}</p>
    </div>
  );
}

export default App;
